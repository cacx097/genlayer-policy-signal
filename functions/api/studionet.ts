// Cloudflare Pages Function: bounded, read-only GenLayer RPC bridge.
// No secrets, wallet operations, transactions, or arbitrary destination URLs.
const RPC = "https://studio.genlayer.com/api";
export async function onRequestPost(context: { request: Request }): Promise<Response> {
  try {
    const request = context.request;
    if (Number(request.headers.get("content-length") ?? "0") > 16000) return new Response("Request too large", {status:413});
    const raw = await request.text();
    if (raw.length > 16000) return new Response("Request too large", {status:413});
    const json: unknown = JSON.parse(raw);
    if (!json || typeof json !== "object" || Array.isArray(json)) return new Response("Invalid request",{status:400});
    const payload = json as {jsonrpc?:unknown;method?:unknown;params?:unknown;id?:unknown};
    if (payload.jsonrpc !== "2.0" || payload.method !== "gen_call" || !Array.isArray(payload.params) || payload.params.length > 6)
      return new Response("Read-only gen_call required",{status:403});
    if (typeof payload.id !== "number" && typeof payload.id !== "string") return new Response("Invalid request ID",{status:400});
    const upstream = await fetch(RPC, { method:"POST", headers: {"content-type":"application/json"}, body:raw, signal:AbortSignal.timeout(15000) });
    return new Response(upstream.body,{status:upstream.status,headers:{"content-type":"application/json","cache-control":"no-store"}});
  } catch {
    return new Response("GenLayer RPC currently unavailable",{status:502});
  }
}
export async function onRequest():Promise<Response>{return new Response("POST only",{status:405});}
