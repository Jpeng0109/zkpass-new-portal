import { Project, TEMPLATE_META, PROOF_TYPES, ProofRecord, getTemplateType } from "./store";

export type ReportPayload = {
  project: Project;
  generatedAt: string;
  proofs: ProofRecord[];
};

export function buildReportPayload(project: Project): ReportPayload {
  const meta = TEMPLATE_META[getTemplateType(project)];
  return {
    project,
    generatedAt: new Date().toISOString(),
    proofs: meta.proofs,
  };
}

export function buildReportHtml({ project, generatedAt, proofs }: ReportPayload): string {
  const templateType = getTemplateType(project);
  const meta = TEMPLATE_META[templateType];
  const verified = proofs.filter((p) => p.status === "VERIFIED").length;
  const pending = proofs.filter((p) => p.status === "PENDING").length;
  const failed = proofs.filter((p) => p.status === "FAILED").length;
  const dateStr = new Date(generatedAt).toLocaleString();

  const proofRows = proofs
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.ticker}</td>
        <td>${p.amount}</td>
        <td><span class="status-${p.status.toLowerCase()}">${p.status}</span></td>
        <td style="font-family:monospace;font-size:11px">${p.txHash.slice(0, 14)}…</td>
        <td>${p.date}</td>
      </tr>`,
    )
    .join("");

  const metricRows = meta.metricTitles
    .map(
      (title, i) => `
      <div class="metric-card">
        <div class="metric-label">${title}</div>
        <div class="metric-value">${meta.metricValues[i]}</div>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ZK Attestation Report — ${project.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f1115; color: #e8e8e8; padding: 40px; line-height: 1.5; }
    .header { border-bottom: 2px solid #9eff00; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { color: #9eff00; font-size: 14px; font-weight: 700; letter-spacing: 0.2em; }
    h1 { font-size: 28px; margin-top: 8px; }
    .subtitle { color: #888; font-size: 14px; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
    .meta-box { background: #1a1d24; border: 1px solid #2a2f3a; border-radius: 8px; padding: 16px; }
    .meta-label { font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase; }
    .meta-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
    .section-title { font-size: 12px; letter-spacing: 0.2em; color: #9eff00; margin-bottom: 16px; text-transform: uppercase; }
    .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 32px; }
    .metric-card { background: #1a1d24; border: 1px solid #2a2f3a; border-radius: 8px; padding: 14px; }
    .metric-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
    .metric-value { font-size: 18px; font-weight: 700; color: #9eff00; margin-top: 6px; }
    .summary { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .summary-item { background: #1a1d24; border-radius: 8px; padding: 12px 20px; border: 1px solid #2a2f3a; }
    .summary-num { font-size: 24px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; background: #1a1d24; color: #888; font-size: 10px; letter-spacing: 0.1em; border-bottom: 1px solid #2a2f3a; }
    td { padding: 10px 12px; border-bottom: 1px solid #22262e; }
    .status-verified { color: #9eff00; font-weight: 700; }
    .status-pending { color: #fbbf24; font-weight: 700; }
    .status-failed { color: #f87171; font-weight: 700; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #2a2f3a; font-size: 11px; color: #666; }
    @media print { body { background: white; color: #111; } .metric-value { color: #2d5a00; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ZKPASS PORTAL</div>
    <h1>${meta.pageTitle} — Attestation Report</h1>
    <p class="subtitle">${project.name} · ${PROOF_TYPES[templateType]} · Generated ${dateStr}</p>
  </div>

  <div class="meta-grid">
    <div class="meta-box"><div class="meta-label">Project ID</div><div class="meta-value">${project.id}</div></div>
    <div class="meta-box"><div class="meta-label">Application ID</div><div class="meta-value">${project.appId}</div></div>
    <div class="meta-box"><div class="meta-label">Project Owner</div><div class="meta-value">${project.owner}</div></div>
    <div class="meta-box"><div class="meta-label">Status</div><div class="meta-value">${project.status}</div></div>
    <div class="meta-box"><div class="meta-label">Total Spend (USD)</div><div class="meta-value">$${project.totalSpend.toLocaleString()}</div></div>
    <div class="meta-box"><div class="meta-label">Proof Volume</div><div class="meta-value">${project.proofAmount.toLocaleString()}</div></div>
    <div class="meta-box"><div class="meta-label">Verification Protocol</div><div class="meta-value">${meta.protocol}</div></div>
    <div class="meta-box"><div class="meta-label">Chart / Liability View</div><div class="meta-value">${meta.chartTitle}</div></div>
  </div>

  <div class="section-title">Template Core Metrics</div>
  <div class="metrics">${metricRows}</div>

  <div class="section-title">Proof Status Summary</div>
  <div class="summary">
    <div class="summary-item"><div class="summary-num" style="color:#9eff00">${verified}</div><div>Verified</div></div>
    <div class="summary-item"><div class="summary-num" style="color:#fbbf24">${pending}</div><div>Pending</div></div>
    <div class="summary-item"><div class="summary-num" style="color:#f87171">${failed}</div><div>Failed</div></div>
    <div class="summary-item"><div class="summary-num">${proofs.length}</div><div>Total Assets</div></div>
  </div>

  <div class="section-title">Attested Assets (${meta.assetUnit})</div>
  <table>
    <thead>
      <tr>
        <th>PROOF ID</th><th>ENTITY</th><th>IDENTIFIER</th><th>AMOUNT</th><th>STATUS</th><th>TX HASH</th><th>DATE</th>
      </tr>
    </thead>
    <tbody>${proofRows}</tbody>
  </table>

  <div class="footer">
    <p>This report was cryptographically generated by ZKPass Portal. Template: ${templateType}. Asset unit: ${meta.assetUnit}.</p>
    <p style="margin-top:8px">Confidential — For authorized auditors and project administrators only.</p>
  </div>
</body>
</html>`;
}

export function downloadProjectReport(project: Project, proofs?: ProofRecord[]) {
  const payload = proofs
    ? { project, generatedAt: new Date().toISOString(), proofs }
    : buildReportPayload(project);
  const html = buildReportHtml(payload);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = project.name.replace(/\s+/g, "-").toLowerCase();
  a.href = url;
  a.download = `zkpass-report-${slug}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
