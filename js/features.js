import { get, set, addActivity } from './storage.js';

export function inspectUrl(raw) {
  const text = raw.trim();
  let parsed;
  try { parsed = new URL(text.match(/^https?:\/\//i) ? text : `https://${text}`); }
  catch { return { score:100, level:'Invalid', findings:['The value is not a valid web address.'] }; }
  let score = 8;
  const findings = [];
  if (parsed.protocol !== 'https:') { score += 25; findings.push('Connection does not use HTTPS.'); }
  else findings.push('Uses HTTPS, which encrypts transit but does not prove trust.');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) { score += 35; findings.push('Uses a raw IP address instead of a domain name.'); }
  if (parsed.hostname.split('.').length > 4) { score += 16; findings.push('Contains an unusually deep subdomain structure.'); }
  if (/(verify|urgent|secure|update|reward|kyc|refund|login)/i.test(parsed.href)) { score += 18; findings.push('Contains urgency or account-verification language often seen in phishing links.'); }
  if (/bit\.ly|tinyurl|t\.co/i.test(parsed.hostname)) { score += 22; findings.push('Uses a shortened URL that hides the final destination.'); }
  if (parsed.href.length > 100) { score += 12; findings.push('Unusually long URL.'); }
  if (parsed.hostname.includes('xn--')) { score += 28; findings.push('Internationalised domain encoding detected; inspect carefully for lookalikes.'); }
  score = Math.min(96,score);
  return { domain:parsed.hostname, protocol:parsed.protocol, score, level:score>65?'High':score>35?'Caution':'Low', findings };
}

export function inspectText(text) {
  const patterns = [
    [/otp|pin|cvv/i,'Requests sensitive authentication information',22],
    [/urgent|immediately|within \d+ (minute|hour)/i,'Uses urgency to reduce careful decision-making',16],
    [/arrest|police|cbi|customs/i,'Invokes authority or legal consequences',20],
    [/prize|reward|cashback|refund/i,'Promises a financial benefit',13],
    [/(?:\+91[\s-]?)?[6-9]\d{9}/,'Contains an Indian phone number',7],
    [/[a-z0-9._-]+@[a-z0-9.-]+/i,'Contains an email or payment identifier',7],
    [/https?:\/\/|www\./i,'Contains a link requiring independent verification',9],
  ];
  const hits = patterns.filter(([rx])=>rx.test(text));
  const score = Math.min(95,8+hits.reduce((sum,item)=>sum+item[2],0));
  return { score, level:score>65?'High':score>35?'Caution':'Low', findings:hits.map(x=>x[1]), indicators:(text.match(/(?:\+91[\s-]?)?[6-9]\d{9}|https?:\/\/\S+|[\w.-]+@[\w.-]+/gi)||[]) };
}

export async function hashFile(file) {
  if (!crypto?.subtle) return 'Unavailable';
  const data = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256',data);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

export function download(name, content, type='text/html') {
  const blob = new Blob([content],{type});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = name; link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),500);
}

export function saveEvidence(item) {
  const items = get('evidence',[]); items.unshift(item); set('evidence',items); addActivity('Evidence saved',item.name); return items;
}

export function removeEvidence(id) {
  set('evidence',get('evidence',[]).filter(item=>item.id!==id)); addActivity('Evidence removed',id);
}
