(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const p=G.player;
const parked=()=>G.cars.find(c=>!c.dead&&!c.driver&&!c.owned&&c.ai&&c.ai.mode==='parked'&&c.type!=='cop'&&!c.d.boat&&!c.d.two);
// 1) nobody around: clear peds & drivers far
let c=parked()||(()=>{const k=new Car('sedan',p.x+40,p.y,0); k.ai={mode:'parked'}; G.cars.push(k); return k;})(); p.x=c.x+40; p.y=c.y; const saved=G.peds; G.peds=[]; const cars=G.cars; G.cars=[c]; G.heat=0; G.reports=[];
smashIn(c); await w(50); out.alone={heat:+G.heat.toFixed(2), reports:G.reports.length}; if(pCar()) exitCar(true); G.bi=null;
// 2) a ped right there looking at you
let ox=80,oy=0; for(const [a,b] of [[80,0],[-80,0],[0,80],[0,-80],[60,60],[-60,-60]]) if(losClear(p.x+a,p.y+b,p.x,p.y)&&!solidW(p.x+a,p.y+b)){ox=a;oy=b;break;} const q=new Ped(p.x+ox,p.y+oy,{role:'civ'}); q.a=Math.atan2(-oy,-ox); G.peds=[q]; G.heat=0; G.reports=[]; c.wired=0; c.owned=0; c.locked=1; smashIn(c); await w(50);
out.seen={heat:+G.heat.toFixed(2), reports:G.reports.length, who:G.reports[0]&&G.reports[0].who===q}; if(pCar()) exitCar(true); G.bi=null;
// 3) ped facing away, quiet steal (no smash): unlocked car entry
q.a=Math.atan2(oy,ox); q.x=p.x+ox*1.6; q.y=p.y+oy*1.6; G.heat=0; G.reports=[]; c.wired=0; c.owned=0; c.locked=0; enterCar(c); await w(50); out.backTurned={heat:+G.heat.toFixed(2), reports:G.reports.length}; exitCar(true);
G.peds=saved; G.cars=cars; return out;})()
