export function peopleScreen({ UI, Router, Api, Store, Guard, I18n }) {
  const { el, icon, toast } = UI, t = I18n.t, my = (Store.get('user') || {}).id;
  const input = el('input', { type: 'search', placeholder: t('pe.ph'), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': t('pe.title') });
  const list = el('div', { class: 'pl-list' });
  let seq = 0, timer, busy = false;
  const hint = txt => list.replaceChildren(el('p', { class: 'sub pl-empty', text: txt }));
  const avatar = p => { const u = Guard.safeUrl(p.avatar_url || ''); return el('div', { class: 'ava' }, u ? el('img', { alt: '', src: u }) : el('span', { text: (p.display_name || '?').slice(0, 1).toUpperCase() })); };
  const open = async (p, node) => {
    if (busy) return; busy = true; node.classList.add('busy');
    try { const id = await Api.chats.start(p.id); Router.rewrite(Router.landing()); await Router.go('chat', { id, name: p.display_name, avatar: p.avatar_url || '' }); }
    catch (x) { toast(t(x.key || 'err.generic')); } finally { busy = false; node.classList.remove('busy'); }
  };
  const row = (p, i) => { const b = el('button', { type: 'button', class: 'pl-row rip', style: `--i:${i}`, onclick: () => open(p, b) }, avatar(p),
    el('div', { class: 'm' }, el('b', { text: p.display_name }), el('small', { class: 'mono', text: '@' + p.username }), p.bio ? el('p', { class: 'sub', text: p.bio }) : null), icon('chats')); return b; };
  hint(t('pe.min'));
  input.addEventListener('input', () => {
    clearTimeout(timer); const q = input.value.trim().replace(/^@/, ''), id = ++seq;
    if (q.length < 2) return hint(t('pe.min'));
    timer = setTimeout(async () => {
      try { const r = await Api.profiles.search(q, my); if (id !== seq) return; r.length ? list.replaceChildren(...r.map(row)) : hint(t('pe.none')); }
      catch (x) { if (id === seq) hint(t(x.key || 'err.generic')); }
    }, 350);
  });
  setTimeout(() => input.isConnected && input.focus(), 400);
  return UI.tabbed('contacts', el('section', { class: 'auth people' },
    el('div', { class: 'hd', style: 'padding:0' }, el('h1', { text: t('pe.title') })), el('p', { class: 'sub', text: t('pe.sub') }),
    el('label', { class: 'sf' }, icon('search'), input), list));
}
