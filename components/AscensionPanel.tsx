
import React, { useState } from 'react';
import { Player, AscensionPerk } from '../types';
import { calculateSoulPointsToGain, getAscensionUpgradeCost, getAscensionBonusValue } from '../services';
import { Ghost, Skull, TrendingUp, DollarSign, Swords, Clock, Gift, BookOpen, Info, X, Heart, Zap, FlaskConical } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AscensionPanelProps {
  player: Player;
  onAscend: () => void;
  onUpgrade: (perk: AscensionPerk) => void;
}

export const AscensionPanel: React.FC<AscensionPanelProps> = ({ player, onAscend, onUpgrade }) => {
  const { t } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeInfo, setActiveInfo] = useState<AscensionPerk | null>(null);
  
  const pointsToGain = calculateSoulPointsToGain(player);
  const canAscend = player.level >= 30; 

  const toggleInfo = (id: AscensionPerk) => {
      setActiveInfo(activeInfo === id ? null : id);
  };

  const TALENTS: { id: AscensionPerk, name: string, desc: string, details: string, icon: React.ReactNode, perLevel: string }[] = [
    { 
        id: 'xp_boost', 
        name: t('ascension_xp_name'), 
        desc: t('ascension_xp_desc'), 
        details: t('ascension_xp_details'),
        icon: <BookOpen size={18} className="text-green-400"/>, 
        perLevel: '+5%' 
    },
    { 
        id: 'gold_boost', 
        name: t('ascension_gold_name'), 
        desc: t('ascension_gold_desc'), 
        details: t('ascension_gold_details'),
        icon: <DollarSign size={18} className="text-yellow-400"/>, 
        perLevel: '+5%' 
    },
    { 
        id: 'damage_boost', 
        name: t('ascension_dmg_name'), 
        desc: t('ascension_dmg_desc'), 
        details: t('ascension_dmg_details'),
        icon: <Swords size={18} className="text-red-400"/>, 
        perLevel: '+5%' 
    },
    { 
        id: 'loot_boost', 
        name: t('ascension_loot_name'), 
        desc: t('ascension_loot_desc'), 
        details: t('ascension_loot_details'),
        icon: <Gift size={18} className="text-purple-400"/>, 
        perLevel: '+1%' 
    },
    { 
        id: 'hp_boost', 
        name: t('ascension_hp_name'), 
        desc: t('ascension_hp_desc'), 
        details: t('ascension_hp_details'),
        icon: <Heart size={18} className="text-red-500"/>, 
        perLevel: '+1%' 
    },
    { 
        id: 'mana_boost', 
        name: t('ascension_mana_name'), 
        desc: t('ascension_mana_desc'), 
        details: t('ascension_mana_details'),
        icon: <Zap size={18} className="text-blue-400"/>, 
        perLevel: '+1%' 
    },
    { 
        id: 'potion_hp_boost', 
        name: t('ascension_pot_hp_name'), 
        desc: t('ascension_pot_hp_desc'), 
        details: t('ascension_pot_hp_details'),
        icon: <FlaskConical size={18} className="text-red-400"/>, 
        perLevel: '+2%' 
    },
    { 
        id: 'potion_mana_boost', 
        name: t('ascension_pot_mana_name'), 
        desc: t('ascension_pot_mana_desc'), 
        details: t('ascension_pot_mana_details'),
        icon: <FlaskConical size={18} className="text-blue-400"/>, 
        perLevel: '+2%' 
    },
    { 
        id: 'boss_cd', 
        name: t('ascension_boss_name'), 
        desc: t('ascension_boss_desc'), 
        details: t('ascension_boss_details'),
        icon: <Clock size={18} className="text-orange-400"/>, 
        perLevel: '-1%' 
    },
    { 
        id: 'soul_gain', 
        name: t('ascension_soul_name'), 
        desc: t('ascension_soul_desc'), 
        details: t('ascension_soul_details'),
        icon: <Ghost size={18} className="text-gray-300"/>, 
        perLevel: '+5%' 
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1a051a] text-purple-100 overflow-hidden relative">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/80 pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 p-6 flex items-center justify-between border-b border-purple-900/50 bg-black/40 shadow-xl">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900/30 border border-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
                    <Ghost size={32} className="text-purple-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-serif text-purple-200 tracking-wider drop-shadow-md">Soul War</h2>
                    <div className="text-xs text-purple-400 uppercase tracking-widest font-bold">{t('ascension_title')}</div>
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="text-[10px] uppercase text-purple-500 font-bold mb-1">{t('ascension_points')}</div>
                <div className="text-3xl font-mono font-bold text-white drop-shadow-[0_0_10px_purple]">{player.soulPoints}</div>
            </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
            
            {/* Left: Ascend Action */}
            <div className="w-full md:w-1/3 bg-black/40 border border-purple-900/30 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <Skull size={64} className={`mb-4 ${canAscend ? 'text-purple-400 animate-bounce' : 'text-gray-700'}`} />
                <h3 className="text-xl font-bold text-white mb-2">{t('ascension_reset_title')}</h3>
                <p className="text-xs text-purple-300 mb-6 leading-relaxed">
                    {t('ascension_reset_desc')}
                </p>

                <div className="bg-purple-900/20 border border-purple-800 p-4 rounded w-full mb-6">
                    <div className="text-[10px] uppercase text-purple-400 font-bold mb-1">{t('ascension_reset_gain')}</div>
                    <div className={`text-4xl font-bold ${pointsToGain > 0 ? 'text-green-400' : 'text-gray-600'}`}>+{pointsToGain}</div>
                    <div className="text-[9px] text-gray-500 mt-2">
                        {t('ascension_reset_req')}
                    </div>
                </div>

                {!showConfirm ? (
                    <button 
                        onClick={() => setShowConfirm(true)}
                        disabled={!canAscend}
                        className={`w-full py-3 font-bold text-sm rounded border transition-all shadow-lg uppercase tracking-wider
                            ${canAscend 
                                ? 'bg-purple-700 hover:bg-purple-600 text-white border-purple-500 shadow-purple-900/50' 
                                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}
                        `}
                    >
                        {canAscend ? t('ascension_btn') : `Level ${player.level} / 30`}
                    </button>
                ) : (
                    <div className="w-full animate-in fade-in zoom-in duration-200">
                        <p className="text-red-400 text-xs font-bold mb-2">{t('ascension_confirm')}</p>
                        <div className="flex gap-2">
                            <button onClick={onAscend} className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 rounded font-bold border border-red-700">{t('ascension_btn_confirm')}</button>
                            <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-bold">{t('ascension_btn_cancel')}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Skill Tree */}
            <div className="flex-1 bg-black/40 border border-purple-900/30 rounded-lg p-4 flex flex-col shadow-lg overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-4 border-b border-purple-900/30 pb-2">
                    <TrendingUp size={18} className="text-purple-400"/>
                    <h3 className="text-lg font-bold text-gray-200">{t('ascension_tree')}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {TALENTS.map(talent => {
                        const currentLevel = player.ascension?.[talent.id] || 0;
                        const cost = getAscensionUpgradeCost(talent.id, currentLevel);
                        const canAfford = player.soulPoints >= cost;
                        const bonusValue = getAscensionBonusValue(player, talent.id);
                        const isExpanded = activeInfo === talent.id;

                        return (
                            <div key={talent.id} className="flex flex-col bg-[#1a1a1a] border border-[#333] rounded transition-all hover:border-purple-700">
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-black border border-[#444] rounded flex items-center justify-center shadow-inner group-hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all">
                                            {talent.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-200 group-hover:text-purple-300">{talent.name}</div>
                                            <div className="text-[10px] text-gray-500">{talent.desc}</div>
                                            <div className="text-[10px] mt-1 text-purple-400 font-mono">Current: Level {currentLevel} (+{bonusValue}% / {talent.perLevel})</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* INFO BUTTON */}
                                        <button 
                                            onClick={() => toggleInfo(talent.id)}
                                            className={`
                                                flex flex-col items-center justify-center w-12 py-1.5 rounded border transition-all
                                                ${isExpanded 
                                                    ? 'bg-blue-900/60 border-blue-500 text-white' 
                                                    : 'bg-[#222] border-[#444] text-blue-300 hover:bg-[#333] hover:border-blue-500'}
                                            `}
                                            title="View Details"
                                        >
                                            {isExpanded ? <X size={14}/> : <Info size={14} />}
                                            <span className="text-[9px] font-bold mt-0.5">INFO</span>
                                        </button>

                                        {/* UPGRADE BUTTON */}
                                        <button 
                                            onClick={() => onUpgrade(talent.id)}
                                            disabled={!canAfford}
                                            className={`
                                                flex flex-col items-center justify-center w-20 py-1.5 rounded border transition-all
                                                ${canAfford 
                                                    ? 'bg-purple-900/40 hover:bg-purple-800 border-purple-600 text-purple-200' 
                                                    : 'bg-[#111] border-[#333] text-gray-600 cursor-not-allowed'}
                                            `}
                                        >
                                            <span className="text-[10px] uppercase font-bold">{t('ascension_upgrade')}</span>
                                            <span className="text-xs font-mono font-bold">{cost} SP</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Info Section */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
                                        <div className="bg-blue-950/30 border border-blue-900/50 rounded p-2.5 text-xs text-blue-100 leading-relaxed shadow-inner">
                                            <div className="flex items-center gap-2 mb-1 text-blue-400 font-bold uppercase text-[10px] tracking-wider">
                                                <Info size={12} /> {t('ascension_tech_detail')}
                                            </div>
                                            {talent.details}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    </div>
  );
};
