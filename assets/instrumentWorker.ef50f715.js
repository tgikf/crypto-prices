import("./global.9a01d596.js").then(({default:i})=>{i||(self.console.debug=()=>{})});Promise.all([import("./initializeSocketWorkers.240649c9.js"),import("./WorkerMessageOperations.e53da7d0.js")]).then(([{default:i},{default:a}])=>{const e={providers:[]},u=s=>{const{symbol:o,provider:t,ask:n,bid:d}=s;let r=!1;return!o||!t||!n||!d?!1:((!e.bid||d>e.bid)&&(e.bid=Number(d).toFixed(6),e.bidProvider=t,r=!0),(!e.ask||n<e.ask)&&(e.ask=Number(n).toFixed(6),e.askProvider=t,r=!0),(e.providers.length<=0||!e.providers.includes(t))&&(e.providers.push(t),r=!0),r)},l=i(s=>{u(s.data)&&postMessage({operation:a.PRICE_UPDATE,data:e})});setTimeout(()=>{postMessage({operation:a.SOCKET_READY})},100),onmessage=s=>{s.data.operation===a.TERMINATE_CHILDREN?(Object.values(l).forEach(o=>o.terminate()),postMessage({operation:a.TERMINATE_SELF})):Object.entries(l).forEach(([o,t])=>t.postMessage({...s.data,handler:o}))}});