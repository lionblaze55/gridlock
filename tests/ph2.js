(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const o={}; Panel.open('phone',{}); await w(100); o.tabs=[...document.querySelectorAll('#panel .ptabs button')].map(b=>b.textContent).join('|');
const clickTab=async n=>{ [...document.querySelectorAll('#panel .ptabs button')].find(b=>b.textContent.startsWith(n)).click(); await w(100); return [...document.querySelectorAll('#panel .psub button')].map(b=>b.textContent).join('|')+' :: '+Panel.tab; };
o.home=await clickTab('Home'); o.work=await clickTab('Work'); o.prop=await clickTab('Property'); o.race=await clickTab('Racing'); o.raceTxt=document.querySelector('#panel .pbody').innerText.slice(0,300).replace(/\n/g,' | ');
[...document.querySelectorAll('#panel .ptabs button')].find(b=>b.textContent.startsWith('Property')).click(); await w(80); [...document.querySelectorAll('#panel .psub button')][1].click(); await w(80); o.sale=Panel.tab;
return o;})()
