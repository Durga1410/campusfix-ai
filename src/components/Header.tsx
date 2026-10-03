import React from 'react';
import { 
  PlusCircle, 
  Wrench, 
  PhoneCall, 
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenReportModal: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenEmergencyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReportModal,
  userRole,
  onToggleRole,
  onOpenEmergencyModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#080c14]/85 backdrop-blur-xl border-b border-white/[0.07] transition-colors">
      {/* Top Telemetry & Role Switcher Bar */}
      <div className="bg-[#05070d]/90 border-b border-white/[0.04] text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 max-w-2xl truncate">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-slate-300 font-medium tracking-wide">CAMPUS COMMAND 24/7</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            University Facilities Triage & Response
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors text-[11px] cursor-pointer"
          >
            <PhoneCall className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="hidden xs:inline">Emergency Dispatch</span>
          </button>
          
          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Interactive Role Switcher Pill */}
          <button
            onClick={onToggleRole}
            title="Toggle between Student reporting and Maintenance Staff mode"
            className={`group flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${
              userRole === 'facilities_staff'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${userRole === 'facilities_staff' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
            <span>{userRole === 'facilities_staff' ? 'Staff Command' : 'Student Mode'}</span>
            <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">⇄</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-white shadow-xl">
                <Wrench className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  CampusFix
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Intelligent physical infrastructure reporting & dispatch
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-white/[0.06] px-3 py-1.5 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] text-slate-300">Gemini 3.8 Flash Active</span>
            </div>

            <button
              onClick={onOpenReportModal}
              className="relative group overflow-hidden flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-blue-500 active:scale-97 rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-indigo-100" />
              <span>Report a Problem</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
