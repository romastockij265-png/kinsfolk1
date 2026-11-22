export function peopleScreen({ UI, Router, Api, Store, Guard, I18n }) {
  const { el, icon } = UI, t = I18n.t, my = (Store.get('user') || {}).id;
  const input = el('input', { type: 'search', placeholder: t('pe.ph'), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': t('pe.title') });
  const list = el('div', { class: 'pl-list' });
  let seq = 0, timer;
  const hint = txt => list.replaceChildren(el('p', { class: 'sub pl-empty', text: txt }));
  const avatar = p => { const u = Guard.safeUrl(p.avatar_url || ''); return el('div', { class: 'ava' }, u ? el('img', { alt: '', src: u }) : el('span', { text: (p.display_name || '?').slice(0, 1).toUpperCase() })); };
  const row = (p, i) => el('div', { class: 'pl-row', style: `--i:${i}` }, avatar(p),
    el('div', { class: 'm' }, el('b', { text: p.display_name }), el('small', { class: 'mono', text: '@' + p.username }), p.bio ? el('p', { class: 'sub', text: p.bio }) : null));
  hint(t('pe.min'));
  input.addEventListener('input', () => {
    clearTimeout(timer); const q = input.value.trim().replace(/^@/, ''), id = ++seq;
    if (q.length < 2) return hint(t('pe.min'));
    timer = setTimeout(async () => {
      try { const r = await Api.profiles.search(q, my); if (id !== seq) return; r.length ? list.replaceChildren(...r.map(row)) : hint(t('pe.none')); }
      catch (x) { if (id === seq) hint(t(x.key || 'err.generic')); }
    }, 350);
  });
  setTimeout(() => input.isConnected && input.focus(), 350);
  return el('section', { class: 'auth people' },
    el('div', { class: 'st-bar' }, el('button', { class: 'ib rip', type: 'button', 'aria-label': t('common.back'), onclick: () => Router.back() }, icon('back')), el('h2', { text: t('pe.title') })),
    el('label', { class: 'sf' }, icon('search'), input), list);
}
