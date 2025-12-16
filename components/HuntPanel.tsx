
import React, { useState } from 'react';
import { Monster, Boss, Player, HitSplat } from '../types';
import { MONSTERS, BOSSES, SHOP_ITEMS } from '../constants';
import { BattleScene } from './BattleScene';
import { BattleList } from './BattleList';
import { Info, X, Heart, Star, Swords, Coins, Shield, Flame, Snowflake, Zap, Mountain, Skull, AlertTriangle, Footprints } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HuntPanelProps {
  player: Player;
  activeHunt: string | null;
  activeMonster?: Monster; // Dynamic monster instance
  bossCooldowns: { [bossId: string]: number };
  onStartHunt: (monsterId: string, name: string, isBoss: boolean, count: number) => void;
  onStopHunt: () => void;
  currentMonsterHp?: number;
  hits: HitSplat[];
}

export const HuntPanel: React.FC<HuntPanelProps> = ({ 
  player,
  activeHunt,
  activeMonster, 
  bossCooldowns,
  onStartHunt, 
  onStopHunt, 
  currentMonsterHp,
  hits
}) => {
  const { t } = useLanguage();
  const [areaHuntModal, setAreaHuntModal] = useState<{monster: Monster, isOpen: boolean} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ id: string, name: string, isBoss: boolean } | null>(null);
  const [infoModal, setInfoModal] = useState<Monster | null>(null);
  const [areaHuntCount, setAreaHuntCount] = useState(2);

  // We rely on activeMonster from hook to show the real state.
  // Fallback to static monster only for modal inspection, NOT for BattleScene.
  
  const handleStartHuntRequest = (id: string, name: string, isBoss: boolean) => {
      if (activeHunt !== id) {
          setConfirmModal({ id, name, isBoss });
      }
  };

  const confirmHunt = () => {
      if (confirmModal) {
          onStartHunt(confirmModal.id, confirmModal.name, confirmModal.isBoss, 1);
          setConfirmModal(null);
      }
  };

  const openAreaHuntModal = (monster: Monster, e: React.MouseEvent) => {
      e.stopPropagation();
      setAreaHuntModal({ monster, isOpen: true });
      setAreaHuntCount(2);
  };

  const openInfoModal = (monster: Monster, e: React.MouseEvent) => {
    e.stopPropagation();
    setInfoModal(monster);
  };

  const startAreaHunt = () => {
      if (areaHuntModal) {
          onStartHunt(areaHuntModal.monster.id, areaHuntModal.monster.name, false, areaHuntCount);
          setAreaHuntModal(null);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#222]">
      
      {/* --- MODALS (Kept in Parent to cover full area) --- */}

      {/* Confirmation Modal */}
      {confirmModal && (
          <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
              <div className="tibia-panel w-full max-w-[250px] shadow-2xl p-4 text-center">
                  <div className="mb-4 text-gray-200 text-sm">
                      {t('hunt_confirm_title')} <br/>
                      <span className="font-bold text-yellow-500 text-lg">{confirmModal.name}</span>?
                  </div>
                  <div className="flex gap-2 justify-center">
                      <button 
                        onClick={confirmHunt}
                        className="tibia-btn px-4 py-1.5 font-bold text-green-300 border-green-900"
                      >
                          {t('hunt_btn_yes')}
                      </button>
                      <button 
                        onClick={() => setConfirmModal(null)}
                        className="tibia-btn px-4 py-1.5 font-bold text-red-300 border-red-900"
                      >
                          {t('hunt_btn_no')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Bestiary Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="tibia-panel w-full max-w-md shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Info size={16} className="text-blue-400"/>
                        <span className="font-bold text-[#eee] text-sm tracking-wide">Bestiary: {infoModal.name}</span>
                    </div>
                    <button onClick={() => setInfoModal(null)} className="text-[#aaa] hover:text-white font-bold p-1">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto bg-[#222] custom-scrollbar flex-1">
                    {/* Top Section: Sprite & Vital Stats */}
                    <div className="flex gap-4 mb-4">
                        <div className="w-24 h-24 bg-[#181818] border-2 border-[#333] flex items-center justify-center shadow-inner rounded relative overflow-hidden shrink-0">
                             <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
                             {infoModal.image ? <img src={infoModal.image} className="max-w-[80px] max-h-[80px] pixelated z-10 scale-[1.8]" /> : <Skull size={32} className="text-gray-500"/>}
                             {infoModal.level > player.level + 20 && (
                                 <div className="absolute bottom-1 right-1 bg-red-900/80 text-red-200 text-[9px] px-1 rounded font-bold border border-red-700">{t('hunt_danger')}</div>
                             )}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Heart size={10} className="text-red-500"/> Health</div>
                                <div className="text-lg font-bold text-gray-200">{infoModal.maxHp.toLocaleString()}</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Star size={10} className="text-yellow-500"/> Exp</div>
                                <div className="text-lg font-bold text-gray-200">{infoModal.exp.toLocaleString()}</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Swords size={10} className="text-gray-400"/> Attack</div>
                                <div className="text-sm font-bold text-gray-300">{infoModal.damageMin} - {infoModal.damageMax}</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Coins size={10} className="text-yellow-600"/> Gold</div>
                                <div className="text-sm font-bold text-yellow-500">{infoModal.minGold} - {infoModal.maxGold}</div>
                            </div>
                        </div>
                    </div>

                    {/* Elemental Resistances Grid */}
                    {infoModal.elements && (
                       <div className="mb-4">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-[#333] pb-1">Elemental Sensitivity</h4>
                          <div className="grid grid-cols-4 gap-2">
                             {[
                                 { key: 'physical', icon: <Shield size={12}/>, color: 'text-gray-400' },
                                 { key: 'fire', icon: <Flame size={12}/>, color: 'text-orange-500' },
                                 { key: 'ice', icon: <Snowflake size={12}/>, color: 'text-cyan-400' },
                                 { key: 'energy', icon: <Zap size={12}/>, color: 'text-purple-400' },
                                 { key: 'earth', icon: <Mountain size={12}/>, color: 'text-green-500' },
                                 { key: 'death', icon: <Skull size={12}/>, color: 'text-gray-200' },
                             ].map((el) => {
                                 const mult = infoModal.elements?.[el.key as any] ?? 1;
                                 let valColor = 'text-gray-500';
                                 
                                 if (mult > 1) { valColor = 'text-green-500'; }
                                 if (mult < 1) { valColor = 'text-red-500'; }
                                 if (mult === 0) { valColor = 'text-gray-600'; }

                                 return (
                                     <div key={el.key} className="bg-[#1a1a1a] border border-[#333] p-1.5 rounded flex flex-col items-center justify-center text-center" title={`${el.key}: x${mult}`}>
                                        <div className={`${el.color} mb-1`}>{el.icon}</div>
                                        <div className={`text-[9px] font-bold ${valColor}`}>{mult === 0 ? '0%' : `${mult}x`}</div>
                                     </div>
                                 );
                             })}
                          </div>
                       </div>
                    )}

                    {/* Visual Loot Table (Grid) */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-[#333] pb-1 flex justify-between">
                            <span>Loot Table</span>
                            <span className="text-[9px] normal-case opacity-50">Hover for details</span>
                        </h4>
                        
                        <div className="flex flex-wrap gap-1.5">
                            {infoModal.lootTable?.sort((a,b) => b.chance - a.chance).map((loot, idx) => {
                                const item = SHOP_ITEMS.find(i => i.id === loot.itemId);
                                let rarityColor = 'border-[#333] bg-[#222]';
                                if (loot.chance < 0.01) rarityColor = 'border-purple-900/50 bg-purple-900/10';
                                else if (loot.chance < 0.05) rarityColor = 'border-blue-900/50 bg-blue-900/10';
                                else if (loot.chance < 0.2) rarityColor = 'border-green-900/50 bg-green-900/10';

                                return (
                                    <div key={idx} className={`w-12 h-12 relative border rounded flex items-center justify-center group ${rarityColor}`}>
                                        {item?.image ? (
                                            <img src={item.image} className="max-w-[32px] max-h-[32px] pixelated" />
                                        ) : (
                                            <div className="text-[9px] text-gray-500">{loot.itemId.substring(0,2)}</div>
                                        )}
                                        
                                        <div className="absolute bottom-0 right-0 bg-black/80 text-[8px] text-gray-300 px-1 rounded-tl leading-none">
                                            {loot.chance < 0.01 ? '<1%' : `${Math.round(loot.chance*100)}%`}
                                        </div>

                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-32 bg-black border border-gray-600 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 text-center">
                                            <div className="font-bold text-white mb-0.5">{item?.name || loot.itemId}</div>
                                            <div className="text-yellow-500 font-mono">{(loot.chance * 100).toFixed(2)}%</div>
                                            {item?.sellPrice && <div className="text-gray-400 text-[9px] mt-1">{item.sellPrice} gp</div>}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!infoModal.lootTable || infoModal.lootTable.length === 0) && (
                                <div className="text-xs text-gray-600 italic p-2">No known loot.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Area Hunt Modal - "CAÇAR LURANDO" */}
      {areaHuntModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="tibia-panel w-full max-w-[300px] shadow-2xl p-0 overflow-hidden">
                <div className="bg-red-900/20 border-b border-red-900/50 px-3 py-3 flex justify-between items-center mb-0">
                    <span className="font-bold text-red-200 text-sm flex items-center gap-2">
                        <Footprints size={16} /> {t('hunt_lure_title')}
                    </span>
                    <button onClick={() => setAreaHuntModal(null)} className="text-red-400 hover:text-white font-bold text-sm px-2">X</button>
                </div>
                
                <div className="p-4 space-y-5 bg-[#222]">
                    <div className="text-center">
                        <h3 className="text-gray-200 font-bold text-lg mb-1">{areaHuntModal.monster.name}</h3>
                        <p className="text-[11px] text-gray-500">{t('hunt_lure_desc')}</p>
                    </div>

                    <div className="flex items-center justify-between bg-[#1a1a1a] p-4 border border-[#333] rounded shadow-inner">
                        <button 
                          className="tibia-btn w-10 h-10 font-bold text-xl hover:bg-[#333]"
                          onClick={() => setAreaHuntCount(Math.max(2, areaHuntCount - 1))}
                        >-</button>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-500 drop-shadow-md">{areaHuntCount}</div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{t('hunt_lure_creatures')}</div>
                        </div>
                        <button 
                          className="tibia-btn w-10 h-10 font-bold text-xl hover:bg-[#333]"
                          onClick={() => setAreaHuntCount(Math.min(8, areaHuntCount + 1))}
                        >+</button>
                    </div>

                    <div className="text-[11px] text-red-300 bg-red-950/30 border border-red-900/30 p-3 rounded leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-2 font-bold text-red-200 border-b border-red-900/30 pb-1">
                            <AlertTriangle size={14}/> {t('hunt_lure_warn_title')}
                        </div>
                        {t('hunt_lure_warn_desc')}
                        <span className="block mt-2 text-yellow-500/90 font-bold">
                           {t('hunt_lure_warn_tip')}
                        </span>
                    </div>
                    
                    <button 
                        onClick={startAreaHunt}
                        className="tibia-btn w-full py-3 font-bold text-sm text-red-100 bg-red-900 hover:bg-red-800 border-red-950 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Swords size={16} /> {t('hunt_lure_btn')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- SUB COMPONENTS --- */}
      
      <BattleScene 
        player={player}
        activeMonster={activeMonster} // Pass exact instance from hook, undefined means idle/searching
        activeHuntCount={player.activeHuntCount}
        currentMonsterHp={currentMonsterHp || 0}
        hits={hits}
        onStopHunt={onStopHunt}
        isHunting={!!activeHunt} // New Prop to show "Searching..." state
      />

      <BattleList 
        player={player}
        activeHunt={activeHunt}
        bossCooldowns={bossCooldowns}
        onStartHunt={handleStartHuntRequest}
        onInspectMonster={openInfoModal}
        onAreaHunt={openAreaHuntModal}
      />

    </div>
  );
};
