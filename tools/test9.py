import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e.message)+' '+str(e.stack)[:300]))
        await pg.add_init_script("try{ if(!localStorage.getItem('seeded')){ localStorage.setItem('seeded','1'); localStorage.setItem('gl_save', JSON.stringify({cash:1234,bank:500,ammo:[0,40,0,0,0,0]})); } }catch(e){}")
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        ev=pg.evaluate
        await pg.click('text=Save slots'); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/u_slots.png')
        print('slot1', await ev("slotLine(loadSlot(1))"))
        await pg.click('text=New game >> nth=0'); await pg.wait_for_timeout(1200)
        print('slot now', await ev("[G.slot, G.cash]"))
        await ev("()=>{G.cash=30000; giveWeapon('pistol'); giveWeapon('rifle'); doSave(true)}")
        print('slots', await ev("[1,2,3].map(i=>slotLine(loadSlot(i)))"))
        # garage preview
        await ev("()=>{const z=W.sprays.find(z=>z.kind==='mod'); const c=new Car('muscle',(z.x0+z.x1)/2,(z.y0+z.y1)/2,0); G.cars.push(c); G.player.x=c.x;G.player.y=c.y; enterCar(c); openGarage(c,z); GAR.tab='perf'; GAR.pv={k:'eng',v:3,price:4000,label:'Race tune'}; renderGarage()}")
        await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/u_gar.png')
        await pg.click('#garage >> text=Buy'); await pg.wait_for_timeout(300)
        print('eng', await ev("[pCar().mods.eng, G.cash]"))
        await ev("()=>{GAR.tab='style'; GAR.pv={k:'liv',v:3,price:600,label:'Flames'}; renderGarage()}"); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/u_gar2.png')
        await ev("()=>{GAR.pv=null; closeGarage(); exitCar(true)}")
        await ev("()=>{Panel.open('guns',{tab:'rifle'}); Panel.pv={id:'rifle',s:'muz',i:1}; Panel.render()}"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/u_guns.png')
        await pg.click('#panel >> text=Buy & fit'); await pg.wait_for_timeout(200); print('wmods', await ev("JSON.stringify(G.wmods)"))
        await ev("()=>{Panel.close(); const b=W.buildings.find(b=>b.type==='gunshop'); G.player.x=b.door.x;G.player.y=b.door.y; enterBuilding(b); Panel.open('gunshop',{name:b.name, sel:'shotgun'})}"); await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/u_shop.png')
        await pg.click('#panel >> text=Rocket Launcher'); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/u_shop2.png')
        await ev("()=>{Panel.close(); Panel.open('pawn',{name:'Honest Abe', tab:'buy'})}"); await pg.wait_for_timeout(300); await pg.click('#panel >> text=Car repair kit'); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/u_pawn.png')
        await ev("()=>{Panel.close(); exitBuilding(); G.settings.walkman=1; Panel.open('radio')}"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/u_radio.png')
        for i in [7,8,9]:
            await ev("(i)=>tune(i)", i); await pg.wait_for_timeout(2500); print('station', i, await ev("[Music.key, Radio.st]"))
        await ev("()=>{Panel.close(); openPause()}"); await pg.wait_for_timeout(200); await pg.click('text=Settings'); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/u_set.png')
        await pg.click('#menu >> button:text-is("Back")'); await pg.click('text=Save game', timeout=3000); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/u_save.png')
        print(errs[:8])
        await b.close()
asyncio.run(main())
