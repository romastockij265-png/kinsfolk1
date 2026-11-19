// Только публичные значения. service_role-ключ сюда нельзя НИКОГДА.
export const APP_VERSION = '0.0.1';
export const SUPABASE_URL = 'https://ehwqjlacuqdxiqfvbzsa.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_LXTtEEeYzhnmCeuVe0nA4A_oJBfjgsC';
export const SB_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm';
export const FLAGS = { debug: false };
export const isConfigured = () => !SUPABASE_URL.includes('YOUR-') && !SUPABASE_ANON_KEY.includes('YOUR-');
