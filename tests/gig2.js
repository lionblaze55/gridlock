(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; G.gigT=0; let q=null; for(let i=0;i<40&&!q;i++){ await w(250); q=G.peds.find(o=>o.gig); if(!q) G.gigT=0; }
q.gig={g:GIGS.find(g=>g.k==='lift'),pay:60,line:'lift {$}'}; talkTo(q); [...document.querySelectorAll('button')].find(b=>b.textContent==='Deal').click(); await w(100);
const c=new Car('sedan',q.x+50,q.y,0); G.cars.push(c); enterCar(c); await w(300); const s1=G.mission.stage; const d=G.mission.target; c.x=d.x; c.y=d.y; c.vx=c.vy=0; const c0=G.cash; for(let t=0;t<10&&G.mission;t++) await w(200); exitCar(true);
// giver bubble screenshot
G.gigT=0; let q2=null; for(let i=0;i<40&&!q2;i++){ await w(250); q2=G.peds.find(o=>o.gig); if(!q2) G.gigT=0;} if(q2){ p.x=q2.x+70; p.y=q2.y+20; } await w(700);
return {s1, paid:G.cash-c0, mission:!!G.mission};})()
