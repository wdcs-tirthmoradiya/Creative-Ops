import { useState, useEffect, useCallback } from "react";
import "./App.css";

const STAGES = ["Idea","Brief","Brief Review","Ad Production","Ad Revision","Pending Upload","Testing","Winner","Loser"];
const STAGE_ROLES = { "Idea":"Strategist","Brief":"Strategist","Brief Review":"Founder","Ad Production":"Editor","Ad Revision":"Editor","Pending Upload":"VA","Testing":"Manager","Winner":"Manager","Loser":"Manager" };
const VALID_TRANSITIONS = { "Idea":["Brief"],"Brief":["Brief Review"],"Brief Review":["Ad Production","Brief"],"Ad Production":["Ad Revision","Pending Upload"],"Ad Revision":["Pending Upload","Ad Production"],"Pending Upload":["Testing"],"Testing":["Winner","Loser"],"Winner":[],"Loser":[] };
const TEAM = ["Sara (Strategist)","James (Strategist)","Mia (Editor)","Tom (Editor)","Leo (VA)","Founder"];
const FORMATS = ["Video Ad","Static Ad","Native Ad"];
const PRIORITIES = ["High","Medium","Low"];
const CONTENT_SOURCES = ["Internal Team","UGC Creator","AI Generated"];
const AD_TYPES = ["New Concept","Iteration"];

function generateId() { return Math.random().toString(36).substr(2,9); }
function today() { return new Date().toISOString().split("T")[0]; }
function daysAgo(n) { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; }
function daysBetween(a,b){ const d1=new Date(a),d2=new Date(b||today()); return Math.floor((d2-d1)/(1000*60*60*24)); }
function weekOf(dateStr){ const d=new Date(dateStr); const day=d.getDay(); const diff=d.getDate()-day+(day===0?-6:1); const mon=new Date(d.setDate(diff)); return mon.toISOString().split("T")[0]; }
function thisWeek(){ return weekOf(today()); }

const SEED_ADS = [
  { id:"a1", name:"Summer Hook V1", stage:"Testing", assignedTo:"Mia (Editor)", format:"Video Ad", priority:"High", adType:"New Concept", contentSource:"Internal Team", createdAt:daysAgo(18), stageEnteredAt:daysAgo(11), revisionRound:0, revisionHistory:[], spend:2400, notes:"", timeLog:[{action:"Ad created",by:"Sara (Strategist)",at:daysAgo(18)+"T09:00"},{action:"Brief written",by:"Sara (Strategist)",at:daysAgo(17)+"T10:00"},{action:"Approved by Founder",by:"Founder",at:daysAgo(15)+"T14:00"},{action:"Moved to Testing",by:"Mia (Editor)",at:daysAgo(11)+"T11:00"}] },
  { id:"a2", name:"Pain Point UGC", stage:"Ad Production", assignedTo:"Tom (Editor)", format:"Video Ad", priority:"High", adType:"Iteration", contentSource:"UGC Creator", createdAt:daysAgo(5), stageEnteredAt:daysAgo(2), revisionRound:0, revisionHistory:[], spend:0, notes:"", timeLog:[{action:"Ad created",by:"James (Strategist)",at:daysAgo(5)+"T08:00"},{action:"Moved to Ad Production",by:"Founder",at:daysAgo(2)+"T09:00"}] },
  { id:"a3", name:"Testimonial Static", stage:"Brief Review", assignedTo:"Founder", format:"Static Ad", priority:"Medium", adType:"New Concept", contentSource:"Internal Team", createdAt:daysAgo(3), stageEnteredAt:daysAgo(1), revisionRound:0, revisionHistory:[], spend:0, notes:"", timeLog:[{action:"Ad created",by:"Sara (Strategist)",at:daysAgo(3)+"T10:00"},{action:"Brief submitted for review",by:"Sara (Strategist)",at:daysAgo(1)+"T15:00"}] },
  { id:"a4", name:"Native Story Arc", stage:"Winner", assignedTo:"Mia (Editor)", format:"Native Ad", priority:"Low", adType:"New Concept", contentSource:"AI Generated", createdAt:daysAgo(30), stageEnteredAt:daysAgo(2), revisionRound:0, revisionHistory:[], spend:5800, notes:"", timeLog:[{action:"Ad created",by:"James (Strategist)",at:daysAgo(30)+"T09:00"},{action:"Marked as Winner",by:"Founder",at:daysAgo(2)+"T16:00"}] },
  { id:"a5", name:"Comparison Ad V2", stage:"Pending Upload", assignedTo:"Leo (VA)", format:"Static Ad", priority:"High", adType:"Iteration", contentSource:"Internal Team", createdAt:daysAgo(8), stageEnteredAt:daysAgo(1), revisionRound:1, revisionHistory:["Round 1 revision completed"], spend:0, notes:"", timeLog:[{action:"Ad created",by:"Sara (Strategist)",at:daysAgo(8)+"T09:00"},{action:"Moved to Pending Upload",by:"Tom (Editor)",at:daysAgo(1)+"T13:00"}] },
  { id:"a6", name:"Problem/Solution Reel", stage:"Brief", assignedTo:"Sara (Strategist)", format:"Video Ad", priority:"Medium", adType:"New Concept", contentSource:"Internal Team", createdAt:daysAgo(1), stageEnteredAt:daysAgo(1), revisionRound:0, revisionHistory:[], spend:0, notes:"", timeLog:[{action:"Ad created",by:"Founder",at:daysAgo(1)+"T11:00"}] },
  { id:"a7", name:"Loser Test Ad", stage:"Loser", assignedTo:"Tom (Editor)", format:"Video Ad", priority:"Low", adType:"Iteration", contentSource:"UGC Creator", createdAt:daysAgo(25), stageEnteredAt:daysAgo(3), revisionRound:0, revisionHistory:[], spend:1200, notes:"", timeLog:[{action:"Ad created",by:"James (Strategist)",at:daysAgo(25)+"T09:00"},{action:"Marked as Loser",by:"Founder",at:daysAgo(3)+"T10:00"}] },
  { id:"a8", name:"AI Hook Native", stage:"Testing", assignedTo:"Tom (Editor)", format:"Native Ad", priority:"Medium", adType:"New Concept", contentSource:"AI Generated", createdAt:daysAgo(15), stageEnteredAt:daysAgo(8), revisionRound:0, revisionHistory:[], spend:1800, notes:"", timeLog:[{action:"Ad created",by:"Sara (Strategist)",at:daysAgo(15)+"T09:00"},{action:"Moved to Testing",by:"Tom (Editor)",at:daysAgo(8)+"T10:00"}] },
];

const SEED_IDEAS = [
  { id:"i1", idea:"Try a 'Day in the life' format showcasing the product naturally", submittedBy:"Sara (Strategist)", date:daysAgo(2), type:"New Concept" },
  { id:"i2", idea:"Remix the winning summer hook with winter messaging", submittedBy:"James (Strategist)", date:daysAgo(4), type:"Iteration" },
  { id:"i3", idea:"Competitor comparison angle — we last longer, here's proof", submittedBy:"Founder", date:daysAgo(1), type:"Angle to Test" },
];

const SEED_LEARNINGS = [
  { id:"l1", adId:"a4", adName:"Native Story Arc", result:"Winner", insight:"The 3-act story structure (problem → struggle → resolution) drove 4x longer watch time. Hook in first 2 seconds is critical.", loggedBy:"Sara (Strategist)", date:daysAgo(2) },
  { id:"l2", adId:"a7", adName:"Loser Test Ad", result:"Loser", insight:"UGC without a clear CTA confused viewers. Need explicit 'swipe up' or spoken CTA at end of every UGC clip.", loggedBy:"James (Strategist)", date:daysAgo(3) },
];

const priorityColor = { High:"#ef4444", Medium:"#f59e0b", Low:"#9ca3af" };
const priorityBg = { High:"#fee2e2", Medium:"#fef3c7", Low:"#f3f4f6" };
const stageColor = { "Idea":"#8b5cf6","Brief":"#3b82f6","Brief Review":"#f59e0b","Ad Production":"#ec4899","Ad Revision":"#f97316","Pending Upload":"#06b6d4","Testing":"#10b981","Winner":"#22c55e","Loser":"#ef4444" };

export default function App() {
  const [ads, setAds] = useState(SEED_ADS);
  const [ideas, setIdeas] = useState(SEED_IDEAS);
  const [learnings, setLearnings] = useState(SEED_LEARNINGS);
  const [view, setView] = useState("pipeline");
  const [selectedMember, setSelectedMember] = useState("All");
  const [selectedAd, setSelectedAd] = useState(null);
  const [showNewAd, setShowNewAd] = useState(false);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showNewLearning, setShowNewLearning] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(null);
  const [manualNote, setManualNote] = useState("");
  const [newAdForm, setNewAdForm] = useState({ name:"", assignedTo:TEAM[0], format:FORMATS[0], priority:"Medium", adType:AD_TYPES[0], contentSource:CONTENT_SOURCES[0] });
  const [newIdeaForm, setNewIdeaForm] = useState({ idea:"", submittedBy:TEAM[0], type:"New Concept" });
  const [newLearningForm, setNewLearningForm] = useState({ adId:"", result:"Winner", insight:"", loggedBy:TEAM[0] });

  function addAd() {
    if (!newAdForm.name.trim()) return;
    const ad = { id:generateId(), ...newAdForm, stage:"Idea", createdAt:today(), stageEnteredAt:today(), revisionRound:0, revisionHistory:[], spend:0, notes:"", timeLog:[{action:"Ad created",by:newAdForm.assignedTo,at:new Date().toISOString()}] };
    setAds(prev=>[...prev,ad]);
    setShowNewAd(false);
    setNewAdForm({ name:"", assignedTo:TEAM[0], format:FORMATS[0], priority:"Medium", adType:AD_TYPES[0], contentSource:CONTENT_SOURCES[0] });
  }

  function moveAd(adId, toStage, mover) {
    setAds(prev=>prev.map(a=>{
      if (a.id!==adId) return a;
      const newRound = toStage==="Ad Revision" ? a.revisionRound+1 : a.revisionRound;
      const logEntry = { action:`Moved to ${toStage}`, by:mover||"System", at:new Date().toISOString() };
      return { ...a, stage:toStage, stageEnteredAt:today(), revisionRound:newRound, revisionHistory:toStage==="Ad Revision"?[...a.revisionHistory,`Round ${newRound} started`]:a.revisionHistory, timeLog:[...a.timeLog,logEntry] };
    }));
    setShowMoveModal(null);
    if (selectedAd?.id===adId) setSelectedAd(prev=>({ ...prev, stage:toStage }));
  }

  function addNote(adId) {
    if (!manualNote.trim()) return;
    setAds(prev=>prev.map(a=>{
      if (a.id!==adId) return a;
      return { ...a, timeLog:[...a.timeLog,{ action:`Note: ${manualNote}`, by:"Team", at:new Date().toISOString() }] };
    }));
    setManualNote("");
  }

  function addIdea() {
    if (!newIdeaForm.idea.trim()) return;
    setIdeas(prev=>[...prev,{ id:generateId(), ...newIdeaForm, date:today() }]);
    setShowNewIdea(false);
    setNewIdeaForm({ idea:"", submittedBy:TEAM[0], type:"New Concept" });
  }

  function promoteIdeaToAd(idea) {
    const ad = { id:generateId(), name:idea.idea.substring(0,40), assignedTo:idea.submittedBy, format:FORMATS[0], priority:"Medium", adType:idea.type==="Iteration"?"Iteration":"New Concept", contentSource:"Internal Team", stage:"Idea", createdAt:today(), stageEnteredAt:today(), revisionRound:0, revisionHistory:[], spend:0, notes:"", timeLog:[{action:"Created from Ideas Library",by:idea.submittedBy,at:new Date().toISOString()}] };
    setAds(prev=>[...prev,ad]);
    setIdeas(prev=>prev.filter(i=>i.id!==idea.id));
  }

  function addLearning() {
    if (!newLearningForm.insight.trim()) return;
    const ad = ads.find(a=>a.id===newLearningForm.adId);
    setLearnings(prev=>[...prev,{ id:generateId(), ...newLearningForm, adName:ad?.name||"Unknown Ad", date:today() }]);
    setShowNewLearning(false);
    setNewLearningForm({ adId:"", result:"Winner", insight:"", loggedBy:TEAM[0] });
  }

  // Metrics
  const thisWeekAds = ads.filter(a=>weekOf(a.createdAt)===thisWeek());
  const completed = ads.filter(a=>a.stage==="Winner"||a.stage==="Loser");
  const winners = ads.filter(a=>a.stage==="Winner");
  const inTesting = ads.filter(a=>a.stage==="Testing");
  const hitRate = completed.length ? Math.round(winners.length/completed.length*100) : 0;
  const avgRevisions = ads.length ? (ads.reduce((s,a)=>s+a.revisionRound,0)/ads.length).toFixed(1) : 0;
  const thisWeekNewConcepts = thisWeekAds.filter(a=>a.adType==="New Concept").length;
  const thisWeekIterations = thisWeekAds.filter(a=>a.adType==="Iteration").length;
  const uploadedAds = ads.filter(a=>["Pending Upload","Testing","Winner","Loser"].includes(a.stage)&&a.stageEnteredAt);
  const avgDaysToUpload = uploadedAds.length ? Math.round(uploadedAds.reduce((s,a)=>s+daysBetween(a.createdAt,a.stageEnteredAt),0)/uploadedAds.length) : 0;
  const formatBreakdown = FORMATS.map(f=>({ format:f, count:thisWeekAds.filter(a=>a.format===f).length }));

  const navItems = [
    { id:"pipeline", label:"Pipeline" },
    { id:"team", label:"Team View" },
    { id:"reports", label:"Reports" },
    { id:"ideas", label:"Ideas" },
    { id:"learnings", label:"Learnings" },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:"#0a0a0f", minHeight:"100vh", color:"#e2e8f0" }}>

      {/* Header */}
      <div style={{ borderBottom:"1px solid #1e1e2e", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#7c3aed,#ec4899)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>CO</div>
          <span style={{ fontWeight:600, fontSize:16, color:"#e2e8f0" }}>Creative Ops</span>
        </div>
        <nav style={{ display:"flex", gap:4 }}>
          {navItems.map(n=>(
            <button key={n.id} className={`nav-btn${view===n.id?" active":""}`} onClick={()=>setView(n.id)}>{n.label}</button>
          ))}
        </nav>
        <button className="btn-primary" onClick={()=>setShowNewAd(true)}>+ New Ad</button>
      </div>

      {/* Metrics Bar */}
      <div style={{ padding:"16px 24px", borderBottom:"1px solid #1e1e2e", display:"flex", gap:12, overflowX:"auto" }}>
        {[
          { label:"Volume This Week", value:thisWeekAds.length },
          { label:"Hit Rate", value:`${hitRate}%` },
          { label:"Avg Revisions", value:avgRevisions },
          { label:"In Testing", value:inTesting.length },
          { label:"New vs Iteration", value:`${thisWeekNewConcepts}/${thisWeekIterations}` },
          { label:"Avg Days to Upload", value:`${avgDaysToUpload}d` },
          { label:"Total Spend", value:`$${ads.reduce((s,a)=>s+a.spend,0).toLocaleString()}` },
          { label:"Creative Diversity", value:formatBreakdown.map(f=>`${f.format.split(" ")[0]}:${f.count}`).join(" · ") },
        ].map((m,i)=>(
          <div key={i} className="metric-card" style={{ minWidth:140, flex:1 }}>
            <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:18, fontWeight:600, color:"#e2e8f0", fontFamily:"'DM Mono',monospace" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Views */}
      <div style={{ padding:24 }}>
        {view==="pipeline" && <PipelineView ads={ads} onSelectAd={setSelectedAd} onMove={setShowMoveModal} />}
        {view==="team" && <TeamView ads={ads} selectedMember={selectedMember} setSelectedMember={setSelectedMember} onSelectAd={setSelectedAd} />}
        {view==="reports" && <ReportsView ads={ads} />}
        {view==="ideas" && <IdeasView ideas={ideas} onAdd={()=>setShowNewIdea(true)} onPromote={promoteIdeaToAd} onDelete={id=>setIdeas(prev=>prev.filter(i=>i.id!==id))} />}
        {view==="learnings" && <LearningsView learnings={learnings} onAdd={()=>setShowNewLearning(true)} />}
      </div>

      {/* Ad Detail Modal */}
      {selectedAd && (() => {
        const ad = ads.find(a=>a.id===selectedAd.id)||selectedAd;
        const daysInStage = daysBetween(ad.stageEnteredAt);
        const isTestingLocked = ad.stage==="Testing" && daysInStage < 10;
        const testingDaysLeft = 10 - daysInStage;
        const available = VALID_TRANSITIONS[ad.stage]||[];
        return (
          <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelectedAd(null)}>
            <div className="modal" style={{ maxWidth:560 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:600, color:"#e2e8f0", marginBottom:6 }}>{ad.name}</h2>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span className="pill" style={{ background:stageColor[ad.stage]+"22", color:stageColor[ad.stage] }}>{ad.stage}</span>
                    <span className="pill" style={{ background:priorityBg[ad.priority], color:priorityColor[ad.priority] }}>{ad.priority}</span>
                    <span className="pill" style={{ background:"#1e1e2e", color:"#94a3b8" }}>{ad.format}</span>
                    <span className="pill" style={{ background:"#1e1e2e", color:"#94a3b8" }}>{ad.adType}</span>
                  </div>
                </div>
                <button className="btn-sm" onClick={()=>setSelectedAd(null)}>✕</button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                {[["Assigned To",ad.assignedTo],["Content Source",ad.contentSource],["Created",ad.createdAt],["Days in Stage",`${daysInStage}d${daysInStage>=5?" ⚠️":""}`]].map(([k,v])=>(
                  <div key={k}><span className="tag-label">{k}</span><div style={{ color:"#e2e8f0", fontSize:14 }}>{v}</div></div>
                ))}
              </div>

              {ad.stage==="Ad Revision" && (
                <div style={{ background:"#f59e0b11", border:"1px solid #f59e0b33", borderRadius:8, padding:12, marginBottom:16, fontSize:13, color:"#fbbf24" }}>
                  Revision Round {ad.revisionRound} of 2{ad.revisionRound>=2&&" — No further send-back available"}
                </div>
              )}

              {isTestingLocked && (
                <div style={{ background:"#10b98111", border:"1px solid #10b98133", borderRadius:8, padding:12, marginBottom:16, fontSize:13, color:"#34d399" }}>
                  🔒 Testing lock: {testingDaysLeft} day{testingDaysLeft!==1?"s":""} remaining
                </div>
              )}

              {available.length > 0 && !isTestingLocked && (
                <div style={{ marginBottom:20 }}>
                  <span className="tag-label">Move To Stage</span>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:4 }}>
                    {available.filter(s=>!(ad.stage==="Ad Revision"&&s==="Ad Production"&&ad.revisionRound>=2)).map(s=>(
                      <button key={s} className="btn-sm" style={{ borderColor:stageColor[s]+"44", color:stageColor[s] }} onClick={()=>moveAd(ad.id,s,"Founder")}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom:20 }}>
                <span className="tag-label">Activity Log</span>
                <div style={{ background:"#0a0a0f", border:"1px solid #1e1e2e", borderRadius:8, padding:12, maxHeight:180, overflowY:"auto", marginTop:4 }}>
                  {ad.timeLog.map((l,i)=>(
                    <div key={i} style={{ display:"flex", gap:8, fontSize:12, padding:"4px 0", borderBottom:i<ad.timeLog.length-1?"1px solid #1e1e2e22":"none" }}>
                      <span style={{ color:"#64748b", minWidth:80 }}>{l.at.substring(0,10)}</span>
                      <span style={{ color:"#94a3b8" }}>{l.action}</span>
                      <span style={{ color:"#64748b", marginLeft:"auto" }}>{l.by}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <input placeholder="Add a note..." value={manualNote} onChange={e=>setManualNote(e.target.value)} style={{ flex:1 }} />
                  <button className="btn-sm" onClick={()=>addNote(ad.id)}>Add</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Ad Modal */}
      {showNewAd && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowNewAd(false)}>
          <div className="modal">
            <h2 style={{ fontSize:18, fontWeight:600, color:"#e2e8f0", marginBottom:20 }}>New Ad</h2>
            {[["Ad Name","name","text"],["Assigned To","assignedTo","select",TEAM],["Format","format","select",FORMATS],["Priority","priority","select",PRIORITIES],["Ad Type","adType","select",AD_TYPES],["Content Source","contentSource","select",CONTENT_SOURCES]].map(([label,key,type,opts])=>(
              <div key={key} style={{ marginBottom:14 }}>
                <span className="tag-label">{label}</span>
                {type==="select"?(
                  <select value={newAdForm[key]} onChange={e=>setNewAdForm(p=>({...p,[key]:e.target.value}))}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                ):(
                  <input value={newAdForm[key]} onChange={e=>setNewAdForm(p=>({...p,[key]:e.target.value}))} placeholder={label} />
                )}
              </div>
            ))}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
              <button className="btn-sm" onClick={()=>setShowNewAd(false)}>Cancel</button>
              <button className="btn-primary" onClick={addAd}>Create Ad</button>
            </div>
          </div>
        </div>
      )}

      {/* New Idea Modal */}
      {showNewIdea && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowNewIdea(false)}>
          <div className="modal">
            <h2 style={{ fontSize:18, fontWeight:600, color:"#e2e8f0", marginBottom:20 }}>Log Idea</h2>
            {[["Idea","idea","textarea"],["Submitted By","submittedBy","select",TEAM],["Type","type","select",["New Concept","Iteration","Angle to Test"]]].map(([label,key,type,opts])=>(
              <div key={key} style={{ marginBottom:14 }}>
                <span className="tag-label">{label}</span>
                {type==="textarea"?<textarea rows={3} value={newIdeaForm[key]} onChange={e=>setNewIdeaForm(p=>({...p,[key]:e.target.value}))} placeholder="Describe the idea..." />:type==="select"?<select value={newIdeaForm[key]} onChange={e=>setNewIdeaForm(p=>({...p,[key]:e.target.value}))}>{opts.map(o=><option key={o}>{o}</option>)}</select>:<input value={newIdeaForm[key]} onChange={e=>setNewIdeaForm(p=>({...p,[key]:e.target.value}))} />}
              </div>
            ))}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
              <button className="btn-sm" onClick={()=>setShowNewIdea(false)}>Cancel</button>
              <button className="btn-primary" onClick={addIdea}>Log Idea</button>
            </div>
          </div>
        </div>
      )}

      {/* New Learning Modal */}
      {showNewLearning && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowNewLearning(false)}>
          <div className="modal">
            <h2 style={{ fontSize:18, fontWeight:600, color:"#e2e8f0", marginBottom:20 }}>Log Learning</h2>
            <div style={{ marginBottom:14 }}>
              <span className="tag-label">Related Ad</span>
              <select value={newLearningForm.adId} onChange={e=>setNewLearningForm(p=>({...p,adId:e.target.value}))}>
                <option value="">Select an ad...</option>
                {ads.filter(a=>["Winner","Loser"].includes(a.stage)).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <span className="tag-label">Result</span>
              <select value={newLearningForm.result} onChange={e=>setNewLearningForm(p=>({...p,result:e.target.value}))}>
                {["Winner","Loser","Inconclusive"].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <span className="tag-label">Key Insight</span>
              <textarea rows={4} value={newLearningForm.insight} onChange={e=>setNewLearningForm(p=>({...p,insight:e.target.value}))} placeholder="What worked or didn't work, and why?" />
            </div>
            <div style={{ marginBottom:14 }}>
              <span className="tag-label">Logged By</span>
              <select value={newLearningForm.loggedBy} onChange={e=>setNewLearningForm(p=>({...p,loggedBy:e.target.value}))}>
                {TEAM.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
              <button className="btn-sm" onClick={()=>setShowNewLearning(false)}>Cancel</button>
              <button className="btn-primary" onClick={addLearning}>Save Learning</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdCard({ ad, onClick }) {
  const daysInStage = daysBetween(ad.stageEnteredAt);
  const isStale = daysInStage >= 5;
  const testingDaysLeft = ad.stage==="Testing" ? Math.max(0, 10 - daysInStage) : null;

  return (
    <div className="ad-card" onClick={onClick} style={{ borderLeft:`3px solid ${priorityColor[ad.priority]}` }}>
      <div style={{ fontSize:13, fontWeight:500, color:"#e2e8f0", marginBottom:8, lineHeight:1.3 }}>{ad.name}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
        <span className="pill" style={{ background:"#1e1e2e", color:"#94a3b8" }}>{ad.format}</span>
        <span className="pill" style={{ background:"#1e1e2e", color:"#7c3aed" }}>{ad.adType}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#64748b" }}>{ad.assignedTo.split(" ")[0]}</span>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {testingDaysLeft!==null && <span style={{ fontSize:11, color:"#10b981" }}>🔒{testingDaysLeft}d</span>}
          <span style={{ fontSize:11, color:isStale?"#ef4444":"#64748b" }} className={isStale?"stale":""}>{daysInStage}d</span>
        </div>
      </div>
      {ad.stage==="Ad Revision" && <div style={{ fontSize:11, color:"#f59e0b", marginTop:4 }}>Round {ad.revisionRound}/2</div>}
    </div>
  );
}

function PipelineView({ ads, onSelectAd, onMove }) {
  return (
    <div>
      <div className="pipeline-container">
        {STAGES.map(stage=>{
          const stageAds = ads.filter(a=>a.stage===stage).sort((a,b)=>PRIORITIES.indexOf(a.priority)-PRIORITIES.indexOf(b.priority));
          return (
            <div key={stage} className="pipeline-stage">
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:stageColor[stage] }} />
                <span style={{ fontSize:13, fontWeight:500, color:"#94a3b8" }}>{stage}</span>
                <span style={{ marginLeft:"auto", fontSize:12, color:"#64748b", background:"#1e1e2e", padding:"2px 8px", borderRadius:999 }}>{stageAds.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {stageAds.map(ad=><AdCard key={ad.id} ad={ad} onClick={()=>onSelectAd(ad)} />)}
                {stageAds.length===0 && <div className="empty-stage-placeholder">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamView({ ads, selectedMember, setSelectedMember, onSelectAd }) {
  const members = ["All", ...TEAM];

  function getMemberAds(member) {
    if (member==="All") return ads;
    return ads.filter(a=>a.assignedTo===member && !["Winner","Loser"].includes(a.stage));
  }

  const filteredAds = getMemberAds(selectedMember).sort((a,b)=>PRIORITIES.indexOf(a.priority)-PRIORITIES.indexOf(b.priority));

  if (selectedMember==="All") {
    return (
      <div>
        <h2 style={{ fontSize:16, fontWeight:600, color:"#e2e8f0", marginBottom:20 }}>Manager View — Full Team Workload</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
          {TEAM.map(member=>{
            const memberAds = ads.filter(a=>a.assignedTo===member&&!["Winner","Loser"].includes(a.stage));
            const initials = member.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
            return (
              <div key={member} className="card" style={{ padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#7c3aed22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, color:"#a78bfa" }}>{initials}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:"#e2e8f0" }}>{member}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{memberAds.length} active ad{memberAds.length!==1?"s":""}</div>
                  </div>
                  <button style={{ marginLeft:"auto", background:"none", border:"1px solid #2d2d3d", color:"#94a3b8", padding:"4px 10px", borderRadius:6, fontSize:12, cursor:"pointer" }} onClick={()=>setSelectedMember(member)}>View Queue</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {memberAds.slice(0,4).map(a=>(
                    <span key={a.id} className="pill" style={{ background:stageColor[a.stage]+"22", color:stageColor[a.stage], cursor:"pointer" }} onClick={()=>onSelectAd(a)}>{a.name.substring(0,20)}</span>
                  ))}
                  {memberAds.length>4&&<span className="pill" style={{ background:"#1e1e2e", color:"#64748b" }}>+{memberAds.length-4} more</span>}
                  {memberAds.length===0&&<span style={{ fontSize:12, color:"#64748b" }}>No active ads — available for new work</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button className="btn-sm" onClick={()=>setSelectedMember("All")}>← Back</button>
        <h2 style={{ fontSize:16, fontWeight:600, color:"#e2e8f0" }}>Queue: {selectedMember}</h2>
        <span style={{ fontSize:13, color:"#64748b" }}>{filteredAds.length} ads</span>
      </div>
      <div style={{ display:"flex", flexWrap:"nowrap", gap:12, overflowX:"auto", marginBottom:24 }}>
        {["All",...TEAM].map(m=>(
          <button key={m} onClick={()=>setSelectedMember(m)} style={{ whiteSpace:"nowrap", background:selectedMember===m?"#7c3aed":"#1e1e2e", color:selectedMember===m?"#fff":"#94a3b8", border:"none", padding:"6px 14px", borderRadius:8, fontSize:13, cursor:"pointer" }}>{m==="All"?"Manager View":m.split(" ")[0]}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
        {filteredAds.map(ad=>(
          <div key={ad.id}>
            <div style={{ fontSize:11, color:stageColor[ad.stage], marginBottom:4 }}>{ad.stage}</div>
            <AdCard ad={ad} onClick={()=>onSelectAd(ad)} />
          </div>
        ))}
        {filteredAds.length===0&&<div style={{ color:"#64748b", fontSize:14 }}>No active ads in queue.</div>}
      </div>
    </div>
  );
}

function ReportsView({ ads }) {
  const completed = ads.filter(a=>["Winner","Loser"].includes(a.stage));

  // Weekly output — last 8 weeks
  const weeks = [];
  for (let i=7;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i*7);
    weeks.push(weekOf(d.toISOString().split("T")[0]));
  }
  const weeklyOutput = weeks.map(w=>({ week:w.substring(5), count:ads.filter(a=>weekOf(a.createdAt)===w).length }));
  const maxWeekly = Math.max(...weeklyOutput.map(w=>w.count),1);

  // By member
  const memberOutput = TEAM.slice(0,5).map(m=>({ name:m.split(" ")[0], count:ads.filter(a=>a.assignedTo===m).length }));

  // Format breakdown
  const formatData = FORMATS.map(f=>({ format:f.split(" ")[0], count:ads.filter(a=>a.format===f).length }));
  const totalAds = ads.length || 1;

  // Days in pipeline — avg by stage
  const stageAvg = ["Brief","Ad Production","Pending Upload","Testing"].map(s=>{
    const stageAds = ads.filter(a=>a.stage===s);
    const avg = stageAds.length ? Math.round(stageAds.reduce((sum,a)=>sum+daysBetween(a.stageEnteredAt),0)/stageAds.length) : 0;
    return { stage:s.replace("Ad ",""), avg };
  });

  return (
    <div>
      <h2 style={{ fontSize:16, fontWeight:600, color:"#e2e8f0", marginBottom:24 }}>Creative Output Reports</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:20 }}>

        {/* Weekly Output */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginBottom:16 }}>Weekly Output</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:100 }}>
            {weeklyOutput.map((w,i)=>(
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:10, color:"#64748b" }}>{w.count||""}</div>
                <div style={{ width:"100%", background:w.count?"#7c3aed":"#1e1e2e", borderRadius:"4px 4px 0 0", height:`${(w.count/maxWeekly)*80+4}px`, transition:"height 0.3s" }} />
                <div style={{ fontSize:9, color:"#64748b", whiteSpace:"nowrap" }}>{w.week}</div>
              </div>
            ))}
          </div>
        </div>

        {/* By Team Member */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginBottom:16 }}>Output by Member</div>
          {memberOutput.sort((a,b)=>b.count-a.count).map((m,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:72, fontSize:12, color:"#94a3b8" }}>{m.name}</div>
              <div style={{ flex:1, background:"#1e1e2e", borderRadius:4, height:12, overflow:"hidden" }}>
                <div style={{ width:`${(m.count/Math.max(...memberOutput.map(x=>x.count),1))*100}%`, background:"#7c3aed", height:"100%", borderRadius:4 }} />
              </div>
              <div style={{ fontSize:12, color:"#e2e8f0", fontFamily:"monospace", minWidth:20 }}>{m.count}</div>
            </div>
          ))}
        </div>

        {/* Format Diversity */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginBottom:16 }}>Creative Diversity</div>
          {formatData.map((f,i)=>{
            const colors=["#7c3aed","#ec4899","#10b981"];
            return (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                  <span>{f.format}</span><span>{Math.round(f.count/totalAds*100)}%</span>
                </div>
                <div style={{ background:"#1e1e2e", borderRadius:4, height:10, overflow:"hidden" }}>
                  <div style={{ width:`${f.count/totalAds*100}%`, background:colors[i], height:"100%", borderRadius:4 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Days in Pipeline */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginBottom:16 }}>Avg Days in Stage</div>
          {stageAvg.map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:90, fontSize:12, color:"#94a3b8" }}>{s.stage}</div>
              <div style={{ flex:1, background:"#1e1e2e", borderRadius:4, height:12, overflow:"hidden" }}>
                <div style={{ width:`${Math.min((s.avg/14)*100,100)}%`, background:s.avg>=5?"#ef4444":"#10b981", height:"100%", borderRadius:4 }} />
              </div>
              <div style={{ fontSize:12, color:s.avg>=5?"#ef4444":"#e2e8f0", fontFamily:"monospace", minWidth:28 }}>{s.avg}d</div>
            </div>
          ))}
        </div>

        {/* New Concept vs Iteration */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginBottom:16 }}>Concept vs Iteration Split</div>
          {[["New Concept","#7c3aed"],["Iteration","#ec4899"]].map(([type,color])=>{
            const count = ads.filter(a=>a.adType===type).length;
            return (
              <div key={type} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                  <span>{type}</span><span>{count} ({Math.round(count/totalAds*100)}%)</span>
                </div>
                <div style={{ background:"#1e1e2e", borderRadius:4, height:14, overflow:"hidden" }}>
                  <div style={{ width:`${count/totalAds*100}%`, background:color, height:"100%", borderRadius:4 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Health */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginBottom:16 }}>Pipeline Health</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Total Ads",ads.length],["In Testing",ads.filter(a=>a.stage==="Testing").length],["Winners",ads.filter(a=>a.stage==="Winner").length],["Stale (5d+)",ads.filter(a=>daysBetween(a.stageEnteredAt)>=5&&!["Winner","Loser"].includes(a.stage)).length]].map(([label,val])=>(
              <div key={label} style={{ background:"#0a0a0f", borderRadius:8, padding:12, border:"1px solid #1e1e2e" }}>
                <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:22, fontWeight:600, color:"#e2e8f0", fontFamily:"monospace" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function IdeasView({ ideas, onAdd, onPromote, onDelete }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>Ideas Library</h2>
          <p style={{ fontSize:13, color:"#64748b" }}>Capture ideas here before they enter the pipeline.</p>
        </div>
        <button className="btn-primary" onClick={onAdd}>+ Log Idea</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
        {ideas.map(idea=>(
          <div key={idea.id} className="card" style={{ padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <span className="pill" style={{ background:idea.type==="New Concept"?"#7c3aed22":idea.type==="Iteration"?"#ec489922":"#10b98122", color:idea.type==="New Concept"?"#a78bfa":idea.type==="Iteration"?"#f472b6":"#34d399" }}>{idea.type}</span>
              <span style={{ fontSize:11, color:"#64748b" }}>{idea.date}</span>
            </div>
            <p style={{ fontSize:14, color:"#e2e8f0", lineHeight:1.5, marginBottom:12 }}>{idea.idea}</p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"#64748b" }}>{idea.submittedBy.split(" ")[0]}</span>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn-sm" style={{ color:"#ef4444", borderColor:"#ef444422" }} onClick={()=>onDelete(idea.id)}>Remove</button>
                <button className="btn-sm" style={{ color:"#a78bfa", borderColor:"#7c3aed44" }} onClick={()=>onPromote(idea)}>→ Pipeline</button>
              </div>
            </div>
          </div>
        ))}
        {ideas.length===0&&<div style={{ color:"#64748b", fontSize:14 }}>No ideas yet. Log the first one!</div>}
      </div>
    </div>
  );
}

function LearningsView({ learnings, onAdd }) {
  const resultColor = { Winner:"#22c55e", Loser:"#ef4444", Inconclusive:"#f59e0b" };
  const resultBg = { Winner:"#22c55e11", Loser:"#ef444411", Inconclusive:"#f59e0b11" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>Creative Learnings</h2>
          <p style={{ fontSize:13, color:"#64748b" }}>What we've learned from tested ads — our growing knowledge base.</p>
        </div>
        <button className="btn-primary" onClick={onAdd}>+ Log Learning</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {learnings.map(l=>(
          <div key={l.id} className="card" style={{ padding:20, borderLeft:`3px solid ${resultColor[l.result]}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span className="pill" style={{ background:resultBg[l.result], color:resultColor[l.result] }}>{l.result}</span>
                <span style={{ fontSize:14, fontWeight:500, color:"#e2e8f0" }}>{l.adName}</span>
              </div>
              <span style={{ fontSize:12, color:"#64748b" }}>{l.date}</span>
            </div>
            <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.6, marginBottom:10 }}>{l.insight}</p>
            <span style={{ fontSize:12, color:"#64748b" }}>Logged by {l.loggedBy}</span>
          </div>
        ))}
        {learnings.length===0&&<div style={{ color:"#64748b", fontSize:14 }}>No learnings yet.</div>}
      </div>
    </div>
  );
}