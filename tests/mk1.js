(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); G.cash=60000; const M=VMK(); marketTick(1);
// sell side: put two cars in the garage and list one at fair, one way over
const L=myCars(); L.length=0; L.push({type:'luxsedan',mods:{p:'#111111'},legit:1,cond:.9}); L.push({type:'sports',mods:{},legit:0,cond:.7}); L.push({type:'pickup4',mods:{},legit:1});
L.forEach(recId); const v0=recValue(L[0]), v1=recValue(L[1]);
M.list.push({id:'lA',gid:L[0].id,ask:r50(v0),v:v0,t:M.clock,nextT:M.clock+waitFor(1),views:0}); M.list.push({id:'lB',gid:L[2].id,ask:r50(recValue(L[2])*1.6),v:recValue(L[2]),t:M.clock,nextT:M.clock+waitFor(1.6),views:0});
for(let i=0;i<600;i++) marketTick(1); // 10 minutes
const offers=M.msgs.filter(m=>m.side==='sell'); const byA=offers.filter(m=>m.lid==='lA').length, byB=offers.filter(m=>m.lid==='lB').length;
// lowball stats
let stats={deal:0,mad:0,no:0}; for(let k=0;k<300;k++){const l=genListing(M); l.scam=0; offerSeller(l, r50(l.ask*.45)); const m=M.msgs[0]; m.pend.f(m); stats[m.kind==='deal'?'deal':m.kind==='mad'?'mad':'no']++;}
let fair={deal:0,mad:0,no:0}; for(let k=0;k<300;k++){const l=genListing(M); offerSeller(l, r50(l.ask*.9)); const m=M.msgs[0]; m.pend.f(m); fair[m.kind==='deal'?'deal':m.kind==='mad'?'mad':'no']++;}
M.msgs=M.msgs.filter(m=>m.side==='sell'); M.blocked=[];
// accept an offer for A
const oa=M.msgs.find(m=>m.lid==='lA'&&m.kind==='offer'&&!m.done); const cash0=G.cash; if(oa) sellTo(oa);
return {v0,v1,range:valRange(v0,L[0].id),byA,byB,stats,fair,sold:G.cash-cash0, garage:myCars().map(r=>r.type), list:M.list.length, sample:offers.slice(0,3).map(m=>m.text)};})()
