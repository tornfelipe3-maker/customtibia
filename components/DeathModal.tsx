
import React from 'react';
import { DeathReport } from '../types';
import { Skull, TrendingDown, Coins, HeartCrack, Info } from 'lucide-react';

interface DeathModalProps {
  report: DeathReport;
  onClose: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-500">
      
      {/* Overlay de Sangue/Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(153,27,27,0.2)_0%,transparent_80%)] pointer-events-none"></div>

      <div className="tibia-panel w-full max-w-md bg-[#0a0a0a] border-2 border-red-900 shadow-[0_0_100px_rgba(153,27,27,0.4)] relative flex flex-col overflow-hidden rounded-lg">
        
        {/* Top Accent */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent w-full"></div>

        <div className="p-8 flex flex-col items-center text-center">
            
            {/* Imagem do Player Morto solicitada */}
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-red-600/10 rounded-lg blur-2xl animate-pulse"></div>
                <div className="relative z-10 w-48 h-48 bg-[#111] rounded-lg border-2 border-red-900/50 shadow-2xl overflow-hidden flex items-center justify-center p-2">
                    <img 
                        src="https://tibiaproposals.wordpress.com/wp-content/uploads/2019/08/stsmall215x235-pad210x230f8f8f8.lite-1u1.jpg" 
                        alt="You are dead" 
                        className="max-w-full max-h-full object-contain rounded"
                    />
                    <div className="absolute top-2 right-2">
                        <Skull size={24} className="text-red-600 drop-shadow-lg" />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-black text-red-600 font-serif tracking-widest mb-1 uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                You are dead.
            </h2>
            <p className="text-gray-400 text-xs mb-8 font-bold tracking-tighter">
                Alas! Brave hero, your journey was cut short by <span className="text-white italic">{report.killerName}</span>.
            </p>

            {/* Sumário de Perdas */}
            <div className="w-full space-y-2 mb-8">
                
                <div className="flex items-center justify-between bg-red-950/20 p-3 rounded border border-red-900/30 shadow-inner group transition-colors">
                    <div className="flex items-center gap-3">
                        <TrendingDown size={18} className="text-red-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Experience Lost</span>
                    </div>
                    <div className="text-lg font-mono font-black text-red-400">-{report.xpLoss.toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between bg-yellow-950/10 p-3 rounded border border-yellow-900/20 shadow-inner group transition-colors">
                    <div className="flex items-center gap-3">
                        <Coins size={18} className="text-yellow-600" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gold Lost</span>
                    </div>
                    <div className="text-lg font-mono font-black text-yellow-500">-{report.goldLoss.toLocaleString()} gp</div>
                </div>

                <div className="flex items-center justify-between bg-purple-950/10 p-3 rounded border border-purple-900/20 shadow-inner group transition-colors">
                    <div className="flex items-center gap-3">
                        <HeartCrack size={18} className="text-purple-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Level Penalty</span>
                    </div>
                    <div className="text-right">
                        <div className={`text-xs font-black ${report.levelDown ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                            {report.levelDown ? 'LEVEL REDUCED!' : 'KEPT LEVEL'}
                        </div>
                        <div className="text-[8px] text-gray-600 font-bold uppercase">
                            {report.hasBlessing ? 'Blessings Protected You' : 'No Blessings Active'}
                        </div>
                    </div>
                </div>

            </div>

            {/* Mensagem de Ajuda/Tip */}
            <div className="bg-black/60 border border-[#333] p-3 rounded text-[10px] text-gray-500 leading-relaxed italic mb-8 flex items-start gap-2">
                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                    {report.hasBlessing 
                        ? "Your blessings of the gods have been consumed, significantly reducing your losses. Rest well, hero." 
                        : "Tip: Visit Henricus in the Castle to purchase Blessings. They reduce Experience, Skill, and Gold loss upon death."}
                </span>
            </div>

            <button 
                onClick={onClose}
                className="tibia-btn w-full py-4 bg-red-950 hover:bg-red-900 text-white font-black text-lg border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)] tracking-[0.2em] transition-transform active:scale-95"
            >
                RESPAWN IN TEMPLE
            </button>
        </div>

        {/* Footer */}
        <div className="bg-black p-2 text-[8px] text-center text-red-900 font-mono tracking-widest uppercase border-t border-red-950">
            Souls never truly vanish, they just wander.
        </div>
      </div>
    </div>
  );
};
