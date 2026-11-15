import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type in ('error',) else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1500)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1000)
        ev = pg.evaluate
        # walk
        await ev("()=>{Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}}"); await pg.wait_for_timeout(1500)
        print('walk', await ev("()=>[G.player.x|0,G.player.y|0]"))
        await ev("()=>{Input.stick={active:false,dx:0,dy:0}}")
        # get in nearest car
        await ev("()=>{const c=G.cars.filter(c=>!c.dead).sort((a,b)=>dist2(a.x,a.y,G.player.x,G.player.y)-dist2(b.x,b.y,G.player.x,G.player.y))[0]; G.player.x=c.x+Math.cos(c.a-Math.PI/2)*30; G.player.y=c.y+Math.sin(c.a-Math.PI/2)*30; Input.edge.car=true;}")
        await pg.wait_for_timeout(300)
        print('incar', await ev("()=>!!G.player.car && G.player.car.type"))
        await ev("()=>{Input.stick={active:true,ox:90,oy:300,dx:0.0,dy:-1}}"); await pg.wait_for_timeout(2500)
        print('drive', await ev("()=>[G.player.car.x|0,G.player.car.y|0,G.player.car.spd|0]"))
        await pg.screenshot(path='/tmp/s_drive.png')
        await ev("()=>{Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}}"); await pg.wait_for_timeout(2000)
        await pg.screenshot(path='/tmp/s_drive2.png')
        await ev("()=>{Input.stick={active:false,dx:0,dy:0}; Input.held.rev=true; Input.rev=true}"); await pg.wait_for_timeout(1200)
        await ev("()=>{Input.rev=false; Input.edge.car=true}"); await pg.wait_for_timeout(400)
        print('out', await ev("()=>!G.player.car"))
        # weapons + crime
        await ev("()=>{giveWeapon('uzi'); giveWeapon('rocket'); G.heat=3.2; G.lastSeen=G.t}")
        await pg.wait_for_timeout(5000)
        print('cops', await ev("()=>({carsChase:G.cars.filter(c=>c.ai&&c.ai.mode==='chase').length, foot:G.peds.filter(p=>p.role==='cop'&&p.state==='chase').length, hp:G.player.hp|0, stars:stars()})"))
        await pg.screenshot(path='/tmp/s_cops.png')
        await ev("()=>{G.player.weapon=WI.rocket; Input.fire=true}"); await pg.wait_for_timeout(700); await ev("()=>{Input.fire=false}")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path='/tmp/s_boom.png')
        await ev("()=>{G.heat=0; G.player.hp=100; for(const p of G.peds) if(p.role==='cop') p.state='walk'}")
        # interiors
        for t in ['gunshop','diner','club','bank','police','safehouse','office','store','bar','hospital','warehouse','arcade','home']:
            await ev("(t)=>{if(G.scene) exitBuilding(); const b=W.buildings.find(b=>b.type===t&&b.door); G.player.x=b.door.x; G.player.y=b.door.y; enterBuilding(b); G.snapCam=1; G.fade=0}", t)
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'/tmp/i_{t}.png')
        # talk to clerk in arcade -> dialog
        await ev("()=>{if(G.scene) exitBuilding(); const b=W.buildings.find(b=>b.type==='gunshop'); enterBuilding(b); const q=G.scene.peds.find(q=>q.shop); G.player.x=q.x; G.player.y=q.y+70; talkTo(q)}")
        await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/s_dlg.png')
        await ev("()=>closeDialog()")
        # phone mission
        await ev("()=>{exitBuilding(); const ph=W.phones[0]; G.player.x=ph.x+20; G.player.y=ph.y; useProp(ph);}")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/s_phone.png')
        await ev("()=>{document.querySelector('#dlg .opts button').click()}"); await pg.wait_for_timeout(1500)
        print('mission', await ev("()=>G.mission&&[G.mission.title, G.mission.hud()]"))
        await pg.screenshot(path='/tmp/s_mission.png')
        # long sim for stability
        await ev("()=>{G.heat=4.5; G.godT=999}")
        for i in range(10):
            await ev("()=>{Input.stick={active:true,ox:90,oy:300,dx:Math.cos(G.t),dy:Math.sin(G.t)}; Input.fire=true}")
            await pg.wait_for_timeout(1000)
        print('stats', await ev("()=>({cars:G.cars.length,peds:G.peds.length,fx:G.fx.length,decals:G.decals.length,kills:G.kills})"))
        await pg.screenshot(path='/tmp/s_chaos.png')
        fps = await ev("()=>new Promise(r=>{let n=0;const t0=performance.now();function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2)} requestAnimationFrame(f)})")
        print('fps', fps)
        print('\n'.join(errs[:30]))
        await b.close()
asyncio.run(main())
