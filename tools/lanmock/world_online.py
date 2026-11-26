import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        await ctx.add_init_script(path='/home/claude/gridlock/tools/mock_room.js')
        errs=[]; A = await ctx.new_page(); B = await ctx.new_page()
        for pg,n in ((A,'A'),(B,'B')):
            pg.on('pageerror', lambda e,n=n: errs.append(n+' '+str(e)[:200]))
            await pg.goto('file:///home/claude/gridlock/gridlock.html')
        await A.wait_for_timeout(1500)
        await A.click('text=Multiplayer'); await A.wait_for_timeout(500); await A.click('text=Create a new game'); await A.wait_for_timeout(1500)
        code = await A.evaluate('Net.code'); print('code', code, await A.evaluate("[Net.worldHost, !!G.save.wid]"))
        # A already holds a big profile for B's pid
        pid = await B.evaluate('Net.pid')
        await A.evaluate("pid=>{ G.save.guests[pid]={n:'Guesty', t:Date.now(), sv:{cash:31337, bank:5, big:'x'.repeat(30000)}}; }", pid)
        await B.click('text=Multiplayer'); await B.wait_for_timeout(800)
        await B.evaluate("c=>doJoin(c)", code)
        t=0
        while t < 40 and not await B.evaluate("G.inGame && G.mode==='play'"): await B.wait_for_timeout(500); t+=1
        print('B in after %.1fs' % (t/2), await B.evaluate("[G.cash, G.bank, (G.save.big||'').length, G.guest && G.guest.hn]"))
        print('rejects', await A.evaluate("window.__roomRejects"), await B.evaluate("window.__roomRejects"))
        await B.evaluate("()=>{ G.cash=55555; doSave(true); }")
        t=0
        while t<60 and await A.evaluate("p=>G.save.guests[p].sv.cash", pid) != 55555: await A.wait_for_timeout(500); t+=1
        print('upload back after %.1fs' % (t/2), await A.evaluate("p=>G.save.guests[p].sv.cash", pid))
        print('both still see each other', await A.evaluate("Net.peers.size"), await B.evaluate("Net.peers.size"), 'errors', errs[:5])
        await b.close()
asyncio.run(main())
