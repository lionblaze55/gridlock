import asyncio, json, sys
from playwright.async_api import async_playwright
H='file:///home/claude/gridlock/gridlock.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
        ctx = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=1, has_touch=True, is_mobile=True)
        await ctx.add_init_script(path='/home/claude/gridlock/tools/mock_room.js')
        errs=[]
        A = await ctx.new_page(); B = await ctx.new_page()
        for pg,n in ((A,'A'),(B,'B')):
            pg.on('console', lambda m,n=n: errs.append(n+' '+m.type+': '+m.text) if m.type=='error' else None)
            pg.on('pageerror', lambda e,n=n: errs.append(n+' PAGEERR: '+str(e)))
            await pg.goto(H)
        await A.wait_for_timeout(1500)
        await A.click('text=Multiplayer'); await A.wait_for_timeout(500)
        await A.click('text=Create a new game'); await A.wait_for_timeout(1000)
        await B.click('text=Multiplayer'); await B.wait_for_timeout(800)
        await B.click('.games button:has-text("Join")'); await B.wait_for_timeout(5000)
        for pg in (A,B): await pg.evaluate("()=>{G.godT=1e9; G.heat=0}")
        await A.evaluate("()=>{G.player.x=8300;G.player.y=4224}")
        await B.evaluate("()=>{G.player.x=8420;G.player.y=4224}")
        await A.wait_for_timeout(7000)
        R = lambda pg: pg.evaluate("""()=>({auth:SH.auth, live:SH.live(), nShare:SH.nShare, pupP:G.peds.filter(p=>p.pup).length, pupC:G.cars.filter(c=>c.pup).length,
           ownP:G.peds.filter(p=>!p.pup&&!p.persist&&!p.dead).length, ownC:G.cars.filter(c=>!c.pup).length, sent:SH.sent.size})""")
        print('A', await R(A)); print('B', await R(B))
        # positions / looks vs truth
        bp = await B.evaluate("()=>[...SH.pup.values()].map(e=>[e.pup.i, e.x|0, e.y|0, e.shirt||e.color, e instanceof Car?1:0])")
        truth = await A.evaluate("ids=>ids.map(i=>{const e=SH.byId.get(i); return e?[e.x|0,e.y|0,e.shirt||e.color]:null})", [x[0] for x in bp])
        errsum=0; n=0; look=0; miss=0
        for q,t in zip(bp,truth):
            if not t: miss+=1; continue
            n+=1; errsum+=((q[1]-t[0])**2+(q[2]-t[1])**2)**.5; look+= (q[3]==t[2])
        print('puppets', len(bp), 'matched', n, 'missing on owner', miss, 'mean pos err', round(errsum/max(1,n),1), 'looks match', look)
        # B far away: authority should fill B's streets
        await B.evaluate("()=>{G.player.x=8420+3600;G.player.y=4224+1200}")
        await A.wait_for_timeout(9000)
        print('B far', await R(B), 'A', await R(A))
        near = await A.evaluate("()=>{const e=[...Net.peers.values()][0]; return [G.peds.filter(p=>!p.pup&&dist2(p.x,p.y,e.s.x,e.s.y)<1100*1100).length, G.cars.filter(c=>!c.pup&&c.ai&&c.ai.mode==='traffic'&&dist2(c.x,c.y,e.s.x,e.s.y)<1300*1300).length]}")
        print('A-owned near B (peds, traffic)', near)
        # B shoots a puppet ped
        r = await B.evaluate("""()=>{const pl=G.player; const q=G.peds.filter(p=>p.pup&&!p.dead).sort((a,b)=>dist2(a.x,a.y,pl.x,pl.y)-dist2(b.x,b.y,pl.x,pl.y))[0]; if(!q) return null;
            giveWeapon('pistol',200); pl.weapon=WI.pistol; window.__tq=q; return [q.pup.i, Math.round(dist(q.x,q.y,pl.x,pl.y))]}""")
        print('target', r); k0 = await B.evaluate("G.kills")
        eh0 = await A.evaluate("()=>{window.__eh=0; const h=SHX.eh; SHX.eh=function(e,ev){window.__eh++; return h.apply(this,arguments)}; return 1}")
        for i in range(14):
            await B.evaluate("()=>{const pl=G.player,q=window.__tq; pl.x=q.x-40; pl.y=q.y; pl.a=0; G.aimA=0; pl.fireCD=0; try{ fireHitscan(pl, pl.x+10, pl.y, Math.atan2(q.y-pl.y,q.x-pl.x), WEAPONS[WI.pistol], true) }catch(e){} }")
            await B.wait_for_timeout(150)
        await B.wait_for_timeout(1200)
        print('A got eh', await A.evaluate('window.__eh'), 'B hq left', await B.evaluate('SH.hq.size')); print('owner says dead', await A.evaluate("i=>{const e=SH.byId.get(i); return e?e.dead:'gone'}", r[0]), 'B puppet dead', await B.evaluate("window.__tq.dead"), 'B kills', k0, '->', await B.evaluate("G.kills"))
        # B steals a puppet car
        r = await B.evaluate("""()=>{const pl=G.player; const c=G.cars.filter(c=>c.pup&&!c.dead&&!c.pup.nt&&!c.alt).sort((a,b)=>dist2(a.x,a.y,pl.x,pl.y)-dist2(b.x,b.y,pl.x,pl.y))[0]; if(!c) return null; const i=c.pup.i; pl.x=c.x; pl.y=c.y+30; enterCar(c); return [i, !!pCar(), pCar()===c, !!c.pup]}""")
        print('steal', r); await B.wait_for_timeout(1500)
        print('owner still has stolen car', await A.evaluate("i=>{const e=SH.byId.get(i); return !!(e&&G.cars.includes(e))}", r[0]))
        await B.evaluate("()=>{ if (pCar()) exitCar(true) }")
        # clock + weather
        await A.evaluate("()=>{G.tod=3.2; G.weather.target=1; G.weather.rain=.9; G.weather.t=999}"); await B.wait_for_timeout(1500)
        print('B tod/rain', await B.evaluate("[+G.tod.toFixed(2), +G.weather.rain.toFixed(2), G.weather.target]"))
        # property
        rid = await A.evaluate("()=>{const r=W.realty[0]; LIFE().own[r.id]={safe:0,pop:40,stock:60,up:{},sup:50,prod:0,lvl:1,price:r.price}; SH.owT=-99; return r.id}")
        await B.wait_for_timeout(3000)
        print('B buy owned', await B.evaluate("id=>{G.cash=1e9; const r=W.realty.find(x=>x.id===id); return [buyProperty(r), !!LIFE().own[id], shPropOwner(id)]}", rid))
        # NPC gunfire at B
        await B.evaluate("()=>{G.godT=0; G.player.hp=100}")
        await A.evaluate("()=>{const e=[...Net.peers.values()][0]; const q=new Ped(e.s.x+150,e.s.y,{gang:'reapers'}); q.weapon=WI.pistol; q.facArmed=1; G.peds.push(q); q.state='fight'; q.target=shProx(e.peer); q.timer=30; window.__g=q}")
        await B.evaluate("()=>{window.__nsr=0; const h=SHX.ns; SHX.ns=function(e,ev){window.__nsr++; return h.apply(this,arguments)}}")
        await A.bring_to_front(); await A.wait_for_timeout(9000)
        print('B got ns', await B.evaluate("window.__nsr"), 'A G.t', await A.evaluate("G.t|0"), 'A gang', await A.evaluate("()=>{const q=window.__g; return [q.state,q.dead,q.weapon,q.x|0,q.y|0,q.target&&q.target.isProxy, q.target&&[q.target.x|0,q.target.y|0], SH.nsBud]}"), 'B', await B.evaluate("[G.player.x|0,G.player.y|0,G.t|0]"))
        print('B hp after gang', await B.evaluate("G.player.hp|0"), 'B sees shooter', await B.evaluate("G.peds.filter(p=>p.pup&&p.gang==='reapers'&&!p.dead).length"))
        await B.evaluate("()=>{G.godT=1e9; G.player.hp=100}")
        # bring B back next to A, then A goes inside: B adopts A's things near B
        await B.bring_to_front(); await B.evaluate("()=>{G.player.x=8420;G.player.y=4224}"); await A.wait_for_timeout(6000)
        pre = await B.evaluate("()=>[G.peds.filter(p=>p.pup).length+G.cars.filter(c=>c.pup).length, G.peds.filter(p=>!p.pup).length+G.cars.filter(c=>!c.pup).length]")
        await A.evaluate("()=>{const b=W.buildings.filter(b=>b.door).sort((x,y)=>dist2(x.door.x,x.door.y,G.player.x,G.player.y)-dist2(y.door.x,y.door.y,G.player.x,G.player.y))[0]; enterBuilding(b); window.__in=!!G.scene}")
        await A.wait_for_timeout(3000)
        post = await B.evaluate("()=>[G.peds.filter(p=>p.pup).length+G.cars.filter(c=>c.pup).length, G.peds.filter(p=>!p.pup).length+G.cars.filter(c=>!c.pup).length, SH.auth]")
        print('A inside', await A.evaluate("window.__in"), 'B (puppets, own) before', pre, 'after', post)
        await A.wait_for_timeout(5000)
        print('B auth spawning now', await R(B))
        # A comes back out
        await A.evaluate("()=>{ try{ exitInterior ? exitInterior() : 0 }catch(e){} }")
        print('rejects A', await A.evaluate("window.__roomRejects"), 'B', await B.evaluate("window.__roomRejects"))
        print('max pres', await A.evaluate("new TextEncoder().encode(JSON.stringify(WH.lastPres)).length"), await B.evaluate("new TextEncoder().encode(JSON.stringify(WH.lastPres)).length"))
        await A.screenshot(path='/tmp/ts/A.png'); await B.screenshot(path='/tmp/ts/B.png')
        print('\n'.join(errs[:20]))
        await b.close()
asyncio.run(main())
