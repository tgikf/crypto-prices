import{SOCKET_THROTTLING_MS as s}from"./global.dae64e40.js";class r{constructor(e){this.updateParent=e,setInterval(()=>{this.bestPrice?.symbol&&this.bestPrice!==this.lastPrice&&(this.lastPrice=this.bestPrice,e(this.bestPrice))},s)}socket;provider;subscribedSymbols;bestPrice;lastPrice;sleep=e=>new Promise(t=>setTimeout(t,e));close(){this.socket.close()}publish(){}async waitForReadyState(){let e=0;const t=5e3;for(;this.socket.readyState!==this.socket.OPEN&&e<t;)await this.sleep(10),e+=10;this.socket.readyState!==this.socket.OPEN&&console.error(`Socket with ${this.provider} didn't open within ${t/1e3} seconds`)}}export{r as G};
