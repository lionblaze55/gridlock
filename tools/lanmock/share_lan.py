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
            pg.on('pageerror', lambda e: errs.append(n + ' ' + str(e)[:300])); pg.on('console', lambda m: errs.append(n + ' ' + m.text[:300]) if m.type == 'error' and 'fonts' not in m.text else None)
            await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(2000); return pg
        A = await mk('A'); B = await mk('B'); C = await mk('C')
        for pg, n in ((A,'Hosty'),(B,'Guesty'),(C,'Third')): await pg.evaluate("n=>{ store.set('gl_save_1',{cash:5000,bank:0,t:1}); G.slot=1; Net.name=n; }", n)
        await A.evaluate("()=>showMenu(mpMenu)"); await A.wait_for_timeout(300); await A.click('text=Host a LAN game'); await A.wait_for_timeout(3000)
        for pg in (B, C):
            await pg.evaluate("()=>showMenu(mpMenu)"); await pg.wait_for_timeout(3500); await pg.click('.games button:has-text("Join")')
            for i in range(40):
                await pg.wait_for_timeout(500)
                if await pg.evaluate("G.inGame && G.mode==='play'"): break
        for pg in (A,B,C): await pg.evaluate("()=>{G.godT=1e9; G.heat=0}")
        await A.evaluate("()=>{G.player.x=8300;G.player.y=4224}"); await B.evaluate("()=>{G.player.x=8420;G.player.y=4224}"); await C.evaluate("()=>{G.player.x=8300+4000;G.player.y=4224}")
        await A.wait_for_timeout(9000)
        R = "()=>({auth:SH.auth, n:SH.nShare, pupP:G.peds.filter(p=>p.pup).length, pupC:G.cars.filter(c=>c.pup).length, ownP:G.peds.filter(p=>!p.pup&&!p.persist&&!p.dead).length, ownC:G.cars.filter(c=>!c.pup).length, t:G.t|0})"
        for pg,n in ((A,'A'),(B,'B'),(C,'C')): print(n, await pg.evaluate(R))
        # same pedestrians on A, B: pick B puppets from A and check C sees nothing of B-area (far)
        bp = await B.evaluate("()=>[...SH.pup.values()].filter(e=>e instanceof Ped).slice(0,40).map(e=>[e.pup.i,e.x|0,e.y|0,e.shirt,e.name])")
        tr = await A.evaluate("ids=>ids.map(i=>{const e=SH.byId.get(i); return e?[e.x|0,e.y|0,e.shirt,e.name]:null})", [x[0] for x in bp])
        ok = sum(1 for q,t in zip(bp,tr) if t and q[3]==t[2] and q[4]==t[3]); err=[((q[1]-t[0])**2+(q[2]-t[1])**2)**.5 for q,t in zip(bp,tr) if t]
        print('B ped puppets', len(bp), 'same look+name as A', ok, 'mean pos err', round(sum(err)/max(1,len(err)),1))
        # A-owned crowd near C (far from A)
        print('A owns near C', await A.evaluate("()=>{const e=[...Net.peers.values()].find(e=>e.name==='Third'); return [G.peds.filter(p=>!p.pup&&dist2(p.x,p.y,e.s.x,e.s.y)<1100*1100).length, G.cars.filter(c=>!c.pup&&dist2(c.x,c.y,e.s.x,e.s.y)<1300*1300).length]}"))
        # A leaves: B and C take over the street they're standing in
        pre = [await pg.evaluate("[G.peds.filter(p=>p.pup).length, G.peds.filter(p=>!p.pup).length]") for pg in (B,C)]
        await A.evaluate("()=>Net.leave()"); await A.wait_for_timeout(3000)
        post = [await pg.evaluate("[G.peds.filter(p=>p.pup).length, G.peds.filter(p=>!p.pup).length, SH.auth]") for pg in (B,C)]
        print('A left: B,C (puppets, own peds) before', pre, 'after', post)
        print('A after leaving keeps its city', await A.evaluate("[G.peds.filter(p=>p.pup).length, G.peds.length, G.cars.length, SH.live()]"))
        await B.wait_for_timeout(4000)
        print('B,C after', [await pg.evaluate(R) for pg in (B,C)])
        print('errors', errs[:10]); await b.close()
    finally: helper.kill()
asyncio.run(main())
