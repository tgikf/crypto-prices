class o{socket;provider;subscribedSymbols;sleep=e=>new Promise(t=>setTimeout(t,e));async waitForReadyState(){let e=0;const t=5e3;for(;this.socket.readyState!==this.socket.OPEN&&e<t;)await this.sleep(10),e+=10;this.socket.readyState!==this.socket.OPEN&&console.error(`Socket with ${this.provider} didn't open within ${t/1e3} seconds`)}}export{o as G};
