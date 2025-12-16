
import React from 'react';

interface SkillBarProps {
  label: string;
  level: number;
  progress: number;
  icon: React.ReactNode;
  bonus?: number;
  tooltip?: string;
}

export const SkillBar: React.FC<SkillBarProps> = ({ label, level, progress, icon, bonus, tooltip }) => (
  <div className="mb-2 select-none group bg-[#1a1a1a] p-1.5 rounded border border-[#333] hover:border-[#444] transition-colors" title={tooltip || `${label}: ${Math.floor(progress)}%`}>
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
          <div className="text-gray-400 bg-[#111] p-1 rounded border border-[#2a2a2a]">{icon}</div>
          <span className="text-[11px] text-[#ccc] font-bold tracking-wide">{label}</span>
      </div>
      <div className="text-xs font-bold text-white font-mono bg-[#111] px-1.5 rounded border border-[#2a2a2a]">
        {level} {bonus ? <span className="text-green-400 text-[10px] ml-0.5">+{bonus}</span> : ''}
      </div>
    </div>
    <div className="h-2 w-full bg-[#0a0a0a] border border-[#2a2a2a] relative rounded-full overflow-hidden">
       <div 
         className="h-full bg-gradient-to-r from-green-700 to-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] transition-all duration-300" 
         style={{ width: `${Math.min(100, progress)}%` }}
       ></div>
    </div>
  </div>
);
