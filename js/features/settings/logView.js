export function logScreen({ UI, Router, Log }) {
  const { el, icon, toast } = UI;
  const list = el('div', { class: 'lg-list' });
  const fill = () => {
    list.replaceChildren();
    const items = Log.list();
    if (!items.length) return list.append(el('p', { class: 'sub lg-empty', text: 'Ошибок нет. Всё чисто.' }));
    items.forEach(i => list.append(el('div', { class: 'lg-item ' + i.level }, el('small', { class: 'mono', text: i.t.replace('T', ' ').slice(0, 19) + ' · ' + i.where }), el('p', { class: 'mono', text: i.msg }))));
  };
  const copy = async () => {
    const txt = Log.text();
    try { await navigator.clipboard.writeText(txt); }
    catch { const a = el('textarea', { style: 'position:fixed;opacity:0' }); a.value = txt; document.body.append(a); a.select(); const ok = document.execCommand('copy'); a.remove(); if (!ok) return toast('Не удалось скопировать'); }
    toast('Скопировано — отправьте текст разработчику');
  };
  fill();
  return el('section', { class: 'st' },
    el('div', { class: 'st-bar' }, el('button', { class: 'ib rip', 'aria-label': 'Назад', onclick: () => Router.back() }, icon('back')), el('h2', { text: 'Журнал' })),
    list,
    el('div', { class: 'st-actions' },
      el('button', { class: 'btn rip', onclick: copy }, icon('copy'), 'Копировать'),
      el('button', { class: 'btn ghost rip', onclick: () => { Log.clear(); fill(); toast('Журнал очищен'); } }, icon('trash'), 'Очистить')));
}
