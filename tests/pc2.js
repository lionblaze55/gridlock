(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); G.cash=50000; const L=myCars(); L.length=0; L.push({type:'sports',mods:{tur:1,rim:2},legit:1,cond:.45,id:'gB'}); partAdd('tur',1); G.stash.items.gearbox=2; G.save.lc={gearbox:[.9,.08]};
const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.wsel='gB'; Panel.render(); await w(200); return 1;})()
