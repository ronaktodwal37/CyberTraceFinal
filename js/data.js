export const cases = [
  { id:'RJ-CT-26041', category:'Digital Arrest', district:'Jaipur', priority:'High', status:'Active', officer:'M. Rathore', amount:'₹8.4L', indicators:8 },
  { id:'RJ-CT-26038', category:'UPI Fraud', district:'Jodhpur', priority:'Critical', status:'Active', officer:'A. Khan', amount:'₹12.2L', indicators:12 },
  { id:'RJ-CT-26032', category:'Investment Scam', district:'Kota', priority:'Medium', status:'Review', officer:'S. Singh', amount:'₹3.1L', indicators:5 },
  { id:'RJ-CT-26027', category:'Job Fraud', district:'Udaipur', priority:'Low', status:'Pending', officer:'P. Jain', amount:'₹84K', indicators:4 },
  { id:'RJ-CT-26019', category:'KYC Phishing', district:'Ajmer', priority:'High', status:'Active', officer:'N. Joshi', amount:'₹5.6L', indicators:9 },
  { id:'RJ-CT-26012', category:'Parcel Scam', district:'Bikaner', priority:'Medium', status:'Resolved', officer:'R. Meena', amount:'₹1.2L', indicators:6 },
];

export const alerts = [
  { title:'Fake digital arrest calls', category:'Impersonation', date:'20 Feb 2026', district:'Statewide', severity:'High', text:'Callers impersonate law enforcement and demand immediate transfers. Police agencies do not conduct arrests over video calls.', source:'Illustrative public advisory' },
  { title:'Electricity disconnection messages', category:'Phishing', date:'17 Feb 2026', district:'Jaipur', severity:'Medium', text:'Messages threaten same-day disconnection and direct citizens to unofficial payment numbers.', source:'Synthetic demonstration alert' },
  { title:'Festival cashback links', category:'UPI fraud', date:'14 Feb 2026', district:'Jodhpur', severity:'Medium', text:'Shortened links offer rewards and then request a UPI PIN to receive money.', source:'Synthetic demonstration alert' },
];

export const innovations = [
  ['Scam SOS','Immediate, structured assistance for citizens facing cyber fraud.'],
  ['Any Input Intelligence','One interface for suspicious text, links, images, audio, PDFs and files.'],
  ['Scam DNA','Explainable similarity matching across reports and digital indicators.'],
  ['Rajasthan Scam Radar','District-level cybercrime patterns and regional threat insights.'],
  ['TRACEY AI','Multilingual guidance for citizens and evidence-aware support for officers.'],
  ['Before You Click','Explainable URL checks before citizens interact with suspicious sites.'],
  ['Evidence Locker','Integrity hashes, incident folders and evidence timelines.'],
  ['Scam Simulator','Interactive learning through realistic fictional scenarios.'],
  ['Family Shield','Voluntary trusted-contact warnings and senior safety support.'],
  ['Police Intelligence Bridge','Authorised citizen reports structured for police review.'],
];

export const entities = [
  { value:'+91 ••••• 47218', type:'Phone', source:'message-01.png', confidence:'98%', case:'RJ-CT-26041', status:'Unverified' },
  { value:'secure-refund@upi', type:'UPI ID', source:'payment.pdf', confidence:'96%', case:'RJ-CT-26038', status:'Possible match' },
  { value:'verify-kyc[.]site', type:'Domain', source:'chat-export.txt', confidence:'94%', case:'RJ-CT-26019', status:'Flagged' },
  { value:'supportdesk@protonmail.com', type:'Email', source:'email.eml', confidence:'91%', case:'RJ-CT-26032', status:'Unverified' },
  { value:'185.•••.41.22', type:'IP address', source:'headers.txt', confidence:'100%', case:'RJ-CT-26019', status:'Extracted' },
];

export const scenarios = [
  { title:'Fake digital arrest', message:'“This is the Cyber Bureau. Your Aadhaar is linked to a crime. Stay on video call and transfer ₹50,000 to a safe account for verification.”', options:['Transfer the money to avoid arrest','End the call and verify through official police channels','Share identity documents over the call'], correct:1, explain:'Police do not demand transfers to a “safe account” or conduct arrests over video calls. End the call, preserve evidence, and report it.' },
  { title:'UPI collect request', message:'“You won a refund of ₹4,999. Open this collect request and enter your UPI PIN to receive it.”', options:['Enter the PIN to receive the refund','Forward it to family','Decline the request and block the sender'], correct:2, explain:'A UPI PIN authorises money leaving your account. It is never needed to receive funds.' },
  { title:'Fake job offer', message:'“Earn ₹8,000 daily rating products. Pay a ₹500 refundable activation fee to unlock your first task.”', options:['Pay the small activation fee','Verify the employer independently and never pay for a job','Share bank details to speed up onboarding'], correct:1, explain:'Legitimate employers do not require task activation payments. Verify independently through official contact details.' },
  { title:'Fake parcel delivery', message:'“Your parcel is held due to an address issue. Pay ₹25 at bit.ly/parcel-fix within one hour.”', options:['Use the link immediately','Reply with your address and OTP','Check the courier’s official app or website directly'], correct:2, explain:'Urgency, shortened links, and small “verification” payments are common phishing signals.' },
];

export const pageTitles = {
  dashboard:'Command Overview', cases:'Case Management', 'case-details':'Investigation Detail', 'evidence-analysis':'Evidence Analysis',
  'scam-dna':'Scam DNA', 'entity-extraction':'Entity Extraction', 'network-graph':'Network Graph', 'location-intelligence':'Location Intelligence',
  'rajasthan-scam-radar':'Rajasthan Scam Radar', 'tracey-assistant':'TRACEY AI Assistant', reports:'Report Studio',
  'scam-sos':'Scam SOS', 'ai-scanner':'Any Input Intelligence', 'before-you-click':'Before You Click',
  'evidence-locker':'Evidence Locker', 'family-shield':'Family Shield', 'scam-simulator':'Scam Simulator',
  'scam-alerts':'Scam Alerts', report:'Report Cybercrime', profile:'Profile & Preferences',
  users:'User Management', roles:'Role Management', 'system-monitoring':'System Monitoring',
  'content-management':'Content Management', settings:'System Settings',
};
