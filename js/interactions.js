import { login, logout, roleHome, session } from './auth.js';
import { get, set, addActivity, url } from './storage.js';
import { setLanguage } from './language.js';
import { inspectText, inspectUrl, hashFile, saveEvidence, removeEvidence, download } from './features.js';
import { scenarios } from './data.js';

export function toast(title,message) {
  let stack=document.querySelector('.toast-stack');
  if(!stack){ stack=document.createElement('div');stack.className='toast-stack';document.body.append(stack); }
  const el=document.createElement('div');el.className='toast';el.innerHTML=`<strong>${title}</strong><span>${message}</span>`;stack.append(el);
  setTimeout(()=>el.remove(),4200);
}

function modal(title,body) {
  const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<section class="modal card" role="dialog" aria-modal="true"><div class="card-header"><h3>${title}</h3><button type="button" class="icon-btn" data-close-modal aria-label="Close">×</button></div>${body}</section>`;
  document.body.append(wrap);wrap.querySelector('[data-close-modal]').onclick=()=>wrap.remove();wrap.onclick=e=>{if(e.target===wrap)wrap.remove()};return wrap;
}

function riskResult(result,kind='content') {
  const color=result.score>65?'var(--red)':result.score>35?'var(--amber)':'var(--green)';
  return `<div class="result-panel"><div class="risk-score"><div class="risk-circle" style="background:conic-gradient(${color} 0 ${result.score}%,#273247 ${result.score}%)" data-score="${result.score}"></div><div><span class="badge ${result.score>65?'danger':result.score>35?'warning':'success'}">${result.level} risk signal</span><h3 style="margin:8px 0 0">${kind==='url'?(result.domain||'URL'):'Explainable findings'}</h3></div></div><div class="timeline" style="margin-top:20px">${(result.findings.length?result.findings:['No common high-risk text patterns were detected.']).map(x=>`<div class="timeline-item"><p>${x}</p></div>`).join('')}</div><p class="muted" style="font-size:.7rem;margin-top:18px">This heuristic score is not proof of fraud or safety. Verify independently before acting.</p></div>`;
}

function traceyReply(prompt,role) {
  const p=prompt.toLowerCase();
  if(role==='police') {
    if(p.includes('common')||p.includes('related')) return `<strong>Inference · human review required</strong><br>Cases RJ-CT-26041 and RJ-CT-26038 share a masked phone indicator and similar “safe account” wording. Source references: message-01.png [line 3], chat-export.txt [lines 8–10]. This does not prove common attribution.`;
    if(p.includes('missing')) return `<strong>Suggested review steps</strong><br>1. Confirm transaction references against submitted receipts.<br>2. Validate whether the masked phone values are complete matches.<br>3. Record the independent source for each domain finding.`;
    return `<strong>Case summary · synthetic data</strong><br>RJ-CT-26041 concerns a digital-arrest impersonation report with four evidence items and eight extracted indicators. Two possible related reports require officer review. Facts are separated from inferred pattern links.`;
  }
  if(p.includes('money')||p.includes('paid')||p.includes('transfer')) return `<strong>Act now:</strong> Call your bank using its official number and call 1930 immediately. Preserve the transaction ID and screenshots. Do not wait for this chat or any scan.`;
  if(p.includes('link')||p.includes('url')) return `Do not open the link. Use <a href="${url('citizen/before-you-click.html')}" style="color:var(--pink-soft)">Before You Click</a> to inspect its structure, then navigate independently to the organisation’s official website. A URL check cannot guarantee safety.`;
  return `I can help you inspect suspicious content, preserve evidence or find official reporting steps. I am a frontend demonstration and cannot contact banks, police systems or private databases.`;
}

function setupAuth() {
  const form=document.querySelector('[data-login]');
  if(form){
    const params=new URLSearchParams(location.search), initial=params.get('role');
    const selectRole=role=>{form.querySelectorAll('[data-role]').forEach(b=>b.classList.toggle('active',b.dataset.role===role));form.elements.role.value=role};
    if(['citizen','police','admin'].includes(initial))selectRole(initial);
    form.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>selectRole(b.dataset.role));
    form.querySelector('[data-show-password]').onclick=e=>{const p=form.elements.password;p.type=p.type==='password'?'text':'password';e.target.textContent=p.type==='password'?'Show':'Hide'};
    form.querySelectorAll('[data-fill]').forEach(b=>b.onclick=()=>{const r=b.dataset.fill, creds={citizen:['citizen@cybertrace.demo','Citizen@123'],police:['officer@cybertrace.demo','Police@123'],admin:['admin@cybertrace.demo','Admin@123']}[r];selectRole(r);form.elements.email.value=creds[0];form.elements.password.value=creds[1]});
    form.onsubmit=e=>{e.preventDefault();const result=login(form.elements.email.value,form.elements.password.value,form.elements.role.value,form.elements.remember.checked);const err=form.querySelector('[data-auth-error]');if(result.ok){err.innerHTML='<p class="badge success" style="margin-top:12px">Access verified. Opening workspace…</p>';setTimeout(()=>location.href=roleHome(result.user.role),400)}else err.innerHTML=`<p class="badge danger" style="margin-top:12px">${result.message}</p>`};
  }
  const register=document.querySelector('[data-register]');
  if(register)register.onsubmit=e=>{e.preventDefault();const d=new FormData(register),users=get('users',[]);if(users.some(u=>u.email.toLowerCase()===String(d.get('email')).toLowerCase()))return toast('Account exists','Use the login page for this email.');users.push({id:`U-${Date.now()}`,name:d.get('name'),email:d.get('email'),password:d.get('password'),district:d.get('district'),role:'citizen',active:true});set('users',users);toast('Demo account created','Your browser-local citizen account is ready.');setTimeout(()=>location.href=url('auth/login.html?role=citizen'),800)};
  const forgot=document.querySelector('[data-forgot]');
  if(forgot)forgot.onsubmit=e=>{e.preventDefault();const exists=get('users',[]).some(u=>u.email.toLowerCase()===String(new FormData(forgot).get('email')).toLowerCase());toast(exists?'Demo account found':'No demo account found',exists?'Use the published demonstration password or create a new citizen account.':'Check the email address and try again.')};
}

async function handleFiles(files) {
  const preview=document.querySelector('[data-file-preview]'), result=document.querySelector('[data-analysis-result]');
  if(!files?.length)return; const file=files[0];
  if(file.size>20*1024*1024)return toast('File too large','The demonstration limit is 20 MB.');
  if(preview) preview.innerHTML=`<div class="activity-item"><i class="activity-dot"></i><p><strong>${file.name}</strong><br><span class="muted">${file.type||'Unknown type'} · ${Math.round(file.size/1024)} KB</span></p><span class="badge warning">Ready</span></div>`;
  if(result){result.innerHTML='<div class="empty"><strong>Inspecting local metadata…</strong><p>No file is uploaded to a server.</p></div>';setTimeout(()=>result.innerHTML=riskResult({score:file.name.match(/\.apk$/i)?72:38,level:file.name.match(/\.apk$/i)?'High':'Caution',findings:[`File type: ${file.type||'unreported'}`,`File size: ${Math.round(file.size/1024)} KB`,'Content findings are illustrative; no malware engine or OCR model ran.']}),700)}
  const hash=await hashFile(file); saveEvidence({id:`EV-${Date.now()}`,name:file.name,type:file.type,size:file.size,hash,date:new Date().toISOString().slice(0,10),incident:'Uploaded for demonstration analysis'});
  toast('Evidence prepared','Metadata and a local integrity hash were saved.');
}

function setupTools() {
  document.querySelectorAll('[data-scan-tab]').forEach(tab=>tab.onclick=()=>{document.querySelectorAll('[data-scan-tab]').forEach(x=>x.classList.toggle('active',x===tab));document.querySelectorAll('[data-scan-panel]').forEach(x=>x.hidden=x.dataset.scanPanel!==tab.dataset.scanTab)});
  document.querySelector('[data-analyse-text]')?.addEventListener('click',()=>{const text=document.querySelector('[data-scan-text]').value.trim();if(!text)return toast('Add content','Paste a suspicious message or URL first.');const r=/^(https?:\/\/|www\.)/i.test(text)?inspectUrl(text):inspectText(text);document.querySelector('[data-analysis-result]').innerHTML=riskResult(r,r.domain?'url':'content');addActivity('Content analysed',r.level+' risk signal')});
  document.querySelector('[data-url-check]')?.addEventListener('submit',e=>{e.preventDefault();const r=inspectUrl(new FormData(e.target).get('url'));document.querySelector('[data-url-result]').innerHTML=riskResult(r,'url');addActivity('URL checked',r.domain||'Invalid URL')});
  document.querySelectorAll('[data-file-input]').forEach(input=>input.onchange=()=>handleFiles(input.files));
  document.querySelectorAll('[data-dropzone]').forEach(zone=>{zone.ondragover=e=>{e.preventDefault();zone.classList.add('drag')};zone.ondragleave=()=>zone.classList.remove('drag');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('drag');handleFiles(e.dataTransfer.files)}});
  document.querySelectorAll('[data-delete-evidence]').forEach(btn=>btn.onclick=()=>{const wrap=modal('Remove evidence?',`<p class="muted">This removes the browser-local demonstration record. This cannot be undone.</p><button type="button" class="btn btn-danger" data-confirm>Remove record</button>`);wrap.querySelector('[data-confirm]').onclick=()=>{removeEvidence(btn.dataset.deleteEvidence);btn.closest('tr').remove();wrap.remove();toast('Evidence removed','The local record was deleted.')}});
  document.querySelector('[data-add-evidence]')?.addEventListener('click',()=>{const wrap=modal('Add evidence',`<form data-modal-evidence><div class="field"><label>Incident name</label><input class="input" name="incident" required></div><div class="field"><label>Choose file</label><input class="input" name="file" type="file" required></div><button class="btn btn-primary" type="submit">Hash & save</button></form>`);wrap.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=e.target.elements.file.files[0],hash=await hashFile(f);saveEvidence({id:`EV-${Date.now()}`,name:f.name,type:f.type,size:f.size,hash,date:new Date().toISOString().slice(0,10),incident:e.target.elements.incident.value});wrap.remove();toast('Evidence saved','SHA-256 integrity hash calculated locally.');setTimeout(()=>location.reload(),500)}});
  document.querySelector('[data-download-evidence]')?.addEventListener('click',()=>download('cybertrace-evidence-summary.html',`<h1>CYBERTRACE Evidence Summary</h1><p>Prototype record — not proof of authenticity or legal admissibility.</p>${get('evidence',[]).map(e=>`<h2>${e.name}</h2><p>${e.incident} · ${e.date}<br>SHA-256: ${e.hash}</p>`).join('')}`));
  document.querySelector('[data-report]')?.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),reports=get('reports',[]);reports.unshift({id:`RPT-${Date.now()}`,status:'Draft',...d});set('reports',reports);download('cybertrace-draft-report.html',`<h1>CYBERTRACE Draft Incident Summary</h1><strong>NOT AN OFFICIAL COMPLAINT</strong><pre>${JSON.stringify(d,null,2)}</pre>`);toast('Draft saved','Use the official portal to file a complaint.');e.target.reset()});
}

function setupSimulator() {
  const sim=document.querySelector('[data-simulator]');if(!sim)return;
  const render=()=>{const index=Number(sim.dataset.index),s=scenarios[index];sim.querySelector('[data-sim-title]').textContent=s.title;sim.querySelector('[data-sim-message]').textContent=s.message;sim.querySelector('.badge').textContent=`Scenario ${index+1} of ${scenarios.length}`;sim.querySelector('[data-sim-feedback]').innerHTML='';sim.querySelector('[data-sim-answers]').innerHTML=s.options.map((x,i)=>`<button type="button" class="answer" data-answer="${i}">${x}</button>`).join('');sim.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const correct=Number(b.dataset.answer)===s.correct;sim.querySelectorAll('[data-answer]').forEach((x,i)=>{x.disabled=true;x.classList.add(i===s.correct?'correct':x===b?'wrong':'')});if(correct){const nextScore=get('score',0)+25;set('score',nextScore);const scEl=document.querySelector('[data-sim-score]');if(scEl)scEl.textContent=`${nextScore} pts`;const prEl=document.querySelector('[data-sim-progress]');if(prEl)prEl.style.width=`${Math.min(100,nextScore/4)}%`;}sim.querySelector('[data-sim-feedback]').innerHTML=`<div class="result-panel" style="margin-top:14px"><strong>${correct?'Correct response (+25 pts)':'Safer response highlighted'}</strong><p>${s.explain}</p><button type="button" class="btn btn-primary btn-sm" data-next-sim>${index===scenarios.length-1?'Restart practice':'Next scenario'}</button></div>`;sim.querySelector('[data-next-sim]').onclick=()=>{sim.dataset.index=(index+1)%scenarios.length;render()}})};render();
}

function setupGeneral() {
  document.querySelectorAll('[data-language]').forEach(x=>x.onchange=()=>setLanguage(x.value));
  document.querySelectorAll('[data-logout]').forEach(x=>x.onclick=logout);
  document.querySelector('[data-sidebar]')?.addEventListener('click',()=>window.innerWidth<=720?document.querySelector('#sidebar').classList.toggle('open'):document.querySelector('.shell').classList.toggle('sidebar-collapsed'));
  document.querySelector('[data-mobile-menu]')?.addEventListener('click',()=>modal('Navigate CYBERTRACE',`<nav class="side-nav"><a href="${url('features.html')}">Innovations</a><a href="${url('how-it-works.html')}">How it works</a><a href="${url('awareness.html')}">Awareness</a><a href="${url('resources.html')}">Official resources</a><a href="${url('contact.html')}">Contact</a><a href="${url('auth/login.html')}">Sign in</a></nav>`));
  document.querySelector('[data-global-search]')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.value.trim()){toast('Workspace search',`Showing local matches for “${e.target.value.trim()}”.`);const ts=document.querySelector('[data-table-search]')||document.querySelector('[data-card-search]');if(ts){ts.value=e.target.value.trim();ts.dispatchEvent(new Event('input'));ts.focus();}}});

  // Table search + Entity type filter
  const applyTableFilters = () => {
    const q = (document.querySelector('[data-table-search]')?.value || '').toLowerCase();
    const prio = document.querySelector('[data-case-filter]')?.value || '';
    const etype = document.querySelector('[data-entity-type]')?.value || '';
    document.querySelectorAll('tbody tr').forEach(row => {
      const matchText = !q || row.textContent.toLowerCase().includes(q);
      const matchPrio = !prio || row.textContent.includes(prio);
      const matchType = !etype || row.dataset.type === etype;
      row.hidden = !(matchText && matchPrio && matchType);
    });
  };
  document.querySelectorAll('[data-table-search]').forEach(input => input.oninput = applyTableFilters);
  document.querySelector('[data-case-filter]')?.addEventListener('change', applyTableFilters);
  document.querySelector('[data-entity-type]')?.addEventListener('change', applyTableFilters);

  // Scam alerts search + district filter
  const applyAlertFilters = () => {
    const q = (document.querySelector('[data-card-search]')?.value || '').toLowerCase();
    const dist = document.querySelector('[data-alert-district]')?.value || '';
    document.querySelectorAll('[data-search-cards] > *').forEach(card => {
      const matchText = !q || (card.dataset.search || '').toLowerCase().includes(q);
      const matchDist = !dist || (card.dataset.district || '') === dist;
      card.hidden = !(matchText && matchDist);
    });
  };
  document.querySelector('[data-card-search]')?.addEventListener('input', applyAlertFilters);
  document.querySelector('[data-alert-district]')?.addEventListener('change', applyAlertFilters);

  // Network graph search, node selection & reset
  document.querySelectorAll('.graph-node').forEach(n=>n.onclick=()=>{document.querySelector('[data-node-detail]').innerHTML=`<strong>${n.querySelector('text').textContent}</strong> · Synthetic node selected. Dashed edges represent possible associations requiring verification.`});
  document.querySelector('[data-graph-search]')?.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.graph-node').forEach(n => {
      const label = (n.querySelector('text')?.textContent || '').toLowerCase();
      n.classList.toggle('dimmed', Boolean(q) && !label.includes(q));
    });
  });
  document.querySelector('[data-graph-reset]')?.addEventListener('click',()=>{
    const gs = document.querySelector('[data-graph-search]');
    if (gs) gs.value = '';
    document.querySelectorAll('.graph-node').forEach(n => n.classList.remove('dimmed'));
    document.querySelector('[data-node-detail]').textContent='View reset. Select a node to inspect its demonstration relationships.';
    toast('Graph reset','Default synthetic network view restored.');
  });

  // Rajasthan Scam Radar / Location Intelligence map + filters
  const districtStats = {
    Jaipur: { count: 84, top: 'UPI fraud' }, Jodhpur: { count: 62, top: 'Digital arrest' },
    Kota: { count: 48, top: 'Investment scam' }, Udaipur: { count: 39, top: 'Job fraud' },
    Ajmer: { count: 34, top: 'KYC phishing' }, Bikaner: { count: 27, top: 'Parcel scam' },
    Jaisalmer: { count: 14, top: 'UPI fraud' }, Barmer: { count: 19, top: 'KYC phishing' },
    Bharatpur: { count: 29, top: 'Impersonation' }
  };
  const updateRadar = (districtName) => {
    const selDist = districtName || document.querySelector('[data-radar-district]')?.value || 'Jaipur';
    const selCat = document.querySelector('[data-radar-category]')?.value || 'All scam categories';
    const selRange = document.querySelector('[data-radar-range]')?.value || 'Last 30 days';
    const info = districtStats[selDist] || { count: 24, top: 'UPI fraud' };
    document.querySelectorAll('.district').forEach(d => d.classList.toggle('selected', d.dataset.name === selDist));
    const detail = document.querySelector('[data-map-detail]');
    if (detail) {
      detail.innerHTML = `<strong>${selDist} · illustrative view (${selRange})</strong><p class="muted">${info.count} sample reports · Filter: ${selCat}. Leading category: ${info.top}. Synthetic data only.</p>`;
    }
  };
  document.querySelectorAll('.district').forEach(n => n.onclick = () => {
    const sel = document.querySelector('[data-radar-district]');
    if (sel) sel.value = n.dataset.name;
    updateRadar(n.dataset.name);
  });
  document.querySelectorAll('[data-radar-district],[data-radar-category],[data-radar-range]').forEach(s => s.onchange = () => updateRadar());

  // Family shield demo alerts
  document.querySelectorAll('[data-share-alert]').forEach(x=>x.onclick=()=>toast('Demo alert shared','A browser-local notification was recorded. No SMS was sent.'));

  // Forms: SOS, Profile, Settings, Contact
  document.querySelector('[data-sos]')?.addEventListener('submit', e => {
    e.preventDefault();
    const type = new FormData(e.target).get('type');
    const cl = document.querySelector('[data-sos-checklist]');
    if (cl) {
      cl.insertAdjacentHTML('afterbegin', `<div class="timeline-item"><time>SELECTED</time><p><strong>${type}:</strong> Checklist tailored locally. Preserve all screenshots and call 1930 if money was moved.</p></div>`);
    }
    toast('Checklist updated', `Action steps prepared for: ${type}`);
    e.target.reset();
  });
  document.querySelectorAll('[data-profile],[data-settings]').forEach(f=>f.onsubmit=e=>{e.preventDefault();toast('Saved locally','Your demonstration changes were saved in this browser.')});
  document.querySelector('[data-contact]')?.addEventListener('submit',e=>{e.preventDefault();toast('Message saved','This demo does not transmit messages to a server.');e.target.reset()});

  // Review modals
  document.querySelectorAll('[data-review-match],[data-role-detail],[data-edit-content]').forEach(x=>x.onclick=()=>modal('Review details','<p class="muted">This demonstration view separates verified fields from possible associations. Human review remains required before operational use.</p><span class="badge warning">Unverified suggestion</span>'));
  document.querySelector('[data-review-submission]')?.addEventListener('click',()=>{
    const wrap=modal('Authorised citizen submission','<span class="badge warning">Unverified citizen report</span><h3 style="margin-top:15px">Unexpected UPI collect request</h3><p class="muted">Submitted indicators: masked phone number, UPI ID and screenshot metadata. Officer review is required before case creation.</p><button type="button" class="btn btn-primary" data-create-from-submission>Create demonstration case</button>');
    wrap.querySelector('[data-create-from-submission]').onclick=()=>{
      const custom=get('custom_cases',[]);
      const newId=`RJ-CT-${Math.floor(26050+Math.random()*900)}`;
      custom.unshift({id:newId,category:'UPI Fraud',district:'Jaipur',priority:'High',status:'Active',officer:'M. Rathore',amount:'₹49K',indicators:4});
      set('custom_cases',custom);
      wrap.remove();
      toast('Case created',`${newId} added from authorised citizen submission.`);
      setTimeout(()=>location.reload(),450);
    };
  });

  // Persistent creation modals
  document.querySelector('[data-new-case]')?.addEventListener('click',()=>{
    const wrap=modal('Create demonstration case','<form data-modal-case><div class="field"><label>Category</label><select class="select" name="category"><option>UPI Fraud</option><option>Digital Arrest</option><option>KYC Phishing</option><option>Investment Scam</option></select></div><div class="field"><label>District</label><select class="select" name="district"><option>Jaipur</option><option>Jodhpur</option><option>Kota</option><option>Udaipur</option><option>Ajmer</option></select></div><div class="field"><label>Priority</label><select class="select" name="priority"><option>High</option><option>Critical</option><option>Medium</option><option>Low</option></select></div><button class="btn btn-primary" type="submit">Save demonstration case</button></form>');
    wrap.querySelector('form').onsubmit=e=>{
      e.preventDefault();
      const d=new FormData(e.target), custom=get('custom_cases',[]);
      const newId=`RJ-CT-${Math.floor(26050+Math.random()*900)}`;
      custom.unshift({id:newId,category:d.get('category'),district:d.get('district'),priority:d.get('priority'),status:'Active',officer:'M. Rathore',amount:'₹1.5L',indicators:3});
      set('custom_cases',custom);
      wrap.remove();
      toast('Case created',`${newId} saved locally.`);
      setTimeout(()=>location.reload(),450);
    };
  });

  document.querySelector('[data-add-contact]')?.addEventListener('click',()=>{
    const wrap=modal('Add trusted contact','<form data-modal-contact><div class="field"><label>Name</label><input class="input" name="name" required></div><div class="field"><label>Relationship</label><input class="input" name="relation" required></div><div class="field"><label>Phone</label><input class="input" name="phone" required></div><button class="btn btn-primary" type="submit">Save trusted contact</button></form>');
    wrap.querySelector('form').onsubmit=e=>{
      e.preventDefault();
      const d=new FormData(e.target), contacts=get('family',[]);
      contacts.push({id:Date.now(),name:d.get('name'),relation:d.get('relation'),phone:d.get('phone'),alerts:true});
      set('family',contacts);
      wrap.remove();
      toast('Contact saved','Trusted family contact added locally.');
      setTimeout(()=>location.reload(),450);
    };
  });

  document.querySelector('[data-add-user]')?.addEventListener('click',()=>{
    const wrap=modal('Add demonstration user','<form data-modal-user><div class="field"><label>Name</label><input class="input" name="name" required></div><div class="field"><label>Email</label><input class="input" name="email" type="email" required></div><div class="field"><label>Role</label><select class="select" name="role"><option value="citizen">Citizen</option><option value="police">Police officer</option><option value="admin">Administrator</option></select></div><div class="field"><label>District / unit</label><input class="input" name="district" value="Jaipur" required></div><button class="btn btn-primary" type="submit">Save demonstration user</button></form>');
    wrap.querySelector('form').onsubmit=e=>{
      e.preventDefault();
      const d=new FormData(e.target), users=get('users',[]);
      users.push({id:`U-${Date.now()}`,name:d.get('name'),email:d.get('email'),password:'Demo@123',role:d.get('role'),district:d.get('district'),active:true});
      set('users',users);
      wrap.remove();
      toast('User added','Browser-local demonstration account created.');
      setTimeout(()=>location.reload(),450);
    };
  });

  document.querySelector('[data-add-content]')?.addEventListener('click',()=>{
    const wrap=modal('Create sample advisory','<form data-modal-advisory><div class="field"><label>Advisory title</label><input class="input" name="title" required></div><div class="field"><label>Category</label><select class="select" name="category"><option>Phishing</option><option>UPI fraud</option><option>Impersonation</option></select></div><div class="field"><label>Safety guidance</label><textarea class="textarea" name="text" required></textarea></div><button class="btn btn-primary" type="submit">Save advisory</button></form>');
    wrap.querySelector('form').onsubmit=e=>{
      e.preventDefault();
      const d=new FormData(e.target), custom=get('custom_alerts',[]);
      custom.unshift({title:d.get('title'),category:d.get('category'),date:'Today',district:'Statewide',severity:'High',text:d.get('text'),source:'Local demonstration advisory'});
      set('custom_alerts',custom);
      wrap.remove();
      toast('Advisory saved','New sample advisory added locally.');
      setTimeout(()=>location.reload(),450);
    };
  });

  document.querySelectorAll('[data-toggle-user]').forEach(btn=>btn.onclick=()=>{const users=get('users',[]),user=users.find(u=>u.id===btn.dataset.toggleUser);if(user){user.active=!user.active;set('users',users);btn.textContent=user.active?'Deactivate':'Activate';btn.closest('tr').children[3].textContent=user.active?'Active':'Inactive';toast('Account updated',`${user.name} is now ${user.active?'active':'inactive'}.`) }});
  document.querySelector('[data-notifications]')?.addEventListener('click',()=>modal('Notifications','<div class="activity"><div class="activity-item"><i class="activity-dot"></i><p>New cyber safety advisory is available.</p><time>Today</time></div><div class="activity-item"><i class="activity-dot"></i><p>TRACEY AI demonstration is ready.</p><time>Today</time></div></div>'));
  document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
  document.querySelectorAll('[data-generate-report]').forEach(x=>x.onclick=()=>{const csv=x.dataset.generateReport==='csv';download(csv?'evidence-index.csv':'case-summary.html',csv?'Evidence,Source,Status\nmessage-01.png,RJ-CT-26041,Reviewed':'<h1>CYBERTRACE Synthetic Case Summary</h1><p>Demonstration data only.</p><h2>RJ-CT-26041</h2><p>Digital arrest impersonation investigation. All findings require officer review.</p>',csv?'text/csv':'text/html')});
  document.querySelector('[data-export-cases]')?.addEventListener('click',()=>download('cybertrace-cases.csv','Case,Category,District,Priority\nRJ-CT-26041,Digital Arrest,Jaipur,High\nRJ-CT-26038,UPI Fraud,Jodhpur,Critical','text/csv'));
}

function setupTracey() {
  const open=(prompt='')=>{
    let drawer=document.querySelector('.tracey-drawer');
    if(!drawer){
      drawer=document.createElement('section');
      drawer.className='tracey-drawer';
      drawer.innerHTML=`<div class="tracey-head"><div class="tracey-head-brand"><img class="tracey-head-avatar" src="${url('assets/avatars/tracey-ai.png')}" alt="TRACEY AI" /><div><p><strong>TRACEY AI</strong></p><span><i class="pulse"></i> Demonstration assistant</span></div></div><button type="button" class="icon-btn" data-close-tracey>×</button></div><div class="tracey-messages"><div class="message">${traceyReply('',session()?.role)}</div></div><form class="tracey-form"><button class="icon-btn" type="button" data-voice aria-label="Use voice input">◉</button><input class="input" placeholder="Ask TRACEY"><button class="btn btn-primary" type="submit">Send</button></form>`;
      document.body.append(drawer);
      drawer.querySelector('[data-close-tracey]').onclick=()=>drawer.remove();
      drawer.querySelector('[data-voice]').onclick=()=>{
        const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
        if(!SpeechRecognition)return toast('Voice input unavailable','This browser does not provide speech recognition. Type your question instead.');
        const recognition=new SpeechRecognition();
        recognition.lang='en-IN';
        recognition.onresult=e=>drawer.querySelector('input').value=e.results[0][0].transcript;
        recognition.onerror=()=>toast('Voice input stopped','No speech was captured. Try again or type your question.');
        recognition.start();
      };
      drawer.querySelector('form').onsubmit=e=>{
        e.preventDefault();
        const input=e.target.querySelector('input'),q=input.value.trim();
        if(!q)return;
        const messages=drawer.querySelector('.tracey-messages');
        messages.insertAdjacentHTML('beforeend',`<div class="message user">${q}</div><div class="message">${traceyReply(q,session()?.role)}</div>`);
        input.value='';
        messages.scrollTop=messages.scrollHeight;
      };
    }
    if(prompt){drawer.querySelector('input').value=prompt;drawer.querySelector('form').requestSubmit()}
  };
  document.querySelector('[data-tracey]')?.addEventListener('click',()=>open());
  document.querySelectorAll('[data-tracey-prompt]').forEach(x=>x.onclick=()=>{const form=document.querySelector('[data-ai-form]');if(form){form.elements.prompt.value=x.dataset.traceyPrompt;form.requestSubmit()}else open(x.dataset.traceyPrompt)});
  document.querySelector('[data-ai-form]')?.addEventListener('submit',e=>{e.preventDefault();const q=e.target.elements.prompt.value.trim();if(!q)return;document.querySelector('[data-ai-workspace]').insertAdjacentHTML('beforeend',`<div class="message user">${q}</div><div class="message">${traceyReply(q,'police')}</div>`);e.target.reset()});
}

export function bindInteractions() {
  document.addEventListener('toast',e=>toast(e.detail.title,e.detail.message));
  setupAuth();setupTools();setupSimulator();setupGeneral();setupTracey();
}
