"use client";
import { useState, useRef, useEffect } from "react";

// ─── Brand Tokens ─────────────────────────────────────────────
const B = {
  heroSolid: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGradient: "linear-gradient(to right, #9333ea, #0891b2)",
  purple600: "#9333ea",
  purple500: "#a855f7",
  cyan600: "#0891b2",
  cyan400: "#22d3ee",
  gray50: "#f9fafb",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

const INDUSTRIES = [
  "Financial Services / Banking", "Healthcare / Life Sciences", "Insurance",
  "Legal Services", "Technology / SaaS", "Manufacturing",
  "Retail / E-commerce", "Government / Public Sector", "Energy / Utilities",
  "Education / Higher Ed",
];

const AI_SYSTEMS = [
  "Hiring / applicant screening", "Performance management analytics",
  "Customer-facing decisioning / chatbots", "Fraud detection / credit scoring",
  "Predictive analytics", "Generative AI (internal tools, content, code)",
  "Healthcare diagnostics / clinical support", "Marketing personalization",
  "Surveillance / monitoring systems", "Supply chain optimization",
];

const REGULATIONS = [
  "EU AI Act", "NIST AI RMF", "ISO 42001",
  "EEOC / OFCCP", "HIPAA", "CCPA / CPRA", "GDPR",
  "NY Local Law 144", "Colorado / Illinois AI bias laws",
  "CFPB / Fair lending", "FTC Act", "SOC 2",
];

const MATURITY = [
  { value: "none", label: "No governance in place", desc: "Starting from scratch" },
  { value: "early", label: "Early stage", desc: "Some informal practices" },
  { value: "developing", label: "Developing", desc: "Ad hoc policies exist" },
  { value: "established", label: "Established", desc: "Formal program in progress" },
];

const EMPEOYEE_COUNTS = ["100–500", "500–1,000", "1,000–5,000", "5,000–25,000", "25,000+"];

const POLICY_SECTIONS = [
  "Executive Summary & Policy Statement",
  "Scope & Applicability",
  "Definitions & AI System Classification",
  "Governance Structure & Roles",
  "Risk Assessment Framework",
  "Data Governance & Privacy",
  "Bias, Fairness & Non-Discrimination",
  "Transparency & Explainability",
  "Human Oversight & Accountability",
  "Vendor & Third-Party AI Management",
  "Incident Response & Remediation",
  "Compliance Monitoring & Audit",
  "Employee Training Requirements",
  "Policy Review & Amendment",
];

const SYSTEM_PROMPT = `You are Dr. Dédé Tetsubayashi's AI governance policy drafting engine. Dr. Dédé is a Cornell PhD anthropologist, former Meta/Salesforce/Indeed executive, TEDx speaker, and AI governance expert. She specializes in equitable, compliant, human-centered AI governance for Fortune 500 companies.

You draft authoritative, legally-informed AI governance policies that:
- Reference specific regulatory frameworks accurately (EU AI Act, NIST AI RMF, JSO 42001, EEOC, HIPAA, etc.)
- Use precise, compliance-ready language suitable for legal review
- Are specific to the organization's industry, AI systems, and risk profile — never generic
- Center equity, accessibility, and human oversight alongside legal compliance
- Are structured for real-world implementation, not just box-checking

Your output is a complete, professional policy document in clean markdown. Section headers use ##. Sub-sections use ###. Tables where helpful. Regulatory citations in brackets like [EU AI Act, Art. 9]. Placeholder fields use [ORGANIZATION NAME], [DATE], [ROLE TITLE] format.`;

// ─── Utilities ────────────────────────────────────────────────
function CheckboxGrid({ options, selected, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.4rem" }}>
      {options.map(opt => {
        const on = selected.includes(opt);
        return (
          <button key={opt} onClick={() => on ? onChange(selected.filter(s => s !== opt)) : onChange([...selected, opt])}
            style={{
              textAlign: "left", padding: "0.6rem 0.75rem",
              background: on ? "rgba(147,51,234,0.07)" : "transparent",
              border: on ? `1.5px solid ${B.purple500}` : "1.5px solid #e5e7eb",
              borderRadius: "0.5rem", color: on ? B.purple600 : B.gray700,
              fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.15s",
            }}>
            <span style={{
              width: "14px", height: "14px", borderRadius: "3px", flexShrink: 0,
              border: on ? `2px solid ${B.purple500}` : "2px solid #d1d5db",
              background: on ? B.purple500 : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.6rem", color: "#fff", fontWeight: "700",
            }}>{on && "✓"}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, selected, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
      {options.map(o => {
        const on = selected === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            textAlign: "left", padding: "0.75rem", borderRadius: "0.5rem",
            background: on ? "rgba(147,51,234,0.07)" : "transparent",
            border: on ? `1.5px solid ${B.purple500}` : "1.5px solid #e5e7eb",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>
            <div style={{ fontSize: "0.82rem", fontWeight: on ? "600" : "400", color: on ? B.purple600 : B.gray700 }}>{o.label}</div>
            <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{o.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function SelectRow({ options, selected, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
      {options.map(o => {
        const on = selected === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: "0.4rem 0.85rem", borderRadius: "50px",
            background: on ? B.heroSolid : "transparent",
            border: on ? "none" : "1.5px solid #e5e7eb",
            color: on ? "#fff" : B.gray600,
            fontSize: "0.78rem", fontWeight: on ? "600" : "400",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{o}</button>
        );
      })}
    </div>
  );
}

function SectionToggle({ sections, selected, onChange }) {
  const allOn = selected.length === sections.length;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{selected.length} of {sections.length} sections</span>
        <button onClick={() => onChange(allOn ? [] : [...sections])} style={{
          fontSize: "0.72rem", color: B.purple600, background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit", fontWeight: "600",
        }}>{allOn ? "Deselect all" : "Select all"}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {sections.map((s, i) => {
          const on = selected.includes(s);
          return (
            <button key={s} onClick={() => on ? onChange(selected.filter(x => x !== s)) : onChange([...selected, s])}
              style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.55rem 0.75rem", borderRadius: "0.4rem",
                background: on ? "rgba(147,51,234,0.05)" : "transparent",
                border: on ? `1px solid rgba(147,51,234,0.2)` : "1px solid transparent",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.1s",
              }}>
              <span style={{
                width: "14px", height: "14px", borderRadius: "3px", flexShrink: 0,
                border: on ? `2px solid ${B.purple500}` : "2px solid #d1d5db",
                background: on ? B.purple500 : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem", color: "#fff",
              }}>{on && "✓"}</span>
              <span style={{ fontSize: "0.78rem", color: on ? B.purple600 : B.gray600, fontWeight: on ? "500" : "400" }}>
                <span style={{ color: "#9ca3af", marginRight: "0.4rem" }}>{String(i + 1).padStart(2, "0")}</span>
                {s}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function PolicyGenerator() {
  const [step, setStep] = useState("form"); // form | generating | output
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employees, setEmployees] = useState("");
  const [aiSystems, setAiSystems] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [maturity, setMaturity] = useState("none");
  const [sections, setSections] = useState([...POLICY_SECTIONS]);
  const [policyText, setPolicyText] = useState("");
  const [streamText, setStreamText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const outputRef = useRef(null);
  const intervalRef = useRef(null);

  const canGenerate = industry && employees && aiSystems.length > 0 && sections.length > 0;

  useEffect(() => () => clearInterval(intervalRef.current), []);

  async function generate() {
    setStep("generating");
    setStreamText("");
    setPolicyText("");
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    const prompt = `Draft a comprehensive AI Governance Policy document for the following organization.

ORGANIZATION PROFILE:
- Name: ${orgName || "[ORGANIZATION NAME]"}
- Industry: ${industry}
- Employee count: ${employees}
- Current governance maturity: ${MATURITY.find(m => m.value === maturity)?.label}

AI SYSTEMS IN SCOPE:
${aiSystems.join(", ")}

APPLICABLE REGULATORY FRAMEWORKS:
${regulations.length > 0 ? regulations.join(", ") : "General best practices (no specific frameworks selected)"}

POLICY SECTIONS TO INCLUDE:
${sections.join("\n")}

Draft a complete, professional AI Governance Policy document. Be specific to this organization's industry and AI systems throughout — do not write generic policy language. Reference applicable regulations with precise citations. Use ${orgName || "[ORGANIZATION NAME]"} throughout. Format in clean markdown with ## for sections and ### for subsections. Include tables where appropriate. Mark placeholder fields with [BRACKETS].`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setPolicyText(text);
      setCharCount(text.length);

      // Animate text streaming in
      let i = 0;
      const chunkSize = 20;
      intervalRef.current = setInterval(() => {
        i += chunkSize;
        setStreamText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalRef.current);
          setStreamText(text);
          setStep("output");
        }
      }, 16);
    } catch (e) {
      console.error(e);
      setStep("form");
      alert("Generation failed. Please try again.");
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([policyText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI-Governance-Policy-${(orgName || "Organization").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAll() {
    navigator.clipboard.writeText(policyText);
  }

  // ─── Rendered markdown (simple) ───────────────────────────
  function renderMarkdown(text) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1.15rem", fontWeight: "700", color: B.gray800, marginTop: "2rem", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: `2px solid rgba(147,51,234,0.15)` }}>{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: "0.95rem", fontWeight: "700", color: B.purple600, marginTop: "1.25rem", marginBottom: "0.35rem" }}>{line.slice(4)}</h3>;
      if (line.startsWith("#### ")) return <h4 key={i} style={{ fontSize: "0.875rem", fontWeight: "600", color: B.gray700, marginTop: "0.85rem", marginBottom: "0.25rem" }}>{line.slice(5)}</h4>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} style={{ fontSize: "0.875rem", color: B.gray700, lineHeight: "1.7", marginLeft: "1rem", marginBottom: "0.15rem" }}>{line.slice(2)}</li>;
      if (line.match(/^\d+\. /)) return <li key={i} style={{ fontSize: "0.875rem", color: B.gray700, lineHeight: "1.7", marginLeft: "1rem", marginBottom: "0.15rem" }}>{line.replace(/^\d+\. /, "")}</li>;
      if (line.startsWith("| ")) return <div key={i} style={{ fontFamily: "monospace", fontSize: "0.78rem", color: B.gray700, padding: "0.2rem 0", borderBottom: "1px solid #f3f4f6" }}>{line}</div>;
      if (line.startsWith("---") || line.startsWith("___")) return <hr key={i} style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "1rem 0" }} />;
      if (line.trim() === "") return <div key={i} style={{ height: "0.5rem" }} />;
      // Bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} style={{ fontSize: "0.875rem", color: B.gray700, lineHeight: "1.75", margin: "0 0 0.25rem" }}>
          {parts.map((part, j) => part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part)}
        </p>
      );
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: B.gray50, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`* { box-sizing: border-box; } textarea:focus, input:focus { outline: 2px solid #a855f7; outline-offset: 1px; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", background: B.heroSolid, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "800", color: "#fff" }}>GRC</div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: B.gray800 }}>AI Governance Policy Generator</div>
            <div style={{ fontSize: "0.67rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Incluu.us · Dr. Dédé Tetsubayashi</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {step === "output" && (
            <>
              <button onClick={copyAll} style={{ background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.78rem", color: B.gray600, cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Copy All</button>
              <button onClick={downloadMarkdown} style={{ background: B.btnGradient, border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.78rem", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Download .md</button>
            </>
          )}
          <span style={{ fontSize: "0.67rem", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: B.purple600, background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", padding: "0.3rem 0.75rem", borderRadius: "50px" }}>
            Enterprise
          </span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: B.heroSolid, color: "#fff", padding: "2.5rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 25% 50%, rgba(255,255,255,0.12), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative" }}>
          <span style={{ display: "inline-block", marginBottom: "0.75rem", padding: "0.3rem 1rem", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50px", fontSize: "0.72rem", fontWeight: "600", letterSpacing: "0.06em" }}>
            Powered by Dr. Dédé's AI Governance Framework
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: "300", lineHeight: "1.25", marginBottom: "0.75rem" }}>
            Generate a <strong style={{ fontWeight: "700" }}>customized AI governance policy</strong><br />in under 90 seconds.
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.88)", lineHeight: "1.7", maxWidth: "580px" }}>
            Based on your industry, AI systems, and regulatory exposure — not a generic template. Ready for legal review. Grounded in EU AI Act, NIST AI RMF, ISO 42001, and equity-centered best practices.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }} ref={outputRef}>

        {/* ─── FORM ──────────────────────────────────────────── */}
        {(step === "form" || step === "generating") && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

            {/* Left: main fields */}
            <div>
              {/* Org name */}
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.6rem" }}>Organization Name <span style={{ color: "#9ca3af", fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>— optional</span></label>
                <input
                  value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="Acme Financial Corp"
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.65rem 0.85rem", fontSize: "0.875rem", color: B.gray700, fontFamily: "inherit", background: B.gray50 }}
                />
              </div>

              {/* Industry */}
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>Industry Sector <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {INDUSTRIES.map(ind => {
                    const on = industry === ind;
                    return (
                      <button key={ind} onClick={() => setIndustry(ind)} style={{
                        padding: "0.4rem 0.85rem", borderRadius: "50px",
                        background: on ? B.heroSolid : "transparent",
                        border: on ? "none" : "1.5px solid #e5e7eb",
                        color: on ? "#fff" : B.gray600,
                        fontSize: "0.78rem", fontWeight: on ? "600" : "400",
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>{ind}</button>
                    );
                  })}
                </div>
              </div>

              {/* Employees */}
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>Employee Count <span style={{ color: "#ef4444" }}>*</span></label>
                <SelectRow options={EMPLOYEE_COUNTS} selected={employees} onChange={setEmployees} />
              </div>

              {/* AI Systems */}
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>AI Systems in Scope <span style={{ color: "#ef4444" }}>*</span></label>
                <CheckboxGrid options={AI_SYSTEMS} selected={aiSystems} onChange={setAiSystems} />
              </div>

              {/* Regulations */}
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>Regulatory Frameworks</label>
                <CheckboxGrid options={REGULATIONS} selected={regulations} onChange={setRegulations} />
              </div>

              {/* Maturity */}
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>Current Governance Maturity</label>
                <RadioGroup options={MATURITY} selected={maturity} onChange={setMaturity} />
              </div>
            </div>

            {/* Right: section selector + generate */}
            <div style={{ position: "sticky", top: "72px" }}>
              <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>Policy Sections</label>
                <SectionToggle sections={POLICY_SECTIONS} selected={sections} onChange={setSections} />
              </div>

              <button onClick={generate} disabled={!canGenerate || step === "generating"}
                style={{
                  width: "100%", background: canGenerate && step !== "generating" ? B.btnGradient : "#e5e7eb",
                  color: canGenerate && step !== "generating" ? "#fff" : "#9ca3af",
                  border: "none", borderRadius: "0.5rem", padding: "1rem",
                  fontSize: "0.9rem", fontWeight: "700", cursor: canGenerate && step !== "generating" ? "pointer" : "not-allowed",
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                }}>
                {step === "generating" ? (
                  <><span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />Generating Policy…</>
                ) : "Generate Policy Document →"}
              </button>
              {!canGenerate && (
                <p style={{ fontSize: "0.72rem", color: "#9ca3af", textAlign: "center", marginTop: "0.5rem" }}>
                  Select industry, employee count, and at least one AI system to continue.
                </p>
              )}

              {/* What you get */}
              <div style={{ background: "rgba(147,51,234,0.04)", border: "1.5px solid rgba(147,51,234,0.15)", borderRadius: "1rem", padding: "1.25rem", marginTop: "1rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.purple600, marginBottom: "0.75rem" }}>What you get</div>
                {["Complete policy document, ready for legal review", "Regulatory citations specific to your profile", "Placeholder fields for easy customization", "Download as Markdown or copy to your doc editor", "Foundation for the AI Equity Intensive"].map(item => (
                  <div key={item} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: B.cyan600, fontSize: "0.8rem", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    <span style={{ fontSize: "0.78rem", color: B.gray600, lineHeight: "1.5" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── OUTPUT ───────────────────────────────────────── */}
        {(step === "generating" || step === "output") && policyText === "" && step === "generating" && (
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center", marginTop: step === "generating" ? "1.5rem" : 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "48px", height: "48px", margin: "0 auto 1.5rem", border: `3px solid rgba(147,51,234,0.2)`, borderTopColor: B.purple500, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: "0.9rem", fontWeight: "500", color: B.gray700, marginBottom: "0.4rem" }}>Drafting your policy…</div>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{industry} · {employees} employees · {sections.length} sections</div>
          </div>
        )}

        {(streamText || policyText) && (
          <div style={{ marginTop: "1.5rem" }}>
            {/* Output header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "600", color: B.gray800, marginBottom: "0.15rem" }}>
                  AI Governance Policy — {orgName || industry}
                </h2>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  {step === "output" ? `${charCount.toLocaleString()} characters · ${sections.length} sections · ready for legal review` : "Drafting…"}
                </div>
              </div>
              {step === "output" && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => { setStep("form"); setPolicyText(""); setStreamText(""); }} style={{ background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.78rem", color: B.gray600, cursor: "pointer", fontFamily: "inherit" }}>← Edit & Regenerate</button>
                  <button onClick={copyAll} style={{ background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.78rem", color: B.gray600, cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Copy</button>
                  <button onClick={downloadMarkdown} style={{ background: B.btnGradient, border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.78rem", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Download .md</button>
                </div>
              )}
            </div>

            {/* Policy document */}
            <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "2.5rem 2rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", minHeight: "400px" }}>
              {renderMarkdown(streamText || policyText)}
              {step === "generating" && <span style={{ display: "inline-block", width: "2px", height: "1em", background: B.purple500, animation: "pulse 0.8s infinite", verticalAlign: "text-bottom", marginLeft: "2px" }} />}
            </div>

            {/* CTA */}
            {step === "output" && (
              <div style={{ marginTop: "1.5rem", background: B.heroSolid, borderRadius: "1rem", padding: "1.75rem 2rem", color: "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08), transparent 60%)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <span style={{ display: "inline-block", marginBottom: "0.6rem", padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50px", fontSize: "0.68rem", fontWeight: "600", letterSpacing: "0.06em" }}>
                    This is your foundation. The Intensive builds the auditable framework.
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "400", marginBottom: "0.6rem" }}>
                    Ready to turn this policy into a real governance program?
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.7", marginBottom: "1.25rem", maxWidth: "520px" }}>
                    The AI Equity Intensive takes your policy skeleton and builds a full implementation roadmap — model inventory, bias testing protocols, incident response, and board-ready reporting. 90 minutes with Dr. Dédé. Specific to your organization.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    <a href="https://dr-dede.com/schedule-consultation" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: B.purple600, borderRadius: "0.5rem", padding: "0.75rem 1.5rem", fontSize: "0.875rem", fontWeight: "700", textDecoration: "none", display: "inline-block" }}>
                      Book the AI Equity Intensive →
                    </a>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>$2,500 individual · $5,000 enterprise team</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
