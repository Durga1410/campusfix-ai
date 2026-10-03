import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  RotateCcw, 
  Building2, 
  ArrowUpDown, 
  CheckCircle2, 
  SearchX, 
  Sparkles,
  Zap,
  Radio,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { 
  Complaint, 
  ProblemCategory, 
  UserRole, 
  ComplaintStatus 
} from './types';
import { INITIAL_COMPLAINTS } from './data/initialData';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ComplaintCard } from './components/ComplaintCard';
import { ReportModal } from './components/ReportModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { EmergencyModal } from './components/EmergencyModal';

const STORAGE_KEY = 'campusfix_complaints_v1';

export default function App() {
  // Initialize state with local storage fallback
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_COMPLAINTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'urgency'>('newest');
  const [userRole, setUserRole] = useState<UserRole>('student');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.error('Failed to sync to local storage', e);
    }
  }, [complaints]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Upvote complaint
  const handleUpvote = (id: string) => {
    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextUpvoted = !item.hasUpvoted;
          const delta = nextUpvoted ? 1 : -1;
          const updated = {
            ...item,
            upvotes: Math.max(0, item.upvotes + delta),
            hasUpvoted: nextUpvoted,
          };
          if (selectedComplaint && selectedComplaint.id === id) {
            setSelectedComplaint(updated);
          }
          return updated;
        }
        return item;
      })
    );

    const target = complaints.find((c) => c.id === id);
    if (target && !target.hasUpvoted) {
      showToast(`+1 confirmed: You confirmed ticket #${target.id}. Facilities notified.`);
    }
  };

  // Update Status (Facilities staff)
  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus, note?: string) => {
    const timestamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedTimeline = [
            {
              id: `evt-${Date.now()}`,
              timestamp: 'Just now',
              title: `Status changed to ${newStatus}`,
              description: note || `Dispatcher marked ticket as ${newStatus}.`,
              author: userRole === 'facilities_staff' ? 'Facilities Operations' : 'Campus Member',
            },
            ...(item.timeline || []),
          ];

          const updated: Complaint = {
            ...item,
            status: newStatus,
            resolutionNote: note || (newStatus === 'Resolved' ? 'Repairs finished and quality checked by facility team.' : item.resolutionNote),
            resolvedAt: newStatus === 'Resolved' ? timestamp : undefined,
            timeline: updatedTimeline,
          };

          if (selectedComplaint && selectedComplaint.id === id) {
            setSelectedComplaint(updated);
          }

          return updated;
        }
        return item;
      })
    );

    showToast(`Ticket #${id} updated to status "${newStatus}".`);
  };

  // Add Comment to complaint
  const handleAddComment = (id: string, comment: string, author: string) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Field Comment Added',
      description: comment,
      author,
    };

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            timeline: [newEvent, ...(item.timeline || [])],
          };
        }
        return item;
      })
    );

    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          timeline: [newEvent, ...(prev.timeline || [])],
        };
      });
    }

    showToast('Your update has been appended to the ticket timeline.');
  };

  // Submit New Complaint
  const handleCreateComplaint = (
    data: Omit<Complaint, 'id' | 'reportedAt' | 'upvotes' | 'hasUpvoted' | 'timeline'>
  ) => {
    const newId = `CF-${Math.floor(1090 + Math.random() * 9000)}`;
    const newComplaint: Complaint = {
      ...data,
      id: newId,
      reportedAt: 'Just now',
      upvotes: 1,
      hasUpvoted: true,
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: 'Just now',
          title: 'Ticket Created',
          description: `Logged under ${data.category} category for dispatch.`,
          author: data.reportedBy,
        },
      ],
    };

    // Explicitly clear any active filter & sort states before the update to guarantee immediate rendering
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setSortBy('newest');

    // Update complaints state and immediately sync to local storage
    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync to local storage', e);
      }
      return updated;
    });

    // Re-verify and ensure all filter states remain cleared after scheduling setComplaints
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setSortBy('newest');

    showToast(`Ticket #${newId} submitted successfully! Added to live queue.`);

    setTimeout(() => {
      const feedElement = document.getElementById('complaints-feed');
      if (feedElement) {
        feedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Reset to sample data modal trigger
  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setComplaints(INITIAL_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY);
    setIsResetConfirmOpen(false);
    showToast('Initial demo complaints dataset restored.');
  };

  // Filter & Search Logic
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'All' && item.status !== selectedStatus) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          const matchArea = item.specificArea?.toLowerCase().includes(q);
          const matchId = item.id.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc && !matchArea && !matchId && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          return b.upvotes - a.upvotes;
        }
        if (sortBy === 'urgency') {
          const urgencyWeight: Record<string, number> = {
            Emergency: 4,
            High: 3,
            Medium: 2,
            Low: 1,
          };
          return (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
        }
        // default newest (by ID/array order)
        return 0;
      });
  }, [complaints, selectedCategory, selectedStatus, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Ambient Radial Gradient Glows (Subtle, high-performance compositor blur) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px] animate-ambient-glow" />
        <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[130px] animate-ambient-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[150px] animate-ambient-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 text-xs sm:text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 font-mono">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 shadow-[0_0_8px_#06b6d4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <div className="relative z-20">
        <Header
          onOpenReportModal={() => setIsReportModalOpen(true)}
          userRole={userRole}
          onToggleRole={() => {
            const next = userRole === 'student' ? 'facilities_staff' : 'student';
            setUserRole(next);
            showToast(
              next === 'facilities_staff'
                ? 'Switched to Staff Command: You can now update repair status and close tickets.'
                : 'Switched to Student Mode: You can submit issues and confirm community reports.'
            );
          }}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />
      </div>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Futuristic Hero Section */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/80 via-[#0d1424]/90 to-slate-900/80 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
          
          {/* Subtle top edge laser line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              
              {/* Badge kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-cyan-300 text-xs font-mono font-medium mb-4 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Gemini 3.8 Flash Neural Triage · Real-Time Operations</span>
              </div>

              {/* Bold Typography Headline */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white leading-[1.15]">
                Campus Infrastructure.{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-100 bg-clip-text text-transparent">
                  Reported in Seconds.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3.5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Direct dispatch channel for electrical sparks, burst water lines, campus Wi-Fi deadzones, and lecture hall AV. Powered by autonomous AI triage.
              </p>

              {/* Live telemetry micro-strip */}
              <div className="mt-5 flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span>Central Dispatch: Online</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Queue: {complaints.length} Tickets</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Apex University</span>
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="group relative overflow-hidden flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 active:scale-98 rounded-xl shadow-xl shadow-indigo-500/25 border border-indigo-400/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-indigo-100 transition-transform group-hover:rotate-90" />
                <span>Report a Problem</span>
              </button>

              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all cursor-pointer"
              >
                <span>Emergency Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. Statistics Telemetry Bar */}
        <StatsBar
          complaints={complaints}
          activeStatusFilter={selectedStatus}
          onSelectStatusFilter={(status) => setSelectedStatus(status)}
        />

        {/* 2. Category Sector Filter Strip */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          complaints={complaints}
        />

        {/* 3. Futuristic Dashboard Control Deck (Search, Status Tabs, Sort, Reset) */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-3 sm:p-4 mb-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Integrated Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports, room numbers, Wi-Fi, leak IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right side controls: Sorting & Reset */}
          <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
            
            {/* Status Quick Filter Pills */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
              {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => {
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-black/40 px-3 py-1 rounded-xl border border-white/[0.08]">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer py-1"
              >
                <option value="newest" className="bg-slate-900 text-white">Newest</option>
                <option value="upvotes" className="bg-slate-900 text-white">Upvotes</option>
                <option value="urgency" className="bg-slate-900 text-white">Priority</option>
              </select>
            </div>

            {/* Reset data button */}
            <button
              onClick={handleResetData}
              title="Reset complaints to sample seed state"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl border border-white/[0.06] hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Reset Seed</span>
            </button>
          </div>
        </div>

        {/* 4. Active Filter Tags Bar if filter is active */}
        {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1 font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full">
                  Sector: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-white cursor-pointer">×</button>
                </span>
              )}
              {selectedStatus !== 'All' && (
                <span className="inline-flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 px-2.5 py-0.5 rounded-full">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus('All')} className="hover:text-white cursor-pointer">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/20 text-white px-2.5 py-0.5 rounded-full">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-400 cursor-pointer">×</button>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* 5. Complaints Grid */}
        <div id="complaints-feed">
          {filteredComplaints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredComplaints.map((complaint, idx) => (
                <div
                  key={complaint.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 0.04, 0.35)}s` }}
                >
                  <ComplaintCard
                    complaint={complaint}
                    userRole={userRole}
                    onUpvote={handleUpvote}
                    onSelect={(item) => setSelectedComplaint(item)}
                    onUpdateStatus={handleUpdateStatus}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] p-12 text-center my-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-xl">
                <SearchX className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-display text-white mb-1.5">
                No matching tickets in queue
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
                No campus issues match your current query or category filters. Try choosing "All Tickets" or log a new incident.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-semibold font-mono text-slate-300 bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold font-mono text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
                >
                  + Log New Problem
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Futuristic Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/[0.06] bg-[#05070e]/80 backdrop-blur-xl py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-display">CampusFix</span>
            <span>·</span>
            <span>Autonomous Infrastructure Intelligence System</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Emergency Contacts
            </button>
            <span>·</span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              + Submit Issue
            </button>
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateComplaint}
      />

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        userRole={userRole}
        onUpvote={handleUpvote}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
      />

      {/* Emergency Helpline Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* In-App Reset Confirmation Modal (Dark Glassmorphic) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div 
            className="bg-[#0c1220] rounded-2xl shadow-2xl border border-white/10 max-w-sm w-full p-5.5 animate-in fade-in zoom-in-95 duration-150 text-slate-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-confirm-title"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 id="reset-confirm-title" className="text-base font-bold text-white font-display">
                  Reset Demo Dataset?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Restores 8 default seeded hackathon complaints and clears local storage cache.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-97 rounded-xl shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
