(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player; let out={}; G.peds=[]; G.cars=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600;
const thug=new Ped(p.x+20,p.y,{}); G.peds.push(thug); const cop=new Ped(p.x+250,p.y+40,{role:'cop'}); cop.state='walk'; G.peds.push(cop); thug.state='fight'; thug.target=p; thug.timer=20; const hp0=p.hp; await w(1500);
out={hpLoss:hp0-p.hp, crime:thug.npcCrime, crimeT:thug.npcCrimeT, t:G.t, prov:thug.provokedT, los:losClear(cop.x,cop.y,thug.x,thug.y), d:Math.round(dist(cop.x,cop.y,thug.x,thug.y)), nlT:G.nlT, copRole:cop.role}; return out;})()
