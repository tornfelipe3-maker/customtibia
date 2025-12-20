
import React from 'react';
import { DeathReport } from '../types';
import { VOCATION_SPRITES } from '../constants';
import { Skull, TrendingDown, Coins, ShieldAlert, HeartCrack } from 'lucide-react';
import { Sprite } from './common/Sprite';

interface DeathModalProps {
  report: DeathReport;
  onClose: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-[400] bg-black flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-500">
      
      {/* Red Pulse Overlay */}
      <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>

      <div className="tibia-panel w-full max-w-lg bg-[#111] border-2 border-red-900 shadow-[0_0_100px_rgba(153,27,27,0.4)] relative flex flex-col overflow-hidden">
        
        {/* Header Decor */}
        <div className="h-1 bg-red-600 w-full animate-[pulse_1s_infinite]"></div>

        <div className="p-8 flex flex-col items-center text-center">
            
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative z-10 w-32 h-32 bg-black/40 rounded-full border border-red-900/50 flex items-center justify-center overflow-hidden">
                    {/* Ghost/Dead Sprite */}
                    <Sprite 
                        src={VOCATION_SPRITES[report.vocation]} 
                        type="outfit" 
                        size={64} 
                        className="scale-[3] pixelated grayscale opacity-50 brightness-50" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Skull size={48} className="text-red-600/80 drop-shadow-lg" />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-black text-red-600 font-serif tracking-tighter mb-2 uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">You are dead.</h2>
            <p className="text-gray-400 text-sm mb-8 font-bold">You were killed by <span className="text-white italic">{report.killerName}</span>.</p>

            {/* Loss Summary */}
            <div className="w-full space-y-3 mb-8">
                
                <div className="flex items-center justify-between bg-black/60 p-3 rounded border border-red-950 shadow-inner group transition-colors hover:border-red-900">
                    <div className="flex items-center gap-3">
                        <TrendingDown size={20} className="text-red-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience Loss</span>
                    </div>
                    <div className="text-lg font-mono font-black text-red-400">-{report.xpLoss.toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between bg-black/60 p-3 rounded border border-red-950 shadow-inner group transition-colors hover:border-red-900">
                    <div className="flex items-center gap-3">
                        <Coins size={20} className="text-yellow-600" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gold Lost</span>
                    </div>
                    <div className="text-lg font-mono font-black text-yellow-500">-{report.goldLoss.toLocaleString()} gp</div>
                </div>

                <div className="flex items-center justify-between bg-black/60 p-3 rounded border border-red-950 shadow-inner group transition-colors hover:border-red-900">
                    <div className="flex items-center gap-3">
                        <HeartCrack size={20} className="text-purple-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Death Penalty</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-purple-400">{report.hasBlessing ? 'REDUCED (BLOCKED)' : 'FULL'}</div>
                        <div className="text-[9px] text-gray-600 font-bold">{report.levelDown ? 'LEVEL REDUCED!' : 'KEPT LEVEL'}</div>
                    </div>
                </div>

            </div>

            {/* Tip */}
            <div className="bg-red-950/20 border border-red-900/30 p-3 rounded text-[10px] text-red-300 leading-relaxed italic mb-8">
                {report.hasBlessing 
                    ? "Your blessings protected you from a much worse fate. They have been consumed." 
                    : "Tip: Visit Henricus in the Castle to buy Blessings and reduce these losses next time."}
            </div>

            <button 
                onClick={onClose}
                className="tibia-btn w-full py-4 bg-red-900 hover:bg-red-800 text-white font-black text-lg border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)] tracking-widest transition-transform active:scale-95"
            >
                RESPAWN
            </button>
        </div>

        {/* Footer Accent */}
        <div className="bg-black p-2 text-[8px] text-center text-red-900 font-mono tracking-widest uppercase">
            Dark Souls remain in the void...
        </div>
      </div>
    </div>
  );
};
