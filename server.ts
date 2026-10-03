import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Security: Limit incoming payload sizes to prevent Denial of Service
  app.use(express.json({ limit: '64kb' }));

  // AI-Powered Complaint Classification Endpoint
  app.post('/api/classify', async (req, res) => {
    try {
      const { description, title } = req.body;

      if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'Description is required' });
      }

      // Security: Truncate input to reasonable size to prevent prompt bloat
      const sanitizedDescription = description.slice(0, 2000).trim();
      const sanitizedTitle = typeof title === 'string' ? title.slice(0, 200).trim() : '';

      if (ai) {
        const prompt = `You are the AI triage coordinator for CampusFix, a university campus problem reporting system.
Your job is to analyze the student's problem report and accurately classify it into:
1. Category: Must be strictly one of: 'Electricity', 'Water', 'Cleanliness', 'Internet', 'Classroom'
2. Priority: Must be strictly one of: 'Low', 'Medium', 'High'
   - 'High': Active fire hazard, sparks, pipe burst/flooding, no water in entire hostel/dorm, Wi-Fi outage during online exams, shattered glass.
   - 'Medium': Broken AC/projector during lecture, dripping tap, slow connection, overflowing bin, loose desk.
   - 'Low': Cosmetic issues, humming light, minor stains, small scratch.
3. Reasoning: Exactly one concise sentence explaining why this category and priority were selected.

Student Report:
${sanitizedTitle ? `Title: ${sanitizedTitle}\n` : ''}Description: ${sanitizedDescription}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  enum: ['Electricity', 'Water', 'Cleanliness', 'Internet', 'Classroom'],
                },
                priority: {
                  type: Type.STRING,
                  enum: ['Low', 'Medium', 'High'],
                },
                reasoning: {
                  type: Type.STRING,
                },
              },
              required: ['category', 'priority', 'reasoning'],
            },
          },
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          return res.json({
            category: parsed.category,
            priority: parsed.priority,
            reasoning: parsed.reasoning,
            source: 'gemini',
          });
        }
      }
    } catch (error) {
      console.error('Error generating AI classification:', error);
    }

    // Direct inline fallback heuristic classification if Gemini call failed or key absent
    const text = `${req.body?.title || ''} ${req.body?.description || ''}`.toLowerCase();
    let category = 'Classroom';
    if (/\b(electric|spark|wire|wiring|outlet|socket|plug|shock|fuse|tripped|power|bulb|tube|light|blackout)\b/.test(text)) {
      category = 'Electricity';
    } else if (/\b(water|pipe|leak|leaking|tap|faucet|drip|sink|drain|flush|toilet|washroom|cooler|puddle|flood)\b/.test(text)) {
      category = 'Water';
    } else if (/\b(clean|trash|garbage|dustbin|bin|litter|spill|dirty|hygiene|smell|odor|waste|wrapper)\b/.test(text)) {
      category = 'Cleanliness';
    } else if (/\b(wifi|wi-fi|internet|network|router|lan|ethernet|dns|disconnect|signal|bandwidth|ping)\b/.test(text)) {
      category = 'Internet';
    }

    let priority = 'Medium';
    if (/\b(spark|smoke|fire|burst|flood|shatter|shock|danger|hazard|emergency|completely dry)\b/i.test(text)) {
      priority = 'High';
    } else if (/\b(cosmetic|minor|small scratch|loose screw|slightly|humming|aesthetic)\b/i.test(text)) {
      priority = 'Low';
    }

    return res.json({
      category,
      priority,
      reasoning: `Contextually assigned ${category} (${priority} Priority) based on reported facility keywords.`,
      source: 'heuristic',
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Production vs Development Serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`CampusFix server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
