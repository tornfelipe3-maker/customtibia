
import { createClient } from '@supabase/supabase-js';

// Configurações obtidas do painel do Supabase pelo usuário
const supabaseUrl = 'https://iycfazvwqhteavqcronp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Y2ZhenZ3cWh0ZWF2cWNyb25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTAzOTcsImV4cCI6MjA4Mjc4NjM5N30.bwZsJR69_I4EHiMmd0EIsMsOeT1Wc22jD1klY7PcO9k';

// Inicialização do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
