(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}, p=G.player; G.cash=5e6; econRealty();
const L=myCars(); L.length=0; for(const t of ['muscle','sports','sedan']) L.push({type:t,mods:{},legit:1,cond:.9});
const r=W.realty.find(r=>r.kind==='home'); buyProperty(r); G.hgT=0; const gs=homeGarages(); o.gars=gs.map(g=>garName(g.b)+':'+capIn(g)+':'+!!g.bld);
garAssign(); o.assigned=L.map(x=>x.gar===gs[0].b.id);
// walk into apartment garage
const g=gs[0]; p.x=g.ax; p.y=g.ay; await w(200); p.x=g.x; p.y=g.y; await w(600); o.walkIn=!!(G.scene&&G.scene.garage); o.items=G.scene&&G.scene.items.map(i=>i.t).join(',');
const tool=G.scene.items.find(i=>i.t==='gtool'); useItem(tool); await w(150); o.toolPanel=Panel.mode+' '+document.querySelectorAll('#panel .pcol')[0].querySelectorAll('.prow').length; Panel.close(); exitBuilding(); await w(300);
// phone master list
Panel.open('phone',{tab:'cars'}); await w(200); o.list=[...document.querySelectorAll('#panel .pcol')[0].children].map(x=>x.className==='ptitle'?'## '+x.textContent:(x.querySelector&&x.querySelector('b')?x.querySelector('b').textContent:'')).filter(Boolean).slice(0,12);
const g2=gs[1]; moveCar(L[0], g2); o.moved=L[0].gar===g2.b.id; Panel.close();
// enter garage 2 and check it shows the moved car only
enterGarage(g2); await w(200); o.g2cars=G.scene.items.filter(i=>i.t==='gcar').length; o.g2bays=G.scene.items.filter(i=>i.t==='gbay').length; exitBuilding();
return o;})()
