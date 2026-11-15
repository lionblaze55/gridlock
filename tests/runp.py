import asyncio, sys, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1000); await pg.click('text=Play Solo'); await pg.wait_for_timeout(2500)
        for step in sys.argv[1:]:
            if step.startswith('shot:'): await pg.screenshot(path='/tmp/t17/'+step[5:]+'.png'); continue
            r = await pg.evaluate(open(step).read()); print(step, json.dumps(r)[:300])
        print('errors', errs[:3]); await b.close()
asyncio.run(main())
