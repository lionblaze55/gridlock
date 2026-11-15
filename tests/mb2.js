(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const M=VMK();
const blk=[...document.querySelectorAll('#panel button')].find(b=>b.textContent==='Block'); blk.click(); await w(150); out.afterBlock=M.msgs.filter(m=>m.lid==='lT').length; out.bwho=M.bwho;
const m=M.msgs.find(m=>m.lid==='lT'&&m.kind==='offer'); sellTo(m); await w(100); out.left=M.msgs.filter(m=>m.lid==='lT').map(m=>m.kind); out.otherKept=!!M.msgs.find(m=>m.id==='xO'); return out;})()
