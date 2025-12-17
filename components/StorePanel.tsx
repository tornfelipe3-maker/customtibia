
import React, { useState } from 'react';
import { Player } from '../types';
import { ShoppingCart, Zap, Crown, Coins, CreditCard, Clock, Gift, Swords } from 'lucide-react';

interface StorePanelProps {
  player: Player;
  onBuyCoins: (amount: number) => void;
  onBuyPremium: () => void;
  onBuyBoost: () => void;
}

export const StorePanel: React.FC<StorePanelProps> = ({ player, onBuyCoins, onBuyPremium, onBuyBoost }) => {
  const [activeTab, setActiveTab] = useState<'store' | 'coins'>('store');

  const premiumTimeLeft = player.premiumUntil > Date.now() ? Math.ceil((player.premiumUntil - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const boostTimeLeft = player.xpBoostUntil > Date.now() ? Math.ceil((player.xpBoostUntil - Date.now()) / (1000 * 60)) : 0;

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#ccc]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900/40 to-[#121212] border-b border-[#333] flex justify-between items-center shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 border border-blue-500 rounded text-blue-300">
                    <ShoppingCart size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-serif text-white tracking-wide">Tibia Store</h2>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Premium Services</div>
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-blue-300 uppercase font-bold mb-1">Your Balance</div>
                <div className="text-2xl font-bold text-yellow-400 drop-shadow-md flex items-center gap-1">
                    {player.tibiaCoins.toLocaleString()} <span className="text-xs text-yellow-600">TC</span>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333] bg-[#1a1a1a]">
            <button 
                onClick={() => setActiveTab('store')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'store' ? 'bg-[#2a2a2a] text-blue-300 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-[#222]'}`}
            >
                <div className="flex items-center justify-center gap-2"><ShoppingCart size={14}/> Shop</div>
            </button>
            <button 
                onClick={() => setActiveTab('coins')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'coins' ? 'bg-[#2a2a2a] text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:bg-[#222]'}`}
            >
                <div className="flex items-center justify-center gap-2"><Coins size={14}/> Buy Coins</div>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top,#1a1a1a_0%,#000_100%)]">
            
            {activeTab === 'store' && (
                <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* PREMIUM ACCOUNT CARD */}
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden group hover:border-yellow-600 transition-all shadow-lg flex flex-col">
                        <div className="h-32 bg-gradient-to-br from-yellow-900/40 to-black relative flex items-center justify-center border-b border-[#333]">
                            <div className="absolute inset-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] opacity-10"></div>
                            <Crown size={64} className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] group-hover:scale-110 transition-transform duration-500" />
                            {premiumTimeLeft > 0 && (
                                <div className="absolute top-2 right-2 bg-green-900/80 text-green-300 text-[10px] font-bold px-2 py-1 rounded border border-green-700 flex items-center gap-1">
                                    <Clock size={10} /> Active: {premiumTimeLeft} Days
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-yellow-100 mb-1">Premium Account</h3>
                            <p className="text-xs text-yellow-500/80 font-bold uppercase mb-4">7 Days Access</p>
                            
                            <ul className="text-xs text-gray-400 space-y-2 mb-6 flex-1">
                                <li className="flex items-center gap-2"><Zap size={12} className="text-yellow-500"/> +100% Experience Gain</li>
                                <li className="flex items-center gap-2"><Swords size={12} className="text-red-500"/> +50% Damage Dealt</li>
                                <li className="flex items-center gap-2"><Gift size={12} className="text-blue-400"/> +20% Loot Chance</li>
                            </ul>

                            <button 
                                onClick={onBuyPremium}
                                className="w-full py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold rounded shadow-lg border border-yellow-500/50 flex items-center justify-center gap-2 group-active:scale-95 transition-all"
                            >
                                <Coins size={14} className="text-yellow-200" /> 50 TC
                            </button>
                        </div>
                    </div>

                    {/* XP BOOST CARD */}
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden group hover:border-green-600 transition-all shadow-lg flex flex-col">
                        <div className="h-32 bg-gradient-to-br from-green-900/40 to-black relative flex items-center justify-center border-b border-[#333]">
                            <div className="absolute inset-0 bg-[url('https://tibia.fandom.com/wiki/Special:FilePath/Background_Artwork_Texture.jpg')] opacity-10"></div>
                            <Zap size={64} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform duration-500" />
                            {boostTimeLeft > 0 && (
                                <div className="absolute top-2 right-2 bg-green-900/80 text-green-300 text-[10px] font-bold px-2 py-1 rounded border border-green-700 flex items-center gap-1">
                                    <Clock size={10} /> Active: {boostTimeLeft} Mins
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-green-100 mb-1">XP Boost</h3>
                            <p className="text-xs text-green-500/80 font-bold uppercase mb-4">1 Hour Duration</p>
                            
                            <ul className="text-xs text-gray-400 space-y-2 mb-6 flex-1">
                                <li className="flex items-center gap-2"><Zap size={12} className="text-green-500"/> +200% Experience Gain</li>
                                <li className="flex items-center gap-2"><Clock size={12} className="text-blue-400"/> Stacks with Premium</li>
                                <li className="flex items-center gap-2"><Gift size={12} className="text-purple-400"/> Stacks with Prey XP</li>
                            </ul>

                            <button 
                                onClick={onBuyBoost}
                                className="w-full py-3 bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white font-bold rounded shadow-lg border border-green-500/50 flex items-center justify-center gap-2 group-active:scale-95 transition-all"
                            >
                                <Coins size={14} className="text-yellow-200" /> 10 TC
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'coins' && (
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-8 p-6 bg-black/40 rounded-lg border border-[#333]">
                        <CreditCard size={48} className="mx-auto text-blue-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-200 mb-2">Get Tibia Coins</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Support the server and unlock premium features. Payments are processed securely via Pix (Simulated).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { amount: 50, price: 'R$ 5,00', color: 'bg-gray-800' },
                            { amount: 250, price: 'R$ 20,00', color: 'bg-blue-900/20 border-blue-800' },
                            { amount: 750, price: 'R$ 50,00', color: 'bg-purple-900/20 border-purple-800' },
                            { amount: 1500, price: 'R$ 100,00', color: 'bg-yellow-900/20 border-yellow-800' },
                        ].map((pack) => (
                            <button
                                key={pack.amount}
                                onClick={() => onBuyCoins(pack.amount)}
                                className={`flex items-center justify-between p-4 rounded border border-[#333] hover:border-gray-500 transition-all group ${pack.color}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Coins size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <div className="font-bold text-white text-lg">{pack.amount} TC</div>
                                        <div className="text-[10px] text-gray-400 uppercase">Coin Pack</div>
                                    </div>
                                </div>
                                <div className="font-bold text-green-400 bg-black/50 px-3 py-1.5 rounded">
                                    {pack.price}
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <p className="text-[9px] text-gray-600 mt-6">
                        * In this alpha version, clicking buy adds coins instantly for testing purposes.
                    </p>
                </div>
            )}

        </div>
    </div>
  );
};
