import React, { useState } from 'react';
import { Complaint, UserRole, ComplaintStatus } from '../types';
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  Send,
  ShieldCheck,
  Zap,
  Droplets,
  Sparkles,
  Wifi,
  School
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onUpvote: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, resolutionNote?: string) => void;
  onAddComment: (id: string, comment: string, author: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  userRole,
  onUpvote,
  onUpdateStatus,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');
  const [showResolveBox, setShowResolveBox] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !complaint) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Electricity':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Water':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'Cleanliness':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'Internet':
        return <Wifi className="w-4 h-4 text-indigo-400" />;
      case 'Classroom':
        return <School className="w-4 h-4 text-rose-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = userRole === 'facilities_staff' 
      ? 'Campus Operations Desk' 
      : 'Campus Student';

    onAddComment(complaint.id, commentText.trim(), author);
    setCommentText('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionInput.trim()) return;
    onUpdateStatus(complaint.id, 'Resolved', resolutionInput.trim());
    setShowResolveBox(false);
    setResolutionInput('');
  };

  const handleShare = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#0b101e] rounded-2xl shadow-2xl border border-white/10 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-detail-title"
      >
        {/* Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
              {getCategoryIcon(complaint.category)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-cyan-400">{complaint.id}</span>
                <span className="text-[11px] font-mono bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                  {complaint.category}
                </span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border ${
                  complaint.urgency === 'Emergency'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse font-bold'
                    : complaint.urgency === 'High'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : complaint.urgency === 'Medium'
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {complaint.urgency} Priority
                </span>
              </div>
              <h2 id="ticket-detail-title" className="text-base sm:text-lg font-bold font-display text-white mt-0.5">
                {complaint.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copy share link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[11px]">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status Workflow Progress Pipeline */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-white/[0.08]">
            <div className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider mb-3">
              Resolution Pipeline Status
            </div>

            <div className="grid grid-cols-3 gap-2 relative">
              {/* Step 1: Pending */}
              <div className={`p-3 rounded-xl border text-center transition-all ${
                complaint.status === 'Pending' 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-300'
              }`}>
                <div className="text-xs font-bold font-mono">1. Reported</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Queue triage</div>
              </div>

              {/* Step 2: In Progress */}
              <div className={`p-3 rounded-xl border text-center transition-all ${
                complaint.status === 'In Progress' 
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                  : complaint.status === 'Resolved'
                  ? 'bg-white/[0.03] border-white/[0.06] text-slate-300'
                  : 'bg-white/[0.02] border-white/[0.04] text-slate-500'
              }`}>
                <div className="text-xs font-bold font-mono">2. In Progress</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Crews deployed</div>
              </div>

              {/* Step 3: Resolved */}
              <div className={`p-3 rounded-xl border text-center transition-all ${
                complaint.status === 'Resolved' 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-white/[0.02] border-white/[0.04] text-slate-500'
              }`}>
                <div className="text-xs font-bold font-mono">3. Resolved</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Verified fixed</div>
              </div>
            </div>

            {/* Quick Action buttons for Staff Admin */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-400 font-mono">
                Current status: <span className="font-semibold text-white font-mono uppercase">{complaint.status}</span>
              </div>

              {userRole === 'facilities_staff' ? (
                <div className="flex items-center gap-2">
                  {complaint.status !== 'In Progress' && (
                    <button
                      onClick={() => onUpdateStatus(complaint.id, 'In Progress')}
                      className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/25 transition-colors cursor-pointer"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {complaint.status !== 'Resolved' && (
                    <button
                      onClick={() => setShowResolveBox(!showResolveBox)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Mark as Resolved
                    </button>
                  )}

                  {complaint.status === 'Resolved' && (
                    <button
                      onClick={() => onUpdateStatus(complaint.id, 'In Progress', 'Ticket reopened for further inspection.')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white/[0.06] border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Student View Mode · Switch to Staff Mode in top header to update ticket</span>
                </div>
              )}
            </div>

            {/* Resolution Form Dropdown if toggled */}
            {showResolveBox && (
              <form onSubmit={handleResolveSubmit} className="mt-3 p-3 bg-slate-900 rounded-xl border border-emerald-500/30 shadow-xs">
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Add Resolution Notes for Students:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Electrician replaced fuse and re-seated wall wiring at 11:30 AM."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-black/40 border border-white/10 text-white rounded-lg focus:ring-1 focus:ring-emerald-400 focus:outline-none mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResolveBox(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                  >
                    Confirm Resolution
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Location & Reported Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Incident Coordinates</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {complaint.location}
              </div>
              {complaint.specificArea && (
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Sub-location: [{complaint.specificArea}]
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reporter Origin</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {complaint.reportedBy}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                {complaint.reportedAt} {complaint.studentId ? `· ${complaint.studentId}` : ''}
              </div>
            </div>
          </div>

          {/* Detailed Problem Description */}
          <div>
            <h4 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider mb-2">
              Detailed Problem Description
            </h4>
            <div className="p-4 bg-slate-900/70 rounded-xl border border-white/[0.08] text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Resolution Note Banner if Resolved */}
          {complaint.resolutionNote && (
            <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-100">
              <div className="flex items-center gap-2 font-semibold text-sm text-emerald-300 mb-1 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resolution Audit Verified</span>
                {complaint.resolvedAt && (
                  <span className="text-xs text-emerald-400/80 font-normal">({complaint.resolvedAt})</span>
                )}
              </div>
              <p className="text-xs text-emerald-200 leading-relaxed">
                {complaint.resolutionNote}
              </p>
            </div>
          )}

          {/* Chronological Activity & Dispatch Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">
                Activity & Dispatch Log ({complaint.timeline?.length || 1})
              </h4>
              <button
                onClick={() => onUpvote(complaint.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  complaint.hasUpvoted
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-indigo-500/10 hover:text-indigo-300'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${complaint.hasUpvoted ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                <span>{complaint.upvotes} Students Affected</span>
              </button>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-white/10 ml-2">
              {complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#0b101e]" />
                    <div className="text-xs font-semibold text-white flex items-center gap-2 font-mono">
                      <span>{event.title}</span>
                      <span className="text-slate-500 font-normal">· {event.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {event.description}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      By {event.author}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">
                  Report submitted. Dispatched to queue.
                </div>
              )}
            </div>
          </div>

          {/* Add a comment / status update */}
          <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-white/[0.08]">
            <label className="block text-xs font-semibold font-mono text-slate-300 mb-1.5">
              Post Student Comment or Field Update
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Maintenance crew arrived on 3rd floor / Still leaking as of 12 PM..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-97 rounded-xl disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </div>
          </form>

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3.5 bg-black/40 border-t border-white/[0.08] flex items-center justify-between shrink-0 font-mono">
          <div className="text-xs text-slate-500">
            Ticket ID: <span className="font-bold text-slate-300">{complaint.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-white/[0.06] border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
