// Экран кода: 6 ячеек, автоотправка, повтор через 60 с, блокировка после 5 ошибок.
import { el, toast } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
import { Api } from '../../core/api.js';
import { Router } from '../../core/router.js';
import { S, shell, msg } from './forms.js';
import { createOtp } from './otpInput.js';

const LOCK = 'kf_lock';
export function codeScreen(flow, { email }) {
  let fails = 0, lockUntil = +localStorage.getItem(LOCK) || 0, resendAt = Date.now() + 60000, working = false;
  const err = msg(), rt = el('span'), re = el('button', { type: 'button', class: 'link', hidden: true }, S('resend'));
  const otp = createOtp({ onComplete: verify });
  const back = () => Router.go('login', { email }, { replace: true });
  const s = shell(
    el('button', { class: 'back rip', type: 'button', 'aria-label': S('change'), onclick: back }, '‹'),
    el('h1', { text: S('codeTitle') }), el('p', { class: 'sub', text: t('a.sentTo', { email }) }),
    otp.el, err.el, el('p', { class: 'hint' }, rt, re), el('button', { type: 'button', class: 'link', onclick: back }, S('change')));
  async function verify(code) {
    if (working || Date.now() < lockUntil) return;
    working = true; otp.setDisabled(true); err.set('');
    try { const d = await Api.auth.verify(email, code); localStorage.removeItem(LOCK); await flow.enter(d.session); }
    catch (x) {
      fails++; otp.shake(); otp.clear(); err.set(t(x.key || 'err.generic'));
      if (fails >= 5) { fails = 0; lockUntil = Date.now() + 60000; localStorage.setItem(LOCK, lockUntil); }
    } finally { working = false; if (Date.now() >= lockUntil) { otp.setDisabled(false); otp.focus(); } }
  }
  re.onclick = async () => {
    re.disabled = true;
    try { await Api.auth.sendCode(email); resendAt = Date.now() + 60000; fails = 0; toast(S('resent')); } catch (x) { err.set(t(x.key || 'err.generic')); }
    re.disabled = false; tick();
  };
  function tick() {
    if (!s.isConnected && s.dataset.live) return clearInterval(timer);
    const now = Date.now();
    if (now < lockUntil) { otp.setDisabled(true); err.set(t('a.lock', { n: Math.ceil((lockUntil - now) / 1000) })); }
    else if (lockUntil) { lockUntil = 0; otp.setDisabled(false); err.set(''); otp.focus(); }
    const wait = now < resendAt; re.hidden = wait; rt.hidden = !wait;
    if (wait) rt.textContent = t('a.resendIn', { n: Math.ceil((resendAt - now) / 1000) });
  }
  const timer = setInterval(tick, 500); tick();
  setTimeout(() => { s.dataset.live = '1'; otp.focus(); }, 300);
  return s;
}
