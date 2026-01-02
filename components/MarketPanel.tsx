
import React, { useState, useEffect } from 'react';
import { MarketService, MarketListing } from '../services/market';
import { Item, Player } from '../types';
import { Coins, Search, ShoppingBag, Tag, History, Trash2, ArrowUpRight, Sparkles, AlertCircle, RefreshCw, X, Check, Loader2 } from 'lucide-react';
import { ItemTooltip } from './ItemTooltip';
import { Sprite } from './common/Sprite';

interface MarketPanelProps {
    player: Player;
    userId: string;
    onBuyMarket: (listing: MarketListing) => void;
    onListMarket: (item: Item, price: number) => void;
    onCancelMarket: (listing: MarketListing) => void;
}

export const MarketPanel: React.FC<MarketPanelProps> = ({ player, userId, onBuyMarket, onListMarket, onCancelMarket }) => {
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'sell'>('browse');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoverItem, setHoverItem] = useState<Item | null>(null);
    const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

    // Controle de processamento para evitar duplo clique e duplicação
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    // Estados para o Modal de Venda
    const [selectedForSale, setSelectedForSale] = useState<Item | null>(null);
    const [salePrice, setSalePrice] = useState<string>("25");

    const refreshMarket = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await MarketService.getListings();
            setListings(data);
        } catch (e) {
            console.error("Erro ao carregar mercado:", e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        refreshMarket();

        const subscription = MarketService.subscribeToListings(() => {
            refreshMarket(true);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleHover = (item: Item | null, e: React.MouseEvent) => {
        if (item) {
            setHoverItem(item);
            setHoverPos({ x: e.clientX, y: e.clientY });
        } else {
            setHoverItem(null);
            setHoverPos(null);
        }
    };

    const handleConfirmSale = () => {
        const price = parseInt(salePrice);
        if (selectedForSale && price > 0) {
            onListMarket(selectedForSale, price);
            setSelectedForSale(null);
            setSalePrice("25");
        }
    };

    // Handler de cancelamento com proteção contra duplicação
    const handleCancelAction = async (listing: MarketListing) => {
        if (processingIds.has(listing.id)) return;

        // 1. Bloqueia o ID
        setProcessingIds(prev => new Set(prev).add(listing.id));
        
        // 2. Atualização Otimista: Remove da lista local imediatamente
        setListings(prev => prev.filter(l => l.id !== listing.id));

        try {
            // 3. Executa a ação real
            await onCancelMarket(listing);
        } catch (e) {
            // Se falhar, reverte a lista local e desbloqueia
            await refreshMarket(true);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(listing.id);
                return next;
            });
        }
    };

    // Handler de compra com proteção
    const handleBuyAction = async (listing: MarketListing) => {
        if (processingIds.has(listing.id)) return;
        setProcessingIds(prev => new Set(prev).add(listing.id));
        
        try {
            await onBuyMarket(listing);
            setListings(prev => prev.filter(l => l.id !== listing.id));
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(listing.id);
                return next;
            });
        }
    };

    const getRarityClass = (rarity?: string) => {
        switch (rarity) {
            case 'legendary': return 'text-orange-500 border-orange-500/50 bg-orange-900/10';
            case 'epic': return 'text-purple-400 border-purple-500/50 bg-purple-900/10';
            case 'rare': return 'text-blue-400 border-blue-500/50 bg-blue-900/10';
            case 'uncommon': return 'text-green-400 border-green-500/50 bg-green-900/10';
            default: return 'text-gray-400 border-gray-700 bg-gray-800/20';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] text-gray-200 overflow-hidden relative">
            <ItemTooltip item={hoverItem} position={hoverPos} />

            {/* MODAL DE ANÚNCIO (CUSTOM) */}
            {selectedForSale && (
                <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="tibia-panel w-full max-w-[320px] shadow-2xl p-0 flex flex-col overflow-hidden animate-in zoom-in duration-150">
                        <div className="bg-[#2d2d2d] border-b border-[#111] px-4 py-2 flex justify-between items-center shrink-0">
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Anunciar Item</span>
                            <button onClick={() => setSelectedForSale(null)} className="text-gray-500 hover:text-white"><X size={16}/></button>
                        </div>
                        
                        <div className="p-6 bg-[#222] flex flex-col items-center gap-4">
                            <div className={`w-20 h-20 border-2 rounded flex items-center justify-center bg-black/40 shadow-inner ${getRarityClass(selectedForSale.rarity)}`}>
                                <Sprite src={selectedForSale.image} size={48} className="pixelated drop-shadow-md" />
                            </div>
                            
                            <div className="text-center">
                                <div className="font-bold text-gray-100">{selectedForSale.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase">{selectedForSale.rarity} Tier</div>
                            </div>

                            <div className="w-full">
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Preço de Venda (Tibia Coins)</label>
                                <div className="flex items-center bg-black border border-[#444] rounded px-3 py-2">
                                    <Coins size={14} className="text-yellow-500 mr-2" />
                                    <input 
                                        type="number" 
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        className="bg-transparent border-none outline-none text-white w-full font-mono font-bold"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[9px] text-gray-600 mt-2 italic">* Uma taxa de 1.000 gold será cobrada.</p>
                            </div>

                            <button 
                                onClick={handleConfirmSale}
                                className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded border border-yellow-500 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Check size={18}/> CONFIRMAR ANÚNCIO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-4 bg-[#2d2d2d] border-b border-[#111] flex items-center justify-between shadow-lg shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-500">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-serif tracking-wide">Mercado Global</h2>
                        <div className="text-[10px] text-green-500 uppercase tracking-widest flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Tempo Real Ativo
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-yellow-600 font-bold uppercase">Seu Saldo</div>
                    <div className="text-xl font-bold text-yellow-400 flex items-center gap-1.5">
                        {player.tibiaCoins.toLocaleString()} <span className="text-xs">TC</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#222] border-b border-[#111] shrink-0">
                <button onClick={() => setActiveTab('browse')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'browse' ? 'bg-[#333] text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Search size={14}/> Explorar
                </button>
                <button onClick={() => setActiveTab('sell')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'sell' ? 'bg-[#333] text-green-500 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}>
                    <Tag size={14}/> Vender
                </button>
                <button onClick={() => setActiveTab('my-listings')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'my-listings' ? 'bg-[#333] text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
                    <History size={14}/> Meus Anúncios
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#0d0d0d_100%)]">
                
                {activeTab === 'browse' && (
                    <div className="space-y-4 max-w-5xl mx-auto">
                        <div className="flex gap-2 bg-[#222] p-2 rounded border border-[#333]">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-500"/>
                                <input 
                                    type="text" 
                                    placeholder="Buscar item..." 
                                    className="w-full bg-[#111] border border-[#444] rounded pl-9 pr-3 py-2 text-sm outline-none focus:border-yellow-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => refreshMarket()} className="tibia-btn px-4 py-2 text-xs font-bold flex items-center gap-2">
                                <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/> Forçar Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 opacity-30 uppercase font-bold tracking-widest">Sincronizando com o Quadro...</div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 italic">Nenhum item à venda no momento.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {listings.filter(l => l.item_data.name.toLowerCase().includes(searchTerm.toLowerCase())).map(listing => (
                                    <div key={listing.id} className={`p-3 rounded border flex items-center justify-between group hover:bg-black/40 transition-all ${getRarityClass(listing.item_data.rarity)}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-black/60 border border-white/5 rounded flex items-center justify-center relative shadow-inner overflow-hidden"
                                                onMouseEnter={(e) => handleHover(listing.item_data, e)}
                                                onMouseLeave={(e) => handleHover(null, e)}
                                            >
                                                <Sprite src={listing.item_data.image} size={40} className="pixelated drop-shadow-md group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white group-hover:text-yellow-200">{listing.item_data.name}</div>
                                                <div className="text-[10px] text-gray-500">Vendedor: {listing.seller_name}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-lg font-black text-yellow-400 font-mono">{listing.price_tc} TC</div>
                                            <button 
                                                onClick={() => handleBuyAction(listing)}
                                                disabled={processingIds.has(listing.id) || listing.seller_id === userId || player.tibiaCoins < listing.price_tc}
                                                className={`px-4 py-1.5 rounded font-bold text-xs uppercase tracking-tighter border shadow-lg transition-all flex items-center gap-2
                                                    ${listing.seller_id === userId 
                                                        ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                                        : player.tibiaCoins >= listing.price_tc
                                                            ? 'bg-yellow-700 hover:bg-yellow-600 border-yellow-500 text-white active:scale-95'
                                                            : 'bg-red-900/20 border-red-900/50 text-red-400 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {processingIds.has(listing.id) ? <Loader2 size={14} className="animate-spin"/> : (listing.seller_id === userId ? 'Seu Item' : 'Comprar')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'sell' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-lg mb-6 flex gap-3 items-start">
                            <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-200 leading-relaxed">
                                <strong>Anunciar Item:</strong> Apenas itens raros (Uncommon+) podem ser vendidos. 
                                Taxa de anúncio: <span className="text-yellow-500 font-bold">1.000 gold</span>. O item sairá da sua mochila imediatamente.
                            </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                            {player.uniqueInventory?.map((item) => (
                                <button
                                    key={item.uniqueId}
                                    onMouseEnter={(e) => handleHover(item, e)}
                                    onMouseLeave={(e) => handleHover(null, e)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedForSale(item);
                                    }}
                                    className={`aspect-square rounded border-2 flex items-center justify-center relative hover:scale-105 transition-all shadow-md active:translate-y-1 ${getRarityClass(item.rarity)}`}
                                >
                                    <Sprite src={item.image} size={32} className="pixelated" />
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <ArrowUpRight size={20} className="text-white drop-shadow-md" />
                                    </div>
                                </button>
                            ))}
                            {(!player.uniqueInventory || player.uniqueInventory.length === 0) && (
                                <div className="col-span-full py-12 text-center text-gray-500 italic opacity-50 border-2 border-dashed border-[#333] rounded-lg">
                                    Você não possui itens raros para vender.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'my-listings' && (
                    <div className="max-w-4xl mx-auto space-y-3">
                        {listings.filter(l => l.seller_id === userId).map(listing => (
                            <div key={listing.id} className="p-4 bg-[#222] border border-[#333] rounded flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black/40 rounded flex items-center justify-center border border-[#444]"
                                        onMouseEnter={(e) => handleHover(listing.item_data, e)}
                                        onMouseLeave={(e) => handleHover(null, e)}
                                    >
                                        <Sprite src={listing.item_data.image} size={32} className="pixelated" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-200">{listing.item_data.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">{listing.item_data.rarity} • {listing.price_tc} TC</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleCancelAction(listing)}
                                    disabled={processingIds.has(listing.id)}
                                    className="p-2 text-red-500 hover:bg-red-950/30 rounded border border-transparent hover:border-red-900 transition-all flex items-center gap-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingIds.has(listing.id) ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                                    CANCELAR
                                </button>
                            </div>
                        ))}
                        {listings.filter(l => l.seller_id === userId).length === 0 && (
                            <div className="text-center py-20 text-gray-600 italic">Você não possui ofertas ativas.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
