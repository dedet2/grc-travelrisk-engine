"use client";
import { useState, useRef, useCallback } from "react";

const B = {
  purple50:"#faf5ff",purple100:"#f3e8ff",purple200:"#e9d5ff",purple300:"#d8b4fe",
  purple400:"#c084fc",purple500:"#a855f7",purple600:"#9333ea",purple700:"#7c3aed",
  gray50:"#f9fafb",gray100:"#f3f4f6",gray200:"#e5e7eb",gray300:"#d1d5db",
  gray400:"#9ca3af",gray500:"#6b7280",gray600:"#4b5563",gray700:"#374151",
  gray800:"#1f2937",gray900:"#111827",
  red50:"#fef2f2",red100:"#fee2e2",red500:"#ef4444",red600:"#dc2626",
  green50:"#f0fdf4",green500:"#22c55e",green600:"#16a34a",
  yellow50:"#fefce8",yellow500:"#eab308",
  blue50:"#eff6ff",blue500:"#3b82f6",blue600:"#2563eb",
  orange50:"#fff7ed",orange500:"#f97316",
  white:"#ffffff",
};

interface SectionResult {
  score: number;
  level: "Critical" | "High" | "Medium" | "Low";
  findings: string[];
  recommendations: string[];
  raw?: string;
}

interface AssessmentResults {
  employment?: SectionResult;
  housing?: SectionResult;
  healthcare?: SectionResult;
  education?: SectionResult;
  digitalAccess?: SectionResult;
  criminalJustice?: SectionResult;
  environmental?: SectionResult;
  financial?: SectionResult;
  overall?: { score: number; level: string; summary: string };
}

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Critical: { bg: B.red50, text: B.red600, border: B.red500 },
    High: { bg: B.orange50, text: "#c2410c", border: B.orange500 },
    Medium: { bg: B.yellow50, text: "#92400e", border: B.yellow500 },
    Low: { bg: B.green50, text: B.green600, border: B.green500 },
  };
  const c = colors[level] || colors.High;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.875rem",
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: "1px solid " + c.border,
    }}>
      {score}/100 Â· {level}
    </span>
  );
}

function SectionCard({ title, result }: { title: string; result: SectionResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: B.white,
      border: "1px solid " + B.gray200,
      borderRadius: "0.75rem",
      overflow: "hidden",
      marginBottom: "0.75rem",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontWeight: 600, color: B.gray800, fontSize: "0.95rem" }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ScoreBadge score={result.score} level={result.level} />
          <span style={{ color: B.gray400, fontSize: "1.1rem" }}>{open ? "â²" : "â¼"}</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid " + B.gray100 }}>
          {result.findings.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: 600, color: B.gray700, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                Key Findings
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {result.findings.map((f, i) => (
                  <li key={i} style={{
                    padding: "0.375rem 0",
                    borderBottom: i < result.findings.length - 1 ? "1px solid " + B.gray100 : "none",
                    color: B.gray600,
                    fontSize: "0.875rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}>
                    <span style={{ color: B.red500, flexShrink: 0 }}>â </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.recommendations.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: 600, color: B.gray700, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                Recommendations
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {result.recommendations.map((r, i) => (
                  <li key={i} style={{
                    padding: "0.375rem 0",
                    borderBottom: i < result.recommendations.length - 1 ? "1px solid " + B.gray100 : "none",
                    color: B.gray600,
                    fontSize: "0.875rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}>
                    <span style={{ color: B.green500, flexShrink: 0 }}>â</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? B.green500 : score >= 50 ? B.yellow500 : score >= 25 ? B.orange500 : B.red500;
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke={B.gray200} strokeWidth="10" />
      <circle
        cx="64" cy="64" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="64" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill={B.gray800}>{score}</text>
      <text x="64" y="78" textAnchor="middle" fontSize="11" fill={B.gray500}>/100</text>
    </svg>
  );
}

function parseSection(raw: string): SectionResult {
  const scoreMatch = raw.match(/SCORE:\s*(\d+)/i);
  const levelMatch = raw.match(/RISK[_\s]?LEVEL:\s*(Critical|High|Medium|Low)/i);
  const findingsMatch = raw.match(/FINDINGS:([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);
  const recsMatch = raw.match(/RECOMMENDATIONS:([\s\S]*?)$/i);

  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
  const level = (levelMatch?.[1] as SectionResult["level"]) || "High";

  const parseList = (block: string | undefined): string[] => {
    if (!block) return [];
    return block
      .split("\n")
      .map((l) => l.replace(/^[-*\d.]+\s*/, "").trim())
      .filter((l) => l.length > 10);
  };

  return {
    score,
    level,
    findings: parseList(findingsMatch?.[1]),
    recommendations: parseList(recsMatch?.[1]),
    raw,
  };
}

const SECTIONS = [
  { key: "employment", label: "Employment & Workplace" },
  { key: "housing", label: "Housing & Accommodations" },
  { key: "healthcare", label: "Healthcare Access" },
  { key: "education", label: "Education & Training" },
  { key: "digitalAccess", label: "Digital Accessibility" },
  { key: "criminalJustice", label: "Criminal Justice" },
  { key: "environmental", label: "Environmental & Structural" },
  { key: "financial", label: "Financial Services" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

export default function EnhancedAssessment() {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"form" | "running" | "results">("form");
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("");
  const [results, setResults] = useState<AssessmentResults>({});
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const callClaude = useCallback(async (prompt: string): Promise<string> => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({ prompt, maxTokens: 1024 }),
    });
    if (!res.ok) throw new Error("API error " + res.status);
    const data = await res.json();
    return data.content ?? data.text ?? "";
  }, []);

  const runAssessment = useCallback(async () => {
    if (!orgName.trim()) {
      setError("Please enter your organization name.");
      return;
    }
    setError("");
    setStep("running");
    setProgress(0);
    setResults({});
    const ctx = `Organization: ${orgName} | Type: ${orgType || "Not specified"} | Size: ${orgSize || "Not specified"} | Description: ${description || "No description provided"}`;
    const newResults: AssessmentResults = {};

    try {
      for (let i = 0; i < SECTIONS.length; i++) {
        const sec = SECTIONS[i];
        setCurrentSection(sec.label);
        setProgress(Math.round((i / SECTIONS.length) * 85));

        const prompt = `You are an AI equity and bias auditor. Analyze ${sec.label} equity risks for the following organization.

${ctx}

Respond in exactly this format:
SCORE: [0-100, where 100 = maximum equity risk]
RISK_LEVEL: [Critical/High/Medium/Low]
FINDINGS:
- [Finding 1]
- [Finding 2]
- [Finding 3]
RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]`;

        const raw = await callClaude(prompt);
        const parsed = parseSection(raw);
        newResults[sec.key as SectionKey] = parsed;
        setResults({ ...newResults });
      }

      setCurrentSection("Overall Assessment");
      setProgress(90);

      const scores = SECTIONS.map((s) => newResults[s.key as SectionKey]?.score ?? 50);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const overallLevel = avgScore >= 75 ? "Critical" : avgScore >= 50 ? "High" : avgScore >= 25 ? "Medium" : "Low";

      const overallPrompt = `You are an AI equity auditor. Provide a 2-3 sentence executive summary of overall equity risk for:

${ctx}

Section scores: ${SECTIONS.map((s) => s.label + ": " + (newResults[s.key as SectionKey]?.score ?? "N/A")).join(", ")}

Respond with just the summary paragraph, no headers.`;

      const overallRaw = await callClaude(overallPrompt);
      newResults.overall = { score: avgScore, level: overallLevel, summary: overallRaw.trim() };
      setResults({ ...newResults });
      setProgress(100);
      setStep("results");
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setError("Assessment failed: " + (e as Error).message);
        setStep("form");
      }
    }
  }, [orgName, orgType, orgSize, description, callClaude]);

  const levelColors: Record<string, string> = {
    Critical: B.red500,
    High: B.orange500,
    Medium: B.yellow500,
    Low: B.green500,
  };

  const overallColor = levelColors[results.overall?.level ?? "High"] ?? B.orange500;

  if (step === "running") {
    return (
      <div style={{
        minHeight: "100vh",
        background: B.gray50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{
          background: B.white,
          borderRadius: "1rem",
          padding: "3rem",
          maxWidth: "480px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: B.purple100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "1.75rem",
          }}>
            ð
          </div>
          <h2 style={{ margin: "0 0 0.5rem", color: B.gray800, fontSize: "1.25rem", fontWeight: 700 }}>
            Running Equity Assessment
          </h2>
          <p style={{ color: B.gray500, margin: "0 0 2rem", fontSize: "0.875rem" }}>
            Analyzing {currentSection}...
          </p>
          <div style={{
            background: B.gray100,
            borderRadius: "9999px",
            height: "8px",
            overflow: "hidden",
            marginBottom: "0.75rem",
          }}>
            <div style={{
              height: "100%",
              width: progress + "%",
              background: "linear-gradient(90deg, " + B.purple500 + ", " + B.purple600 + ")",
              borderRadius: "9999px",
              transition: "width 0.4s ease",
            }} />
          </div>
          <p style={{ color: B.gray400, fontSize: "0.8rem" }}>{progress}% complete</p>
          <button
            onClick={() => { abortRef.current?.abort(); setStep("form"); }}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.5rem",
              background: "none",
              border: "1px solid " + B.gray300,
              borderRadius: "0.5rem",
              color: B.gray600,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === "results" && results.overall) {
    const completedSections = SECTIONS.filter((s) => results[s.key as SectionKey]);
    return (
      <div style={{
        minHeight: "100vh",
        background: B.gray50,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{
          background: "linear-gradient(135deg, " + B.purple600 + ", " + B.purple700 + ")",
          padding: "2rem 1.5rem",
          color: B.white,
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <p style={{ margin: "0 0 0.25rem", opacity: 0.8, fontSize: "0.875rem" }}>
              AI Equity Assessment Report
            </p>
            <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.75rem", fontWeight: 700 }}>
              {orgName}
            </h1>
            <p style={{ margin: 0, opacity: 0.7, fontSize: "0.875rem" }}>
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
          <div style={{
            background: B.white,
            borderRadius: "1rem",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}>
            <ProgressRing score={results.overall.score} />
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.875rem", color: B.gray500 }}>
                Overall Equity Risk Score
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: B.gray900 }}>
                  {results.overall.score}
                </span>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  background: overallColor + "20",
                  color: overallColor,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}>
                  {results.overall.level} Risk
                </span>
              </div>
              <p style={{ margin: 0, color: B.gray600, fontSize: "0.875rem", lineHeight: 1.6 }}>
                {results.overall.summary}
              </p>
            </div>
          </div>

          <h2 style={{ margin: "0 0 1rem", color: B.gray800, fontSize: "1.1rem", fontWeight: 700 }}>
            Section Analysis
          </h2>
          {completedSections.map((sec) => {
            const r = results[sec.key as SectionKey];
            if (!r) return null;
            return (
              <SectionCard key={sec.key} title={sec.label} result={r} />
            );
          })}

          <button
            onClick={() => { setStep("form"); setResults({}); }}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 2rem",
              background: B.purple600,
              color: B.white,
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: B.gray50,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        background: "linear-gradient(135deg, " + B.purple600 + ", " + B.purple700 + ")",
        padding: "2.5rem 1.5rem",
        color: B.white,
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          fontSize: "1.5rem",
          marginBottom: "1rem",
        }}>
          âï¸
        </div>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: 700 }}>
          AI Equity Assessment
        </h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.95rem" }}>
          Identify equity risks and disparate impacts across 8 domains
        </p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{
          background: B.white,
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {error && (
            <div style={{
              background: B.red50,
              border: "1px solid " + B.red100,
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              color: B.red600,
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontWeight: 600, color: B.gray700, marginBottom: "0.4rem", fontSize: "0.875rem" }}>
              Organization Name *
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                border: "1px solid " + B.gray300,
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontWeight: 600, color: B.gray700, marginBottom: "0.4rem", fontSize: "0.875rem" }}>
              Organization Type
            </label>
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                border: "1px solid " + B.gray300,
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                background: B.white,
                boxSizing: "border-box",
              }}
            >
              <option value="">Select type...</option>
              <option value="Tech/SaaS">Tech / SaaS</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance / Banking</option>
              <option value="Government">Government / Public Sector</option>
              <option value="Education">Education</option>
              <option value="Nonprofit">Nonprofit</option>
              <option value="Retail">Retail / Consumer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontWeight: 600, color: B.gray700, marginBottom: "0.4rem", fontSize: "0.875rem" }}>
              Organization Size
            </label>
            <select
              value={orgSize}
              onChange={(e) => setOrgSize(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                border: "1px solid " + B.gray300,
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                background: B.white,
                boxSizing: "border-box",
              }}
            >
              <option value="">Select size...</option>
              <option value="1-50">1 â 50 employees</option>
              <option value="51-200">51 â 200 employees</option>
              <option value="201-1000">201 â 1,000 employees</option>
              <option value="1001-5000">1,001 â 5,000 employees</option>
              <option value="5000+">5,000+ employees</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, color: B.gray700, marginBottom: "0.4rem", fontSize: "0.875rem" }}>
              Brief Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your organization's products, services, or AI systems being assessed..."
              rows={4}
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                border: "1px solid " + B.gray300,
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            onClick={runAssessment}
            disabled={!orgName.trim()}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: orgName.trim() ? B.purple600 : B.gray300,
              color: orgName.trim() ? B.white : B.gray500,
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: orgName.trim() ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Start Equity Assessment â
          </button>

          <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {SECTIONS.map((s) => (
              <span key={s.key} style={{
                padding: "0.2rem 0.6rem",
                background: B.purple50,
                color: B.purple700,
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
