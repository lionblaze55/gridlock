import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=1, has_touch=True, is_mobile=True)
        await ctx.add_init_script(path='/home/claude/gridlock/tools/mock_room.js')
        errs=[]
        A = await ctx.new_page(); B = await ctx.new_page()
        for pg,n in ((A,'A'),(B,'B')):
            pg.on('console', lambda m,n=n: errs.append(n+' '+m.type+': '+m.text) if m.type=='error' else None)
            pg.on('pageerror', lambda e,n=n: errs.append(n+' PAGEERR: '+str(e)))
            await pg.goto('file:///home/claude/gridlock/gridlock.html')
        await A.wait_for_timeout(1500)
        await A.click('text=Multiplayer'); await A.wait_for_timeout(500)
        await A.click('text=Create a new game'); await A.wait_for_timeout(1000)
        code = await A.evaluate('Net.code'); print('code', code)
        await B.click('text=Multiplayer'); await B.wait_for_timeout(800)
        await B.screenshot(path='/tmp/mp_lobby.png')
        await B.click('.games button:has-text("Join")'); await B.wait_for_timeout(5000)
        print('B code', await B.evaluate('Net.code'))
        # put B in front of A
        await A.evaluate("()=>{G.player.x=8300;G.player.y=4224;G.player.a=0; giveWeapon('pistol',50); G.player.weapon=WI.pistol}")
        await B.evaluate("()=>{G.player.x=8420;G.player.y=4224; G.godT=0}")
        await A.wait_for_timeout(1500)
        print('A sees', await A.evaluate("()=>Net.visible().map(([e,r])=>[e.name,r.x|0,r.y|0])"))
        hp0 = await B.evaluate("G.player.hp")
        for i in range(4):
            await A.evaluate("()=>{G.player.fireCD=0; playerFire(0)}"); await A.wait_for_timeout(350)
        await B.wait_for_timeout(800)
        print('B hp', hp0, '->', await B.evaluate("G.player.hp"))
        await A.evaluate("()=>{Net.emitEv('c',{t:'hello there'})}"); await B.wait_for_timeout(800)
        print('B feed', await B.evaluate("Net.feed.map(f=>f.text)"))
        await A.screenshot(path='/tmp/mp_A.png'); await B.screenshot(path='/tmp/mp_B.png')
        # kill B
        await B.evaluate("()=>{G.player.hp=5}")
        for i in range(3):
            await A.evaluate("()=>{G.player.fireCD=0; playerFire(0)}"); await A.wait_for_timeout(300)
        await A.wait_for_timeout(1200)
        print('B dead', await B.evaluate("G.player.dead"), 'A kills', await A.evaluate("G.kills"), await A.evaluate("Net.feed.map(f=>f.text)"))
        await A.evaluate("()=>{const c=new Car(\x27sports\x27,8300,4160,0); G.cars.push(c); G.player.dead=0; G.player.hp=100; enterCar(c); applyMods(c,{p:\x27\x23ff6f3c\x27,liv:3,neon:2,sp:3})}"); await A.wait_for_timeout(1200)
        print("B sees mods", await B.evaluate("()=>Net.remoteCars().map(r=>JSON.stringify(r.mods))"), "rejects A", await A.evaluate("window.__roomRejects"), "B", await B.evaluate("window.__roomRejects"))
        await B.evaluate("()=>{G.tod=22; G.cam.x=8300;G.cam.y=4160}"); await B.screenshot(path="/tmp/mp_mods.png")
        print('presence size', await A.evaluate("JSON.stringify({s:{n:'x'},ev:Net.ring}).length"))
        print('\n'.join(errs[:20]))
        await b.close()
asyncio.run(main())
