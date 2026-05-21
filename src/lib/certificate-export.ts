import { Project, ProofRecord, TemplateMeta, PROOF_TYPES, getTemplateType } from "./store";

export type CertificateInput = {
  project: Project;
  proof: ProofRecord;
  meta: TemplateMeta;
};

function proofStatusLabel(status: ProofRecord["status"]) {
  if (status === "VERIFIED") return "Valid";
  if (status === "PENDING") return "Pending";
  return "Invalid";
}

function formatContract(appId: string) {
  const clean = appId.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length <= 10) return `0x${clean}`;
  return `0x${clean.slice(0, 3)}…${clean.slice(-4)}`;
}

/** Visily zkPass Proof Certificate — layout fixed; only data + seal center (Z→P logo) change */
export function buildCertificateHtml({ project, proof, meta }: CertificateInput, logoSrc = "/zkpass-logo.png"): string {
  const templateType = getTemplateType(project);
  const issued = new Date().toISOString().slice(0, 10);
  const certId = `ZK-2024-${proof.id.replace("PR-", "").padStart(4, "0")}`;
  const contract = formatContract(project.appId);
  const verifyUrl = `https://verify.zkpass.example/verify/${certId}`;
  const statusLabel = proofStatusLabel(proof.status);
  const risk = proof.status === "VERIFIED" ? "Low" : proof.status === "PENDING" ? "Medium" : "High";
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=${encodeURIComponent(verifyUrl)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>zkPass Proof Certificate</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #e8e8e8;
    padding: 24px;
    color: #222;
  }
  /* Certificate sheet — white document, not report density */
  .certificate {
    width: 794px;
    max-width: 100%;
    margin: 0 auto;
    background: #fff;
    padding: 32px 36px 36px;
    box-shadow: 0 1px 4px rgba(0,0,0,.12);
  }
  /* Header — Visily: large P logo, title, meta right */
  .cert-header {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 16px 20px;
    align-items: start;
    padding-bottom: 20px;
  }
  .cert-header .logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
  .cert-header h1 {
    font-size: 22px;
    font-weight: 700;
    color: #222;
    letter-spacing: -0.3px;
    margin-bottom: 10px;
  }
  .cert-header .sub {
    font-size: 13px;
    color: #444;
    line-height: 1.55;
  }
  .cert-header .meta {
    text-align: right;
    font-size: 13px;
    color: #444;
    line-height: 1.65;
    white-space: nowrap;
  }
  /* Sections — thin gray rule only (Visily) */
  .block {
    border-top: 1px solid #d8d8d8;
    padding: 14px 0 16px;
  }
  .block-title {
    font-size: 14px;
    font-weight: 700;
    color: #222;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .block-title img.icon {
    width: 16px;
    height: 16px;
    opacity: 0.55;
  }
  .block ul {
    margin: 0 0 8px 20px;
    font-size: 13px;
    line-height: 1.65;
    color: #333;
  }
  .block p.note {
    font-size: 13px;
    line-height: 1.6;
    color: #444;
    margin-top: 4px;
  }
  /* Tables — light gray header row (Visily) */
  table.data {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 4px;
  }
  table.data th {
    background: #f2f2f2;
    color: #333;
    font-weight: 600;
    text-align: left;
    padding: 7px 10px;
    border: 1px solid #e0e0e0;
  }
  table.data td {
    padding: 7px 10px;
    border: 1px solid #e8e8e8;
    color: #333;
    vertical-align: top;
  }
  table.data td.mono {
    font-family: Consolas, monospace;
    font-size: 11px;
    word-break: break-all;
  }
  table.data td.pass { color: #1a7f37; }
  table.data td.fail { color: #b42318; }
  /* Scope / Risk — circular badge with border (Visily) */
  .badge-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-top: 4px;
  }
  .circle-badge {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid #bdbdbd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #333;
    flex-shrink: 0;
    background: #fafafa;
  }
  /* Verification row */
  .verify-layout {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-top: 6px;
  }
  .verify-layout img.qr {
    width: 88px;
    height: 88px;
    border: 1px solid #e0e0e0;
  }
  .verify-layout a {
    font-size: 12px;
    color: #2563eb;
    word-break: break-all;
  }
  /* Signatures + seal — certificate footer (Visily) */
  .sign-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 8px;
    min-height: 120px;
  }
  .sigs {
    flex: 1;
    padding-right: 24px;
  }
  .sig-name {
    font-size: 13px;
    color: #333;
    margin-top: 36px;
    padding-top: 4px;
    border-top: 1px solid #999;
    max-width: 280px;
  }
  .sig-name:first-child { margin-top: 20px; }
  /* Official seal — Visily structure unchanged; center Z → logo P only */
  .official-seal {
    width: 110px;
    height: 110px;
    flex-shrink: 0;
    position: relative;
  }
  .seal-outer {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    border: 3px solid #7ec8e8;
    background: #f7fcff;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .seal-outer svg.text-ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .seal-outer img.seal-p-logo {
    width: 38px;
    height: 38px;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .certificate { box-shadow: none; width: 100%; }
  }
</style>
</head>
<body>
<div class="certificate">

  <!-- Header -->
  <div class="cert-header">
    <img class="logo" src="${logoSrc}" alt=""/>
    <div>
      <h1>zkPass Proof Certificate</h1>
      <div class="sub">
        Project: ${project.name}<br/>
        Contract: ${contract}
      </div>
    </div>
    <div class="meta">
      Cert ID: ${certId}<br/>
      Issued: ${issued}
    </div>
  </div>

  <!-- Summary of Findings -->
  <div class="block">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
      Summary of Findings
    </div>
    <ul>
      <li>${proof.status === "VERIFIED" ? "No critical vulnerabilities found." : proof.status === "PENDING" ? "Verification in progress." : "Critical verification failure detected."}</li>
      <li>${proof.status === "VERIFIED" ? "Minor issues patched." : proof.status === "PENDING" ? "Pending final attestation." : "Merkle root mismatch recorded."}</li>
    </ul>
    <p class="note">This certificate confirms the cryptographic verification using zero-knowledge proofs and integrity attestation for <strong>${proof.name}</strong> (${proof.ticker}, ${proof.amount}) without revealing underlying private data.</p>
  </div>

  <!-- Verification Details -->
  <div class="block">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
      Verification Details
    </div>
    <table class="data">
      <tr>
        <th>Proof Type</th>
        <th>Verifier</th>
        <th>Proof Status</th>
        <th>Proof Hash</th>
        <th>On-chain Tx</th>
      </tr>
      <tr>
        <td>Groth16</td>
        <td>zkPass Verifier v1.2</td>
        <td class="${statusLabel === "Valid" ? "pass" : statusLabel === "Invalid" ? "fail" : ""}">${statusLabel}</td>
        <td class="mono">${proof.merkleRoot}</td>
        <td class="mono">${proof.txHash}</td>
      </tr>
    </table>
  </div>

  <!-- Scope & Methodology -->
  <div class="block">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
      Scope &amp; Methodology
    </div>
    <div class="badge-layout">
      <div class="circle-badge">${risk}</div>
      <ul>
        <li>Smart contract logic review</li>
        <li>State transitions verification</li>
        <li>Unit testing</li>
        <li>Formal checks</li>
      </ul>
    </div>
  </div>

  <!-- Risk Level & Recommendations -->
  <div class="block">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Risk Level &amp; Recommendations
    </div>
    <div class="badge-layout">
      <div class="circle-badge">${risk}</div>
      <ul>
        <li>Regular monitoring.</li>
        <li>Implement multi-factor auth for critical operations.</li>
      </ul>
    </div>
  </div>

  <!-- Audit Evidence -->
  <div class="block">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
      Audit Evidence
    </div>
    <table class="data">
      <tr>
        <th>Activity</th>
        <th>Check</th>
        <th>Status</th>
        <th>Timestamp (Start)</th>
        <th>Timestamp (End)</th>
      </tr>
      <tr>
        <td>Unit tests</td>
        <td>${proof.ticker}</td>
        <td class="pass">Passed</td>
        <td>${proof.date} 08:00:00</td>
        <td>${proof.date} 10:15:00</td>
      </tr>
      <tr>
        <td>ZK-proof generation</td>
        <td>Fuzzing</td>
        <td class="${proof.status === "FAILED" ? "fail" : "pass"}">${proof.status === "FAILED" ? "Failed" : "Passed"}</td>
        <td>${proof.date} 14:30:00</td>
        <td>${proof.date} 14:31:00</td>
      </tr>
      <tr>
        <td>ZK-proof generation</td>
        <td>Formal</td>
        <td class="${proof.status === "FAILED" ? "fail" : "pass"}">${proof.status === "FAILED" ? "Failed" : "Passed"}</td>
        <td>${proof.date} 14:31:00</td>
        <td>${proof.date} 14:32:00</td>
      </tr>
    </table>
  </div>

  <!-- Verification -->
  <div class="block">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      Verification
    </div>
    <div class="verify-layout">
      <img class="qr" src="${qrImg}" alt="QR"/>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
  </div>

  <!-- Authorized Signatures -->
  <div class="block" style="border-bottom:none;">
    <div class="block-title">
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 9.5-9.5z"/></svg>
      Authorized Signatures
    </div>
    <div class="sign-footer">
      <div class="sigs">
        <div class="sig-name">Jane Doe</div>
        <div class="sig-name">John Smith — Lead Verifier, zkPass</div>
      </div>
      <div class="official-seal">
        <div class="seal-outer">
          <svg class="text-ring" viewBox="0 0 110 110">
            <defs>
              <path id="ring" d="M 55,55 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"/>
            </defs>
            <text font-size="8.5" font-weight="700" fill="#5ba3c6" font-family="Arial,sans-serif">
              <textPath href="#ring" startOffset="8%">zkPass Certified</textPath>
            </text>
          </svg>
          <img class="seal-p-logo" src="${logoSrc}" alt="P"/>
        </div>
      </div>
    </div>
  </div>

</div>
</body>
</html>`;
}

async function loadLogoDataUrl(): Promise<string> {
  try {
    const res = await fetch("/zkpass-logo.png");
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve("/zkpass-logo.png");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "/zkpass-logo.png";
  }
}

export async function downloadProofCertificate(input: CertificateInput) {
  const logoSrc = await loadLogoDataUrl();
  const html = buildCertificateHtml(input, logoSrc);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zkpass-certificate-${input.proof.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
