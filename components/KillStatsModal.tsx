
import React, { useState, useEffect } from 'react';
import { StorageService, MonsterStat } from '../services/storage';
import { MONSTERS, BOSSES } from '../constants';
import { Skull, X, BarChart3, TrendingUp, Info } from 'lucide-react';
import { Sprite } from './common/Sprite';

interface KillStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KillStatsModal: React.FC<KillStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<MonsterStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
        const fetchStats = async () => {
            setLoading(true);
            const data = await StorageService.getGlobalMonsterStats();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="tibia-panel w-full max-w-2xl h-[500px] flex flex-col shadow-2xl relative bg-[#1a1a1a]">
        
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-3 flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-red-500"/>
                <div>
                    <h2 className="font-bold text-[#eee] text-lg font-serif tracking-wide leading-none">Kill Statistics</h2>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total abates globais por espécie</span>
                </div>
            </div>
            <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] bg-repeat bg-opacity-5">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                    <div className="w-8 h-8 border-2 border-t-red-500 border-gray-800 rounded-full animate-spin"></div>
                    <span className="text-xs uppercase font-bold tracking-widest">Sincronizando abates...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {stats.map(stat => {
                        const monster = MONSTERS.find(m => m.id === stat.monster_id) || BOSSES.find(b => b.id === stat.monster_id);
                        if (!monster) return null;

                        return (
                            <div key={stat.monster_id} className="flex items-center justify-between p-3 bg-black/40 border border-[#333] rounded hover:border-red-900/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#111] border border-[#444] rounded flex items-center justify-center overflow-hidden shrink-0">
                                        <Sprite src={monster.image} size={32} className="pixelated drop-shadow-md group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">{monster.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Espécie Identificada</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-mono font-black text-red-400">{stat.kill_count.toLocaleString()}</div>
                                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                                        <TrendingUp size={10}/> Abates Confirmados
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <div className="p-2 bg-[#111] border-t border-[#333] text-center">
            <p className="text-[9px] text-gray-600 italic flex items-center justify-center gap-1">
                <Info size={12} /> Os dados de abates são sincronizados a cada 30 segundos.
            </p>
        </div>
      </div>
    </div>
  );
};
