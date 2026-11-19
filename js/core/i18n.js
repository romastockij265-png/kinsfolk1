const dicts = { ru: {
  'common.ok': 'Понятно', 'common.cancel': 'Отмена', 'common.back': 'Назад', 'common.copy': 'Копировать', 'common.clear': 'Очистить',
  'common.copied': 'Скопировано', 'common.copyFail': 'Не удалось скопировать',
  'err.net': 'Нет сети. Проверьте интернет и попробуйте снова.',
  'err.rate': 'Слишком много попыток. Подождите минуту.',
  'err.code': 'Код неверный или истёк. Проверьте код или запросите новый.',
  'err.credentials': 'Неверная почта или пароль.',
  'err.session': 'Сессия истекла. Войдите снова.',
  'err.generic': 'Что-то пошло не так. Попробуйте ещё раз.'
} };
let lang = 'ru';
export const I18n = {
  t(key, vars) { const s = dicts[lang]?.[key] ?? dicts.ru[key] ?? key; return vars ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s; },
  add(l, d) { dicts[l] = { ...(dicts[l] || {}), ...d }; },
  setLang(l) { lang = l; document.documentElement.lang = l; },
  get lang() { return lang; }
};
export const t = I18n.t, i18nAdd = I18n.add;
