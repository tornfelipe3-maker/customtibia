
import React, { useState, useEffect, useRef } from 'react';
import { Player, GmFlags } from '../types';
import { Zap, ArrowUpCircle, Coins, ShieldAlert, Skull, AlertTriangle, Sparkles, Crown, FastForward, Ghost, Flame, GripHorizontal, X, Ticket, Package } from 'lucide-react';

interface GmPanelProps {
  player: Player;
  gameSpeed: number;
  onLevelUp: () => void;
  onSkillUp: () => void;
  onAddGold: () => void;
  onAddGoldTokens: () => void;
  onAddSoulPoints: () => void;
  onAddBags: (id: string, amount: number) => void;
  onSetRarity: (rarity: GmFlags['forceRarity']) => void;
  onSetSpeed: (speed: number) => void;
  onSetHazard?: (val: number) => void;
}

export const GmPanel: React.FC<GmPanelProps> = ({ player, gameSpeed, onLevelUp, onSkillUp, onAddGold, onAddGoldTokens, onAddSoulPoints, onAddBags, onSetRarity, onSetSpeed, onSetHazard }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 220, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);

  if (!player.isGm) return null;
  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed top-14 right-4 z-[100] bg-red-900 border border-red-500 text-white p-2 rounded shadow-lg hover:bg-red-800"
            title="Open GM Panel"
          >
              <ShieldAlert size={20} />
          </button>
      )
  }

  const currentForce = player.gmExtra?.forceRarity;

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

  return (
    <div 
        className="fixed z-[100] w-48 bg-[#1a0505] border-2 border-red-900 shadow-2xl rounded-lg flex flex-col opacity-90 hover:opacity-100 transition-opacity"
        style={{ top: position.y, left: position.x }}
    >
      {/* Header / Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="bg-red-950 p-2 border-b border-red-900 flex items-center justify-between cursor-move active:cursor-grabbing select-none"
      >
          <div className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase">
            <ShieldAlert size={12}/> GM Mode
          </div>
          <div className="flex items-center gap-1">
            <GripHorizontal size={14} className="text-red-700" />
            <button onClick={() => setIsOpen(false)} onMouseDown={(e) => e.stopPropagation()} className="text-red-500 hover:text-white">
                <X size={14} />
            </button>
          </div>
      </div>
      
      <div className="p-2 overflow-y-auto custom-scrollbar max-h-[60vh] flex flex-col gap-2">
        <button 
          onClick={onLevelUp}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <ArrowUpCircle size={14} className="text-yellow-400"/> Force Level Up
        </button>

        <button 
          onClick={onSkillUp}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <Zap size={14} className="text-blue-400"/> +5 All Skills
        </button>

        <button 
          onClick={onAddGold}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <Coins size={14} className="text-yellow-500"/> +1M Gold
        </button>

        <button 
          onClick={onAddGoldTokens}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <Ticket size={14} className="text-yellow-600"/> +10 Gold Tokens
        </button>

        <button 
          onClick={onAddSoulPoints}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <Ghost size={14} className="text-purple-400"/> +1.000 Soul Points
        </button>

        <button 
          onClick={() => onAddBags('bag_desire', 5)}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <Package size={14} className="text-purple-400"/> +5 Bag Desire
        </button>

        <button 
          onClick={() => onAddBags('bag_covet', 5)}
          className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
        >
          <Package size={14} className="text-red-500"/> +5 Bag Covet
        </button>

        {onSetHazard && (
            <button 
            onClick={() => onSetHazard(100)}
            className="bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2 px-3 rounded border border-red-800 flex items-center gap-2"
            >
            <Flame size={14} className="text-orange-500"/> Set Hazard 100
            </button>
        )}

        {/* --- GAME SPEED CONTROL --- */}
        <div className="border-t border-red-900 pt-2 mt-1">
            <div className="text-[9px] text-red-400 uppercase font-bold mb-1 text-center flex items-center justify-center gap-1">
                <FastForward size={10}/> Game Speed
            </div>
            <div className="grid grid-cols-3 gap-1">
                <button 
                    onClick={() => onSetSpeed(1)}
                    className={`text-[9px] font-bold py-1 rounded border ${gameSpeed === 1 ? 'bg-red-600 text-white border-white' : 'bg-red-950 text-red-300 border-red-800'}`}
                >
                    1x
                </button>
                <button 
                    onClick={() => onSetSpeed(2)}
                    className={`text-[9px] font-bold py-1 rounded border ${gameSpeed === 2 ? 'bg-red-600 text-white border-white' : 'bg-red-950 text-red-300 border-red-800'}`}
                >
                    2x
                </button>
                <button 
                    onClick={() => onSetSpeed(4)}
                    className={`text-[9px] font-bold py-1 rounded border ${gameSpeed === 4 ? 'bg-red-600 text-white border-white' : 'bg-red-950 text-red-300 border-red-800'}`}
                >
                    4x
                </button>
            </div>
        </div>

        {onSetRarity && (
            <div className="border-t border-red-900 pt-2 mt-1">
                <div className="text-[9px] text-red-400 uppercase font-bold mb-1 text-center">Force Rarity (100%)</div>
                <div className="grid grid-cols-2 gap-1">
                    <button 
                        onClick={() => onSetRarity('enraged')}
                        className={`text-[9px] font-bold py-1 px-1 rounded border flex items-center justify-center gap-1 ${currentForce === 'enraged' ? 'bg-red-600 text-white border-white' : 'bg-red-950 text-red-300 border-red-800'}`}
                    >
                        <AlertTriangle size={10}/> Enraged
                    </button>
                    <button 
                        onClick={() => onSetRarity('blessed')}
                        className={`text-[9px] font-bold py-1 px-1 rounded border flex items-center justify-center gap-1 ${currentForce === 'blessed' ? 'bg-blue-600 text-white border-white' : 'bg-blue-950 text-blue-300 border-blue-800'}`}
                    >
                        <Crown size={10}/> Blessed
                    </button>
                    <button 
                        onClick={() => onSetRarity('corrupted')}
                        className={`text-[9px] font-bold py-1 px-1 rounded border flex items-center justify-center gap-1 ${currentForce === 'corrupted' ? 'bg-purple-600 text-white border-white' : 'bg-purple-950 text-purple-300 border-purple-800'}`}
                    >
                        <Sparkles size={10}/> Void
                    </button>
                    <button 
                        onClick={() => onSetRarity(null)}
                        className={`text-[9px] font-bold py-1 px-1 rounded border flex items-center justify-center gap-1 ${!currentForce ? 'bg-gray-600 text-white border-white' : 'bg-gray-800 text-gray-400 border-gray-600'}`}
                    >
                        <Skull size={10}/> Reset
                    </button>
                </div>
            </div>
        )}
      </div>
      
      <div className="bg-red-950 p-1 text-[8px] text-red-400 text-center font-mono border-t border-red-900">
        UID: {player.name}
      </div>
    </div>
  );
};
