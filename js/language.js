import { get, set } from './storage.js';

const labels = {
  en:{ dashboard:'Dashboard', logout:'Logout', search:'Search CYBERTRACE', welcome:'Welcome back' },
  hi:{ dashboard:'डैशबोर्ड', logout:'लॉग आउट', search:'CYBERTRACE में खोजें', welcome:'वापसी पर स्वागत है' },
};

export function language() { return get('language','en'); }
export function setLanguage(code) {
  set('language',code);
  if (!['en','hi'].includes(code)) {
    document.dispatchEvent(new CustomEvent('toast',{detail:{title:'Limited translation',message:'Core navigation remains in English while this language pack is being independently reviewed.'}}));
  }
  setTimeout(()=>location.reload(),350);
}
export function t(key) { return (labels[language()]||labels.en)[key]||labels.en[key]||key; }
export function languageOptions() {
  return [['en','English'],['hi','हिन्दी'],['mr','मारवाड़ी'],['me','मेवाड़ी'],['dh','ढूंढाड़ी'],['ha','हाड़ौती']].map(([v,n])=>`<option value="${v}" ${language()===v?'selected':''}>${n}</option>`).join('');
}
