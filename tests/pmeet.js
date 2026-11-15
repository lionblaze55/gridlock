(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; const M=VMK(); partAdd('tur',1,1);
// list the part, then fake a buyer offer for it
const id='tur:1'; M.plist=M.plist||[]; const l={id:'pl_t1', pk:id, cond:1, ask:900, held:1, t:M.clock}; M.plist.push(l); unitTake&&unitTake(id,1);
const m={id:'xt9', side:'sell', kind:'offer', who:'Real Buyer', offer:850, lid:'pl_t1', held:1, pk:id, t:M.clock, text:'Can do 850', sb:0}; M.msgs.unshift(m);
openPhone('market'); Panel.msub='msgs'; Panel.render(); await w(150);
sellTo(m); await w(150); o.dlg1=[...document.querySelectorAll('#dlg.show .opts button')].map(b=>b.textContent);
[...document.querySelectorAll('#dlg.show .opts button')].find(b=>/Meet/.test(b.textContent)).click(); await w(200); o.dlg2open=document.getElementById('dlg').classList.contains('show'); o.dlg2=[...document.querySelectorAll('#dlg.show .opts button')].map(b=>b.textContent);
// pick the public spot (or home), then walk there and do the deal
const spotB=[...document.querySelectorAll('#dlg.show .opts button')].find(b=>/Public|At /.test(b.textContent)); spotB.click(); await w(300);
const mt=(VMK().meets||[]).find(x=>x.lid==='pl_t1'); o.meet=mt?mt.state+' @'+mt.place+' scam='+mt.scam:null; if(!mt) return o;
mt.scam=0; mt.rob=0; if(mt.state==='set'){ const p=G.player; if(G.scene) exitBuilding(); p.x=mt.x+40; p.y=mt.y; await w(1500); }
o.state=mt.state; const q=mt.q; o.ped=!!q; if(!q) return o; const cash0=G.cash; talkTo(q); await w(300); o.talk=[...document.querySelectorAll('#dlg.show .opts button')].map(b=>b.textContent);
[...document.querySelectorAll('#dlg.show .opts button')][0].click(); await w(300); o.paid=G.cash-cash0; o.after=mt.state; o.listing=!!(VMK().plist||[]).find(x=>x.id==='pl_t1'); o.msg=(VMK().msgs.find(x=>x.id==='xt9')||{}).kind;
return o;})()
