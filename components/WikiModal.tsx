
import React, { useState } from 'react';
/* Added Coins to the lucide-react imports */
import { BookOpen, X, Sword, Shield, Star, Zap, RefreshCw, Ghost, Target, Gem, Crown, DollarSign, Gift, Clock, Footprints, Skull, Sparkles, AlertTriangle, Coins } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WikiCategory = 'basics' | 'rarity' | 'bonuses' | 'systems';

export const WikiModal: React.FC<WikiModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<WikiCategory>('basics');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeCategory) {
      case 'basics':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* TASKS EMPHASIS */}
            <section className="bg-orange-900/20 border-2 border-orange-600 rounded-lg p-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <h3 className="text-orange-400 font-black text-xl mb-2 flex items-center gap-2 uppercase tracking-tighter">
                    <Skull size={24} /> {t('wiki_tasks_fast_title')}
                </h3>
                <p className="text-sm text-gray-200 font-bold mb-3">
                    {t('wiki_tasks_fast_desc')}
                </p>
                <div className="bg-black/40 p-3 rounded border border-orange-900/50 text-xs text-orange-200 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <span>Multiplicador de XP massivo ao completar.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <span>Recompensas de Ouro garantidas para novos equipamentos.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <span>Novos contratos gerados a cada 20 horas gratuitamente.</span>
                    </div>
                </div>
            </section>

            <section>
              <h3 className="text-yellow-500 font-bold text-lg mb-2 flex items-center gap-2">
                <Sword size={18} /> {t('wiki_basics_combat')}
              </h3>
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {t('wiki_basics_combat_desc')}
              </p>
              <ul className="grid grid-cols-1 gap-2 text-xs">
                <li className="bg-[#1a1a1a] p-2 border border-[#333] rounded">
                  <strong className="text-red-400 block mb-1">{t('voc_knight')}</strong>
                  {t('voc_knight_desc')}
                </li>
                <li className="bg-[#1a1a1a] p-2 border border-[#333] rounded">
                  <strong className="text-orange-400 block mb-1">{t('voc_paladin')}</strong>
                  {t('voc_paladin_desc')}
                </li>
                <li className="bg-[#1a1a1a] p-2 border border-[#333] rounded">
                  <strong className="text-purple-400 block mb-1">{t('voc_sorcerer')}</strong>
                  {t('voc_sorcerer_desc')}
                </li>
                <li className="bg-[#1a1a1a] p-2 border border-[#333] rounded">
                  <strong className="text-cyan-400 block mb-1">{t('voc_druid')}</strong>
                  {t('voc_druid_desc')}
                </li>
              </ul>
            </section>

            <section>
                <h3 className="text-green-500 font-bold text-lg mb-2 flex items-center gap-2">
                    <Zap size={18} /> {t('wiki_basics_skills')}
                </h3>
                <p className="text-sm text-gray-300 mb-2">
                    {t('wiki_basics_skills_desc')}
                </p>
                <div className="bg-blue-900/20 border border-blue-800/50 p-3 rounded text-xs text-blue-200">
                    {t('wiki_basics_skills_tip')}
                </div>
            </section>
          </div>
        );

      case 'rarity':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <section>
              <h3 className="text-purple-400 font-bold text-lg mb-2 flex items-center gap-2">
                <Gem size={18} /> {t('wiki_rarity_title')}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {t('wiki_rarity_desc')}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded border border-gray-600">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 bg-black rounded">C</div>
                    <div className="flex-1">
                        <div className="text-gray-400 font-bold text-xs">{t('wiki_rarity_c')}</div>
                        <div className="text-[10px] text-gray-600">{t('wiki_rarity_c_desc')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded border border-green-600">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-green-400 bg-green-900/20 rounded">U</div>
                    <div className="flex-1">
                        <div className="text-green-400 font-bold text-xs">{t('tut_rarity_u')}</div>
                        <div className="text-[10px] text-gray-500">{t('tut_rarity_u_desc')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded border border-blue-500">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-blue-300 bg-blue-900/20 rounded">R</div>
                    <div className="flex-1">
                        <div className="text-blue-300 font-bold text-xs">{t('tut_rarity_r')}</div>
                        <div className="text-[10px] text-gray-500">{t('tut_rarity_r_desc')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded border border-purple-500">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-purple-400 bg-purple-900/20 rounded">E</div>
                    <div className="flex-1">
                        <div className="text-purple-400 font-bold text-xs">{t('tut_rarity_e')}</div>
                        <div className="text-[10px] text-gray-500">{t('tut_rarity_e_desc')}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded border border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-orange-400 bg-orange-900/20 rounded animate-pulse">L</div>
                    <div className="flex-1">
                        <div className="text-orange-400 font-bold text-xs">{t('tut_rarity_l')}</div>
                        <div className="text-[10px] text-gray-500">{t('tut_rarity_l_desc')}</div>
                    </div>
                </div>
              </div>
            </section>

            <section>
                <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2 border-b border-[#333] pb-1">
                    <RefreshCw size={14} /> {t('wiki_reforge_title')}
                </h3>
                <p className="text-xs text-gray-400">
                    {t('wiki_reforge_desc')}
                </p>
            </section>
          </div>
        );

      case 'bonuses':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <section>
              <h3 className="text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Star size={18} /> {t('wiki_bonus_title')}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                {t('wiki_bonus_desc')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div className="bg-[#222] p-2 border border-blue-900/30 rounded">
                    <div className="text-blue-300 font-bold text-xs">{t('affix_xp')}</div>
                    <div className="text-[10px] text-gray-500">{t('affix_xp_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-yellow-900/30 rounded">
                    <div className="text-yellow-300 font-bold text-xs">{t('affix_loot')}</div>
                    <div className="text-[10px] text-gray-500">{t('affix_loot_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-red-900/30 rounded">
                    <div className="text-red-400 font-bold text-xs">{t('affix_crit')}</div>
                    <div className="text-[10px] text-gray-500">{t('affix_crit_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-orange-900/30 rounded">
                    <div className="text-orange-400 font-bold text-xs">{t('affix_speed')}</div>
                    <div className="text-[10px] text-gray-500">{t('affix_speed_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-red-900/50 rounded shadow-md">
                    <div className="text-red-500 font-bold text-xs">{t('affix_boss')}</div>
                    <div className="text-[10px] text-gray-400">{t('affix_boss_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-white/30 rounded shadow-md">
                    <div className="text-white font-bold text-xs">{t('affix_dodge')}</div>
                    <div className="text-[10px] text-gray-400">{t('affix_dodge_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-yellow-500/30 rounded shadow-md">
                    <div className="text-yellow-500 font-bold text-xs">{t('affix_gold')}</div>
                    <div className="text-[10px] text-gray-400">{t('affix_gold_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-red-700/50 rounded shadow-md">
                    <div className="text-red-600 font-bold text-xs">{t('affix_exec')}</div>
                    <div className="text-[10px] text-gray-400">{t('affix_exec_desc')}</div>
                 </div>
                 <div className="bg-[#222] p-2 border border-green-500/30 rounded shadow-md">
                    <div className="text-green-500 font-bold text-xs">{t('affix_reflect')}</div>
                    <div className="text-[10px] text-gray-400">{t('affix_reflect_desc')}</div>
                 </div>
              </div>
            </section>
          </div>
        );

      case 'systems':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             {/* HAZARD SYSTEM */}
             <section className="bg-red-900/10 border border-red-800/30 p-3 rounded">
                <h3 className="text-red-500 font-bold text-sm mb-2 flex items-center gap-2 border-b border-red-900/30 pb-1">
                    <AlertTriangle size={14} /> {t('menu_hazard')}
                </h3>
                <p className="text-xs text-gray-300 mb-2">
                    Aumente o nível de perigo das áreas de caça para ganhar bônus de XP e Loot massivos. No entanto, os monstros tornam-se mortais, ganhando dano, crítico e esquiva.
                </p>
                <p className="text-[10px] text-gray-500 italic">
                    * Desafie a Primal Menace para aumentar seu nível máximo de Hazard.
                </p>
             </section>

             {/* IMBUEMENTS */}
             <section className="bg-purple-900/10 border border-purple-800/30 p-3 rounded">
                <h3 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2 border-b border-purple-900/30 pb-1">
                    <Sparkles size={14} /> {t('menu_imbuement')}
                </h3>
                <p className="text-xs text-gray-300 mb-2">
                    Encante sua alma com bônus de Vampirism (Life Steal), Void (Mana Leech) ou Strike (Critical). Cada imbuement dura 3 horas de jogo ativo.
                </p>
                <div className="text-[10px] text-purple-400 flex items-center gap-1">
                    <Coins size={10} /> Requer Gold Tokens dropados de Chefes.
                </div>
             </section>

             <section className="mb-6">
                <h3 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2 border-b border-[#333] pb-1">
                    <Ghost size={14} /> {t('wiki_ascension_title')}
                </h3>
                <p className="text-xs text-gray-300 mb-4">
                    {t('wiki_ascension_desc')}
                </p>

                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">{t('wiki_ascension_perks')}</h4>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="bg-[#222] border border-[#333] p-2 rounded flex items-start gap-2">
                            <BookOpen size={14} className="text-green-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-green-400 text-xs font-bold">{t('ascension_xp_name')}</div>
                                <div className="text-[10px] text-gray-500">{t('ascension_xp_details')}</div>
                            </div>
                        </div>
                        <div className="bg-[#222] border border-[#333] p-2 rounded flex items-start gap-2">
                            <DollarSign size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-yellow-400 text-xs font-bold">{t('ascension_gold_name')}</div>
                                <div className="text-[10px] text-gray-500">{t('ascension_gold_details')}</div>
                            </div>
                        </div>
                        <div className="bg-[#222] border border-[#333] p-2 rounded flex items-start gap-2">
                            <Sword size={14} className="text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-red-400 text-xs font-bold">{t('ascension_dmg_name')}</div>
                                <div className="text-[10px] text-gray-500">{t('ascension_dmg_details')}</div>
                            </div>
                        </div>
                    </div>
                </div>
             </section>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="tibia-panel w-full max-w-4xl h-[600px] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-yellow-600" />
                <h2 className="font-bold text-[#eee] text-lg font-serif tracking-wide">{t('wiki_title')}</h2>
            </div>
            <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden bg-[#222]">
            
            {/* Sidebar Navigation */}
            <div className="w-48 bg-[#1a1a1a] border-r border-[#333] flex flex-col p-2 gap-1 shadow-inner">
                <button 
                    onClick={() => setActiveCategory('basics')}
                    className={`text-left px-3 py-2.5 text-xs font-bold rounded border transition-all flex items-center gap-2 ${activeCategory === 'basics' ? 'bg-[#333] text-white border-[#555]' : 'text-gray-500 border-transparent hover:bg-[#222]'}`}
                >
                    <Sword size={14} /> {t('wiki_tab_basics')}
                </button>
                <button 
                    onClick={() => setActiveCategory('rarity')}
                    className={`text-left px-3 py-2.5 text-xs font-bold rounded border transition-all flex items-center gap-2 ${activeCategory === 'rarity' ? 'bg-[#333] text-purple-300 border-[#555]' : 'text-gray-500 border-transparent hover:bg-[#222]'}`}
                >
                    <Gem size={14} /> {t('wiki_tab_rarity')}
                </button>
                <button 
                    onClick={() => setActiveCategory('bonuses')}
                    className={`text-left px-3 py-2.5 text-xs font-bold rounded border transition-all flex items-center gap-2 ${activeCategory === 'bonuses' ? 'bg-[#333] text-blue-300 border-[#555]' : 'text-gray-500 border-transparent hover:bg-[#222]'}`}
                >
                    <Star size={14} /> {t('wiki_tab_bonuses')}
                </button>
                <button 
                    onClick={() => setActiveCategory('systems')}
                    className={`text-left px-3 py-2.5 text-xs font-bold rounded border transition-all flex items-center gap-2 ${activeCategory === 'systems' ? 'bg-[#333] text-yellow-500 border-[#555]' : 'text-gray-500 border-transparent hover:bg-[#222]'}`}
                >
                    <Ghost size={14} /> {t('wiki_tab_systems')}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#181818] relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <BookOpen size={200} />
                </div>
                
                <div className="relative z-10 max-w-2xl mx-auto">
                    {renderContent()}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
