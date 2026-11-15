(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; const out={}; G.cash=1000;
G.gigT=0; let q=null; for(let i=0;i<40&&!q;i++){ await w(250); q=G.peds.find(o=>o.gig); if(!q) G.gigT=0; }
if(!q) return 'no giver'; out.kind=q.gig.g.k; p.x=q.x+30; p.y=q.y; G.cam.x=p.x; G.cam.y=p.y; await w(400);
// force each gig kind & run quick completion
const res={};
for(const k of ['parcel','lost','tag','look','rough','smash','coffee']){ q.gig={g:GIGS.find(g=>g.k===k),pay:50,line:'x {$}'}; q.dead=false; q.gigT=G.t+100; talkTo(q); const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Deal'); b.click(); await w(100); const m=G.mission; if(!m){res[k]='nostart';continue;} const c0=G.cash;
  if(k==='parcel'){ const r=m.extra[0]; p.x=r.x+20; p.y=r.y; }
  if(k==='lost'){ p.x=m.target.x; p.y=m.target.y; await w(200); p.x=q.x+20; p.y=q.y; }
  if(k==='tag'||k==='look'){ p.x=m.target.x; p.y=m.target.y; if(k==='look'){ m.t=29.5; } }
  if(k==='rough'){ m.extra[0].hp=40; }
  if(k==='smash'){ const c=G.cars.find(c=>c.missionCar); c.hp=c.st.hp*.5; }
  if(k==='coffee'){ const b2=W.buildings.find(b=>b.type==='diner'&&b.door); enterBuilding(b2); await w(300); exitBuilding(); await w(200); p.x=q.x+20; p.y=q.y; }
  for(let t=0;t<16&&G.mission;t++) await w(250); res[k]=G.mission? 'stuck:'+G.mission.hud() : 'paid '+(G.cash-c0); if(G.mission) failMission('t'); G.heat=0; await w(100); }
out.res=res; return out;})()
