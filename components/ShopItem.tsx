
import React from 'react';
import { Item, Rarity } from '../types';
import { PackageCheck, ShieldCheck, EyeOff, Sparkles } from 'lucide-react';
import { Sprite } from './common/Sprite';

interface ShopItemProps {
    item: Item;
    mode: 'buy' | 'sell';
    quantity: number;
    isMaxMode: boolean;
    playerGold: number;
    ownedQty: number;
    isSkipped: boolean;
    onBuy: (item: Item, qty: number) => void;
    onSell: (item: Item, qty: number) => void;
    onToggleSkipped: (itemId: string) => void;
    onHover: (item: Item | null, e: React.MouseEvent) => void;
}

const getRarityBorder = (rarity?: Rarity) => {
    switch (rarity) {
        case 'legendary': return 'border-orange-500 shadow-[0_0_5px_orange] bg-orange-900/10';
        case 'epic': return 'border-purple-500 shadow-[0_0_3px_purple] bg-purple-900/10';
        case 'rare': return 'border-blue-400 bg-blue-900/10';
        case 'uncommon': return 'border-green-500 bg-green-900/10';
        default: return 'border-[#3a3a3a] bg-[#282828]';
    }
};

export const ShopItem: React.FC<ShopItemProps> = ({ 
    item, mode, quantity, isMaxMode, playerGold, ownedQty, isSkipped, 
    onBuy, onSell, onToggleSkipped, onHover 
}) => {
    
    let currentQty = quantity;
    if (item.uniqueId) {
        currentQty = 1;
    } else if (isMaxMode) {
        if (mode === 'buy') {
            currentQty = item.price > 0 ? Math.floor(playerGold / item.price) : 0;
        } else {
            currentQty = ownedQty;
        }
    }
    
    const totalPrice = item.price * currentQty;
    const totalSellPrice = item.sellPrice * currentQty;
    const canAfford = mode === 'buy' && currentQty > 0 && playerGold >= totalPrice;
    const canSell = mode === 'sell' && currentQty > 0 && ownedQty >= currentQty;

    return (
        <div 
            onMouseEnter={(e) => onHover(item, e)}
            onMouseLeave={(e) => onHover(null, e)}
            onContextMenu={(e) => { if (!item.uniqueId) { e.preventDefault(); onToggleSkipped(item.id); }}}
            className={`flex items-center justify-between p-2 border hover:bg-[#333] relative group transition-colors rounded-sm ${getRarityBorder(item.rarity)}`}
        >
            <div className="flex items-center flex-1 min-w-0">
                <div className="w-10 h-10 bg-[#181818] border border-[#444] flex items-center justify-center mr-3 shrink-0 relative shadow-inner">
                    <Sprite src={item.image} alt={item.name} className="max-w-[32px] max-h-[32px] p-0.5" />
                    {isSkipped && !item.uniqueId && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                            <EyeOff size={20} className="text-red-500" />
                        </div>
                    )}
                    {item.rarity === 'legendary' && <Sparkles size={12} className="absolute -top-1 -right-1 text-orange-400 animate-spin-slow" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm truncate ${isSkipped ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                            {item.name} {item.rarity ? <span className="text-[10px] uppercase opacity-70 font-normal">({item.rarity})</span> : ''}
                        </span>
                        {ownedQty > 0 && !item.uniqueId && <span className="flex items-center text-[10px] text-gray-400 bg-[#1a1a1a] px-1.5 rounded ml-2 border border-[#333]"><PackageCheck size={10} className="mr-0.5"/>{ownedQty}</span>}
                    </div>
                </div>
            </div>

            {mode === 'buy' ? (
                <button
                    onClick={() => onBuy(item, currentQty)}
                    disabled={!canAfford}
                    className={`ml-3 px-3 py-1.5 tibia-btn text-[11px] font-bold min-w-[80px] flex flex-col items-end leading-none ${canAfford ? 'text-white' : 'text-gray-500 cursor-not-allowed'}`}
                >
                    <span>{totalPrice.toLocaleString()} gp</span>
                    {(currentQty > 1 || isMaxMode) && <span className={`text-[9px] ${isMaxMode ? 'text-purple-300 font-bold' : 'opacity-60'}`}>x{currentQty.toLocaleString()}</span>}
                </button>
            ) : (
                <button
                    onClick={() => onSell(item, currentQty)}
                    disabled={!canSell}
                    className={`ml-3 px-3 py-1.5 tibia-btn text-[11px] font-bold min-w-[80px] text-green-200 flex flex-col items-end leading-none ${canSell ? '' : 'opacity-50 cursor-not-allowed'}`}
                >
                    <span>{totalSellPrice.toLocaleString()} gp</span>
                    {!item.uniqueId && (currentQty > 1 || isMaxMode) && <span className={`text-[9px] ${isMaxMode ? 'text-purple-300 font-bold' : 'opacity-60'}`}>x{currentQty.toLocaleString()}</span>}
                </button>
            )}
        </div>
    );
};
