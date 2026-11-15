import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(m.text[:300]) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e.message)+' '+str(e.stack)[:300]))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1500)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        ev=pg.evaluate
        print(await ev("()=>({b:W.buildings.length, types:W.buildings.reduce((m,b)=>{m[b.type]=(m[b.type]||0)+1;return m},{}), sprays:W.sprays.map(z=>z.b.name), spots:W.ruralSpots.length, dealers:W.dealerSpots.length, phones:W.phones.length, px:G.player.x|0, d:districtAt(G.player.x,G.player.y)})"))
        await pg.screenshot(path='/tmp/r_spawn.png')
        names=['farmland','woods','lake','quarry','coast','orchard','ranch','town','trailer','junkyard']
        for d in names:
            await ev("(d)=>{const k=W.blocks.find(b=>b.d===d); G.player.x=(k.bx+6)*T; G.player.y=(k.by-1.5)*T; G.snapCam=1; G.settings.zoom=.8; G.tod=13; G.spawnT=0}", d)
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=f'/tmp/r_{d}.png')
        await ev("()=>{G.settings.zoom=1; G.cash=20000; giveWeapon('pistol'); giveWeapon('rifle'); giveWeapon('shotgun'); invAdd('watch',2); invAdd('medkit',1); invAdd('tv',1); invAdd('fish',3); invAdd('leaf',4); Panel.open('inv')}")
        await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/r_inv.png')
        await ev("()=>{Panel.close(); G.wmods.rifle={muz:1,mag:2,sight:2,skin:3}; G.wmods.pistol={sight:1,muz:1}; PWC={}; Panel.open('guns',{tab:'rifle'})}"); await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/r_guns.png')
        await ev("()=>{Panel.close(); Panel.open('pawn',{name:'Honest Abe'})}"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/r_pawn.png')
        await ev("()=>{Panel.close(); openStorage('home')}"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/r_stash.png')
        await ev("()=>{Panel.close(); const c=new Car('van',G.player.x+60,G.player.y,0); G.cars.push(c); openStorage('trunk',c)}"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/r_trunk.png')
        await ev("()=>{Panel.close(); const b=W.buildings.find(b=>b.type==='pawn'); G.player.x=b.door.x; G.player.y=b.door.y; enterBuilding(b); G.snapCam=1; G.fade=0}"); await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/r_pawnint.png')
        # shooting with reload + laser
        await ev("()=>{exitBuilding(); const k=W.blocks.find(b=>b.d==='trailer'); G.player.x=(k.bx+6)*T; G.player.y=(k.by-1.5)*T; G.snapCam=1; G.player.weapon=WI.pistol; Input.fire=true}")
        await pg.wait_for_timeout(5000)
        print('clip', await ev("()=>[G.player.clip[1], G.player.ammo[1], G.player.reloadT, stars()]"))
        await pg.screenshot(path='/tmp/r_fight.png')
        await ev("()=>{Input.fire=false; G.heat=0}")
        # bike + tractor
        await ev("()=>{const c=new Car('bike',G.player.x+50,G.player.y,0); G.cars.push(c); enterCar(c); const t=new Car('tractor',G.player.x+120,G.player.y+40,0.4); G.cars.push(t); Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}}"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/r_bike.png')
        await ev("()=>{Input.stick={active:false}; exitCar(true)}")
        # long sim in rural
        for i in range(8):
            await ev("()=>{Input.stick={active:true,ox:90,oy:300,dx:Math.cos(G.t),dy:Math.sin(G.t)}}"); await pg.wait_for_timeout(700)
        fps = await ev("()=>new Promise(r=>{let n=0;const t0=performance.now();function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2)} requestAnimationFrame(f)})")
        print('fps', fps, await ev("()=>({cars:G.cars.length,peds:G.peds.length})"))
        print('\n'.join(sorted(set(errs))[:12]))
        await b.close()
asyncio.run(main())
