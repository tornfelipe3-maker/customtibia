
import React, { useState, useMemo } from 'react';
import { SHOP_ITEMS, QUESTS } from '../constants';
import { Item, Player, NpcType, EquipmentSlot, SkillType } from '../types';
import { Lock, Coins, Search, LayoutGrid, Sword, Crosshair, Sparkles, Scroll, ArrowUp, Shield, Shirt, Footprints, Gem, FlaskConical, Package, HardHat, Columns, ChevronsUp, Layers, ShieldAlert } from 'lucide-react';
import { ItemTooltip } from './ItemTooltip';
import { ShopItem } from './ShopItem';
import { useLanguage } from '../contexts/LanguageContext';

interface ShopPanelProps {
  playerGold: number;
  playerLevel: number;
  playerEquipment: Player['equipment'];
  playerInventory: Player['inventory'];
  playerUniqueInventory: Player['uniqueInventory']; // Added prop
  playerQuests: Player['quests'];
  skippedLoot: string[];
  playerHasBlessing?: boolean;
  isGm?: boolean;
  onBuyItem: (item: Item, qty: number) => void;
  onSellItem: (item: Item, qty: number) => void;
  onToggleSkippedLoot: (itemId: string) => void;
  onBuyBlessing?: () => void;
}

type ShopCategory = 'all' | 'melee' | 'distance' | 'magic_weapon' | 'ammunition' | 'armor' | 'helmet' | 'legs' | 'boots' | 'shield' | 'jewelry' | 'potion' | 'loot' | 'rune';

export const ShopPanel: React.FC<ShopPanelProps> = ({ playerGold, playerLevel, playerInventory, playerUniqueInventory, playerQuests, skippedLoot, playerHasBlessing, isGm, onBuyItem, onSellItem, onToggleSkippedLoot, onBuyBlessing }) => {
  const { t } = useLanguage();
  const [activeNpc, setActiveNpc] = useState<NpcType>(NpcType.TRADER);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [category, setCategory] = useState<ShopCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isMaxMode, setIsMaxMode] = useState(false); // Toggle for MAX mode
  
  const [hoverItem, setHoverItem] = useState<Item | null>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  const CATEGORIES: { id: ShopCategory, label: string, icon: React.ReactNode }[] = [
    { id: 'all', label: t('shop_cat_all'), icon: <LayoutGrid size={14} /> },
    { id: 'melee', label: t('shop_cat_melee'), icon: <Sword size={14} /> },
    { id: 'distance', label: t('shop_cat_dist'), icon: <Crosshair size={14} /> },
    { id: 'ammunition', label: t('shop_cat_ammo'), icon: <ArrowUp size={14} /> },
    { id: 'magic_weapon', label: t('shop_cat_magic'), icon: <Sparkles size={14} /> },
    { id: 'rune', label: t('shop_cat_runes'), icon: <Scroll size={14} /> },
    { id: 'shield', label: t('shop_cat_shield'), icon: <Shield size={14} /> },
    { id: 'helmet', label: t('shop_cat_helm'), icon: <HardHat size={14} /> },
    { id: 'armor', label: t('shop_cat_armor'), icon: <Shirt size={14} /> },
    { id: 'legs', label: t('shop_cat_legs'), icon: <Columns size={14} /> },
    { id: 'boots', label: t('shop_cat_boots'), icon: <Footprints size={14} /> },
    { id: 'jewelry', label: t('shop_cat_acc'), icon: <Gem size={14} /> },
    { id: 'potion', label: t('shop_cat_potions'), icon: <FlaskConical size={14} /> },
    { id: 'loot', label: t('shop_cat_loot'), icon: <Package size={14} /> },
  ];

  const getNpcStatus = (npc: NpcType) => {
    if (isGm) return { locked: false, message: 'GM Access' };

    if (npc === NpcType.TRADER) return { locked: false, message: '' };
    
    // Yasir Logic
    if (npc === NpcType.YASIR) {
        if (playerLevel < 50) {
            return { locked: true, message: 'Level 50 Required' };
        }
        return { locked: false, message: '' };
    }

    const quest = QUESTS.find(q => q.rewardNpcAccess === npc);
    if (!quest) return { locked: false, message: '' };

    const playerQuest = playerQuests[quest.id];
    const isCompleted = playerQuest && playerQuest.completed;
    
    return {
      locked: !isCompleted,
      message: isCompleted ? '' : `Quest: ${quest.name}`
    };
  };

  const getOwnedQuantity = (item: Item) => {
    return playerInventory[item.id] || 0;
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

  const handleQuantityChange = (val: number) => {
      setQuantity(Math.max(1, val));
      setIsMaxMode(false); 
  };

  const toggleMaxMode = () => {
      setIsMaxMode(!isMaxMode);
  };

  const isSkipped = (itemId: string) => skippedLoot.includes(itemId);

  const currentNpcStatus = getNpcStatus(activeNpc);

  const checkCategory = (item: Item, cat: ShopCategory): boolean => {
      if (cat === 'all') return true;
      if (cat === 'potion') return item.type === 'potion';
      if (cat === 'loot') return item.type === 'loot';
      
      if (item.type === 'equipment' && item.slot) {
          if (cat === 'rune') return !!item.isRune;
          if (cat === 'ammunition') return item.slot === EquipmentSlot.AMMO;
          if (cat === 'shield') return item.slot === EquipmentSlot.HAND_LEFT;
          if (cat === 'armor') return item.slot === EquipmentSlot.BODY;
          if (cat === 'helmet') return item.slot === EquipmentSlot.HEAD;
          if (cat === 'legs') return item.slot === EquipmentSlot.LEGS;
          if (cat === 'boots') return item.slot === EquipmentSlot.FEET;
          if (cat === 'jewelry') return item.slot === EquipmentSlot.NECK || item.slot === EquipmentSlot.RING;

          if (cat === 'magic_weapon') return item.scalingStat === SkillType.MAGIC;
          if (cat === 'distance') return item.scalingStat === SkillType.DISTANCE;
          if (cat === 'melee') {
             return item.scalingStat === SkillType.SWORD || 
                    item.scalingStat === SkillType.AXE || 
                    item.scalingStat === SkillType.CLUB ||
                    item.scalingStat === SkillType.FIST;
          }
      }
      return false;
  };

  // 1. Standard Items (Stackable)
  const displayedStandardItems = useMemo(() => {
      return SHOP_ITEMS.filter(item => {
        const soldTo = item.soldTo.includes(activeNpc);
        let modePass = false;
        
        if (mode === 'buy') {
            if (activeNpc === NpcType.YASIR) modePass = false; 
            else modePass = soldTo && item.price > 0 && item.type !== 'loot';
        } else {
            // Sell mode
            if (isGm) {
                modePass = soldTo && item.sellPrice > 0;
            } else {
                modePass = soldTo && getOwnedQuantity(item) > 0;
            }
        }

        const catPass = checkCategory(item, category);
        const searchPass = item.name.toLowerCase().includes(searchTerm.toLowerCase());

        return modePass && catPass && searchPass;
      });
  }, [activeNpc, mode, category, searchTerm, isGm, playerInventory]);

  // 2. Unique Items (Non-Stackable) - Only for Sell Mode
  const displayedUniqueItems = useMemo(() => {
      if (mode !== 'sell') return [];
      
      const inventory = playerUniqueInventory || []; // Safe default

      return inventory.filter(item => {
          // Check if NPC buys this base item type
          const soldTo = item.soldTo.includes(activeNpc);
          if (!soldTo) return false;

          const catPass = checkCategory(item, category);
          const searchPass = item.name.toLowerCase().includes(searchTerm.toLowerCase());
          
          return catPass && searchPass;
      });
  }, [mode, activeNpc, category, searchTerm, playerUniqueInventory]);

  return (
    <div className="flex flex-col h-full bg-[#222] text-[#ccc]">
      <ItemTooltip item={hoverItem} position={hoverPos} />

      {/* NPC Tabs */}
      <div className="flex overflow-x-auto bg-[#2d2d2d] border-b border-[#444] custom-scrollbar pb-1 shrink-0">
        {Object.values(NpcType).filter(n => n !== NpcType.ABENCOADO).map(npc => {
           const status = getNpcStatus(npc);
           return (
             <button
              key={npc}
              onClick={() => { setActiveNpc(npc); if(npc === NpcType.YASIR) setMode('sell'); }}
              className={`flex-shrink-0 px-5 py-3 text-xs font-bold border-r border-[#444] transition-colors flex items-center space-x-1.5
                ${activeNpc === npc ? 'bg-[#444] text-yellow-500' : 'bg-[#2d2d2d] text-gray-500 hover:text-gray-300'}
              `}
             >
               <span>{npc}</span>
               {status.locked && <Lock size={12} className="ml-1 text-red-500" />}
               {!status.locked && isGm && <span title="GM Access"><ShieldAlert size={10} className="ml-1 text-red-700"/></span>}
             </button>
           );
        })}
      </div>

      {/* Header Actions & Gold */}
      <div className="p-3 bg-[#282828] border-b border-[#444] flex flex-col gap-2 shadow-md z-10 shrink-0">
         <div className="flex items-center justify-between">
            <div className="flex space-x-2">
                <button 
                onClick={() => setMode('buy')}
                disabled={activeNpc === NpcType.YASIR}
                className={`tibia-btn px-4 py-1.5 text-xs font-bold ${mode === 'buy' ? 'text-yellow-200' : 'text-gray-400'}`}
                >
                {t('shop_buy')}
                </button>
                <button 
                onClick={() => setMode('sell')}
                className={`tibia-btn px-4 py-1.5 text-xs font-bold ${mode === 'sell' ? 'text-green-200' : 'text-gray-400'}`}
                >
                {t('shop_sell')}
                </button>
            </div>
            
            <div className="text-yellow-500 font-bold text-sm flex items-center bg-[#111] px-3 py-1 border border-[#333] rounded">
                <Coins size={14} className="mr-1.5"/>
                {playerGold.toLocaleString()} gp
            </div>
         </div>
         
         {/* Quantity Selector with MAX and Slider */}
         <div className="flex flex-col gap-1">
            <div className="flex items-center bg-[#111] border border-[#333] rounded p-1">
                <span className="text-[10px] text-gray-500 font-bold px-2 uppercase">{t('shop_amount')}</span>
                <button onClick={() => handleQuantityChange(1)} className={`px-2 py-0.5 text-xs rounded ${!isMaxMode && quantity===1 ? 'bg-blue-900 text-white' : 'text-gray-400 hover:bg-[#333]'}`}>1</button>
                <button onClick={() => handleQuantityChange(10)} className={`px-2 py-0.5 text-xs rounded ${!isMaxMode && quantity===10 ? 'bg-blue-900 text-white' : 'text-gray-400 hover:bg-[#333]'}`}>10</button>
                <button onClick={() => handleQuantityChange(100)} className={`px-2 py-0.5 text-xs rounded ${!isMaxMode && quantity===100 ? 'bg-blue-900 text-white' : 'text-gray-400 hover:bg-[#333]'}`}>100</button>
                
                <div className="h-4 w-[1px] bg-[#333] mx-1"></div>
                
                {/* MAX Button */}
                <button 
                    onClick={toggleMaxMode} 
                    className={`
                        px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition-colors
                        ${isMaxMode ? 'bg-purple-900 text-purple-200 border border-purple-500' : 'text-gray-400 hover:bg-[#333]'}
                    `}
                    title="Detect max amount automatically"
                >
                    <ChevronsUp size={10} /> MAX
                </button>

                <div className="h-4 w-[1px] bg-[#333] mx-1"></div>

                <input 
                type="text" 
                value={isMaxMode ? 'ALL' : quantity} 
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className={`bg-transparent text-white text-xs w-16 text-center outline-none font-mono ${isMaxMode ? 'text-purple-400 font-bold' : ''}`}
                readOnly={isMaxMode}
                />
            </div>
            
            {/* Slider for quick selection */}
            <div className="flex items-center px-1 gap-2">
                <span className="text-[9px] text-gray-600"><Layers size={10}/></span>
                <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={isMaxMode ? 100 : Math.min(100, quantity)} 
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-600"
                    disabled={isMaxMode}
                />
            </div>
         </div>
      </div>

      <div className="flex flex-1 min-h-0">
         
         {/* MAIN CONTENT */}
         <div className="flex-1 flex flex-col min-w-0">
            {/* STANDARD SHOP UI */}
            <div className="flex flex-1 min-h-0">
                {/* CATEGORY SIDEBAR */}
                <div className="w-40 bg-[#262626] border-r border-[#444] overflow-y-auto custom-scrollbar flex flex-col p-2 gap-1 shrink-0">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`
                                text-left px-3 py-2 text-xs font-bold rounded flex items-center gap-2 transition-colors
                                ${category === cat.id ? 'bg-[#444] text-yellow-500 border border-[#555]' : 'text-gray-400 hover:bg-[#333] border border-transparent'}
                            `}
                        >
                            {cat.icon}
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Search Bar */}
                    <div className="bg-[#2d2d2d] border-b border-[#444] p-2 flex flex-col gap-2 shrink-0">
                        <div className="relative w-full">
                            <Search size={14} className="absolute left-2.5 top-1.5 text-gray-500" />
                            <input 
                                type="text" 
                                placeholder={t('shop_search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#111] border border-[#444] rounded pl-9 pr-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#666]"
                            />
                        </div>
                    </div>

                    {/* ITEM GRID */}
                    <div className="p-2 flex-1 overflow-y-auto relative tibia-inset custom-scrollbar bg-[#222]">
                        {currentNpcStatus.locked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <Lock size={64} className="mb-4 text-red-500" />
                            <h3 className="text-xl font-bold text-red-400 mb-2">Access Denied</h3>
                            <p className="text-sm text-yellow-500 mt-2 font-mono uppercase border border-yellow-700 px-4 py-2 rounded bg-black/50">Requirement: {currentNpcStatus.message}</p>
                        </div>
                        ) : (
                        <div className="flex flex-col gap-1">
                            
                            {displayedStandardItems.length === 0 && displayedUniqueItems.length === 0 && (
                            <div className="text-center p-12 text-gray-500 text-sm italic">
                                {mode === 'buy' ? 'No items found to buy.' : 'No items found to sell.'}
                                {activeNpc === NpcType.YASIR && mode === 'buy' && <div className="mt-2 text-xs">Yasir only buys creature products. He sells nothing.</div>}
                            </div>
                            )}

                            {/* Render Unique Items First (Sell Only) */}
                            {displayedUniqueItems.map((item) => (
                                <ShopItem
                                    key={item.uniqueId} // Use uniqueId
                                    item={item}
                                    mode={'sell'} // Always sell
                                    quantity={1} // Unique items sold 1 by 1
                                    isMaxMode={false}
                                    playerGold={playerGold}
                                    ownedQty={1}
                                    isSkipped={false}
                                    onBuy={() => {}}
                                    onSell={onSellItem}
                                    onToggleSkipped={() => {}}
                                    onHover={handleHover}
                                />
                            ))}

                            {/* Render Standard Items */}
                            {displayedStandardItems.map((item) => (
                                <ShopItem
                                    key={item.id}
                                    item={item}
                                    mode={mode}
                                    quantity={quantity}
                                    isMaxMode={isMaxMode}
                                    playerGold={playerGold}
                                    ownedQty={getOwnedQuantity(item)}
                                    isSkipped={isSkipped(item.id)}
                                    onBuy={onBuyItem}
                                    onSell={onSellItem}
                                    onToggleSkipped={onToggleSkippedLoot}
                                    onHover={handleHover}
                                />
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
