class o{socket;provider;subscribedSymbols;bestPrices={};lastPrice={};constructor(s){setInterval(()=>{for(const[,e]of Object.entries(this.bestPrices))e?.symbol&&e!==this.lastPrice[e.symbol]&&(this.lastPrice[e.symbol]=e,s(e))},150)}sleep=s=>new Promise(e=>setTimeout(e,s));close(){this.socket.close()}async waitForReadyState(){let s=0;const e=5e3;for(;this.socket.readyState!==this.socket.OPEN&&s<e;)await this.sleep(10),s+=10;this.socket.readyState!==this.socket.OPEN&&console.error(`Socket with ${this.provider} didn't open within ${e/1e3} seconds`)}}var i=(t=>(t.BINANCE="Binance",t.COINBASE="Coinbase",t.COINFLEX="CoinFLEX",t.BITMEX="BitMEX",t))(i||{});export{o as G,i as S};
