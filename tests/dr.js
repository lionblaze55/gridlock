(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; G.cash=2e6; econRealty(); o.labs=W.realty.filter(r=>r.kind==='lab').map(r=>r.name+':'+r.drug+':'+r.price);
const lab=W.realty.find(r=>r.drug==='frost'); buyProperty(lab); const O=LIFE().own[lab.id]; O.sup=100; o.lvl=O.lvl;
Panel.open('phone',{tab:'empire'}); Panel.sel=lab.id; Panel.render(); await w(200); o.rows=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow b')].map(b=>b.textContent);
[...document.querySelectorAll('#panel button')].filter(b=>b.textContent==='Hire')[1].click(); await w(100); o.crew=O.crew; O.prod=30; O.safe=0; for(let i=0;i<60;i++) lifeTick? 0:0; 
const t0=O.prod; G.t+=0; await w(2500); o.prodAfter=+O.prod.toFixed(2); o.safe=Math.round(O.safe);
o.cook=LABREC.map(r=>r.id).join(','); Panel.close();
// dealer menu size
const q=new Ped(G.player.x+30,G.player.y,{role:'civ'}); q.name='Test Dealer'; dealerMenu(q); await w(200); o.dealerBtns=document.querySelectorAll('#dlg button').length; closeDialog(); return o;})()
