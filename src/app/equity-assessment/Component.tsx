"use client";
import { useState, useEffect, useRef } from "react";

// ============================================================
// DR. DÉDÉ TETSUBAYASHI BRAND TOKENS
// ============================================================
const B = {
  purple600: "#9333ea",
  purple500: "#a855f7",
  cyan400: "#22d3ee",
  cyan600: "#0891b2",
  heroGradient: "linear-gradient(135deg, rgba(147,51,234,0.95) 0%, rgba(168,85,247,0.95) 50%, rgba(34,211,238,0.95) 100%)",
  heroSolid: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGradient: "linear-gradient(to right, #9333ea, #0891b2)",
  textGradientCSS: {
    background: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray600: "#4b5563",
  gray800: "#1f2937",
  white90: "rgba(255,255,255,0.9)",
  sectionBg: "linear-gradient(135deg, rgba(6,182,212,0.04) 0%, rgba(147,51,234,0.04) 100%)",
};

const INDUSTRIES = [
  "Financial Services / Banking", "Healthcare / Life Sciences", "Insurance",
  "Legal Services", "Technology / SaaS", "Manufacturing",
  "Retail / E-commerce", "Government / Public Sector", "Energy / Utilities",
  "Education / Higher Ed", "Other",
];

const AI_SYSTEMS = [
  "Hiring / recruiting tools (ATS, screening)",
  "Performance management / workforce analytics",
  "Customer-facing chatbots or decisioning",
  "Fraud detection / credit scoring",
  "Predictive analytics for business decisions",
  "Generative AI (content, code, internal tools)",
  "Surveillance or monitoring systems",
  "Supply chain or logistics optimization",
  "Healthcare diagnostics or clinical decision support",
  "Marketing personalization / targeting",
];

const REGULATIONS = [
  "EU AI Act", "NIST AI RMF", "ISO 42001",
  "EEOC / OFCCP (employment discrimination)", "HIPAA (healthcare data)",
  "CCPA / CPRA (California privacy)", "GDPR", "SOC 2",
  "NY Local Law 144 (automated employment decisions)",
  "Colorado / Illinois AI bias laws", "CFPB / Fair lending regulations",
  "FTC Act (deceptive AI practices)",
];

const GOVERNANCE_ITEMS = [
  "Written AI governance policy approved by leadership",
  "Designated AI risk owner or committee",
  "Documented model inventory for all AI in production",
  "Third-party vendor AI assessment process",
  "Algorithmic bias testing protocols",
  "AI incident response playbook",
  "Employee AI use policies",
  "Board-level AI risk reporting",
];

const DRIVERS = [
  "Board or investor scrutiny / ESG pressure",
  "Upcoming regulatory deadline or audit",
  "M&A due diligence (buyer or target)",
  "Post-incident remediation",
  "Proactive risk posture ahead of regulation",
  "Internal compliance mandate",
  "Competitor or industry benchmark pressure",
];

const EMPLOYEE_COUNTS = ["100–500", "500–1,000", "1,000–5,000", "5,000–25,000", "25,000+"];
const REVENUE_RANGES = ["<$50M", "$50M–$250M", "$250M–$1B", "$1B–$10B", "$10B+"];

// ─── Shared Styles ──────────────────────────────────────────────────────────────────
const S = {
  container: {
    minHeight: "100vh",
    background: B.gray50,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: B.gray800,
  },
  card: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "2.5rem 2rem 4rem",
  },
  qLabel: {
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: "0.4rem",
    background: B.heroSolid,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  qTitle: {
    fontSize: "1.5rem",
    fontWeight: "300",
    color: B.gray800,
    marginBottom: "0.5rem",
    lineHeight: "1.35",
    letterSpacing: "-0.01em",
  },
  qSub: {
    fontSize: "0.875rem",
    color: B.gray600,
    marginBottom: "1.75rem",
    lineHeight: "1.65",
  },
  btnPrimary: {
    background: B.btnGradient,
    color: "#fff",
    border: "none",
    padding: "0.875rem 2rem",
    borderRadius: "0.5rem",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "opacity 0.2s",
    fontFamily: "inherit",
  },
  btnSecondary: {
    background: "transparent",
    color: B.gray600,
    border: "1px solid #d1d5db",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  divider: { height: "1px", background: "#e5e7eb", margin: "2rem 0" },
};

// ─── Progress Bar ───────────────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: B.gray600, fontWeight: "500", textTransform: "uppercase" }}>
          Assessment Progress
        </span>
        <span style={{ fontSize: "0.72rem", color: B.purple500, fontWeight: "600" }}>
          {current} of {total}
        </span>
      </div>
      <div style={{ height: "4px", background: "#e9d5ff", borderRadius: "2px" }}>
        <div style={{
          height: "100%",
          width: `${(current / total) * 100}%`,
          background: B.heroSolid,
          borderRadius: "2px",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────────────────
function OptionBtn({ label, selected, onClick, round }) {
  return (
    <button onClick={onClick} style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      textAlign: "left",
      padding: "0.85rem 1rem",
      background: selected ? "rgba(147,51,234,0.06)" : B.white90,
      border: selected ? `2px solid ${B.purple500}` : "1.5px solid #e5e7eb",
      borderRadius: "0.75rem",
      color: selected ? B.purple600 : B.gray600,
      fontSize: "0.85rem",
      cursor: "pointer",
      transition: "all 0.15s",
      width: "100%",
      fontFamily: "inherit",
      lineHeight: "1.45",
      backdropFilter: "blur(8px)",
      boxShadow: selected ? `0 0 0 1px ${B.purple500}20, 0 2px 8px ${B.purple600}10` : "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <span style={{
        flexShrink: 0,
        width: "18px",
        height: "18px",
        borderRadius: round ? "50%" : "4px",
        border: selected ? `2px solid ${B.purple500}` : "2px solid #d1d5db",
        background: selected ? B.purple500 : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "1px",
        fontSize: "0.65rem",
        color: "#fff",
        fontWeight: "700",
      }}>
        {selected && "✓"}
      </span>
      <span style={{ fontWeight: selected ? "500" : "400" }}>{label}</span>
    </button>
  );
}

function SelectList({ options, selected, onChange, single }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {options.map(opt => {
        const isSelected = single ? selected === opt : selected.includes(opt);
        return (
          <OptionBtn key={opt} label={opt} selected={isSelected} round={single}
            onClick={() => {
              if (single) onChange(opt);
              else isSelected ? onChange(selected.filter(s => s !== opt)) : onChange([...selected, opt]);
            }} />
        );
      })}
    </div>
  );
}

function CheckboxGrid({ options, selected, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.5rem" }}>
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <OptionBtn key={opt} label={opt} selected={isSelected}
            onClick={() => isSelected ? onChange(selected.filter(s => s !== opt)) : onChange([...selected, opt])} />
        );
      })}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{
      borderBottom: "1px solid #e5e7eb",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "32px", height: "32px",
          background: B.heroSolid,
          borderRadius: "0.5rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.65rem", fontWeight: "800", color: "#fff",
          letterSpacing: "0.02em",
        }}>DD</div>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: "600", color: B.gray800 }}>AI Equity Assessment</div>
          <div style={{ fontSize: "0.67rem", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Dr. Dédé Tetsubayashi · Incluu.us
          </div>
        </div>
      </div>
      <span style={{
        fontSize: "0.67rem", fontWeight: "600", letterSpacing: "0.1em",
        textTransform: "uppercase", color: B.purple600,
        background: "rgba(147,51,234,0.08)",
        border: "1px solid rgba(147,51,234,0.2)",
        padding: "0.3rem 0.75rem",
        borderRadius: "50px",
      }}>Enterprise Framework</span>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────────────────
function LoadingScreen() {
  const [phase, setPhase] = useState(0);
  const phases = [
    "Analyzing regulatory exposure…",
    "Mapping governance gaps…",
    "Benchmarking against NIST AI RMF…",
    "Calculating organizational risk score…",
    "Generating executive assessment…",
  ];
  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % phases.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "64px", height: "64px", margin: "0 auto 2.5rem", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid transparent", borderTopColor: B.purple500,
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: "8px", borderRadius: "50%",
          border: "3px solid transparent", borderTopColor: B.cyan400,
          animation: "spin 1.5s linear infinite reverse",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      <div style={{ ...B.textGradientCSS, fontSize: "0.75rem", letterSpacing: "0.2em", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.75rem" }}>
        Generating your assessment
      </div>
      <p style={{ color: B.gray600, fontSize: "0.88rem" }}>{phases[phase]}</p>
    </div>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const cfg = {
    LOW: { bg: "#dcfce7", border: "#86efac", color: "#15803d", label: "Low Risk" },
    MEDIUM: { bg: "#fef9c3", border: "#fde047", color: "#a16207", label: "Medium Risk" },
    HIGH: { bg: "#ffedd5", border: "#fdba74", color: "#c2410c", label: "High Risk" },
    CRITICAL: { bg: "#fee2e2", border: "#fca5a5", color: "#b91c1c", label: "Critical Risk" },
  };
  const c = cfg[level] || cfg.HIGH;
  return (
    <span style={{
      display: "inline-block", padding: "0.35rem 1rem",
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: "50px", color: c.color,
      fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.03em",
    }}>{c.label}</span>
  );
}

// ─── Report Section ───────────────────────────────────────────────────────────────────────
function ReportCard({ title, children, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${accent || "#e5e7eb"}`,
      borderRadius: "1rem",
      padding: "1.5rem",
      marginBottom: "1.25rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: "0.68rem", letterSpacing: "0.18em", fontWeight: "700",
        textTransform: "uppercase", marginBottom: "0.85rem",
        color: accent ? B.purple600 : "#6b7280",
      }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────────────
export default function AIEquityAssessment() {
  const [screen, setScreen] = useState("landing");
  const [answers, setAnswers] = useState({
    industry: "", employees: "", revenue: "",
    aiSystems: [], regulations: [], governanceItems: [],
    incidentHistory: "", driver: "",
  });
  const [report, setReport] = useState(null);
  const reportRef = useRef(null);

  const upd = (key, val) => setAnswers(a => ({ ...a, [key]: val }));

  const ok = {
    q1: answers.industry && answers.employees && answers.revenue,
    q2: answers.aiSystems.length > 0,
    q5: !!answers.incidentHistory,
    q6: !!answers.driver,
  };

  async function generateReport() {
    setScreen("loading");
    try {
      const prompt = `You are Dr. Dédé Tetsubayashi's AI governance assessment engine. Generate a concise, authoritative enterprise AI governance risk assessment.

ORGANIZATION: ${answers.industry} | ${answers.employees} employees | ${answers.revenue} revenue
AI SYSTEMS: ${answers.aiSystems.join(", ") || "None specified"}
REGULATIONS: ${answers.regulations.join(", ") || "None identified"}
GOVERNANCE CONTROLS IN PLACE: ${answers.governanceItems.join(", ") || "None"}
INCIDENT HISTORY: ${answers.incidentHistory}
PRIMARY DRIVER: ${answers.driver}

Return ONLY raw JSON (no markdown, no code blocks):
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "executiveSummary": "2-3 sentences, direct, specific to their industry and AI systems.",
  "topGaps": [
    { "gap": "Short title", "detail": "1-2 sentences on the gap and specific regulatory or liability exposure.", "severity": "HIGH" | "CRITICAL" | "MEDIUM" },
    { "gap": "...", "detail": "...", "severity": "..." },
    { "gap": "...", "detail": "...", "severity": "..." }
  ],
  "regulatoryExposure": "2-3 sentences naming specific regulations and timelines relevant to their situation.",
  "priorityAction": "One concrete, named deliverable for the next 30 days. Not generic.",
  "whyIntensive": "1-2 sentences connecting their specific situation to the AI Equity Intensive with Dr. Dédé."
}`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const parsed = JSON.parse(jsonMatch[0]);
      setReport(parsed);
      setScreen("report");
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      console.error("Assessment error:", e);
      setScreen("error");
    }
  }

  // ─── LANDING ──────────────────────────────────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={S.container}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Header />
      {/* Hero */}
      <div style={{
        background: B.heroGradient, color: "#fff",
        padding: "4rem 2rem 5rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15), transparent 60%), radial-gradient(circle at 70% 80%, rgba(34,211,238,0.15), transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
          <span style={{
            display: "inline-block", marginBottom: "1.25rem",
            padding: "0.4rem 1rem",
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "50px",
            fontSize: "0.78rem", fontWeight: "600", letterSpacing: "0.08em",
            backdropFilter: "blur(4px)",
          }}>
            Enterprise AI Governance · 6 Questions · Free
          </span>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "300",
            lineHeight: "1.2", letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
            textShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}>
            Your AI Is Already Running.<br />
            <strong style={{ fontWeight: "700" }}>Your Governance Isn't.</strong>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.93)", lineHeight: "1.75", marginBottom: "2rem", maxWidth: "520px" }}>
            Answer 6 questions. Get a personalized AI governance gap assessment — the same diagnostic framework Dr. Dédé uses with Fortune 500 executives before every engagement.
          </p>
          <div style={{ display: "flex", gap: "2.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
            {[["~4 minutes", "6 questions"], ["Instant report", "No email required"], ["Enterprise grade", "Fortune 500 framework"]].map(([a, b]) => (
              <div key={a}>
                <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{a}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)" }}>{b}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setScreen("q1")} style={{ ...S.btnPrimary, background: "#fff", color: B.purple600, fontSize: "1rem", padding: "1rem 2.5rem" }}>
            Begin Assessment →
          </button>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem" }}>
            Results generated in real time. Not stored or shared.
          </p>
        </div>
      </div>
      {/* Trust strip */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "1.25rem 2rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>Framework coverage:</span>
          {["EU AI Act", "NIST AI RMF", "ISO 42001", "EEOC / OFCCP", "CFPB", "NY Local Law 144"].map(f => (
            <span key={f} style={{ fontSize: "0.78rem", color: B.gray600, fontWeight: "500" }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── QUESTION WRAPPER ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const QWrap = ({ step, qLabel, qTitle, qSub, onBack, onNext, nextDisabled, nextLabel, children }) => (
    <div style={S.container}>
      <Header />
      <div style={S.card}>
        <ProgressBar current={step} total={6} />
        <div style={S.qLabel}>{qLabel}</div>
        <h2 style={S.qTitle}>{qTitle}</h2>
        {qSub && <p style={S.qSub}>{qSub}</p>}
        {children}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between", marginTop: "2rem" }}>
          <button onClick={onBack} style={S.btnSecondary}>← Back</button>
          <button onClick={onNext} disabled={nextDisabled} style={{ ...S.btnPrimary, opacity: nextDisabled ? 0.4 : 1 }}>
            {nextLabel || "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );

  if (screen === "q1") return (
    <div style={S.container}>
      <Header />
      <div style={S.card}>
        <ProgressBar current={1} total={6} />
        <div style={S.qLabel}>Question 01 · Organization Profile</div>
        <h2 style={S.qTitle}>Tell us about your organization.</h2>
        <p style={S.qSub}>Risk exposure varies significantly by industry and scale. We use this to calibrate your assessment.</p>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: B.gray600, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Industry Sector</div>
          <SelectList options={INDUSTRIES} selected={answers.industry} onChange={v => upd("industry", v)} single />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: B.gray600, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Employees</div>
            <SelectList options={EMPLOYEE_COUNTS} selected={answers.employees} onChange={v => upd("employees", v)} single />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: B.gray600, marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Annual Revenue</div>
            <SelectList options={REVENUE_RANGES} selected={answers.revenue} onChange={v => upd("revenue", v)} single />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between", marginTop: "2rem" }}>
          <button onClick={() => setScreen("landing")} style={S.btnSecondary}>← Back</button>
          <button onClick={() => setScreen("q2")} disabled={!ok.q1} style={{ ...S.btnPrimary, opacity: ok.q1 ? 1 : 0.4 }}>Continue →</button>
        </div>
      </div>
    </div>
  );

  if (screen === "q2") return (
    <QWrap step={2} qLabel="Question 02 · AI Deployment Scope"
      qTitle="Which AI systems are currently in production?"
      qSub="Select all that apply. Include systems operated by third-party vendors on your behalf."
      onBack={() => setScreen("q1")} onNext={() => setScreen("q3")} nextDisabled={!ok.q2}>
      <CheckboxGrid options={AI_SYSTEMS} selected={answers.aiSystems} onChange={v => upd("aiSystems", v)} />
    </QWrap>
  );

  if (screen === "q3") return (
    <QWrap step={3} qLabel="Question 03 · Regulatory Exposure"
      qTitle="Which regulatory frameworks apply to your organization?"
      qSub="Select all that apply. If unsure, choose frameworks relevant to your industry and operating jurisdictions."
      onBack={() => setScreen("q2")} onNext={() => setScreen("q4")}>
      <CheckboxGrid options={REGULATIONS} selected={answers.regulations} onChange={v => upd("regulations", v)} />
    </QWrap>
  );

  if (screen === "q4") return (
    <QWrap step={4} qLabel="Question 04 · Governance Maturity"
      qTitle="Which governance controls are currently in place?"
      qSub="Select only controls that exist in documented, operational form — not those planned or in progress."
      onBack={() => setScreen("q3")} onNext={() => setScreen("q5")}>
      <CheckboxGrid options={GOVERNANCE_ITEMS} selected={answers.governanceItems} onChange={v => upd("governanceItems", v)} />
    </QWrap>
  );

  if (screen === "q5") return (
    <QWrap step={5} qLabel="Question 05 · Incident History"
      qTitle="Has your organization experienced any of the following in the past 24 months?"
      qSub="This is used to assess residual risk and potential regulatory attention."
      onBack={() => setScreen("q4")} onNext={() => setScreen("q6")} nextDisabled={!ok.q5}>
      <SelectList options={[
        "No known AI-related incidents, inquiries, or escalations",
        "Internal escalation or employee complaint related to AI decision-making",
        "Regulatory inquiry, audit finding, or notice related to AI or data practices",
        "Litigation or threatened litigation involving AI systems or outputs",
        "Public-facing AI incident that received media attention",
        "AI system failure that impacted business operations or customers",
      ]} selected={answers.incidentHistory} onChange={v => upd("incidentHistory", v)} single />
    </QWrap>
  );

  if (screen === "q6") return (
    <QWrap step={6} qLabel="Question 06 · Strategic Driver"
      qTitle="What is the primary driver behind this assessment?"
      qSub="Understanding your pressure point lets us prioritize the findings most relevant to your timeline."
      onBack={() => setScreen("q5")} onNext={generateReport} nextDisabled={!ok.q6}
      nextLabel="Generate My Assessment →">
      <SelectList options={DRIVERS} selected={answers.driver} onChange={v => upd("driver", v)} single />
    </QWrap>
  );

  if (screen === "loading") return (
    <div style={S.container}><Header /><div style={S.card}><LoadingScreen /></div></div>
  );

  if (screen === "error") return (
    <div style={S.container}>
      <Header />
      <div style={{ ...S.card, textAlign: "center", paddingTop: "4rem" }}>
        <p style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: "600" }}>Unable to generate assessment.</p>
        <button onClick={() => setScreen("q6")} style={S.btnPrimary}>Try Again</button>
      </div>
    </div>
  );

  // ─── REPORT ───────────────────────────────────────────────────────────────────────────
  if (screen === "report" && report) {
    const sevColor = { HIGH: "#c2410c", CRITICAL: "#b91c1c", MEDIUM: "#a16207" };
    const sevBg = { HIGH: "#ffedd5", CRITICAL: "#fee2e2", MEDIUM: "#fef9c3" };
    return (
      <div style={S.container}>
        <Header />
        {/* Report Hero */}
        <div style={{
          background: B.heroGradient, color: "#fff",
          padding: "2.5rem 2rem",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent 60%)",
            pointerEvents: "none",
          }} />
          <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.15em", fontWeight: "600", color: "rgba(255,255,255,0.7)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                  AI Equity Assessment Report · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "300", marginBottom: "0.25rem" }}>
                  {answers.industry}
                </h2>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>
                  {answers.employees} employees · {answers.revenue} revenue · {answers.aiSystems.length} AI systems in scope
                </div>
              </div>
              <RiskBadge level={report.riskLevel} />
            </div>
          </div>
        </div>

        <div style={{ ...S.card, paddingTop: "2rem" }} ref={reportRef}>
          {/* Summary */}
          <ReportCard title="Executive Summary" accent={`rgba(147,51,234,0.3)`}>
            <p style={{ color: B.gray600, lineHeight: "1.8", fontSize: "0.92rem" }}>{report.executiveSummary}</p>
          </ReportCard>

          {/* Gaps */}
          <ReportCard title="Critical Governance Gaps Identified">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {report.topGaps?.map((g, i) => (
                <div key={i} style={{
                  padding: "1rem 1.25rem",
                  background: sevBg[g.severity] || "#fff7ed",
                  border: `1.5px solid ${sevColor[g.severity] || "#c2410c"}30`,
                  borderLeft: `4px solid ${sevColor[g.severity] || "#c2410c"}`,
                  borderRadius: "0.5rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: "600", color: B.gray800 }}>{i + 1}. {g.gap}</div>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: "700", letterSpacing: "0.1em",
                      color: sevColor[g.severity] || "#c2410c", textTransform: "uppercase",
                    }}>{g.severity}</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: B.gray600, lineHeight: "1.6", margin: 0 }}>{g.detail}</p>
                </div>
              ))}
            </div>
          </ReportCard>

          {/* Regulatory */}
          <ReportCard title="Regulatory Exposure Assessment">
            <p style={{ color: B.gray600, lineHeight: "1.8", fontSize: "0.9rem" }}>{report.regulatoryExposure}</p>
          </ReportCard>

          {/* Priority action */}
          <ReportCard title="Priority Action — Next 30 Days" accent="rgba(8,145,178,0.3)">
            <p style={{ color: B.cyan600, lineHeight: "1.8", fontSize: "0.9rem", fontWeight: "500" }}>{report.priorityAction}</p>
          </ReportCard>

          {/* CTA */}
          <div style={{
            background: B.heroGradient,
            borderRadius: "1rem",
            padding: "2rem 2rem 2.25rem",
            marginTop: "1.5rem",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08), transparent 60%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative" }}>
              <span style={{
                display: "inline-block", marginBottom: "0.75rem",
                padding: "0.3rem 0.85rem",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50px", fontSize: "0.72rem", fontWeight: "600",
                letterSpacing: "0.08em", backdropFilter: "blur(4px)",
              }}>Next Step · AI Equity Intensive</span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "400", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                Go from risk identified to risk resolved.
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.88)", lineHeight: "1.75", marginBottom: "1.5rem" }}>
                {report.whyIntensive} The AI Equity Intensive is a 90-minute working session with Dr. Dédé resulting in a 5–7 page AI Equity Assessment Report and a 30/60/90-day governance roadmap — specific to your organization.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <a href="https://dr-dede.com/schedule-consultation" target="_blank" rel="noopener noreferrer"
                  style={{ ...S.btnPrimary, background: "#fff", color: B.purple600, textDecoration: "none", display: "inline-block" }}>
                  Book an AI Equity Intensive →
                </a>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>$2,500 individual · $5,000 enterprise team</span>
              </div>
              <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                Dr. Dédé Tetsubayashi · TEDx Speaker · Cornell PhD · AI Governance Expert · incluu.us
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
