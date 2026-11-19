export function aboutScreen({ UI, Router, Store, Log, config }) {
  const { el, icon } = UI;
  const mods = Store.get('modules') || [];
  const row = (k, v, ok) => el('div', { class: 'st-row' }, el('span', { class: 'sub', text: k }), el('b', { class: 'mono' + (ok === false ? ' bad' : ok ? ' good' : ''), text: v }));
  const errs = Log.list().filter(i => i.level === 'error').length;
  return el('section', { class: 'st' },
    el('div', { class: 'st-brand' }, el('span', { class: 'st-logo' }, icon('logo')), el('h1', { text: 'Kinsfolk' }), el('p', { class: 'sub', text: 'Свои — на связи' })),
    el('div', { class: 'st-card' },
      row('Версия', config.APP_VERSION), row('Ядро', 'запущено', true),
      row('Модули', mods.join(', ') || 'нет', mods.length > 0),
      row('Supabase', config.isConfigured() ? 'ключи вписаны' : 'ключи не вписаны', config.isConfigured())),
    el('button', { class: 'btn ghost rip', onclick: () => Router.go('log') }, icon('list'), `Журнал ошибок (${errs})`));
}
