import React from 'react';
import { Complaint } from '../types';
import { Clock, AlertCircle, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

interface StatsBarProps {
  complaints: Complaint[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  complaints,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    {
      id: 'All',
      title: 'Total Reports',
      count: total,
      subtext: 'Campus wide',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      activeClass: 'border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.2)]',
      glowColor: 'from-indigo-500/30 to-blue-500/10',
      badgeText: 'All Tickets',
      badgeColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
      textColor: 'text-white',
    },
    {
      id: 'Pending',
      title: 'Pending Triage',
      count: pending,
      subtext: 'Requires dispatch',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      activeClass: 'border-amber-500/70 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.2)]',
      glowColor: 'from-amber-500/30 to-orange-500/10',
      badgeText: 'Queue',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      textColor: 'text-amber-200',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      count: inProgress,
      subtext: 'Crews deployed',
      icon: <AlertCircle className="w-4 h-4 text-cyan-400" />,
      activeClass: 'border-cyan-500/70 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      glowColor: 'from-cyan-500/30 to-blue-500/10',
      badgeText: 'Active',
      badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
      textColor: 'text-cyan-200',
    },
    {
      id: 'Resolved',
      title: 'Resolved & Closed',
      count: resolved,
      subtext: 'Verified fixed',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      activeClass: 'border-emerald-500/70 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
      glowColor: 'from-emerald-500/30 to-teal-500/10',
      badgeText: 'Success',
      badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
      textColor: 'text-emerald-200',
    },
  ];

  return (
    <div className="relative mb-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-white/[0.06] gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
            <span className="uppercase text-xs font-mono text-slate-400 tracking-wider">Live Telemetry</span>
            <span className="text-slate-600">·</span>
            <span>Campus Operational Metric Feed</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Resolution Ratio:</span>
          <span className="font-semibold text-emerald-300 font-mono text-sm tabular-nums">
            {resolutionRate}%
          </span>
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Interactive Glass Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const isSelected = activeStatusFilter === stat.id;
          return (
            <button
              key={stat.id}
              onClick={() => onSelectStatusFilter(stat.id)}
              className={`relative overflow-hidden text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                isSelected
                  ? stat.activeClass
                  : 'bg-slate-900/40 backdrop-blur-md border-white/[0.06] hover:border-white/20 hover:bg-slate-900/70 hover:-translate-y-0.5'
              }`}
            >
              {/* Subtle top ambient glow */}
              <div 
                className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${stat.glowColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} 
              />

              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white">
                  {stat.icon}
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${stat.badgeColor}`}>
                  {stat.badgeText}
                </span>
              </div>

              <div className="relative z-10">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-1 tabular-nums">
                  {stat.count}
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {stat.title}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {stat.subtext}
                </div>
              </div>

              {/* Active bottom accent line */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_10px_#818cf8]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
