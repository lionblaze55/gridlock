(async()=>{Panel.close(); Panel.open('phone',{tab:'cars'}); await new Promise(r=>setTimeout(r,200)); return 1;})()
