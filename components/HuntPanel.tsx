
import React, { useState } from 'react';
import { Monster, Boss, Player, HitSplat, Item } from '../types';
import { MONSTERS, BOSSES, SHOP_ITEMS } from '../constants';
import { BattleScene } from './BattleScene';
import { BattleList } from './BattleList';
import { Info, X, Heart, Star, Swords, Coins, Shield, Flame, Snowflake, Zap, Mountain, Skull, AlertTriangle, Footprints, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprite } from './common/Sprite';
import { ItemTooltip } from './ItemTooltip';

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
  
  // States for the global tooltip
  const [hoverItem, setHoverItem] = useState<Item | null>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

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

  const handleLootHover = (item: Item | undefined, e: React.MouseEvent) => {
    if (item) {
        setHoverItem(item);
        setHoverPos({ x: e.clientX, y: e.clientY });
    } else {
        setHoverItem(null);
        setHoverPos(null);
    }
  };

  const getLootRarityLabel = (chance: number) => {
      if (chance >= 0.1) return { 
          label: 'Comum', 
          color: 'text-gray-400', 
          border: 'border-gray-600', 
          bg: 'bg-black/20',
          shadow: '' 
      };
      if (chance >= 0.05) return { 
          label: 'Incomum', 
          color: 'text-green-400', 
          border: 'border-green-500', 
          bg: 'bg-green-950/20',
          shadow: 'shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]' 
      };
      if (chance >= 0.01) return { 
          label: 'Raro', 
          color: 'text-blue-400', 
          border: 'border-blue-500', 
          bg: 'bg-blue-950/20',
          shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.4)]' 
      };
      if (chance >= 0.005) return { 
          label: 'Super Raro', 
          color: 'text-purple-400', 
          border: 'border-purple-500', 
          bg: 'bg-purple-950/30',
          shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
      };
      return { 
          label: 'Extremo', 
          color: 'text-orange-500', 
          border: 'border-orange-500', 
          bg: 'bg-orange-950/40',
          shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse' 
      };
  };

  return (
    <div className="flex flex-col h-full bg-[#222]">
      
      {/* Global Bound-Aware Tooltip */}
      <ItemTooltip item={hoverItem} position={hoverPos} />

      {/* --- MODALS --- */}

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
                    <div className="flex gap-4 mb-6">
                        <div className="w-28 h-28 bg-[#181818] border-2 border-[#333] flex items-center justify-center shadow-inner rounded relative overflow-hidden shrink-0">
                             <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)]"></div>
                             <Sprite 
                                src={infoModal.image} 
                                type="monster" 
                                size={64} 
                                className="scale-[2.2] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                             />
                             {infoModal.level > player.level + 20 && (
                                 <div className="absolute bottom-1 right-1 bg-red-900/80 text-red-200 text-[9px] px-1 rounded font-bold border border-red-700">{t('hunt_danger')}</div>
                             )}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Heart size={10} className="text-red-500"/> Saúde</div>
                                <div className="text-lg font-bold text-gray-200">{infoModal.maxHp.toLocaleString()}</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Star size={10} className="text-yellow-500"/> Exp</div>
                                <div className="text-lg font-bold text-gray-200">{infoModal.exp.toLocaleString()}</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Swords size={10} className="text-gray-400"/> Ataque</div>
                                <div className="text-sm font-bold text-gray-300">{infoModal.damageMin} - {infoModal.damageMax}</div>
                            </div>
                            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] flex flex-col justify-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Coins size={10} className="text-yellow-600"/> Ouro</div>
                                <div className="text-sm font-bold text-yellow-500">{infoModal.minGold} - {infoModal.maxGold}</div>
                            </div>
                        </div>
                    </div>

                    {/* Elemental Resistances Grid */}
                    {infoModal.elements && (
                       <div className="mb-6">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-[#333] pb-1">Sensibilidade Elemental</h4>
                          <div className="grid grid-cols-4 gap-2">
                             {[
                                 { key: 'physical', icon: <Shield size={12}/>, color: 'text-gray-400' },
                                 { key: 'fire', icon: <Flame size={12}/>, color: 'text-orange-500' },
                                 { key: 'ice', icon: <Snowflake size={12}/>, color: 'text-cyan-400' },
                                 { key: 'energy', icon: <Zap size={12}/>, color: 'text-purple-400' },
                                 { key: 'earth', icon: <Mountain size={12}/>, color: 'text-green-500' },
                                 { key: 'death', icon: <Skull size={12}/>, color: 'text-gray-200' },
                                 { key: 'holy', icon: <Sparkles size={12}/>, color: 'text-yellow-200' },
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
                            <span>Tabela de Loot</span>
                            <span className="text-[9px] normal-case opacity-50 italic">Passe o mouse p/ detalhes</span>
                        </h4>
                        
                        <div className="grid grid-cols-5 gap-2">
                            {infoModal.lootTable?.sort((a,b) => b.chance - a.chance).map((loot, idx) => {
                                const item = SHOP_ITEMS.find(i => i.id === loot.itemId);
                                const rarity = getLootRarityLabel(loot.chance);

                                return (
                                    <div 
                                        key={idx} 
                                        onMouseEnter={(e) => handleLootHover(item, e)}
                                        onMouseLeave={(e) => handleLootHover(undefined, e)}
                                        className={`aspect-square relative border-2 rounded-md flex items-center justify-center group transition-all duration-300 ${rarity.bg} ${rarity.border} ${rarity.shadow} hover:scale-110 cursor-help active:scale-95`}
                                    >
                                        <Sprite 
                                            src={item?.image} 
                                            alt={item?.name || loot.itemId} 
                                            size={32} 
                                            className="max-w-[32px] max-h-[32px] drop-shadow-md" 
                                        />
                                        
                                        <div className={`absolute -bottom-1 inset-x-0 mx-auto w-[90%] bg-black/80 text-[7px] py-0.5 rounded border ${rarity.border} leading-none font-black uppercase text-center ${rarity.color} z-10`}>
                                            {rarity.label}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!infoModal.lootTable || infoModal.lootTable.length === 0) && (
                                <div className="col-span-5 text-xs text-gray-600 italic p-4 text-center">Nenhum loot registrado no bestiário.</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer Tip */}
                <div className="bg-[#1a1a1a] p-2 border-t border-[#333] text-center">
                    <p className="text-[9px] text-gray-600 italic">Dica: Tooltips agora se ajustam automaticamente à tela.</p>
                </div>
            </div>
        </div>
      )}

      {/* Area Hunt Modal */}
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
        activeMonster={activeMonster} 
        activeHuntCount={player.activeHuntCount}
        currentMonsterHp={currentMonsterHp || 0}
        hits={hits}
        onStopHunt={onStopHunt}
        isHunting={!!activeHunt} 
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
