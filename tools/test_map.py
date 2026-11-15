import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390})
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e.message)+' '+str(e.stack)[:300]))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1000)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1200); ev=pg.evaluate
        await ev("()=>{G.fullMap=true}"); await pg.wait_for_timeout(300)
        await pg.mouse.move(400,200); await pg.mouse.wheel(0,-600); await pg.wait_for_timeout(200)
        z1=await ev("MAPV.z"); c1=await ev("[MAPV.cx,MAPV.cy]")
        await pg.mouse.move(400,200); await pg.mouse.down(); await pg.mouse.move(300,150,steps=5); await pg.mouse.up(); await pg.wait_for_timeout(100)
        c2=await ev("[MAPV.cx,MAPV.cy]"); print('zoom',z1,'pan',c1,c2, 'still open', await ev("G.fullMap"))
        await pg.mouse.click(420,210); await pg.wait_for_timeout(200); print('sel', await ev("MAPV.sel&&MAPV.sel.name")); await pg.screenshot(path='/tmp/map1.png')
        bt=await ev("MAPV.btns.find(b=>b.id==='route').r"); await pg.mouse.click(bt[0]+20,bt[1]+10); await pg.wait_for_timeout(300)
        print('nav', await ev("G.nav&&[G.nav.name,G.nav.path.length]"), 'open', await ev("G.fullMap"))
        await ev("()=>{const p=G.player; const c=new Car('sportbike',p.x+40,p.y,0); G.cars.push(c); enterCar(c); G.msgs=[]}"); await pg.wait_for_timeout(900); await pg.screenshot(path='/tmp/map2.png')
        await pg.keyboard.press('m'); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/map3.png'); 
        bt=await ev("MAPV.btns.find(b=>b.id==='close').r"); await pg.mouse.click(bt[0]+20,bt[1]+10); await pg.wait_for_timeout(200); print('closed', await ev("!G.fullMap"))
        print(errs[:5]); await b.close()
asyncio.run(main())
