(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; const sp=randStreetPoint(0,99999,TILE.WALK); const X=sp.x!==undefined?sp.x:sp[0], Y=sp.y!==undefined?sp.y:sp[1]; p.x=X+2000; p.y=Y; G.wanted=0;
for (const mode of ['unarmed','armed']) { const v=new Ped(X+30,Y,{role:'civ'}), a=new Ped(X,Y,{role:'civ'}), cop=new Ped(X+150,Y+20,{role:'cop'}); G.peds.push(v,a,cop); if(mode==='armed') a.weapon=WI.pistol; a.state='fight'; a.target=v; a.timer=20; v.hurt(10,a,'punch'); p.x=X+60; p.y=Y+200; 
 const log=[]; for(let i=0;i<40;i++){ await w(500); log.push([cop.state, cop.npcT===a?'T':'-', Math.round(dist(cop.x,cop.y,a.x,a.y)), Math.round(a.hp), a.state, a.leaveT?'CUFF':'', a.dead?'DEAD':''].join(' ')); if(a.leaveT||a.dead) break; }
 o[mode]={end:log[log.length-1], first:log.slice(0,4), copW:cop.weapon, crime:a.npcCrime}; for(const q of [v,a,cop]){ const i=G.peds.indexOf(q); if(i>=0) G.peds.splice(i,1);} }
return o;})()
