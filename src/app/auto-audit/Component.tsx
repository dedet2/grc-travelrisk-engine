"use client";
import { useState, useRef } from "react";

// ─── Brand ─────────────────────────────────────────────────────
const B = {
  heroGrad: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGrad:  "linear-gradient(to right, #9333ea, #0891b2)",
  purple: "#9333ea", purple5: "#a855f7", cyan: "#0891b2",
  bg: "#f9fafb", card: "#ffffff", dark: "#0f0a1e",
  gray600: "#4b5563", gray700: "#374151", gray800: "#1f2937",
};

// ─── Config (replace with your values) ─────────────────────────
const CONFIG = {
  calendlyUrl:   "https://calendly.com/dr-dede/ai-equity-intensive",
  stripeLink2500: "https://buy.stripe.com/REPLACE_2500_LINK",
  stripeLink5000: "https://buy.stripe.com/REPLACE_5000_LINK",
  fromEmail:     "hello@incluu.us",
  drDedeSignature: "Dr. Dédé Tetsubayashi | Cornell PhD | Former Meta/Salesforce/Indeed Executive | TEDx Speaker",
};

// ─── The auto-audit system prompt ─────────────────────────────
const AUDIT_SYSTEM_PROMPT = `You are Dr. Dédé Tetsubayashi's AI governance analysis engine. Dr. Dédé is a Cornell PhD in Socio-cultural Anthropology, former executive at Meta, Salesforce, Indeed, WeWork, and Rakuten, and TEDx speaker specializing in AI equity and responsible tech.

Generate a comprehensive AI Equity Assessment report that would be delivered as part of a $2,500–$5,000 consulting engagement. The report should be deeply analytical, cite specific regulatory requirements by article number, and provide concrete, actionable recommendations.

Your output must be structured JSON matching the following schema exactly:
{
  "executive_summary": "3-4 sentence strategic overview with risk level and key finding",
  "org_profile": { "name": string, "industry": string, "size": string, "risk_tier": "Critical|High|Medium|Low" },
  "composite_score": number (0-100, lower is better governance),
  "risk_dimensions": [
    { "name": string, "score": number, "level": "Critical|High|Medium|Low", "key_finding": string }
  ],
  "regulatory_gaps': [
    { "framework": string, "article": string, "gap": string, "severity": "Critical|High|Medium", "remediation": string, "timeline": string }
  ],
  "ai_system_risks": [
    { "system": string, "eu_act_class": string, "bias_vector": string, "risk_level": string, "top_risk": string, "control": string }
  ],
  "roadmap": {
    "30_day": [{ "action": string, "owner": string, "effort": "Low|Medium|High", "impact": "Low|Medium|High" }],
    "60_day": [{ "action": string, "owner": string, "effort": "Low|Medium|High", "impact": "Low|Medium|High" }],
    "90_day": [{ "action": string, "owner": string, "effort": "Low|Medium|High", "impact": "Low|Medium|High" }]
  },
  "financial_exposure": {
    "total_low": string,
    "total_high": string,
    "scenarios": [{ "regulation": string, "violation": string, "exposure": string, "probability": "Low|Medium|High" }],
    "roi_statement": string
  },
  "report_metadata": {
    "generated_date": string,
    "analyst": "Dr. Dédé Tetsubayashi, Cornell PhD",
    "methodology": "Incluu AI Equity Assessment Framework v2.0",
    "disclaimer": "This report is for informational purposes and does not constitute legal advice."
  }
}`;

// ─── Report rendering helpers ──────────────────────────────────
const RISK_COLORS = {
  Critical: { bg: "#fee2e2", border: "#fecaca", text: "#b91c1c", badge: "#ef4444" },
  High:     { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", badge: "#f97316" },
  Medium:   { bg: "#fef9c3", border: "#fde047", text: "#a16207", badge: "#eab308" },
  Low:      { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", badge: "#22c55e" },
};

function RiskBadge({ level }) {
  const c = RISK_COLORS[level] || RISK_COLORS.Medium;
  return (
    <span style={{ background: c.bg, color: c.badge, border: `1px solid ${c.border}`, borderRadius: "50px", padding: "0.15rem 0.55rem", fontSize: "0.65rem", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {level}
    </span>
  );
}

function Section({ title, children, icon }) {
  return (
    <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.75rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
        {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: B.gray800 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Full Report component ─────────────────────────────────────
function FullReport({ report, orgName }) {
  const printRef = useRef();

  const handleDownload = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Equity Assessment — ${orgName}</title>
  <style>
    body { font-family: 'DM Sans', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1f2937; }
    h1 { background: linear-gradient(135deg, #9333ea, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .section { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .badge { display: inline-block; border-radius: 50px; padding: 2px 10px; font-size: 11px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9fafb; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; }
    td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div style="text-align:center; padding: 2rem 0 1rem;">
    <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">AI Equity Assessment</h1>
    <p style="color: #6b7280; margin: 0;">${orgName} · Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p style="color: #9333ea; font-weight: 700; margin-top: 0.5rem;">Prepared by Dr. Dédé Tetsubayashi | Incluu AI Governance</p>
  </div>
  
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${report.executive_summary}</p>
    <p><strong>Composite Risk Score:</strong> ${report.composite_score}/100 — <strong>${report.org_profile?.risk_tier}</strong></p>
  </div>
  
  <div class="section">
    <h2>Risk Dimensions</h2>
    <table>
      <thead><tr><th>Dimension</th><th>Score</th><th>Level</th><th>Key Finding</th></tr></thead>
      <tbody>
        ${(report.risk_dimensions || []).map(d => `<tr><td><strong>${d.name}</strong></td><td>${d.score}/100</td><td>${d.level}</td><td>${d.key_finding}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Regulatory Gap Analysis</h2>
    <table>
      <thead><tr><th>Framework</th><th>Article</th><th>Gap</th><th>Severity</th><th>Remediation</th></tr></thead>
      <tbody>
        ${(report.regulatory_gaps || []).map(g => `<tr><td>${g.framework}</td><td>${g.article}</td><td>${g.gap}</td><td>${g.severity}</td><td>${g.remediation} (${g.timeline})</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>30/60/90 Day Remediation Roadmap</h2>
    ${['30_day', '60_day', '90_day'].map((phase, i) => `
      <h3>Days ${i === 0 ? '1-30' : i === 1 ? '31-60' : '61-90'}</h3>
      <table>
        <thead><tr><th>Action</th><th>Owner</th><th>Effort</th><th>Impact</th></tr></thead>
        <tbody>${(report.roadmap?.[phase] || []).map(a => `<tr><td>${a.action}</td><td>${a.owner}</td><td>${a.effort}</td><td>${a.impact}</td></tr>`).join('')}</tbody>
      </table>
    `).join('')}
  </div>
  
  <div class="section">
    <h2>Financial Exposure Estimate</h2>
    <p><strong>Estimated Total Exposure:</strong> ${report.financial_exposure?.total_low} – ${report.financial_exposure?.total_high}</p>
    ${report.financial_exposure?.roi_statement ? `<p><em>${report.financial_exposure.roi_statement}</em></p>` : ''}
    <table>
      <thead><tr><th>Regulation</th><th>Violation</th><th>Exposure</th><th>Probability</th></tr></thead>
      <tbody>
        ${(report.financial_exposure?.scenarios || []).map(s => `<tr><td>${s.regulation}</td><td>${s.violation}</td><td>${s.exposure}</td><td>${s.probability}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <p>${report.report_metadata?.disclaimer || ''}</p>
    <p>Generated by Incluu AI Governance Platform | ${CONFIG.drDedeSignature}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Equity-Assessment-${orgName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`AI Equity Assessment Report — ${orgName}`);
    const body = encodeURIComponent(`Hi,\n\nPlease find attached your AI Equity Assessment report for ${orgName}.\n\nKey findings:\n• Composite Risk Score: ${report.composite_score}/100 (${report.org_profile?.risk_tier})\n• ${(report.regulatory_gaps || []).length} regulatory gaps identified\n• Estimated exposure: ${report.financial_exposure?.total_low} – ${report.financial_exposure?.total_high}\n\nI look forward to our 90-minute session to walk through the findings in detail.\n\nWarm regards,\n${CONFIG.drDedeSignature}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Report header */}
      <div style={{ background: B.dark, borderRadius: "1rem", padding: "2rem", marginBottom: "1.5rem", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(168,85,247,0.8)", marginBottom: "0.5rem" }}>
              AI Equity Assessment Report
            </div>
            <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.5rem", fontWeight: "900" }}>{orgName}</h2>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              <span>Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>By Dr. Dédé Tetsubayashi</span>
              <span>Incluu AI Governance Platform</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: "900", color: RISK_COLORS[report.org_profile?.risk_tier]?.badge || "#f97316", lineHeight: 1 }}>
                {report.composite_score}
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>/ 100 Risk Score</div>
            </div>
            <RiskBadge level={report.org_profile?.risk_tier || "High"} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: B.btnGrad, color: "#fff", border: "none", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>
          ↓ Download HTML Report
        </button>
        <button onClick={sendEmail} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: "#fff", border: "1.5px solid #e5e7eb", color: B.gray700, fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>
          ✉ Email to Client
        </button>
        <a href={CONFIG.calendlyUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: "rgba(147,51,234,0.08)", border: "1.5px solid rgba(147,51,234,0.25)", color: B.purple, fontWeight: "700", fontSize: "0.85rem", textDecoration: "none" }}>
          📅 Book 90-min Session
        </a>
      </div>

      {/* Executive Summary */}
      <Section title="Executive Summary" icon="📋">
        <p style={{ fontSize: "0.9rem", lineHeight: "1.7", color: B.gray700, margin: 0 }}>{report.executive_summary}</p>
      </Section>

      {/* Risk Dimensions */}
      <Section title="5-Dimension Risk Radar" icon="🎯">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {(report.risk_dimensions || []).map((dim, i) => {
            const c = RISK_COLORS[dim.level] || RISK_COLORS.Medium;
            return (
              <div key={i} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: "0.75rem", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.85rem", color: c.text }}>{dim.name}</span>
                  <RiskBadge level={dim.level} />
                </div>
                <div style={{ fontWeight: "900", fontSize: "1.75rem", color: c.badge, marginBottom: "0.3rem" }}>
                  {dim.score}<span style={{ fontSize: "1rem", fontWeight: "500", color: c.text }}>/100</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: c.text, lineHeight: "1.5" }}>{dim.key_finding}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Regulatory Gaps */}
      <Section title="Regulatory Gap Analysis" icon="⚖️">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr>
                {["Framework", "Article", "Gap", "Severity", "Remediation", "Timeline"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: B.gray600, borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(report.regulatory_gaps || []).map((gap, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem", fontWeight: "600", color: B.gray800, whiteSpace: "nowrap" }}>{gap.framework}</td>
                  <td style={{ padding: "0.75rem", fontFamily: "monospace", fontSize: "0.78rem", color: B.gray600 }}>{gap.article}</td>
                  <td style={{ padding: "0.75rem", color: B.gray700, maxWidth: "200px" }}>{gap.gap}</td>
                  <td style={{ padding: "0.75rem" }}><RiskBadge level={gap.severity} /></td>
                  <td style={{ padding: "0.75rem", color: B.gray700, maxWidth: "200px" }}>{gap.remediation}</td>
                  <td style={{ padding: "0.75rem", color: B.gray600, whiteSpace: "nowrap" }}>{gap.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* AI System Risks */}
      <Section title="AI System Risk Register" icon="🤖">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {(report.ai_system_risks || []).map((sys, i) => {
            const c = RISK_COLORS[sys.risk_level] || RISK_COLORS.Medium;
            return (
              <div key={i} style={{ border: `1.5px solid ${c.border}`, borderTop: `3px solid ${c.badge}`, borderRadius: "0.75rem", padding: "1rem", background: c.bg + "50" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.9rem", color: B.gray800 }}>{sys.system}</span>
                  <RiskBadge level={sys.risk_level} />
                </div>
                <div style={{ fontSize: "0.75rem", color: B.gray600, marginBottom: "0.5rem" }}>
                  <span style={{ background: "#e5e7eb", borderRadius: "4px", padding: "0.1rem 0.4rem", marginRight: "0.4rem" }}>{sys.eu_act_class}</span>
                  <span>Bias: {sys.bias_vector}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: c.text, marginBottom: "0.4rem" }}>⚠ {sys.top_risk}</div>
                <div style={{ fontSize: "0.78rem", color: B.gray700 }}>✓ {sys.control}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Roadmap */}
      <Section title="30/60/90 Day Remediation Roadmap" icon="🗺">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {[
            { key: "30_day", label: "Days 1–30", color: "#ef4444", bg: "#fef2f2" },
            { key: "60_day", label: "Days 31–60", color: "#f97316", bg: "#fff7ed" },
            { key: "90_day", label: "Days 61–90", color: "#22c55e", bg: "#f0fdf4" },
          ].map(({ key, label, color, bg }) => (
            <div key={key} style={{ background: bg, border: `1.5px solid ${color}30`, borderRadius: "0.875rem", padding: "1.25rem" }}>
              <div style={{ fontWeight: "800", fontSize: "0.85rem", color, marginBottom: "1rem" }}>{label}</div>
              {(report.roadmap?.[key] || []).map((action, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.7)", borderRadius: "0.5rem", padding: "0.65rem 0.75rem", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: "600", color: B.gray800, marginBottom: "0.25rem" }}>{action.action}</div>
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.7rem", color: B.gray600 }}>
                    <span>👤 {action.owner}</span>
                    <span>· Effort: {action.effort}</span>
                    <span>· Impact: {action.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* Financial Exposure */}
      <Section title="Financial Exposure Estimate" icon="💰">
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1.5px solid rgba(239,68,68,0.15)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: B.gray600, marginBottom: "0.35rem" }}>Estimated Regulatory Exposure</div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#b91c1c" }}>
            {report.financial_exposure?.total_low} – {report.financial_exposure?.total_high}
          </div>
          {report.financial_exposure?.roi_statement && (
            <div style={{ fontSize: "0.82rem", color: "#16a34a", marginTop: "0.5rem", fontStyle: "italic" }}>
              ✓ {report.financial_exposure.roi_statement}
            </div>
          )}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr>
              {["Regulation", "Violation", "Exposure", "Probability"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: B.gray600, borderBottom: "2px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(report.financial_exposure?.scenarios || []).map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.75rem", fontWeight: "600" }}>{s.regulation}</td>
                <td style={{ padding: "0.75rem", color: B.gray700 }}>{s.violation}</td>
                <td style={{ padding: "0.75rem", fontWeight: "700", color: "#b91c1c" }}>{s.exposure}</td>
                <td style={{ padding: "0.75rem" }}><RiskBadge level={s.probability} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Footer CTA */}
      <div style={{ background: B.dark, borderRadius: "1rem", padding: "2rem", textAlign: "center", color: "#fff", marginTop: "2rem" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "900", marginBottom: "0.5rem" }}>
          Ready to remediate?
        </div>
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
          Book your 90-minute AI Equity Intensive session with Dr. Dédé to walk through this report and build your remediation plan.
        </div>
        <a href={CONFIG.calendlyUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.85rem 2rem", borderRadius: "0.625rem", background: B.btnGrad, color: "#fff", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem", boxShadow: "0 4px 14px rgba(147,51,234,0.4)" }}>
          Book Your Session → $2,500 or $5,000
        </a>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function AutoAuditAgent() {
  const [step, setStep]       = useState("intake");  // intake | payment | generating | report
  const [tier, setTier]       = useState("standard"); // standard ($2,500) | enhanced ($5,000)
  const [report, setReport]   = useState(null);
  const [error, setError]     = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");

  // Form state
  const [form, setForm] = useState({
    orgName: "", industry: "", employees: "", aiSystems: "",
    regulations: [], maturity: "", incidents: "", driver: "",
    contactName: "", contactEmail: "", contactTitle: "",
  });

  const INDUSTRIES = ["Financial Services", "Healthcare", "Technology", "Retail/E-commerce", "Manufacturing", "Government", "Education", "Legal", "Insurance", "Other"];
  const EMPLOYEE_SIZES = ["1-50", "51-200", "201-500", "501-1,000", "1,001-5,000", "5,000-50,000", "50,000+"];
  const REGULATIONS = ["EU AI Act", "EEOC/Employment", "HIPAA", "CCPA/CPRA", "GDPR", "NIST AI RMF", "NY Local Law 144", "CFPB", "FTC Act", "Colorado AI Act", "ISO 42001", "SOC 2"];
  const MATURITY = ["Ad hoc (no formal AI governance)", "Basic (some policies, no enforcement)", "Developing (policies + partial enforcement)", "Advanced (integrated AI governance program)", "Leading (mature, continuous improvement)"];

  function toggleReg(r) {
    setForm(f => ({
      ...f,
      regulations: f.regulations.includes(r) ? f.regulations.filter(x => x !== r) : [...f.regulations, r],
    }));
  }

  async function runAudit() {
    setStep("generating");
    setProgress(0);

    const steps = [
      [10, "Analyzing your AI system profile..."],
      [25, "Mapping regulatory exposure across " + form.regulations.length + " frameworks..."],
      [45, "Running 5-dimension risk scoring engine..."],
      [60, "Building system-by-system risk register..."],
      [75, "Generating 30/60/90 day roadmap..."],
      [88, "Calculating financial exposure estimate..."],
      [95, "Compiling executive report..."],
    ];

    for (const [pct, msg] of steps) {
      await new Promise(r => setTimeout(r, 400));
      setProgress(pct);
      setProgressMsg(msg);
    }

    const prompt = `Generate a comprehensive AI Equity Assessment for:

Organization: ${form.orgName}
Industry: ${form.industry}
Employees: ${form.employees}
AI Systems In Use: ${form.aiSystems}
Regulatory Frameworks: ${form.regulations.join(", ")}
AI Governance Maturity: ${form.maturity}
Incident History: ${form.incidents || "None disclosed"}
Strategic Driver: ${form.driver || "Risk reduction"}
Assessment Tier: ${tier === "enhanced" ? "Enhanced ($5,000 — maximum depth)" : "Standard ($2,500 — comprehensive)"}
Primary Contact: ${form.contactName}, ${form.contactTitle}

Provide the deepest, most forensic analysis possible. Cite specific regulatory articles. Quantify every risk with realistic penalty structures based on actual regulatory enforcement data. The 30/60/90 day roadmap should be actionable enough that the client could hand it to their team immediately.`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: AUDIT_SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse report JSON");
      const parsed = JSON.parse(match[0]);

      setProgress(100);
      setProgressMsg("Report complete!");
      await new Promise(r => setTimeout(r, 500));
      setReport(parsed);
      setStep("report");
    } catch (e) {
      setError(e.message);
      setStep("intake");
    }
  }

  const isFormValid = form.orgName && form.industry && form.employees && form.aiSystems && form.regulations.length > 0 && form.contactEmail;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: B.bg, minHeight: "100vh", color: B.gray800 }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: B.dark, color: "#fff", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: B.heroGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "900", fontSize: "1.3rem" }}>
            Incluu
          </div>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>AI Equity Intensive — Auto-Audit Engine</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
          Powered by Dr. Dédé × Claude
        </div>
      </div>

      <div style={{ maxWidth: step === "report" ? "1100px" : "780px", margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Intake form */}
        {step === "intake" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{ display: "inline-block", background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", borderRadius: "50px", padding: "0.3rem 1rem", fontSize: "0.75rem", fontWeight: "700", color: B.purple, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
                AI Equity Intensive
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: "0 0 0.75rem" }}>
                Generate Your <span style={{ background: B.heroGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Equity Assessment</span>
              </h1>
              <p style={{ color: B.gray600, fontSize: "0.95rem", margin: 0 }}>
                5-module deep-dive report. Equivalent to a $15,000 consulting engagement.
              </p>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1.5px solid #fecaca", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#b91c1c" }}>
                ⚠ Error: {error}. Please try again.
              </div>
            )}

            {/* Tier selection */}
            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em", color: B.gray600 }}>Select Your Assessment Tier</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { id: "standard", label: "Standard", price: "$2,500", desc: "Comprehensive 5-module report + 90-min strategy session", includes: ["5-module AI equity report", "Regulatory gap analysis", "30/60/90 day roadmap", "Financial exposure estimate", "90-minute session with Dr. Dédé"] },
                  { id: "enhanced", label: "Enhanced", price: "$5,000", desc: "Maximum depth + post-call action plan + 30-day follow-up", includes: ["Everything in Standard", "System-by-system risk register", "Custom remediation playbook", "Post-call 10-page action plan", "30-day implementation check-in"] },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    style={{
                      textAlign: "left", padding: "1.25rem", borderRadius: "0.875rem", cursor: "pointer",
                      border: `2px solid ${tier === t.id ? B.purple : "#e5e7eb"}`,
                      background: tier === t.id ? "rgba(147,51,234,0.04)" : "#fff",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: "800", color: B.gray800 }}>{t.label}</span>
                      <span style={{ fontWeight: "900", color: B.purple, fontSize: "1.1rem" }}>{t.price}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: B.gray600, marginBottom: "0.75rem" }}>{t.desc}</div>
                    {t.includes.map((item, i) => (
                      <div key={i} style={{ fontSize: "0.75rem", color: tier === t.id ? B.purple : B.gray600, display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
                        <span style={{ color: tier === t.id ? B.purple : "#9ca3af" }}>✓</span> {item}
                      </div>
                    ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Org info */}
            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.06em", color: B.gray600 }}>Organization Profile</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {[
                  { key: "orgName", label: "Organization Name", placeholder: "Acme Financial Corp" },
                  { key: "contactName", label: "Your Name", placeholder: "Jane Smith" },
                  { key: "contactEmail", label: "Work Email", placeholder: "jane@acme.com", type: "email" },
                  { key: "contactTitle", label: "Your Title", placeholder: "Chief Compliance Officer" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ fontSize: "0.78rem", fontWeight: "600", color: B.gray700, display: "block", marginBottom: "0.35rem" }}>{label}</label>
                    <input
                      type={type || "text"}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: "600", color: B.gray700, display: "block", marginBottom: "0.35rem" }}>Industry</label>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem", fontFamily: "inherit" }}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: "600", color: B.gray700, display: "block", marginBottom: "0.35rem" }}>Company Size</label>
                  <select value={form.employees} onChange={e => setForm(f => ({ ...f, employees: e.target.value }))} style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem", fontFamily: "inherit" }}>
                    <option value="">Select size...</option>
                    {EMPLOYEE_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* AI systems */}
            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", display: "block", marginBottom: "0.35rem" }}>AI Systems & Tools in Use</label>
              <div style={{ fontSize: "0.78rem", color: B.gray600, marginBottom: "0.75rem" }}>List your AI-powered tools, hiring systems, fraud detection, chatbots, etc.</div>
              <textarea
                value={form.aiSystems}
                onChange={e => setForm(f => ({ ...f, aiSystems: e.target.value }))}
                placeholder="Example: Workday ATS for hiring, Salesforce Einstein for lead scoring, OpenAI ChatGPT for customer support, AWS fraud detection model, internal resume screening algorithm..."
                rows={3}
                style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {/* Regulations */}
            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "1rem" }}>Regulatory Frameworks to Assess</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {REGULATIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => toggleReg(r)}
                    style={{
                      padding: "0.35rem 0.85rem", borderRadius: "50px", fontSize: "0.78rem", cursor: "pointer",
                      border: `1.5px solid ${form.regulations.includes(r) ? B.purple : "#e5e7eb"}`,
                      background: form.regulations.includes(r) ? "rgba(147,51,234,0.06)" : "#fff",
                      color: form.regulations.includes(r) ? B.purple : B.gray600,
                      fontWeight: form.regulations.includes(r) ? "700" : "500",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Maturity */}
            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "1rem" }}>Current AI Governance Maturity</div>
              {MATURITY.map(m => (
                <button
                  key={m}
                  onClick={() => setForm(f => ({ ...f, maturity: m }))}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", cursor: "pointer", marginBottom: "0.35rem",
                    border: `1.5px solid ${form.maturity === m ? B.purple : "transparent"}`,
                    background: form.maturity === m ? "rgba(147,51,234,0.05)" : "transparent",
                    color: form.maturity === m ? B.purple : B.gray700,
                    fontWeight: form.maturity === m ? "600" : "400",
                    fontSize: "0.83rem", fontFamily: "inherit",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Payment CTA */}
            <div style={{ background: B.dark, borderRadius: "1rem", padding: "2rem", textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: "900", marginBottom: "0.4rem" }}>
                {tier === "enhanced" ? "Enhanced Assessment" : "Standard Assessment"} — {tier === "enhanced" ? "$5,000" : "$2,500"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
                {isFormValid ? "Complete payment, then generate your report instantly." : "Fill in the required fields above to continue."}
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href={tier === "enhanced" ? CONFIG.stripeLink5000 : CONFIG.stripeLink2500}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "0.85rem 2rem", borderRadius: "0.625rem", background: isFormValid ? B.btnGrad : "#374151", color: "#fff", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem", opacity: isFormValid ? 1 : 0.7, pointerEvents: isFormValid ? "auto" : "none" }}
                >
                  Pay {tier === "enhanced" ? "$5,000" : "$2,500"} via Stripe →
                </a>
                <button
                  onClick={runAudit}
                  disabled={!isFormValid}
                  style={{ padding: "0.85rem 2rem", borderRadius: "0.625rem", background: isFormValid ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: "700", fontSize: "0.9rem", cursor: isFormValid ? "pointer" : "not-allowed", opacity: isFormValid ? 1 : 0.5 }}
                >
                  ⚡ Generate Report Now (Demo)
                </button>
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "1rem" }}>
                After payment, return here and click "Generate Report Now" to receive your report instantly.
              </div>
            </div>
          </div>
        )}

        {/* Generating state */}
        {step === "generating" && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", animation: "fadeIn 0.4s ease" }}>
            <div style={{ width: "64px", height: "64px", border: "4px solid rgba(147,51,234,0.15)", borderTopColor: B.purple, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 2rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "0.5rem" }}>Generating Your Report</h2>
            <p style={{ color: B.gray600, fontSize: "0.9rem", marginBottom: "2rem" }}>{progressMsg}</p>
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div style={{ background: "#e5e7eb", borderRadius: "50px", height: "8px" }}>
                <div style={{ background: B.btnGrad, width: `${progress}%`, height: "8px", borderRadius: "50px", transition: "width 0.4s ease" }} />
              </div>
              <div style={{ fontSize: "0.78rem", color: B.gray600, marginTop: "0.5rem" }}>{progress}%</div>
            </div>
            <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: B.gray600 }}>
              Dr. Dédé's AI is analyzing {form.regulations.length} regulatory frameworks for {form.orgName}...
            </div>
          </div>
        )}

        {/* Report */}
        {step === "report" && report && (
          <FullReport report={report} orgName={form.orgName} />
        )}
      </div>
    </div>
  );
}
