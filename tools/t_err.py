import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await (await b.new_context(viewport={'width':844,'height':390})).new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e.message)+' | '+str(e.stack)[:500]))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(2500)
        print('\n'.join(errs[:4])); await b.close()
asyncio.run(main())
