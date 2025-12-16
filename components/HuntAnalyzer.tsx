
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Coins, X, Trash2, PieChart } from 'lucide-react';

interface HuntAnalyzerProps {
  history: { timestamp: number, xp: number, profit: number, waste: number }[];
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  killCounts?: {[name: string]: number}; // Optional/Deprecated
}

export const HuntAnalyzer: React.FC<HuntAnalyzerProps> = ({ history, isOpen, onClose, onReset }) => {
  const [position, setPosition] = useState({ x: 20, y: 350 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  // Drag Logic moved before conditional return to satisfy Hook Rules
  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isDragging && dragStartRef.current) {
              setPosition({
                  x: e.clientX - dragStartRef.current.x,
                  y: e.clientY - dragStartRef.current.y
              });
          }
      };
      
      const handleMouseUp = () => {
          setIsDragging(false);
          dragStartRef.current = null;
      };

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging]);

  // Conditional Return MUST be after all Hooks
  if (!isOpen) return null;

  // Calculate Stats
  const now = Date.now();
  const sessionStart = history.length > 0 ? history[0].timestamp : now;
  const durationMs = Math.max(1000, now - sessionStart); // Avoid div by zero
  const durationHours = durationMs / (1000 * 60 * 60);

  const totalXp = history.reduce((sum, entry) => sum + entry.xp, 0);
  const totalLoot = history.reduce((sum, entry) => sum + entry.profit, 0); // Profit in gameLoop is Gross Loot
  const totalWaste = history.reduce((sum, entry) => sum + entry.waste, 0);
  const balance = totalLoot - totalWaste;

  // Hourly Rates
  const xph = Math.floor(totalXp / durationHours);
  const profitPh = Math.floor(balance / durationHours);

  return (
    <div 
        className="fixed z-[90] w-64 bg-[#2d2d2d] bg-opacity-95 backdrop-blur-md border border-[#444] rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col font-mono select-none"
        style={{ top: position.y, left: position.x }}
    >
        {/* Header - Draggable Handle */}
        <div 
            onMouseDown={handleMouseDown}
            className="bg-[#222] px-2 py-1.5 border-b border-[#333] flex justify-between items-center cursor-move active:cursor-grabbing"
        >
            <div className="flex items-center gap-1.5">
                <PieChart size={12} className="text-gray-400"/>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Hunt Analytics</span>
            </div>
            
            <div className="flex items-center gap-1">
                <button 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onClick={onReset} 
                    className="text-gray-500 hover:text-red-400 p-0.5"
                    title="Reset Session"
                >
                    <Trash2 size={12} />
                </button>
                <button 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onClick={onClose} 
                    className="text-gray-500 hover:text-white p-0.5"
                >
                    <X size={12} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3 text-xs text-gray-200">
            
            {/* XP Section */}
            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333]">
                <div className="flex justify-between items-center text-gray-500 mb-1">
                    <span className="text-[9px] font-bold uppercase">Experience</span>
                    <TrendingUp size={10} />
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px]">Total:</span>
                    <span className="font-bold text-white">{totalXp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px]">XP/h:</span>
                    <span className="font-bold text-green-400">{xph.toLocaleString()}</span>
                </div>
            </div>

            {/* Financial Section */}
            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] space-y-1">
                <div className="flex justify-between items-center text-gray-500 mb-1 border-b border-[#333] pb-1">
                    <span className="text-[9px] font-bold uppercase">Financial</span>
                    <Coins size={10} className="text-yellow-600"/>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-green-500">Loot</span>
                    <span className="text-green-400 font-mono">{totalLoot.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-red-500">Supplies</span>
                    <span className="text-red-400 font-mono">-{totalWaste.toLocaleString()}</span>
                </div>

                <div className="h-[1px] bg-[#333] w-full my-1"></div>

                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-300">Balance</span>
                    <span className={`font-bold font-mono ${balance >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                        {balance.toLocaleString()}
                    </span>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] text-gray-500">Profit/h</span>
                    <span className={`font-bold text-[10px] font-mono ${profitPh >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitPh.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-[#111] px-2 py-1 text-[8px] text-gray-600 text-center border-t border-[#333] rounded-b">
            Session: {(durationMs / 60000).toFixed(0)} mins
        </div>
    </div>
  );
};
