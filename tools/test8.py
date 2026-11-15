import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e.message)+' '+str(e.stack)[:300]))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1200)
        ev=pg.evaluate
        await ev("()=>{G.fullMap=true}"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/q_map.png'); await ev("()=>{G.fullMap=false}")
        await ev("()=>{G.player.x=roadCX(1); G.player.y=roadCY(2)+300; G.snapCam=1; G.tod=13}"); await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/q_dirt.png')
        # fishing
        await ev("()=>{const f=W.props.find(p=>p.t==='fishspot'); G.player.x=f.x-10; G.player.y=f.y; G.snapCam=1; invAdd('rod',1); G.spawnT=0}"); await pg.wait_for_timeout(1200)
        print('interact', await ev("()=>{const o=findInteract(); return o&&o.label}"))
        await ev("()=>{const o=findInteract(); doInteract(o)}"); await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/q_fish.png')
        await pg.wait_for_timeout(6000); print('inv', await ev("()=>JSON.stringify(G.inv)"))
        print('spots', await ev("()=>G.peds.filter(q=>RSPOT[q.role]).map(q=>q.role)"))
        # ranch night with campfire / cows
        await ev("()=>{const k=W.blocks.find(b=>b.d==='ranch'); G.player.x=(k.bx+6)*T; G.player.y=(k.by+6)*T; G.snapCam=1; G.tod=21}"); await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/q_ranch.png')
        await ev("()=>{const c=W.props.find(p=>p.t==='campfire'); G.player.x=c.x+30; G.player.y=c.y+20; G.snapCam=1}"); await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/q_fire.png')
        # save/load roundtrip
        await ev("()=>{doSave(true)}"); await pg.reload(); await pg.wait_for_timeout(1200); await pg.click('text=Continue'); await pg.wait_for_timeout(800)
        print('reload inv', await ev("()=>[JSON.stringify(G.inv), G.player.clip.length]"))
        print(errs[:6])
        await b.close()
asyncio.run(main())
