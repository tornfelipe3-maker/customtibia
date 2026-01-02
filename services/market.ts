
import { supabase } from '../lib/supabase';
import { Item } from '../types';

export interface MarketListing {
    id: string;
    seller_id: string;
    seller_name: string;
    item_data: Item;
    price_tc: number;
    created_at: string;
}

export const MarketService = {
    async getListings(): Promise<MarketListing[]> {
        const { data, error } = await supabase
            .from('market_listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Escuta mudanças em tempo real
    subscribeToListings(callback: () => void) {
        return supabase
            .channel('market-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'market_listings' },
                () => {
                    callback();
                }
            )
            .subscribe();
    },

    async listItem(userId: string, userName: string, item: Item, priceTc: number) {
        const { error } = await supabase.from('market_listings').insert({
            seller_id: userId,
            seller_name: userName,
            item_data: item,
            price_tc: priceTc
        });
        if (error) throw error;
    },

    async buyItem(listingId: string) {
        // Usa select().single() para garantir que o item realmente existia e foi deletado
        const { data, error } = await supabase
            .from('market_listings')
            .delete()
            .eq('id', listingId)
            .select();
            
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Item já vendido ou não disponível.");
        return true;
    },

    async cancelListing(listingId: string) {
        const { data, error } = await supabase
            .from('market_listings')
            .delete()
            .eq('id', listingId)
            .select();
            
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Anúncio não encontrado.");
        return true;
    }
};
