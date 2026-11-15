(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={}; G.peds=[]; G.cars=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600; G.cash=5000; giveWeapon('pistol',60); p.weapon=WI.pistol;
crime(1,'Grand theft auto'); G.heat=3.2; markSeen(); const cop=new Ped(p.x+300,p.y,{role:'cop'}); G.peds.push(cop); cop.state='chase'; await w(300); out.arrest0=G.arrest;
toggleSurrender(); for(let i=0;i<60&&!p.dead;i++) await w(100); out.busted=p.dead; out.bi=JSON.stringify(G.bustInfo); out.kind=G.respawnKind; out.respAt=G.respawnAt-G.t;
for(let i=0;i<60&&p.dead;i++) await w(100); out.alive=!p.dead; out.cash=G.cash; out.ammo=p.ammo[WI.pistol]; out.dlgOpen=G.dlgOpen; out.txt=document.body.innerText.match(/Charges[\s\S]{0,200}/)?.[0]; return out;})()
