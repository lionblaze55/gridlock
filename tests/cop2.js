(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; const sp=randStreetPoint(0,99999,TILE.WALK); const X=sp.x!==undefined?sp.x:sp[0], Y=sp.y!==undefined?sp.y:sp[1]; G.wanted=0;
for (const mode of ['unarmed','armed']) { p.x=X+40; p.y=Y; p.hp=100; p.dead=0; const a=new Ped(X,Y,{role:'civ'}), cop=new Ped(X+170,Y+30,{role:'cop'}); G.peds.push(a,cop); if(mode==='armed') a.weapon=WI.pistol; a.state='fight'; a.target=p; a.timer=30; a.hostile=1; hurtPlayer(5,a,'punch');
 const log=[]; for(let i=0;i<40;i++){ await w(500); p.hp=100; log.push([cop.state, cop.npcT===a?'T':'-', cop.target===a?'tgtA':cop.target===p?'tgtP':'', Math.round(dist(cop.x,cop.y,a.x,a.y)), Math.round(a.hp), a.state, a.leaveT?'CUFF':'', a.dead?'DEAD':''].join(' ')); if(a.leaveT||a.dead) break; }
 o[mode]={end:log[log.length-1], first:log.slice(0,5), crime:a.npcCrime, wanted:G.wanted}; for(const q of [a,cop]){ const i=G.peds.indexOf(q); if(i>=0) G.peds.splice(i,1);} }
return o;})()
