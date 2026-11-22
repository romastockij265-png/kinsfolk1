import { LIMITS } from '../../core/guard.js';
const PAGE = 50;
export function chatScreen({ UI, Router, Store, Hooks, Api, Guard, I18n }, params) {
  const { el, icon, toast } = UI, t = I18n.t, me = (Store.get('user') || {}).id, id = params.id;
  let msgs = [], hasMore = true, loading = false, tmpN = 0, ready = false, failedLoad = false;
  const box = el('div', { class: 'cm-list' });
  const ta = el('textarea', { rows: '1', placeholder: t('m.ph'), 'aria-label': t('m.ph'), maxlength: String(LIMITS.message) });
  const near = () => box.scrollHeight - box.scrollTop - box.clientHeight < 120;
  const down = () => { box.scrollTop = box.scrollHeight; };
  const dayLabel = iso => { const d = new Date(iso), n = new Date(), s = x => x.toDateString(); if (s(d) === s(n)) return t('m.today'); const y = new Date(n); y.setDate(n.getDate() - 1); return s(d) === s(y) ? t('m.yesterday') : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }); };
  const order = () => [...msgs.filter(m => typeof m.id === 'number').sort((a, b) => a.id - b.id), ...msgs.filter(m => typeof m.id !== 'number')];
  const bubble = m => {
    const mine = m.sender_id === me, b = el('div', { class: 'cm ' + (mine ? 'me' : 'th') + (m.failed ? ' bad' : '') + (m.pending ? ' wait' : ''), onclick: m.failed ? () => resend(m) : null },
      el('span', { class: 'tx', text: m.body || '' }), el('span', { class: 'mt mono', text: m.failed ? t('m.failed') : new Date(m.created_at).toTimeString().slice(0, 5) }));
    return b;
  };
  const paint = () => {
    const rows = order(); let last = '';
    if (!rows.length && ready) return box.replaceChildren(el('p', { class: 'sub cm-empty', text: failedLoad ? t('m.loadFail') : t('m.empty') }));
    box.replaceChildren(...rows.flatMap(m => { const d = new Date(m.created_at).toDateString(), out = []; if (d !== last) { last = d; out.push(el('div', { class: 'cm-day mono', text: dayLabel(m.created_at) })); } out.push(bubble(m)); return out; }));
  };
  const lastId = () => msgs.reduce((n, m) => typeof m.id === 'number' && m.id > n ? m.id : n, 0);
  const markRead = () => { const l = lastId(); if (l && document.visibilityState === 'visible') Api.chats.markRead(id, me, l).then(() => Hooks.run('chats:refresh')).catch(() => {}); };
  const add = rows => { let n = 0; for (const r of rows) if (!msgs.some(m => m.id === r.id)) { msgs.push(r); n++; } return n; };
  async function loadFirst() {
    try { const r = await Api.chats.messages(id, { limit: PAGE }); msgs = r; hasMore = r.length === PAGE; failedLoad = false; } catch { failedLoad = true; }
    ready = true; paint(); down(); markRead();
  }
  async function loadOlder() {
    if (loading || !hasMore || !msgs.length) return; loading = true;
    const first = order().find(m => typeof m.id === 'number'); if (!first) { loading = false; return; }
    const h = box.scrollHeight, top = box.scrollTop;
    try { const r = await Api.chats.messages(id, { before: first.id, limit: PAGE }); hasMore = r.length === PAGE; add(r); paint(); box.scrollTop = box.scrollHeight - h + top; } catch { /* повторится при прокрутке */ }
    loading = false;
  }
  async function catchUp() { const l = lastId(); if (!ready || !l) return; try { const r = await Api.chats.messages(id, { after: l, limit: 200 }); if (add(r)) { const stick = near(); paint(); if (stick) down(); markRead(); } } catch { /* не страшно */ } }
  box.addEventListener('scroll', () => { if (box.scrollTop < 80) loadOlder(); });
  async function send(m) {
    const body = (m ? m.body : ta.value.trim()); if (!body) return;
    if (!m) { ta.value = ''; grow(); m = { id: 't' + (++tmpN), chat_id: id, sender_id: me, body, created_at: new Date().toISOString(), pending: true }; msgs.push(m); } else { m.failed = false; m.pending = true; }
    paint(); down();
    try { const row = await Api.chats.send(id, body, me); msgs = msgs.filter(x => x !== m); add([row]); paint(); down(); Hooks.run('chats:refresh'); }
    catch (x) { m.pending = false; m.failed = true; paint(); toast(t(x.key || 'err.generic')); }
  }
  const resend = m => send(m);
  function grow() { ta.style.height = '22px'; ta.style.height = Math.min(ta.scrollHeight, 110) + 'px'; }
  ta.addEventListener('input', grow);
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && matchMedia('(pointer:fine)').matches) { e.preventDefault(); send(); } });
  const onMsg = row => { if (row.chat_id !== id) return; if (!box.isConnected && root.dataset.live) { Hooks.off('message:received', onMsg); Hooks.off('realtime:ready', catchUp); return; } if (add([row])) { const stick = near() || row.sender_id === me; paint(); if (stick) down(); if (row.sender_id !== me) markRead(); } };
  Hooks.on('message:received', onMsg); Hooks.on('realtime:ready', catchUp);
  const vis = () => { if (!root.isConnected && root.dataset.live) return document.removeEventListener('visibilitychange', vis); if (document.visibilityState === 'visible') catchUp(); };
  document.addEventListener('visibilitychange', vis);
  const av = Guard.safeUrl(params.avatar || '');
  const root = el('section', { class: 'chat' },
    el('div', { class: 'ch' }, el('button', { class: 'ib rip', type: 'button', 'aria-label': t('common.back'), onclick: () => Router.back() }, icon('back')),
      el('div', { class: 'ava s' }, av ? el('img', { alt: '', src: av }) : (params.group ? icon('users') : el('span', { text: (params.name || '?').slice(0, 1).toUpperCase() }))),
      el('div', { class: 'm' }, el('b', { text: params.name || t('c.chat') }), params.group ? el('small', { text: t('m.group') }) : null)),
    box,
    el('div', { class: 'cmp' }, ta, el('button', { class: 'send', type: 'button', 'aria-label': t('m.send'), onclick: () => send() }, icon('send'))));
  setTimeout(() => { root.dataset.live = '1'; }, 300);
  loadFirst();
  return root;
}
