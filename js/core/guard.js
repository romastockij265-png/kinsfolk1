// Защита: экранирование, лимиты, проверка файлов.
export const LIMITS = { message: 4000, name: 50, username: 20, bio: 200, fileMB: { image: 10, file: 25, voice: 5 } };
const TYPES = { image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], voice: ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'], file: null };
const BAD_EXT = /\.(exe|bat|cmd|scr|msi|js|jar|apk|vbs|ps1|sh)$/i;
export const Guard = {
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  clamp: (s, n) => String(s ?? '').slice(0, n),
  isEmail: s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s),
  isUsername: s => /^[a-z0-9_]{3,20}$/.test(s),
  safeUrl(u) { try { const x = new URL(u); return ['https:', 'http:'].includes(x.protocol) ? x.href : ''; } catch { return ''; } },
  checkFile(file, kind) {
    if (!file) return { ok: false, reason: 'Файл не выбран' };
    if (file.size > LIMITS.fileMB[kind] * 1048576) return { ok: false, reason: `Файл больше ${LIMITS.fileMB[kind]} МБ` };
    if (TYPES[kind] && !TYPES[kind].some(t => (file.type || '').startsWith(t.split(';')[0]))) return { ok: false, reason: 'Этот тип файла не подходит' };
    if (kind === 'file' && BAD_EXT.test(file.name || '')) return { ok: false, reason: 'Исполняемые файлы отправлять нельзя' };
    return { ok: true };
  }
};
