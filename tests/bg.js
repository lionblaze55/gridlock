(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); Snd.init(); await w(300); const o={before:Snd.ctx&&Snd.ctx.state};
Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange')); await w(300); o.hidden=Snd.ctx.state; o.paused=!!G.menuOpen;
Object.defineProperty(document,'hidden',{configurable:true,get:()=>false}); document.dispatchEvent(new Event('visibilitychange')); await w(300); o.back=Snd.ctx.state; return o;})()
