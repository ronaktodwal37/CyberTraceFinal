export function barChart(labels, values) {
  const max = Math.max(...values);
  return `<div class="bar-chart" aria-label="Bar chart">${values.map((value,i)=>`
    <div class="bar-group"><div class="bar" style="height:${Math.max(8,value/max*92)}%" data-value="${value}" title="${labels[i]}: ${value}"></div><span>${labels[i]}</span></div>`).join('')}</div>`;
}

export function donutChart() {
  return `<div class="donut-wrap"><div class="donut" role="img" aria-label="Case distribution donut chart"></div>
    <div class="legend"><span><i style="background:var(--pink)"></i>UPI & payments · 36%</span><span><i style="background:var(--gold)"></i>Impersonation · 26%</span><span><i style="background:var(--green)"></i>Investment · 16%</span><span><i style="background:#60708c"></i>Other · 22%</span></div></div>`;
}

export function networkGraph() {
  const nodes = [
    {id:'RJ-41',x:340,y:255,r:27,c:'#d94b9b',label:'Case 26041'},{id:'RJ-38',x:590,y:160,r:25,c:'#d94b9b',label:'Case 26038'},
    {id:'phone',x:470,y:280,r:20,c:'#d6b46a',label:'Phone •7218'},{id:'upi',x:640,y:330,r:20,c:'#28c78b',label:'secure-refund@upi'},
    {id:'domain',x:245,y:100,r:20,c:'#7687a6',label:'verify-kyc.site'},{id:'email',x:190,y:390,r:18,c:'#7687a6',label:'Email alias'},
    {id:'RJ-19',x:790,y:245,r:25,c:'#d94b9b',label:'Case 26019'},{id:'tx',x:490,y:440,r:18,c:'#28c78b',label:'Txn 88721'},
  ];
  const links = [['RJ-41','phone',0],['RJ-38','phone',1],['RJ-38','upi',0],['upi','RJ-19',1],['RJ-19','domain',1],['RJ-41','domain',1],['RJ-41','email',0],['upi','tx',0]];
  const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
  return `<svg class="network" viewBox="0 0 950 520" role="img" aria-label="Interactive network of synthetic cases and indicators">
    <g>${links.map(([a,b,p])=>`<line class="link ${p?'possible':''}" x1="${byId[a].x}" y1="${byId[a].y}" x2="${byId[b].x}" y2="${byId[b].y}"/>`).join('')}</g>
    <g>${nodes.map(n=>`<g class="graph-node" data-node="${n.id}" tabindex="0"><circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.c}"/><text x="${n.x}" y="${n.y+n.r+18}" text-anchor="middle">${n.label}</text></g>`).join('')}</g>
  </svg>`;
}

export function rajasthanMap() {
  return `<div class="map-panel card"><svg viewBox="0 0 500 480" aria-label="Stylised illustrative Rajasthan district map">
    <path class="district" data-name="Jaisalmer" d="M70 150L185 80 230 120 190 240 85 265 40 215Z"/><path class="district hot" data-name="Jodhpur" d="M190 240L230 120 315 150 300 255 245 290Z"/>
    <path class="district" data-name="Bikaner" d="M185 80L260 35 335 80 315 150 230 120Z"/><path class="district hot" data-name="Jaipur" d="M315 150L400 145 440 220 360 270 300 255Z"/>
    <path class="district" data-name="Ajmer" d="M245 290L300 255 360 270 340 340 270 350Z"/><path class="district" data-name="Kota" d="M340 340L360 270 440 220 465 310 415 380Z"/>
    <path class="district" data-name="Udaipur" d="M150 330L245 290 270 350 230 440 140 405Z"/><path class="district" data-name="Barmer" d="M85 265L190 240 245 290 150 330 70 340Z"/>
    <path class="district" data-name="Bharatpur" d="M400 145L455 150 475 205 440 220Z"/>
  </svg><div class="map-key">Illustrative district aggregation · synthetic data</div></div>`;
}
