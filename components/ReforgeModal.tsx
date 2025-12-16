
import React from 'react';
import { Item, SkillType, Rarity } from '../types';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface ReforgeModalProps {
  oldItem: Item;
  newItem: Item;
  onClose: () => void;
}

const getRarityColor = (rarity?: Rarity) => {
    switch (rarity) {
        case 'legendary': return 'text-orange-500 border-orange-500 shadow-orange-500/50';
        case 'epic': return 'text-purple-400 border-purple-500 shadow-purple-500/50';
        case 'rare': return 'text-blue-300 border-blue-400 shadow-blue-400/50';
        case 'uncommon': return 'text-green-300 border-green-500 shadow-green-500/50';
        default: return 'text-gray-400 border-gray-600';
    }
};

const ItemDisplay: React.FC<{ item: Item, label: string }> = ({ item, label }) => {
    const rarityClass = getRarityColor(item.rarity);
    
    return (
        <div className="flex flex-col items-center">
            <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">{label}</div>
            <div className={`w-20 h-20 bg-black border-2 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] ${rarityClass.replace('text-', 'border-').split(' ')[1]}`}>
                <div className={`absolute -top-3 bg-[#111] px-2 py-0.5 rounded border border-[#333] text-[9px] uppercase font-bold tracking-widest ${rarityClass.split(' ')[0]}`}>{item.rarity}</div>
                <img src={item.image} className="scale-[2.5] pixelated drop-shadow-md" alt={item.name} />
                {item.rarity === 'legendary' && <Sparkles size={12} className="absolute bottom-1 right-1 text-orange-400 animate-spin-slow" />}
            </div>
        </div>
    );
};

export const ReforgeModal: React.FC<ReforgeModalProps> = ({ oldItem, newItem, onClose }) => {
  
  // Create a merged list of all keys present in either old or new item modifiers/stats
  const getAllKeys = () => {
      const keys = new Set<string>();
      
      // Base stats
      if (oldItem.attack || newItem.attack) keys.add('Attack');
      if (oldItem.defense || newItem.defense) keys.add('Defense');
      if (oldItem.armor || newItem.armor) keys.add('Armor');

      // Modifiers
      const oldMods = oldItem.modifiers || {};
      const newMods = newItem.modifiers || {};
      [...Object.keys(oldMods), ...Object.keys(newMods)].forEach(k => keys.add(k));

      // Skills
      Object.values(SkillType).forEach(s => keys.add(`Skill:${s}`));

      return Array.from(keys);
  };

  const renderComparisonRow = (key: string) => {
      let label = key;
      let v1 = 0;
      let v2 = 0;
      let isPercent = false;

      // Map keys to values and labels
      if (key === 'Attack') {
          v1 = oldItem.attack || 0;
          v2 = newItem.attack || 0;
      } else if (key === 'Defense') {
          v1 = oldItem.defense || 0;
          v2 = newItem.defense || 0;
      } else if (key === 'Armor') {
          v1 = oldItem.armor || 0;
          v2 = newItem.armor || 0;
      } else if (key.startsWith('Skill:')) {
          const skill = key.split(':')[1] as SkillType;
          label = `${skill} Skill`;
          v1 = oldItem.skillBonus?.[skill] || 0;
          v2 = newItem.skillBonus?.[skill] || 0;
      } else {
          // It's a modifier
          // @ts-ignore
          v1 = oldItem.modifiers?.[key] || 0;
          // @ts-ignore
          v2 = newItem.modifiers?.[key] || 0;
          label = key.replace(/([A-Z])/g, ' $1').trim(); // Camel to Title
          // Most modifiers are percent, except specific ones maybe?
          // For simplicity, let's treat modifier keys usually as percent in text if appropriate
          if (['xpBoost','lootBoost','attackSpeed','critChance','blessedChance','bossSlayer','dodgeChance','goldFind','executioner','reflection'].includes(key)) {
              isPercent = true;
          }
      }

      // If both are 0, don't show
      if (!v1 && !v2) return null;

      // Determine colors and icons
      const diff = v2 - v1;
      const color = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400';
      const icon = diff > 0 ? '▲' : diff < 0 ? '▼' : '';
      const diffStr = diff !== 0 ? `(${icon}${Math.abs(diff)}${isPercent ? '%' : ''})` : '';

      const valDisplay = (val: number) => val > 0 ? `${val}${isPercent ? '%' : ''}` : '-';

      return (
          <div key={key} className="flex justify-between items-center text-xs py-1.5 border-b border-[#333] last:border-0 hover:bg-[#222] px-2 rounded-sm transition-colors">
              <span className="text-gray-400 font-bold capitalize">{label}</span>
              <div className="flex items-center gap-3 font-mono">
                  <span className={`${v1 > 0 ? 'text-gray-300' : 'text-gray-600'}`}>{valDisplay(v1)}</span>
                  <ArrowRight size={10} className="text-gray-600"/>
                  <span className={`font-bold ${color}`}>
                      {valDisplay(v2)} <span className="text-[9px] opacity-80 ml-1">{diffStr}</span>
                  </span>
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200" onClick={onClose}>
        <div className="tibia-panel bg-[#1a1a1a] w-full max-w-lg p-0 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#444]" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-[#2d2d2d] border-b border-[#444] p-3 flex items-center justify-center relative shadow-md">
                <div className="flex items-center gap-2">
                    <RefreshCw className="text-purple-400 animate-[spin_3s_linear_infinite]" size={20} />
                    <h2 className="text-lg font-bold font-serif text-gray-200">Reforge Complete</h2>
                </div>
            </div>

            {/* Comparison Area - Side by Side */}
            <div className="p-6 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] bg-cover relative">
                <div className="absolute inset-0 bg-black/80"></div>
                
                {/* Items Row */}
                <div className="relative z-10 flex items-center justify-center gap-8 mb-6">
                    <ItemDisplay item={oldItem} label="OLD" />
                    
                    <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse">
                        <ArrowRight size={32} />
                    </div>

                    <ItemDisplay item={newItem} label="NEW" />
                </div>

                <div className="relative z-10 bg-[#111]/95 border border-[#444] rounded p-1 shadow-inner max-h-[250px] overflow-y-auto custom-scrollbar">
                    <div className="bg-[#1a1a1a] border-b border-[#333] p-2 text-center text-gray-200 font-bold text-sm">
                        Attribute Changes
                    </div>
                    <div className="p-2 space-y-0.5">
                        {getAllKeys().map(key => renderComparisonRow(key))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#222] border-t border-[#444] p-3 text-center">
                <button 
                    onClick={onClose}
                    className="tibia-btn px-8 py-2.5 font-bold text-sm bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 border-green-700 text-white w-full shadow-lg"
                >
                    Confirm & Close
                </button>
            </div>
        </div>
    </div>
  );
};
