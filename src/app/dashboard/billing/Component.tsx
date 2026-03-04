import { useState, useEffect } from "react";

// ─── Brand ─────────────────────────────────────────────────────
const B = {
  heroGrad: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGrad:  "linear-gradient(to right, #9333ea, #0891b2)",
  purple: "#9333ea", purple5: "#a855f7", cyan: "#0891b2",
  bg: "#f9fafb", card: "#ffffff", dark: "#0f0a1e",
  gray600: "#4b5563", gray700: "#374151", gray800: "#1f2937",
};

// ─── Stripe Checkout Links ──────────────────────────────────────
const STRIPE_LINKS = {
  starter_monthly:    "https://buy.stripe.com/8x29AT7OKgQd1mm4KZ7kc0a",  // AI Governance Advisory $997/mo
  starter_annual:     "https://buy.stripe.com/7sY5kD5GCbvT8OO7Xb7kc0b",  // AI Governance Advisory $7,997/yr
  growth_monthly:     "https://buy.stripe.com/8x200j4Cy9nL0ii1yN7kc0c",  // Enterprise Advisory $2,499/mo
  growth_annual:      "https://buy.stripe.com/bJefZh6KG9nLlmmgtH7kc0d",  // Enterprise Advisory $19,997/yr
  enterprise_monthly: "mailto:hello@incluu.us?subject=Enterprise Plan Inquiry",
  enterprise_annual:  "mailto:hello@incluu.us?subject=Enterprise Plan Inquiry",
};

// Customer portal (Stripe → Customer Portal settings)
const STRIPE_PORTAL = "https://billing.stripe.com/p/login/14A8wP5GC7fDghg0uJ7kc00";

// ─── Plans ─────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For growing teams getting started with AI governance",
    priceMonthly: 997,
    priceAnnual: 666,
    unit: "flat / month",
    maxSeats: 3,
    maxSystems: 5,
    color: B.cyan,
    colorLight: "rgba(8,145,178,0.08)",
    features: [
      "Up to 3 seats",
      "Up to 5 AI systems",
      "Core compliance frameworks (EU AI Act, EEOC, HIPAA)",
      "Risk scoring & radar chart",
      "Incident log",
      "Email alerts",
      "Standard support (48hr SLA)",
    ],
    notIncluded: [
      "Custom frameworks",
      "API integrations",
      "Board-ready reports",
      "White-glove onboarding",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For scale-ups managing multiple AI systems across teams",
    priceMonthly: 2499,
    priceAnnual: 1666,
    unit: "flat / month",
    maxSeats: 10,
    maxSystems: 20,
    color: B.purple5,
    colorLight: "rgba(168,85,247,0.08)",
    popular: true,
    features: [
      "Up to 10 seats",
      "Up to 20 AI systems",
      "All 12 compliance frameworks",
      "API integrations (OpenAI, Azure, AWS, GCP)",
      "Bias drift monitoring & alerts",
      "Board-ready PDF reports",
      "Model inventory with EU AI Act classification",
      "Priority support (8hr SLA)",
      "Quarterly strategy call with Dr. Dédé",
    ],
    notIncluded: [
      "Custom framework builds",
      "On-site advisory",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For Fortune 500 companies requiring full AI governance programs",
    priceMonthly: 5000,
    priceAnnual: 4000,
    unit: "flat / month",
    maxSeats: 999,
    maxSystems: 999,
    color: "#0f0a1e",
    colorLight: "rgba(15,10,30,0.05)",
    features: [
      "Unlimited seats & AI systems",
      "All 12 + custom compliance frameworks",
      "Full API integration suite + webhooks",
      "Real-time bias drift monitoring",
      "Automated regulatory filing alerts",
      "White-label board reports",
      "Dedicated AI Governance Advisor (Dr. Dédé)",
      "On-site advisory sessions",
      "Custom framework builds",
      "24/7 priority support (2hr SLA)",
      "SAML SSO + audit trail",
    ],
    notIncluded: [],
  },
];

const ADD_ONS = [
  {
    name: "AI Equity Intensive",
    desc: "90-minute 1:1 audit with Dr. Dédé + enhanced 5-module report",
    price: "$2,500 – $5,000",
    cta: "Book a Session",
    href: "https://calendly.com/dr-dede/ai-equity-intensive",
    icon: "🎯",
  },
  {
    name: "GRC VIP Strategy Day",
    desc: "Full-day AI governance sprint with your leadership team",
    price: "$25,000 – $50,000",
    cta: "Inquire",
    href: "mailto:hello@incluu.us?subject=VIP Strategy Day",
    icon: "🏆",
  },
  {
    name: "Enterprise Framework Build",
    desc: "Custom AI governance framework tailored to your industry & risk profile",
    price: "$50,000 – $500,000",
    cta: "Get a Proposal",
    href: "mailto:hello@incluu.us?subject=Enterprise Framework Build",
    icon: "🏗️",
  },
];

// ─── Billing Dashboard (for existing customers) ────────────────
const MOCK_SUBSCRIPTION = {
  plan: "Growth",
  status: "active",
  seats: 6,
  maxSeats: 10,
  aiSystems: 12,
  maxSystems: 20,
  billingCycle: "annual",
  nextBillingDate: "March 15, 2027",
  amount: "$17,208 / year",
  cardLast4: "4242",
  cardBrand: "Visa",
};

const MOCK_INVOICES = [
  { date: "Feb 15, 2026", amount: "$1,434.00", status: "paid",   id: "INV-2026-002" },
  { date: "Jan 15, 2026", amount: "$1,434.00", status: "paid",   id: "INV-2026-001" },
  { date: "Dec 15, 2025", amount: "$1,434.00", status: "paid",   id: "INV-2025-012" },
  { date: "Nov 15, 2025", amount: "$1,434.00", status: "paid",   id: "INV-2025-011" },
];

// ─── Utility ────────────────────────────────────────────────────
function Chip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.35rem 1rem",
        borderRadius: "50px",
        border: `1.5px solid ${selected ? B.purple : "#e5e7eb"}`,
        background: selected ? "rgba(147,51,234,0.06)" : "#fff",
        color: selected ? B.purple : B.gray600,
        fontWeight: selected ? "700" : "500",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function UsageBar({ used, max, color = B.purple5 }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div style={{ marginTop: "0.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: B.gray600, marginBottom: "0.3rem" }}>
        <span>{used} / {max} used</span>
        <span>{pct}%</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: "50px", height: "6px" }}>
        <div style={{ background: pct > 85 ? "#ef4444" : color, width: `${pct}%`, height: "6px", borderRadius: "50px", transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function IncluuBilling() {
  const [tab, setTab]         = useState("pricing"); // pricing | dashboard
  const [billing, setBilling] = useState("annual");
  const [hoveredPlan, setHoveredPlan] = useState(null);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: B.bg, minHeight: "100vh", color: B.gray800 }}>

      {/* Header */}
      <div style={{ background: B.dark, color: "#fff", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: B.heroGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "900", fontSize: "1.3rem" }}>
            Incluu
          </div>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>Billing & Subscriptions</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Chip selected={tab === "pricing"} onClick={() => setTab("pricing")}>Pricing Plans</Chip>
          <Chip selected={tab === "dashboard"} onClick={() => setTab("dashboard")}>My Subscription</Chip>
        </div>
      </div>

      {tab === "pricing" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-block", background: "rgba(147,51,234,0.08)", border: "1px solid rgba(147,51,234,0.2)", borderRadius: "50px", padding: "0.3rem 1rem", fontSize: "0.75rem", fontWeight: "700", color: B.purple, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
              AI Governance Platform
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", margin: "0 0 1rem", lineHeight: "1.1" }}>
              Transparent pricing for <br />
              <span style={{ background: B.heroGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI governance at scale</span>
            </h1>
            <p style={{ color: B.gray600, fontSize: "1.05rem", maxWidth: "560px", margin: "0 auto 2rem" }}>
              From growing teams to Fortune 500 enterprises. Every plan includes continuous compliance monitoring, bias detection, and board-ready reporting.
            </p>

            {/* Billing toggle */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "50px", padding: "0.35rem 0.35rem 0.35rem 1rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: billing === "monthly" ? B.purple : B.gray600 }}>Monthly</span>
              <button
                onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
                style={{
                  width: "48px", height: "26px", borderRadius: "50px", border: "none", cursor: "pointer",
                  background: billing === "annual" ? B.purple : "#d1d5db", position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: "3px", left: billing === "annual" ? "24px" : "3px",
                  width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: billing === "annual" ? B.purple : B.gray600 }}>Annual</span>
              {billing === "annual" && (
                <span style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50px", padding: "0.15rem 0.6rem", fontSize: "0.7rem", fontWeight: "700" }}>
                  Save 20%
                </span>
              )}
            </div>
          </div>

          {/* Plan cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
            {PLANS.map(plan => {
              const price = billing === "annual" ? plan.priceAnnual : plan.priceMonthly;
              const stripeKey = `${plan.id}_${billing}`;
              const stripeLink = STRIPE_LINKS[stripeKey];
              const isPopular = plan.popular;
              const isHovered = hoveredPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  style={{
                    background: B.card,
                    border: `2px solid ${isPopular ? plan.color : isHovered ? plan.color + "60" : "#e5e7eb"}`,
                    borderRadius: "1.25rem",
                    padding: "2rem",
                    position: "relative",
                    boxShadow: isPopular ? `0 8px 32px ${plan.color}20` : isHovered ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {isPopular && (
                    <div style={{
                      position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                      background: B.heroGrad, color: "#fff", borderRadius: "50px",
                      padding: "0.3rem 1rem", fontSize: "0.7rem", fontWeight: "800",
                      letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
                    }}>
                      ✦ Most Popular
                    </div>
                  )}

                  {/* Plan header */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: B.gray800, marginBottom: "0.25rem" }}>{plan.name}</div>
                    <div style={{ fontSize: "0.8rem", color: B.gray600, lineHeight: "1.4" }}>{plan.tagline}</div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: "1.75rem" }}>
                    {plan.id === "enterprise" ? (
                      <div>
                        <span style={{ fontSize: "2.5rem", fontWeight: "900", color: B.gray800 }}>
                          ${price.toLocaleString()}
                        </span>
                        <span style={{ color: B.gray600, fontSize: "0.85rem", marginLeft: "0.5rem" }}>/ month</span>
                        {billing === "annual" && (
                          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.25rem" }}>
                            Billed annually — save ${((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString()}/yr
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: "2.5rem", fontWeight: "900", color: B.gray800 }}>
                          ${price}
                        </span>
                        <span style={{ color: B.gray600, fontSize: "0.8rem", marginLeft: "0.35rem" }}>{plan.unit}</span>
                        {billing === "annual" && (
                          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.25rem" }}>
                            vs ${plan.priceMonthly.toLocaleString()}/mo monthly — save ${((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString()}/yr
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", color: B.gray600 }}>
                        👥 {plan.maxSeats === 999 ? "Unlimited" : "Flat rate"} — all users
                      </span>
                      <span style={{ fontSize: "0.75rem", color: B.gray600 }}>
                        🤖 {plan.maxSystems === 999 ? "Unlimited" : `Up to ${plan.maxSystems}`} AI systems
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block", textAlign: "center", padding: "0.85rem",
                      borderRadius: "0.625rem", textDecoration: "none",
                      background: isPopular ? B.btnGrad : `linear-gradient(to right, ${plan.color}cc, ${plan.color})`,
                      color: "#fff", fontWeight: "700", fontSize: "0.9rem",
                      boxShadow: isPopular ? "0 4px 14px rgba(147,51,234,0.3)" : "none",
                      marginBottom: "1.5rem",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {plan.id === "enterprise" ? "Get Started — Contact Sales" : `Start ${plan.name} Plan →`}
                  </a>

                  {/* Features */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: B.gray600, marginBottom: "0.75rem" }}>
                      Included
                    </div>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{ color: "#22c55e", fontSize: "0.85rem", marginTop: "0.05rem", flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: "0.82rem", color: B.gray700, lineHeight: "1.4" }}>{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.length > 0 && (
                      <>
                        <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginTop: "1rem", marginBottom: "0.5rem" }}>
                          Not Included
                        </div>
                        {plan.notIncluded.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                            <span style={{ color: "#d1d5db", fontSize: "0.85rem", flexShrink: 0 }}>✕</span>
                            <span style={{ fontSize: "0.82rem", color: "#9ca3af", lineHeight: "1.4" }}>{f}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add-ons */}
          <div style={{ marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem", textAlign: "center" }}>Advisory Add-Ons</h2>
            <p style={{ textAlign: "center", color: B.gray600, fontSize: "0.9rem", marginBottom: "2rem" }}>
              Direct access to Dr. Dédé — Cornell PhD, former Meta/Salesforce/Indeed executive, TEDx Speaker
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {ADD_ONS.map((addon, i) => (
                <div key={i} style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ fontSize: "2rem" }}>{addon.icon}</div>
                  <div>
                    <div style={{ fontWeight: "800", fontSize: "0.95rem", marginBottom: "0.25rem" }}>{addon.name}</div>
                    <div style={{ fontSize: "0.8rem", color: B.gray600, lineHeight: "1.5" }}>{addon.desc}</div>
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: B.purple }}>{addon.price}</div>
                  <a
                    href={addon.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block", padding: "0.6rem 1.25rem", borderRadius: "0.5rem",
                      background: "rgba(147,51,234,0.07)", border: "1.5px solid rgba(147,51,234,0.2)",
                      color: B.purple, fontWeight: "700", fontSize: "0.82rem",
                      textDecoration: "none", textAlign: "center",
                    }}
                  >
                    {addon.cta} →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1.25rem", padding: "2.5rem", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "2rem", textAlign: "center" }}>Frequently Asked Questions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem" }}>
              {[
                { q: "What counts as an 'AI system'?", a: "Any ML model, AI-powered tool, or automated decision system your org uses — hiring algorithms, chatbots, fraud detection, recommendation engines, etc." },
                { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime. Upgrades take effect immediately; downgrades at the next billing cycle. Manage everything from your customer portal." },
                { q: "Do you offer a free trial?", a: "We offer the free Enhanced AI Equity Assessment (5-module deep report) as a taste of platform capabilities. Contact us for a 14-day trial of the full platform." },
                { q: "What happens if I exceed my limits?", a: "You'll be notified at 80% usage. You can add seats or systems à la carte, or upgrade to the next plan. We never cut access without warning." },
                { q: "Is my data secure?", a: "Yes. Data is encrypted at rest and in transit. We're SOC 2 Type II compliant (in progress) and never share your data with third parties." },
                { q: "Do I need to sign a contract?", a: "Monthly plans are no-contract. Annual plans require a 12-month commitment but save ~33%. Enterprise plans include a custom MSA." },
              ].map(({ q, a }, i) => (
                <div key={i}>
                  <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "0.5rem", color: B.gray800 }}>{q}</div>
                  <div style={{ fontSize: "0.83rem", color: B.gray600, lineHeight: "1.6" }}>{a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust footer */}
          <div style={{ textAlign: "center", padding: "2rem", borderTop: "1.5px solid #e5e7eb" }}>
            <p style={{ fontSize: "0.8rem", color: B.gray600, marginBottom: "0.5rem" }}>
              Trusted by legal, compliance, and HR teams at Fortune 500 companies
            </p>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Questions? Email <a href="mailto:hello@incluu.us" style={{ color: B.purple }}>hello@incluu.us</a> or book a{" "}
              <a href="https://calendly.com/dr-dede" style={{ color: B.purple }}>15-min call</a>
            </p>
          </div>
        </div>
      )}

      {tab === "dashboard" && (
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.25rem" }}>My Subscription</h2>
          <p style={{ color: B.gray600, fontSize: "0.9rem", marginBottom: "2.5rem" }}>Manage your plan, seats, and billing details</p>

          {/* Current plan card */}
          <div style={{ background: B.card, border: "2px solid rgba(168,85,247,0.3)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem", boxShadow: "0 4px 24px rgba(147,51,234,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: "900", color: B.gray800 }}>{MOCK_SUBSCRIPTION.plan} Plan</span>
                  <span style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50px", padding: "0.15rem 0.6rem", fontSize: "0.7rem", fontWeight: "700" }}>
                    ● Active
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: B.gray600 }}>
                  {MOCK_SUBSCRIPTION.billingCycle === "annual" ? "Annual billing" : "Monthly billing"} · Next payment {MOCK_SUBSCRIPTION.nextBillingDate}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: B.purple, marginTop: "0.5rem" }}>
                  {MOCK_SUBSCRIPTION.amount}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a href={STRIPE_PORTAL} target="_blank" rel="noopener noreferrer" style={{ padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: B.btnGrad, color: "#fff", textDecoration: "none", fontWeight: "700", fontSize: "0.85rem" }}>
                  Manage Billing ↗
                </a>
                <button onClick={() => setTab("pricing")} style={{ padding: "0.65rem 1.25rem", borderRadius: "0.625rem", background: "transparent", border: "1.5px solid #e5e7eb", color: B.gray700, fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Team Seats", used: MOCK_SUBSCRIPTION.seats, max: MOCK_SUBSCRIPTION.maxSeats, icon: "👥" },
              { label: "AI Systems Monitored", used: MOCK_SUBSCRIPTION.aiSystems, max: MOCK_SUBSCRIPTION.maxSystems, icon: "🤖" },
            ].map(({ label, used, max, icon }, i) => (
              <div key={i} style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span>{icon}</span>
                  <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{label}</span>
                </div>
                <UsageBar used={used} max={max} />
              </div>
            ))}
          </div>

          {/* Payment method */}
          <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "1rem" }}>Payment Method</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ background: "#f3f4f6", borderRadius: "0.4rem", padding: "0.4rem 0.75rem", fontSize: "0.8rem", fontWeight: "700" }}>
                  {MOCK_SUBSCRIPTION.cardBrand}
                </div>
                <span style={{ fontSize: "0.9rem", color: B.gray700 }}>•••• •••• •••• {MOCK_SUBSCRIPTION.cardLast4}</span>
              </div>
              <a href={STRIPE_PORTAL} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.82rem", color: B.purple, fontWeight: "600", textDecoration: "none" }}>
                Update →
              </a>
            </div>
          </div>

          {/* Invoice history */}
          <div style={{ background: B.card, border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
            <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "1.25rem" }}>Invoice History</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Invoice ID", "Amount", "Status", ""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: B.gray600, borderBottom: "2px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem" }}>{inv.date}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem", fontFamily: "monospace", color: B.gray600 }}>{inv.id}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem", fontWeight: "600" }}>{inv.amount}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50px", padding: "0.15rem 0.6rem", fontSize: "0.68rem", fontWeight: "700" }}>
                        Paid
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      <button style={{ fontSize: "0.78rem", color: B.purple, fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}>
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
