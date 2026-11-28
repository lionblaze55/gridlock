import asyncio, sys, json, os
from playwright.async_api import async_playwright
async def run(b, W, H):
    ctx = await b.new_context(viewport={'width':W,'height':H}, has_touch=True, is_mobile=True, device_scale_factor=2)
    await ctx.add_init_script(path='/home/claude/gridlock/tools/mock_room.js')
    pg = await ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append('C '+m.text[:200]) if m.type=='error' and 'font' not in m.text.lower() else None)
    await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1000)
    await pg.click('text=Multiplayer'); await pg.wait_for_timeout(500); await pg.click('text=Create a new game'); await pg.wait_for_timeout(2500)
    await pg.add_script_tag(path='/tmp/hud/states.js')
    out = {}
    async def tap_pill(label):
        r = await pg.evaluate("l=>{ const q=HUD.pills.find(p=>p.label.includes(l)); if(!q) return null; const b=Input.xBtns.find(b=>b.fn===q.fn); return b?b.r:null }", label)
        if not r: return False
        await pg.touchscreen.tap(r[0]+r[2]/2, r[1]+r[3]/2); await pg.wait_for_timeout(250); return True
    await pg.evaluate("()=>{__HS.footFull()}"); await pg.wait_for_timeout(400)
    out['sneak_tap'] = await tap_pill('SNEAK'); out['sneaking'] = await pg.evaluate("G.player.sneak")
    out['phone'] = await pg.evaluate("()=>{ DEV(); return !!activePhone() }"); await pg.wait_for_timeout(200)
    out['hack_tap'] = await tap_pill('HACK'); out['hkOn'] = await pg.evaluate("G.hkOn")
    await pg.evaluate("()=>{const p=G.player; p.sneak=false; const q=new Ped(p.x+70,p.y-40,{}); q.still=1; G.peds.push(q)}"); await pg.wait_for_timeout(500)
    # tap a hack target in the world, then the first card action
    t = await pg.evaluate("()=>{const t=(G.hkList||[]).find(t=>t.k==='ped'); if(!t) return null; const [sx,sy]=toScreen(t.o.x,t.o.y); return [sx,sy, (G.hkList||[]).length]}")
    if t:
        await pg.touchscreen.tap(t[0], t[1]); await pg.wait_for_timeout(300)
    out['sel'] = await pg.evaluate("!!G.hkSel")
    r = await pg.evaluate("()=>{ const b=Input.xBtns.filter(b=>b.k==='hack' && !HUD.pills.some(p=>p.fn===b.fn))[0]; return b?b.r:null }")
    if r:
        await pg.touchscreen.tap(r[0]+r[2]/2, r[1]+r[3]/2); await pg.wait_for_timeout(300)
    out['card_btn'] = r; out['card_action_started'] = await pg.evaluate("[!!G.hkUp, !!document.querySelector('#hackov.show')]")
    await pg.evaluate("()=>{ G.hkUp=null; const o=document.getElementById('hackov'); if(o) o.classList.remove('show'); G.hkOn=false; }")
    out['brain_or_gps'] = True
    # GPS button opens quick GPS
    g = await pg.evaluate("Input.gpsBtn"); await pg.touchscreen.tap(g[0]+g[2]/2, g[1]+g[3]/2); await pg.wait_for_timeout(400)
    out['gps_panel'] = await pg.evaluate("document.getElementById('panel').classList.contains('show') || Panel.mode"); await pg.evaluate("Panel.close()"); await pg.wait_for_timeout(200)
    # room tag toggles the scoreboard
    r = await pg.evaluate("Net.boardBtn"); await pg.touchscreen.tap(r[0]+r[2]/2, r[1]+r[3]/2); await pg.wait_for_timeout(250)
    out['board'] = await pg.evaluate("!!G.showBoard"); await pg.evaluate("G.showBoard=false")
    # surrender pill when wanted with a cop near
    await pg.evaluate("()=>{__HS.wanted()}"); await pg.wait_for_timeout(600)
    out['pills_wanted'] = await pg.evaluate("HUD.pills.map(p=>p.label)")
    if await tap_pill('SURRENDER'): out['surrender'] = await pg.evaluate("!!G.surrender")
    # fire button and stick still work and no pill sits on them
    out['overlap_ctrl'] = await pg.evaluate("()=>{ const L=Input.layout(); return Input.xBtns.filter(b=>L.btns.some(c=>c.show && b.r[0] < c.x+c.r && b.r[0]+b.r[2] > c.x-c.r && b.r[1] < c.y+c.r && b.r[1]+b.r[3] > c.y-c.r)).length }")
    out['errs'] = errs[:4]
    await ctx.close(); return out
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for (W,H) in [(844,390),(390,844)]: print(W,H, json.dumps(await run(b,W,H)))
        await b.close()
asyncio.run(main())
