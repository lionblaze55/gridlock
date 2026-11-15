import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e.message)+' '+str(e.stack)[:400]))
        await pg.goto('file:///home/claude/gridlock/gridlock.html'); await pg.wait_for_timeout(1200)
        ev=pg.evaluate
        await pg.click('text=Play Solo'); await pg.wait_for_timeout(1500)
        # traffic metrics: fast-forward 90s
        r = await ev("""()=>{ let rev=0, stuck=0, n=0, off=0, coll=0; const last=new Map();
          for(let k=0;k<2700;k++){ update(1/30);
            if(k%30===0) for(const c of G.cars){ if(!c.ai||c.ai.mode!=='traffic'||c.dead) continue; n++;
              if(c.fwd<-15) rev++; const l=last.get(c.uid); if(l && Math.hypot(c.x-l[0],c.y-l[1])<4) { l[2]++; if(l[2]===12) stuck++; } else last.set(c.uid,[c.x,c.y,0]);
              const t=tileAt(Math.floor(c.x/T),Math.floor(c.y/T)); if(t!==TILE.ROAD && t!==TILE.DIRT) off++; } }
          return {n,rev,stuck,off,cars:G.cars.length,peds:G.peds.length,t:G.t}; }""")
        print('traffic', r, errs[:3])
        await pg.screenshot(path='/tmp/ai1.png')
        # car should stop for player in road
        r = await ev("""()=>{ const c=G.cars.find(c=>c.ai&&c.ai.mode==='traffic'&&!c.dead&&c.spd>100&&c.ai.wps.length&&dist(c.x,c.y,c.ai.wps[0][0],c.ai.wps[0][1])>330); if(!c) return 'nocar';
          const p=G.player; p.x=c.x+Math.cos(c.a)*190; p.y=c.y+Math.sin(c.a)*190; const hp=p.hp; let minD=1e9;
          for(let k=0;k<150;k++){ update(1/30); p.x=p.x; minD=Math.min(minD,dist(c.x,c.y,p.x,p.y)); }
          return {minD, spd:c.spd, hp0:hp, hp:p.hp}; }""")
        print('brake-for-player', r)
        # wanted decay when unseen
        r = await ev("""()=>{ const p=G.player; G.heat=2.2; markSeen(); G.wantedSince=G.t; const out=[];
          const b=W.buildings.find(b=>b.name==='Your Apartment'); 
          for(let k=0;k<1800;k++){ update(1/30); if(k%150===0) out.push([+(G.t).toFixed(0), stars(), G.cars.filter(c=>c.ai&&c.ai.mode==='chase').length, G.peds.filter(q=>q.role==='cop'&&q.state==='chase').length, +(G.t-G.lastSeen).toFixed(1)]); }
          return out; }""")
        print('wanted (standing still, 2 stars)', r)
        r = await ev("""()=>{ G.heat=0; callOffCops(); for(let k=0;k<300;k++) update(1/30); return [stars(), G.cars.filter(c=>c.ai&&c.ai.mode==='chase').length, G.peds.filter(q=>q.role==='cop'&&q.state==='chase').length]; }""")
        print('after clear', r)
        # hide indoors: stars should drop
        r = await ev("""()=>{ G.heat=3.1; markSeen(); const b=W.buildings.find(b=>b.name==='Your Apartment'); G.player.x=b.door.x; G.player.y=b.door.y; enterBuilding(b); const out=[]; for(let k=0;k<1800;k++){ update(1/30); if(k%150===0) out.push([stars(), +(G.t-G.lastSeen).toFixed(1)]); } exitBuilding(); return out; }""")
        print('hide indoors', r)
        # peds: fraction off sidewalk / stuck
        r = await ev("""()=>{ let n=0, road=0, stuck=0; const last=new Map(); for(let k=0;k<900;k++){ update(1/30); if(k%30===0) for(const q of G.peds){ if(q.dead||q.role!=='civ'&&q.role!==undefined&&q.role!=='ped') continue; n++; const t=tileAt(Math.floor(q.x/T),Math.floor(q.y/T)); if(t===TILE.ROAD&&q.state==='walk') road++; const l=last.get(q); if(l&&q.state==='walk'&&Math.hypot(q.x-l[0],q.y-l[1])<3) stuck++; last.set(q,[q.x,q.y]); } } return {n,road,stuck, roles:[...new Set(G.peds.map(q=>q.role))]}; }""")
        print('peds', r)
        print(errs[:6])
        await b.close()
asyncio.run(main())
