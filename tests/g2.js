(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; const g=homeGarages()[0]; const L=myCars(); L.length=0; L.push({type:'muscle',mods:{p:'#c00',rim:2},legit:1}); L.forEach(recId);
const v0=recValue(L[0]); const t=gTarget(L[0].id,g); pullMech(t,'gearbox'); pullMech(t,'wheelset'); pullMech(t,'wheelset'); tPullEng(t); out.v={full:v0, half:recValue(L[0]), comp:+completeness('muscle',L[0].missing,L[0].noEng).toFixed(2)}; out.stash={gb:G.stash.items.gearbox, ws:G.stash.items.wheelset};
Panel.open('hgarage',{g}); Panel.wsel=L[0].id; Panel.render(); await w(300);
// project listings
const M=VMK(); let n=0, ex=null; for(let i=0;i<300;i++){ const l=genListing(M); if(Object.keys(l.missing).length||l.noEng){ n++; ex=ex||{type:l.type, ask:l.ask, miss:missText(l.type,l.missing,l.noEng), full:mktValue(l.type,l.mods,l.claim,1)}; } } out.proj={per300:n, ex};
const G0=G.cash; scrapRec(0); out.scrap=G.cash-G0; return out;})()
