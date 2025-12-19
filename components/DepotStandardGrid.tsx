
import React from 'react';
import { Item } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Box, ArrowRight } from 'lucide-react';

interface DepotStandardGridProps {
  items: { [itemId: string]: number };
  onWithdraw: (item: Item) => void;
}

export const DepotStandardGrid: React.FC<DepotStandardGridProps> = ({ items, onWithdraw }) => {
  /* FIXED: Added type assertion to handle unknown type inference in Object.values(items) */
  const hasItems = Object.keys(items).length > 0 && Object.values(items).some((q) => (q as number) > 0);

  if (!hasItems) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 p-8">
            <Box size={32} className="mb-2" />
            <p className="text-[10px]">No items stored.</p>
        </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {Object.entries(items).map(([itemId, qty]) => {
            if ((qty as number) <= 0) return null;
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return null;

            return (
                <div key={itemId} className="flex items-center justify-between p-2 bg-[#222] rounded border border-[#333] hover:bg-[#2a2a2a] transition-colors group">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#151515] rounded flex items-center justify-center border border-[#333] shadow-inner relative">
                            {item.image ? <img src={item.image} className="max-w-full max-h-full p-0.5 pixelated"/> : <span className="text-xs font-bold text-gray-600">{item.name.substring(0,1)}</span>}
                            <span className="absolute -bottom-1 -right-1 bg-black/80 text-[8px] text-white px-1 rounded border border-gray-700">{qty}</span>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-300 group-hover:text-white">{item.name}</div>
                            {/* FIXED: Cast qty as number to resolve type error during multiplication with sellPrice */}
                            <div className="text-[9px] text-gray-500">Value: {(item.sellPrice * (qty as number)).toLocaleString()} gp</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onWithdraw(item)}
                        className="px-2 py-1 bg-blue-900/40 hover:bg-blue-800 text-blue-300 text-[10px] rounded border border-blue-900/60 transition-colors"
                        title="Withdraw to Backpack"
                    >
                        <ArrowRight size={12} />
                    </button>
                </div>
            );
        })}
    </div>
  );
};
