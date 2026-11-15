(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; G.hgT=0; partAdd('eng',2,2); partAdd('tur',1,1); partAdd('rim',3,1); partAdd('exh',2,1); partAdd('nos',1,1); G.save.parts.eng_v8=1; G.save.parts.gearbox=2;
const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.tab='parts'; Panel.render(); await w(150); o.tiles=document.querySelectorAll('#panel .gtile').length; document.querySelectorAll('#panel .gtile')[0].click(); await w(150);
o.detail=document.querySelectorAll('#panel .pcol')[1].innerText.slice(0,400).replace(/\n/g,' | '); return o;})()
