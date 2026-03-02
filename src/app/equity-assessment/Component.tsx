"use client";
import { useState, useRef } from "react";

// âââââãã©ã³ããã¼ã¯ã³âââââââââââââââââââââââââââââââââââââââââââââââââââââ
const B = {
  heroGrad: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #22d3ee 100%)",
  btnGrad: "linear-gradient(to right, #9333ea, #0891b2)",
  purple: "#9333ea",
  purple5: "#a855f7",
  cyan: "#0891b2",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
};

// âââââè¨­å®âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const INDUSTRIES = ["Financial Services / Banking","Healthcare / Life Sciences","Insurance","Legal Services","Technology / SaaS","Manufacturing","Retail / E-commerce","Government / Public Sector","Energy / Utilities","Education / Higher Ed"];
const AI_SYSTEMS = ["Hiring / applicant screening","Performance management analytics","Customer-facing decisioning / chatbots","Fraud detection / credit scoring","Predictive analytics","Generative AI (internal tools, code, content)","Healthcare diagnostics / clinical support","Marketing personalization","Surveillance / monitoring systems","Supply chain optimization"];
const REGULATIONS = ["EU AI Act","NIST AI RMF","ISO 42001","EEOC / OFCCP","HIPAA","CCPA / CPRA","GDPR","NY Local Law 144","Colorado / Illinois AI bias laws","CFPB / Fair lending","FTC Act","SOC 2"];
const MATURITY_OPTS = [
  {v:"none",l:"No governance in place",d:"Starting from scratch"},
  {v:"early",l:"Early stage",d:"Some informal practices"},
  {v:"developing",l:"Developing",d:"Ad hoc policies, no formal program"},
  {v:"established",l:"Established",d:"Formal program actively maturing"},
];
const EMPLOYEES = ["100â500","500â1,000","1,000â5,000","5,000â25,000","25,000+"];
const INCIDENT_HISTORY = ["No AI incidents to date","1â2 minor incidents, resolved internally","1â2 incidents with external visibility","Multiple incidents, regulatory inquiry received","Active regulatory investigation or litigation"];
const STRATEGIC_DRIVER = ["Proactive risk reduction","Regulatory deadline approaching","Board / investor mandate","M&A due diligence","Customer / partner requirement","Public incident response","Competitive differentiation"];

const SYSTEM_PROMPT = `You are Dr. DÃ©dÃ© Tetsubayashi â Cornell PhD anthropologist, former Meta/Salesforce/Indeed/WeWork/Rakuten executive, TEDx speaker, and one of the foremost AI governance experts in the world. You have helped Fortune 500 companies navigate billions in regulatory exposure.

Your AI Equity Assessment reports are authoritative, specific, and immediately actionable. They are the quality of a $15,000 consulting deliverable â not generic checklists. Every section references real regulatory frameworks, real fine structures, real risk patterns for the specific industry and AI systems described. You write with precision, authority, and care for the humans impacted by these AI systems.`;

// âââââãã«ãã¼âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Chip({label, selected, onClick}) {
  return (
    <button onClick={onClick} style={{
      padding:"0.35rem 0.8rem", borderRadius:"50px",
      background: selected ? B.heroGrad : "transparent",
      border: selected ? "none" : "1.5px solid #e5e7eb",
      color: selected ? "#fff" : B.gray600,
      fontSize:"0.78rem", fontWeight: selected?"600":"400",
      cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
    }}>{label}</button>
  );
}

function CheckChip({label, selected, onClick}) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:"0.45rem",
      padding:"0.45rem 0.85rem", borderRadius:"0.5rem",
      background: selected ? "rgba(147,51,234,0.07)" : "transparent",
      border: selected ? `1.5px solid ${B.purple5}` : "1.5px solid #e5e7eb",
      color: selected ? B.purple : B.gray700,
      fontSize:"0.78rem", fontWeight: selected?"600":"400",
      cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
    }}>
      <span style={{width:"13px",height:"13px",borderRadius:"3px",border: selected?`2px solid ${B.purple5}`:"2px solid #d1d5db",background:selected?B.purple5:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.55rem",color:"#fff",flexShrink:0}}>{selected&&"â"}</span>
      {label}
    </button>
  );
}

// âââââãã­ã°ã¬ã¹ãã¼âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ProgressBar({steps, current}) {
  return (
    <div style={{display:"flex",gap:"0.4rem",marginBottom:"2rem"}}>
      {steps.map((s,i) => (
        <div key={i} style={{flex:1}}>
          <div style={{height:"3px",borderRadius:"2px",background: i<=current ? B.heroGrad : "#e5e7eb",transition:"background 0.3s"}}/>
          <div style={{fontSize:"0.65rem",color: i===current?B.purple:"#9ca3af",marginTop:"0.3rem",fontWeight:i===current?"600":"400"}}>{s}</div>
        </div>
      ))}
    </div>
  );
}

// âââââã¹ã³ã¢ãªã³ã°âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ScoreRing({score, label, size=80, stroke=8}) {
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  const pct = Math.max(0,Math.min(100,score||0));
  const color = pct>=75?"#ef4444":pct>=50?"#f59e0b":"#22c55e";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1s ease"}}/>
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          style={{fontSize:`${size*0.22}px`,fontWeight:"700",fill:color,transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>
          {pct}
        </text>
      </svg>
      <span style={{fontSize:"0.7rem",color:B.gray600,textAlign:"center",lineHeight:"1.3"}}>{label}</span>
    </div>
  );
}

// âââââã»ã¯ã·ã§ã³ã«ã¼ãâââââââââââââââââââââââââââââââââââââââââââââââââ
function SectionCard({title, icon, status, children}) {
  const statusColors = {
    done:{bg:"rgba(22,163,74,0.08)",border:"rgba(22,163,74,0.2)",text:"#15803d",label:"Complete"},
    loading:{bg:"rgba(147,51,234,0.06)",border:"rgba(147,51,234,0.2)",text:B.purple,label:"Analyzingâ¦"},
    pending:{bg:"#f9fafb",border:"#e5e7eb",text:"#9ca3af",label:"Pending"},
  };
  const sc = statusColors[status]||statusColors.pending;
  return (
    <div style={{background:"#fff",border:`1.5px solid ${sc.border}`,borderRadius:"1rem",overflow:"hidden",marginBottom:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.85rem 1.25rem",background:sc.bg,borderBottom:`1px solid ${sc.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
          <span style={{fontSize:"1rem"}}>{icon}</span>
          <span style={{fontSize:"0.88rem",fontWeight:"600",color:B.gray800}}>{title}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
          {status==="loading"&&<span style={{width:"10px",height:"10px",borderRadius:"50%",border:"2px solid rgba(147,51,234,0.3)",borderTopColor:B.purple,display:"inline-block",animation:"spin 0.8s linear infinite"}}/>}
          <span style={{fontSize:"0.7rem",fontWeight:"600",color:sc.text}}>{sc.label}</span>
        </div>
      </div>
      {children&&<div style={{padding:"1.25rem"}}>{children}</div>}
    </div>
  );
}

// âââââéçåº¦ããã¸âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Sev({level}) {
  const m={Critical:{bg:"#fee2e2",text:"#b91c1c"},High:{bg:"#fff7ed",text:"#c2410c"},Medium:{bg:"#fef9c3",text:"#a16207"},Low:{bg:"#f0fdf4",text:"#15803d"}};
  const s=m[level]||m.Medium;
  return <span style={{background:s.bg,color:s.text,fontSize:"0.65rem",fontWeight:"700",padding:"0.15rem 0.5rem",borderRadius:"50px",letterSpacing:"0.05em"}}>{level}</span>;
}

// âââââã¡ã¤ã³ã¢ããªâââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function EnhancedAssessment() {
  // ãã©ã¼ã ç¶æ
  const [step, setStep] = useState(0); // 0=form, 1=generating, 2=report
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employees, setEmployees] = useState("");
  const [aiSystems, setAiSystems] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [maturity, setMaturity] = useState("none");
  const [incidents, setIncidents] = useState("");
  const [driver, setDriver] = useState("");
  const [email, setEmail] = useState("");

  // Report state â each section generated independently
  const [sections, setSections] = useState({
    riskScore: {status:"pending", data:null},
    regGap: {status:"pending", data:null},
    systemRegister: {status:"pending", data:null},
    roadmap: {status:"pending", data:null},
    financialExposure: {status:"pending", data:null},
  });

  const reportRef = useRef(null);
  const canStart = industry && employees && aiSystems.length>0;

  function setSection(key, patch) {
    setSections(prev=>({...prev,[key]:{...prev[key],...patch}}));
  }

  async function callClaude(prompt, maxTokens=1500) {
    const resp = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:maxTokens,
        system:SYSTEM_PROMPT,
        messages:[{role:"user",content:prompt}],
      }),
    });
    const d = await resp.json();
    const text = d.content?.find(b=>b.type==="text")?.text||"";
    const m = text.match(/\{[\s\S]*\}/);
    if(!m) throw new Error("No JSON");
    return JSON.parse(m[0]);
  }

  async function generate() {
    setStep(1);
    setTimeout(()=>reportRef.current?.scrollIntoView({behavior:"smooth"}),100);

    const ctx = `
Organization: ${orgName||"[Undisclosed]"}
Industry: ${industry}
Employees: ${employees}
AI Systems: ${aiSystems.join(", ")}
Regulatory frameworks: ${regulations.length?regulations.join(", "):"General best practices"}
Governance maturity: ${maturity}
Incident history: ${incidents||"Not disclosed"}
Strategic driver: ${driver||"Not disclosed"}`;

    // ââ Call 1: Risk Scoring ââââââââââââââââââââââââââââââââââââââââââ
    setSection("riskScore",{status:"loading"});
    try {
      const d = await callClaude(`${ctx}

Score this organization's AI risk across 5 dimensions (0â100 where 100 = highest risk). Return ONLY JSON:
{
  "composite": [weighted average],
  "level": "Critical|High|Medium|Low",
  "dimensions": [
    {"name":"Regulatory Exposure","score":[0-100],"rationale":"[1 sentence specific to their industry+systems]"},
    {"name":"Bias & Fairness Risk","score":[0-100],"rationale":"[1 sentence]"},
    {"name":"Data Governance","score":[0-100],"rationale":"[1 sentence]"},
    {"name":"Incident Readiness","score":[0-100],"rationale":"[1 sentence]"},
    {"name":"Governance Maturity","score":[0-100],"rationale":"[1 sentence]"}
  ],
  "executiveSummary": "[3-4 sentences. Authoritative. Name the specific risks. No hedging.]"
}`, 1200);
      setSection("riskScore",{status:"done",data:d});
    } catch(e){ setSection("riskScore",{status:"done",data:null}); }

    // ââ Call 2: Regulatory Gap ââââââââââââââââââââââââââââââââââââââââ
    setSection("regGap",{status:"loading"});
    try {
      const regs = regulations.length?regulations:["NIST AI RMF","EU AI Act"];
      const d = await callClaude(`${ctx}

Generate a regulatory gap analysis. For each applicable framework, identify 2-3 specific gaps. Return ONLY JSON:
{
  "gaps": [
    {
      "framework": "[framework name]",
      "article": "[specific article or section, e.g. EU AI Act Art. 9]",
      "requirement": "[what the law requires, 1 sentence]",
      "gap": "[what this org is likely missing based on their profile, specific]",
      "severity": "Critical|High|Medium",
      "remediation": "[concrete action, 1 sentence]"
    }
  ]
}
Include 6-10 total gaps across their applicable frameworks. Be specific to their industry and AI systems â not generic.`, 1800);
      setSection("regGap",{status:"done",data:d});
    } catch(e){ setSection("regGap",{status:"done",data:null}); }

    // ââ Call 3: System Risk Register ââââââââââââââââââââââââââââââââââ
    setSection("systemRegister",{status:"loading"});
    try {
      const d = await callClaude(`${ctx}

Generate a risk register entry for each AI system. Return ONLY JSON:
{
  "systems": [
    {
      "name": "[AI system name from the list]",
      "euActClass": "High-risk|Limited-risk|Minimal-risk",
      "riskLevel": "Critical|High|Medium|Low",
      "primaryExposure": "[top regulatory/legal exposure, specific]",
      "biasVector": "[most likely bias or fairness failure mode]",
      "control": "[single most important control they should have in place]",
      "urgency": "Immediate|30 days|90 days"
    }
  ]
}
Cover all ${aiSystems.length} systems listed. Be specific â not generic placeholders.`, 1500);
      setSection("systemRegister",{status:"done",data:d});
    } catch(e){ setSection("systemRegister",{status:"done",data:null}); }

    // ââ Call 4: Roadmap ââââââââââââââââââââââââââââââââââââââââââââââ
    setSection("roadmap",{status:"loading"});
    try {
      const d = await callClaude(`${ctx}

Generate a prioritized 30/60/90-day action roadmap. Return ONLY JSON:
{
  "phases": [
    {
      "phase": "30 Days",
      "theme": "[1 sentence focus]",
      "actions": [
        {"action":"[specific task]","owner":"CHRO|CTO|Legal|Board|Chief AI Officer","effort":"Low|Medium|High","impact":"High|Medium"}
      ]
    },
    {
      "phase": "60 Days",
      "theme": "[1 sentence focus]",
      "actions": [...]
    },
    {
      "phase": "90 Days",
      "theme": "[1 sentence focus]",
      "actions": [...]
    }
  ]
}
3-4 actions per phase. Be specific to their industry, AI systems, and maturity level. No generic advice.`, 1500);
      setSection("roadmap",{status:"done",data:d});
    } catch(e){ setSection("roadmap",{status:"done",data:null}); }

    // ââ Call 5: Financial Exposure ââââââââââââââââââââââââââââââââââââ
    setSection("financialExposure",{status:"loading"});
    try {
      const d = await callClaude(`${ctx}

Estimate financial exposure from AI governance failures. Use real regulatory fine structures. Return ONLY JSON:
{
  "totalExposureLow": "[$ amount, e.g. $2.4M]",
  "totalExposureHigh": "[$ amount, e.g. $47M]",
  "exposures": [
    {
      "source": "[regulation or risk type]",
      "scenario": "[specific failure scenario for this org]",
      "fineRangeLow": "[$ amount]",
      "fineRangeHigh": "[$ amount]",
      "basis": "[legal citation or precedent]"
    }
  ],
  "roiStatement": "[1 sentence: cost of remediation vs. exposure]",
  "urgencyNote": "[1 sentence on timing/enforcement trends]"
}
Include 4-6 exposure scenarios specific to their industry, AI systems, and applicable regulations. Reference real cases or fine structures (EU AI Act max â¬35M or 7% of global turnover; EEOC settlements avg $2.7M; HIPAA max $1.9M per violation category, etc.).`, 1500);
      setSection("financialExposure",{status:"done",data:d});
    } catch(e){ setSection("financialExposure",{status:"done",data:null}); }

    setStep(2);
  }

  const rs = sections.riskScore;
  const rg = sections.regGap;
  const sr = sections.systemRegister;
  const rm = sections.roadmap;
  const fe = sections.financialExposure;

  const levelColors = {Critical:{bg:"#fee2e2",border:"#fecaca",text:"#b91c1c",badge:"#ef4444"},High:{bg:"#fff7ed",border:"#fed7aa",text:"#c2410c",badge:"#f97316"},Medium:{bg:"#fef9c3",border:"#fde047",text:"#a16207",badge:"#eab308"},Low:{bg:"#f0fdf4",border:"#bbf7d0",text:"#15803d",badge:"#22c55e"}};
  const lc = levelColors[rs.data?.level]||levelColors.High;

  return (
    <div style={{minHeight:"100vh",background:B.gray50,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <style>{`*{box-sizing:border-box}textarea:focus,input:focus{outline:2px solid #a855f7;outline-offset:1px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fadeIn{animation:fadeIn 0.4s ease forwards}`}</style>

      {/* Header */}
      <div style={{background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid #e5e7eb",padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <div style={{width:"32px",height:"32px",background:B.heroGrad,borderRadius:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:"800",color:"#fff"}}>AI</div>
          <div>
            <div style={{fontSize:"0.9rem",fontWeight:"600",color:B.gray800}}>AI Equity Assessment</div>
            <div style={{fontSize:"0.67rem",color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.05em"}}>Incluu Â· Dr. DÃ©dÃ© Tetsubayashi</div>
          </div>
        </div>
        <span style={{fontSize:"0.67rem",fontWeight:"600",letterSpacing:"0.08em",textTransform:"uppercase",color:"#16a34a",background:"rgba(22,163,74,0.08)",border:"1px solid rgba(22,163,74,0.2)",padding:"0.3rem 0.75rem",borderRadius:"50px"}}>Free Assessment</span>
      </div>

      {/* Hero */}
      <div style={{background:B.heroGrad,color:"#fff",padding:"2.5rem 1.5rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 25% 50%, rgba(255,255,255,0.12), transparent 60%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:"700px",margin:"0 auto",position:"relative"}}>
          <span style={{display:"inline-block",marginBottom:"0.75rem",padding:"0.3rem 1rem",background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"50px",fontSize:"0.72rem",fontWeight:"600",letterSpacing:"0.06em"}}>Equivalent to a $15,000 consulting engagement â complimentary</span>
          <h1 style={{fontSize:"clamp(1.5rem,4vw,2.3rem)",fontWeight:"300",lineHeight:"1.2",marginBottom:"0.75rem"}}>
            Know your <strong style={{fontWeight:"700"}}>exact AI risk exposure</strong><br/>before your board does.
          </h1>
          <p style={{fontSize:"0.95rem",color:"rgba(255,255,255,0.88)",lineHeight:"1.7",maxWidth:"540px"}}>
            Five-module deep assessment: risk scoring across 5 dimensions, article-level regulatory gap analysis, system-by-system risk register, 90-day roadmap, and financial exposure estimate. Takes 3 minutes. Specific to you.
          </p>
        </div>
      </div>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"2rem 1.5rem 4rem"}}>

        {/* ââââFORMââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
        {step===0&&(
          <div>
            <ProgressBar steps={["Organization","AI Systems","Regulations","Context","Generate"]} current={0}/>

            {/* Org */}
            <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.25rem",marginBottom:"1rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>Organization</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.75rem",marginBottom:"1rem"}}>
                <div>
                  <label style={{display:"block",fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:B.gray600,marginBottom:"0.35rem"}}>Org name <span style={{color:"#9ca3af",fontWeight:"400",textTransform:"none",letterSpacing:0}}>optional</span></label>
                  <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="Acme Corp" style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:"0.5rem",padding:"0.6rem 0.8rem",fontSize:"0.82rem",color:B.gray700,fontFamily:"inherit",background:B.gray50}}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:B.gray600,marginBottom:"0.35rem"}}>Contact email</label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" type="email" style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:"0.5rem",padding:"0.6rem 0.8rem",fontSize:"0.82rem",color:B.gray700,fontFamily:"inherit",background:B.gray50}}/>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:B.gray600,marginBottom:"0.35rem"}}>Employee count <span style={{color:"#ef4444"}}>*</span></label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>
                    {EMPLOYEES.map(e=><Chip key={e} label={e} selected={employees===e} onClick={()=>setEmployees(employees===e?"":e)}/>)}
                  </div>
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:B.gray600,marginBottom:"0.5rem"}}>Industry sector <span style={{color:"#ef4444"}}>*</span></label>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>
                  {INDUSTRIES.map(ind=><Chip key={ind} label={ind} selected={industry===ind} onClick={()=>setIndustry(industry===ind?"":ind)}/>)}
                </div>
              </div>
            </div>

            {/* AI Systems */}
            <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.25rem",marginBottom:"1rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>AI Systems in Production <span style={{color:"#ef4444"}}>*</span></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"0.4rem"}}>
                {AI_SYSTEMS.map(s=><CheckChip key={s} label={s} selected={aiSystems.includes(s)} onClick={()=>setAiSystems(aiSystems.includes(s)?aiSystems.filter(x=>x!==s):[...aiSystems,s])}/>)}
              </div>
            </div>

            {/* Regulations + Maturity */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>Regulatory Frameworks</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
                  {REGULATIONS.map(r=><CheckChip key={r} label={r} selected={regulations.includes(r)} onClick={()=>setRegulations(regulations.includes(r)?regulations.filter(x=>x!==r):[...regulations,r])}/>)}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>Governance Maturity</div>
                  {MATURITY_OPTS.map(m=>(
                    <button key={m.v} onClick={()=>setMaturity(m.v)} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",padding:"0.55rem 0.75rem",borderRadius:"0.5rem",background:maturity===m.v?"rgba(147,51,234,0.07)":"transparent",border:maturity===m.v?`1.5px solid ${B.purple5}`:"1.5px solid transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%",transition:"all 0.15s",marginBottom:"0.25rem"}}>
                      <span style={{width:"14px",height:"14px",borderRadius:"50%",border:maturity===m.v?`2px solid ${B.purple5}`:"2px solid #d1d5db",background:maturity===m.v?B.purple5:"transparent",flexShrink:0,marginTop:"2px"}}/>
                      <div>
                        <div style={{fontSize:"0.8rem",fontWeight:maturity===m.v?"600":"400",color:maturity===m.v?B.purple:B.gray700}}>{m.l}</div>
                        <div style={{fontSize:"0.68rem",color:"#9ca3af"}}>{m.d}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>Incident History</div>
                  {INCIDENT_HISTORY.map(inc=>(
                    <button key={inc} onClick={()=>setIncidents(incidents===inc?"":inc)} style={{display:"block",width:"100%",textAlign:"left",padding:"0.45rem 0.75rem",borderRadius:"0.4rem",background:incidents===inc?"rgba(147,51,234,0.07)":"transparent",border:incidents===inc?`1px solid rgba(147,51,234,0.2)`:"1px solid transparent",cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem",color:incidents===inc?B.purple:B.gray700,marginBottom:"0.2rem",fontWeight:incidents===inc?"500":"400"}}>
                      {inc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Driver */}
            <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.25rem",marginBottom:"1.5rem",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:"0.72rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:B.gray600,marginBottom:"0.75rem"}}>What's driving this assessment?</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                {STRATEGIC_DRIVER.map(d=><Chip key={d} label={d} selected={driver===d} onClick={()=>setDriver(driver===d?"":d)}/>)}
              </div>
            </div>

            <button onClick={generate} disabled={!canStart} style={{width:"100%",background:canStart?B.btnGrad:"#e5e7eb",color:canStart?"#fff":"#9ca3af",border:"none",borderRadius:"0.5rem",padding:"1.1rem",fontSize:"0.95rem",fontWeight:"700",cursor:canStart?"pointer":"not-allowed",fontFamily:"inherit",letterSpacing:"0.01em"}}>
              Run Full AI Equity Assessment â 5 Modules â
            </button>
            {!canStart&&<p style={{textAlign:"center",fontSize:"0.72rem",color:"#9ca3af",marginTop:"0.5rem"}}>Select industry, employee count, and at least one AI system to begin.</p>}
          </div>
        )}

        {/* ââââGENERATING / REPORTââââââââââââââââââââââââââââââââââââ */}
        {(step===1||step===2)&&(
          <div ref={reportRef} className="fadeIn">
            {/* Report header */}
            <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:"1rem",padding:"1.5rem",marginBottom:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem"}}>
                <div>
                  <div style={{fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.12em",color:"#9ca3af",marginBottom:"0.3rem"}}>AI Equity Assessment Report</div>
                  <h2 style={{fontSize:"1.4rem",fontWeight:"300",color:B.gray800,marginBottom:"0.15rem"}}>
                    <strong style={{fontWeight:"700"}}>{orgName||"Your Organization"}</strong> Â· {industry}
                  </h2>
                  <div style={{fontSize:"0.78rem",color:"#9ca3af"}}>{employees} employees Â· {aiSystems.length} AI systems Â· Generated {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
                </div>
                {rs.data&&(
                  <div style={{background:lc.bg,border:`1.5px solid ${lc.border}`,borderRadius:"0.875rem",padding:"1rem 1.25rem",textAlign:"center",minWidth:"120px"}}>
                    <div style={{fontSize:"0.65rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:lc.text,marginBottom:"0.3rem"}}>Risk Level</div>
                    <div style={{fontSize:"2rem",fontWeight:"800",color:lc.badge,lineHeight:"1"}}>{rs.data.composite}</div>
                    <div style={{fontSize:"0.72rem",fontWeight:"700",color:lc.text,marginTop:"0.15rem"}}>{rs.data.level}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ââ Module 1: Risk Scoring ââ */}
            <SectionCard title="Module 1 â Risk Score & Executive Summary" icon="ð" status={rs.status}>
              {rs.data&&(
                <div className="fadeIn">
                  <p style={{fontSize:"0.875rem",color:B.gray700,lineHeight:"1.75",marginBottom:"1.5rem",padding:"1rem",background:"rgba(147,51,234,0.04)",borderRadius:"0.75rem",borderLeft:`3px solid ${B.purple5}`}}>
                    {rs.data.executiveSummary}
                  </p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"1rem"}}>
                    {rs.data.dimensions?.map(dim=>(
                      <div key={dim.name} style={{textAlign:"center"}}>
                        <ScoreRing score={dim.score} label={dim.name} size={72} stroke={7}/>
                        <p style={{fontSize:"0.67rem",color:"#9ca3af",marginTop:"0.4rem",lineHeight:"1.4"}}>{dim.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ââ Module 2: Regulatory Gap ââ */}
            <SectionCard title="Module 2 â Regulatory Gap Analysis" icon="âï¸" status={rg.status}>
              {rg.data?.gaps&&(
                <div className="fadeIn">
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.8rem"}}>
                      <thead>
                        <tr style={{background:B.gray50}}>
                          {["Framework","Article","Requirement","Gap Identified","Severity","Remediation"].map(h=>(
                            <th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",fontWeight:"700",color:B.gray600,fontSize:"0.68rem",textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:"2px solid #e5e7eb",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rg.data.gaps.map((g,i)=>(
                          <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}>
                            <td style={{padding:"0.65rem 0.75rem",fontWeight:"600",color:B.purple,whiteSpace:"nowrap"}}>{g.framework}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:"#9ca3af",fontSize:"0.72rem",whiteSpace:"nowrap"}}>{g.article}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:B.gray700,maxWidth:"180px"}}>{g.requirement}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:B.gray700,maxWidth:"200px"}}>{g.gap}</td>
                            <td style={{padding:"0.65rem 0.75rem"}}><Sev level={g.severity}/></td>
                            <td style={{padding:"0.65rem 0.75rem",color:B.gray700,maxWidth:"180px"}}>{g.remediation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ââ Module 3: System Risk Register ââ */}
            <SectionCard title="Module 3 â AI System Risk Register" icon="ðï¸" status={sr.status}>
              {sr.data?.systems&&(
                <div className="fadeIn" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"0.75rem"}}>
                  {sr.data.systems.map((s,i)=>{
                    const urgColors={Immediate:"#fee2e2","30 days":"#fff7ed","90 days":"#f0fdf4"};
                    const uc=urgColors[s.urgency]||"#f9fafb";
                    return (
                      <div key={i} style={{background:B.gray50,border:"1.5px solid #e5e7eb",borderRadius:"0.875rem",padding:"1rem",borderTop:`3px solid ${levelColors[s.riskLevel]?.badge||"#9ca3af"}`}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                          <span style={{fontSize:"0.82rem",fontWeight:"600",color:B.gray800}}>{s.name}</span>
                          <Sev level={s.riskLevel}/>
                        </div>
                        <div style={{fontSize:"0.7rem",color:"#9ca3af",marginBottom:"0.75rem"}}>{s.euActClass}</div>
                        <div style={{fontSize:"0.75rem",color:B.gray700,marginBottom:"0.4rem"}}><span style={{fontWeight:"600",color:B.gray800}}>Exposure: </span>{s.primaryExposure}</div>
                        <div style={{fontSize:"0.75rem",color:B.gray700,marginBottom:"0.4rem"}}><span style={{fontWeight:"600",color:B.gray800}}>Bias risk: </span>{s.biasVector}</div>
                        <div style={{fontSize:"0.75rem",color:B.gray700,marginBottom:"0.75rem"}}><span style={{fontWeight:"600",color:B.gray800}}>Priority control: </span>{s.control}</div>
                        <span style={{display:"inline-block",background:uc,border:`1px solid ${uc==="#fee2e2"?"#fecaca":uc==="#fff7ed"?"#fed7aa":"#bbf7d0"`},borderRadius:"50px",padding:"0.2rem 0.6rem",fontSize:"0.68rem",fontWeight:"700",color:uc==="#fee2e2"?"#b91c1c":uc==="#fff7ed"?"#c2410c":"#15803d"}}>
                          {s.urgency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* ââ Module 4: Roadmap ââ */}
            <SectionCard title="Module 4 â 30 / 60 / 90 Day Roadmap" icon="ðï¸" status={rm.status}>
              {rm.data?.phases&&(
                <div className="fadeIn" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.75rem"}}>
                  {rm.data.phases.map((phase,i)=>{
                    const phaseColors=["rgba(147,51,234,0.06)","rgba(8,145,178,0.06)","rgba(22,163,74,0.06)"];
                    const phaseBorders=[B.purple5,B.cyan,"#16a34a"];
                    return (
                      <div key={i} style={{background:phaseColors[i],border:`1.5px solid ${phaseBorders[i]}40`,borderRadius:"0.875rem",padding:"1.1rem"}}>
                        <div style={{fontSize:"0.7rem",fontWeight:"800",textTransform:"uppercase",letterSpacing:"0.12em",color:phaseBorders[i],marginBottom:"0.3rem"}}>{phase.phase}</div>
                        <div style={{fontSize:"0.78rem",color:B.gray700,marginBottom:"0.85rem",fontStyle:"italic"}}>{phase.theme}</div>
                        {phase.actions?.map((a,j)=>(
                          <div key={j} style={{background:"rgba(255,255,255,0.7)",borderRadius:"0.5rem",padding:"0.65rem 0.75rem",marginBottom:"0.4rem"}}>
                            <div style={{fontSize:"0.78rem",color:B.gray800,fontWeight:"500",marginBottom:"0.25rem"}}>{a.action}</div>
                            <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                              <span style={{fontSize:"0.65rem",background:"rgba(147,51,234,0.1)",color:B.purple,padding:"0.1rem 0.4rem",borderRadius:"50px",fontWeight:"600"}}>{a.owner}</span>
                              <span style={{fontSize:"0.65rem",background:B.gray100,color:B.gray600,padding:"0.1rem 0.4rem",borderRadius:"50px"}}>{a.effort} effort</span>
                              <span style={{fontSize:"0.65rem",background:a.impact==="High"?"rgba(22,163,74,0.1)":"rgba(234,179,8,0.1)",color:a.impact==="High"?"#15803d":"#a16207",padding:"0.1rem 0.4rem",borderRadius:"50px",fontWeight:"600"}}>{a.impact} impact</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* ââ Module 5: Financial Exposure ââ */}
            <SectionCard title="Module 5 â Financial Exposure Estimate" icon="ð°" status={fe.status}>
              {fe.data&&(
                <div className="fadeIn">
                  {/* Headline */}
                  <div style={{background:"#fee2e2",border:"1.5px solid #fecaca",borderRadius:"0.875rem",padding:"1.25rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:"1.5rem"}}>
                    <div>
                      <div style={{fontSize:"0.68rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",color:"#b91c1c",marginBottom:"0.2rem"}}>Estimated Total Exposure</div>
                      <div style={{fontSize:"1.6rem",fontWeight:"800",color:"#b91c1c",lineHeight:"1"}}>{fe.data.totalExposureLow} â {fe.data.totalExposureHigh}</div>
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:"0.82rem",color:"#7f1d1d",lineHeight:"1.6",margin:0}}>{fe.data.roiStatement}</p>
                      <p style={{fontSize:"0.78rem",color:"#9f1239",lineHeight:"1.5",margin:"0.5rem 0 0",fontStyle:"italic"}}>{fe.data.urgencyNote}</p>
                    </div>
                  </div>
                  {/* Table */}
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.8rem"}}>
                      <thead>
                        <tr style={{background:B.gray50}}>
                          {["Risk Source","Scenario","Fine Range Low","Fine Range High","Legal Basis"].map(h=>(
                            <th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",fontWeight:"700",color:B.gray600,fontSize:"0.68rem",textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:"2px solid #e5e7eb",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fe.data.exposures?.map((ex,i)=>(
                          <tr key={i} style={{borderBottom:"1px solid #f3f4f6"}}>
                            <td style={{padding:"0.65rem 0.75rem",fontWeight:"600",color:"#b91c1c"}}>{ex.source}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:B.gray700,maxWidth:"220px"}}>{ex.scenario}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:B.gray700,fontVariantNumeric:"tabular-nums"}}>{ex.fineRangeLow}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:"#b91c1c",fontWeight:"600",fontVariantNumeric:"tabular-nums"}}>{ex.fineRangeHigh}</td>
                            <td style={{padding:"0.65rem 0.75rem",color:"#9ca3af",fontSize:"0.72rem"}}>{ex.basis}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* CTA */}
            {step===2&&(
              <div className="fadeIn" style={{background:B.heroGrad,borderRadius:"1rem",padding:"2rem",color:"#fff",position:"relative",overflow:"hidden",marginTop:"1rem"}}>
                <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 75% 25%, rgba(255,255,255,0.1), transparent 55%)",pointerEvents:"none"}}/>
                <div style={{position:"relative",display:"grid",gridTemplateColumns:"1fr auto",gap:"2rem",alignItems:"center"}}>
                  <div>
                    <span style={{display:"inline-block",marginBottom:"0.6rem",padding:"0.25rem 0.75rem",background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"50px",fontSize:"0.68rem",fontWeight:"600",letterSpacing:"0.06em"}}>
                      This assessment is your starting point.
                    </span>
                    <h3 style={{fontSize:"1.15rem",fontWeight:"400",marginBottom:"0.5rem"}}>
                      The AI Equity Intensive turns this into a <strong style={{fontWeight:"700"}}>full implementation roadmap</strong>.
                    </h3>
                    <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.85)",lineHeight:"1.7",marginBottom:"0.5rem",maxWidth:"480px"}}>
                      90 minutes with Dr. DÃ©dÃ©. Model inventory, bias testing protocol, incident response playbook, board-ready reporting â all specific to your organization. Then monitor it daily in the Incluu AI Risk Platform.
                    </p>
                    {email&&<p style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.7)"}}>Your report will be emailed to {email}</p>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",minWidth:"200px"}}>
                    <a href="https://incluu.us/book-intensive" target="_blank" rel="noopener noreferrer" style={{background:"#fff",color:B.purple,borderRadius:"0.5rem",padding:"0.85rem 1.25rem",fontSize:"0.875rem",fontWeight:"700",textDecoration:"none",textAlign:"center",display:"block"}}>
                      Book the Intensive â
                    </a>
                    <a href="https://incluu.us/platform" target="_blank" rel="noopener noreferrer" style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:"0.5rem",padding:"0.75rem 1.25rem",fontSize:"0.82rem",fontWeight:"600",textDecoration:"none",textAlign:"center",display:"block"}}>
                      Join the Risk Platform waitlist
                    </a>
                    <div style={{textAlign:"center",fontSize:"0.72rem",color:"rgba(255,255,255,0.6)"}}>
                      $2,500 individual Â· $5,000 enterprise
                    </div>
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
