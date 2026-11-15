(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; for(const [k,n] of [['egg',8],['milk',6],['flour',4],['butter',2],['apple',6],['potato',4]]) invAdd(k,n,1);
const home=W.buildings.find(b=>b.name==='Your Apartment'); enterBuilding(home); await w(500); Panel.open('kitchen',{tab:'cook'}); await w(150); o.rows=[...document.querySelectorAll('#panel .pcol')[0].querySelectorAll('.prow')].slice(0,5).map(r=>r.innerText.replace(/\n/g,' ')); 
const b=[...document.querySelectorAll('#panel button')].find(b=>/Cook \d/.test(b.textContent)); b.click(); await w(900); return o;})()
