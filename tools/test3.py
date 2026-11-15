import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/t3_spawn.png')
        for st in (2,3,4):
            await pg.evaluate(f"()=>{{if(G.player.dead) respawn(); G.player.hp=100; G.player.armor=0; giveWeapon('pistol'); G.heat={st}.2; G.lastSeen=G.t; G.t0=G.t}}")
            t=0
            while t<30:
                await pg.wait_for_timeout(1000); t+=1
                d = await pg.evaluate("()=>[G.player.dead, G.player.hp|0, G.peds.filter(p=>p.role==='cop'&&p.state==='chase').length, G.cars.filter(c=>c.ai&&c.ai.mode==='chase').length]")
                if d[0]: break
            print('stars',st,'survived',t,'s', d)
            await pg.wait_for_timeout(4500)
        await pg.evaluate("()=>{if(G.player.dead) respawn(); G.heat=0; const b=W.buildings.find(b=>b.type==='gunshop'); G.player.x=b.door.x; G.player.y=b.door.y; enterBuilding(b); G.snapCam=1; G.fade=0}")
        await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/t3_int.png')
        print(errs)
        await b.close()
asyncio.run(main())
