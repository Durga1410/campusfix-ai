import React from 'react';
import { X, PhoneCall, Zap, Droplets, ShieldAlert, Wifi, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const contacts = [
    {
      title: 'Campus Central Security & First Response',
      number: '+1 (800) 555-0911 / Ext. 911',
      desc: '24/7 Gatehouse, physical safety & emergency paramedic',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      tag: 'Priority 1',
      glow: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },
    {
      title: 'Electrical Substation Emergency Desk',
      number: 'Ext. 4040 / (555) 019-4040',
      desc: 'Sparks, high-voltage tripping, smoke from panels',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      tag: 'High Voltage',
      glow: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    {
      title: 'Emergency Plumbing & Water Supply Unit',
      number: 'Ext. 3020 / (555) 019-3020',
      desc: 'Burst pipes, major room flooding, sewer blockage',
      icon: <Droplets className="w-5 h-5 text-sky-400" />,
      tag: 'Flood Control',
      glow: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },
    {
      title: 'Campus IT & Network Operations Center (NOC)',
      number: 'Ext. 2010 / noc@campus.edu',
      desc: 'Campus-wide router blackout, exam portal failure',
      icon: <Wifi className="w-5 h-5 text-indigo-400" />,
      tag: 'Infrastructure',
      glow: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#0b101e] rounded-2xl shadow-2xl border border-white/10 w-full max-w-xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-base font-bold font-display text-white">
                Emergency & Critical Helplines
              </h2>
              <p className="text-xs text-slate-400">
                For active fires, gas leaks, or bodily hazards, dial directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {contacts.map((contact, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl border border-white/[0.07] bg-slate-900/60 hover:bg-slate-800/60 hover:border-white/20 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 mt-0.5">
                  {contact.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {contact.title}
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${contact.glow}`}>
                      {contact.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {contact.desc}
                  </p>
                  <div className="text-xs font-mono font-bold text-cyan-400 mt-2 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{contact.number}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3.5 bg-black/30 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-white/[0.06] border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer font-mono"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
