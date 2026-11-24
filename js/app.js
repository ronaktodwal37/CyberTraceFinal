import { seed } from './storage.js';
import { guard } from './auth.js';
import { shell } from './components.js';
import { home, publicPage, accessDenied } from './render-public.js';
import { authPage } from './render-auth.js';
import { citizenPage, policePage, adminPage } from './render-portal.js';
import { bindInteractions } from './interactions.js';

seed();

const body = document.body;
const page = body.dataset.page || 'home';
const role = body.dataset.role;
const app = document.querySelector('#app');

if (page === 'home') app.innerHTML = home();
else if (page === 'access-denied') app.innerHTML = accessDenied();
else if (body.dataset.auth === 'true') app.innerHTML = authPage(page);
else if (body.dataset.public === 'true') app.innerHTML = publicPage(page);
else if (role) {
  const user = guard(role);
  if (user) {
    const content = role === 'citizen' ? citizenPage(page,user) : role === 'police' ? policePage(page,user) : adminPage(page,user);
    app.innerHTML = shell(role,page,user,content);
  }
}

bindInteractions();
