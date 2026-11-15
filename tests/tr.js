(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const p=G.player, o={}; const sp=randStreetPoint(0,99999,TILE.ROAD); const X=sp.x!==undefined?sp.x:sp[0], Y=sp.y!==undefined?sp.y:sp[1]; const c=new Car('tractor',X,Y,0); c.ai={mode:'parked'}; G.cars.push(c); p.x=X+30; p.y=Y; o.tier=carTier(c); o.st={max:c.st.max,acc:c.st.acc}; o.eng=stockEng('tractor'); o.req=JSON.stringify(buildReq('tractor')); o.drivable=drivable('tractor',c.missing,c.noEng);
tryEnterCar(c); await w(300); o.bi=G.bi&&G.bi.stage; o.inCar=pCar()===c; if(G.bi){ G.bi.stage==='pick'; } // force wired
if(pCar()===c){ c.wired=1; c.deadIgn=0; G.bi=null; } else { enterCar(c); c.wired=1; G.bi=null; }
o.flags={wired:c.wired,deadIgn:c.deadIgn,totaled:c.totaled,noEng:c.noEng,owned:c.owned,missing:JSON.stringify(c.missing||{}), pcEng:c.pc&&c.pc.eng};
Input.stick={active:true,ox:90,oy:300,dx:1,dy:0}; await w(1500); Input.stick={active:false}; o.spd=Math.round(Math.hypot(c.vx,c.vy)); o.thr=c.throttle; return o;})()
