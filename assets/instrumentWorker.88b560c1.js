let a;const e={providers:[]},d=o=>{const{symbol:r,provider:s,ask:t,bid:n}=o;let i=!1;return!r||!s||!t||!n?!1:((!e.bid||e.bidProvider===s||n>e.bid)&&(e.bid=Number(n).toFixed(6),e.bidProvider=s,i=!0),(!e.ask||e.askProvider===s||t<e.ask)&&(e.ask=Number(t).toFixed(6),e.askProvider=s,i=!0),(e.providers.length<=0||!e.providers.includes(s))&&(e.providers.push(s),i=!0),i)},p=o=>{d(o.data)&&postMessage({operation:4,data:e})};onmessage=o=>{const{operation:r,symbol:s,sharedWorkerPort:t}=o.data;switch(console.debug(`In ${self.name} for operation ${r} at ${Date.now()}`),r){case 5:a=t,a.onmessage=p,a.postMessage({operation:6,symbol:s}),setTimeout(()=>{self.postMessage({operation:0})},500);break;case 2:a.postMessage({operation:r,symbol:s});break;case 3:a.postMessage({operation:r,symbol:s});break;default:console.error(`instrumentWorker: Received invalid operation ${r}`)}};import("./global.dae64e40.js").then(({LOG_LEVEL_DEBUG:o})=>{o||(self.console.debug=()=>{})});
