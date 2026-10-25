import { useEffect, useState } from "react";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ArrowDownToLine, CheckCircle2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { buildEvidenceBundle, findChangedFields, INITIAL_CONTRACTS, MAX_ENTRIES, MAX_SNAPSHOTS, normalizedAddress, parseEntries, parseSnapshots, REGISTRY_KEY, SNAPSHOT_KEY, type ContractKind, type RegistryEntry, type Snapshot } from "./portfolioModel";

type Result = { fields: Record<string,string>; error?: string; observedAt: string };
const METHODS: Record<ContractKind,string[]> = {
  policy: ["get_policy_name","get_source_url","is_baseline_ready","get_baseline_profile","get_last_assessment"],
  quorum: ["get_claim","get_sources","is_evaluated","get_last_assessment"]
};
function safeLoad<T>(key:string, parse:(raw:unknown)=>T, fallback:T):T {
  try { const raw=localStorage.getItem(key); return raw===null?fallback:parse(JSON.parse(raw)); }
  catch {return fallback;}
}
function downloadJson(filename:string, object:unknown) {
  const blob=new Blob([JSON.stringify(object,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=filename;a.click();
  URL.revokeObjectURL(url);
}
export default function Portfolio() {
  const [entries,setEntries]=useState<RegistryEntry[]>(()=>safeLoad(REGISTRY_KEY,parseEntries,parseEntries(INITIAL_CONTRACTS)));
  const [snapshots,setSnapshots]=useState<Snapshot[]>(()=>safeLoad(SNAPSHOT_KEY,parseSnapshots,[]));
  const [results,setResults]=useState<Record<string,Result>>({});
  const [label,setLabel]=useState("");
  const [address,setAddress]=useState("");
  const [kind,setKind]=useState<ContractKind>("policy");
  const [message,setMessage]=useState("");
  const [pending,setPending]=useState<string|null>(null);
  useEffect(()=>{try{localStorage.setItem(REGISTRY_KEY,JSON.stringify(entries));}catch{setMessage("브라우저 저장 공간에 주소 목록을 저장하지 못했습니다.");}},[entries]);
  useEffect(()=>{try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshots));}catch{setMessage("스냅샷 저장 실패: 브라우저 저장 공간을 확인하세요.");}},[snapshots]);
  function add() {
    const valid=normalizedAddress(address);
    if(!valid){setMessage("정확한 0x + 40자리 계약 주소를 입력하세요.");return;}
    if(!label.trim()){setMessage("구별 가능한 이름을 입력하세요.");return;}
    if(entries.some(e=>e.address.toLowerCase()===valid.toLowerCase())){setMessage("이미 등록된 계약 주소입니다.");return;}
    if(entries.length>=MAX_ENTRIES){setMessage("계약은 최대 "+MAX_ENTRIES+"개까지 등록할 수 있습니다.");return;}
    setEntries(old=>[...old,{address:valid,kind,label:label.trim().slice(0,80)}]);
    setAddress("");setLabel("");setMessage("등록 완료. 온체인 조회 버튼을 눌러 검증하세요.");
  }
  async function inspect(entry:RegistryEntry) {
    if(pending!==null)return;
    setPending(entry.address);setMessage("");
    try{
      const chain = { ...studionet, rpcUrls: { default: { http: [window.location.origin + "/api/studionet"] } } };
      const client=createClient({chain});
      const values: Array<readonly [string, string]> = [];
      for (const functionName of METHODS[entry.kind]) {
        const value = await client.readContract({ address: entry.address, functionName, args: [] });
        values.push([functionName, String(value ?? "")] as const);
      }
      const fields=Object.fromEntries(values);
      setResults(prev=>({...prev,[entry.address]:{fields,observedAt:new Date().toISOString()}}));
    }catch(error){
      setResults(prev=>({...prev,[entry.address]:{fields:{},observedAt:new Date().toISOString(),error:String(error)}}));
    }finally{setPending(null);}
  }
  function capture(entry:RegistryEntry) {
    const result=results[entry.address];if(!result||result.error||!Object.keys(result.fields).length)return;
    const now:Snapshot={address:entry.address,kind:entry.kind,observedAt:result.observedAt,fields:{...result.fields}};
    setSnapshots(old=>[now,...old].slice(0,MAX_SNAPSHOTS));
    setMessage("현재 조회 결과를 이 브라우저에 저장했습니다. 온체인 트랜잭션은 발생하지 않습니다.");
  }
  return <section className="portfolio">
    <div className="section-kicker">03 / CONTRACT PORTFOLIO · V2</div>
    <h2>계약 포트폴리오와 변경 이력</h2>
    <p className="subtitle">새 계약 주소를 추가해 실제 GenLayer 데이터를 조회하고, 저장한 스냅샷과 차이를 비교하거나 검증 보고서를 내보낼 수 있습니다. 브라우저 저장만 사용하며 자동 트랜잭션은 없습니다.</p>
    <div className="portfolio-form">
      <label>계약 이름<input aria-label="계약 이름" value={label} maxLength={80} onChange={e=>setLabel(e.target.value)} placeholder="예: 두 번째 PolicyGuard"/></label>
      <label>GenLayer 계약 주소<input aria-label="GenLayer 계약 주소" value={address} onChange={e=>setAddress(e.target.value)} placeholder="0x... (40자리)"/></label>
      <label>계약 종류<select aria-label="계약 종류" value={kind} onChange={e=>setKind(e.target.value as ContractKind)}><option value="policy">PolicyGuard</option><option value="quorum">SourceQuorum</option></select></label>
      <button className="tx-submit" onClick={add} disabled={entries.length>=MAX_ENTRIES}><Plus size={16}/> 계약 추가</button>
    </div>
    {message&&<p className="portfolio-msg" role="status">{message}</p>}
    <div className="portfolio-grid">{entries.map(entry=>{
      const result=results[entry.address];
      const history=snapshots.filter(s=>s.address===entry.address&&s.kind===entry.kind);
      const prior=history[0];
      const diff=result&&!result.error&&prior?findChangedFields(prior.fields,result.fields):[];
      return <article className="panel portfolio-card" key={entry.address}>
        <div className="portfolio-heading"><div><span className="label">{entry.kind==="policy"?"POLICY GUARD":"SOURCE QUORUM"}</span><h3>{entry.label}</h3></div><button aria-label={entry.label+" 삭제"} className="icon-btn" onClick={()=>{setEntries(v=>v.filter(x=>x.address!==entry.address));setSnapshots(v=>v.filter(x=>x.address!==entry.address));}}><Trash2 size={16}/></button></div>
        <div className="portfolio-address"><a href={"https://explorer-studio.genlayer.com/address/"+entry.address} rel="noopener noreferrer" target="_blank">{entry.address}</a></div>
        <div className="portfolio-actions"><button onClick={()=>void inspect(entry)} disabled={pending!==null}><RefreshCw size={14}/> {pending===entry.address?"조회 중…":"온체인 조회"}</button><button onClick={()=>capture(entry)} disabled={!result||!!result.error||!Object.keys(result.fields).length}><CheckCircle2 size={14}/> 스냅샷 저장</button><button disabled={!result||!!result.error||!Object.keys(result.fields).length} onClick={()=>result&&!result.error&&downloadJson("policysignal-"+entry.kind+"-"+entry.address.slice(2,10)+".json",buildEvidenceBundle(entry,result.fields,prior))}><ArrowDownToLine size={14}/> 증빙 내보내기</button></div>
        {result?.error&&<div role="alert" className="portfolio-error">조회 실패: {result.error}</div>}
        {result&&!result.error&&<><p className="portfolio-summary">{Object.keys(result.fields).length}개 실제 함수 조회 성공 · {new Date(result.observedAt).toLocaleString("ko-KR")}</p><details><summary>실제 계약 응답 보기</summary><pre className="portfolio-pre">{JSON.stringify(result.fields,null,2)}</pre></details></>}
        <div className="portfolio-snapshot">{prior?<><strong>최근 저장: {new Date(prior.observedAt).toLocaleString("ko-KR")}</strong><div>{result&&!result.error?(diff.length?("달라진 항목: "+diff.join(", ")):"저장 시점과 조회 내용 동일"):"새 조회 후 스냅샷과 비교할 수 있습니다."}</div><details><summary>이전 기록 보기 ({history.length}개)</summary>{history.map((s,i)=><div key={s.observedAt+i} className="portfolio-history">{new Date(s.observedAt).toLocaleString("ko-KR")} · {Object.keys(s.fields).length} fields</div>)}</details></>:<span>아직 저장된 기록이 없습니다.</span>}</div>
      </article>;
    })}</div>
    <p className="portfolio-disclaimer">스냅샷은 사용 중인 브라우저에만 보관됩니다. 조회 결과는 계약이 마지막으로 저장한 값이며, 스냅샷 차이는 새 GenLayer 검증 결과가 아닙니다. 삭제·브라우저 데이터 초기화 시 복구되지 않습니다.</p>
  </section>;
}
