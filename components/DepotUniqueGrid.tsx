
import React, { useState } from 'react';
import { Item, Rarity } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ItemTooltip } from './ItemTooltip';

interface DepotUniqueGridProps {
  items: Item[];
  onWithdraw: (item: Item) => void;
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

export const DepotUniqueGrid: React.FC<DepotUniqueGridProps> = ({ items, onWithdraw }) => {
  const [hoverItem, setHoverItem] = useState<Item | null>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  const handleHover = (item: Item | null, e: React.MouseEvent) => {
      if (item) {
          setHoverItem(item);
          setHoverPos({ x: e.clientX, y: e.clientY });
      } else {
          setHoverItem(null);
          setHoverPos(null);
      }
  };

  if (!items || items.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 p-8">
            <Sparkles size={32} className="mb-2" />
            <p className="text-[10px]">No unique gear stored.</p>
        </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <ItemTooltip item={hoverItem} position={hoverPos} />
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 content-start">
            {items.map((item, idx) => (
                <div 
                    key={item.uniqueId || `depot-unique-${idx}`}
                    onMouseEnter={(e) => handleHover(item, e)}
                    onMouseLeave={(e) => handleHover(null, e)}
                    onClick={() => onWithdraw(item)}
                    className={`
                        aspect-square bg-[#151515] relative cursor-pointer hover:bg-[#222] border-2 rounded-sm flex items-center justify-center transition-all group
                        ${getRarityColor(item.rarity)}
                    `}
                >
                    {item.image ? <img src={item.image} className="max-w-[42px] max-h-[42px] p-0.5 pixelated drop-shadow-md group-hover:scale-110 transition-transform" /> : <span className="text-[9px]">{item.name.substring(0,1)}</span>}
                    {item.rarity === 'legendary' && <Sparkles size={10} className="absolute top-0.5 right-0.5 text-orange-400 animate-spin-slow" />}
                    
                    {/* Quick Withdraw Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-sm">
                        <ArrowRight size={16} className="text-white drop-shadow-md" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
