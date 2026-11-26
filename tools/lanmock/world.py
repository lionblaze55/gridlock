import asyncio, subprocess, time, json
from playwright.async_api import async_playwright
async def main():
    helper = subprocess.Popen(['node', '/tmp/lanmock/helper.js']); time.sleep(.8)
    try:
      async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-web-security'])
        errs = []
        async def mk(n):
            ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
            await ctx.add_init_script(path='/tmp/lanmock/bridge.js'); pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(n + ' ' + str(e)[:200])); pg.on('console', lambda m: errs.append(n + ' ' + m.text[:200]) if m.type == 'error' and 'fonts' not in m.text else None)
            await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(2000); return pg
        A = await mk('A'); B = await mk('B')
        await A.evaluate("()=>{ store.set('gl_save_1',{cash:12345,bank:0,t:1}); G.slot=1; Net.name='Hosty'; }")
        await B.evaluate("()=>{ store.set('gl_save_1',{cash:777,bank:0,t:1}); G.slot=1; Net.name='Guesty'; }")
        async def host():
            await A.evaluate("()=>showMenu(mpMenu)"); await A.wait_for_timeout(300); await A.click('text=Host a LAN game'); await A.wait_for_timeout(3000)
        async def join():
            await B.evaluate("()=>showMenu(mpMenu)"); await B.wait_for_timeout(3500); await B.click('.games button:has-text("Join")')
            for i in range(40):
                await B.wait_for_timeout(500)
                if await B.evaluate("G.inGame && G.mode==='play'"): break
        await host(); print('A hosting', await A.evaluate("[G.inGame, G.cash, !!G.save.wid, Net.worldHost||Net.lanHost]"))
        await join(); print('B joined', await B.evaluate("[G.inGame, G.cash, G.slot, G.guest && G.guest.hn]"), (await B.evaluate("Net.feed.length")), await B.evaluate("document.querySelector('#msgs')?.innerText||''"))
        # B makes progress
        await B.evaluate("()=>{ G.cash=4242; SKS().drv.l=7; skSync(); doSave(true); }"); await B.wait_for_timeout(6000)
        print('A has guest', await A.evaluate("Object.values(G.save.guests||{}).map(g=>[g.n, g.sv.cash, g.sv.sk&&g.sv.sk.drv.l])"), 'A stored', await A.evaluate("Object.values((loadSlot(1)||{}).guests||{}).map(g=>g.sv.cash)"))
        # B quits to title
        await B.evaluate("()=>{ doSave(true); Net.leave(); G.inGame=false; G.mode='menu'; G.mission=null; showMenu(mainMenu); }"); await B.wait_for_timeout(2500)
        print('B own slot after', await B.evaluate("[G.slot, loadSlot(1).cash, !!G.guest]"))
        # B rejoins with local world cache deleted -> must come from host
        await B.evaluate("()=>{ for (const k of Object.keys(localStorage)) if (k.startsWith('gl_save_w_')) localStorage.removeItem(k); }")
        await join(); print('B rejoin', await B.evaluate("[G.cash, SKS().drv.l, G.slot]"))
        await B.evaluate("()=>{ G.cash=9000; doSave(true); }"); await B.wait_for_timeout(5000)
        await B.evaluate("()=>{ doSave(true); Net.leave(); G.inGame=false; G.mode='menu'; showMenu(mainMenu); }"); await B.wait_for_timeout(2500)
        # host quits, page reloads, hosts again from slot 1
        await A.evaluate("()=>{ doSave(true); Net.leave(); G.inGame=false; G.mode='menu'; showMenu(mainMenu); }"); await A.wait_for_timeout(1500)
        await A.reload(); await A.wait_for_timeout(2500); await A.evaluate("()=>{ G.slot=1; }")
        print('A slot1 after restart', await A.evaluate("[(loadSlot(1)||{}).cash, Object.values((loadSlot(1)||{}).guests||{}).map(g=>[g.n,g.sv.cash])]"))
        await host(); await B.evaluate("()=>{ for (const k of Object.keys(localStorage)) if (k.startsWith('gl_save_w_')) localStorage.removeItem(k); }")
        await join(); print('B after host restart', await B.evaluate("[G.cash, SKS().drv.l]"))
        await A.evaluate("()=>showMenu(mpMenu)"); await A.wait_for_timeout(300); await A.screenshot(path='/tmp/world_hostmenu.png')
        print('errors', errs[:8]); await b.close()
    finally: helper.kill()
asyncio.run(main())
