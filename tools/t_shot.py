import asyncio, sys
from playwright.async_api import async_playwright
# usage: t_shot.py W H out.png [js]
async def main():
    W,H,out=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]; js=open(sys.argv[4]).read() if len(sys.argv)>4 else None
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await (await b.new_context(viewport={'width':W,'height':H}, has_touch=True, is_mobile=True, device_scale_factor=2)).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e.message)+' '+str(e.stack)[:300]))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        if js is None or 'NOSTART' not in js:
            await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        if js: print(await pg.evaluate(js))
        await pg.wait_for_timeout(500); await pg.screenshot(path=out); print(errs[:4]); await b.close()
asyncio.run(main())
