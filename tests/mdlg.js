(async()=>{const M=VMK(); const lb=M.feed.find(x=>!x.ghost&&x.kind!=='part'); buyListing(lb, lb.ask); await new Promise(r=>setTimeout(r,300)); return 1;})()
