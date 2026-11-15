(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; Panel.close(); const home=W.buildings.find(b=>b.name==='Your Apartment'); enterBuilding(home); await w(400); openStorage('home'); await w(150);
o.cols=[...document.querySelectorAll('#panel .pcol > .ptitle:first-child')].map(x=>x.textContent).join(' || '); o.tiles=[...document.querySelectorAll('#panel .ggrid')].map(g=>g.dataset.side+':'+g.children.length).join(',');
const t=[...document.querySelectorAll('#panel .ggrid[data-side=bag] .gtile')].find(x=>/Egg/.test(x.textContent)); t.click(); await w(80); const half=[...document.querySelectorAll('#panel .gdet button')].map(b=>b.textContent); o.det=half.join('|');
[...document.querySelectorAll('#panel .gdet button')].find(b=>/Half/.test(b.textContent)).click(); await w(80); o.eggs=[G.inv.egg|0, G.stash.items.egg|0];
// drag the apples via synthetic pointer events (mouse)
const ap=[...document.querySelectorAll('#panel .ggrid[data-side=bag] .gtile')].find(x=>/Apple/.test(x.textContent)), r=ap.getBoundingClientRect(), dst=document.querySelector('#panel .ggrid[data-side=stash]').getBoundingClientRect();
const ev=(type,x,y,tg)=>tg.dispatchEvent(new PointerEvent(type,{bubbles:true,clientX:x,clientY:y,pointerType:'mouse'}));
ev('pointerdown',r.x+10,r.y+10,ap); for(let i=1;i<=6;i++){ ev('pointermove',r.x+10+(dst.x+20-r.x)*i/6,r.y+10+(dst.y+20-r.y)*i/6,window);} ev('pointerup',dst.x+20,dst.y+20,window); await w(100); o.apples=[G.inv.apple|0,G.stash.items.apple|0];
const gun=[...document.querySelectorAll('#panel .ggrid[data-side=bag] .gtile')].find(x=>/Pistol/i.test(x.textContent)); if(gun){ gun.click(); await w(60); [...document.querySelectorAll('#panel .gdet button')][0].click(); await w(60);} o.locker=JSON.stringify(G.stash.guns);
return o;})()
