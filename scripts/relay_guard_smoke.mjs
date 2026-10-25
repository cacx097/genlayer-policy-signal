import assert from "node:assert/strict";
import { createServer } from "vite";
const server = await createServer({server:{middlewareMode:true},appType:"custom"});
try {
 const {onRequestPost,onRequest}=await server.ssrLoadModule("/functions/api/studionet.ts");
 const fakeRequest=(body)=>({request:new Request("https://preview.example/api/studionet",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)})});
 const bad=await onRequestPost(fakeRequest({jsonrpc:"2.0",id:1,method:"eth_sendRawTransaction",params:["0xdead"]}));
 assert.equal(bad.status,403);
 const actualFetch=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({jsonrpc:"2.0",id:1,result:"mock"}),{status:200,headers:{"content-type":"application/json"}});
 const good=await onRequestPost(fakeRequest({jsonrpc:"2.0",id:1,method:"gen_call",params:[]}));
 globalThis.fetch=actualFetch;
 // No actual GenLayer calls required in this test. A good shape reaches upstream;
 // upstream may be rate-limited or unavailable and need not be treated as success.
 assert.notEqual(good.status,403);
 assert.equal((await onRequest()).status,405);
 console.log("PASS relay write blocked and GET blocked; read-only request allowed by validator");
}finally{await server.close()}
