"use client";
import { useState, useRef } from "react";

// ──── Brand Tokens ────────────────────────────────────────────────────────────
const B = {
  heroSolid: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGradient: "linear-gradient(to right, #9333ea, #0891b2)",
  purple600: "#9333ea",
  purple500: "#a855f7",
  cyan600: "#0891b2",
  gray50: "#f9fafb",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

const MARCH_15 = new Date("2025-03-15T23:59:00-08:00"); // PST

const RELATIONSHIP_TYPES = [
  "Former colleague", "Conference / event connection", "Mutual connection intro",
  "LinkedIn follower / commenter", "Past client", "Friend / personal network",
  "Speaker bureau / booking contact", "Community member (Athena, BLCK VC, WIP)",
];

const WARMTH_LEVELS = [  { value: "warm", label: "Warm", desc: "We've talked recently or have real rapport" },
  { value: "cool", label: "Cool", desc: "We connected but haven't spoken in a while" },
  { value: "cold", label: "Cold", desc: "LinkedIn connection, minimal interaction" },
];

const REASONS = [
  "Needs rest / burnout signals visible",
  "Posted about Japan or travel interest",
  "Commented on wellness / rest content",
  "In a leadership role (stress likely high)",
  "Recent major life event (promotion, loss, transition)",
  "Mentioned DEI or equity work",
  "I just feel she'd love this",
];

const SYSTEM_PROMPT = `You are Dr. Dédé Tetsubayashi's personal outreach assistant for her Cherry Blossom Rest as Resistance Retreat, April 8–18, 2026. You write warm, personalized LinkedIn DM sequences for each "use client";
import { useState, useRef } from "react";

// ──── Brand Tokens ────────────────────────────────────────────────────────────
const B = {
  heroSolid: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGradient: "linear-gradient(to right, #9333ea, #0891b2)",
  purple600: "#9333ea",
  purple500: "#a855f7",
  cyan600: "#0891b2",
  gray50: "#f9fafb",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

const MARCH_15 = new Date("2025-03-15T23:59:00-08:00"); // PST

const RELATIONSHIP_TYPES = [
  "Former colleague", "Conference / event connection", "Mutual connection intro",
  "LinkedIn follower / commenter", "Past client", "Friend / personal network",
  "Speaker bureau / booking contact", "Community member (Athena, BLCK VC, WIP)",
];

const WARMTH_LEVELS = [
  { value: "warm", label: "Warm", desc: "We've talked recently or have real rapport" },
  { value: "cool", label: "Cool", desc: "We connected but haven't spoken in a while" },
  { value: "cold", label: "Cold", desc: "LinkedIn connection, minimal interaction" },
];

const REASONS = [
  "Needs rest / burnout signals visible",
  "Posted about Japan or travel interest",
  "Commented on wellness / rest content",
  "In a leadership role (stress likely high)",
  "Recent major life event (promotion, loss, transition)",
  "Mentioned DEI or equity work",
  "I just feel she'd love this",
];

const SYSTEM_PROMPT = `You are Dr. Dédé Tetsubayashi's personal outreach assistant for her Cherry Blossom Rest as Resistance Retreat, April 8–18, 2026. You write warm, personalized LinkedIn DM sequences for each prospect.

ABOUT THE RETREAT:
- Cherry Blossom Edition: April 8–18, 2026, Kamakura & Hakone, Japan
- 10 days during peak sakura season
- Maximum 8 women (intimate by design)
- Rest as Resistance philosophy — intentional rest as an act of reclaiming power
- Includes: luxury accommodations, guided experiences, forest therapy, onsen, cultural immersion, facilitated reflection circles
- Dr. Dédé is the lead facilitator — 15+ years Japan experience, Cornell PhD, TEDx speaker
- FINAL PAYMENT DEADLINE: March 15, 2026 — retreat may cancel if minimum not met
- Investment: [Dr. Dédé sets price]
- Details: rar.dr-dede.com/cherry-blossom-2026

VOICE RULES:
- Write as Dr. Dédé, in first person
- Warm, direct, never salesy
- Reference something specific to THIS person (their role, company, a post they made, how you met)
- The invitation feels personal, not broadcast
- No performative urgency ("LAST CHANCE!!!") — the March 15 deadline is real and stated plainly
- Each message is complete on its own — they don't need to have seen the previous
- Short sentences. White space. Easy to read on mobile.
- Never mention price in the first message
- The ask is always "would this resonate?" not "please buy"`;

function CopyBtn({ text, small }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        background: copied ? "rgba(34,197,94,0.1)" : "rgba(147,51,234,0.08)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(147,51,234,0.2)"}`,
        color: copied ? "#16a34a" : B.purple600,
        borderRadius: "0.375rem", padding: small ? "0.2rem 0.6rem" : "0.3rem 0.75rem",
        fontSize: "0.72rem", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s", whiteSpace: "nowrap",
      }}>{copied ? "✓ Copied" : "Copy"}</button>
  );
}

function CountdownBadge() {
  const now = new Date();
  const diff = MARCH_15 - now;
  if (diff <= 0) return <span style={{ color: "#ef4444", fontWeight: "700", fontSize: "0.82rem" }}>Deadline passed</span>;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <span style={{ fontSize: "0.68rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>March 15 deadline:</span>
      <span style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "50px", padding: "0.2rem 0.75rem", fontSize: "0.72rem", fontWeight: "700", color: "#b91c1c" }}>
        {days}d {hrs}h remaining
      </span>
    </div>
  );
}

function EmptyRow(onAdd) {
  return { id: Date.now(), name: "", title: "", company: "", relationship: "", warmth: "warm", reasons: [], notes: "", messages: null, generating: false };
}

function ProspectRow({ prospect, index, onChange, onRemove, onGenerate }) {
  const [expanded, setExpanded] = useState(true);
  const hasMessages = !!prospect.messages;

  return (
    <div style={{
      background: "#fff", border: `1.5px solid ${hasMessages ? "rgba(147,51,234,0.25)" : "#e5e7eb"}`,
      borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      marginBottom: "1rem",
    }}>
      {/* Row header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        background: hasMessages ? "rgba(147,51,234,0.04)" : B.gray50,
        borderBottom: expanded ? "1px solid #e5e7eb" : "none",
        cursor: "pointer",
      }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: hasMessages ? B.heroSolid : "#e5e7eb",
            color: hasMessages ? "#fff" : "#9ca3af",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.72rem", fontWeight: "700", flexShrink: 0,
          }}>{index + 1}</span>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: "600", color: B.gray800 }}>
              {prospect.name || <span style={{ color: "#9ca3af", fontWeight: "400" }}>New contact…</span>}
            </div>
            {(prospect.title || prospect.company) && (
              <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{prospect.title}{prospect.title && prospect.company ? " · " : ""}{prospect.company}</div>
            )}
          </div>
          {hasMessages && <span style={{ fontSize: "0.65rem", fontWeight: "700", letterSpacing: "0.1em", color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "0.15rem 0.5rem", borderRadius: "50px" }}>3 DMS READY</span>}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: "1rem", padding: "0.2rem" }}>×</button>
          <span style={{ color: "#d1d5db", fontSize: "0.8rem" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "1.25rem" }}>
          {/* Basic info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            {[["Name *", "name", "Sarah Chen"], ["Title", "title", "VP of People"], ["Company", "company", "Acme Corp"]].map(([label, key, ph]) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: B.gray600, marginBottom: "0.35rem" }}>{label}</label>
                <input value={prospect[key]} onChange={e => onChange({ ...prospect, [key]: e.target.value })}
                  placeholder={ph}
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.55rem 0.7rem", fontSize: "0.82rem", color: B.gray700, fontFamily: "inherit", background: B.gray50 }} />
              </div>
            ))}
          </div>

          {/* Relationship */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: B.gray600, marginBottom: "0.4rem" }}>How you know her</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {RELATIONSHIP_TYPES.map(r => {
                const on = prospect.relationship === r;
                return (
                  <button key={r} onClick={() => onChange({ ...prospect, relationship: on ? "" : r })} style={{
                    padding: "0.3rem 0.7rem", borderRadius: "50px",
                    background: on ? B.heroSolid : "transparent",
                    border: on ? "none" : "1.5px solid #e5e7eb",
                    color: on ? "#fff" : B.gray600,
                    fontSize: "0.72rem", fontWeight: on ? "600" : "400",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{r}</button>
                );
              })}
            </div>
          </div>

          {/* Warmth */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: B.gray600, marginBottom: "0.4rem" }}>Relationship warmth</label>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {WARMTH_LEVELS.map(w => {
                const on = prospect.warmth === w.value;
                return (
                  <button key={w.value} onClick={() => onChange({ ...prospect, warmth: w.value })} style={{
                    padding: "0.5rem 0.85rem", borderRadius: "0.5rem",
                    background: on ? "rgba(147,51,234,0.07)" : "transparent",
                    border: on ? `1.5px solid ${B.purple500}` : "1.5px solid #e5e7eb",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: on ? "600" : "400", color: on ? B.purple600 : B.gray700 }}>{w.label}</div>
                    <div style={{ fontSize: "0.67rem", color: "#9ca3af" }}>{w.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reasons */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: B.gray600, marginBottom: "0.4rem" }}>Why she might resonate</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {REASONS.map(r => {
                const on = prospect.reasons.includes(r);
                return (
                  <button key={r} onClick={() => onChange({ ...prospect, reasons: on ? prospect.reasons.filter(x => x !== r) : [...prospect.reasons, r] })} style={{
                    padding: "0.3rem 0.7rem", borderRadius: "50px",
                    background: on ? "rgba(147,51,234,0.07)" : "transparent",
                    border: on ? `1.5px solid ${B.purple500}` : "1.5px solid #e5e7eb",
                    color: on ? B.purple600 : B.gray600,
                    fontSize: "0.72rem", fontWeight: on ? "600" : "400",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{r}</button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: B.gray600, marginBottom: "0.35rem" }}>
              Anything specific to reference? <span style={{ color: "#9ca3af", textTransform: "none", fontWeight: "400", letterSpacing: 0 }}>optional</span>
            </label>
            <textarea value={prospect.notes} onChange={e => onChange({ ...prospect, notes: e.target.value })}
              placeholder="e.g. She posted about Japan last month, she's going through a big career pivot, we met at the Athena summit in October..."
              rows={2}
              style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.65rem 0.75rem", fontSize: "0.8rem", color: B.gray700, resize: "vertical", fontFamily: "inherit", background: B.gray50 }} />
          </div>

          {/* Generate button */}
          <button onClick={() => onGenerate(prospect)} disabled={!prospect.name || prospect.generating}
            style={{
              background: prospect.name && !prospect.generating ? B.btnGradient : "#e5e7eb",
              color: prospect.name && !prospect.generating ? "#fff" : "#9ca3af",
              border: "none", borderRadius: "0.5rem", padding: "0.7rem 1.5rem",
              fontSize: "0.82rem", fontWeight: "600", cursor: prospect.name && !prospect.generating ? "pointer" : "not-allowed",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
            {prospect.generating ? (
              <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />Writing DMs…</>
            ) : hasMessages ? "↺ Regenerate DMs" : "Write 3-Part DM Sequence →"}
          </button>

          {/* Messages output */}
          {hasMessages &&
            (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ height: "1px", background: "#e5e7eb", marginBottom: "1.25rem" }} />
              {[
                { key: "dm1", label: "DM 1 — Warm Open", sublabel: "Send today", color: B.purple600, bg: "#faf5ff", border: "#e9d5ff" },
                { key: "dm2", label: "DM 2 — Follow-Up", sublabel: "Send if no reply in 3 days", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
                { key: "dm3", label: "DM 3 — Final Nudge", sublabel: "Send by March 10 with urgency", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
              ].map(({ key, label, sublabel, color, bg, border }) => (
                <div key={key} style={{ background: bg, border: `1.5px solid ${border}`, borderLeft: `4px solid ${color}`, borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                    <div>
                      <span style={{ fontSize: "0.78rem", fontWeight: "700", color }}>{label}</span>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af", marginLeft: "0.6rem" }}>{sublabel}</span>
                    </div>
                    <CopyBtn text={prospect.messages[key]} small />
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.82rem", lineHeight: "1.7", color: B.gray700, margin: 0 }}>
                    {prospect.messages[key]}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──── Main ────────────────────────────────────────────────────────────────────────────────────
export default function OutreachAgent() {
  const [prospects, setProspects] = useState([
    { id: 1, name: "", title: "", company: "", relationship: "", warmth: "warm", reasons: [], notes: "", messages: null, generating: false },
  ]);

  function addProspect() {
    setProspects(p => [...p, { id: Date.now(), name: "", title: "", company: "", relationship: "", warmth: "warm", reasons: [], notes: "", messages: null, generating: false }]);
  }

  function updateProspect(id, updated) {
    setProspects(p => p.map(x => x.id === id ? updated : x));
  }

  function removeProspect(id) {
    setProspects(p => p.filter(x => x.id !== id));
  }

  async function generateMessages(prospect) {
    setProspects(p => p.map(x => x.id === prospect.id ? { ...x, generating: true } : x));

    const warmthMap = { warm: "We have genuine rapport — be warm and personal from the first line.", cool: "We connected but haven't talked in a while — re-establish warmth before the invitation.", cold: "We're LinkedIn connections with minimal interaction — lead with genuine value before any ask." };

    const prompt = `Write a 3-part LinkedIn DM sequence for Dr. Dédé inviting this specific person to the Cherry Blossom Retreat.

PROSPECT:
- Name: ${prospect.name}
- Title: ${prospect.title || "not specified"}
- Company: ${prospect.company || "not specified"}
- How we know each other: ${prospect.relationship || "LinkedIn connection"}
- Relationship warmth: ${warmthMap[prospect.warmth]}
- Why she might resonate: ${prospect.reasons.length > 0 ? prospect.reasons.join(", ") : "general fit"}
- Specific context to reference: ${prospect.notes || "none provided"}

Return ONLY raw JSON, no markdown:
{
  "dm1": "First DM — warm, personal, specific to her. Under 250 words. End with a soft question that invites a response, not a hard sell. Do NOT mention price.",
  "dm2": "Follow-up DM if no reply in 3 days — under 180 words. Acknowledge she's busy. Add one new piece of value or context. Soft ask again.",
  "dm3": "Final nudge by March 10 — under 150 words. Acknowledge the deadline genuinely (March 15 final payment, retreat may not run if minimum not met). No manipulation. Warm close whether or not she joins."
}

Make each DM feel like Dr. Dédé sat down and wrote it specifically for ${prospect.name}. Not a template. Not a broadcast. A real message from one woman to another.`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");
      const messages = JSON.parse(match[0]);
      setProspects(p => p.map(x => x.id === prospect.id ? { ...x, generating: false, messages } : x));
    } catch (e) {
      console.error(e);
      setProspects(p => p.map(x => x.id === prospect.id ? { ...x, generating: false } : x));
      alert("Failed to generate. Please try again.");
    }
  }

  const readyCount = prospects.filter(p => p.messages).length;
  const totalCount = prospects.filter(p => p.name).length;

  return (
    <div style={{ minHeight: "100vh", background: B.gray50, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`* { box-sizing: border-box; } textarea:focus, input:focus { outline: 2px solid #a855f7; outline-offset: 1px; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb", padding: "1rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "0.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #ec4899, #a855f7)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>🌸</div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: B.gray800 }}>Cherry Blossom Outreach Agent</div>
            <div style={{ fontSize: "0.67rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Private · Dr. Dédé Tetsubayashi</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <CountdownBadge />
          {readyCount > 0 && (
            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "0.3rem 0.75rem", borderRadius: "50px" }}>
              {readyCount} of {totalCount} ready to send
            </span>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.85) 0%, rgba(168,85,247,0.9) 50%, rgba(34,211,238,0.85) 100%)", color: "#fff", padding: "2rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent 55%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative" }}>
          <h1 style={{ fontSize: "clamp(1.3rem, 3.5vw, 1.9rem)", fontWeight: "300", lineHeight: "1.3", marginBottom: "0.65rem" }}>
            Close Cherry Blossom with <strong style={{ fontWeight: "700" }}>personal outreach, not broadcast.</strong>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.88)", lineHeight: "1.7", maxWidth: "520px" }}>
            Enter each warm contact, and get a personalized 3-DM LinkedIn sequence written for her specifically. Review, copy, send. March 15 is 17 days out — 8 spots, minimum not yet reached.
          </p>
        </div>
      </div>

      {/* Instruction strip */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0.85rem 1.5rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          {[["1", "Add contacts below"], ["2", "Fill in her context"], ["3", "Generate personalized DMs"], ["4", "Review → copy → send on LinkedIn"]].map(([n, t]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: B.heroSolid, color: "#fff", fontSize: "0.65rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: "0.78rem", color: B.gray600 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prospect list */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}>
        {prospects.map((p, i) => (
          <ProspectRow
            key={p.id}
            prospect={p}
            index={i}
            onChange={updated => updateProspect(p.id, updated)}
            onRemove={() => removeProspect(p.id)}
            onGenerate={generateMessages}
          />
        ))}

        <button onClick={addProspect} style={{
          width: "100%", background: "transparent",
          border: "2px dashed #e9d5ff", borderRadius: "1rem",
          padding: "1rem", fontSize: "0.85rem", color: B.purple600,
          fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
          transition: "all 0.2s",
        }}>
          + Add another contact
        </button>

        {/* Closing tip */}
        <div style={{ marginTop: "2rem", background: "rgba(236,72,153,0.04)", border: "1.5px solid rgba(236,72,153,0.15)", borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "#be185d", marginBottom: "0.6rem" }}>
            Outreach Playbook · March 15 Close
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            {[
              ["Send DM 1 today", "For every warm lead you have"],
              ["DM 2 on day 3–4", "If no reply, follow up once"],
              ["DM 3 by March 10", "Final honest urgency — deadline is real"],
              ["8 contacts minimum", "You need 8 to not cancel — work backwards"],
              ["Your best closes: WHM", "Women's History Month is your tailwind"],
              ["Co-promo March 9", "8 Connection Architects — warm their audience"],
            ].map(([a, b]) => (
              <div key={a} style={{ display: "flex", gap: "0.4rem" }}>
                <span style={{ color: "#be185d", fontSize: "0.8rem", flexShrink: 0 }}>→</span>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: "600", color: B.gray700 }}>{a}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
