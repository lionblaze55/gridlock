import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        await pg.evaluate("""()=>{window.LOG=[]; const o=hurtPlayer; hurtPlayer=function(n,by,kind){LOG.push([+G.t.toFixed(1),+n.toFixed(1),kind,by&&(by.role||by.type||'?')]); return o(n,by,kind)}; giveWeapon('pistol'); G.heat=3.2; G.player.hp=100; G.lastSeen=G.t;}""")
        await pg.wait_for_timeout(9000)
        print(await pg.evaluate("LOG"))
        await b.close()
asyncio.run(main())
