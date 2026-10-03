import React from 'react';
import { 
  Complaint, 
  UserRole, 
  ComplaintStatus 
} from '../types';
import { 
  Zap, 
  Droplets, 
  Sparkles, 
  Wifi, 
  School, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  userRole: UserRole;
  onUpvote: (id: string) => void;
  onSelect: (complaint: Complaint) => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  userRole,
  onUpvote,
  onSelect,
  onUpdateStatus,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Electricity':
        return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'Water':
        return <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'Cleanliness':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'Internet':
        return <Wifi className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'Classroom':
        return <School className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span>Pending</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  const getUrgencyText = () => {
    if (complaint.urgency === 'Emergency') {
      return (
        <span className="text-[10px] font-mono uppercase font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse">
          Emergency
        </span>
      );
    }
    if (complaint.urgency === 'High') {
      return (
        <span className="text-[10px] font-mono uppercase font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
          High
        </span>
      );
    }
    if (complaint.urgency === 'Medium') {
      return (
        <span className="text-[10px] font-mono uppercase font-semibold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
          Medium
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono uppercase font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
        Low
      </span>
    );
  };

  return (
    <div className="relative group rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.07] hover:border-indigo-500/40 shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-indigo-400/40 transition-colors" />

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        
        {/* Header Metadata Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <div className="p-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
              {getCategoryIcon(complaint.category)}
            </div>
            <span className="text-slate-300 font-medium">{complaint.category}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-[11px] text-slate-500">{complaint.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {getUrgencyText()}
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(complaint)}
          className="text-base font-semibold text-white group-hover:text-indigo-300 cursor-pointer transition-colors leading-snug mb-2 font-display tracking-tight"
        >
          {complaint.title}
        </h3>

        {/* Location with Pin */}
        <div className="flex items-start gap-1.5 text-xs text-slate-400 mb-3 font-mono">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <span className="line-clamp-1">
            {complaint.location}
            {complaint.specificArea && (
              <span className="text-slate-500 ml-1">[{complaint.specificArea}]</span>
            )}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {complaint.description}
        </p>

        {/* Status Callout Note */}
        {complaint.status === 'Resolved' && complaint.resolutionNote && (
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-3 text-xs text-emerald-200 leading-relaxed">
            <span className="font-semibold text-emerald-300">Resolved:</span> {complaint.resolutionNote}
          </div>
        )}

        {complaint.status === 'In Progress' && complaint.assignedStaff && (
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 mb-3 text-xs text-cyan-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Assigned: {complaint.assignedStaff}</span>
          </div>
        )}

        {/* Unboxed Metadata (Time & Reporter) */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-3 border-t border-white/[0.05] font-mono">
          <span>{complaint.reportedAt}</span>
          <span>·</span>
          <span className="truncate max-w-[140px] text-slate-400">{complaint.reportedBy}</span>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 py-3 bg-black/25 border-t border-white/[0.06] flex items-center justify-between gap-2">
        
        {/* Upvote Button ("Affects me too") */}
        <button
          onClick={() => onUpvote(complaint.id)}
          className={`group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            complaint.hasUpvoted
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30'
          }`}
          title="Click to confirm you are also experiencing this issue"
        >
          <ThumbsUp className={`w-3.5 h-3.5 transition-transform group-hover/btn:scale-110 ${complaint.hasUpvoted ? 'fill-indigo-400 text-indigo-400' : ''}`} />
          <span className="font-mono tabular-nums">{complaint.upvotes}</span>
          <span className="hidden sm:inline text-[11px]">
            {complaint.hasUpvoted ? 'Confirmed' : '+1 Confirm'}
          </span>
        </button>

        {/* Right side: Admin Quick Action or View Details */}
        <div className="flex items-center gap-2">
          {userRole === 'facilities_staff' && (
            <div className="relative">
              <select
                value={complaint.status}
                onChange={(e) => onUpdateStatus(complaint.id, e.target.value as ComplaintStatus)}
                className="text-xs bg-slate-900 border border-white/20 rounded-lg px-2.5 py-1 font-semibold text-amber-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="Pending">Mark Pending</option>
                <option value="In Progress">Mark In Progress</option>
                <option value="Resolved">Mark Resolved</option>
              </select>
            </div>
          )}

          <button
            onClick={() => onSelect(complaint)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 transition-colors cursor-pointer group/link"
          >
            <span>View Ticket</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
