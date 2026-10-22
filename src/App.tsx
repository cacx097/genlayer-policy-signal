import { useCallback, useEffect, useState } from "react";
import TransactionPanel from "./TransactionPanel";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { Activity, ArrowUpRight, CheckCircle2, CircleAlert, Clock3, FileText, GitBranch, Globe2, Layers3, RefreshCw, Scale, SearchCheck, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const POLICY = "0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2" as const;
const QUORUM = "0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a" as const;
const explorer = (address: string) => "https://explorer-studio.genlayer.com/address/" + address;

type PolicyData = { name: string; url: string; ready: boolean; baseline: string; assessment: string };
type QuorumData = { claim: string; sources: string; evaluated: boolean; assessment: string };
type LoadState = "idle" | "loading" | "ready" | "error";
type Section = "policy" | "evidence";

function statusSummary(content: string, label: string) {
  const raw = content.trim();
  if (!raw) return { label: "아직 분석 결과 없음", color: "neutral" };
  const match = raw.match(new RegExp("^" + label + "\\s*:\\s*([^\\n\\r]+)", "im"));
  return match ? { label: match[1].trim(), color: "good" } : { label: "분석 결과 저장됨", color: "good" };
}
function formatString(value: unknown): string { return typeof value === "string" ? value : String(value ?? ""); }
function formatBool(value: unknown): boolean { return value === true || value === "true"; }
function View({ content, empty }: { content: string; empty: string }) {
  return <div className={"result-pre " + (content ? "" : "empty")} role="region" aria-label={empty}>{content || empty}</div>;
}
function LinkOut({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="external" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14}/></a>;
}

export default function App() {
  const [section, setSection] = useState<Section>("policy");
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [quorum, setQuorum] = useState<QuorumData | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const refresh = useCallback(async () => {
    setState("loading");
    setErrors([]);
    try {
      // Read-only requests do not need a signing account or private key.
      const client = createClient({ chain: studionet });
      const read = async (address: typeof POLICY | typeof QUORUM, functionName: string) =>
        client.readContract({ address, functionName, args: [] });
      const tasks = await Promise.allSettled([
        Promise.all([
          read(POLICY, "get_policy_name"), read(POLICY, "get_source_url"),
          read(POLICY, "is_baseline_ready"), read(POLICY, "get_baseline_profile"),
          read(POLICY, "get_last_assessment")
        ]),
        Promise.all([
          read(QUORUM, "get_claim"), read(QUORUM, "get_sources"),
          read(QUORUM, "is_evaluated"), read(QUORUM, "get_last_assessment")
        ])
      ]);
      const issues: string[] = [];
      if (tasks[0].status === "fulfilled") {
        const [name, url, ready, baseline, assessment] = tasks[0].value;
        setPolicy({ name: formatString(name), url: formatString(url), ready: formatBool(ready), baseline: formatString(baseline), assessment: formatString(assessment) });
      } else { setPolicy(null); issues.push("PolicyGuard: " + String(tasks[0].reason)); }
      if (tasks[1].status === "fulfilled") {
        const [claim, sources, evaluated, assessment] = tasks[1].value;
        setQuorum({ claim: formatString(claim), sources: formatString(sources), evaluated: formatBool(evaluated), assessment: formatString(assessment) });
      } else { setQuorum(null); issues.push("SourceQuorum: " + String(tasks[1].reason)); }
      setErrors(issues);
      setState(issues.length === 2 ? "error" : "ready");
      setLastUpdated(new Date().toLocaleString("ko-KR"));
    } catch (error) {
      setPolicy(null); setQuorum(null);
      setErrors([String(error)]); setState("error");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  const activeAddress = section === "policy" ? POLICY : QUORUM;
  const activeReady = section === "policy" ? policy !== null : quorum !== null;

  return (
    <div className="shell">
      <aside className="sidebar">
        <a href="#" className="brand" aria-label="PolicySignal home">
          <span className="brand-mark"><Workflow size={22} strokeWidth={2.2}/></span>
          <span>Policy<span className="brand-accent">Signal</span><small>GENLAYER EVIDENCE CONSOLE</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav aria-label="워크스페이스 메뉴" className="nav">
          <button className={section === "policy" ? "nav-link selected" : "nav-link"} onClick={() => setSection("policy")}><Scale size={18}/> 정책 변경 판정 <span className="nav-dot"/></button>
          <button className={section === "evidence" ? "nav-link selected" : "nav-link"} onClick={() => setSection("evidence")}><SearchCheck size={18}/> 출처 독립성 검증 <span className="nav-dot"/></button>
        </nav>
        <div className="side-label second">ON-CHAIN SOURCES</div>
        <div className="chain-panel">
          <span className="chain-pulse"/><div><strong>GenLayer Studionet</strong><small>Chain ID 61999</small></div><Globe2 size={16}/>
        </div>
        <div className="side-bottom">
          <div className="side-info"><ShieldCheck size={17}/><span>검증 가능한 공개 기록</span></div>
          <p>판정은 브라우저가 아니라 GenLayer Intelligent Contract에 저장됩니다. 이 화면은 해당 상태를 실시간 조회합니다.</p>
          <LinkOut href="https://docs.genlayer.com/">GenLayer Docs</LinkOut>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{section === "policy" ? "Semantic policy monitor" : "Source corroboration"}</strong></div>
          <div className="top-actions"><span className="network-pill"><span/> STUDIONET</span><LinkOut href="https://studio.genlayer.com/">Studio</LinkOut></div>
        </header>

        <div className="content">
          <div className="eyebrow"><Sparkles size={14}/> INTELLIGENT CONTRACT APPLICATION</div>
          <div className="heading-row">
            <div><h1>{section === "policy" ? "정책이 바뀌었나요?" : "이 정보는 독립적으로 검증됐나요?"}</h1><p className="subtitle">{section === "policy" ? "단순한 문구 변경이 아닌, 사용자에게 중요한 실질적인 변경을 구분합니다." : "서로 다른 두 출처가 정말 독립적으로 같은 사실을 뒷받침하는지 확인합니다."}</p></div>
            <button className="refresh" onClick={() => void refresh()} disabled={state === "loading"}><RefreshCw size={16} className={state === "loading" ? "spin" : ""}/>{state === "loading" ? "불러오는 중" : "온체인 새로고침"}</button>
          </div>

          <div className="stat-grid">
            <div className="stat-card"><span className="stat-label">데이터 원본</span><strong>On-chain</strong><div className="stat-caption"><Layers3 size={14}/> GenLayer intelligent contracts</div></div>
            <div className="stat-card"><span className="stat-label">검증 방식</span><strong>Validator Consensus</strong><div className="stat-caption"><CheckCircle2 size={14}/> Equivalence Principle</div></div>
            <div className="stat-card"><span className="stat-label">네트워크 응답</span><strong className={state === "error" ? "bad" : ""}>{state === "loading" ? "Loading…" : activeReady ? "Connected" : state === "error" ? "Error" : "Awaiting data"}</strong><div className="stat-caption"><Activity size={14}/> {lastUpdated || "아직 동기화 전"}</div></div>
          </div>

          {errors.length > 0 && <div className="alert" role="alert"><CircleAlert size={20}/><div><strong>일부 온체인 데이터를 가져오지 못했습니다.</strong>{errors.map((msg, i) => <p key={i}>{msg}</p>)}<p>오류가 해결되기 전에는 저장된 결과를 추정해서 표시하지 않습니다.</p></div></div>}

          {section === "policy" ? <>
            <div className="panel-header"><div><div className="section-kicker">01 / POLICY MONITOR</div><h2>PolicyGuard</h2><p>GitHub Acceptable Use Policies의 고정 기준선과 최신 판정</p></div><span className={"pill " + (policy?.ready ? "pass" : "waiting")}>{policy?.ready ? "기준선 저장됨" : policy ? "기준선 미설정" : "조회 대기"}</span></div>
            <section className="panel intro">
              <div className="intro-text"><div className="label">감시 중인 정책</div><h3>{policy?.name || (state === "loading" ? "불러오는 중…" : "정책 정보 대기")}</h3><div className="muted">기준선을 다시 작성할 수 없는 불변성 보호 계약</div></div>
              {policy?.url?.startsWith("https://") && <LinkOut href={policy.url}>원본 정책 읽기</LinkOut>}
            </section>
            <div className="two-cols">
              <section className="panel data-panel"><div className="panel-top"><FileText size={18}/><h3>불변 기준선</h3><span className="mini">{policy?.ready ? "LOCKED" : "UNKNOWN"}</span></div><p>초기 합의로 확정된 핵심 정책 내용</p><View content={policy?.baseline || ""} empty={state === "loading" ? "온체인 기록을 확인하는 중…" : "확인된 기준선이 없습니다."}/></section>
              <section className="panel data-panel"><div className="panel-top"><Activity size={18}/><h3>최근 변경 판정</h3><span className="mini">LATEST</span></div><p>Validator가 검토한 최신 정책 변화 결과</p><div className="verdict"><div className="verdict-dot"/>{statusSummary(policy?.assessment || "", "VERDICT").label}</div><View content={policy?.assessment || ""} empty={state === "loading" ? "온체인 기록을 확인하는 중…" : "저장된 변경 판정이 없습니다."}/></section>
            </div>
            <TransactionPanel address={POLICY} method="check_for_material_change" title="정책 변경 판정 다시 실행하기"/>
            <section className="footnote"><ShieldCheck size={18}/><span>이 앱은 우선 읽기 전용입니다. 실질적 변경 검사는 네트워크 비용이 발생할 수 있는 <code>check_for_material_change()</code> 쓰기 거래이며, 본인의 명시적인 지갑 승인 없이 자동 실행하지 않습니다. 필요할 때 <LinkOut href="https://studio.genlayer.com/">GenLayer Studio</LinkOut>에서 실행할 수 있습니다.</span></section>
          </> : <>
            <div className="panel-header"><div><div className="section-kicker">02 / SOURCE CORROBORATION</div><h2>SourceQuorum</h2><p>서로 다른 출처의 진짜 독립성과 주장 뒷받침 여부</p></div><span className={"pill " + (quorum?.evaluated ? "pass" : "waiting")}>{quorum?.evaluated ? "합의 평가 완료" : quorum ? "아직 평가 전" : "조회 대기"}</span></div>
            <section className="panel intro"><div className="intro-text"><div className="label">검증 대상 주장</div><h3>{quorum?.claim || (state === "loading" ? "불러오는 중…" : "검증 주장 대기")}</h3><div className="muted">서로 다른 출판사가 독립적인 정보원이라는 보장은 없습니다.</div></div></section>
            <div className="two-cols">
              <section className="panel data-panel"><div className="panel-top"><Globe2 size={18}/><h3>확인 대상 출처</h3><span className="mini">2 SOURCES</span></div><p>계약에 저장된 두 공개 자료 URL</p><div className="sources">{(quorum?.sources || "").split("\n").filter(Boolean).map((s,i)=><div className="source" key={s}><span>출처 {String.fromCharCode(65+i)}</span>{s.startsWith("https://")?<LinkOut href={s}>{s}</LinkOut>:<span>{s}</span>}</div>)}{!quorum?.sources&&<span className="muted">출처를 확인하는 중입니다.</span>}</div></section>
              <section className="panel data-panel"><div className="panel-top"><GitBranch size={18}/><h3>독립성·증거 판정</h3><span className="mini">LATEST</span></div><p>단순한 교차 인용인지, 진짜 독립 검증인지 확인</p><div className="verdict"><div className="verdict-dot"/>{statusSummary(quorum?.assessment || "", "VERDICT").label}</div><View content={quorum?.assessment || ""} empty={state === "loading" ? "온체인 기록을 확인하는 중…" : "저장된 출처 검증 결과가 없습니다."}/></section>
            </div>
            <TransactionPanel address={QUORUM} method="evaluate" title="출처 독립성 다시 평가하기"/>
            <section className="footnote"><ShieldCheck size={18}/><span>저장된 최종 판정만 표시합니다. 새로운 출처나 주장을 평가하려면 새 SourceQuorum 인스턴스가 필요할 수 있으며 거래 비용이 발생할 수 있습니다.</span></section>
          </>}

          <div className="contract-row"><div><div className="section-kicker">PUBLIC CONTRACT</div><code>{activeAddress}</code></div><div className="contract-actions"><LinkOut href={explorer(activeAddress)}>Explorer</LinkOut><LinkOut href={section === "policy" ? "https://github.com/cacx097/genlayer-policy-guard" : "https://github.com/cacx097/genlayer-source-quorum"}>소스 코드</LinkOut></div></div>
          <footer>PolicySignal · A GenLayer builder project candidate · No simulated or invented decisions <Clock3 size={13}/></footer>
        </div>
      </main>
    </div>
  );
}
