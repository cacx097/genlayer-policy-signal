import { useState } from "react";
import { AlertTriangle, ArrowUpRight, ClipboardCopy, ShieldCheck } from "lucide-react";

type Props = {
  address: `0x${string}`;
  method: "check_for_material_change" | "evaluate";
  title: string;
};

export default function TransactionPanel({ address, method, title }: Props) {
  const [copied, setCopied] = useState(false);
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch { setCopied(false); }
  }

  return (
    <section className="transaction-panel" aria-label={title}>
      <div className="tx-heading">
        <span className="tx-icon"><ShieldCheck size={19}/></span>
        <div><h3>{title}</h3><p>원본 GenLayer 계약으로 직접 실행</p></div>
      </div>
      <p className="tx-context">새로운 판정은 읽기 요청이 아닌, GEN 등의 합의 수수료가 발생할 수 있는 거래입니다. 현재 앱에서는 임의 거래를 만들거나 지갑을 자동으로 연결하지 않습니다.</p>
      <div className="tx-quote">
        <div className="tx-quote-row"><span>계약 주소</span><code>{address}</code></div>
        <div className="tx-quote-row"><span>실행 함수</span><code>{method}()</code></div>
        <div className="tx-warning"><AlertTriangle size={17}/><span>GenLayer Studio에서 <strong>Send Transaction</strong>을 누르기 전 수수료·권한을 확인하세요. <strong>ACCEPTED</strong> 표시만으로는 성공이 아닙니다. 거래 상세의 <strong>Result: SUCCESS</strong>를 확인해야 합니다.</span></div>
        <div className="tx-controls">
          <button className="tx-cancel" onClick={() => void copyAddress()}><ClipboardCopy size={15}/>{copied ? "주소 복사됨" : "계약 주소 복사"}</button>
          <a className="tx-submit" href="https://studio.genlayer.com/" target="_blank" rel="noopener noreferrer"><ArrowUpRight size={15}/> GenLayer Studio 열기</a>
        </div>
      </div>
    </section>
  );
}
