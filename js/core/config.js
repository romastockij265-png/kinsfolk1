// Только публичные значения. service_role-ключ сюда нельзя НИКОГДА.
export const APP_VERSION = '0.0.1';
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
export const SB_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
export const FLAGS = { debug: false };
export const isConfigured = () => !SUPABASE_URL.includes('YOUR-') && !SUPABASE_ANON_KEY.includes('YOUR-');
