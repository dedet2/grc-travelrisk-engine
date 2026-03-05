"use client";
import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Setup ───────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ruiphgtxyazqlasbchiv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBoZ3R4eWF6cWxhc2JjaGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzk0ODMsImV4cCI6MjA4Njk1NTQ4M30.yVHlpQQTFZ515DC7a7dktnxmDVwr9GDPDra4QDpXM-o"
);

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
  stripeink2500: "https://buy.stripe.com/7sYaEX5GC7fDfdc1yN7kc08",
  stripeLink5000: "https://buy.stripe.com/aFa3cv1qmczXghgcdr7kc09",
  fromEmail:     "hello@incluu.us",
  drDedeSignature: "Dr. Dédé Tetsubayashi | Cornell PhD | Former Meta/Salesforce/Indeed Executive | TEDx Speaker",
};

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
  "regulatory_gaps": [
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

function FullReport({ report, orgName, onSave, onSaveStart }) {
  const printRef = useRef();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    onSaveStart?.();
    
    try {
      const auditData = {
        org_name: orgName,
        report_data: report,
        composite_score: report.composite_score,
        risk_tier: report.org_profile?.risk_tier,
        generated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("reports")
        .insert({
          org_id: null,
          type: "audit",
          title: `AI Equity Audit - ${orgName}`,
          data: auditData,
          format: "json",
        });

      if (error) {
        console.error("Save error:", error);
        alert("Failed to save: " + error.message);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        onSave?.();
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Save failed: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
    const body = encodeURIComponent(`Hi,\n\nYour AI Equity Assessment report for ${orgName} is ready.\n\nKey findings:\n• Composite Risk Score: ${report.composite_score}/100 (${report.org_profile?.risk_tier})\n• ${(report.regulatory_gaps || []).length} regulatory gaps identified\n\nWarm regards,\n${CONFIG.drDedeSignature}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {saveSuccess && (
        <div style={{ background: "#f0fdf4", border: "1px solid #22c55e", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem", color: "#16a34a", fontSize: "0.85rem" }}>
          Audit report saved successfully!
        </div>
      )}

      <div style={{ background: B.dark, borderRadius: "1rem", padding: "2rem", marginBottom: "1.5rem", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(168,85,247,0.8)", marginBottom: "0.5rem" }}>
              AI Equity Assessment Report
            </div>
            <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.5rem", fontWeight: "900" }}>{orgName}</h2>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              <span>Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: saving ? "#d1d5db" : "#22c55e", color: "#fff", border: "none", fontWeight: "700", fontSize: "0.85rem", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving..." : "💾 Save Report"}
        </button>
        <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: B.btnGrad, color: "#fff", border: "none", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>
          ↓ Download HTML
        </button>
        <button onClick={sendEmail} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: "#fff", border: "1.5px solid #e5e7eb", color: B.gray700, fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>
          ✉ Email Report
        </button>
      </div>

      <Section title="Executive Summary" icon="📋">
        <p style={{ fontSize: "0.9rem", lineHeight: "1.7", color: B.gray700, margin: 0 }}>{report.executive_summary}</p>
      </Section>

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

      <Section title="Regulatory Gap Analysis" icon="⚖️">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr>
                {["Framework", "Article", "Gap", "Severity"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: B.gray600, borderBottom: "2px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(report.regulatory_gaps || []).map((gap, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem", fontWeight: "600", color: B.gray800 }}>{gap.framework}</td>
                  <td style={{ padding: "0.75rem", fontFamily: "monospace", fontSize: "0.78rem", color: B.gray600 }}>{gap.article}</td>
                  <td style={{ padding: "0.75rem", color: B.gray700 }}>{gap.gap}</td>
                  <td style={{ padding: "0.75rem" }}><RiskBadge level={gap.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="AI System Risks" icon="🤖">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {(report.ai_system_risks || []).map((sys, i) => {
            const c = RISK_COLORS[sys.risk_level] || RISK_COLORS.Medium;
            return (
              <div key={i} style={{ border: `1.5px solid ${c.border}`, borderTop: `3px solid ${c.badge}`, borderRadius: "0.75rem", padding: "1rem", background: c.bg + "50" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.9rem", color: B.gray800 }}>{sys.system}</span>
                  <RiskBadge level={sys.risk_level} />
                </div>
                <div style={{ fontSize: "0.8rem", color: c.text, marginBottom: "0.4rem" }}>⚠ {sys.top_risk}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

export default function AutoAuditAgent() {
  const [step, setStep]       = useState("intake");
  const [tier, setTier]       = useState("standard");
  const [report, setReport]   = useState(null);
  const [error, setError]     = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");

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
      [25, "Mapping regulatory exposure..."],
      [45, "Running risk scoring engine..."],
      [60, "Building risk register..."],
      [75, "Generating roadmap..."],
      [88, "Calculating financial exposure..."],
      [95, "Compiling report..."],
    ];

    for (const [pct, msg] of steps) {
      await new Promise(r => setTimeout(r, 400));
      setProgress(pct);
      setProgressMsg(msg);
    }

    // Generate mock report for demo
    const mockReport = {
      executive_summary: `${form.orgName} exhibits ${form.maturity || "developing"} AI governance maturity with exposure across ${form.regulations.length} regulatory frameworks. Key gaps include missing documentation for ${form.aiSystems ? "AI systems" : "systems"} and limited third-party audit controls.`,
      org_profile: { 
        name: form.orgName, 
        industry: form.industry, 
        size: form.employees,
        risk_tier: form.regulations.length > 5 ? "High" : "Medium"
      },
      composite_score: Math.floor(Math.random() * 40) + 35,
      risk_dimensions: [
        { name: "Governance & Accountability", score: Math.floor(Math.random() * 30) + 40, level: "High", key_finding: "Lack of documented AI governance structure" },
        { name: "Data & Privacy", score: Math.floor(Math.random() * 30) + 45, level: "High", key_finding: "Incomplete data lineage tracking" },
        { name: "Model Transparency", score: Math.floor(Math.random() * 35) + 40, level: "High", key_finding: "Limited explainability controls" },
        { name: "Bias & Fairness", score: Math.floor(Math.random() * 40) + 35, level: "Critical", key_finding: "No systematic bias testing" },
        { name: "Regulatory Compliance", score: Math.floor(Math.random() * 35) + 45, level: "High", key_finding: "Gaps across " + form.regulations.length + " frameworks" },
      ],
      regulatory_gaps: form.regulations.map((reg, i) => ({
        framework: reg,
        article: "Art. " + (i + 1),
        gap: `Missing ${reg} controls`,
        severity: i < 2 ? "Critical" : "High",
        remediation: `Implement ${reg} requirements`,
        timeline: i < 2 ? "30 days" : "60 days"
      })),
      ai_system_risks: (form.aiSystems ? form.aiSystems.split(",").slice(0, 3) : ["Unknown system 1", "Unknown system 2"]).map((sys, i) => ({
        system: sys.trim(),
        eu_act_class: i === 0 ? "High-risk" : "Limited risk",
        bias_vector: ["Demographic bias", "Historical bias", "Selection bias"][i % 3],
        risk_level: i === 0 ? "Critical" : "High",
        top_risk: `Potential ${["gender", "racial", "age"][i % 3]} discrimination`,
        control: `Implement ${["fairness audits", "bias testing", "human review"][i % 3]}`
      })),
      roadmap: {
        "30_day": [
          { action: "Document AI governance framework", owner: "Chief AI Officer", effort: "High", impact: "High" },
          { action: "Audit all AI systems for bias", owner: "Data Science Lead", effort: "High", impact: "High" }
        ],
        "60_day": [
          { action: "Implement monitoring controls", owner: "Engineering Lead", effort: "Medium", impact: "High" },
          { action: "Create compliance playbooks", owner: "Legal", effort: "Medium", impact: "Medium" }
        ],
        "90_day": [
          { action: "Third-party audit and certification", owner: "Chief AI Officer", effort: "Low", impact: "High" },
          { action: "Board governance review", owner: "Chief AI Officer", effort: "Low", impact: "Medium" }
        ]
      },
      financial_exposure: {
        total_low: "$250K",
        total_high: "$5M+",
        scenarios: [
          { regulation: form.regulations[0] || "Primary Framework", violation: "Governance gaps", exposure: "$500K–$2M", probability: "Medium" }
        ],
        roi_statement: "Remediation investment (~$100K) yields 5–10x ROI through risk reduction and competitive advantage."
      },
      report_metadata: {
        generated_date: new Date().toISOString(),
        analyst: "Dr. Dédé Tetsubayashi, Cornell PhD",
        methodology: "Incluu AI Equity Assessment Framework v2.0",
        disclaimer: "This report is for informational purposes and does not constitute legal advice."
      }
    };

    setProgress(100);
    setProgressMsg("Report complete!");
    await new Promise(r => setTimeout(r, 500));
    setReport(mockReport);
    setStep("report");
  }

  const isFormValid = form.orgName && form.industry && form.employees && form.aiSystems && form.regulations.length > 0 && form.contactEmail;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: B.bg, minHeight: "100vh", color: B.gray800 }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ background: B.dark, color: "#fff", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: B.heroGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "900", fontSize: "1.3rem" }}>
            Incluu
          </div>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>AI Equity Intensive — Auto-Audit Engine</span>
        </div>
      </div>

      <div style={{ maxWidth: step === "report" ? "1100px" : "780px", margin: "0 auto", padding: "3rem 2rem" }}>

        {step === "intake" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: "0 0 0.75rem" }}>
                AI Equity Assessment
              </h1>
              <p style={{ color: B.gray600, fontSize: "0.95rem", margin: 0 }}>
                5-module deep-dive report
              </p>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1.5px solid #fecaca", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#b91c1c" }}>
                Error: {error}
              </div>
            )}

            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "1rem" }}>Organization Profile</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <input type="text" placeholder="Organization Name" value={form.orgName} onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))} style={{ padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem" }} />
                <input type="text" placeholder="Your Name" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} style={{ padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem" }} />
                <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} style={{ padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select value={form.employees} onChange={e => setForm(f => ({ ...f, employees: e.target.value }))} style={{ padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
                  <option value="">Select size...</option>
                  {EMPLOYEE_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
                <input type="email" placeholder="Email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} style={{ padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem" }} />
                <input type="text" placeholder="Title" value={form.contactTitle} onChange={e => setForm(f => ({ ...f, contactTitle: e.target.value }))} style={{ padding: "0.6rem 0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem" }} />
              </div>
              <textarea placeholder="AI Systems in use..." value={form.aiSystems} onChange={e => setForm(f => ({ ...f, aiSystems: e.target.value }))} rows={3} style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "0.85rem", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>

            <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "1rem" }}>Regulatory Frameworks</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {REGULATIONS.map(r => (
                  <button key={r} onClick={() => toggleReg(r)} style={{ padding: "0.35rem 0.85rem", borderRadius: "50px", fontSize: "0.78rem", cursor: "pointer", border: `1.5px solid ${form.regulations.includes(r) ? B.purple : "#e5e7eb"}`, background: form.regulations.includes(r) ? "rgba(147,51,234,0.06)" : "#fff", color: form.regulations.includes(r) ? B.purple : B.gray600, fontWeight: form.regulations.includes(r) ? "700" : "500" }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: B.dark, borderRadius: "1rem", padding: "2rem", textAlign: "center", color: "#fff" }}>
              <button onClick={runAudit} disabled={!isFormValid} style={{ padding: "0.85rem 2rem", borderRadius: "0.625rem", background: isFormValid ? B.btnGrad : "#374151", color: "#fff", fontWeight: "700", fontSize: "0.9rem", cursor: isFormValid ? "pointer" : "not-allowed", opacity: isFormValid ? 1 : 0.5, border: "none" }}>
                Generate Audit Report →
              </button>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ width: "64px", height: "64px", border: "4px solid rgba(147,51,234,0.15)", borderTopColor: B.purple, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 2rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "0.5rem" }}>Generating Report</h2>
            <p style={{ color: B.gray600, fontSize: "0.9rem", marginBottom: "2rem" }}>{progressMsg}</p>
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div style={{ background: "#e5e7eb", borderRadius: "50px", height: "8px" }}>
                <div style={{ background: B.btnGrad, width: `${progress}%`, height: "8px", borderRadius: "50px", transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>
        )}

        {step === "report" && report && (
          <FullReport report={report} orgName={form.orgName} />
        )}
      </div>
    </div>
  );
}
