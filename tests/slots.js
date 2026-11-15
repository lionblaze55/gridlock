(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=99999; const L=myCars(); L.length=0;
const t0=Object.keys(CAR_TYPES).find(k=>stockEng(k)==='eng_v8')||'muscle';
L.push({type:t0,mods:{eng:2,trn:1,tur:1,rim:2,tyr:2},legit:1,cond:.8,id:'gS'});
const g=homeGarages()[0]; Panel.open('hgarage',{g}); Panel.wsel='gS'; Panel.render(); await w(150); const t=gTarget('gS',g); const r=L[0];
const rows=()=>[...document.querySelectorAll('#panel .pcol')[1].querySelectorAll('.prow')].map(x=>x.querySelector('b').textContent+' | '+(x.querySelector('small')||{}).textContent);
out.type=t0; out.eng=stockEng(t0); out.rows=rows();
// pull aftermarket transmission -> trn part to shelf, gearbox slot empty
pullSlot(t,'gearbox'); out.afterPullTrn={trn:r.mods.trn, miss:r.missing.gearbox, shelf:PARTS()['trn:1']|0, stashGB:G.stash.items.gearbox|0};
// fill with stock gearbox
G.stash.items.gearbox=(G.stash.items.gearbox|0)+1; fitPlain(t,'gearbox'); out.afterStock={trn:r.mods.trn, miss:r.missing.gearbox|0};
// swap in the race gearbox over the stock one
partAdd('trn',2); fitVarPart(t,'gearbox','trn',2); out.afterRace={trn:r.mods.trn, miss:r.missing.gearbox|0, stashGB:G.stash.items.gearbox|0};
// engine swap to turbo-four: the turbo must come off
G.stash.items.eng_i4t=1; fitEngine(t,'eng_i4t'); out.afterI4t={tur:r.mods.tur, eng:r.mods.eng, turShelf:PARTS()['tur:1']|0};
// pull engine: tune comes off with it
pullEngine(t); out.afterPullEng={eng:r.mods.eng, noEng:r.noEng, tuneShelf:PARTS()['eng:2']|0};
// strip interior
partAdd('wgt',1); fitWgt(t,1); out.strip={wgt:r.mods.wgt, seatsStash:G.stash.items.seats|0, missSeats:r.missing.seats|0};
pullWgt(t); out.unstrip={wgt:r.mods.wgt, missSeats:r.missing.seats|0};
// pull all wheels -> rims & tyres come off with the last one
for(let i=0;i<8;i++) if(((reqOf(t.type).wheelset)-(r.missing.wheelset|0))>0) pullSlot(t,'wheelset'); out.wheels={rim:r.mods.rim, tyr:r.mods.tyr, rimShelf:PARTS()['rim:2']|0};
Panel.render(); await w(100); out.rows2=rows();
// mod shop options for turbo on a turbo-four car
out.turOpts=modOpts('tur',{d:CAR_TYPES[t0],type:t0,mods:{swp:ENGS.findIndex(e=>e.id==='eng_i4t')}}).length;
return out;})()
