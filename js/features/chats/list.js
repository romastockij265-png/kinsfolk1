export function chatsScreen({ UI, Router, Store, Hooks, Api, Guard, I18n }) {
  const { el, icon } = UI, t = I18n.t, me = (Store.get('user') || {}).id;
  let q = '', failed = false;
  const list = el('div', { class: 'cl-list' });
  const name = c => c.kind === 'direct' ? (c.other_name || t('c.chat')) : (c.title || t('c.chat'));
  const stamp = iso => {
    if (!iso) return ''; const d = new Date(iso), n = new Date(), day = x => x.toDateString();
    if (day(d) === day(n)) return d.toTimeString().slice(0, 5);
    const y = new Date(n); y.setDate(n.getDate() - 1); if (day(d) === day(y)) return t('c.yesterday');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  const preview = c => !c.last_id ? '' : (c.last_sender === me ? t('c.you') : '') + (c.last_kind === 'text' || !c.last_kind ? (c.last_body || '') : t('c.kind'));
  const avatar = c => { const u = Guard.safeUrl(c.kind === 'direct' ? c.other_avatar : c.avatar_url); return el('div', { class: 'ava' }, u ? el('img', { alt: '', src: u }) : (c.kind === 'direct' ? el('span', { text: name(c).slice(0, 1).toUpperCase() }) : icon('users'))); };
  const row = (c, i) => el('button', { type: 'button', class: 'cl-row rip', style: `--i:${i}`, onclick: () => Router.go('chat', { id: c.chat_id, name: name(c), avatar: (c.kind === 'direct' ? c.other_avatar : c.avatar_url) || '', group: c.kind !== 'direct' }) },
    avatar(c), el('div', { class: 'm' }, el('div', { class: 'rw' }, el('b', { text: name(c) }), el('span', { class: 'mono tm', text: stamp(c.last_at) })),
      el('div', { class: 'rw' }, el('small', { text: preview(c) }), Number(c.unread) ? el('span', { class: 'bdg', text: Number(c.unread) > 99 ? '99+' : String(c.unread) }) : null)));
  const draw = () => {
    const all = Store.get('chats') || [], s = q.toLowerCase(), rows = all.filter(c => !s || name(c).toLowerCase().includes(s) || preview(c).toLowerCase().includes(s));
    if (!rows.length) return list.replaceChildren(el('p', { class: 'sub pl-empty', text: failed ? t('c.loadFail') : all.length ? t('c.none') : t('c.empty') }));
    list.replaceChildren(...rows.map(row));
  };
  const input = el('input', { type: 'search', placeholder: t('c.search'), autocomplete: 'off', 'aria-label': t('c.search'), oninput: () => { q = input.value.trim(); draw(); } });
  const themeBtn = el('button', { class: 'ib rip', type: 'button', 'aria-label': t('c.theme') });
  const syncTheme = () => themeBtn.replaceChildren(icon(document.documentElement.dataset.theme === 'light' ? 'moon' : 'sun'));
  themeBtn.onclick = async () => { await Hooks.run('theme:toggle'); syncTheme(); };
  syncTheme();
  const root = UI.tabbed('chats', el('div', { class: 'hd' }, el('h1', { text: t('c.title') }), themeBtn,
    el('button', { class: 'ib rip', type: 'button', 'aria-label': t('c.new'), onclick: () => Router.go('contacts', {}, { replace: true }) }, icon('plus'))),
    el('label', { class: 'sf cl-sf' }, icon('search'), input), list);
  draw();
  const off = Store.on('chats', () => { if (!root.isConnected && root.dataset.live) return off(); draw(); });
  setTimeout(() => { root.dataset.live = '1'; }, 300);
  Api.chats.list().then(r => { failed = false; Store.set('chats', r); }).catch(() => { failed = true; draw(); });
  return root;
}
