(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); openPhone(); await w(300); const r={tab:Panel.tab, sub:Panel.msub, u:mktUnread()}; Panel.close(); return r;})()
