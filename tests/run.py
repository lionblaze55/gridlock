import asyncio, sys, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': __import__('os').environ['CHROME']} if __import__('os').environ.get('CHROME') else {}))
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)+' | '+str(e.stack)[:400]))
        await pg.goto('file://'+__import__('os').environ.get('HTML', __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', 'gridlock.html'))); await pg.wait_for_timeout(1000); await pg.click('text=Play Solo'); await pg.wait_for_timeout(2500)
        for step in sys.argv[1:]:
            if step.startswith('shot:'): await pg.screenshot(path='/tmp/t16/'+step[5:]+'.png'); continue
            if step.startswith('wait:'): await pg.wait_for_timeout(int(step[5:])); continue
            r = await pg.evaluate(open(step).read()); print(step, json.dumps(r)[:1500])
        print('errors', errs[:4]); await b.close()
asyncio.run(main())
