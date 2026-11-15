(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, out={}; G.peds=[]; G.cars=[]; p.x=roadCX(8)+20; p.y=roadCY(5)+600; G.heat=0;
const thug=new Ped(p.x+20,p.y,{}); thug.name='Vince Thug'; G.peds.push(thug); const cop=new Ped(p.x,p.y-260,{role:"cop"}); cop.state='walk'; G.peds.push(cop);
thug.state='fight'; thug.target=p; thug.timer=20; await w(2500); out.copState=cop.state; out.copTarget=cop.target===thug; out.copWeapon=cop.weapon; out.thug=thug.state;
for(let i=0;i<30&&G.peds.includes(thug);i++) await w(300); out.thugGone=!G.peds.includes(thug); out.cuffed=!!thug.cuffed; out.msgs=G.msgs.map(m=>m.text||m.t).slice(-3); out.playerStars=stars();
// self-defence: you hit someone first, they hit back — no cops
const g2=new Ped(p.x+20,p.y+30,{}); G.peds.push(g2); g2.hurt(5,p,'punch'); g2.state='fight'; g2.target=p; g2.timer=10; await w(2000); out.selfDef=!!(g2.npcCrime);
return out;})()
