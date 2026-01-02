
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

        // Ajuste horizontal se sair da tela à direita
        if (left + rect.width > winW) {
            left = position.x - rect.width - 12;
        }

        // Ajuste vertical se sair da tela embaixo
        if (top + rect.height > winH) {
            top = position.y - rect.height - 12;
        }

        // Garantir que não saia pela esquerda ou topo
        if (left < 0) left = 10;
        if (top < 0) top = 10;

        setAdjustedStyle({ 
            top, 
            left,
            visibility: 'visible',
            opacity: 1
        });
    } else {
        setAdjustedStyle({ visibility: 'hidden', opacity: 0 });
    }
  }, [position, item]);

  if (!item || !position) return null;

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-[250] w-44 bg-black/95 border border-[#555] p-2 text-[10px] rounded shadow-2xl pointer-events-none text-left flex flex-col gap-1.5 transition-opacity duration-150"
      style={adjustedStyle}
    >
        <div className={`font-bold border-b border-[#333] pb-1 leading-tight ${item.rarity ? 'text-white' : 'text-gray-100'}`}>
            {item.name} {item.rarity && <span className="uppercase text-[8px] font-normal opacity-70 ml-1">({item.rarity})</span>}
        </div>
        
        {item.description && <div className="text-gray-500 italic text-[9px] leading-tight">{item.description}</div>}
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-300 leading-tight">
            {item.attack ? <span>Atk: <span className="text-white font-bold">{item.attack}</span> 
                {item.modifiers?.attack ? <span className="text-blue-400 ml-0.5">(+{item.modifiers.attack})</span> : ''}
            </span> : null}
            
            {item.defense ? <span>Def: <span className="text-white font-bold">{item.defense}</span>
                {item.modifiers?.defense ? <span className="text-blue-400 ml-0.5">(+{item.modifiers.defense})</span> : ''}
            </span> : null}
            
            {item.armor ? <span>Arm: <span className="text-white font-bold">{item.armor}</span>
                {item.modifiers?.armor ? <span className="text-blue-400 ml-0.5">(+{item.modifiers.armor})</span> : ''}
            </span> : null}
            
            {item.manaCost ? <span className="text-blue-400 col-span-2 font-bold">Mana: {item.manaCost}</span> : null}

            {item.requiredLevel ? <span className="text-red-400 col-span-2 font-bold">Level: {item.requiredLevel}</span> : null}
            
            {item.skillBonus && Object.entries(item.skillBonus).map(([k,v]) => (
                <span key={k} className="text-green-400 col-span-2">+{v} {k}</span>
            ))}

            {item.modifiers && (
                <>
                    {item.modifiers.xpBoost && <span className="text-purple-300 col-span-2 font-bold">+{item.modifiers.xpBoost}% XP Gain</span>}
                    {item.modifiers.lootBoost && <span className="text-yellow-300 col-span-2 font-bold">+{item.modifiers.lootBoost}% Loot Chance</span>}
                    {item.modifiers.critChance && <span className="text-red-400 col-span-2 font-bold">+{item.modifiers.critChance}% Crit Chance</span>}
                </>
            )}
        </div>

        <div className="text-[9px] text-gray-500 border-t border-[#333] pt-1 flex justify-between mt-1">
            <span className="text-yellow-600 font-bold">Venda: {item.sellPrice.toLocaleString()} gp</span>
        </div>
    </div>
  );
};
