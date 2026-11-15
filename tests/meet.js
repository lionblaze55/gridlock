(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const p=G.player, M=VMK(); G.cash=100000;
const click=async t=>{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&b.textContent.includes(t)); if(!b) return 'NOBTN:'+t+' have:'+[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent).join('/'); b.click(); await w(120); return 'ok'; };
const L=myCars(); L.length=0; L.push({type:'sports',mods:{},legit:1,cond:.9}); const rec=L[0]; recId(rec);
const l={id:'lX',gid:rec.id,ask:9000,v:9000,t:M.clock,nextT:1e9,views:0}; M.list.push(l);
const m={unread:1,id:'xM1',side:'sell',ctype:'sports',lid:'lX',gid:rec.id,who:'Dana Reyes',offer:8500,t:M.clock,exp:M.clock+300,kind:'offer',text:'8500?'}; M.msgs.unshift(m);
// 1 honest sale at home
sellTo(m); await w(150); out.dlg1=await click('At '); const mt=M.meets[M.meets.length-1]; out.meet1={place:mt.place,home:mt.home,scam:mt.scam}; mt.scam=0; mt.rob=0;
p.x=mt.x+30; p.y=mt.y; G.mtT=0; await w(700); out.spawned=!!mt.q; const c0=G.cash; talkTo(mt.q); await w(150); out.hand=await click('Hand over the keys'); out.cashGain=G.cash-c0; out.recLeft=L.length; out.msg=m.text;
// 2 scam sale in public with a live car
L.push({type:'muscle',mods:{},legit:1,cond:.8}); const rec2=L[L.length-1]; recId(rec2); M.list.push({id:'lY',gid:rec2.id,ask:7000,v:7000,t:M.clock,nextT:1e9}); const m2={id:'xM2',side:'sell',ctype:'muscle',lid:'lY',gid:rec2.id,who:'Shady Pete',offer:7000,t:M.clock,exp:M.clock+300,kind:'offer',text:'7000'}; M.msgs.unshift(m2);
sellTo(m2); await w(120); out.dlg2=await click('Public'); const mt2=M.meets[M.meets.length-1]; mt2.scam=1; mt2.rob=0; out.pub=mt2.place;
// take car out near spot
const g=homeGarages()[0]; takeOut(L.indexOf(rec2), g); const car=G.cars[G.cars.length-1]; out.gid=car.gid===rec2.id; car.x=mt2.x+60; car.y=mt2.y; p.x=mt2.x+30; p.y=mt2.y; G.mtT=0; await w(700);
talkTo(mt2.q); await w(150); out.go=await click('Sure, go ahead'); await w(400); out.stolen={state:mt2.state, driver:!!car.driver&&car.driver!==p, owned:car.owned}; await click('Chase');
// take it back by carjacking
p.x=car.x+30; p.y=car.y; enterCar(car); G.mtT=0; await w(700); out.back={state:mt2.state, inCar:pCar()===car}; if(pCar()) exitCar(true);
// 3 buy honest car
const lb=M.feed.find(x=>!x.ghost&&x.kind!=='part'); buyListing(lb, lb.ask); await w(120); await click('Public'); const mt3=M.meets[M.meets.length-1]; mt3.scam=0; mt3.rob=0; p.x=mt3.x+30; p.y=mt3.y; G.mtT=0; await w(700); out.sellerCar=!!mt3.car; talkTo(mt3.q); await w(150); const cb=G.cash; out.pay=await click('Pay '); out.boughtOwned=mt3.car&&mt3.car.owned; out.paid=cb-G.cash;
// 4 ghost: pay and they run; then take it back
const lg=M.feed.find(x=>x.kind!=='part'&&x!==lb); buyListing(lg, lg.ask); await w(120); await click('Public'); const mt4=M.meets[M.meets.length-1]; mt4.scam=1; mt4.rob=0; p.x=mt4.x+30; p.y=mt4.y; G.mtT=0; await w(700); talkTo(mt4.q); await w(150); out.ghostPay=await click('Pay '); await w(400); const q4=mt4.q; out.run={state:mt4.state, qstate:q4.state, loot:q4.loot}; await click('📞 Call the cops'); mt4.copsT=G.t; G.mtT=0; await w(700); out.cops=G.peds.filter(c=>c.npcT===q4).length;
q4.hp=10; G.mtT=0; await w(600); out.recovered={state:mt4.state, drop:G.drops.filter(d=>d.t==='cash'&&d.v>=lg.ask).length};
return out;})()
