(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const M=VMK(); G.cash=90000; const out={};
const arch={}; for(let i=0;i<400;i++){ const l=genListing(M); arch[l.arch]=(arch[l.arch]||0)+1; } out.arch=arch;
// repeat lowball
const l=genListing(M); l.arch='fair'; l.scam=0; l.temper=.3; l.persona='hustler'; M.feed.push(l); const lines=[];
for(const f of [.5,.5,.45]){ if(M.blocked.includes(l.id)) break; offerSeller(l, r50(l.ask*f)); const m=M.msgs[0]; m.pend.f(m); m.pend=null; lines.push(m.kind+': '+m.text); }
out.repeat=lines;
// ghost scam
const g=genListing(M); g.scam=1; g.ghost=1; M.feed.push(g); const c0=G.cash, n=G.cars.length; buyListing(g,g.ask); await w(6500); out.ghost={paid:c0-G.cash, cars:G.cars.length-n, big:G.big&&G.big.text};
// scam buyer
const L=myCars(); L.length=0; L.push({type:'sedan',mods:{},legit:1}); recId(L[0]); const v=recValue(L[0]); M.list.push({id:'lQ',gid:L[0].id,ask:r50(v),v,t:M.clock,nextT:1e9,views:0});
const sm={id:'x9',side:'sell',lid:'lQ',gid:L[0].id,who:'Scam Guy',offer:r50(v*1.3),kind:'offer',scamBuyer:1,flav:1,t:M.clock,text:'...'}; M.msgs.unshift(sm); const c1=G.cash; sellTo(sm); const after=G.cash-c1; M.bounce&&(M.bounce.at=M.clock); marketTick(1); out.scamBuyer={got:after, net:G.cash-c1, bounced:!!(G.big&&/BOUNCED/.test(G.big.text))};
Panel.open('phone',{tab:'market'}); Panel.msub='browse'; Panel.sel=null; Panel.render(); await w(300); return out;})()
