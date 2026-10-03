import { ProblemCategory, UrgencyLevel } from '../types';

export interface ClassificationResult {
  category: ProblemCategory;
  priority: 'Low' | 'Medium' | 'High';
  reasoning: string;
  source: 'gemini' | 'heuristic';
}

// Client-side heuristic fallback ensuring 100% reliability under all network conditions
export function heuristicClassify(description: string, title: string = ''): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();

  // Keyword scoring tables
  const scores: Record<ProblemCategory, number> = {
    Electricity: 0,
    Water: 0,
    Cleanliness: 0,
    Internet: 0,
    Classroom: 0,
  };

  // Electricity
  if (/\b(electric|spark|wire|wiring|outlet|socket|plug|shock|fuse|tripped|breaker|power|voltage|bulb|tube|light|blackout|switchboard|generator)\b/.test(text)) {
    scores.Electricity += 4;
  }
  if (/\b(short circuit|burning smell|no power|buzzing|flicker|switch)\b/.test(text)) {
    scores.Electricity += 3;
  }

  // Water
  if (/\b(water|pipe|leak|leaking|tap|faucet|drip|dripping|sink|drain|drainage|flush|toilet|washroom|restroom|cooler|puddle|flood|sewage)\b/.test(text)) {
    scores.Water += 4;
  }
  if (/\b(no water|overflow|dry tap|drinking water|plumber|burst)\b/.test(text)) {
    scores.Water += 3;
  }

  // Cleanliness
  if (/\b(clean|cleanliness|trash|garbage|dustbin|bin|litter|spill|spilled|dirt|dirty|hygiene|unhygienic|smell|odor|waste|wrapper|stain)\b/.test(text)) {
    scores.Cleanliness += 4;
  }
  if (/\b(overflowing bin|food waste|pest|cockroach|sanitiz|sweep|broom)\b/.test(text)) {
    scores.Cleanliness += 3;
  }

  // Internet
  if (/\b(wifi|wi-fi|internet|network|router|lan|ethernet|dns|disconnect|signal|bandwidth|ping|deadzone|slow net|hotspot|speed|eduroam)\b/.test(text)) {
    scores.Internet += 4;
  }
  if (/\b(cannot connect|access point|packet loss|server down|offline)\b/.test(text)) {
    scores.Internet += 3;
  }

  // Classroom
  if (/\b(classroom|projector|hdmi|screen|whiteboard|blackboard|marker|bench|desk|chair|podium|mic|microphone|audio|speaker|hall|lecture)\b/.test(text)) {
    scores.Classroom += 4;
  }
  if (/\b(av|sound system|remote|ac|air conditioner|cooling|thermostat|window|fan)\b/.test(text)) {
    scores.Classroom += 3;
  }

  // Find category with highest score
  let bestCategory: ProblemCategory = 'Classroom';
  let highestScore = -1;

  (Object.keys(scores) as ProblemCategory[]).forEach((cat) => {
    if (scores[cat] > highestScore) {
      highestScore = scores[cat];
      bestCategory = cat;
    }
  });

  if (highestScore === 0) {
    // Default fallback based on common generic keywords
    if (/desk|chair|table|seat|room|lecture|class|teacher|exam/i.test(text)) {
      bestCategory = 'Classroom';
    } else if (/net|connection|online/i.test(text)) {
      bestCategory = 'Internet';
    } else if (/leak|tap/i.test(text)) {
      bestCategory = 'Water';
    } else if (/shock|plug|light/i.test(text)) {
      bestCategory = 'Electricity';
    } else {
      bestCategory = 'Cleanliness';
    }
  }

  // Priority classification
  let priority: 'Low' | 'Medium' | 'High' = 'Medium';
  let reasoning = `Detected ${bestCategory.toLowerCase()} related issue in complaint description.`;

  const highPriorityRegex = /\b(spark|smoke|fire|burst|flood|shatter|shock|danger|hazard|emergency|completely dry|tripped all|blackout|slippery|bleeding|injury)\b/i;
  const lowPriorityRegex = /\b(cosmetic|minor|small scratch|loose screw|slightly|humming|aesthetic|paint|dusty|tilted)\b/i;

  if (highPriorityRegex.test(text)) {
    priority = 'High';
    reasoning = `Flagged as High Priority due to critical safety or severe operational disruption keywords.`;
  } else if (lowPriorityRegex.test(text)) {
    priority = 'Low';
    reasoning = `Assigned Low Priority as the issue appears non-hazardous and minor.`;
  } else {
    priority = 'Medium';
    reasoning = `Assigned standard Medium Priority for campus maintenance triage.`;
  }

  return {
    category: bestCategory,
    priority,
    reasoning,
    source: 'heuristic',
  };
}

// Main classification caller: attempts server API with Gemini first, falls back gracefully
export async function classifyComplaint(
  description: string,
  title: string = ''
): Promise<ClassificationResult> {
  const trimmed = description.trim();
  if (trimmed.length < 8) {
    return heuristicClassify(trimmed, title);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: trimmed, title: title.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.category && data.priority) {
        return {
          category: data.category as ProblemCategory,
          priority: data.priority as 'Low' | 'Medium' | 'High',
          reasoning: data.reasoning || `Classified based on contextual analysis of the complaint.`,
          source: data.source || 'gemini',
        };
      }
    }
  } catch (err) {
    // Server route unreachable or timeout - gracefully use heuristic
    console.debug('AI server route offline or timed out, using local intelligent classifier fallback');
  }

  return heuristicClassify(trimmed, title);
}
