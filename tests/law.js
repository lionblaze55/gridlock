(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={}; G.peds=[]; G.cars=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600; G.cash=5000; giveWeapon('pistol',60); p.weapon=WI.pistol;
crime(1,'Grand theft auto'); const cop=new Ped(p.x+150,p.y,{role:'cop'}); G.peds.push(cop); crime(1.2,'Assaulting police'); G.heat=3.2; markSeen(); cop.state='chase';
const hp0=p.hp; await w(2500); out.hpArmed2s=Math.round(hp0-p.hp); out.st=stars(); out.can=canSurrender(); out.rap=(G.rap||[]).map(e=>e.k);
toggleSurrender(); out.sur=!!G.surrender; const t0=performance.now(); for(let i=0;i<40&&!p.dead;i++) await w(250); out.busted=p.dead; out.secs=Math.round((performance.now()-t0)/1000);
await w(4500); out.cash=G.cash; out.pistolAmmo=p.ammo[WI.pistol]; out.dlg=(document.querySelector('#dlg .txt, #dialog .txt, .dlgtext, #dlg')||{}).textContent; return out;})()
