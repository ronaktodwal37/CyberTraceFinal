const PREFIX = 'cybertrace_';

export function url(path = '') {
  const root = document.body?.dataset?.root || './';
  return root + String(path).replace(/^\/+/, '');
}

export function get(key, fallback = null) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  return value;
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function seed() {
  if (get('seeded')) return;
  set('users', [
    { id: 'U-001', name: 'Aarav Sharma', email: 'citizen@cybertrace.demo', password: 'Citizen@123', role: 'citizen', district: 'Jaipur', active: true },
    { id: 'U-002', name: 'Inspector Meera Rathore', email: 'officer@cybertrace.demo', password: 'Police@123', role: 'police', district: 'Jaipur Cyber Cell', active: true },
    { id: 'U-003', name: 'System Administrator', email: 'admin@cybertrace.demo', password: 'Admin@123', role: 'admin', district: 'State HQ', active: true },
  ]);
  set('evidence', [
    { id: 'EV-2041', name: 'upi-payment-request.png', type: 'image/png', size: 284120, hash: '8fa4…91de', date: '2026-02-18', incident: 'Suspicious UPI request' },
    { id: 'EV-2038', name: 'delivery-message.pdf', type: 'application/pdf', size: 128300, hash: '31bc…a247', date: '2026-02-12', incident: 'Parcel delivery scam' },
  ]);
  set('family', [{ id: 1, name: 'Sunita Sharma', relation: 'Mother', phone: '+91 ••••• 82110', alerts: true }]);
  set('reports', [{ id: 'RPT-26021', category: 'UPI fraud', date: '2026-02-18', status: 'Draft', description: 'Unexpected UPI collect request received over messaging app.' }]);
  set('score', 120);
  set('seeded', true);
}

export function addActivity(action, detail) {
  const events = get('activity', []);
  events.unshift({ action, detail, time: new Date().toISOString() });
  set('activity', events.slice(0, 30));
}
