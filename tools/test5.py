import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/n_menu.png')
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(2500)
        ev = pg.evaluate
        await pg.screenshot(path='/tmp/n_day.png')
        # garage
        await ev("""()=>{G.cash=50000; const z=W.sprays.find(z=>z.kind==='mod'); const c=new Car('sports',(z.x0+z.x1)/2+z.fx*T*2,(z.y0+z.y1)/2+z.fy*T*2,0); G.cars.push(c); G.player.x=c.x;G.player.y=c.y; enterCar(c); c.x=(z.x0+z.x1)/2; c.y=(z.y0+z.y1)/2; c.vx=c.vy=0; G.snapCam=1}""")
        await pg.wait_for_timeout(800)
        print('garage open', await ev("G.garageOpen"))
        await pg.screenshot(path='/tmp/n_gar1.png')
        # buy stuff via functions
        await ev("()=>{setMod('p','#ff6f3c'); setMod('s','#1a1a1a'); setMod('liv',3); setMod('rim',2); setMod('sp',3); setMod('hd',1); setMod('sk',1); setMod('neon',2); setMod('eng',3); setMod('tur',1); setMod('nos',1); setMod('tint',2); GAR.spent=5000; GAR.tab='perf'; renderGarage()}")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/n_gar2.png')
        await ev("()=>{GAR.tab='style'; renderGarage()}"); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/n_gar3.png')
        await pg.click('text=Drive out'); await pg.wait_for_timeout(300)
        print('ride saved', await ev("JSON.stringify(G.save.ride)"))
        # night drive with nitro
        await ev("()=>{G.tod=21.5; Input.stick={active:true,ox:90,oy:300,dx:0,dy:1}}"); await pg.wait_for_timeout(1500)
        await ev("()=>{Input.edge.nos=true}"); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/tmp/n_night.png')
        print('car', await ev("()=>[pCar().spd|0, pCar().nos, pCar().st.max|0]"))
        await ev("()=>{Input.stick={active:false,dx:0,dy:0}}")
        # rain
        await ev("()=>{G.weather.rain=1; G.weather.target=1; G.tod=13}"); await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/n_rain.png')
        await ev("()=>{G.weather.rain=0; G.weather.target=0; G.tod=18.6}"); await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/n_dusk.png')
        # chop shop
        await ev("""()=>{const z=W.sprays.find(z=>z.kind==='chop'); const c=pCar(); c.x=(z.x0+z.x1)/2; c.y=(z.y0+z.y1)/2; c.vx=c.vy=0; G.inGarage=null; G.snapCam=1}""")
        await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/n_chop.png')
        print('dlg', await ev("document.querySelector('#dlg .txt').textContent"))
        await ev("()=>closeDialog()")
        # dealer
        await ev("()=>{exitCar(true); const s=W.dealerSpots[0]; G.player.x=s.x+400; G.player.y=s.y; G.tod=13}")
        await pg.wait_for_timeout(1500)
        await ev("()=>{const s=W.dealerSpots.find(s=>s.ped); if(!s) return; G.player.x=s.ped.x+30; G.player.y=s.ped.y; talkTo(s.ped)}")
        await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/n_dealer.png')
        await ev("()=>closeDialog()")
        # strip club
        await ev("()=>{const b=W.buildings.find(b=>b.type==='strip'); G.player.x=b.door.x; G.player.y=b.door.y; enterBuilding(b); G.snapCam=1; G.fade=0}")
        await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/n_strip.png')
        await ev("()=>{exitBuilding(); const b=W.buildings.find(b=>b.type==='club'); enterBuilding(b); G.snapCam=1; G.fade=0}")
        await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/n_club.png')
        await ev("()=>{exitBuilding(); G.tod=22; G.player.x=roadCX(4)+300; G.player.y=roadCY(3); G.snapCam=1; giveWeapon('rocket'); G.player.weapon=WI.rocket; G.player.fireCD=0; playerFire(0.3)}")
        await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/n_boom.png')
        fps = await ev("()=>new Promise(r=>{let n=0;const t0=performance.now();function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2)} requestAnimationFrame(f)})")
        print('fps night', fps)
        print(errs[:20])
        await b.close()
asyncio.run(main())
