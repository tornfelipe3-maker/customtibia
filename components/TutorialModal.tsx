
import React from 'react';
import { AlertTriangle, Crown, Sparkles, Info, Ghost, XCircle, CheckCircle, Skull } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialModalProps {
  type: any; // 'mob' | 'item' | 'ascension' | 'level12'
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ type, onClose }) => {
  const { t } = useLanguage();
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="tibia-panel w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#444] relative flex flex-col">
        
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-3 flex items-center gap-2">
            <Info size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-[#eee] font-serif tracking-wide">
                {type === 'mob' ? t('tut_mob_title') : type === 'item' ? t('tut_item_title') : type === 'level12' ? t('tut_level12_title') : t('tut_ascension_title')}
            </h2>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#222] text-[#ccc] flex-1">
            
            {/* Level 12 Warning (NEW) */}
            {type === 'level12' && (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-4 bg-red-900/20 rounded-full border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse">
                            <Skull size={48} className="text-red-500" />
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-red-400 uppercase tracking-widest">{t('tut_level12_title')}</h3>
                    
                    <p className="text-sm leading-relaxed text-gray-300">
                        {t('tut_level12_desc')}
                    </p>

                    <div className="bg-black/40 border border-[#333] p-4 rounded text-xs text-gray-400 italic">
                        "Be prepared for anything. Carry potions, upgrade your gear, and stay vigilant. The world has become much more dangerous."
                    </div>
                </div>
            )}

            {/* Rare Mob Alert Layout */}
            {type === 'mob' && (
                <div className="space-y-6">
                    <p className="text-sm leading-relaxed mb-4">
                        {t('tut_mob_desc')}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-950/20 border border-red-900/50 p-3 rounded text-center">
                            <div className="flex justify-center mb-2"><AlertTriangle className="text-red-500" size={24}/></div>
                            <h3 className="text-red-400 font-bold text-sm uppercase mb-1">{t('tut_enraged')}</h3>
                            <p className="text-[10px] text-gray-400"> {t('tut_enraged_desc')}</p>
                        </div>

                        <div className="bg-yellow-950/20 border border-yellow-900/50 p-3 rounded text-center">
                            <div className="flex justify-center mb-2"><Crown className="text-yellow-500" size={24}/></div>
                            <h3 className="text-yellow-400 font-bold text-sm uppercase mb-1">{t('tut_blessed')}</h3>
                            <p className="text-[10px] text-gray-400"> {t('tut_blessed_desc')}</p>
                        </div>

                        <div className="bg-purple-950/20 border border-purple-900/50 p-3 rounded text-center">
                            <div className="flex justify-center mb-2"><Sparkles className="text-purple-500" size={24}/></div>
                            <h3 className="text-purple-400 font-bold text-sm uppercase mb-1">{t('tut_corrupted')}</h3>
                            <p className="text-[10px] text-gray-400"> {t('tut_corrupted_desc')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rare Item Alert Layout */}
            {type === 'item' && (
                <div className="space-y-6">
                    <p className="text-sm leading-relaxed mb-4">
                        {t('tut_item_desc')}
                    </p>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-[#151515] p-2 rounded border border-green-600">
                            <div className="w-8 h-8 border border-green-500 bg-green-900/20 rounded flex items-center justify-center text-xs font-bold text-green-400">U</div>
                            <div>
                                <div className="text-green-400 font-bold text-xs">{t('tut_rarity_u')}</div>
                                <div className="text-[10px] text-gray-500">{t('tut_rarity_u_desc')}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#151515] p-2 rounded border border-blue-500">
                            <div className="w-8 h-8 border border-blue-400 bg-blue-900/20 rounded flex items-center justify-center text-xs font-bold text-blue-300">R</div>
                            <div>
                                <div className="text-blue-300 font-bold text-xs">{t('tut_rarity_r')}</div>
                                <div className="text-[10px] text-gray-500">{t('tut_rarity_r_desc')}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#151515] p-2 rounded border border-purple-500">
                            <div className="w-8 h-8 border border-purple-500 bg-purple-900/20 rounded flex items-center justify-center text-xs font-bold text-purple-400">E</div>
                            <div>
                                <div className="text-purple-400 font-bold text-xs">{t('tut_rarity_e')}</div>
                                <div className="text-[10px] text-gray-500">{t('tut_rarity_e_desc')}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#151515] p-2 rounded border border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            <div className="w-8 h-8 border border-orange-500 bg-orange-900/20 rounded flex items-center justify-center text-xs font-bold text-orange-400 animate-pulse">L</div>
                            <div>
                                <div className="text-orange-400 font-bold text-xs flex items-center gap-1">{t('tut_rarity_l')} <Sparkles size={10} /></div>
                                <div className="text-[10px] text-gray-500">{t('tut_rarity_l_desc')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-400 italic text-center mt-2">
                        {t('tut_item_tip')}
                    </div>
                </div>
            )}

            {/* Ascension Tutorial Layout */}
            {type === 'ascension' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-purple-900/20 rounded-full border border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)] animate-pulse">
                            <Ghost size={48} className="text-purple-300"/>
                        </div>
                    </div>

                    <p className="text-sm leading-relaxed text-center mb-6 text-purple-100">
                        {t('tut_ascension_desc')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-950/20 border border-red-900/50 p-3 rounded">
                            <h3 className="text-red-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                                <XCircle size={14}/> {t('tut_asc_lose_title')}
                            </h3>
                            <p className="text-[11px] text-gray-400 leading-snug">
                                {t('tut_asc_lose_desc')}
                            </p>
                        </div>

                        <div className="bg-green-950/20 border border-green-900/50 p-3 rounded">
                            <h3 className="text-green-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                                <CheckCircle size={14}/> {t('tut_asc_keep_title')}
                            </h3>
                            <p className="text-[11px] text-gray-400 leading-snug">
                                {t('tut_asc_keep_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-purple-950/40 border border-purple-800 p-3 rounded text-center">
                        <h3 className="text-purple-300 font-bold text-sm uppercase mb-1">{t('tut_asc_gain_title')}</h3>
                        <p className="text-xs text-purple-200">
                            {t('tut_asc_gain_desc')}
                        </p>
                    </div>

                    <div className="bg-yellow-900/10 border border-yellow-700/30 p-2 rounded text-center">
                        <p className="text-[10px] text-yellow-500 font-bold italic">
                            {t('tut_asc_note_extra')}
                        </p>
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1a1a1a] border-t border-[#333]">
            <button 
                onClick={onClose}
                className="tibia-btn w-full py-2 font-bold text-sm bg-[#333] hover:bg-[#444] text-white border-[#555]"
            >
                {t('tut_btn_close')}
            </button>
        </div>

      </div>
    </div>
  );
};
