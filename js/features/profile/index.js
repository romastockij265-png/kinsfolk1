import { setupScreen } from './setup.js';
export function register({ Router, UI }) {
  UI.loadCss(new URL('../../../css/auth.css', import.meta.url));
  Router.register('setup', () => setupScreen());
}
