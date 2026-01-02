
import React, { useState } from 'react';
import { Player, Monster } from '../types';
import { MONSTERS, BOSSES } from '../constants';
import { Search, X, Info, Swords, Footprints, Clock, CheckCircle2, Lock, Map as MapIcon, ChevronLeft, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprite } from './common/Sprite';

interface BattleListProps {
  player: Player;
  activeHunt: string | null;
  bossCooldowns: { [bossId: string]: number };
  onStartHunt: (id: string, name: string, isBoss: boolean) => void;
  onInspectMonster: (monster: Monster, e: React.MouseEvent) => void;
  onAreaHunt: (monster: Monster, e: React.MouseEvent) => void;
}

const CITIES = [
  { id: 1, name: 'Rookgaard', map: 'https://static.wikia.nocookie.net/tibia/images/a/aa/Rookgaard_map.jpg/revision/latest?cb=20110723031352&path-prefix=en&format=original' },
  { id: 2, name: 'Thais', map: 'https://static.wikia.nocookie.net/tibia/images/f/f4/Map_thais.jpg/revision/latest?cb=20111204213324&path-prefix=en&format=original' },
  { id: 3, name: 'Venore', map: 'https://www.tibiawiki.com.br/images/b/b4/Map_venore.jpg' },
  { id: 4, name: 'Ankrahmun', map: 'https://static.wikia.nocookie.net/tibia/images/c/c2/Map_of_Ankrahmun.jpg/revision/latest?cb=20111204213903&path-prefix=en' },
  { id: 5, name: 'Darashia', map: 'https://static.wikia.nocookie.net/tibia/images/7/75/Map_darashia.jpg/revision/latest?cb=20111204213730&path-prefix=en&format=original' },
  { id: 6, name: 'Edron', map: 'https://static.wikia.nocookie.net/tibia/images/b/be/Map_edron.jpg/revision/latest?cb=20111204213705&path-prefix=en' },
  { id: 7, name: 'Roshamuul', map: 'https://static.wikia.nocookie.net/tibia/images/c/c4/Roshamuul_Map.jpg/revision/latest?cb=20131211112130&path-prefix=en&format=original' },
  { id: 8, name: 'Issavi', map: 'https://static.wikia.nocookie.net/tibia/images/8/88/Issavi_Map.jpg/revision/latest?cb=20220603195812&path-prefix=en&format=original' },
];

export const BattleList: React.FC<BattleListProps> = ({
  player,
  activeHunt,
  bossCooldowns,
  onStartHunt,
  onInspectMonster,
  onAreaHunt
}) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'monsters' | 'bosses'>('monsters');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Mapeamento interno de níveis para cidades (Tiers)
  const getMonsterTier = (level: number): number => {
    if (level <= 8) return 1;
    if (level <= 19) return 2;
    if (level <= 39) return 3;
    if (level <= 99) return 4;
    if (level <= 199) return 5;
    if (level <= 299) return 6;
    if (level <= 399) return 7;
    return 8;
  };

  const filteredMonsters = MONSTERS.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCityId === null || getMonsterTier(m.level) === selectedCityId;
    return matchesSearch && matchesCity;
  }).sort((a, b) => a.exp - b.exp);
  
  const filteredBosses = BOSSES.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCity = CITIES.find(c => c.id === selectedCityId);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d0d0d]">
      {/* Tab Switcher */}
      <div className="flex bg-[#1a1a1a] border-b border-[#333] shrink-0 p-1">
         <button 
           onClick={() => setTab('monsters')}
           className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${tab === 'monsters' ? 'text-yellow-500 bg-[#252525] shadow-md' : 'text-[#555] hover:text-[#888]'}`}
         >
           Hunting Grounds
         </button>
         <button 
           onClick={() => setTab('bosses')}
           className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${tab === 'bosses' ? 'text-purple-400 bg-[#252525] shadow-md' : 'text-[#555] hover:text-[#888]'}`}
         >
           Daily Bosses
         </button>
      </div>

      {/* Navigation & Search (Visible when list is open) */}
      {(tab === 'bosses' || (tab === 'monsters' && selectedCityId !== null)) && (
        <div className="bg-[#1a1a1a] border-b border-[#333] p-2 flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2 duration-200">
            {tab === 'monsters' && (
              <button 
                onClick={() => { setSelectedCityId(null); setSearchTerm(''); }}
                className="p-1.5 tibia-btn bg-[#222] border-[#444] text-yellow-600 hover:text-yellow-400"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input 
                  type="text"
                  placeholder={tab === 'bosses' ? "Search boss..." : "Search monster..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-[#333] rounded px-8 py-1.5 text-[11px] text-gray-300 focus:outline-none focus:border-yellow-900/50"
                />
                {searchTerm && <X size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer" onClick={() => setSearchTerm('')} />}
            </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 overflow-hidden relative">
        {tab === 'monsters' && selectedCityId === null ? (
            /* COMPACT CITY GRID - 2x4 No Scroll Design */
            <div className="absolute inset-0 grid grid-cols-2 gap-1.5 p-1.5 h-full animate-in fade-in duration-500">
                {CITIES.map((city) => (
                    <button
                        key={city.id}
                        onClick={() => setSelectedCityId(city.id)}
                        className="relative flex flex-col group overflow-hidden rounded border border-[#333] hover:border-yellow-600/50 transition-all shadow-lg active:scale-95"
                    >
                        {/* Imagem do Mapa */}
                        <div className="absolute inset-0 bg-black">
                            <img 
                                src={city.map} 
                                className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                                alt={city.name}
                            />
                            {/* Gradiente Interno */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        </div>

                        {/* Label da Cidade */}
                        <div className="mt-auto p-2 relative z-10 w-full text-left">
                            <div className="flex items-center justify-between">
                                <span className="font-black text-white text-[10px] uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)] group-hover:text-yellow-500 transition-colors">
                                    {city.name}
                                </span>
                                <Navigation size={10} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </div>

                        {/* Overlay Glow no Hover */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-yellow-600/0 group-hover:border-yellow-600/10 transition-all"></div>
                    </button>
                ))}
            </div>
        ) : (
            /* MONSTER LIST VIEW */
            <div className="h-full overflow-y-auto custom-scrollbar p-1">
                {tab === 'monsters' ? (
                    <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-[#111] p-2 flex items-center justify-between border-b border-yellow-900/10 mb-1">
                            <span className="text-[9px] font-black text-yellow-700 uppercase tracking-[0.3em]">{selectedCity?.name} Grounds</span>
                        </div>
                        {filteredMonsters.map(monster => {
                            const isActive = activeHunt === monster.id;
                            return (
                                <div
                                    key={monster.id}
                                    onClick={() => onStartHunt(monster.id, monster.name, false)}
                                    className={`flex items-center p-2 cursor-pointer transition-all border border-transparent rounded-sm mb-0.5 ${isActive ? 'bg-[#1a1a1a] border-green-900/30' : 'hover:bg-[#151515] bg-[#0d0d0d]'}`}
                                >
                                    <div className={`w-11 h-11 bg-black border ${isActive ? 'border-green-600/40' : 'border-[#333]'} flex items-center justify-center shrink-0 mr-3 rounded shadow-inner overflow-hidden`}>
                                        <Sprite src={monster.image} type="monster" size={36} className="pixelated drop-shadow-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${isActive ? 'text-green-400' : 'text-gray-300'}`}>{monster.name}</span>
                                            {monster.level > player.level + 20 && <span className="text-[8px] text-red-500 font-black animate-pulse">!</span>}
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-mono">Lvl {monster.level}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={(e) => onInspectMonster(monster, e)} className="p-1.5 tibia-btn bg-blue-950/20 border-blue-900/40 text-blue-500 hover:text-blue-300 rounded"><Info size={14}/></button>
                                        <button onClick={(e) => onAreaHunt(monster, e)} className="p-1.5 tibia-btn bg-red-950/20 border-red-900/40 text-red-500 hover:text-red-300 rounded"><Footprints size={14}/></button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onStartHunt(monster.id, monster.name, false); }} 
                                            className={`px-3 py-1.5 tibia-btn font-black text-[9px] uppercase rounded ${isActive ? 'bg-green-800 text-white' : 'bg-[#222] text-gray-400'}`}
                                        >
                                            <Swords size={12} className="mr-1 inline" /> {isActive ? 'Fighting' : 'Hunt'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* BOSS LIST VIEW */
                    <div className="flex flex-col gap-2 p-1 animate-in slide-in-from-left-4 duration-300">
                        {filteredBosses.map(boss => {
                            const isActive = activeHunt === boss.id;
                            const onCooldown = (bossCooldowns[boss.id] || 0) > Date.now();
                            return (
                                <div key={boss.id} className={`p-3 rounded border flex items-center justify-between transition-all ${isActive ? 'border-purple-600 bg-purple-950/10' : onCooldown ? 'opacity-40 border-[#222]' : 'border-[#333] bg-[#111] hover:border-purple-900/50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-black border border-purple-900/20 rounded flex items-center justify-center">
                                            <Sprite src={boss.image} type="monster" size={40} className="drop-shadow-md" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-purple-200 uppercase">{boss.name}</div>
                                            <div className="text-[9px] text-gray-500 flex items-center gap-1">
                                                {onCooldown ? <><Clock size={10}/> Cooldown</> : <><CheckCircle2 size={10} className="text-green-500"/> Available</>}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={onCooldown}
                                        onClick={() => onStartHunt(boss.id, boss.name, true)}
                                        className={`px-4 py-2 tibia-btn text-[10px] font-black uppercase rounded ${onCooldown ? 'bg-black text-gray-700 cursor-not-allowed' : 'bg-purple-900 text-white border-purple-500'}`}
                                    >
                                        Challenge
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
