import asyncio, sys, json, os
from playwright.async_api import async_playwright
SIZES = [tuple(map(int,s.split('x'))) for s in (os.environ.get('SIZES') or '844x390 740x360 390x844 360x740 1024x768 932x430').split()]
STATES = (os.environ.get('STATES') or 'foot footFull wanted sneak hack car carWanted carClassic mission everything hackWanted kbd breakin plane interior bigMap noMap bigBtns carBig').split()
OUT = os.environ.get('OUT','/tmp/hud/before')
async def main():
    os.makedirs(OUT, exist_ok=True); total = 0; rep = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for (W,H) in SIZES:
            ctx = await b.new_context(viewport={'width':W,'height':H}, has_touch=True, is_mobile=True, device_scale_factor=2)
            await ctx.add_init_script(path='/home/claude/gridlock/tools/mock_room.js')
            pg = await ctx.new_page(); errs=[]
            pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: errs.append('C '+m.text[:200]) if m.type=='error' and 'font' not in m.text.lower() else None)
            await pg.goto('file://'+os.environ.get('HTML','/home/claude/gridlock/gridlock.html')); await pg.wait_for_timeout(1000); 
            if os.environ.get('NET'):
                await pg.click('text=Multiplayer'); await pg.wait_for_timeout(500); await pg.click('text=Create a new game'); await pg.wait_for_timeout(2500)
            else:
                await pg.click('text=Play Solo'); await pg.wait_for_timeout(2200)
            await pg.add_script_tag(path=''+os.path.dirname(os.path.abspath(__file__))+'/cap.js'); await pg.add_script_tag(path=''+os.path.dirname(os.path.abspath(__file__))+'/states.js')
            for st in STATES:
                try:
                    await pg.evaluate("s=>{G.settings.drive='auto'; __HS[s]()}", st)
                except Exception as e: print('state fail', st, str(e)[:200]); continue
                await pg.wait_for_timeout(350)
                await pg.evaluate("()=>{ if (window.__after) { try{ __after() }catch(e){} window.__after=null } }"); await pg.wait_for_timeout(120)
                await pg.screenshot(path=f'{OUT}/{W}x{H}_{st}.png')
                ov = await pg.evaluate("__hudOverlaps()")
                ov = [o for o in ov if not (o[0]=='C:arc' and o[1]=='R:rr' and o[4][2] < 40 and o[4][1] < 70)]
                rep[f'{W}x{H} {st}'] = ov; total += len(ov)
            if errs: print(W,H,'errors', len(errs), list(dict.fromkeys(errs))[:4])
            await ctx.close()
        await b.close()
    json.dump(rep, open(OUT+'/report.json','w'), indent=0)
    for k,v in rep.items():
        print(k, len(v))
        for o in v[:int(os.environ.get('SHOW','6'))]: print('   ', o[0], '×', o[1], o[2], o[3], o[4])
    print('TOTAL', total)
asyncio.run(main())
