import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  AlertTriangle, 
  Zap, 
  Droplets, 
  Sparkles, 
  Wifi, 
  School, 
  Sparkle, 
  Check, 
  CheckCircle2, 
  RefreshCw, 
  Cpu 
} from 'lucide-react';
import { ProblemCategory, UrgencyLevel, Complaint } from '../types';
import { CAMPUS_LOCATION_PRESETS } from '../data/initialData';
import { classifyComplaint, ClassificationResult } from '../services/aiClassifier';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newComplaint: Omit<Complaint, 'id' | 'reportedAt' | 'upvotes' | 'hasUpvoted' | 'timeline'>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Electricity');
  const [location, setLocation] = useState('');
  const [specificArea, setSpecificArea] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [reporterName, setReporterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Classification state
  const [aiPrediction, setAiPrediction] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [userOverridden, setUserOverridden] = useState(false);
  const classifyTimeoutRef = useRef<any>(null);

  // Automatically classify when description or title changes
  useEffect(() => {
    if (!isOpen) return;

    if (classifyTimeoutRef.current) {
      clearTimeout(classifyTimeoutRef.current);
    }

    const trimmed = description.trim();
    if (trimmed.length >= 10) {
      setIsClassifying(true);
      classifyTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await classifyComplaint(trimmed, title.trim());
          setAiPrediction(result);
          
          // Auto-apply if student hasn't explicitly overridden
          if (!userOverridden) {
            setCategory(result.category);
            setUrgency(result.priority);
          }
        } catch (err) {
          console.error('Classification error:', err);
        } finally {
          setIsClassifying(false);
        }
      }, 500);
    } else {
      setIsClassifying(false);
    }

    return () => {
      if (classifyTimeoutRef.current) {
        clearTimeout(classifyTimeoutRef.current);
      }
    };
  }, [description, title, isOpen, userOverridden]);

  if (!isOpen) return null;

  const categories: Array<{
    id: ProblemCategory;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'Electricity',
      label: 'Electricity',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'Water',
      label: 'Water',
      icon: <Droplets className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'Cleanliness',
      label: 'Cleanliness',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'Internet',
      label: 'Internet',
      icon: <Wifi className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'Classroom',
      label: 'Classroom',
      icon: <School className="w-4 h-4 text-rose-400" />,
    },
  ];

  const urgencyLevels: Array<{ id: UrgencyLevel; label: string; desc: string }> = [
    { id: 'Low', label: 'Low', desc: 'Cosmetic or minor inconvenience' },
    { id: 'Medium', label: 'Medium', desc: 'Standard classroom/lab issue' },
    { id: 'High', label: 'High', desc: 'Impacting study or utilities' },
    { id: 'Emergency', label: 'Emergency', desc: 'Immediate safety or hazard' },
  ];

  const handleManualClassify = async () => {
    if (!description.trim()) {
      setErrors((prev) => ({ ...prev, description: 'Enter a description first for AI to classify' }));
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyComplaint(description.trim(), title.trim());
      setAiPrediction(result);
      setCategory(result.category);
      setUrgency(result.priority);
      setUserOverridden(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Electricity');
    setLocation('');
    setSpecificArea('');
    setDescription('');
    setUrgency('Medium');
    setReporterName('');
    setIsAnonymous(false);
    setErrors({});
    setAiPrediction(null);
    setIsClassifying(false);
    setUserOverridden(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleQuickFill = (presetCategory: ProblemCategory) => {
    setUserOverridden(false);
    let sampleTitle = '';
    let sampleDesc = '';
    let sampleLoc = '';
    let sampleArea = '';
    let sampleUrgency: UrgencyLevel = 'Medium';
    let sampleReporter = '';

    switch (presetCategory) {
      case 'Electricity':
        sampleTitle = 'Short circuit smell near switchboard in Physics Lab';
        sampleLoc = 'Science Complex (Block B), Level 2';
        sampleArea = 'Lab 204, Teacher demonstration bench';
        sampleDesc = 'A strong plastic burning smell and spark is coming from the main electrical switch panel whenever heavy lab equipment is plugged in.';
        sampleUrgency = 'High';
        sampleReporter = 'Rohan Verma (Physics Dept)';
        break;
      case 'Water':
        sampleTitle = 'Drinking water cooler tap dispensing dirty brown water';
        sampleLoc = 'Central Library, 3rd Floor Quiet Study Zone';
        sampleArea = 'Near northern staircase dispenser';
        sampleDesc = 'The cold water tap is dispensing cloudy discolored water and leaking onto the carpet since morning.';
        sampleUrgency = 'High';
        sampleReporter = 'Ananya Gupta';
        break;
      case 'Cleanliness':
        sampleTitle = 'Glass bottle shattered on walkway near cafeteria entrance';
        sampleLoc = 'Student Activity Hub & Food Court Patio';
        sampleArea = 'Main pathway near bicycle stands';
        sampleDesc = 'A glass beverage bottle fell and shattered across the pedestrian tile path. Multiple sharp pieces across hallway floor.';
        sampleUrgency = 'Medium';
        sampleReporter = 'Campus Volunteer';
        break;
      case 'Internet':
        sampleTitle = 'Hostel Wi-Fi router rebooting in loop on floor 2';
        sampleLoc = 'Girls Hostel 2 (Gargi Hall)';
        sampleArea = 'Wing A corridor ceiling router';
        sampleDesc = 'Students preparing for tomorrow mid-semester online exam cannot connect to eduroam or CampusSecure network.';
        sampleUrgency = 'High';
        sampleReporter = 'Pooja Nair (3rd Year)';
        break;
      case 'Classroom':
        sampleTitle = 'Classroom 302 HVAC remote broken and AC running at 16°C continuously';
        sampleLoc = 'Academic Hall 4, Room 402';
        sampleArea = 'Room 302 wall panel';
        sampleDesc = 'The classroom thermostat wall sensor is stuck and the overhead projector HDMI port is loose.';
        sampleUrgency = 'Low';
        sampleReporter = 'Student Representative';
        break;
    }

    setTitle(sampleTitle);
    setCategory(presetCategory);
    setLocation(sampleLoc);
    setSpecificArea(sampleArea);
    setDescription(sampleDesc);
    setUrgency(sampleUrgency);
    setReporterName(sampleReporter);
    setErrors({});

    const priorityVal: 'Low' | 'Medium' | 'High' = sampleUrgency === 'Low' ? 'Low' : sampleUrgency === 'High' ? 'High' : 'Medium';
    setAiPrediction({
      category: presetCategory,
      priority: priorityVal,
      reasoning: `Contextually matched to campus ${presetCategory.toLowerCase()} maintenance guidelines.`,
      source: 'gemini',
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Please enter a problem title';
    if (!location.trim()) newErrors.location = 'Please enter or select a campus location';
    if (!description.trim()) newErrors.description = 'Please describe the problem';
    else if (description.trim().length < 15) {
      newErrors.description = 'Please provide a little more detail (at least 15 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      specificArea: specificArea.trim() || undefined,
      urgency,
      status: 'Pending',
      reportedBy: isAnonymous ? 'Anonymous Student' : (reporterName.trim() || 'Student (Campus Member)'),
      studentId: isAnonymous ? undefined : `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const getCategoryIcon = (cat: ProblemCategory) => {
    switch (cat) {
      case 'Electricity': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Water': return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'Cleanliness': return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Internet': return <Wifi className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Classroom': return <School className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#0b101d] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 id="report-modal-title" className="text-lg font-bold font-display text-white flex items-center gap-2">
              <span>Report Campus Issue</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                AI TRIAGE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispatches directly to central university facilities maintenance
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Pre-fill for Hackathon Evaluators */}
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-6 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono">
            <Sparkle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Hackathon Quick-Fills:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleQuickFill(c.id)}
                className="text-xs px-2.5 py-0.5 rounded-md bg-white/[0.06] text-indigo-200 border border-indigo-400/20 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition-colors font-medium cursor-pointer"
              >
                + {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* 1. Problem Title */}
          <div>
            <label className="block text-xs font-semibold font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Problem Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wi-Fi router down in corridor, water tap leaking in library"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                errors.title ? 'border-rose-500/70 bg-rose-950/20' : 'border-white/10'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* 2. Detailed Description with AI Auto-Classification */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold font-mono text-slate-300 uppercase tracking-wider">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualClassify}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Analyze description with AI"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{isClassifying ? 'Analyzing...' : 'AI Classify'}</span>
                </button>
                <span className="text-[11px] font-mono text-slate-500">
                  {description.length} chars
                </span>
              </div>
            </div>
            <textarea
              rows={3}
              placeholder="Describe the problem in detail. Gemini AI will automatically detect category & priority as you type..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                errors.description ? 'border-rose-500/70 bg-rose-950/20' : 'border-white/10'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.description}
              </p>
            )}

            {/* AI Classification Feedback Box */}
            {isClassifying && (
              <div className="mt-2.5 flex items-center gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Gemini 3.8 Flash is analyzing complaint description...</span>
              </div>
            )}

            {!isClassifying && aiPrediction && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 border border-indigo-500/30 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Predicted Triage</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {aiPrediction.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Campus Neural Triage'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{userOverridden ? 'Manual override' : 'Auto-applied'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 rounded-lg p-2.5 border border-white/[0.08]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      Predicted Category
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      {getCategoryIcon(aiPrediction.category)}
                      <span>{aiPrediction.category}</span>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-2.5 border border-white/[0.08]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      Predicted Priority
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        aiPrediction.priority === 'High' ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' :
                        aiPrediction.priority === 'Medium' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      }`} />
                      <span>{aiPrediction.priority} Priority</span>
                    </div>
                  </div>
                </div>

                {aiPrediction.reasoning && (
                  <p className="text-[11px] text-slate-300 bg-white/[0.03] p-2 rounded-lg border border-white/[0.06] leading-relaxed">
                    <span className="font-semibold text-indigo-300">Triage Note:</span> {aiPrediction.reasoning}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold font-mono text-slate-300 uppercase tracking-wider">
                Category Confirmation <span className="text-rose-400">*</span>
              </label>
              {aiPrediction && !userOverridden && (
                <span className="text-[11px] font-mono text-cyan-400">
                  Auto-selected by AI
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setUserOverridden(true);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] font-semibold'
                        : 'border-white/[0.08] bg-slate-900/50 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="mb-1">{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Location & Specific Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Location <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                <input
                  type="text"
                  list="campus-locations"
                  placeholder="e.g. Science Complex (Block B)"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                    errors.location ? 'border-rose-500/70 bg-rose-950/20' : 'border-white/10'
                  }`}
                />
                <datalist id="campus-locations">
                  {CAMPUS_LOCATION_PRESETS.map((loc, idx) => (
                    <option key={idx} value={loc} />
                  ))}
                </datalist>
              </div>
              {errors.location && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Room or Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Room 204, Near staircase"
                value={specificArea}
                onChange={(e) => setSpecificArea(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
              />
            </div>
          </div>

          {/* 5. Priority / Urgency Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold font-mono text-slate-300 uppercase tracking-wider">
                Urgency Level
              </label>
              {aiPrediction && !userOverridden && (
                <span className="text-[11px] font-mono text-cyan-400">
                  AI Assessed: {aiPrediction.priority}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {urgencyLevels.map((lvl) => {
                const isSelected = urgency === lvl.id;
                let activeClass = 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]';
                if (lvl.id === 'Emergency') {
                  activeClass = 'border-rose-500 bg-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                } else if (lvl.id === 'High') {
                  activeClass = 'border-amber-500 bg-amber-500/20 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
                }

                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setUrgency(lvl.id);
                      setUserOverridden(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? activeClass
                        : 'border-white/[0.08] bg-slate-900/50 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold">{lvl.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-Submission Verification Summary Card */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verification Before Dispatch</span>
              </span>
              {aiPrediction && (
                <span className="text-[11px] text-indigo-300 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>AI Verified</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-lg border border-white/10 text-slate-200">
                <span className="text-slate-500">Category:</span>
                {getCategoryIcon(category)}
                <span>{category}</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-lg border border-white/10 text-slate-200">
                <span className="text-slate-500">Priority:</span>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  urgency === 'Emergency' ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' :
                  urgency === 'High' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' :
                  urgency === 'Medium' ? 'bg-blue-400' : 'bg-emerald-400'
                }`} />
                <span>{urgency}</span>
              </div>

              {location && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-lg border border-white/10 text-slate-300 truncate max-w-xs">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* 6. Reporter Info */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous-check"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-white/20 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="anonymous-check" className="text-xs text-slate-300 font-medium cursor-pointer">
                Submit Anonymously (Hide student profile)
              </label>
            </div>

            {!isAnonymous && (
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 active:scale-97 rounded-xl shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Ticket'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
