(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const p=G.player; G.peds=[]; G.cars=[]; const x0=roadCX(8)-200, y0=roadCY(5)+300; p.x=x0+200; p.y=y0+60;
const T9=['luxsedan','luxsuv','coupe','super','hyper','roadster','pickup4','workpick','minitruck']; T9.forEach((t,i)=>{const c=new Car(t,x0+i*48,y0,Math.PI/2); c.ai={mode:'parked'}; c.persist=1; G.cars.push(c);});
G.tod=12; G.msgs=[]; for(let k=0;k<6;k++){G.cam.x=x0+190; G.cam.y=y0; G.cam.z=2.6; await w(100);} return T9.map(t=>CAR_TYPES[t].name+':'+carValue({type:t}));})()
