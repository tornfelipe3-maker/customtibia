
import React, { useRef, useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { Scroll, Swords, Sparkles, Box, FileText } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
}

type LogTab = 'server' | 'loot' | 'damage';

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const [activeTab, setActiveTab] = useState<LogTab>('server');
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Check scroll position to decide if we should stick to bottom
  const handleScroll = () => {
      if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          // Tolerance of 30px
          isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
      }
  };

  const getFilteredLogs = () => {
      switch (activeTab) {
          case 'loot':
              return logs.filter(l => l.type === 'loot');
          case 'damage':
              return logs.filter(l => l.type === 'combat');
          case 'server':
          default:
              // Show everything EXCEPT loot and pure combat damage
              return logs.filter(l => l.type !== 'loot' && l.type !== 'combat');
      }
  };

  const filteredLogs = getFilteredLogs();

  useEffect(() => {
    if (containerRef.current && isNearBottomRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, activeTab]); // Trigger on logs update or tab change

  const getLogColor = (log: LogEntry) => {
    if (log.rarity) {
        switch (log.rarity) {
            case 'legendary': return 'text-orange-500 font-bold drop-shadow-[0_0_2px_rgba(255,165,0,0.8)]';
            case 'epic': return 'text-purple-400 font-bold';
            case 'rare': return 'text-blue-300 font-bold';
            case 'uncommon': return 'text-green-400';
            default: return 'text-[#00cc00]';
        }
    }

    switch (log.type) {
      case 'combat': return 'text-[#ff5555]'; 
      case 'gain': return 'text-[#ffffff]'; 
      case 'danger': return 'text-[#ff0000] font-bold'; 
      case 'loot': return 'text-[#00cc00]'; 
      case 'info': return 'text-[#55ff55]'; 
      case 'magic': return 'text-[#ffaa00]'; 
      default: return 'text-[#c0c0c0]';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border border-[#555]">
      {/* Header / Tabs */}
      <div className="bg-[#222] border-b border-[#444] flex shrink-0 shadow-sm">
         <button 
            onClick={() => setActiveTab('server')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold border-r border-[#444] transition-colors ${activeTab === 'server' ? 'bg-[#333] text-white' : 'text-gray-500 hover:bg-[#2a2a2a]'}`}
         >
            <FileText size={12} /> Server
         </button>
         <button 
            onClick={() => setActiveTab('loot')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold border-r border-[#444] transition-colors ${activeTab === 'loot' ? 'bg-[#333] text-green-400' : 'text-gray-500 hover:bg-[#2a2a2a]'}`}
         >
            <Box size={12} /> Loot
         </button>
         <button 
            onClick={() => setActiveTab('damage')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold border-r border-[#444] transition-colors ${activeTab === 'damage' ? 'bg-[#333] text-red-400' : 'text-gray-500 hover:bg-[#2a2a2a]'}`}
         >
            <Swords size={12} /> Damage
         </button>
         
         <div className="px-2 flex items-center justify-center cursor-pointer hover:text-white text-[#aaa] text-[10px]">x</div>
      </div>

      {/* Log Content */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 font-mono text-[12px] space-y-1 bg-black custom-scrollbar leading-snug"
      >
        {filteredLogs.map((log) => (
          <div key={log.id} className={`${getLogColor(log)} break-words`}>
            <span className="text-[#666] mr-2 select-none text-[10px]">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
            </span>
            {log.message}
          </div>
        ))}
        {filteredLogs.length === 0 && (
            <div className="text-[#444] text-[10px] italic text-center mt-4">No entries in this channel.</div>
        )}
      </div>
      
      {/* Fake chat input */}
      <div className="bg-[#111] border-t border-[#444] p-1.5 flex shrink-0">
          <input disabled type="text" className="w-full bg-[#000] border border-[#333] text-gray-500 text-[11px] px-2 py-1" value={`Chat: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Log`} />
      </div>
    </div>
  );
};
