let n,a=[];const i=[],l={};self.onconnect=t=>{const r=t.ports[0];n=s=>{l[s.symbol].postMessage(s)},r.onmessage=s=>{const{operation:c,symbol:o}=s.data;switch(c){case 6:l[o]=r;break;case 1:a.forEach(e=>e.close()),self.close();break;case 2:a.filter((e,d)=>i.includes(d)).forEach(e=>e.subscribe(o));break;case 3:a.forEach(e=>e.unsubscribe(o));break;default:console.error(`socketWorker: Received invalid operation ${c}`)}}};Promise.all([import("./BinanceSocketHandler.b7ab09e6.js"),import("./CoinbaseSocketHandler.d3ff2d54.js"),import("./CoinFlexSocketHandler.2223d016.js"),import("./BitmexSocketHandler.188ded6d.js")]).then(([{default:t},{default:r},{default:s},{default:c}])=>{a=[t,r,s,c].map(o=>new o(n)),a.forEach(async(o,e)=>{await o.waitForReadyState(),i.push(e)})});import("./global.3cbd9d03.js").then(({LOG_LEVEL_DEBUG:t})=>{t||(self.console.debug=()=>{})});