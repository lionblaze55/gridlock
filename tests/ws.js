(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const out={}; G.cash=20000; const g=homeGarages()[0]; const c=new Car('sports',g.x,g.y,0); applyMods(c,{tur:1,rim:2}); c.owned=1; c.persist=1; c.ai={mode:'parked'}; G.cars.push(c); G.player.x=g.x+40; G.player.y=g.y;
partAdd('eng',2); partAdd('sp',3); partAdd('mfr',2); Panel.open('hgarage',{g, tab:'work'}); await w(200);
pullPart(c,'tur'); out.afterPull={tur:c.mods.tur, shelf:PARTS()}; fitPart(c,'eng',2); fitPart(c,'sp',3); out.mods=c.mods; out.shelf=PARTS(); Panel.render(); await w(300); return out;})()
