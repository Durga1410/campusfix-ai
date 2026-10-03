import React from 'react';
import { ProblemCategory, Complaint } from '../types';
import { Zap, Droplets, Sparkles, Wifi, School, Layers } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: ProblemCategory | 'All';
  onSelectCategory: (category: ProblemCategory | 'All') => void;
  complaints: Complaint[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  complaints,
}) => {
  const getCategoryCount = (cat: ProblemCategory | 'All') => {
    if (cat === 'All') return complaints.length;
    return complaints.filter((c) => c.category === cat).length;
  };

  const categories: Array<{
    id: ProblemCategory | 'All';
    label: string;
    icon: React.ReactNode;
    activeBorder: string;
    glowBg: string;
    accentColor: string;
  }> = [
    {
      id: 'All',
      label: 'All Tickets',
      icon: <Layers className="w-4 h-4" />,
      activeBorder: 'border-indigo-500/80 bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]',
      glowBg: 'from-indigo-500/20 to-blue-500/10',
      accentColor: 'text-indigo-400',
    },
    {
      id: 'Electricity',
      label: 'Electricity',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      activeBorder: 'border-amber-500/80 bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      glowBg: 'from-amber-500/20 to-yellow-500/10',
      accentColor: 'text-amber-400',
    },
    {
      id: 'Water',
      label: 'Water & Plumbing',
      icon: <Droplets className="w-4 h-4 text-sky-400" />,
      activeBorder: 'border-sky-500/80 bg-gradient-to-r from-sky-600 to-blue-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.35)]',
      glowBg: 'from-sky-500/20 to-blue-500/10',
      accentColor: 'text-sky-400',
    },
    {
      id: 'Cleanliness',
      label: 'Sanitation',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      activeBorder: 'border-emerald-500/80 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      glowBg: 'from-emerald-500/20 to-teal-500/10',
      accentColor: 'text-emerald-400',
    },
    {
      id: 'Internet',
      label: 'Wi-Fi & LAN',
      icon: <Wifi className="w-4 h-4 text-indigo-400" />,
      activeBorder: 'border-indigo-500/80 bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]',
      glowBg: 'from-indigo-500/20 to-purple-500/10',
      accentColor: 'text-indigo-400',
    },
    {
      id: 'Classroom',
      label: 'Classroom & AV',
      icon: <School className="w-4 h-4 text-rose-400" />,
      activeBorder: 'border-rose-500/80 bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      glowBg: 'from-rose-500/20 to-pink-500/10',
      accentColor: 'text-rose-400',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <h3 className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
            Sector Filter
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Viewing <span className="text-white font-semibold">{getCategoryCount(selectedCategory)}</span> / {complaints.length} tickets
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? cat.activeBorder
                  : 'bg-slate-900/50 backdrop-blur-md text-slate-300 border-white/[0.06] hover:border-white/20 hover:bg-slate-800/70 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={isSelected ? 'text-white' : ''}>
                  {cat.icon}
                </span>
                <span className="text-xs font-semibold truncate tracking-tight">
                  {cat.label}
                </span>
              </div>
              <span
                className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ml-1.5 ${
                  isSelected
                    ? 'bg-black/30 text-white font-bold'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
