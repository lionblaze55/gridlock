(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)); const M=VMK(); Panel.msub='msgs'; Panel.sel=null; Panel.render(); await w(300); return M.msgs.length;})()
