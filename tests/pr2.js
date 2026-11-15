(async()=>['arm','wgt','drv','swp','sp','sk','hd','rim'].map(k=>MODOPTS[k]?k+':'+MODOPTS[k].o.map(x=>x[0]+'='+x[1]).join(' / '):k))()
