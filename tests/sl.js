(async()=>{G.tod=22; const d0=G.day; const r=sleepPass(); const a={tod:G.tod, dayInc:G.day-d0, r}; G.tod=3; const d1=G.day; sleepPass(); a.early={tod:G.tod, dayInc:G.day-d1}; return a;})()
