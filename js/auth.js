import { get, set, remove, addActivity, url } from './storage.js';

const SESSION_KEY = 'cybertrace_session';

export function session() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || get('remembered_session'); }
  catch { return null; }
}

export function login(email, password, role, remember = false) {
  // const user = get('users', []).find(item => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.role === role);
  // if (!user) return { ok:false, message:'The credentials do not match the selected role.' };
  // if (!user.active) return { ok:false, message:'This demonstration account is inactive.' };
  // const safe = { id:user.id, name:user.name, email:user.email, role:user.role, district:user.district };
  // sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  // if (remember) set('remembered_session', safe); else remove('remembered_session');
  // addActivity('Login', `${safe.role} account signed in`);
  // return { ok:true, user:safe };
}

export function logout() {
  const user = session();
  if (user) addActivity('Logout', `${user.role} account signed out`);
  sessionStorage.removeItem(SESSION_KEY);
  remove('remembered_session');
  location.href = url('auth/login.html');
}

export function guard(role) {
  const user = session();
  if (!user) {
    location.replace(url(`auth/login.html?next=${encodeURIComponent(location.pathname)}`));
    return null;
  }
  if (user.role !== role) {
    location.replace(url(`access-denied.html?required=${role}`));
    return null;
  }
  return user;
}

export function roleHome(role) {
  return url(`${role}/dashboard.html`);
}
