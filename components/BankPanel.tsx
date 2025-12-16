
import React, { useState } from 'react';
import { Coins, ArrowRight, ArrowLeft, Landmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BankPanelProps {
  playerGold: number;
  bankGold: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

export const BankPanel: React.FC<BankPanelProps> = ({ playerGold, bankGold, onDeposit, onWithdraw }) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>('');

  const handleDeposit = () => {
    const val = parseInt(amount);
    if (!isNaN(val) && val > 0) {
      onDeposit(val);
      setAmount('');
    }
  };

  const handleWithdraw = () => {
    const val = parseInt(amount);
    if (!isNaN(val) && val > 0) {
      onWithdraw(val);
      setAmount('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2 text-yellow-600">
          <Landmark size={20} />
          <h2 className="text-lg font-bold font-serif">Royal Bank</h2>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
         
         <div className="w-full grid grid-cols-2 gap-4">
             <div className="bg-[#2d2d2d] border border-[#444] p-4 rounded text-center">
                 <div className="text-xs text-gray-400 uppercase mb-1">{t('bank_balance_char')}</div>
                 <div className="text-xl font-bold text-yellow-500 flex justify-center items-center">
                    <Coins size={16} className="mr-2"/>
                    {playerGold.toLocaleString()}
                 </div>
                 <div className="text-[10px] text-red-400 mt-1">{t('bank_risk')}</div>
             </div>
             <div className="bg-[#2d2d2d] border border-[#444] p-4 rounded text-center">
                 <div className="text-xs text-gray-400 uppercase mb-1">{t('bank_balance_acc')}</div>
                 <div className="text-xl font-bold text-blue-400 flex justify-center items-center">
                    <Landmark size={16} className="mr-2"/>
                    {bankGold.toLocaleString()}
                 </div>
                 <div className="text-[10px] text-green-400 mt-1">{t('bank_safe')}</div>
             </div>
         </div>

         <div className="w-full max-w-sm space-y-4 bg-[#2a2a2a] p-4 rounded border border-[#333]">
             <div className="flex items-center bg-[#111] border border-[#444] p-2 rounded">
                <input 
                  type="number" 
                  className="bg-transparent border-none outline-none text-white w-full font-bold text-right pr-2"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="text-yellow-600 font-bold text-xs">GP</span>
             </div>

             <div className="flex justify-between gap-2 text-[10px]">
                <button onClick={() => setAmount('1000')} className="bg-[#333] hover:bg-[#444] px-2 py-1 rounded text-gray-300">+1k</button>
                <button onClick={() => setAmount('10000')} className="bg-[#333] hover:bg-[#444] px-2 py-1 rounded text-gray-300">+10k</button>
                <button onClick={() => setAmount(playerGold.toString())} className="bg-[#333] hover:bg-[#444] px-2 py-1 rounded text-gray-300">{t('bank_max_dep')}</button>
                <button onClick={() => setAmount(bankGold.toString())} className="bg-[#333] hover:bg-[#444] px-2 py-1 rounded text-gray-300">{t('bank_max_wit')}</button>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-2">
                 <button 
                    onClick={handleDeposit}
                    disabled={playerGold <= 0}
                    className="flex flex-col items-center justify-center p-3 bg-blue-900/50 hover:bg-blue-900 border border-blue-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <div className="flex items-center text-blue-200 font-bold mb-1">{t('bank_deposit')} <ArrowRight size={14} className="ml-1"/></div>
                    <span className="text-[10px] text-blue-400/70">{t('bank_to_bank')}</span>
                 </button>

                 <button 
                    onClick={handleWithdraw}
                    disabled={bankGold <= 0}
                    className="flex flex-col items-center justify-center p-3 bg-yellow-900/50 hover:bg-yellow-900 border border-yellow-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <div className="flex items-center text-yellow-200 font-bold mb-1"><ArrowLeft size={14} className="mr-1"/> {t('bank_withdraw')}</div>
                    <span className="text-[10px] text-yellow-400/70">{t('bank_to_bp')}</span>
                 </button>
             </div>
         </div>

      </div>
    </div>
  );
};
