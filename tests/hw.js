(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={}; G.peds=[]; G.cars=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600; G.heat=0;
const c=new Car('luxsedan',p.x+30,p.y,0); c.ai={mode:'parked'}; G.cars.push(c); c.locked=1; tryEnterCar(c); await w(200); out.dlg=[...document.querySelectorAll('button')].map(b=>b.textContent).filter(t=>/Smash|Pick|Leave/.test(t));
[...document.querySelectorAll('button')].find(b=>/Pick/.test(b.textContent)).click(); await w(200); out.stage=G.bi&&G.bi.stage; for(let i=0;i<40&&G.bi&&G.bi.stage==='pick';i++) await w(200); out.afterPick={stage:G.bi&&G.bi.stage, inCar:pCar()===c, alarm:c.alarmT>0};
// try driving before wired
Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}; await w(600); out.spdBeforeWire=Math.round(c.spd); Input.stick={active:false};
// tap at right moments
let guard=0; while(G.bi&&G.bi.stage==='wire'&&guard++<400){ const B=G.bi; if(Math.abs(needlePos(B)-B.zone)<B.w/2-.01){ wireTap(); } await w(16); }
out.wired=c.wired; out.owned=c.owned; Input.stick={active:true,ox:90,oy:300,dx:0,dy:-1}; await w(900); out.spdAfter=Math.round(c.spd); Input.stick={active:false};
// smash path on a beater
exitCar(true); const d=new Car('compact',p.x+60,p.y+60,0); d.ai={mode:'parked'}; G.cars.push(d); d.locked=1; tryEnterCar(d); await w(150); [...document.querySelectorAll('button')].find(b=>/Smash/.test(b.textContent)).click(); await w(300); out.smash={inCar:pCar()===d, stage:G.bi&&G.bi.stage, heat:+G.heat.toFixed(2)}; G.bi&&wireTap(); await w(400); return out;})()
