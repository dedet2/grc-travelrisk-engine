"use client";
import { useState, useRef, useCallback } from "react";

// ─── Brand Tokens ─────────────────────────────────────────────
const B = {
  heroSolid: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGradient: "linear-gradient(to right, #9333ea, #0891b2)",
  purple600: "#9333ea",
  purple500: "#a855f7",
  cyan600: "#0891b2",
  cyan400: "#22d3ee",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

const OFFERS = [
  { value: "intensive", label: "AI Equity Intensive", sub: "$2,500 / $5,000 enterprise" },
  { value: "starter", label: "AI Governance Starter Kit", sub: "$497" },
  { value: "cherry", label: "Cherry Blossom Retreat 2026", sub: "Apr 8–18 · Kamakura & Hakone" },
  { value: "speaking", label: "Keynote / Speaking", sub: "TEDx · Corporate events" },
  { value: "none", label: "Brand / Thought leadership", sub: "No direct CTA" },
];

const TONES = [
  { value: "authoritative", label: "Authoritative", desc: "Expert, confident, decisive" },
  { value: "vulnerable", label: "Vulnerable", desc: "Personal, honest, human" },
  { value: "educational", label: "Educational", desc: "Teaching, frameworks, insights" },
  { value: "provocative", label: "Provocative", desc: "Contrarian, bold, challenges assumptions" },
];

const POST_FORMATS = [
  "Hook + Story",
  "Data + Insight",
  "Contrarian Take",
  "Personal Experience",
  "Question-Led",
];

const OFFER_CTAs = {
  intensive: "The AI Equity Intensive — 90 min working session → your governance roadmap. DM me 'INTENSIVE' or visit incluu.us.",
  starter: "The AI Governance Starter Kit gives you the framework to start. $497 at incluu.us.",
  cherry: "The Cherry Blossom Edition — April 8–18, Kamakura & Hakone. 8 women. Details at rar.dr-dede.com.",
  speaking: "Bring this conversation to your organization. DM me about keynotes and workshops.",
  none: "",
};

const SYSTEM_PROMPT = `You are Dr. Dédé Tetsubayashi's LinkedIn content strategist and ghostwriter. You know her voice deeply.

ABOUT DR. DÉDÉ:
- Cornell PhD in Socio-cultural Anthropology
- Former Meta, Salesforce, Indeed, WeWork, Rakuten
- TEDx speaker on AI governance, disability, equity
- Sickle cell warrior — rest as resistance is her lived philosophy, not a slogan
- Japan-based; fluent in Japanese culture and corporate dynamics
- Specializes in AI governance, accessibility compliance, cultural sensitivity
- Founder of Incluu.us (AI governance consulting) and Rest as Resistance retreats

LINKEDIN VOICE RULES (Hassid + Ruben framework):
- Hook is ALWAYS the first line — standalone, punchy, makes them stop scrolling
- Never open with "I" as the first word
- Never use "excited to share" or "thrilled to announce"
- No hollow affirmations ("This is so important!")
- Reader-first structure: open with THEIR pain/question → insight → proof/story → CTA
- Short paragraphs. Max 3 sentences each. White space is intentional.
- Authentic > polished. She writes like she talks.
- Data when she has it. Story when she doesn't.
- Endings earn the click — the CTA feels like a natural next step, not a sales pitch
- No hashtag overload — max 3, only if truly relevant
- Character limit: aim for 1,000–1,800 characters per post (LinkedIn sweet spot)`;

// ─── Copy Button ──────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      background: copied ? "rgba(34,197,94,0.1)" : "rgba(147,51,234,0.08)",
      border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(147,51,234,0.2)"}`,
      color: copied ? "#16a34a" : B.purple600,
      borderRadius: "0.375rem",
      padding: "0.3rem 0.75rem",
      fontSize: "0.72rem",
      fontWeight: "600",
      cursor: "pointer",
      letterSpacing: "0.03em",
      transition: "all 0.2s",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Char Counter ─────────────────────────────────────────────
function CharCount({ text }) {
  const n = text.length;
  const color = n > 2000 ? "#ef4444" : n > 1500 ? "#f59e0b" : "#6b7280";
  return (
    <span style={{ fontSize: "0.7rem", color, fontVariantNumeric: "tabular-nums" }}>
      {n.toLocaleString()} chars
    </span>
  );
}

// ─── Single Post Card ─────────────────────────────────────────
function PostCard({ format, content, index, isStreaming }) {
  const formatColors = {
    "Hook + Story": { bg: "#faf5ff", border: "#e9d5ff", accent: B.purple600 },
    "Data + Insight": { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" },
    "Contrarian Take": { bg: "#fff7ed", border: "#fed7aa", accent: "#c2410c" },
    "Personal Experience": { bg: "#f0fdf4", border: "#bbf7d0", accent: "#15803d" },
    "Question-Led": { bg: "#f0fdfa", border: "#99f6e4", accent: "#0d9488" },
  };
  const c = formatColors[format] || formatColors["Hook + Story"];

  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid #e5e7eb`,
      borderTop: `3px solid ${c.accent}`,
      borderRadius: "0.875rem",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      marginBottom: "1rem",
    }}>
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1rem",
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            width: "22px", height: "22px", borderRadius: "50%",
            background: c.accent, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.65rem", fontWeight: "800",
          }}>{index + 1}</span>
          <span style={{ fontSize: "0.78rem", fontWeight: "600", color: c.accent }}>{format}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {content && <CharCount text={content} />}
          {content && <CopyBtn text={content} />}
        </div>
      </div>

      {/* Post content */}
      <div style={{ padding: "1.25rem 1rem" }}>
        {content ? (
          <pre style={{
            whiteSpace: "pre-wrap",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: "0.875rem",
            lineHeight: "1.75",
            color: B.gray700,
            margin: 0,
          }}>
            {content}
            {isStreaming && <span style={{
              display: "inline-block", width: "2px", height: "1em",
              background: c.accent, marginLeft: "2px", verticalAlign: "text-bottom",
              animation: "blink 0.8s step-end infinite",
            }} />}
          </pre>
        ) : (
          <div style={{
            height: "120px",
            background: `linear-gradient(90deg, #f3f4f6 25%, #e9d5ff20 50%, #f3f4f6 75%)`,
            backgroundSize: "200% 100%",
            borderRadius: "0.5rem",
            animation: "shimmer 1.5s infinite",
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Carousel Card ────────────────────────────────────────────
function CarouselCard({ concept, index }) {
  if (!concept) return (
    <div style={{
      background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "0.875rem",
      padding: "1.25rem", marginBottom: "0.75rem",
    }}>
      <div style={{ height: "80px", background: "linear-gradient(90deg, #f3f4f6 25%, #e9d5ff20 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", borderRadius: "0.5rem", animation: "shimmer 1.5s infinite" }} />
    </div>
  );

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e9d5ff",
      borderLeft: `3px solid ${B.purple500}`,
      borderRadius: "0.875rem", padding: "1.25rem", marginBottom: "0.75rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "600", color: B.purple600 }}>
          Carousel {index + 1}
        </span>
        <CopyBtn text={concept} />
      </div>
      <pre style={{
        whiteSpace: "pre-wrap",
        fontFamily: "inherit", fontSize: "0.82rem",
        lineHeight: "1.7", color: B.gray600, margin: 0,
      }}>{concept}</pre>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function LinkedInContentEngine() {
  const [topic, setTopic] = useState("");
  const [offer, setOffer] = useState("intensive");
  const [tone, setTone] = useState("authoritative");
  const [recentPosts, setRecentPosts] = useState("");
  const [posts, setPosts] = useState(Array(5).fill(""));
  const [carousels, setCarousels] = useState(Array(2).fill(""));
  const [status, setStatus] = useState("idle"); // idle | loading | streaming | done | error
  const [streamingIndex, setStreamingIndex] = useState(-1);
  const outputRef = useRef(null);

  const selectedOffer = OFFERS.find(o => o.value === offer);
  const selectedTone = TONES.find(t => t.value === tone);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setStatus("loading");
    setPosts(Array(5).fill(""));
    setCarousels(Array(2).fill(""));
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    const cta = OFFER_CTAs[offer];
    const voiceSamples = recentPosts.trim()
      ? `\n\nVOICE CALIBRATION — Her recent posts:\n${recentPosts.trim()}`
      : "";

    const userPrompt = `TOPIC / ANGLE: "${topic}"
TONE THIS WEEK: ${selectedTone?.label} — ${selectedTone?.desc}
OFFER TO DRIVE: ${selectedOffer?.label}${cta ? ` — CTA: "${cta}"` : " — No direct CTA, build authority/trust"}
${voiceSamples}

Generate exactly 7 pieces of content. Return ONLY raw JSON, no markdown:
{
  "posts": [
    { "format": "Hook + Story", "content": "full post text" },
    { "format": "Data + Insight", "content": "full post text" },
    { "format": "Contrarian Take", "content": "full post text" },
    { "format": "Personal Experience", "content": "full post text" },
    { "format": "Question-Led", "content": "full post text" }
  ],
  "carousels": [
    { "concept": "Carousel 1 title\\n\\nSlide 1: [hook]\\nSlide 2: [point]\\nSlide 3: [point]\\nSlide 4: [point]\\nSlide 5: [point]\\nSlide 6: [point]\\nFinal slide: [CTA or takeaway]" },
    { "concept": "Carousel 2 title\\n\\nSlide 1: [hook]\\nSlide 2: [point]\\nSlide 3: [point]\\nSlide 4: [point]\\nSlide 5: [point]\\nFinal slide: [CTA or takeaway]" }
  ]
}

Rules: Each post 1,000–1,800 characters. Hook stands alone on first line. Never open with "I". No "excited to share". Short paragraphs. White space intentional. CTA feels natural, not salesy.`;

    try {
      setStatus("streaming");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const parsed = JSON.parse(jsonMatch[0]);

      // Animate posts appearing one by one
      for (let i = 0; i < 5; i++) {
        setStreamingIndex(i);
        const postText = parsed.posts[i]?.content || "";
        // Type it out character by character (chunked for speed)
        const chunkSize = 8;
        for (let j = 0; j <= postText.length; j += chunkSize) {
          await new Promise(r => setTimeout(r, 12));
          setPosts(prev => {
            const next = [...prev];
            next[i] = postText.slice(0, j);
            return next;
          });
        }
        setPosts(prev => { const next = [...prev]; next[i] = postText; return next; });
      }

      setStreamingIndex(-1);
      setCarousels(parsed.carousels?.map(c => c.concept) || ["", ""]);
      setStatus("done");
    } catch (e) {
      console.error("Content engine error:", e);
      setStatus("error");
    }
  }, [topic, offer, tone, recentPosts, selectedOffer, selectedTone]);

  const isGenerating = status === "loading" || status === "streaming";
  const hasOutput = status === "streaming" || status === "done";

  return (
    <div style={{ minHeight: "100vh", background: B.gray50, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus, select:focus { outline: 2px solid #a855f7; outline-offset: 1px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 1.5rem",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "32px", height: "32px", background: B.heroSolid,
            borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.65rem", fontWeight: "800", color: "#fff",
          }}>LI</div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: B.gray800 }}>LinkedIn Content Engine</div>
            <div style={{ fontSize: "0.67rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Dr. Dédé Tetsubayashi · Private
            </div>
          </div>
        </div>
        <span style={{
          fontSize: "0.67rem", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase",
          color: "#16a34a", background: "rgba(22,163,74,0.08)",
          border: "1px solid rgba(22,163,74,0.2)", padding: "0.3rem 0.75rem", borderRadius: "50px",
        }}>Private Tool</span>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gridTemplateColumns: "340px 1fr", gap: "2rem", alignItems: "start" }}>

        {/* ─── LEFT: Input Panel ─────────────────────────────── */}
        <div style={{ position: "sticky", top: "72px" }}>

          {/* Topic */}
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.6rem" }}>
              Topic / Angle
            </label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. 'Why most corporate AI policies fail before they're implemented — and what the Fortune 500 gets wrong about governance'"
              rows={4}
              style={{
                width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem",
                padding: "0.75rem", fontSize: "0.875rem", lineHeight: "1.6",
                color: B.gray700, resize: "vertical", fontFamily: "inherit",
                background: B.gray50,
              }}
            />
          </div>

          {/* Offer */}
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>
              Drive To
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {OFFERS.map(o => (
                <button key={o.value} onClick={() => setOffer(o.value)} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.6rem",
                  padding: "0.65rem 0.75rem", borderRadius: "0.5rem",
                  background: offer === o.value ? "rgba(147,51,234,0.07)" : "transparent",
                  border: offer === o.value ? `1.5px solid ${B.purple500}` : "1.5px solid transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%",
                  transition: "all 0.15s",
                }}>
                  <span style={{
                    width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0,
                    border: offer === o.value ? `2px solid ${B.purple500}` : "2px solid #d1d5db",
                    background: offer === o.value ? B.purple500 : "transparent",
                    marginTop: "2px",
                  }} />
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: offer === o.value ? "600" : "400", color: offer === o.value ? B.purple600 : B.gray700 }}>{o.label}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{o.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>
              Tone This Week
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              {TONES.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)} style={{
                  padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
                  background: tone === t.value ? "rgba(147,51,234,0.07)" : "transparent",
                  border: tone === t.value ? `1.5px solid ${B.purple500}` : "1.5px solid #e5e7eb",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: tone === t.value ? "600" : "400", color: tone === t.value ? B.purple600 : B.gray700 }}>{t.label}</div>
                  <div style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice calibration */}
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.4rem" }}>
              Voice Calibration <span style={{ fontWeight: "400", color: "#9ca3af", textTransform: "none", letterSpacing: 0 }}>— optional</span>
            </label>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.6rem", lineHeight: "1.5" }}>
              Paste 1–2 recent posts to sharpen the voice match.
            </p>
            <textarea
              value={recentPosts}
              onChange={e => setRecentPosts(e.target.value)}
              placeholder="Paste your recent LinkedIn posts here..."
              rows={4}
              style={{
                width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem",
                padding: "0.75rem", fontSize: "0.8rem", lineHeight: "1.6",
                color: B.gray700, resize: "vertical", fontFamily: "inherit",
                background: B.gray50,
              }}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={isGenerating || !topic.trim()}
            style={{
              width: "100%",
              background: isGenerating || !topic.trim() ? "#e5e7eb" : B.btnGradient,
              color: isGenerating || !topic.trim() ? "#9ca3af" : "#fff",
              border: "none", borderRadius: "0.5rem",
              padding: "1rem", fontSize: "0.95rem", fontWeight: "700",
              cursor: isGenerating || !topic.trim() ? "not-allowed" : "pointer",
              letterSpacing: "0.01em", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
              transition: "all 0.2s",
            }}
          >
            {isGenerating ? (
              <>
                <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                Generating…
              </>
            ) : (
              "Generate 5 Posts + 2 Carousels →"
            )}
          </button>

          {status === "done" && (
            <button onClick={generate} style={{
              width: "100%", marginTop: "0.5rem",
              background: "transparent", border: "1.5px solid #e5e7eb",
              borderRadius: "0.5rem", padding: "0.7rem",
              fontSize: "0.82rem", color: B.gray600, cursor: "pointer", fontFamily: "inherit",
            }}>
              ↺ Regenerate
            </button>
          )}
        </div>

        {/* ─── RIGHT: Output Panel ───────────────────────────── */}
        <div ref={outputRef}>
          {status === "idle" && (
            <div style={{
              background: "#fff", border: "1.5px dashed #e9d5ff",
              borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "1rem",
                background: B.heroSolid,
                margin: "0 auto 1.25rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem",
              }}>✍️</div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "400", color: B.gray800, marginBottom: "0.5rem" }}>
                Your content sprint starts here.
              </h2>
              <p style={{ fontSize: "0.875rem", color: B.gray600, lineHeight: "1.7", maxWidth: "380px", margin: "0 auto" }}>
                Enter a topic, select your offer and tone, hit generate. Get 5 ready-to-post LinkedIn posts and 2 carousel concepts in your voice — in under 60 seconds.
              </p>
              <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
                {["Hassid hook framework", "Ruben reader-first structure", "Your authentic voice"].map(t => (
                  <span key={t} style={{
                    fontSize: "0.72rem", fontWeight: "600", color: B.purple600,
                    background: "rgba(147,51,234,0.07)",
                    border: "1px solid rgba(147,51,234,0.15)",
                    padding: "0.3rem 0.75rem", borderRadius: "50px",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {status === "error" && (
            <div style={{
              background: "#fff", border: "1.5px solid #fecaca",
              borderRadius: "1rem", padding: "2rem", textAlign: "center",
            }}>
              <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>Generation failed. Please try again.</p>
              <button onClick={generate} style={{ background: B.btnGradient, color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.75rem 1.5rem", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>
                Try Again
              </button>
            </div>
          )}

          {hasOutput && (
            <>
              {/* Status bar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem",
              }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: "600", color: B.gray800, marginBottom: "0.1rem" }}>
                    {topic.length > 60 ? topic.slice(0, 60) + "…" : topic}
                  </h2>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {selectedOffer?.label} · {selectedTone?.label}
                  </div>
                </div>
                {status === "streaming" && (
                  <span style={{
                    fontSize: "0.72rem", fontWeight: "600", color: B.purple600,
                    background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)",
                    padding: "0.3rem 0.75rem", borderRadius: "50px",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                  }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: B.purple500, animation: "blink 1s infinite" }} />
                    Writing…
                  </span>
                )}
                {status === "done" && (
                  <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "0.3rem 0.75rem", borderRadius: "50px" }}>
                    ✓ 5 posts + 2 carousels ready
                  </span>
                )}
              </div>

              {/* Posts */}
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem" }}>
                  LinkedIn Posts
                </div>
                {POST_FORMATS.map((format, i) => (
                  <PostCard
                    key={format}
                    format={format}
                    content={posts[i]}
                    index={i}
                    isStreaming={streamingIndex === i}
                  />
                ))}
              </div>

              {/* Carousels */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: B.gray600, marginBottom: "0.75rem", marginTop: "0.5rem" }}>
                  Carousel Concepts
                </div>
                {carousels.map((c, i) => (
                  <CarouselCard key={i} concept={c} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
