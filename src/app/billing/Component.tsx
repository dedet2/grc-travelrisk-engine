"use client";
import { useState } from "react";

// ─── Brand ───────────────────────────────────────────────────────
const B = {
  heroGrad: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGrad: "linear-gradient(to right, #9333ea, #0891b2)",
  purple: "#9333ea",
  purple5: "#a855f7",
  cyan: "#0891b2",
  bg: "#f9fafb",
  card: "#ffffff",
  dark: "#0f0a1e",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

// ─── Stripe Checkout Links ─────────────────────────────────────
const STRIPE_LINKS: Record<string, string> = {
  starter_monthly: "https://buy.stripe.com/REPLACE_STARTER_MONTHLY",
  starter_annual: "https://buy.stripe.com/REPLACE_STARTER_ANNUAL",
  growth_monthly: "https://buy.stripe.com/REPLACE_GROWTH_MONTHLY",
  growth_annual: "https://buy.stripe.com/REPLACE_GROWTH_ANNUAL",
  enterprise_monthly: "https://buy.stripe.com/REPLACE_ENTERPRISE_MONTHLY",
  enterprise_annual: "https://buy.stripe.com/REPLACE_ENTERPRISE_ANNUAL",
};

const STRIPE_PORTAL = "https://billing.stripe.com/REPLACE_PORTAL_LINK";

// ─── Plans ────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For growing teams getting started with AI governance",
    priceMonthly: 149,
    priceAnnual: 119,
    unit: "per seat / month",
    maxSeats: 3,
    maxSystems: 5,
    color: "#0891b2",
    colorLight: "rgba(8,145,178,0.08)",
    popular: false,
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
    priceMonthly: 299,
    priceAnnual: 239,
    unit: "per AI system / month",
    maxSeats: 10,
    maxSystems: 20,
    color: "#a855f7",
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
      "Quarterly strategy call with Dr. D\u00e9d\u00e9",
    ],
    notIncluded: ["Custom framework builds", "On-site advisory"],
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
    popular: false,
    features: [
      "Unlimited seats & AI systems",
      "All 12 + custom compliance frameworks",
      "Full API integration suite + webhooks",
      "Real-time bias drift monitoring",
      "Automated regulatory filing alerts",
      "White-label board reports",
      "Dedicated AI Governance Advisor (Dr. D\u00e9d\u00e9)",
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
    desc: "90-minute 1:1 audit with Dr. D\u00e9d\u00e9 + enhanced 5-module report",
    price: "$2,500 \u2013 $5,000",
    cta: "Book a Session",
    href: "https://calendly.com/dr-dede/ai-equity-intensive",
    icon: "\ud83c\udfaf",
  },
  {
    name: "GRC VIP Strategy Day",
    desc: "Full-day AI governance sprint with your leadership team",
    price: "$25,000 \u2013 $50,000",
    cta: "Inquire",
    href: "mailto:hello@incluu.us?subject=VIP Strategy Day",
    icon: "\ud83c\udfc6",
  },
  {
    name: "Enterprise Framework Build",
    desc: "Custom AI governance framework tailored to your industry & risk profile",
    price: "$50,000 \u2013 $500,000",
    cta: "Get a Proposal",
    href: "mailto:hello@incluu.us?subject=Enterprise Framework Build",
    icon: "\ud83c\udfd7\ufe0f",
  },
];

// ─── Dashboard Mock Data ──────────────────────────────────────────
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
  { date: "Feb 15, 2026", amount: "$1,434.00", status: "paid", id: "INV-2026-002" },
  { date: "Jan 15, 2026", amount: "$1,434.00", status: "paid", id: "INV-2026-001" },
  { date: "Dec 15, 2025", amount: "$1,434.00", status: "paid", id: "INV-2025-012" },
  { date: "Nov 15, 2025", amount: "$1,434.00", status: "paid", id: "INV-2025-011" },
];

// ─── Utility Components ────────────────────────────────────────────
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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

function UsageBar({
  used,
  max,
  color = B.purple5,
}: {
  used: number;
  max: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div style={{ marginTop: "0.4rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          color: B.gray600,
          marginBottom: "0.3rem",
        }}
      >
        <span>
          {used} / {max} used
        </span>
        <span>{pct}%</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: "50px", height: "6px" }}>
        <div
          style={{
            background: pct > 85 ? "#ef4444" : color,
            width: `${pct}%`,
            height: "6px",
            borderRadius: "50px",
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function IncluuBilling() {
  const [tab, setTab] = useState<"pricing" | "dashboard">("pricing");
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: B.bg,
        minHeight: "100vh",
        color: B.gray800,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: B.dark,
          color: "#fff",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <span style={{ fontWeight: "900", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            ⬡ Incluu GRC
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Chip selected={tab === "pricing"} onClick={() => setTab("pricing")}>
              Pricing
            </Chip>
            <Chip selected={tab === "dashboard"} onClick={() => setTab("dashboard")}>
              My Account
            </Chip>
          </div>
        </div>
        <a
          href="https://grc.incluu.us"
          style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
        >
          \u2190 Back to Platform
        </a>
      </div>

      {/* ── Pricing Tab ── */}
      {tab === "pricing" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: "900",
                background: B.heroGrad,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "0.75rem",
              }}
            >
              Simple, Transparent Pricing
            </h1>
            <p style={{ fontSize: "1rem", color: B.gray600, maxWidth: "560px", margin: "0 auto" }}>
              From early-stage governance to enterprise-grade compliance programs \u2014 built for
              organizations that take AI risk seriously.
            </p>
          </div>

          {/* Billing Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "2.5rem",
            }}
          >
            <Chip selected={billing === "monthly"} onClick={() => setBilling("monthly")}>
              Monthly
            </Chip>
            <Chip selected={billing === "annual"} onClick={() => setBilling("annual")}>
              Annual
            </Chip>
            {billing === "annual" && (
              <span
                style={{
                  background: "rgba(34,197,94,0.1)",
                  color: "#16a34a",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: "50px",
                  padding: "0.2rem 0.7rem",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                }}
              >
                Save ~20%
              </span>
            )}
          </div>

          {/* Plan Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "4rem",
            }}
          >
            {PLANS.map((plan) => {
              const isPopular = plan.popular;
              const isHovered = hoveredPlan === plan.id;
              const stripeLink = STRIPE_LINKS[`${plan.id}_${billing}`] || "#";
              return (
                <div
                  key={plan.id}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  style={{
                    background: isPopular
                      ? `linear-gradient(145deg, ${B.card}, rgba(168,85,247,0.04))`
                      : B.card,
                    border: `2px solid ${isHovered || isPopular ? plan.color : "#e5e7eb"}`,
                    borderRadius: "1.25rem",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "all 0.2s",
                    boxShadow:
                      isHovered || isPopular ? `0 8px 30px ${plan.color}25` : "none",
                  }}
                >
                  {isPopular && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: B.btnGrad,
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "0.72rem",
                        padding: "0.3rem 1.1rem",
                        borderRadius: "50px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      \u2605 Most Popular
                    </div>
                  )}

                  {/* Plan Header */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem", fontWeight: "800", color: B.gray800 }}>
                        {plan.name}
                      </span>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: plan.color,
                          display: "inline-block",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "0.8rem", color: B.gray600, lineHeight: "1.5" }}>
                      {plan.tagline}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.25rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: "0.95rem", fontWeight: "700", color: plan.color }}>
                        $
                      </span>
                      <span
                        style={{
                          fontSize: "2.6rem",
                          fontWeight: "900",
                          color: B.gray800,
                          lineHeight: "1",
                        }}
                      >
                        {billing === "annual" ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: B.gray600 }}>/{plan.unit}</span>
                    </div>
                    {billing === "annual" && plan.id !== "enterprise" && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#16a34a",
                          marginTop: "0.3rem",
                          fontWeight: "600",
                        }}
                      >
                        Save ${(plan.priceMonthly - plan.priceAnnual) * 12}/yr vs monthly
                      </div>
                    )}
                  </div>

                  {/* Seats / Systems meta */}
                  <div
                    style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", marginBottom: "1.25rem" }}
                  >
                    <span style={{ fontSize: "0.75rem", color: B.gray600 }}>
                      \ud83d\udc65 Up to {plan.maxSeats === 999 ? "Unlimited" : plan.maxSeats} seats
                    </span>
                    <span style={{ fontSize: "0.75rem", color: B.gray600 }}>
                      \ud83e\udd16{" "}
                      {plan.maxSystems === 999 ? "Unlimited" : `Up to ${plan.maxSystems}`} AI systems
                    </span>
                  </div>

                  {/* CTA */}
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "0.85rem",
                      borderRadius: "0.625rem",
                      textDecoration: "none",
                      background: isPopular
                        ? B.btnGrad
                        : `linear-gradient(to right, ${plan.color}cc, ${plan.color})`,
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      boxShadow: isPopular ? "0 4px 14px rgba(147,51,234,0.3)" : "none",
                      marginBottom: "1.5rem",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {plan.id === "enterprise"
                      ? "Get Started \u2014 Contact Sales"
                      : `Start ${plan.name} Plan \u2192`}
                  </a>

                  {/* Features */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: B.gray600,
                        marginBottom: "0.75rem",
                      }}
                    >
                      Included
                    </div>
                    {plan.features.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            color: "#22c55e",
                            fontSize: "0.85rem",
                            marginTop: "0.05rem",
                            flexShrink: 0,
                          }}
                        >
                          \u2713
                        </span>
                        <span style={{ fontSize: "0.82rem", color: B.gray700, lineHeight: "1.4" }}>
                          {f}
                        </span>
                      </div>
                    ))}
                    {plan.notIncluded.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#9ca3af",
                            marginTop: "1rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Not Included
                        </div>
                        {plan.notIncluded.map((f, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              marginBottom: "0.4rem",
                            }}
                          >
                            <span style={{ color: "#d1d5db", fontSize: "0.85rem", flexShrink: 0 }}>
                              \u2715
                            </span>
                            <span
                              style={{ fontSize: "0.82rem", color: "#9ca3af", lineHeight: "1.4" }}
                            >
                              {f}
                            </span>
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
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              Advisory Add-Ons
            </h2>
            <p
              style={{
                textAlign: "center",
                color: B.gray600,
                fontSize: "0.9rem",
                marginBottom: "2rem",
              }}
            >
              Direct access to Dr. D\u00e9d\u00e9 \u2014 Cornell PhD, former Meta/Salesforce/Indeed executive,
              TEDx Speaker
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {ADD_ONS.map((addon, i) => (
                <div
                  key={i}
                  style={{
                    background: B.card,
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ fontSize: "2rem" }}>{addon.icon}</div>
                  <div>
                    <div style={{ fontWeight: "800", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                      {addon.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: B.gray600, lineHeight: "1.5" }}>
                      {addon.desc}
                    </div>
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: B.purple }}>
                    {addon.price}
                  </div>
                  <a
                    href={addon.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "0.5rem",
                      background: "rgba(147,51,234,0.07)",
                      border: "1.5px solid rgba(147,51,234,0.2)",
                      color: B.purple,
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    {addon.cta} \u2192
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div
            style={{
              background: B.card,
              border: "1.5px solid #e5e7eb",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              marginBottom: "3rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: "800",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Frequently Asked Questions
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "2rem",
              }}
            >
              {[
                {
                  q: "What counts as an 'AI system'?",
                  a: "Any ML model, AI-powered tool, or automated decision system your org uses \u2014 hiring algorithms, chatbots, fraud detection, recommendation engines, etc.",
                },
                {
                  q: "Can I switch plans?",
                  a: "Yes, upgrade or downgrade anytime. Upgrades take effect immediately; downgrades at the next billing cycle. Manage everything from your customer portal.",
                },
                {
                  q: "Do you offer a free trial?",
                  a: "We offer the free Enhanced AI Equity Assessment (5-module deep report) as a taste of platform capabilities. Contact us for a 14-day trial of the full platform.",
                },
                {
                  q: "What happens if I exceed my limits?",
                  a: "You\u2019ll be notified at 80% usage. You can add seats or systems \u00e0 la carte, or upgrade to the next plan. We never cut access without warning.",
                },
                {
                  q: "Is my data secure?",
                  a: "Yes. Data is encrypted at rest and in transit. We\u2019re SOC 2 Type II compliant (in progress) and never share your data with third parties.",
                },
                {
                  q: "Do I need to sign a contract?",
                  a: "Monthly plans are no-contract. Annual plans require a 12-month commitment but save 20%. Enterprise plans include a custom MSA.",
                },
              ].map(({ q, a }, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      marginBottom: "0.5rem",
                      color: B.gray800,
                    }}
                  >
                    {q}
                  </div>
                  <div style={{ fontSize: "0.83rem", color: B.gray600, lineHeight: "1.6" }}>{a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Footer */}
          <div
            style={{ textAlign: "center", padding: "2rem", borderTop: "1.5px solid #e5e7eb" }}
          >
            <p style={{ fontSize: "0.8rem", color: B.gray600, marginBottom: "0.5rem" }}>
              Trusted by legal, compliance, and HR teams at Fortune 500 companies
            </p>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Questions? Email{" "}
              <a href="mailto:hello@incluu.us" style={{ color: B.purple }}>
                hello@incluu.us
              </a>{" "}
              or book a{" "}
              <a href="https://calendly.com/dr-dede" style={{ color: B.purple }}>
                15-min call
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ── Dashboard Tab ── */}
      {tab === "dashboard" && (
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "3rem 2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.25rem" }}>
            My Subscription
          </h2>
          <p style={{ color: B.gray600, fontSize: "0.9rem", marginBottom: "2.5rem" }}>
            Manage your plan, seats, and billing details
          </p>

          {/* Current Plan Card */}
          <div
            style={{
              background: B.card,
              border: "2px solid rgba(168,85,247,0.3)",
              borderRadius: "1.25rem",
              padding: "2rem",
              marginBottom: "1.5rem",
              boxShadow: "0 4px 24px rgba(147,51,234,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.2rem", fontWeight: "900", color: B.gray800 }}>
                    {MOCK_SUBSCRIPTION.plan} Plan
                  </span>
                  <span
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#16a34a",
                      border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: "50px",
                      padding: "0.15rem 0.6rem",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                    }}
                  >
                    \u25cf Active
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: B.gray600 }}>
                  {MOCK_SUBSCRIPTION.billingCycle === "annual" ? "Annual billing" : "Monthly billing"}{" "}
                  \u00b7 Next payment {MOCK_SUBSCRIPTION.nextBillingDate}
                </div>
                <div
                  style={{ fontSize: "1.1rem", fontWeight: "700", color: B.purple, marginTop: "0.5rem" }}
                >
                  {MOCK_SUBSCRIPTION.amount}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a
                  href={STRIPE_PORTAL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "0.625rem",
                    background: B.btnGrad,
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                  }}
                >
                  Manage Billing \u2197
                </a>
                <button
                  onClick={() => setTab("pricing")}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "0.625rem",
                    background: "transparent",
                    border: "1.5px solid #e5e7eb",
                    color: B.gray700,
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}
          >
            {[
              {
                label: "Team Seats",
                used: MOCK_SUBSCRIPTION.seats,
                max: MOCK_SUBSCRIPTION.maxSeats,
                icon: "\ud83d\udc65",
              },
              {
                label: "AI Systems Monitored",
                used: MOCK_SUBSCRIPTION.aiSystems,
                max: MOCK_SUBSCRIPTION.maxSystems,
                icon: "\ud83e\udd16",
              },
            ].map(({ label, used, max, icon }, i) => (
              <div
                key={i}
                style={{
                  background: B.card,
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
                >
                  <span>{icon}</span>
                  <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{label}</span>
                </div>
                <UsageBar used={used} max={max} />
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div
            style={{
              background: B.card,
              border: "1.5px solid #e5e7eb",
              borderRadius: "1rem",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Payment Method
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "0.4rem",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                  }}
                >
                  {MOCK_SUBSCRIPTION.cardBrand}
                </div>
                <span style={{ fontSize: "0.9rem", color: B.gray700 }}>
                  \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022{" "}
                  {MOCK_SUBSCRIPTION.cardLast4}
                </span>
              </div>
              <a
                href={STRIPE_PORTAL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.82rem", color: B.purple, fontWeight: "600", textDecoration: "none" }}
              >
                Update \u2192
              </a>
            </div>
          </div>

          {/* Invoice History */}
          <div
            style={{
              background: B.card,
              border: "1.5px solid #e5e7eb",
              borderRadius: "1rem",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Invoice History
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Invoice ID", "Amount", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: B.gray600,
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem" }}>{inv.date}</td>
                    <td
                      style={{
                        padding: "0.75rem",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        color: B.gray600,
                      }}
                    >
                      {inv.id}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem", fontWeight: "600" }}>
                      {inv.amount}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#16a34a",
                          border: "1px solid rgba(34,197,94,0.3)",
                          borderRadius: "50px",
                          padding: "0.15rem 0.6rem",
                          fontSize: "0.68rem",
                          fontWeight: "700",
                        }}
                      >
                        Paid
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      <button
                        style={{
                          fontSize: "0.78rem",
                          color: B.purple,
                          fontWeight: "600",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
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
