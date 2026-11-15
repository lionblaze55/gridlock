import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        await ctx.add_init_script(script="""const o=AudioParam.prototype.setValueAtTime; AudioParam.prototype.setValueAtTime=function(v,t){ if(!isFinite(v)||!isFinite(t)){ console.log('BAD', v, t, new Error().stack.split('\\n').slice(2,5).join(' | ')); return this;} return o.call(this,v,t)}""")
        pg = await ctx.new_page(); logs=[]
        pg.on('console', lambda m: logs.append(m.text) if 'BAD' in m.text else None)
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(800)
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1000)
        await pg.evaluate("()=>{giveWeapon('uzi'); G.heat=3.2; G.lastSeen=G.t; Input.fire=true; Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}}")
        await pg.wait_for_timeout(6000)
        print('\n'.join(sorted(set(l[:300] for l in logs))[:8]))
        await b.close()
asyncio.run(main())
