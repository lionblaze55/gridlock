(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; G.cash=50000; giveWeapon('carbine',300); p.weapon=WI.carbine;
G.wmods.carbine={sight:3,laser:2,grip:1,barrel:1}; PWC={}; o.spreadNew=pw(WI.carbine).spread.toFixed(4); o.base=WEAPONS[WI.carbine].spread;
const c=gcond('carbine'); c.action=.25; c.mag=.4; c.barrel=.3; PWC={}; o.spreadWorn=pw(WI.carbine).spread.toFixed(4); o.misfire=misfireChance('carbine').toFixed(3);
// fire 200 times: count misfires
let mis=0; const t0=G.t; for(let i=0;i<200;i++){ p.fireCD=0; p.reloadT=0; p.clip[p.weapon]=30; p.ammo[p.weapon]=300; const a=p.ammo[p.weapon]; playerFire0(0); if(p.ammo[p.weapon]===a) mis++; }
o.misfires=mis; o.barrelAfter=c.barrel.toFixed(3);
// gunshop tabs
const shop=W.buildings.find(b=>b.type==='gunshop'||b.type==='gun'); Panel.open('gunshop',{name:'Test Guns'}); await w(100); o.tabs=[...document.querySelectorAll('#panel .ptabs button')].map(b=>b.textContent).join('|');
o.newList=[...document.querySelectorAll('#panel .prow b')].map(b=>b.textContent).slice(0,20).join(', ');
Panel.gtab='repair'; Panel.render(); await w(100); o.repair=document.querySelectorAll('#panel .pcol')[1].innerText.slice(0,300).replace(/\n/g,' | ');
const fixAll=[...document.querySelectorAll('#panel button')].find(b=>/Fix everything/.test(b.textContent)); const cash0=G.cash; fixAll.click(); await w(80); o.fixAllCost=cash0-G.cash; o.condAfter=gcAvg('carbine').toFixed(2);
Panel.gtab='used'; Panel.render(); await w(100); o.used=document.querySelectorAll('#panel .gtile').length; const bb=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('button')].pop(); o.usedBtn=bb.textContent; bb.click(); await w(150); if(G.dlgOpen && document.querySelector('#dlg.show')) document.querySelector('#dlg.show .opts button').click(); await w(100); o.usedSold=usedBin('gun').filter(u=>u.sold).map(u=>u.id+':'+gcAvg(u.id).toFixed(2)+':'+JSON.stringify(G.wmods[u.id]));
await w(100); Panel.gtab='sell'; Panel.render(); await w(100); o.sellRows=[...document.querySelectorAll('#panel .prow')].map(r=>r.innerText.replace(/\n/g,' ')).slice(0,3);
Panel.gtab='new'; Panel.sel='carbine'; Panel.render(); await w(150); return o;})()
