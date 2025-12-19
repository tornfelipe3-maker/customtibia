
import React from 'react';
import { Item, EquipmentSlot, Rarity } from '../types';
import { Sparkles, User, Shield, Sword, Footprints, Gem, Zap, Layers, HardHat, CircleDot } from 'lucide-react';
import { Sprite } from './common/Sprite';

interface EquipmentSlotProps {
  item?: Item;
  slot: EquipmentSlot;
  onClick?: () => void;
  onHover: (item: Item | null, e: React.MouseEvent) => void;
}

const getRarityColor = (rarity?: Rarity) => {
    switch (rarity) {
        case 'legendary': return 'border-orange-500 shadow-[inset_0_0_8px_rgba(249,115,22,0.5)]';
        case 'epic': return 'border-purple-500 shadow-[inset_0_0_5px_rgba(168,85,247,0.4)]';
        case 'rare': return 'border-blue-400 shadow-[inset_0_0_3px_rgba(96,165,250,0.3)]';
        case 'uncommon': return 'border-green-500';
        default: return 'border-[#333] hover:border-[#555]';
    }
};

const getSlotIcon = (slot: EquipmentSlot) => {
    const props = { size: 20, className: "text-[#333] opacity-40 group-hover:opacity-60 transition-opacity" };
    switch (slot) {
        case EquipmentSlot.HEAD: return <HardHat {...props} />;
        case EquipmentSlot.BODY: return <Shield {...props} />;
        case EquipmentSlot.LEGS: return <Layers {...props} />;
        case EquipmentSlot.FEET: return <Footprints {...props} />;
        case EquipmentSlot.HAND_LEFT: return <Shield {...props} className="text-blue-900 opacity-30" />;
        case EquipmentSlot.HAND_RIGHT: return <Sword {...props} className="text-red-900 opacity-30" />;
        case EquipmentSlot.NECK: return <User {...props} />;
        case EquipmentSlot.RING: return <CircleDot {...props} />;
        case EquipmentSlot.AMMO: return <Zap {...props} className="text-yellow-900 opacity-30" />;
        default: return null;
    }
};

export const EquipmentSlotView: React.FC<EquipmentSlotProps> = ({ item, slot, onClick, onHover }) => (
  <div 
    onClick={onClick}
    onMouseEnter={(e) => item && onHover(item, e)}
    onMouseLeave={() => onHover(null, null as any)}
    className={`
        relative w-[46px] h-[46px] bg-[#151515] border-2 shadow-inner cursor-pointer flex items-center justify-center group overflow-hidden rounded-sm transition-all
        ${item?.rarity ? getRarityColor(item.rarity) : 'border-[#2a2a2a] hover:border-[#444]'}
    `}
  >
    {/* Efeito de Profundidade (Tibia Style) */}
    <div className="absolute inset-0 border border-black/40 pointer-events-none"></div>

    {!item ? (
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {getSlotIcon(slot)}
       </div>
    ) : (
      <>
        <Sprite 
          src={item.image} 
          alt={item.name} 
          className="max-w-[38px] max-h-[38px] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] z-10 relative" 
        />
        {item.count && item.count > 1 && (
            <span className="absolute bottom-0.5 right-0.5 text-[10px] text-white bg-black/80 px-1 rounded-sm leading-none font-bold z-20 border border-black/50">
                {item.count}
            </span>
        )}
        {item.rarity === 'legendary' && <Sparkles size={12} className="absolute top-0.5 right-0.5 text-orange-400 animate-spin-slow z-20" />}
      </>
    )}
    
    {/* Overlay de Hover */}
    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none z-20 transition-opacity"></div>
  </div>
);
