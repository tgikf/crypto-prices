import{G as r}from"./GenericSocketHandler.d4f321a3.js";import o from"./SocketHandlers.0ffd5406.js";class d extends r{provider=o.COINBASE;constructor(){super(),this.socket=new WebSocket("wss://ws-feed.exchange.coinbase.com"),this.socket.onopen=e=>{console.debug(`Socket with ${this.provider} opened`,e)},this.socket.onmessage=e=>{console.debug(`message from ${this.provider}`,e);const s=JSON.parse(e.data);this.isRelevant(s)&&postMessage(this.getFormattedPriceUpdate(s))}}subscribe(e){const s=`${e.slice(0,3)}-${e.slice(3)}`,t=JSON.stringify({type:"subscribe",product_ids:[s],channels:["ticker"]});console.debug(`Subscribing to ${e} level2 on ${this.provider}`),this.socket.send(t)}unsubscribe(e){const s=`${e.slice(0,3)}-${e.slice(3)}`,t=JSON.stringify({type:"unsubscribe",product_ids:[s],channels:["ticker"]});console.debug(`Unsubscribing from ${e} level2 on ${this.provider}`),this.socket.send(t)}isRelevant(e){return e.type==="ticker"}isUpdateDue(e){return!0}getFormattedPriceUpdate(e){return{symbol:e.product_id.replaceAll("-",""),provider:this.provider,bid:e.best_bid,ask:e.best_ask}}}export{d as default};