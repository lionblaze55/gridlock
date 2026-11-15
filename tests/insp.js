(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const p=G.player, M=VMK(); G.cash=900000;
const click=async t=>{ const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&b.textContent.includes(t)); if(!b) return 'NOBTN:'+t+' have:'+[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent).join('/'); b.click(); await w(150); return 'ok'; };
// SELL: list with turbo, then pull it
const L=myCars(); L.length=0; L.push({type:'sports',mods:{tur:1,eng:2},legit:1,cond:.9}); const rec=L[0]; recId(rec);
M.list.push({id:'lI',gid:rec.id,ask:40000,v:40000,t:M.clock,nextT:1e9}); marketTick(.6); await w(700); out.snap=!!M.list.find(l=>l.id==='lI').snap;
rec.mods.tur=0; rec.mods.eng=0;
const m={id:'xI',side:'sell',ctype:'sports',lid:'lI',gid:rec.id,who:'Ana Buyer',offer:40000,t:M.clock,exp:M.clock+300,kind:'offer',text:'ok'}; M.msgs.unshift(m);
sellTo(m); await w(150); await click('At '); const mt=M.meets[M.meets.length-1]; mt.scam=0; mt.rob=0; p.x=mt.x+30; p.y=mt.y; G.mtT=0; await w(700); talkTo(mt.q); await w(900);
out.sellDlg=document.querySelector('#dlg .txt').textContent.slice(0,230); out.sellBtns=[...document.querySelectorAll('#dlg button')].map(b=>b.textContent); out.state=mt.state; closeDialog();
// BUY: scam listing
const lb=M.feed.find(x=>!x.ghost&&x.kind!=='part'); lb.scam=1; lb.mods=Object.assign({},lb.mods,{tur:1,brk:2}); lb.claim=.9; lb.real=.5; buyListing(lb, lb.ask); await w(150); out.pub=await click('Public'); const mt3=M.meets[M.meets.length-1]; mt3.scam=0; mt3.rob=0; p.x=mt3.x+30; p.y=mt3.y; G.mtT=0; await w(700); talkTo(mt3.q); await w(200); out.insp=await click('Inspect');
out.cols=[...document.querySelectorAll('#panel .ptitle')].map(x=>x.textContent); out.issues=[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow')].map(x=>x.textContent).slice(0,5); out.foot=[...document.querySelectorAll('#panel .pfoot button')].map(b=>b.textContent);
return out;})()
