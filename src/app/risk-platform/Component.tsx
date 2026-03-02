"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────
const SUPABASE_URL = "https://cmlodpchjgbqynynqdbc.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtbG9kcGNoamdicXlueW5xZGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzQxMTQsImV4cCI6MjA4NzgxMDExNH0.q8wBfWOob6W--XfbPAH2DSgtOFSxzpDKPlvXMgk0juE";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Brand ────────────────────────────────────────────────────
const B = {
  heroGrad: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGrad: "linear-gradient(to right, #9333ea, #0891b2)",
  purple: "#9333ea", purple5: "#a855f7", cyan: "#0891b2",
  sidebar: "#0f0a1e", sidebarBorder: "rgba(147,51,234,0.2)",
  bg: "#f9fafb", card: "#ffffff",
  gray600: "#4b5563", gray700: "#374151", gray800: "#1f2937",
};

// ─── Risk colors ──────────────────────────────────────────────
const RISK = {
  Critical:{ bg:"#fee2e2", border:"#fecaca", text:"#b91c1c", badge:"#ef4444", dot:"#ef4444" },
  High:    { bg:"#fff7ed", border:"#fed7aa", text:"#c2410c", badge:"#f97316", dot:"#f97316" },
  Medium:  { bg:"#fef9c3", border:"#fde047", text:"#a16207", badge:"#eab308", dot:"#eab308" },
  Low:     { bg:"#f0fdf4", border:"#bbf7d0", text:"#15803d", badge:"#22c55e", dot:"#22c55e" },
};

const statusColors = {
  active:"#22c55e", paused:"#eab308", deprecated:"#9ca3af", pending_review:"#f97316",
  open:"#ef4444", investigating:"#f97316", mitigated:"#eab308", resolved:"#22c55e", closed:"#9ca3af",
  compliant:"#22c55e", partial:"#f97316", gap:"#ef4444", not_started:"#9ca3af",
};

// ─── Utility components ───────────────────────────────────────
function Badge({ label, color="#9ca3af", bg="rgba(156,163,175,0.1)" }) {
  return (
    <span style={{ background:bg, color, border:`1px solid ${color}30`, borderRadius:"50px", padding:"0.15rem 0.55rem", fontSize:"0.65rem", fontWeight:"700", letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function RiskBadge({ level }) {
  const c = RISK[level] || RISK.Medium;
  return <Badge label={level} color={c.badge} bg={c.b} />;
}

function StatCard({ title, value, sub, color=B.purple, icon }) {
  return (
    <div style={{ background:B.card, border:"1.5px solid #e5e7eb", borderRadius:"0.875rem", padding:"1.25rem", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:"0.7rem", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", color:B.gray600, marginBottom:"0.4rem" }}>{title}</div>
          <div style={{ fontSize:"2rem", fontWeight:"800", color, lineHeight:"1.1" }}>{value}</div>
          {sub && <div style={{ fontSize:"0.72rem", color:"#9ca3af", marginTop:"0.25rem" }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize:"1.5rem" }}>{icon}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
        <h2 style={{ fontSize:"1rem", fontWeight:"700", color:B.gray800 }}>{title}</h2>
        {count != null && <span style={{ fontSize:"0.72rem", color:"#9ca3af", background:B.bg, border:"1px solid #e5e7eb", borderRadius:"50px", padding:"0.15rem 0.5rem" }}>{count}</span>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>{icon}</div>
      <div style={{ fontSize:"0.9rem", fontWeight:"600", color:B.gray700, marginBottom:"0.3rem" }}>{title}</div>
      <div style={{ fontSize:"0.78rem", color:"#9ca3af" }}>{sub}</div>
    </div>
  );
}

function Spinner() {
  return <div style={{ width:"20px", height:"20px", border:"2px solid #e5e7eb", borderTopColor:B.purple, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"2rem auto" }}/>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }}/>
      <div style={{ position:"relative", background:"#fff", borderRadius:"1rem", padding:"2rem", maxWidth:"560px", width:"calc(100% - 2rem)", maxHeight:"90vh", overflowY:"auto", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h3 style={{ fontSize:"1.1rem", fontWeight:"700", color:B.gray800 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.25rem", cursor:"pointer", color:"#9ca3af" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type="text", placeholder, required }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <label style={{ display:"block", fontSize:"0.72rem", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", color:B.gray600, marginBottom:"0.35rem" }}>{label}{required&&<span style={{color:"#ef4444"}}>*</span>}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} required={required}
        style={{ width:"100%", border:"1.5px solid #e5e7eb", borderRadius:"0.5rem", padding:"0.65rem 0.8rem", fontSize:"0.875rem", color:B.gray700, fontFamily:"inherit", background:B.bg, outline:"none" }}/>
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <label style={{ display:"block", fontSize:"0.72rem", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.1em", color:B.gray600, marginBottom:"0.35rem" }}>{label}{required&&<span style={{color:"#ef4444"}}>*</span>}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} required={required}
        style={{ width:"100%", border:"1.5px solid #e5e7eb", borderRadius:"0.5rem", padding:"0.65rem 0.8rem", fontSize:"0.875rem", color:value?B.gray700:"#9ca3af", fontFamily:"inherit", background:"#fff", outline:"none", cursor:"pointer" }}>
        <option value="">Select…</option>
        {options.map(o=> typeof o==="string" ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Btn({ label, onClick, variant="primary", disabled=false, small=false }) {
  const styles = {
    primary:{ background:disabled?"#e5e7eb":B.btnGrad, color:disabled?"#9ca3af":"#fff", border:"none" },
    ghost:{ background:"transparent", color:B.gray600, border:"1.5px solid #e5e7eb" },
    danger:{ background:"#fee2e2", color:"#b91c1c", border:"1.5px solid #fecaca" },
  };
  const s = styles[variant]||styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...s, borderRadius:"0.5rem", padding:small?"0.4rem 0.85rem":"0.65rem 1.25rem", fontSize:small?"0.75rem":"0.875rem", fontWeight:"600", cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", transition:"opacity 0.15s" }}>
      {label}
    </button>
  );
}

// ─── Radar chart (SVG) ────────────────────────────────────────
function RadarChart({ scores, size=200 }) {
  if (!scores || scores.length === 0) return null;
  const cx = size/2, cy = size/2, r = size/2 - 20;
  const n = scores.length;
  const pts = scores.map((s, i) => {
    const angle = (i/n) * 2 * Math.PI - Math.PI/2;
    const ratio = (s.score||0)/100;
    return { x: cx + r*ratio*Math.cos(angle), y: cy + r*ratio*Math.sin(angle), lx: cx + (r+16)*Math.cos(angle), ly: cy + (r+16)*Math.sin(angle), label: s.name };
  });
  const gridLevels = [0.25, 0.5, 0.75, 1];
  return (
    <svg width={size} height={size}>
      {gridLevels.map(level => {
        const gpts = scores.map((_, i) => {
          const angle = (i/n)*2*Math.PI - Math.PI/2;
          return `${cx + r*level*Math.cos(angle)},${cy + r*level*Math.sin(angle)}`;
        }).join(" ");
        return <polygon key={level} points={gpts} fill="none" stroke="rgba(147,51,234,0.1)" strokeWidth="1"/>;
      })}
      {scores.map((_, i) => {
        const angle = (i/n)*2*Math.PI - Math.PI/2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r*Math.cos(angle)} y2={cy + r*Math.sin(angle)} stroke="rgba(147,51,234,0.1)" strokeWidth="1"/>;
      })}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="rgba(147,51,234,0.15)" stroke={B.purple5} strokeWidth="2"/>
      {pts.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={B.purple}/>
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="central" style={{ fontSize:"8px", fill:B.gray600, fontFamily:"inherit" }}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Compliance Bar ───────────────────────────────────────────
function ComplianceBar({ pct, status }) {
  const c = { compliant:"#22c55e", partial:"#f97316", gap:"#ef4444", not_started:"#9ca3af" }[status]||"#9ca3af";
  return (
    <div style={{ width:"100%", height:"6px", background:"#f3f4f6", borderRadius:"3px", overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:c, borderRadius:"3px", transition:"width 0.8s ease" }}/>
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"⬛" },
  { id:"inventory", label:"Model Inventory", icon:"🗂️" },
  { id:"compliance", label:"Compliance", icon:"⚖️" },
  { id:"incidents", label:"Incidents", icon:"🚨" },
  { id:"alerts", label:"Alerts", icon:"🔔" },
  { id:"connections", label:"API Connections", icon:"🔌" },
  { id:"reports", label:"Board Reports", icon:"📋" },
];

// ─── Main App ─────────────────────────────────────────────────
export default function IncluuriskPlatform() {
  const [page, setPage] = useState("dashboard");
  const [org, setOrg] = useState(null);
  const [systems, setSystems] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orgR, sysR, fwR, incR, alR, connR, rsR] = await Promise.all([
        sb.from("organizations").select("*").single(),
        sb.from("ai_systems").select("*").order("risk_level", { ascending:true }),
        sb.from("compliance_frameworks").select("*"),
        sb.from("incidents").select("*, ai_systems(name)").order("reported_at", { ascending:false }),
        sb.from("alerts").select("*, ai_systems(name)").order("triggered_at", { ascending:false }),
        sb.from("api_connections").select("*, ai_systems(name)"),
        sb.from("risk_scores").select("*").is("system_id", null).single(),
      ]);
      if (orgR.data) setOrg(orgR.data);
      if (sysR.data) setSystems(sysR.data);
      if (fwR.data) setFrameworks(fwR.data);
      if (incR.data) setIncidents(incR.data);
      if (alR.data) { setAlerts(alR.data); setAlertCount(alR.data.filter(a=>!a.acknowledged_at).length); }
      if (connR.data) setConnections(connR.data);
      if (rsR.data) setRiskScore(rsR.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openIncidents = incidents.filter(i => i.status === "open" || i.status === "investigating");
  const highRiskSystems = systems.filter(s => s.risk_level === "Critical" || s.risk_level === "High");
  const unackAlerts = alerts.filter(a => !a.acknowledged_at);

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background:B.bg }}>
      <style>{`*{box-sizing:border-box}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.fade{animation:fadeIn 0.3s ease}input:focus,select:focus{outline:2px solid ${B.purple5};outline-offset:1px}table{border-collapse:collapse}th,td{text-align:left}`}</style>

      {/* Sidebar */}
      <div style={{ width:"220px", background:B.sidebar, borderRight:`1px solid ${B.sidebarBorder}`, display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:50, flexShrink:0 }}>
        {/* Logo */}
        <div style={{ padding:"1.25rem 1rem", borderBottom:`1px solid ${B.sidebarBorder}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <div style={{ width:"28px", height:"28px", background:B.heroGrad, borderRadius:"0.5rem", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:"800", color:"#fff", flexShrink:0 }}>AI</div>
            <div>
              <div style={{ fontSize:"0.82rem", fontWeight:"700", color:"#fff" }}>Incluu</div>
              <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em", textTransform:"uppercase" }}>Risk Platform</div>
            </div>
          </div>
        </div>

        {/* Org badge */}
        {org && (
          <div style={{ padding:"0.75rem 1rem", borderBottom:`1px solid ${B.sidebarBorder}` }}>
            <div style={{ fontSize:"0.72rem", fontWeight:"600", color:"rgba(255,255,255,0.7)" }}>{org.name}</div>
            <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.35)", marginTop:"0.15rem" }}>{org.industry} · {org.plan_tier}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:"0.75rem 0.5rem", overflowY:"auto" }}>
          {NAV.map(item => {
            const active = page === item.id;
            const badge = item.id === "alerts" ? alertCount : item.id === "incidents" ? openIncidents.length : 0;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.6rem", width:"100%", padding:"0.6rem 0.75rem", borderRadius:"0.5rem", background:active?"rgba(147,51,234,0.2)":"transparent", border:active?`1px solid rgba(147,51,234,0.4)`:"1px solid transparent", color:active?"#fff":"rgba(255,255,255,0.55)", fontSize:"0.82rem", fontWeight:active?"600":"400", cursor:"pointer", fontFamily:"inherit", marginBottom:"0.15rem", transition:"all 0.15s" }}>
                <span style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  <span style={{ fontSize:"0.9rem" }}>{item.icon}</span>
                  {item.label}
                </span>
                {badge > 0 && <span style={{ background:"#ef4444", color:"#fff", borderRadius:"50px", fontSize:"0.6rem", fontWeight:"800", padding:"0.1rem 0.4rem", minWidth:"18px", textAlign:"center" }}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Dr. Dédé footer */}
        <div style={{ padding:"0.75rem 1rem", borderTop:`1px solid ${B.sidebarBorder}` }}>
          <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.3)", lineHeight:"1.4" }}>
            Powered by Incluu<br/>
            <span style={{ color:"rgba(147,51,234,0.7)" }}>Dr. Dédé Tetsubayashi</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, marginLeft:"220px", overflowY:"auto" }}>
        {/* Top bar */}
        <div style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e5e7eb", padding:"0.85rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div>
            <h1 style={{ fontSize:"1rem", fontWeight:"700", color:B.gray800 }}>{NAV.find(n=>n.id===page)?.label}</h1>
            <div style={{ fontSize:"0.7rem", color:"#9ca3af" }}>Last synced: {new Date().toLocaleTimeString()}</div>
          </div>
          <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
            {riskScore && (
              <div style={{ background:RISK[riskScore.risk_level]?.bg, border:`1px solid ${RISK[riskScore.risk_level]?.border}`, borderRadius:"0.5rem", padding:"0.4rem 0.85rem", fontSize:"0.72rem", fontWeight:"700", color:RISK[riskScore.risk_level]?.text }}>
                Org Risk: {riskScore.composite_score} — {riskScore.risk_level}
              </div>
            )}
            <button onClick={load} style={{ background:"transparent", border:"1.5px solid #e5e7eb", borderRadius:"0.5rem", padding:"0.4rem 0.85rem", fontSize:"0.72rem", color:B.gray600, cursor:"pointer", fontFamily:"inherit" }}>↻ Refresh</button>
          </div>
        </div>

        <div style={{ padding:"1.5rem" }}>
          {loading ? <Spinner/> : (
            <>
              {page === "dashboard" && <Dashboard org={org} systems={systems} frameworks={frameworks} incidents={incidents} alerts={alerts} riskScore={riskScore} highRisk={highRiskSystems} unack={unackAlerts} onNav={setPage}/>}
              {page === "inventory" && <ModelInventory systems={systems} onRefresh={load}/>}
              {page === "compliance" && <Compliance frameworks={frameworks} systems={systems} onRefresh={load}/>}
              {page === "incidents" && <Incidents incidents={incidents} systems={systems} onRefresh={load}/>}
              {page === "alerts" && <Alerts alerts={alerts} onRefresh={load}/>}
              {page === "connections" && <Connections connections={connections} systems={systems} onRefresh={load}/>}
              {page === "reports" && <BoardReports org={org} systems={systems} frameworks={frameworks} incidents={incidents} riskScore={riskScore}/>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ org, systems, frameworks, incidents, alerts, riskScore, highRisk, unack, onNav }) {
  const criticalSystems = systems.filter(s=>s.risk_level==="Critical");
  const openInc = incidents.filter(i=>i.status==="open"||i.status==="investigating");
  const avgCompliance = frameworks.length ? Math.round(frameworks.reduce((a,f)=>a+(f.compliance_pct||0),0)/frameworks.length) : 0;

  const rsDimensions = riskScore ? [
    {name:"Regulatory",score:riskScore.regulatory_exposure},
    {name:"Bias",score:riskScore.bias_fairness},
    {name:"Data Gov",score:riskScore.data_governance},
    {name:"Incident",score:riskScore.incident_readiness},
    {name:"Maturity",score:riskScore.governance_maturity},
  ] : [];

  return (
    <div className="fade">
      <div style={{marginBottom:"1.5rem"}}>
        <h2 style={{fontSize:"1.25rem",fontWeight:"300",color:B.gray800}}>
          Good morning — here's <strong style={{fontWeight:"700"}}>{org?.name}'s</strong> AI risk posture.
        </h2>
      </div>

      {/* Stat grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
        <StatCard title="Org Risk Score" value={riskScore?.composite_score||"—"} sub={riskScore?.risk_level} color={RISK[riskScore?.risk_level]?.badge||B.purple} icon="📊"/>
        <StatCard title="AI Systems" value={systems.length} sub={`${criticalSystems.length} critical`} color={criticalSystems.length>0?"#ef4444":B.purple} icon="🤖"/>
        <StatCard title="Open Incidents" value={openInc.length} sub="Require action" color={openInc.length>0?"#ef4444":"#22c55e"} icon="🚨"/>
        <StatCard title="Avg Compliance" value={`${avgCompliance}%`} sub={`${frameworks.length} frameworks tracked`} color={avgCompliance>70?"#22c55e":avgCompliance>40?"#f97316":"#ef4444"} icon="⚖️"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"1rem",marginBottom:"1rem"}}>
        {/* Radar */}
        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"1rem",alignSelf:"flex-start"}}>Risk Dimensions</div>
          {rsDimensions.length>0 ? <RadarChart scores={rsDimensions} size={200}/> : <EmptyState icon="📊" title="No data" sub="Risk scores not computed yet"/>}
          {rsDimensions.map(d=>(
            <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",marginTop:"0.4rem"}}>
              <span style={{fontSize:"0.72rem",color:B.gray600}}>{d.name}</span>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <div style={{width:"80px",height:"4px",background:"#f3f4f6",borderRadius:"2px"}}>
                  <div style={{width:`${d.score}%`,height:"100%",background:d.score>70?"#ef4444":d.score>40?"#f97316":"#22c55e",borderRadius:"2px"}}/>
                </div>
                <span style={{fontSize:"0.72rem",fontWeight:"700",color:B.gray700,minWidth:"24px"}}>{d.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance overview */}
        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600}}>Compliance by Framework</div>
            <button onClick={()=>onNav("compliance")} style={{fontSize:"0.72rem",color:B.purple,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>View all →</button>
          </div>
          {frameworks.map(fw=>(
            <div key={fw.id} style={{marginBottom:"0.85rem"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.82rem",fontWeight:"500",color:B.gray800}}>{fw.framework}</span>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span style={{fontSize:"0.72rem",color:B.gray600}}>{fw.compliance_pct}%</span>
                  <Badge label={fw.overall_status?.replace("_"," ")} color={statusColors[fw.overall_status]||"#9ca3af"} bg={`${statusColors[fw.overall_status]}15`}/>
                </div>
              </div>
              <ComplianceBar pct={fw.compliance_pct||0} status={fw.overall_status}/>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts + High-risk systems */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600}}>Active Alerts</div>
            <button onClick={()=>onNav("alerts")} style={{fontSize:"0.72rem",color:B.purple,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>View all →</button>
          </div>
          {unack.slice(0,4).map(a=>(
            <div key={a.id} style={{display:"flex",gap:"0.65rem",padding:"0.65rem",background:RISK[a.severity]?.bg||B.bg,borderRadius:"0.5rem",marginBottom:"0.4rem",border:`1px solid ${RISK[a.severity]?.border||"#e5e7eb"}`}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:RISK[a.severity]?.dot||"#9ca3af",marginTop:"4px",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.8rem",fontWeight:"600",color:B.gray800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                <div style={{fontSize:"0.7rem",color:"#9ca3af"}}>{a.ai_systems?.name} · {a.alert_type?.replace(/_/g," ")}</div>
              </div>
              <RiskBadge level={a.severity}/>
            </div>
          ))}
          {unack.length===0&&<EmptyState icon="✅" title="No active alerts" sub="All clear"/>}
        </div>

        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600}}>High-Risk AI Systems</div>
            <button onClick={()=>onNav("inventory")} style={{fontSize:"0.72rem",color:B.purple,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:"600"}}>View all →</button>
          </div>
          {highRisk.slice(0,4).map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem",background:B.bg,borderRadius:"0.5rem",marginBottom:"0.4rem",border:"1px solid #e5e7eb"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.82rem",fontWeight:"600",color:B.gray800}}>{s.name}</div>
                <div style={{fontSize:"0.7rem",color:"#9ca3af"}}>{s.vendor} · {s.eu_act_classification}</div>
              </div>
              <RiskBadge level={s.risk_level}/>
              <Badge label={s.status} color={statusColors[s.status]||"#9ca3af"} bg={`${statusColors[s.status]||"#9ca3af"}15`}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Model Inventory ──────────────────────────────────────────
function ModelInventory({ systems, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", system_type:"", vendor:"", description:"", eu_act_classification:"Unclassified", risk_level:"Medium", owner_role:"", status:"active" });
  const [saving, setSaving] = useState(false);
  const f = v => e => setForm(p=>({...p,[v]:e}));

  async function save() {
    if (!form.name || !form.system_type) return;
    setSaving(true);
    const { data:orgData } = await sb.from("organizations").select("id").single();
    if (orgData) {
      await sb.from("ai_systems").insert({ ...form, org_id: orgData.id });
      await onRefresh();
    }
    setSaving(false);
    setShowAdd(false);
    setForm({ name:"", system_type:"", vendor:"", description:"", eu_act_classification:"Unclassified", risk_level:"Medium", owner_role:"", status:"active" });
  }

  return (
    <div className="fade">
      <SectionHeader title="AI Model Inventory" count={systems.length}
        action={<Btn label="+ Add System" onClick={()=>setShowAdd(true)} small/>}/>

      <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        {systems.length===0 ? <EmptyState icon="🤖" title="No AI systems registered" sub="Add your first AI system to start monitoring"/> : (
          <table style={{width:"100%"}}>
            <thead>
              <tr style={{background:B.bg,borderBottom:"2px solid #e5e7eb"}}>
                {["System","Vendor","Type","EU AI Act","Risk Level","Status","Owner","Last Bias Test"].map(h=>(
                  <th key={h} style={{padding:"0.7rem 1rem",fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em",color:B.gray600,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systems.map(s=>(
                <tr key={s.id} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={{padding:"0.85rem 1rem"}}>
                    <div style={{fontSize:"0.875rem",fontWeight:"600",color:B.gray800}}>{s.name}</div>
                    {s.description&&<div style={{fontSize:"0.7rem",color:"#9ca3af",marginTop:"0.15rem",maxWidth:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.description}</div>}
                  </td>
                  <td style={{padding:"0.85rem 1rem",fontSize:"0.82rem",color:B.gray700}}>{s.vendor||"—"}</td>
                  <td style={{padding:"0.85rem 1rem",fontSize:"0.78rem",color:B.gray600,textTransform:"capitalize"}}>{s.system_type}</td>
                  <td style={{padding:"0.85rem 1rem"}}>
                    <Badge label={s.eu_act_classification} color={s.eu_act_classification==="High-risk"?"#ef4444":s.eu_act_classification==="Limited-risk"?"#f97316":"#22c55e"} bg={s.eu_act_classification==="High-risk"?"#fee2e215":s.eu_act_classification==="Limited-risk"?"#fff7ed":"#f0fdf4"}/>
                  </td>
                  <td style={{padding:"0.85rem 1rem"}}><RiskBadge level={s.risk_level}/></td>
                  <td style={{padding:"0.85rem 1rem"}}><Badge label={s.status} color={statusColors[s.status]||"#9ca3af"} bg={`${statusColors[s.status]||"#9ca3af"}15`}/></td>
                  <td style={{padding:"0.85rem 1rem",fontSize:"0.78rem",color:B.gray600}}>{s.owner_role||"—"}</td>
                  <td style={{padding:"0.85rem 1rem",fontSize:"0.78rem",color:s.last_bias_test?"#9ca3af":"#ef4444"}}>{s.last_bias_test?new Date(s.last_bias_test).toLocaleDateString():"Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Register AI System">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
          <Input label="System Name" value={form.name} onChange={f("name")} placeholder="HireAI Screening Engine" required/>
          <Input label="Vendor" value={form.vendor} onChange={f("vendor")} placeholder="OpenAI / Internal / Workday"/>
          <Select label="System Type" value={form.system_type} onChange={f("system_type")} required options={["hiring","analytics","chatbot","fraud","diagnostics","personalization","surveillance","forecasting","generative","other"]}/>
          <Select label="Risk Level" value={form.risk_level} onChange={f("risk_level")} options={["Critical","High","Medium","Low"]}/>
          <Select label="EU AI Act Classification" value={form.eu_act_classification} onChange={f("eu_act_classification")} options={["Prohibited","High-risk","Limited-risk","Minimal-risk","Unclassified"]}/>
          <Input label="Owner Role" value={form.owner_role} onChange={f("owner_role")} placeholder="CHRO / CTO / Legal"/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:"0.5rem",marginTop:"0.5rem"}}>
          <Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/>
          <Btn label={saving?"Saving…":"Save System"} onClick={save} disabled={saving||!form.name||!form.system_type}/>
        </div>
      </Modal>
    </div>
  );
}

// ─── Compliance ───────────────────────────────────────────────
function Compliance({ frameworks }) {
  return (
    <div className="fade">
      <SectionHeader title="Compliance Tracker" count={frameworks.length}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:"1rem"}}>
        {frameworks.map(fw=>{
          const sc = {compliant:B.card,partial:"#fffbeb",gap:"#fff5f5",not_started:B.bg}[fw.overall_status]||B.bg;
          return (
            <div key={fw.id} style={{background:sc,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"0.85rem"}}>
                <div>
                  <div style={{fontSize:"0.95rem",fontWeight:"700",color:B.gray800,marginBottom:"0.2rem"}}>{fw.framework}</div>
                  {fw.next_audit&&<div style={{fontSize:"0.7rem",color:"#9ca3af"}}>Next audit: {new Date(fw.next_audit).toLocaleDateString()}</div>}
                </div>
                <Badge label={fw.overall_status?.replace("_"," ")||"not started"} color={statusColors[fw.overall_status]||"#9ca3af"} bg={`${statusColors[fw.overall_status]||"#9ca3af"}15`}/>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
                <span style={{fontSize:"0.72rem",color:B.gray600}}>Compliance progress</span>
                <span style={{fontSize:"0.82rem",fontWeight:"700",color:B.gray800}}>{fw.compliance_pct||0}%</span>
              </div>
              <ComplianceBar pct={fw.compliance_pct||0} status={fw.overall_status}/>
              {fw.last_assessed&&<div style={{fontSize:"0.68rem",color:"#9ca3af",marginTop:"0.5rem"}}>Last assessed: {new Date(fw.last_assessed).toLocaleDateString()}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Incidents ────────────────────────────────────────────────
function Incidents({ incidents, systems, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", severity:"Medium", category:"", system_id:"", reported_by:"", affected_count:"", regulatory_notification_required:false });
  const [saving, setSaving] = useState(false);
  const f = v => e => setForm(p=>({...p,[v]:typeof e==="boolean"?e:e}));

  async function save() {
    if (!form.title) return;
    setSaving(true);
    const { data:orgData } = await sb.from("organizations").select("id").single();
    if (orgData) {
      await sb.from("incidents").insert({
        ...form, org_id:orgData.id,
        affected_count: form.affected_count ? parseInt(form.affected_count) : null,
        system_id: form.system_id || null,
      });
      await onRefresh();
    }
    setSaving(false);
    setShowAdd(false);
  }

  return (
    <div className="fade">
      <SectionHeader title="Incident Log" count={incidents.length}
        action={<Btn label="+ Log Incident" onClick={()=>setShowAdd(true)} small/>}/>
      <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        {incidents.length===0 ? <EmptyState icon="✅" title="No incidents logged" sub="Log your first incident to start tracking"/> : (
          <table style={{width:"100%"}}>
            <thead>
              <tr style={{background:B.bg,borderBottom:"2px solid #e5e7eb"}}>
                {["Incident","AI System","Category","Severity","Status","Reported","Reg. Notify"].map(h=>(
                  <th key={h} style={{padding:"0.7rem 1rem",fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em",color:B.gray600,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc=>(
                <tr key={inc.id} style={{borderBottom:"1px solid #f3f4f6"}}>
                  <td style={{padding:"0.85rem 1rem"}}>
                    <div style={{fontSize:"0.875rem",fontWeight:"600",color:B.gray800,maxWidth:"200px"}}>{inc.title}</div>
                    <div style={{fontSize:"0.7rem",color:"#9ca3af"}}>{inc.reported_by||"—"}</div>
                  </td>
                  <td style={{padding:"0.85rem 1rem",fontSize:"0.82rem",color:B.gray700}}>{inc.ai_systems?.name||"—"}</td>
                  <td style={{padding:"0.85rem 1rem"}}><Badge label={inc.category||"other"} color="#6b7280" bg="#f3f4f6"/></td>
                  <td style={{padding:"0.85rem 1rem"}}><RiskBadge level={inc.severity}/></td>
                  <td style={{padding:"0.85rem 1rem"}}><Badge label={inc.status} color={statusColors[inc.status]||"#9ca3af"} bg={`${statusColors[inc.status]||"#9ca3af"}15`}/></td>
                  <td style={{padding:"0.85rem 1rem",fontSize:"0.78rem",color:"#9ca3af"}}>{new Date(inc.reported_at).toLocaleDateString()}</td>
                  <td style={{padding:"0.85rem 1rem"}}>
                    {inc.regulatory_notification_required ? <Badge label={inc.regulatory_notified?"Notified":"Required"} color={inc.regulatory_notified?"#22c55e":"#ef4444"} bg={inc.regulatory_notified?"#f0fdf4":"#fee2e2"}/> : <span style={{fontSize:"0.78rem",color:"#d1d5db"}}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Log AI Incident">
        <Input label="Incident Title" value={form.title} onChange={f("title")} placeholder="Hiring bias detected in APAC region" required/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
          <Select label="Severity" value={form.severity} onChange={f("severity")} options={["Critical","High","Medium","Low"]}/>
          <Select label="Category" value={form.category} onChange={f("category")} options={["bias","privacy","security","accuracy","compliance","other"]}/>
          <Select label="AI System" value={form.system_id} onChange={f("system_id")} options={systems.map(s=>({v:s.id,l:s.name}))}/>
          <Input label="Reported By" value={form.reported_by} onChange={f("reported_by")} placeholder="Dr. Jane Smith"/>
          <Input label="Affected Count" value={form.affected_count} onChange={f("affected_count")} type="number" placeholder="500"/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",margin:"0.5rem 0 1rem"}}>
          <input type="checkbox" id="regnot" checked={form.regulatory_notification_required} onChange={e=>setForm(p=>({...p,regulatory_notification_required:e.target.checked}))} style={{width:"14px",height:"14px"}}/>
          <label htmlFor="regnot" style={{fontSize:"0.82rem",color:B.gray700}}>Regulatory notification required</label>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:"0.5rem"}}>
          <Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/>
          <Btn label={saving?"Saving…":"Log Incident"} onClick={save} disabled={saving||!form.title}/>
        </div>
      </Modal>
    </div>
  );
}

// ─── Alerts ───────────────────────────────────────────────────
function Alerts({ alerts, onRefresh }) {
  async function acknowledge(id) {
    await sb.from("alerts").update({ acknowledged_at:new Date().toISOString() }).eq("id", id);
    await onRefresh();
  }

  const unack = alerts.filter(a=>!a.acknowledged_at);
  const acked = alerts.filter(a=>a.acknowledged_at);

  return (
    <div className="fade">
      <SectionHeader title="Alerts" count={unack.length} />
      {unack.length > 0 && (
        <div style={{marginBottom:"1.5rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>Active — {unack.length}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {unack.map(a=>(
              <div key={a.id} style={{background:RISK[a.severity]?.bg||B.bg,border:`1.5px solid ${RISK[a.severity]?.border||"#e5e7eb"}`,borderLeft:`4px solid ${RISK[a.severity]?.badge||"#9ca3af"}`,borderRadius:"0.75rem",padding:"1rem 1.25rem",display:"flex",alignItems:"flex-start",gap:"1rem"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.3rem"}}>
                    <span style={{fontSize:"0.875rem",fontWeight:"700",color:B.gray800}}>{a.title}</span>
                    <RiskBadge level={a.severity}/>
                    <Badge label={a.alert_type?.replace(/_/g," ")} color={B.gray600} bg={B.gray100}/>
                  </div>
                  <p style={{fontSize:"0.8rem",color:B.gray700,margin:"0 0 0.4rem",lineHeight:"1.6"}}>{a.message}</p>
                  <div style={{fontSize:"0.7rem",color:"#9ca3af"}}>{a.ai_systems?.name} · {new Date(a.triggered_at).toLocaleString()}</div>
                </div>
                <Btn label="Acknowledge" onClick={()=>acknowledge(a.id)} variant="ghost" small/>
              </div>
            ))}
          </div>
        </div>
      )}
      {unack.length===0&&<div style={{marginBottom:"1.5rem",background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1rem"}}><EmptyState icon="✅" title="All alerts acknowledged" sub="No active alerts"/></div>}
      {acked.length > 0 && (
        <>
          <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:"#9ca3af",marginBottom:"0.75rem"}}>Acknowledged — {acked.length}</div>
          {acked.map(a=>(
            <div key={a.id} style={{background:B.bg,border:"1px solid #e5e7eb",borderRadius:"0.75rem",padding:"0.85rem 1.25rem",marginBottom:"0.4rem",display:"flex",alignItems:"center",gap:"1rem",opacity:0.6}}>
              <div style={{flex:1,fontSize:"0.8rem",color:B.gray600}}>{a.title}</div>
              <div style={{fontSize:"0.7rem",color:"#9ca3af"}}>Acknowledged {new Date(a.acknowledged_at).toLocaleDateString()}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Connections ──────────────────────────────────────────────
const PROVIDERS = [
  { id:"openai", name:"OpenAI", desc:"GPT-4, embeddings, completions usage", color:"#10a37f" },
  { id:"azure_ml", name:"Azure AI / ML", desc:"Azure OpenAI, Cognitive Services", color:"#0078d4" },
  { id:"aws_sagemaker", name:"AWS SageMaker", desc:"SageMaker endpoints, Bedrock", color:"#ff9900" },
  { id:"gcp_vertex", name:"Google Vertex AI", desc:"Vertex AI, Model Garden", color:"#4285f4" },
  { id:"huggingface", name:"HuggingFace", desc:"Hub models, Inference Endpoints", color:"#ff7a00" },
  { id:"custom", name:"Custom / Webhook", desc:"Any AI system via HTTP webhook", color:B.purple },
];

function Connections({ connections, systems, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selProv, setSelProv] = useState("");
  const [form, setForm] = useState({ system_id:"", endpoint_url:"", api_key_hint:"", sync_frequency:"1h" });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function save() {
    if (!selProv) return;
    setSaving(true);
    const { data:orgData } = await sb.from("organizations").select("id").single();
    if (orgData) {
      await sb.from("api_connections").insert({
        org_id:orgData.id, provider:selProv,
        system_id: form.system_id || null,
        endpoint_url: form.endpoint_url || null,
        api_key_hint: form.api_key_hint ? form.api_key_hint.slice(0,8)+"…" : null,
        sync_frequency: form.sync_frequency,
        status:"pending",
      });
      await onRefresh();
    }
    setSaving(false);
    setShowAdd(false);
    setSelProv("");
    setForm({ system_id:"", endpoint_url:"", api_key_hint:"", sync_frequency:"1h" });
  }

  return (
    <div className="fade">
      <SectionHeader title="API Connections" count={connections.length}
        action={<Btn label="+ Connect System" onClick={()=>setShowAdd(true)} small/>}/>

      {/* Provider grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
        {PROVIDERS.map(p=>{
          const conn = connections.filter(c=>c.provider===p.id);
          const connected = conn.length > 0;
          return (
            <div key={p.id} style={{background:B.card,border:`1.5px solid ${connected?p.color+"40":"#e5e7eb"}`,borderRadius:"0.875rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.6rem"}}>
                <span style={{fontSize:"0.9rem",fontWeight:"700",color:B.gray800}}>{p.name}</span>
                {connected ? <Badge label="connected" color={p.color} bg={p.color+"15"}/> : <Badge label="not connected" color="#9ca3af" bg="#f3f4f6"/>}
              </div>
              <p style={{fontSize:"0.75rem",color:"#9ca3af",marginBottom:connected?"0.75rem":0,lineHeight:"1.5"}}>{p.desc}</p>
              {connected && conn.map(c=>(
                <div key={c.id} style={{background:B.bg,borderRadius:"0.375rem",padding:"0.5rem 0.65rem",fontSize:"0.72rem",color:B.gray700}}>
                  <span style={{fontWeight:"600"}}>{c.ai_systems?.name||"Unlinked"}</span>
                  <span style={{color:"#9ca3af",marginLeft:"0.4rem"}}>· syncs every {c.sync_frequency}</span>
                  <span style={{float:"right",color:statusColors[c.status]||"#9ca3af",fontWeight:"600"}}>{c.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Webhook documentation */}
      <div style={{background:"#0f0a1e",border:"1px solid rgba(147,51,234,0.3)",borderRadius:"0.875rem",padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:"rgba(147,51,234,0.8)",marginBottom:"0.75rem"}}>Custom Webhook Endpoint</div>
        <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.6)",marginBottom:"0.5rem"}}>Send events from any AI system to:</div>
        <code style={{display:"block",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"0.375rem",padding:"0.75rem 1rem",fontSize:"0.78rem",color:"#22d3ee",marginBottom:"0.75rem",letterSpacing:"0.02em"}}>
          POST https://cmlodpchjgbqynynqdbc.supabase.co/functions/v1/ingest-event
        </code>
        <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>Accepts: model_id, event_type (prediction, drift, incident), payload JSON. Requires API key header.</div>
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Connect AI System">
        <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>Select Provider</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.4rem",marginBottom:"1.25rem"}}>
          {PROVIDERS.map(p=>(
            <button key={p.id} onClick={()=>setSelProv(p.id)} style={{padding:"0.65rem",borderRadius:"0.5rem",background:selProv===p.id?`${p.color}15`:"transparent",border:selProv===p.id?`2px solid ${p.color}`:"2px solid #e5e7eb",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem",fontWeight:selProv===p.id?"700":"400",color:selProv===p.id?p.color:B.gray600,transition:"all 0.15s"}}>
              {p.name}
            </button>
          ))}
        </div>
        {selProv && (
          <>
            <Select label="Link to AI System" value={form.system_id} onChange={v=>setForm(p=>({...p,system_id:v}))} options={systems.map(s=>({v:s.id,l:s.name}))}/>
            {selProv==="custom" && <Input label="Webhook Endpoint URL" value={form.endpoint_url} onChange={v=>setForm(p=>({...p,endpoint_url:v}))} placeholder="https://your-api.com/ai/events"/>}
            <Input label="API Key" value={form.api_key_hint} onChange={v=>setForm(p=>({...p,api_key_hint:v}))} placeholder="sk-… (stored as hint only)" type="password"/>
            <Select label="Sync Frequency" value={form.sync_frequency} onChange={v=>setForm(p=>({...p,sync_frequency:v}))} options={[{v:"15m",l:"Every 15 minutes"},{v:"1h",l:"Every hour"},{v:"6h",l:"Every 6 hours"},{v:"24h",l:"Daily"}]}/>
          </>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",gap:"0.5rem",marginTop:"0.5rem"}}>
          <Btn label="Cancel" onClick={()=>setShowAdd(false)} variant="ghost"/>
          <Btn label={saving?"Connecting…":"Save Connection"} onClick={save} disabled={saving||!selProv}/>
        </div>
      </Modal>
    </div>
  );
}

// ─── Board Reports ─────────────────────────────────────────────
function BoardReports({ org, systems, frameworks, incidents, riskScore }) {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  async function generateReport() {
    setGenerating(true);
    const openInc = incidents.filter(i=>i.status==="open"||i.status==="investigating");
    const critSystems = systems.filter(s=>s.risk_level==="Critical");
    const avgComp = frameworks.length ? Math.round(frameworks.reduce((a,f)=>a+(f.compliance_pct||0),0)/frameworks.length) : 0;

    const prompt = `You are Dr. Dédé Tetsubayashi, AI governance expert. Generate a concise, authoritative AI Governance Board Report.

ORGANIZATION: ${org?.name} | ${org?.industry} | ${org?.plan_tier} tier
RISK SCORE: ${riskScore?.composite_score||"N/A"} — ${riskScore?.risk_level||"Unknown"}
AI SYSTEMS: ${systems.length} total, ${critSystems.length} critical risk
OPEN INCIDENTS: ${openInc.length}
AVG COMPLIANCE: ${avgComp}% across ${frameworks.length} frameworks
FRAMEWORKS: ${frameworks.map(f=>`${f.framework} (${f.compliance_pct}% compliant)`).join(", ")}
CRITICAL SYSTEMS: ${critSystems.map(s=>s.name).join(", ")||"None"}

Write a board-ready executive summary (4-6 paragraphs). Include: current risk posture assessment, key compliance status, critical items requiring board attention, recommended board-level actions, and a forward outlook. Authoritative, direct, no jargon. This will be presented to C-suite and board members.`;

    const resp = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]}),
    });
    const data = await resp.json();
    const text = data.content?.find(b=>b.type==="text")?.text||"";
    setReport({ text, generatedAt:new Date(), period:"Q1 2026" });
    setGenerating(false);
  }

  return (
    <div className="fade">
      <SectionHeader title="Board Reports" action={<Btn label="Generate Q1 2026 Report" onClick={generateReport} disabled={generating} small/>}/>

      {!report && !generating && (
        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"3rem",textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>📋</div>
          <h3 style={{fontSize:"1rem",fontWeight:"600",color:B.gray800,marginBottom:"0.4rem"}}>Generate your board-ready AI governance report</h3>
          <p style={{fontSize:"0.82rem",color:"#9ca3af",maxWidth:"400px",margin:"0 auto 1.5rem",lineHeight:"1.7"}}>Claude synthesizes your live risk data, compliance posture, and incident history into an executive summary ready for board presentation.</p>
          <Btn label="Generate Q1 2026 Report →" onClick={generateReport}/>
        </div>
      )}

      {generating && (
        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"3rem",textAlign:"center"}}>
          <Spinner/>
          <p style={{fontSize:"0.82rem",color:"#9ca3af",marginTop:"1rem"}}>Synthesizing your risk data into board-ready language…</p>
        </div>
      )}

      {report && (
        <div style={{background:B.card,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"2rem",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.5rem",paddingBottom:"1rem",borderBottom:"1px solid #e5e7eb"}}>
            <div>
              <div style={{fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:"#9ca3af",marginBottom:"0.3rem"}}>AI Governance Board Report</div>
              <h2 style={{fontSize:"1.25rem",fontWeight:"700",color:B.gray800,marginBottom:"0.15rem"}}>{org?.name} · {report.period}</h2>
              <div style={{fontSize:"0.75rem",color:"#9ca3af"}}>Generated {report.generatedAt.toLocaleString()} · Incluu AI Risk Platform</div>
            </div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <Btn label="↺ Regenerate" onClick={generateReport} disabled={generating} variant="ghost" small/>
              <Btn label="Copy Report" onClick={()=>navigator.clipboard.writeText(report.text)} variant="ghost" small/>
            </div>
          </div>
          {/* Key metrics for board */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
            <div style={{background:RISK[riskScore?.risk_level]?.bg||B.bg,borderRadius:"0.75rem",padding:"0.85rem",textAlign:"center"}}>
              <div style={{fontSize:"0.62rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:RISK[riskScore?.risk_level]?.text||"#9ca3af",marginBottom:"0.2rem"}}>Risk Score</div>
              <div style={{fontSize:"1.5rem",fontWeight:"800",color:RISK[riskScore?.risk_level]?.badge||"#9ca3af"}}>{riskScore?.composite_score||"—"}</div>
              <div style={{fontSize:"0.68rem",color:RISK[riskScore?.risk_level]?.text||"#9ca3af",fontWeight:"600"}}>{riskScore?.risk_level||"Unknown"}</div>
            </div>
            {[{l:"AI Systems",v:systems.length,sub:`${systems.filter(s=>s.risk_level==="Critical").length} critical`},{l:"Open Incidents",v:incidents.filter(i=>i.status==="open"||i.status==="investigating").length,sub:"requiring resolution"},{l:"Avg Compliance",v:`${Math.round(frameworks.reduce((a,f)=>a+(f.compliance_pct||0),0)/(frameworks.length||1))}%`,sub:`${frameworks.length} frameworks`}].map(m=>(
              <div key={m.l} style={{background:B.bg,borderRadius:"0.75rem",padding:"0.85rem",textAlign:"center"}}>
                <div style={{fontSize:"0.62rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:B.gray600,marginBottom:"0.2rem"}}>{m.l}</div>
                <div style={{fontSize:"1.5rem",fontWeight:"800",color:B.gray800}}>{m.v}</div>
                <div style={{fontSize:"0.68rem",color:"#9ca3af"}}>{m.sub}</div>
              </div>
            ))}
          </div>
          {/* Report text */}
          <div style={{background:"rgba(147,51,234,0.03)",border:"1px solid rgba(147,51,234,0.1)",borderRadius:"0.75rem",padding:"1.5rem"}}>
            {report.text.split("\n\n").map((para,i)=>(
              <p key={i} style={{fontSize:"0.9rem",color:B.gray700,lineHeight:"1.8",marginBottom:"1rem"}}>{para}</p>
            ))}
          </div>
          <div style={{marginTop:"1.25rem",padding:"1rem",background:B.bg,borderRadius:"0.75rem",fontSize:"0.75rem",color:"#9ca3af"}}>
            <strong style={{color:B.gray600}}>Prepared by:</strong> Incluu AI Risk Platform · Dr. Dédé Tetsubayashi, PhD · incluu.us
          </div>
        </div>
      )}
    </div>
  );
}
