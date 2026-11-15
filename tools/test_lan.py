import asyncio, subprocess, sys, time
from playwright.async_api import async_playwright
async def run(kind, port):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        c1 = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        c2 = await b.new_context(viewport={'width':844,'height':390}, has_touch=True, is_mobile=True)
        errs=[]
        A = await c1.new_page(); B = await c2.new_page()
        for pg,n in ((A,'A'),(B,'B')):
            pg.on('pageerror', lambda e,n=n: errs.append(n+' '+str(e.message)+str(e.stack)[:200]))
        await A.goto(f'http://127.0.0.1:{port}/'); await B.goto('file:///home/claude/gridlock/gridlock.html')
        await A.wait_for_timeout(1500)
        await A.click('text=Multiplayer'); await A.wait_for_timeout(400); await A.screenshot(path='/tmp/lan_menu.png')
        await A.click("text=Join this host's game"); await A.wait_for_timeout(1500)
        await B.click('text=Multiplayer'); await B.wait_for_timeout(400)
        await B.fill('input[placeholder="192.168.1.20:8080"]', f'127.0.0.1:{port}'); await B.click('text=Join LAN'); await B.wait_for_timeout(1500)
        print(kind, 'A', await A.evaluate('[Net.code, Net.lan, G.mode]'), 'B', await B.evaluate('[Net.code, Net.lan, G.mode]'))
        await A.evaluate("()=>{G.player.x=8300;G.player.y=4224;G.player.a=0; giveWeapon('pistol',50); G.player.weapon=WI.pistol}")
        await B.evaluate("()=>{G.player.x=8420;G.player.y=4224; G.godT=0}")
        await A.wait_for_timeout(1500)
        print(' A sees', await A.evaluate("()=>Net.visible().map(([e,r])=>[e.name,r.x|0,r.y|0])"), 'B sees', await B.evaluate("()=>Net.visible().map(([e,r])=>[e.name,r.x|0])"))
        hp0 = await B.evaluate("G.player.hp")
        for i in range(4):
            await A.evaluate("()=>{G.player.fireCD=0; G.player.reloadT=0; playerFire(0)}"); await A.wait_for_timeout(350)
        await B.wait_for_timeout(600)
        print(' B hp', hp0, '->', await B.evaluate("G.player.hp"))
        await A.screenshot(path=f'/tmp/lan_{kind}.png')
        await B.close(); await A.wait_for_timeout(1200)
        print(' after B left, A peers', await A.evaluate("Net.peers.size"), await A.evaluate("Net.feed.map(f=>f.text)"))
        print(' errs', errs[:5])
        await b.close()
kind=sys.argv[1]
if kind=='java': proc=subprocess.Popen(['java','-cp','/tmp/jl','TestMain'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); port=8080
else:
    import shutil; shutil.copy('/home/claude/gridlock/gridlock.html','/home/claude/gridlock/lan/gridlock.html'); proc=subprocess.Popen(['node','/home/claude/gridlock/lan/lan-server.js','8091'],stdout=subprocess.DEVNULL); port=8091
time.sleep(2)
try: asyncio.run(run(kind,port))
finally: proc.kill()
