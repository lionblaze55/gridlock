import asyncio, subprocess, time
from playwright.async_api import async_playwright
async def main():
    helper = subprocess.Popen(['node', '/tmp/lanmock/helper.js']); time.sleep(.8)
    try:
      async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-web-security'])
        pages = []; errs = []
        for n in 'ABC':
            ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
            await ctx.add_init_script(path='/tmp/lanmock/bridge.js'); pg = await ctx.new_page()
            pg.on('pageerror', lambda e, n=n: errs.append(n + ' ' + str(e)[:200])); pg.on('console', lambda m, n=n: errs.append(n + ' ' + m.text[:200]) if m.type == 'error' else None)
            await pg.goto('file:///home/claude/gridlock/gridlock.html'); pages.append(pg)
        A, Bp, C = pages; await A.wait_for_timeout(2500)
        print('A menu', (await A.evaluate('document.body.innerText'))[:300]); print('errs so far', errs[:5])
        # B and C open the multiplayer menu first and wait
        for pg in (Bp, C): await pg.click('text=Multiplayer'); await pg.wait_for_timeout(300)
        print('B before host:', await Bp.evaluate("document.querySelector('.games') && [...document.querySelectorAll('.games')].map(e=>e.innerText).join(' / ')"))
        await A.click('text=Multiplayer'); await A.wait_for_timeout(300); await A.screenshot(path='/tmp/lan_menuA.png')
        await A.click('text=Host a LAN game'); await A.wait_for_timeout(3500)
        print('A:', await A.evaluate("[Net.code, Net.lan, Net.lanHost, G.mode, LH.on, LH.port]"))
        await Bp.wait_for_timeout(2500); await Bp.screenshot(path='/tmp/lan_nearbyB.png')
        print('B nearby:', await Bp.evaluate("[...LD.hosts.values()].map(h=>h.n+' '+h.addr+' c'+h.c)"))
        await Bp.click('.games button:has-text("Join")'); await Bp.wait_for_timeout(2500)
        await C.click('.games button:has-text("Join")'); await C.wait_for_timeout(2500)
        for pg, n in ((A,'A'),(Bp,'B'),(C,'C')): print(n, await pg.evaluate("[Net.code, Net.lan, G.mode, Net.peers.size]"))
        await A.evaluate("()=>{G.player.x=8300;G.player.y=4224;G.player.a=0; giveWeapon('pistol',50); G.player.weapon=WI.pistol}")
        await Bp.evaluate("()=>{G.player.x=8420;G.player.y=4224; G.godT=0}"); await C.evaluate("()=>{G.player.x=8300;G.player.y=4400}")
        await A.wait_for_timeout(1500)
        print('A sees', await A.evaluate("()=>Net.visible().map(([e,r])=>[e.name,r.x|0,r.y|0])"), 'C sees', await C.evaluate("()=>Net.visible().map(([e,r])=>e.name)"))
        hp0 = await Bp.evaluate("G.player.hp")
        for i in range(4): await A.evaluate("()=>{G.player.fireCD=0; G.player.reloadT=0; playerFire(0)}"); await A.wait_for_timeout(300)
        await Bp.wait_for_timeout(800); print('B hp', hp0, '->', await Bp.evaluate("G.player.hp"))
        await C.evaluate("()=>Net.emitEv('c',{t:'héllo ünïcode ✓'})"); await A.wait_for_timeout(1000)
        print('A feed', await A.evaluate("Net.feed.map(f=>f.text)"))
        print('beacon players', await C.evaluate("[...LD.hosts.values()].map(h=>h.c)"))
        # long message (> 125 and > 65535 path not needed) : big presence
        await C.evaluate("()=>{ for(let i=0;i<14;i++) Net.emitEv('c',{t:'x'.repeat(300)}); }"); await A.wait_for_timeout(1000)
        print('A feed after big', await A.evaluate("Net.feed.length"))
        # C leaves
        await C.close(); await A.wait_for_timeout(2500); print('after C left, A peers', await A.evaluate("Net.peers.size"), await A.evaluate("Net.feed.map(f=>f.text).slice(-2)"))
        # broadcast off: host stops, rehost with setting off, B should not see it
        await A.evaluate("()=>{ G.settings.lanBcast=0; }"); await A.evaluate("()=>Net.leave()"); await A.wait_for_timeout(800)
        await Bp.evaluate("()=>{ Net.leave(); G.inGame=false; G.mode='menu'; showMenu(mpMenu); }"); await Bp.wait_for_timeout(8000)
        print('B nearby after host left:', await Bp.evaluate("[...LD.hosts.values()].length"))
        await A.evaluate("()=>{ G.inGame=false; G.mode='menu'; showMenu(mpMenu); }"); await A.wait_for_timeout(300); await A.click('text=Host a LAN game'); await A.wait_for_timeout(5000)
        print('B nearby with broadcast off:', await Bp.evaluate("[...LD.hosts.values()].length"), ' A hosting', await A.evaluate("LH.on"))
        # but typing the address still works
        await Bp.screenshot(path='/tmp/lan_B_menu.png'); await Bp.evaluate("p=>doJoinLan('127.0.0.1:'+p)", await A.evaluate("LH.port")); await Bp.wait_for_timeout(2500)
        print('B joined by address:', await Bp.evaluate("[Net.lan, Net.peers.size]"))
        # plain browser hitting the host
        print('errors', errs[:10]); await b.close()
    finally: helper.kill()
asyncio.run(main())
