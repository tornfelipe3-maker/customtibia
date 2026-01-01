
import React, { useState, useEffect } from 'react';
import { StorageService, GlobalDeath } from '../services/storage';
import { Skull, X, History, Clock, MapPin } from 'lucide-react';

interface DeathLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeathLogModal: React.FC<DeathLogModalProps> = ({ isOpen, onClose }) => {
  const [deaths, setDeaths] = useState<GlobalDeath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
        const fetchDeaths = async () => {
            setLoading(true);
            const data = await StorageService.getLatestDeaths();
            setDeaths(data);
            setLoading(false);
        };
        fetchDeaths();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="tibia-panel w-full max-w-2xl h-[500px] flex flex-col shadow-2xl relative bg-[#1a0a0a]">
        
        {/* Header */}
        <div className="bg-[#2d0a0a] border-b border-red-900/50 px-4 py-3 flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2">
                <Skull size={20} className="text-red-500 animate-pulse"/>
                <div>
                    <h2 className="font-bold text-red-200 text-lg font-serif tracking-wide leading-none">Deathlog Global</h2>
                    <span className="text-[10px] text-red-500/70 uppercase tracking-wider">Últimas 50 baixas no servidor</span>
                </div>
            </div>
            <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-black/40">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                    <div className="w-8 h-8 border-2 border-t-red-600 border-gray-900 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Lendo pergaminhos de óbito...</span>
                </div>
            ) : deaths.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-gray-500 italic">
                    <History size={48} className="mb-2" />
                    Nenhuma morte registrada recentemente. Paz no mundo!
                </div>
            ) : (
                <div className="space-y-2">
                    {deaths.map(death => (
                        <div key={death.id} className="p-3 bg-red-950/10 border border-red-900/20 rounded flex items-center justify-between hover:bg-red-900/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="text-red-500 opacity-50"><Skull size={18}/></div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200">
                                        <span className="text-red-400">Died:</span> {death.player_name}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">
                                        Level {death.level} • {death.vocation}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-300 italic">
                                    Killed by <span className="text-white font-bold">{death.killer_name}</span>
                                </div>
                                <div className="text-[9px] text-gray-600 flex items-center justify-end gap-1 mt-1">
                                    <Clock size={10}/> {new Date(death.created_at).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="bg-[#0a0a0a] p-2 text-center border-t border-red-900/30">
            <p className="text-[8px] text-red-900 font-mono tracking-widest uppercase italic">
                Requiescat in pace.
            </p>
        </div>
      </div>
    </div>
  );
};
