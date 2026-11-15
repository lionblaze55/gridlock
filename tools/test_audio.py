import asyncio
from playwright.async_api import async_playwright
JS_RMS = """()=>new Promise(r=>{const c=Snd.ctx; if(!c) return r('noctx'); if(!window.AN){window.AN=c.createAnalyser(); AN.fftSize=2048; Snd.master.connect(AN);} const b=new Float32Array(2048); let s=0,n=0; const iv=setInterval(()=>{AN.getFloatTimeDomainData(b); let q=0; for(const v of b) q+=v*v; s+=Math.sqrt(q/b.length); n++; if(n>=20){clearInterval(iv); r([c.state, +(s/n).toFixed(4), Music.key])}},50)})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(800)
        await pg.mouse.click(5,5)
        await pg.wait_for_timeout(1500)
        print('menu', await pg.evaluate(JS_RMS))
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        print('street', await pg.evaluate(JS_RMS))
        await pg.evaluate("()=>{const c=G.cars.filter(c=>!c.dead).sort((a,b)=>dist2(a.x,a.y,G.player.x,G.player.y)-dist2(b.x,b.y,G.player.x,G.player.y))[0]; enterCar(c); Input.stick={active:true,ox:90,oy:300,dx:0,dy:1}}")
        await pg.wait_for_timeout(1500)
        print('driving+radio', await pg.evaluate(JS_RMS))
        await pg.evaluate("()=>{exitCar(true); Input.stick={active:false}; const b=W.buildings.find(b=>b.type==='club'); enterBuilding(b)}"); await pg.wait_for_timeout(1500)
        print('club', await pg.evaluate(JS_RMS))
        await pg.evaluate("()=>{const b=W.buildings.find(b=>b.type==='bar'); exitBuilding(); enterBuilding(b)}"); await pg.wait_for_timeout(1500)
        print('bar', await pg.evaluate(JS_RMS))
        await pg.evaluate("()=>{exitBuilding(); G.heat=3.5; G.lastSeen=G.t}"); await pg.wait_for_timeout(1500)
        print('chase', await pg.evaluate(JS_RMS))
        print(errs[:5])
        await b.close()
asyncio.run(main())
