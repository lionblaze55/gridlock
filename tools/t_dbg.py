import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':int(sys.argv[3]) if len(sys.argv)>3 else 390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e.message)+' '+str(e.stack)[:400]))
        await pg.goto('file://'+(sys.argv[4] if len(sys.argv)>4 else "/home/claude/gridlock/gridlock.html")+''); await pg.wait_for_timeout(1000)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1200)
        print(await pg.evaluate(open(sys.argv[1]).read())); print(errs[:5])
        if len(sys.argv)>2: await pg.wait_for_timeout(300); await pg.screenshot(path=sys.argv[2])
        await b.close()
asyncio.run(main())
