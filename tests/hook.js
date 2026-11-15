(()=>{ window.__rep={dlg:[],pan:[],ce:0};
const sd=showDialog; showDialog=function(who,text,opts){ try{ const L=(opts||[]).map(o=>o&&o.t); const d=L.filter((t,i)=>t&&L.indexOf(t)!==i); if(d.length) __rep.dlg.push(who+' :: '+d.join('|')+' :: ['+L.join(', ')+']'); }catch(e){} return sd.apply(this,arguments); };
const pr=Panel.render; Panel.render=function(){ const r=pr.apply(this,arguments); try{ const el=document.getElementById('panel'), tag=this.mode+':'+(this.tab||'')+':'+(this.msub||'');
 const chk=(arr,k)=>{const d=arr.filter((t,i)=>t&&arr.indexOf(t)!==i); if(d.length){const s=tag+' '+k+' '+[...new Set(d)].join('|'); if(!__rep.pan.includes(s)) __rep.pan.push(s);}};
 chk([...el.querySelectorAll('.ptabs button')].map(b=>b.textContent.trim()),'TABS'); chk([...el.querySelectorAll('.pfoot button')].map(b=>b.textContent.trim()),'FOOT');
 el.querySelectorAll('.prow').forEach(r=>chk([...r.querySelectorAll('.pbs button')].map(b=>b.textContent.trim()),'ROW['+((r.querySelector('b')||{}).textContent||'')+']'));
 el.querySelectorAll('.pcol').forEach(c=>chk([...c.querySelectorAll('.ptitle')].map(x=>x.textContent.trim()),'SECTION'));
 chk([...el.querySelectorAll('.pcol > .ptitle:first-child')].map(x=>x.textContent.trim()),'COLS');
}catch(e){} return r; }; return 1; })()
