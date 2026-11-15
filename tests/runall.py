import asyncio, sys, json, os, glob
from playwright.async_api import async_playwright
HTML=os.environ.get('HTML',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','gridlock.html'))
async def one(b, f, sem, out):
    async with sem:
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PE '+str(e)+' | '+str(e.stack).split('\n')[1][:200] if e.stack else str(e)))
        pg.on('console', lambda m: errs.append('CE '+m.text[:250]) if m.type=='error' else None)
        res={'f':os.path.basename(f)}
        try:
            await pg.goto('file://'+HTML); await pg.wait_for_timeout(800); await pg.click('text=Play Solo'); await pg.wait_for_timeout(2000)
            await pg.evaluate(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'hook.js')).read())
            try:
                r = await asyncio.wait_for(pg.evaluate(open(f).read()), 90); res['r']=json.dumps(r)[:300]
            except Exception as e: res['ex']=str(e)[:300]
            await pg.wait_for_timeout(500)
            res['rep']=await pg.evaluate('window.__rep')
        except Exception as e: res['fatal']=str(e)[:200]
        u=[]; [u.append(e) for e in errs if e not in u]; res['errs']=u[:6]
        out.append(res); await ctx.close()
async def main():
    files=sys.argv[1:]
    async with async_playwright() as p:
        b = await p.chromium.launch(); sem=asyncio.Semaphore(int(os.environ.get('PAR','5'))); out=[]
        await asyncio.gather(*[one(b,f,sem,out) for f in files])
        await b.close()
    json.dump(out, open(os.environ.get('OUT','results.json'),'w'), indent=1)
    for r in sorted(out,key=lambda r:r['f']):
        rep=r.get('rep') or {}
        if r.get('errs') or r.get('ex') or rep.get('dlg') or rep.get('pan') or r.get('fatal'):
            print(r['f'], 'EX:'+r.get('ex','')[:150] if r.get('ex') else '', r.get('fatal',''), r['errs'][:3], rep.get('dlg'), rep.get('pan'))
asyncio.run(main())
