import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1000)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        ev=pg.evaluate
        # pigeons: force spawn near player in view
        await ev("()=>{G.tod=12; for(let i=0;i<6;i++) G.birds.push({x:G.player.x+60+i*8,y:G.player.y-40+(i%2)*10,a:i,st:'ground',z:0,vx:0,vy:0,pk:1,hop:0,c:'#8a8f99'}); const q=G.peds.find(q=>!q.dead); if(q){q.x=G.player.x-40;q.y=G.player.y+10; pedSay(q,'Nice day.')}}")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/a_birds.png')
        await ev("()=>{Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}}"); await pg.wait_for_timeout(350); await pg.screenshot(path='/tmp/a_scatter.png'); await ev("()=>{Input.stick={active:false}}")
        # talk with portrait
        await ev("()=>{const q=G.peds.find(q=>!q.dead&&q.role==='civ'); q.x=G.player.x+25; q.y=G.player.y; talkTo(q)}"); await pg.wait_for_timeout(900); await pg.screenshot(path='/tmp/a_talk.png'); await ev("()=>closeDialog()")
        # punch anim + car tumble
        await ev("()=>{G.player.weapon=0; G.player.fireCD=0; playerFire(0)}"); await pg.wait_for_timeout(80); await pg.screenshot(path='/tmp/a_punch.png')
        # rain night puddles
        await ev("()=>{G.weather.rain=1; G.weather.target=1; G.tod=22; G.lightning=0}"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/a_rain.png')
        # driving close-up wheel steer
        await ev("()=>{G.weather.rain=0;G.weather.target=0;G.tod=12; const c=new Car('muscle',G.player.x+80,G.player.y,0); G.cars.push(c); enterCar(c); Input.stick={active:true,ox:90,oy:300,dx:.3,dy:-1}}"); await pg.wait_for_timeout(900); await pg.screenshot(path='/tmp/a_drive.png')
        await ev("()=>{Input.stick={active:false}; G.player.hp=1; hurtPlayer(50,null,'gun')}"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/a_dead.png')
        print(errs[:5])
        await b.close()
asyncio.run(main())
