import{G as i,S as o}from"./SocketHandlers.12fbb84e.js";class n extends i{constructor(e){super(e),this.publishUpdate=e,this.socket=new WebSocket("wss://v2api.coinflex.com/v2/websocket"),this.socket.onopen=s=>{console.debug(`Socket with ${this.provider} opened`,s)},this.socket.onmessage=s=>{console.debug(`message from ${this.provider}`,s);const t=JSON.parse(s.data);this.isRelevant(t)&&this.updateBestPrice(t)}}provider=o.COINFLEX;subscribe(e){const s=`${e.slice(0,3)}-${e.slice(3)}`,t=JSON.stringify({op:"subscribe",tag:103,args:[`depth:${s}-SWAP-LIN`]});console.debug(`Subscribing to ${e} on ${this.provider}`),this.socket.send(t)}unsubscribe(e){const s=`${e.slice(0,3)}-${e.slice(3)}`,t=JSON.stringify({op:"unsubscribe",tag:103,args:[`depth:${s}-SWAP-LIN`]});console.debug(`Unsubscribing from ${e} on ${this.provider}`),this.socket.send(t)}isRelevant(e){return e.table==="depth"&&e.data?.bids?.length>0&&e.data?.asks?.length>0}updateBestPrice(e){this.bestPrice={symbol:e.data.marketCode.substring(0,7).replaceAll("-",""),provider:this.provider,bid:e.data.bids[0][0],ask:e.data.asks[0][0]}}}export{n as default};
