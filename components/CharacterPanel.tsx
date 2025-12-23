
import React, { useState } from 'react';
import { Player, EquipmentSlot, Item, SkillType, PlayerSettings, Vocation, Rarity } from '../types';
import { SHOP_ITEMS, MAX_BACKPACK_SLOTS } from '../constants';
import { getReforgeCost, getEffectiveMaxHp, getEffectiveMaxMana } from '../services';
import { Shield, Backpack, User, EyeOff, Trash2, Sun, Sparkles, Sword, Crosshair, Zap, Hammer, HandMetal, RefreshCw, BarChart2, Activity } from 'lucide-react';
import { ItemTooltip } from './ItemTooltip';
import { useLanguage } from '../contexts/LanguageContext';
import { EquipmentSlotView } from './EquipmentSlot';
import { SkillBar } from './SkillBar';

interface CharacterPanelProps {
  player: Player;
  onUpdateSettings: (settings: PlayerSettings) => void;
  onEquipItem: (item: Item) => void;
  onDepositItem: (item: Item) => void;
  onDiscardItem: (item: Item) => void;
  onToggleSkippedLoot: (itemId: string) => void;
  onUnequipItem?: (slot: EquipmentSlot) => void;
  onReforgeItem?: (item: Item) => void;
  onToggleAnalyzer?: () => void; 
  onToggleStats?: () => void; // Novo
}

const getRarityColor = (rarity?: Rarity) => {
    switch (rarity) {
        case 'legendary': return 'border-orange-500 shadow-[inset_0_0_8px_rgba(249,115,22,0.5)]';
        case 'epic': return 'border-purple-500 shadow-[inset_0_0_5px_rgba(168,85,247,0.4)]';
        case 'rare': return 'border-blue-400 shadow-[inset_0_0_3px_rgba(96,165,250,0.3)]';
        case 'uncommon': return 'border-green-500';
        default: return 'border-[#3a3a3a] hover:border-[#555]';
    }
};

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ 
    player, onUpdateSettings, onEquipItem, onDepositItem, onDiscardItem, 
    onToggleSkippedLoot, onUnequipItem, onReforgeItem, onToggleAnalyzer, onToggleStats 
}) => {
  const { t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [hoverItem, setHoverItem] = useState<Item | null>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  // --- CALCULATE EFFECTIVE TOTALS ---
  const effMaxHp = getEffectiveMaxHp(player);
  const effMaxMana = getEffectiveMaxMana(player);

  const getXpPercentage = () => Math.min(100, (player.currentXp / player.maxXp) * 100);
  const getHpPercentage = () => Math.min(100, (player.hp / effMaxHp) * 100);
  const getManaPercentage = () => Math.min(100, (player.mana / effMaxMana) * 100);

  const getSkillBonus = (skill: SkillType) => {
    let bonus = 0;
    (Object.values(player.equipment) as (Item | undefined)[]).forEach(item => {
      if (item?.skillBonus?.[skill]) bonus += item.skillBonus[skill]!;
    });
    return bonus > 0 ? bonus : undefined;
  };

  const handleInventoryClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    const isSelected = selectedItem && (item.uniqueId ? selectedItem.uniqueId === item.uniqueId : selectedItem.id === item.id);
    if (isSelected) {
        setSelectedItem(null);
        setMenuPosition(null);
    } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setSelectedItem(item);
        setMenuPosition({ x: rect.right, y: rect.top });
    }
  };

  const handleHover = (item: Item | null, e: React.MouseEvent) => {
      if (item) {
          setHoverItem(item);
          setHoverPos({ x: e.clientX, y: e.clientY });
      } else {
          setHoverItem(null);
          setHoverPos(null);
      }
  };

  const isSkipped = (itemId: string) => player.skippedLoot.includes(itemId);

  const getVocationName = () => {
      if (!player.promoted) return player.vocation;
      switch(player.vocation) {
          case Vocation.KNIGHT: return 'Elite Knight';
          case Vocation.PALADIN: return 'Royal Paladin';
          case Vocation.SORCERER: return 'Master Sorcerer';
          case Vocation.DRUID: return 'Elder Druid';
          default: return player.vocation;
      }
  };

  const xpRemaining = player.maxXp - player.currentXp;
  const xpTooltip = `${t('skill_xp')}: ${getXpPercentage().toFixed(2)}%\nXP: ${player.currentXp.toLocaleString()} / ${player.maxXp.toLocaleString()}\n${t('lbl_remaining')}: ${xpRemaining.toLocaleString()}`;
  
  const totalSlotsUsed = Object.keys(player.inventory).length + (player.uniqueInventory?.length || 0);

  return (
    <div className="flex flex-col h-full bg-[#181818] select-none text-[#ccc]" onClick={() => { setSelectedItem(null); setMenuPosition(null); }}>
      <ItemTooltip item={hoverItem} position={hoverPos} />

      {/* Floating Menu */}
      {selectedItem && menuPosition && (
          <div 
             className="fixed z-[120] w-36 bg-[#2d2d2d] border border-[#666] flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden animate-in fade-in zoom-in duration-100"
             style={{ top: menuPosition.y, left: menuPosition.x - 160 }} 
             onClick={(e) => e.stopPropagation()}
          >
             <div className="bg-[#222] px-2 py-1 text-[10px] font-bold text-gray-400 border-b border-[#444] truncate">{selectedItem.name}</div>
             <button className="px-3 py-2.5 text-xs hover:bg-[#444] text-white text-left border-b border-[#444]" onClick={(e) => { e.stopPropagation(); onEquipItem(selectedItem); setSelectedItem(null); }}>Equip / Use</button>
             
             {/* Reforge Option */}
             {selectedItem.uniqueId && onReforgeItem && (
                 <button 
                    className="px-3 py-2.5 text-xs hover:bg-[#331133] text-purple-300 text-left border-b border-[#444] flex flex-col justify-center items-start group" 
                    onClick={(e) => { e.stopPropagation(); onReforgeItem(selectedItem); setSelectedItem(null); }}
                 >
                    <div className="flex items-center gap-1 font-bold"><RefreshCw size={10}/> REFORGE</div>
                    <span className="text-[10px] text-gray-400 group-hover:text-purple-200">Cost: {getReforgeCost(selectedItem.rarity)} Tokens</span>
                 </button>
             )}

             <button className="px-3 py-2.5 text-xs hover:bg-[#444] text-white text-left border-b border-[#444]" onClick={(e) => { e.stopPropagation(); onDepositItem(selectedItem); setSelectedItem(null); }}>{selectedItem.uniqueId ? 'Deposit' : 'Deposit All'}</button>
             
             <button className="px-3 py-2.5 text-xs hover:bg-[#444] text-white text-left border-b border-[#444] flex items-center justify-between" onClick={(e) => { e.stopPropagation(); onToggleSkippedLoot(selectedItem.id); setSelectedItem(null); }}><span>{isSkipped(selectedItem.id) ? "Loot Item" : "Ignore Loot"}</span><EyeOff size={12} /></button>
             <button className="px-3 py-2.5 text-xs hover:bg-[#522] text-red-300 text-left flex items-center justify-between" onClick={(e) => { e.stopPropagation(); onDiscardItem(selectedItem); setSelectedItem(null); }}><span>Drop Item</span><Trash2 size={12} /></button>
          </div>
      )}

      {/* --- STATS HEADER --- */}
      <div className="bg-[#222] border-b border-[#333] p-3 shrink-0 shadow-md z-10">
         <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#fff] text-sm tracking-wide">{player.name}</span>
                {player.hasBlessing && <Sun size={12} className="text-yellow-400 fill-yellow-400/20" />}
            </div>
            <span className="text-[10px] text-[#888] font-bold bg-[#111] px-1.5 py-0.5 rounded border border-[#333]">{getVocationName()} ({t('lbl_level')} {player.level})</span>
         </div>

         {/* HP/Mana Bars */}
         <div className="space-y-1.5">
            <div className="h-4 w-full bg-[#0a0a0a] border border-[#333] relative rounded-sm overflow-hidden">
                <div className="bg-gradient-to-r from-red-800 to-red-600 h-full absolute left-0 transition-all duration-300" style={{width: `${getHpPercentage()}%`}}></div>
                <div className="absolute inset-0 text-[9px] flex items-center justify-center text-white font-bold leading-none drop-shadow-md z-10">{Math.floor(player.hp)} / {effMaxHp}</div>
            </div>
            <div className="h-4 w-full bg-[#0a0a0a] border border-[#333] relative rounded-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 h-full absolute left-0 transition-all duration-300" style={{width: `${getManaPercentage()}%`}}></div>
                <div className="absolute inset-0 text-[9px] flex items-center justify-center text-white font-bold leading-none drop-shadow-md z-10">{Math.floor(player.mana)} / {effMaxMana}</div>
            </div>
         </div>

         <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-400 font-bold">
             <div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${totalSlotsUsed >= MAX_BACKPACK_SLOTS ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></span> Cap: {totalSlotsUsed}/{MAX_BACKPACK_SLOTS}</div>
             <div className="flex items-center gap-2">
                 <div className="text-purple-400 flex items-center gap-1" title="Forge Tokens">
                    <RefreshCw size={10} /> {(player.inventory['forge_token'] || 0)}
                 </div>
                 <div className="text-yellow-500 bg-yellow-900/10 px-2 py-0.5 rounded border border-yellow-900/30">{player.gold.toLocaleString()} gp</div>
             </div>
         </div>
      </div>

      {/* --- EQUIPMENT GRID --- */}
      <div className="p-3 bg-[#1e1e1e] border-b border-[#333] flex justify-center shrink-0">
          <div className="grid grid-cols-3 gap-2 relative p-2 bg-[#151515] rounded border border-[#2a2a2a] shadow-inner">
                <div className="col-start-1 row-start-1"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.NECK)} item={player.equipment[EquipmentSlot.NECK]} slot={EquipmentSlot.NECK} /></div>
                <div className="col-start-2 row-start-1"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.HEAD)} item={player.equipment[EquipmentSlot.HEAD]} slot={EquipmentSlot.HEAD} /></div>
                <div className="col-start-3 row-start-1"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.AMMO)} item={player.equipment[EquipmentSlot.AMMO]} slot={EquipmentSlot.AMMO} /></div>
                
                <div className="col-start-1 row-start-2"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.HAND_LEFT)} item={player.equipment[EquipmentSlot.HAND_LEFT]} slot={EquipmentSlot.HAND_LEFT} /></div>
                <div className="col-start-2 row-start-2"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.BODY)} item={player.equipment[EquipmentSlot.BODY]} slot={EquipmentSlot.BODY} /></div>
                <div className="col-start-3 row-start-2"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.HAND_RIGHT)} item={player.equipment[EquipmentSlot.HAND_RIGHT]} slot={EquipmentSlot.HAND_RIGHT} /></div>
                
                <div className="col-start-1 row-start-3"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.RING)} item={player.equipment[EquipmentSlot.RING]} slot={EquipmentSlot.RING} /></div>
                <div className="col-start-2 row-start-3"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.LEGS)} item={player.equipment[EquipmentSlot.LEGS]} slot={EquipmentSlot.LEGS} /></div>
                <div className="col-start-3 row-start-3 opacity-0"></div>

                <div className="col-start-2 row-start-4"><EquipmentSlotView onHover={handleHover} onClick={() => onUnequipItem && onUnequipItem(EquipmentSlot.FEET)} item={player.equipment[EquipmentSlot.FEET]} slot={EquipmentSlot.FEET} /></div>
          </div>
      </div>

      {/* --- SCROLLABLE CONTENT (BACKPACK + SKILLS) --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-[#181818]">
          
          {/* Backpack Section */}
          <div className="mb-4">
             <div className="text-[11px] font-bold text-[#888] uppercase mb-2 flex items-center justify-between border-b border-[#333] pb-1">
                 <div className="flex items-center gap-2">
                    <Backpack size={12} className="text-gray-500" /> {t('char_backpack')}
                 </div>
                 <div className="flex gap-1">
                    {onToggleStats && (
                        <button 
                            onClick={onToggleStats} 
                            className="tibia-btn px-2 py-0.5 text-[9px] flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#333] border-gray-600 text-cyan-300 hover:text-white" 
                            title="Live Bonus Stats"
                        >
                            <Activity size={10} /> STATS
                        </button>
                    )}
                    {onToggleAnalyzer && (
                        <button 
                            onClick={onToggleAnalyzer} 
                            className="tibia-btn px-2 py-0.5 text-[9px] flex items-center gap-1 bg-[#2a2a2a] hover:bg-[#333] border-gray-600 text-gray-300 hover:text-white" 
                            title="Hunt Analytics"
                        >
                            <BarChart2 size={10} /> ANALYZER
                        </button>
                    )}
                 </div>
             </div>
             
             {/* 
                BACKPACK GRID with Internal Scroll 
                Height calculation: approx 4 rows (20 items) + padding 
             */}
             <div className="grid grid-cols-5 gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 pb-1">
                {player.uniqueInventory && player.uniqueInventory.map((item) => (
                    <div 
                        key={item.uniqueId}
                        onClick={(e) => handleInventoryClick(e, item)}
                        onMouseEnter={(e) => handleHover(item, e)}
                        onMouseLeave={(e) => handleHover(null, e)}
                        className={`aspect-square bg-[#151515] relative cursor-pointer hover:bg-[#222] border-2 rounded-sm flex items-center justify-center transition-all ${getRarityColor(item.rarity)} ${selectedItem?.uniqueId === item.uniqueId ? 'ring-2 ring-white z-10' : ''}`}
                    >
                        {item.image ? <img src={item.image} className="max-w-[42px] max-h-[42px] p-0.5 pixelated drop-shadow-md" /> : <span className="text-[9px]">{item.name.substring(0,1)}</span>}
                        {item.rarity === 'legendary' && <Sparkles size={10} className="absolute top-0.5 right-0.5 text-orange-400 animate-spin-slow" />}
                    </div>
                ))}
                
                {Object.entries(player.inventory).map(([itemId, qty]) => {
                    if ((qty as number) <= 0) return null;
                    const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
                    if (!itemDef) return null;
                    return (
                        <div 
                        key={itemId}
                        onClick={(e) => handleInventoryClick(e, itemDef)}
                        onMouseEnter={(e) => handleHover(itemDef, e)}
                        onMouseLeave={(e) => handleHover(null, e)}
                        className={`aspect-square bg-[#151515] relative cursor-pointer hover:bg-[#222] border-2 border-[#333] hover:border-[#555] rounded-sm flex items-center justify-center transition-all ${selectedItem?.id === itemId && !selectedItem?.uniqueId ? 'ring-2 ring-white z-10' : ''}`}
                        >
                        {itemDef.image ? <img src={itemDef.image} className="max-w-[42px] max-h-[42px] p-0.5 pixelated drop-shadow-md" /> : <span className="text-[9px]">{itemDef.name.substring(0,1)}</span>}
                        <span className="absolute bottom-0 right-0 text-[10px] text-white bg-black/80 px-1 leading-none font-bold rounded-sm border border-black/50">{qty}</span>
                        {isSkipped(itemId) && <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center border border-red-500/50"><EyeOff size={16} className="text-red-400"/></div>}
                        </div>
                    );
                })}
                
                {Array.from({ length: Math.max(0, MAX_BACKPACK_SLOTS - totalSlotsUsed) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-[#111] border border-[#222] rounded-sm opacity-50 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#1a1a1a]"></div>
                    </div>
                ))}
             </div>
          </div>

          {/* Skills Section */}
          <div className="pb-4">
              <div className="text-[11px] font-bold text-[#888] uppercase mb-2 flex items-center gap-2 border-b border-[#333] pb-1">
                 <Zap size={12} className="text-gray-500" /> {t('char_skills')}
              </div>
              <div className="space-y-1">
                  <SkillBar label={t('skill_xp')} level={player.level} progress={getXpPercentage()} icon={<User size={12}/>} tooltip={xpTooltip} />
                  <SkillBar label={t('skill_ml')} level={player.skills[SkillType.MAGIC].level} progress={player.skills[SkillType.MAGIC].progress} bonus={getSkillBonus(SkillType.MAGIC)} icon={<Zap size={12} className="text-purple-400"/>} />
                  <SkillBar label={t('skill_club')} level={player.skills[SkillType.CLUB].level} progress={player.skills[SkillType.CLUB].progress} bonus={getSkillBonus(SkillType.CLUB)} icon={<Hammer size={12}/>} />
                  <SkillBar label={t('skill_sword')} level={player.skills[SkillType.SWORD].level} progress={player.skills[SkillType.SWORD].progress} bonus={getSkillBonus(SkillType.SWORD)} icon={<Sword size={12}/>} />
                  <SkillBar label={t('skill_axe')} level={player.skills[SkillType.AXE].level} progress={player.skills[SkillType.AXE].progress} bonus={getSkillBonus(SkillType.AXE)} icon={<Sword size={12}/>} />
                  <SkillBar label={t('skill_dist')} level={player.skills[SkillType.DISTANCE].level} progress={player.skills[SkillType.DISTANCE].progress} bonus={getSkillBonus(SkillType.DISTANCE)} icon={<Crosshair size={12}/>} />
                  <SkillBar label={t('skill_shield')} level={player.skills[SkillType.DEFENSE].level} progress={player.skills[SkillType.DEFENSE].progress} bonus={getSkillBonus(SkillType.DEFENSE)} icon={<Shield size={12}/>} />
              </div>
          </div>
      </div>
    </div>
  );
};
