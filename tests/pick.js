(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=99999; const L=myCars(); L.length=0;
L.push({type:'muscle',mods:{},legit:1,cond:.8,id:'gP',missing:{gearbox:1},noEng:1});
G.stash.items.gearbox=2; G.save.lc={gearbox:[.9,.4]}; partAdd('trn',2); partAdd('tur',1); partAdd('brk',2); G.stash.items.eng_v8=1; G.stash.items.eng_i4t=1;
const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.wsel='gP'; Panel.render(); await w(150);
const col=i=>[...document.querySelectorAll('#panel .pcol')[i].querySelectorAll('.prow')].map(x=>x.querySelector('b').textContent+' | '+[...x.querySelectorAll('button')].map(b=>b.textContent).join(','));
out.slots=col(1); out.stockAll=col(2).length;
// tap the empty transmission row's Choose part
const row=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow')].find(x=>x.textContent.includes('Transmission')); row.querySelector('button').click(); await w(120);
out.stockFiltered=col(2);
// fit the race gearbox from the filtered list
const b=[...document.querySelectorAll('#panel .pcol')[2].querySelectorAll('.prow')].find(x=>x.textContent.includes('Race 6-speed')).querySelector('button'); b.click(); await w(120);
out.after={trn:L[0].mods.trn, miss:L[0].missing.gearbox|0}; out.stillSel=Panel.slot; 
// choose engine
const er=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow')].find(x=>x.textContent.includes('Engine')); er.click(); await w(120); out.engStock=col(2);
return out;})()
