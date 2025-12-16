
import React from 'react';
import { Player, Item } from '../types';
import { Package, Box, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { DepotUniqueGrid } from './DepotUniqueGrid';
import { DepotStandardGrid } from './DepotStandardGrid';
import { MAX_DEPOT_SLOTS } from '../constants';

interface DepotPanelProps {
  playerDepot: Player['depot'];
  playerUniqueDepot: Player['uniqueDepot']; // Changed from optional (?) to required
  onWithdrawItem: (item: Item) => void;
}

export const DepotPanel: React.FC<DepotPanelProps> = ({ playerDepot, playerUniqueDepot, onWithdrawItem }) => {
  // Defensive check: Ensure uniqueDepot is always an array
  const safeUniqueDepot = Array.isArray(playerUniqueDepot) ? playerUniqueDepot : [];
  
  const usedSlots = Object.keys(playerDepot).length + safeUniqueDepot.length;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2 text-yellow-600">
          <Package size={20} />
          <h2 className="text-lg font-bold font-serif">Depot Chest</h2>
        </div>
        <div className={`text-xs font-mono font-bold ${usedSlots >= MAX_DEPOT_SLOTS ? 'text-red-500' : 'text-gray-500'}`}>
            Slots: {usedSlots} / {MAX_DEPOT_SLOTS}
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
            
            {/* COLUMN 1: STANDARD ITEMS (Stackable) */}
            <div className="flex flex-col bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden shadow-inner h-full min-h-[300px]">
                <div className="p-2 bg-[#252525] border-b border-[#333] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Box size={14} className="text-gray-400"/>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Common Items</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold bg-[#151515] px-2 rounded border border-[#333]">
                        <Layers size={10} className="inline mr-1"/>Stackable
                    </span>
                </div>
                
                <DepotStandardGrid items={playerDepot} onWithdraw={onWithdrawItem} />
            </div>

            {/* COLUMN 2: UNIQUE ITEMS (Equipment) */}
            <div className="flex flex-col bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden shadow-inner h-full min-h-[300px]">
                <div className="p-2 bg-[#252525] border-b border-[#333] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-400"/>
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wide">Unique Gear</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold bg-[#151515] px-2 rounded border border-[#333]">
                        <ShieldCheck size={10} className="inline mr-1"/>Uncommon+
                    </span>
                </div>

                <DepotUniqueGrid items={safeUniqueDepot} onWithdraw={onWithdrawItem} />
            </div>

        </div>
      </div>
    </div>
  );
};
