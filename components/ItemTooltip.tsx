
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Item } from '../types';

interface ItemTooltipProps {
  item: Item | null;
  position: { x: number, y: number } | null;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedStyle, setAdjustedStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (item && position && tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        let left = position.x + 12; 
        let top = position.y + 12;

        if (left + rect.width > winW) {
            left = position.x - rect.width - 12;
        }

        if (top + rect.height > winH) {
            top = position.y - rect.height - 12;
        }

        if (left < 0) left = 10;
        if (top < 0) top = 10;

        setAdjustedStyle({ top, left });
    }
  }, [position, item]);

  if (!item || !position) return null;

  const TOOLTIP_WIDTH = 170; 
  let safeLeft = position.x + 12;
  if (typeof window !== 'undefined' && safeLeft + TOOLTIP_WIDTH > window.innerWidth) {
      safeLeft = position.x - TOOLTIP_WIDTH;
  }
  
  const style = {
      top: position.y + 12,
      left: safeLeft
  };

  if (typeof window !== 'undefined' && style.top + 250 > window.innerHeight) {
      style.top = Math.max(10, window.innerHeight - 250);
  }

  return (
    <div 
      className="fixed z-[80] w-40 bg-black/95 border border-[#555] p-1.5 text-[10px] rounded shadow-xl pointer-events-none text-left flex flex-col gap-1"
      style={style}
    >
        <div className={`font-bold border-b border-[#333] pb-0.5 leading-tight ${item.rarity ? 'text-white' : 'text-gray-100'}`}>
            {item.name} {item.rarity && <span className="uppercase text-[8px] font-normal opacity-70 ml-1">({item.rarity})</span>}
        </div>
        
        <div className="text-gray-500 italic text-[9px] leading-tight">{item.description}</div>
        
        <div className="grid grid-cols-2 gap-x-1 text-gray-300 leading-tight">
            {item.attack ? <span>Atk: <span className="text-white">{item.attack}</span> 
                {item.modifiers?.attack ? <span className="text-blue-400 ml-0.5">(+{item.modifiers.attack})</span> : ''}
            </span> : null}
            
            {item.defense ? <span>Def: <span className="text-white">{item.defense}</span>
                {item.modifiers?.defense ? <span className="text-blue-400 ml-0.5">(+{item.modifiers.defense})</span> : ''}
            </span> : null}
            
            {item.armor ? <span>Arm: <span className="text-white">{item.armor}</span>
                {item.modifiers?.armor ? <span className="text-blue-400 ml-0.5">(+{item.modifiers.armor})</span> : ''}
            </span> : null}
            
            {item.manaCost ? <span className="text-blue-400 col-span-2 font-bold">Mana Cost: {item.manaCost}</span> : null}

            {item.requiredLevel ? <span className="text-red-400 col-span-2">Level: {item.requiredLevel}</span> : null}
            
            {item.scalingStat ? <span className="text-blue-400 col-span-2 capitalize">Use: {item.scalingStat}</span> : null}
            
            {item.skillBonus && Object.entries(item.skillBonus).map(([k,v]) => (
                <span key={k} className="text-green-400 col-span-2">+{v} {k}</span>
            ))}

            {item.modifiers && (
                <>
                    {item.modifiers.xpBoost && <span className="text-purple-300 col-span-2 font-bold">+{item.modifiers.xpBoost}% XP Gain</span>}
                    {item.modifiers.lootBoost && <span className="text-yellow-300 col-span-2 font-bold">+{item.modifiers.lootBoost}% Loot Chance</span>}
                    {item.modifiers.attackSpeed && <span className="text-orange-400 col-span-2 font-bold">+{item.modifiers.attackSpeed}% Multi-Hit</span>}
                    {item.modifiers.blessedChance && <span className="text-cyan-400 col-span-2 font-bold">+{item.modifiers.blessedChance}% Blessed Mob</span>}
                    {item.modifiers.critChance && <span className="text-red-400 col-span-2 font-bold">+{item.modifiers.critChance}% Crit Chance</span>}
                    {item.modifiers.bossSlayer && <span className="text-red-500 col-span-2 font-bold">+{item.modifiers.bossSlayer}% Boss Dmg</span>}
                    {item.modifiers.dodgeChance && <span className="text-white col-span-2 font-bold">+{item.modifiers.dodgeChance}% Dodge</span>}
                    {item.modifiers.goldFind && <span className="text-yellow-500 col-span-2 font-bold">+{item.modifiers.goldFind}% Gold Find</span>}
                    {item.modifiers.executioner && <span className="text-red-600 col-span-2 font-bold">+{item.modifiers.executioner}% Execute</span>}
                    {item.modifiers.reflection && <span className="text-green-500 col-span-2 font-bold">+{item.modifiers.reflection}% Reflect</span>}
                    {item.modifiers.soulGain && <span className="text-purple-400 col-span-2 font-bold">+{item.modifiers.soulGain}% Soulpoint Gain</span>}
                </>
            )}
            
            {item.restoreAmount ? (
               <span className="text-blue-400 col-span-2">
                 Heal: {item.restoreAmount}
                 {item.restoreAmountSecondary ? `/${item.restoreAmountSecondary}` : ''}
               </span>
            ) : null}
        </div>

        <div className="text-[9px] text-gray-500 border-t border-[#333] pt-0.5 flex justify-between mt-auto">
            <span className="text-yellow-600 font-bold">{item.sellPrice} gp</span>
            <span>{item.price > 0 ? `${item.price} gp` : ''}</span>
        </div>
    </div>
  );
};
