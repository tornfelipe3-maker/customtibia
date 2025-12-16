
import React, { useState } from 'react';
import { Player, PlayerSettings, Item, Spell } from '../types';
import { SHOP_ITEMS, SPELLS } from '../constants';
import { Bot, Heart, FlaskConical, Sparkles, Flame, Zap, Scroll, Plus, Trash2, ArrowRight } from 'lucide-react';

interface BotPanelProps {
  player: Player;
  onUpdateSettings: (settings: PlayerSettings) => void;
}

// Reusable Selector Component
const BotSelector: React.FC<{
  label: string;
  enabled: boolean;
  value: number; // Threshold
  selectedId: string;
  items: (Item | Spell)[];
  onToggle: () => void;
  onThresholdChange: (val: number) => void;
  onSelectChange: (id: string) => void;
  color: string;
  icon: React.ReactNode;
  description: string;
  type: 'potion' | 'spell' | 'rune';
  playerInventory?: {[key:string]: number};
}> = ({ label, enabled, value, selectedId, items, onToggle, onThresholdChange, onSelectChange, color, icon, description, type, playerInventory }) => {
  
  return (
    <div className={`bg-[#2d2d2d] border transition-colors p-4 rounded-md mb-3 ${enabled ? `border-${color}-900/50 bg-${color}-900/10` : 'border-[#444]'}`}>
      <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full bg-[#111] border border-[#333] text-${color}-500`}>
                  {icon}
              </div>
              <div>
                  <span className="text-sm font-bold text-gray-200 block">{label}</span>
                  <span className="text-[10px] text-gray-500">{description}</span>
              </div>
          </div>
          
          <button
              onClick={onToggle}
              className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors border border-transparent
                  ${enabled ? 'bg-green-600' : 'bg-gray-700'}
              `}
          >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
      </div>

      {enabled && (
          <div className="space-y-3 bg-[#1a1a1a] p-3 rounded border border-[#333]">
              
              {/* Threshold Slider */}
              {type !== 'rune' && type !== 'spell' && ( 
                 <div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1 uppercase">
                       <span>Threshold</span>
                       <span>{value}%</span>
                    </div>
                    <input 
                       type="range" 
                       min="0" 
                       max="95" 
                       step="5"
                       className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                       value={value}
                       onChange={(e) => onThresholdChange(parseInt(e.target.value))}
                    />
                 </div>
              )}
              
              {/* Only Heal spells need threshold */}
              {type === 'spell' && label.includes("Heal") && (
                 <div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1 uppercase">
                       <span>HP Threshold</span>
                       <span>{value}%</span>
                    </div>
                    <input 
                       type="range" 
                       min="0" 
                       max="95" 
                       step="5"
                       className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                       value={value}
                       onChange={(e) => onThresholdChange(parseInt(e.target.value))}
                    />
                 </div>
              )}


              {/* Dropdown / List Selection */}
              <div>
                 <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Select {type === 'potion' ? 'Item' : 'Spell'}</label>
                 <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {items.length === 0 && <div className="text-[10px] text-gray-600 italic p-2">No available options.</div>}
                    {items.map(item => {
                        const isSelected = selectedId === item.id;
                        let qtyDisplay = null;
                        
                        if (type === 'potion' || type === 'rune') {
                           const qty = playerInventory ? (playerInventory[item.id] || 0) : 0;
                           qtyDisplay = <span className={`text-[10px] font-mono font-bold ${qty > 0 ? 'text-green-500' : 'text-red-500'}`}>x{qty}</span>;
                        }

                        if (type === 'spell') {
                           qtyDisplay = <span className="text-[10px] text-blue-400 font-mono">{(item as Spell).manaCost} mp</span>;
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelectChange(item.id)}
                                className={`
                                    flex items-center justify-between p-2 rounded border transition-all text-left
                                    ${isSelected 
                                        ? `bg-${color}-900/30 border-${color}-500 text-${color}-200` 
                                        : 'bg-[#222] border-[#444] text-gray-400 hover:bg-[#333]'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                   {(item as Item).image && <img src={(item as Item).image} className="w-5 h-5 pixelated" />}
                                   <span className="text-xs font-bold">{item.name}</span>
                                </div>
                                {qtyDisplay}
                            </button>
                        );
                    })}
                 </div>
              </div>
          </div>
      )}
    </div>
  );
};

export const BotPanel: React.FC<BotPanelProps> = ({ player, onUpdateSettings }) => {
  
  // Spell Rotation State Logic
  const [selectedSpellToAdd, setSelectedSpellToAdd] = useState<string>('');

  const handleSettingChange = (key: keyof PlayerSettings, value: any) => {
    onUpdateSettings({
      ...player.settings,
      [key]: value
    });
  };

  const handleAddSpell = () => {
      if (!selectedSpellToAdd) return;
      const currentRotation = player.settings.attackSpellRotation || [];
      // Max 5 spells for simplicity
      if (currentRotation.length >= 5) return;
      
      const newRotation = [...currentRotation, selectedSpellToAdd];
      handleSettingChange('attackSpellRotation', newRotation);
      setSelectedSpellToAdd('');
  };

  const handleRemoveSpell = (index: number) => {
      const currentRotation = player.settings.attackSpellRotation || [];
      const newRotation = currentRotation.filter((_, i) => i !== index);
      handleSettingChange('attackSpellRotation', newRotation);
  };

  // Filter lists
  const healthPotions = SHOP_ITEMS.filter(i => i.type === 'potion' && (i.potionType === 'health' || i.potionType === 'spirit'));
  const manaPotions = SHOP_ITEMS.filter(i => i.type === 'potion' && (i.potionType === 'mana' || i.potionType === 'spirit'));
  const runes = SHOP_ITEMS.filter(i => i.isRune);
  
  // Spell Lists (Only show purchased/learned spells)
  const healSpells = SPELLS.filter(s => s.type === 'heal' && player.purchasedSpells.includes(s.id));
  const attackSpells = SPELLS.filter(s => s.type === 'attack' && player.purchasedSpells.includes(s.id));

  return (
    <div className="bg-[#222] h-full flex flex-col text-[#ccc]">
        {/* Header */}
        <div className="p-4 bg-[#282828] border-b border-[#444] flex items-center gap-3 shadow-md shrink-0">
            <div className="p-2 bg-blue-900/20 border border-blue-800 rounded text-blue-400">
                <Bot size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold font-serif text-[#eee] leading-tight">Bot Manager</h2>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Automation Systems</div>
            </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* HEALING SECTION */}
            <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#333]">
                    <Heart size={16} className="text-red-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Healing & Restore</h3>
                </div>
                
                <BotSelector 
                    label="Auto Health Potion" 
                    icon={<Heart size={14}/>} 
                    enabled={player.settings.autoHealthPotionThreshold > 0} 
                    value={player.settings.autoHealthPotionThreshold}
                    selectedId={player.settings.selectedHealthPotionId}
                    items={healthPotions}
                    color="red"
                    description="Automatically uses selected health potion."
                    type="potion"
                    playerInventory={player.inventory}
                    onToggle={() => handleSettingChange('autoHealthPotionThreshold', player.settings.autoHealthPotionThreshold > 0 ? 0 : 50)}
                    onThresholdChange={(val) => handleSettingChange('autoHealthPotionThreshold', val)}
                    onSelectChange={(id) => handleSettingChange('selectedHealthPotionId', id)}
                />

                <BotSelector 
                    label="Auto Mana Potion" 
                    icon={<FlaskConical size={14}/>} 
                    enabled={player.settings.autoManaPotionThreshold > 0}
                    value={player.settings.autoManaPotionThreshold}
                    selectedId={player.settings.selectedManaPotionId}
                    items={manaPotions}
                    color="blue"
                    description="Automatically uses selected mana potion."
                    type="potion"
                    playerInventory={player.inventory}
                    onToggle={() => handleSettingChange('autoManaPotionThreshold', player.settings.autoManaPotionThreshold > 0 ? 0 : 50)}
                    onThresholdChange={(val) => handleSettingChange('autoManaPotionThreshold', val)}
                    onSelectChange={(id) => handleSettingChange('selectedManaPotionId', id)}
                />

                <BotSelector 
                    label="Auto Heal Spell" 
                    icon={<Sparkles size={14}/>} 
                    enabled={player.settings.autoHealSpellThreshold > 0}
                    value={player.settings.autoHealSpellThreshold}
                    selectedId={player.settings.selectedHealSpellId}
                    items={healSpells}
                    color="yellow"
                    description="Casts selected healing spell."
                    type="spell"
                    onToggle={() => handleSettingChange('autoHealSpellThreshold', player.settings.autoHealSpellThreshold > 0 ? 0 : 70)}
                    onThresholdChange={(val) => handleSettingChange('autoHealSpellThreshold', val)}
                    onSelectChange={(id) => handleSettingChange('selectedHealSpellId', id)}
                />
            </section>

            {/* ATTACK SECTION */}
            <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-[#333]">
                    <Flame size={16} className="text-orange-500" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Offensive Targeting</h3>
                </div>

                {/* Spell Rotation Selector */}
                <div className={`bg-[#2d2d2d] border transition-colors p-4 rounded-md mb-3 ${player.settings.autoAttackSpell ? 'border-orange-900/50 bg-orange-900/10' : 'border-[#444]'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-[#111] border border-[#333] text-orange-500">
                                <Zap size={14}/>
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-200 block">Auto Attack Rotation</span>
                                <span className="text-[10px] text-gray-500">Prioritizes spells in list order.</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => handleSettingChange('autoAttackSpell', !player.settings.autoAttackSpell)}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors border border-transparent
                                ${player.settings.autoAttackSpell ? 'bg-green-600' : 'bg-gray-700'}
                            `}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${player.settings.autoAttackSpell ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {player.settings.autoAttackSpell && (
                        <div className="space-y-3 bg-[#1a1a1a] p-3 rounded border border-[#333]">
                            
                            {/* Add Spell UI */}
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 bg-[#111] border border-[#444] text-xs text-gray-300 rounded px-2 py-1 outline-none"
                                    value={selectedSpellToAdd}
                                    onChange={(e) => setSelectedSpellToAdd(e.target.value)}
                                >
                                    <option value="">Select a spell...</option>
                                    {attackSpells.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.manaCost} mp)</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleAddSpell}
                                    disabled={!selectedSpellToAdd || (player.settings.attackSpellRotation?.length || 0) >= 5}
                                    className="bg-green-900 border border-green-700 text-green-200 px-3 py-1 rounded text-xs hover:bg-green-800 disabled:opacity-50"
                                >
                                    <Plus size={14}/>
                                </button>
                            </div>

                            {/* Active Rotation List */}
                            <div className="space-y-1 mt-2">
                                {(!player.settings.attackSpellRotation || player.settings.attackSpellRotation.length === 0) && (
                                    <div className="text-[10px] text-gray-500 italic text-center p-2">No spells in rotation. Add one above.</div>
                                )}
                                
                                {player.settings.attackSpellRotation?.map((spellId, idx) => {
                                    const spell = SPELLS.find(s => s.id === spellId);
                                    if (!spell) return null;
                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-[#222] border border-[#444] p-2 rounded text-xs group">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-[#111] w-5 h-5 flex items-center justify-center rounded font-mono text-[9px] text-gray-500 border border-[#333]">{idx + 1}</div>
                                                <span className="text-orange-300 font-bold">{spell.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-gray-500">{spell.cooldown/1000}s CD</span>
                                                <button onClick={() => handleRemoveSpell(idx)} className="text-gray-600 hover:text-red-400">
                                                    <Trash2 size={12}/>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <BotSelector 
                    label="Auto Attack Rune" 
                    icon={<Scroll size={14}/>} 
                    enabled={player.settings.autoAttackRune}
                    value={0}
                    selectedId={player.settings.selectedRuneId}
                    items={runes}
                    color="purple"
                    description="Uses rune on target (1s Cooldown)."
                    type="rune"
                    playerInventory={player.inventory}
                    onToggle={() => handleSettingChange('autoAttackRune', !player.settings.autoAttackRune)}
                    onThresholdChange={() => {}}
                    onSelectChange={(id) => handleSettingChange('selectedRuneId', id)}
                />

            </section>
        </div>
    </div>
  );
};
