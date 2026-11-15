(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const M=VMK();
myCars().push({type:'sports',mods:{},legit:1,cond:.9,id:'gT'}); const l={id:'lT',gid:'gT',ask:30000,v:30000,t:M.clock,nextT:1e9,views:0}; M.list.push(l);
const long='Hey man, I saw your listing and I have been looking for exactly this car for months. I can pick it up tonight with cash in hand, my cousin will drive me over, is the title clean and does it have any rust underneath? Let me know asap!!';
for(let i=0;i<4;i++) M.msgs.unshift({unread:1,id:'xT'+i,side:'sell',ctype:'sports',lid:'lT',gid:'gT',who:'Buyer '+i,bv:1,offer:25000+i*500,t:M.clock,exp:M.clock+300,kind:'offer',text:long});
M.msgs.unshift({unread:1,id:'xO',side:'sell',ctype:'sports',lid:'other',gid:'gX',who:'Other Guy',offer:100,t:M.clock,exp:M.clock+300,kind:'offer',text:'unrelated'});
Panel.open('phone',{tab:'market'}); Panel.msub='msgs'; Panel.render(); await w(200);
const row=document.querySelector('#panel .prow.pmsg'); out.rowH=row&&row.getBoundingClientRect().height; const sm=row.querySelector('small'); out.smallFull=sm.scrollWidth<=sm.clientWidth+1;
return out;})()
