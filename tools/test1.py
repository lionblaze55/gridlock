import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        errs=[]
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html')
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/tmp/s_menu.png')
        await pg.click('text=Play Solo')
        await pg.wait_for_timeout(3000)
        await pg.screenshot(path='/tmp/s_play.png')
        # info
        info = await pg.evaluate("()=>({cars:G.cars.length,peds:G.peds.length,px:G.player.x,py:G.player.y,blds:W.buildings.length,types:W.buildings.reduce((m,b)=>{m[b.type]=(m[b.type]||0)+1;return m},{}),phones:W.phones.length,sprays:W.sprays.length})")
        print(info)
        print('\n'.join(errs[:30]))
        await b.close()
asyncio.run(main())
