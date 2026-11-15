(async()=>{const g=homeGarages().find(g=>capIn(g)===10); enterGarage(g); await new Promise(r=>setTimeout(r,500)); return [G.scene.w,G.scene.h,G.scene.items.filter(i=>i.t==='gbay').length];})()
