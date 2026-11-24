import { pageTitles } from './data.js';
import { languageOptions, t } from './language.js';
import { url } from './storage.js';

export const icon = (name) => {
  const paths = {
    home:'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    shield:'M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z',
    scan:'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 12h8',
    case:'M4 7h16v13H4zM8 7V4h8v3M4 12h16',
    graph:'M6 18 12 6l6 12M6 18h12M12 6v12',
    map:'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14',
    report:'M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7',
    users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 11a4 4 0 0 0 0-8',
    settings:'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 3.64-.08-.02a1.7 1.7 0 0 0-1.8-.16l-.7.4a1.7 1.7 0 0 0-.86 1.7V22h-4.2v-.1a1.7 1.7 0 0 0-.86-1.7l-.7-.4a1.7 1.7 0 0 0-1.8.16l-.08.02-2.1-3.64.06-.06A1.7 1.7 0 0 0 4.6 15l-.7-.4A1.7 1.7 0 0 0 2.3 14H2V10h.3a1.7 1.7 0 0 0 1.6-.6l.7-.4a1.7 1.7 0 0 0-.02-1.88l-.06-.06 2.1-3.64.08.02a1.7 1.7 0 0 0 1.8.16l.7-.4a1.7 1.7 0 0 0 .86-1.7V2h4.2v.1a1.7 1.7 0 0 0 .86 1.7l.7.4a1.7 1.7 0 0 0 1.8-.16l.08-.02 2.1 3.64-.06.06A1.7 1.7 0 0 0 19.4 9l.7.4a1.7 1.7 0 0 0 1.6.6h.3v4h-.3a1.7 1.7 0 0 0-1.6.6z',
    bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.shield}"/></svg>`;
};

export function logo(href = 'index.html') {
  return `<a class="logo" href="${url(href)}" aria-label="CYBERTRACE home"><img class="logo-img" src="${url('assets/logos/cybertrace-logo.png')}" alt="CYBERTRACE Logo" /><span>CYBERTRACE<small>RAJASTHAN CYBER INTELLIGENCE</small></span></a>`;
}

export function publicNav() {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="public-nav"><div class="container">${logo()}
    <nav class="nav-links" aria-label="Main navigation"><a href="${url('index.html#platform')}">Platform</a><a href="${url('features.html')}">Innovations</a><a href="${url('how-it-works.html')}">How it works</a><a href="${url('awareness.html')}">Awareness</a><a href="${url('resources.html')}">Resources</a></nav>
    <div class="nav-actions"><select class="select language-select" data-language aria-label="Language">${languageOptions()}</select><a class="btn btn-secondary btn-sm" href="${url('auth/login.html')}">Sign in</a><a class="btn btn-primary btn-sm" href="${url('auth/login.html?role=police')}">Police portal</a><button class="icon-btn mobile-nav" data-mobile-menu aria-label="Open menu">☰</button></div>
  </div></header>`;
}

const citizenNav = [
  ['dashboard','Dashboard','home'],['scam-sos','Scam SOS','shield'],['ai-scanner','Any Input Intelligence','scan'],['before-you-click','Before You Click','scan'],
  ['evidence-locker','Evidence Locker','case'],['family-shield','Family Shield','users'],['scam-simulator','Scam Simulator','shield'],['scam-alerts','Scam Alerts','bell'],['report','Report Cybercrime','report'],['profile','Profile','users'],
];
const policeNav = [
  ['dashboard','Command Overview','home'],['cases','Cases','case'],['evidence-analysis','Evidence Analysis','scan'],['scam-dna','Scam DNA','graph'],['entity-extraction','Entity Extraction','scan'],
  ['network-graph','Network Graph','graph'],['location-intelligence','Location Intelligence','map'],['rajasthan-scam-radar','Scam Radar','map'],['tracey-assistant','TRACEY AI','shield'],['reports','Reports','report'],
];
const adminNav = [['dashboard','System Overview','home'],['users','Users','users'],['roles','Roles & Access','shield'],['system-monitoring','Monitoring','graph'],['content-management','Content','report'],['settings','Settings','settings']];

export function shell(role,page,user,content) {
  const nav = role==='citizen'?citizenNav:role==='police'?policeNav:adminNav;
  const initials = user.name.split(' ').map(x=>x[0]).slice(0,2).join('');
  return `<div class="shell"><aside class="sidebar" id="sidebar">${logo(`${role}/dashboard.html`)}
    <div class="sidebar-label">${role==='citizen'?'Citizen protection':role==='police'?'Investigation workspace':'Administration'}</div>
    <nav class="side-nav">${nav.map(([id,label,ico])=>`<a class="${id===page?'active':''}" href="${url(`${role}/${id}.html`)}">${icon(ico)}<span>${label}</span></a>`).join('')}</nav>
    <div class="sidebar-foot"><div class="user-mini"><div class="avatar">${initials}</div><div><strong>${user.name}</strong><span>${user.district}</span></div></div><button class="btn btn-secondary btn-sm" data-logout style="width:100%">Sign out</button></div>
  </aside><div class="main"><header class="topbar"><div class="topbar-left"><button class="icon-btn sidebar-toggle" data-sidebar aria-label="Toggle navigation">☰</button><div><h1>${pageTitles[page]||'Dashboard'}</h1><span class="demo-label">Synthetic demo</span></div></div>
    <div class="topbar-actions"><div class="search"><input class="input" data-global-search placeholder="${t('search')}" aria-label="Search"></div><select class="select language-select" data-language aria-label="Language">${languageOptions()}</select><button class="icon-btn" data-notifications aria-label="Notifications">${icon('bell')}</button></div></header>
    <main class="content" id="main">${content}</main></div></div><button class="tracey-widget" data-tracey aria-label="Open TRACEY AI"><img src="${url('assets/avatars/tracey-ai.png')}" alt="TRACEY AI" /></button>`;
}

export function pageIntro(title,copy,action='') {
  return `<div class="page-intro"><div><span class="eyebrow">CYBERTRACE intelligence</span><h2>${title}</h2><p>${copy}</p></div>${action}</div>`;
}

export function footer() {
  return `<footer class="footer"><div class="container"><div class="footer-grid"><div>${logo()}<p class="muted" style="max-width:340px;margin-top:18px">Securing Rajasthan. Protecting Every Citizen.<br>राजस्थान री रक्षा, हर नागरिक री सुरक्षा।</p></div>
  <div><h4>Platform</h4><a href="${url('features.html')}">Innovations</a><a href="${url('about.html')}">About</a><a href="${url('how-it-works.html')}">How it works</a><a href="${url('contact.html')}">Contact</a></div>
  <div><h4>Citizen safety</h4><a href="${url('citizen/scam-sos.html')}">Scam SOS</a><a href="${url('awareness.html')}">Awareness</a><a href="${url('resources.html')}">Official resources</a></div>
  <div><h4>Government links</h4><a target="_blank" rel="noopener" href="https://cybercrime.gov.in/">Cyber Crime Portal</a><a target="_blank" rel="noopener" href="https://police.rajasthan.gov.in/">Rajasthan Police</a><a target="_blank" rel="noopener" href="https://www.sancharsaathi.gov.in/">Sanchar Saathi</a></div></div>
  <div class="footer-bottom"><span>Rajasthan Police Hackathon 2026 · Frontend demonstration</span><span>No real citizen or police data is used.</span></div></div></footer>`;
}
