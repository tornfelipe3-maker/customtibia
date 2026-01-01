
import { supabase } from '../lib/supabase';

export interface ChatMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    message: string;
    is_gm?: boolean;
    created_at: string;
    receiver_id?: string;
    receiver_name?: string;
}

export const ChatService = {
    async getGlobalMessages(limit = 50): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('global_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return (data || []).reverse();
    },

    async getPrivateMessages(userId: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('private_messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) throw error;
        return (data || []).reverse();
    },

    async sendGlobalMessage(senderId: string, senderName: string, message: string, isGm = false) {
        const { error } = await supabase.from('global_messages').insert({
            sender_id: senderId,
            sender_name: senderName,
            message,
            is_gm: isGm
        });
        if (error) throw error;
    },

    async sendPrivateMessage(senderId: string, senderName: string, receiverName: string, message: string) {
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', receiverName)
            .single();

        if (pError || !profile) throw new Error("Jogador não encontrado.");

        const { error } = await supabase.from('private_messages').insert({
            sender_id: senderId,
            sender_name: senderName,
            receiver_id: profile.id,
            receiver_name: receiverName,
            message
        });
        if (error) throw error;
    },

    subscribeGlobal(callback: (payload: any) => void) {
        return supabase
            .channel('global-chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, callback)
            .subscribe();
    },

    subscribePrivate(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel(`private-chat-${userId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'private_messages'
            }, callback)
            .subscribe();
    }
};
