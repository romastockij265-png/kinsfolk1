// Тема (тёмная / светлая / авто) и размер текста. Хранится на устройстве.
const mq = matchMedia('(prefers-color-scheme: light)');
const SIZES = { small: 14.5, normal: 16, large: 18 };
export const getTheme = () => { try { return localStorage.getItem('kf_theme') || 'auto'; } catch { return 'auto'; } };
export function applyTheme(t = getTheme()) {
  const light = t === 'light' || (t === 'auto' && mq.matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', light ? '#EEF2F9' : '#10141D');
}
export function setTheme(t) { try { localStorage.setItem('kf_theme', t); } catch {} applyTheme(t); }
export function toggleTheme() { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
export const getSize = () => { try { const f = +localStorage.getItem('kf_fs'); return Object.keys(SIZES).find(k => SIZES[k] === f) || 'normal'; } catch { return 'normal'; } };
export function setSize(k) { const px = SIZES[k] || 16; try { localStorage.setItem('kf_fs', px); } catch {} document.documentElement.style.setProperty('--fs', px + 'px'); }
mq.addEventListener('change', () => getTheme() === 'auto' && applyTheme());
