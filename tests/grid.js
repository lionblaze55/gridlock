(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; for(const [k,n] of [['medkit',2],['bandage',4],['burger',3],['egg',6],['apple',5],['ring',2],['watch',1],['leaf',3],['repairkit',1],['wheat',4]]) invAdd(k,n,1); giveWeapon('pistol',40); giveWeapon('shotgun',12);
openInv(); await w(150); o.inv=document.querySelectorAll('#panel .gtile').length; o.chips=[...document.querySelectorAll('#panel .gchips button')].map(b=>b.textContent).join('|');
document.querySelectorAll('#panel .gtile')[2].click(); await w(100); o.sel=document.querySelectorAll('#panel .pcol')[1].innerText.slice(0,120).replace(/\n/g,' | ');
return o;})()
