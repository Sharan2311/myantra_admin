import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── ADMIN SUPABASE (service role key — full access) ────────────────────────
// Set these in Netlify env vars for the admin site, NOT in code
const adminSupabase = createClient(
  import.meta.env.VITE_ADMIN_SUPABASE_URL,
  import.meta.env.VITE_ADMIN_SUPABASE_SERVICE_KEY
);

// ─── THEME ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0f172a", card:"#1e293b", card2:"#334155", border:"#475569",
  text:"#f1f5f9", muted:"#94a3b8", accent:"#38bdf8",
  green:"#22c55e", red:"#ef4444", orange:"#f97316", purple:"#a78bfa",
  blue:"#3b82f6", teal:"#14b8a6",
};

const fmt = n => "₹"+Number(n||0).toLocaleString("en-IN");

// ─── PLAN PRESETS ───────────────────────────────────────────────────────────
const ALL_FEATURES = [
  "trips","vehicles","employees","driver_pay","di_scan",
  "payment_scan","diesel_tab","tafal","pdf_reports",
  "shortage_recovery","loan_ledger","party_billing",
  "pump_portal","batch_di_scanner","gst_reconciliation",
  "owner_reports","inbound_trips","expense_tracking",
  "custom_branding","husk_manager"
];

const PLAN_PRESETS = {
  basic: ["trips","vehicles","employees","driver_pay","di_scan"],
  professional: ["trips","vehicles","employees","driver_pay","di_scan",
    "payment_scan","diesel_tab","tafal","pdf_reports",
    "shortage_recovery","loan_ledger","expense_tracking"],
  enterprise: ALL_FEATURES,
};

const PLAN_SCANS = { basic: 50, professional: 200, enterprise: 9999 };
const PLAN_FEES = { basic: 3000, professional: 7000, enterprise: 12000 };

const FEATURE_LABELS = {
  trips:"Trips", vehicles:"Vehicles", employees:"Employees", driver_pay:"Driver Pay",
  di_scan:"DI Scan", payment_scan:"Payment Scan", diesel_tab:"Diesel",
  tafal:"TAFAL", pdf_reports:"PDF Reports", shortage_recovery:"Shortage Recovery",
  loan_ledger:"Loan Ledger", party_billing:"Party Billing", pump_portal:"Pump Portal",
  batch_di_scanner:"Batch DI Scanner", gst_reconciliation:"GST Reconciliation",
  owner_reports:"Owner Reports", inbound_trips:"Inbound Trips",
  expense_tracking:"Expense Tracking", custom_branding:"Custom Branding",
  husk_manager:"Husk Manager",
};

const FEATURE_TIERS = {
  trips:"basic",vehicles:"basic",employees:"basic",driver_pay:"basic",di_scan:"basic",
  payment_scan:"pro",diesel_tab:"pro",tafal:"pro",pdf_reports:"pro",
  shortage_recovery:"pro",loan_ledger:"pro",expense_tracking:"pro",
  party_billing:"ent",pump_portal:"ent",batch_di_scanner:"ent",gst_reconciliation:"ent",
  owner_reports:"ent",inbound_trips:"ent",custom_branding:"ent",husk_manager:"ent",
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
const Btn = ({children, onClick, color=C.accent, outline, small, full, disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: outline?"transparent":color, color: outline?color:"#fff",
    border: outline?`1.5px solid ${color}`:"none", borderRadius:8,
    padding: small?"6px 12px":"10px 18px", fontSize: small?12:14, fontWeight:700,
    cursor: disabled?"not-allowed":"pointer", opacity:disabled?0.5:1,
    width:full?"100%":"auto", transition:"all .15s",
  }}>{children}</button>
);

const Badge = ({label, color=C.muted}) => (
  <span style={{background:color+"22",color,fontSize:10,fontWeight:700,
    padding:"3px 8px",borderRadius:6,letterSpacing:0.5}}>{label}</span>
);

const KPI = ({label, value, color=C.accent}) => (
  <div style={{background:C.card,borderRadius:12,padding:"14px 16px",flex:1,minWidth:120}}>
    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{fontSize:22,fontWeight:800,color,marginTop:4}}>{value}</div>
  </div>
);

// ─── LOGIN ──────────────────────────────────────────────────────────────────
function AdminLogin({onLogin}) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setErr("");
    const {data, error} = await adminSupabase
      .from("admin_users").select("*").eq("pin",pin).eq("role","superadmin").single();
    setLoading(false);
    if(error || !data) { setErr("Invalid PIN"); return; }
    onLogin(data);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.card,borderRadius:16,padding:"40px 32px",width:340,textAlign:"center"}}>
        <div style={{fontSize:28,fontWeight:900,color:C.accent,marginBottom:4}}>M YANTRA</div>
        <div style={{fontSize:11,color:C.muted,letterSpacing:3,marginBottom:30}}>ADMIN CONTROL</div>
        <input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="Enter Admin PIN"
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"12px 14px",color:C.text,fontSize:16,textAlign:"center",marginBottom:16,
            outline:"none",boxSizing:"border-box"}} />
        {err && <div style={{color:C.red,fontSize:12,marginBottom:12}}>{err}</div>}
        <Btn onClick={handleLogin} full disabled={loading}>{loading?"Checking...":"Login →"}</Btn>
      </div>
    </div>
  );
}

// ─── CLIENT EDITOR ──────────────────────────────────────────────────────────
function ClientEditor({client, features, onSave, onClose, onSeedFeatures}) {
  const [form, setForm] = useState({...client});
  const [feats, setFeats] = useState({...features});
  const [saving, setSaving] = useState(false);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    setSaving(true);
    // Save client details
    const {error:e1} = await adminSupabase.from("clients").update({
      name: form.name, owner_name: form.owner_name, phone: form.phone,
      email: form.email, plan: form.plan, status: form.status,
      scans_included: form.scans_included, supabase_url: form.supabase_url,
      supabase_key: form.supabase_key, netlify_site: form.netlify_site,
      subdomain: form.subdomain, git_branch: form.git_branch,
      monthly_fee: form.monthly_fee, onboarding_fee: form.onboarding_fee,
      notes: form.notes,
    }).eq("id", client.id);

    // Save features
    for(const feat of ALL_FEATURES) {
      await adminSupabase.from("client_features").upsert({
        client_id: client.id, feature: feat, enabled: feats[feat]===true,
        updated_at: new Date().toISOString(),
      }, {onConflict: "client_id,feature"});
    }

    setSaving(false);
    if(!e1) onSave();
  };

  const applyPreset = (plan) => {
    const preset = PLAN_PRESETS[plan] || [];
    const newFeats = {};
    ALL_FEATURES.forEach(f => { newFeats[f] = preset.includes(f); });
    setFeats(newFeats);
    set("plan", plan);
    set("scans_included", PLAN_SCANS[plan]||50);
    set("monthly_fee", PLAN_FEES[plan]||3000);
  };

  const Field = ({label, field, type="text", placeholder=""}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{label}</div>
      <input value={form[field]||""} onChange={e=>set(field,type==="number"?+e.target.value:e.target.value)}
        type={type} placeholder={placeholder}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
          padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}} />
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:999,
      display:"flex",justifyContent:"center",overflowY:"auto",padding:"40px 16px"}}>
      <div style={{background:C.card,borderRadius:16,padding:"24px 20px",width:"100%",maxWidth:560,
        maxHeight:"fit-content",alignSelf:"flex-start"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:800,color:C.text}}>{form.name||"New Client"}</div>
          <span onClick={onClose} style={{cursor:"pointer",fontSize:20,color:C.muted}}>✕</span>
        </div>

        {/* Status + Plan */}
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>STATUS</div>
            <select value={form.status||"active"} onChange={e=>set("status",e.target.value)}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
                padding:"9px 12px",color:C.text,fontSize:13}}>
              <option value="active">✅ Active</option>
              <option value="suspended">⏸ Suspended</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>PLAN</div>
            <select value={form.plan||"basic"} onChange={e=>applyPreset(e.target.value)}
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
                padding:"9px 12px",color:C.text,fontSize:13}}>
              <option value="basic">Basic (₹3K)</option>
              <option value="professional">Professional (₹7K)</option>
              <option value="enterprise">Enterprise (₹12K)</option>
            </select>
          </div>
        </div>

        {/* Details */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
          <Field label="Company Name" field="name" />
          <Field label="Owner Name" field="owner_name" />
          <Field label="Phone" field="phone" />
          <Field label="Email" field="email" />
          <Field label="Subdomain" field="subdomain" placeholder="abc.myantraenterprises.com" />
          <Field label="Git Branch" field="git_branch" placeholder="client/abc" />
          <Field label="Monthly Fee ₹" field="monthly_fee" type="number" />
          <Field label="Scans Included" field="scans_included" type="number" />
        </div>

        <Field label="Supabase URL" field="supabase_url" placeholder="https://xxx.supabase.co" />
        <Field label="Supabase Anon Key" field="supabase_key" placeholder="eyJ..." />
        <Field label="Netlify Site" field="netlify_site" placeholder="abc-transport.netlify.app" />
        <Field label="Notes" field="notes" />

        {/* ── FEATURE TOGGLES ── */}
        <div style={{marginTop:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:800,color:C.accent}}>Feature Toggles</div>
            <div style={{display:"flex",gap:6}}>
              {["basic","professional","enterprise"].map(p=>(
                <Btn key={p} small outline={form.plan!==p} color={form.plan===p?C.green:C.muted}
                  onClick={()=>applyPreset(p)}>{p.slice(0,3).toUpperCase()}</Btn>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {ALL_FEATURES.map(feat => {
              const tier = FEATURE_TIERS[feat];
              const tierColor = tier==="basic"?C.green:tier==="pro"?C.blue:C.purple;
              return (
                <div key={feat} onClick={()=>setFeats(p=>({...p,[feat]:!p[feat]}))}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                    background:feats[feat]?tierColor+"15":C.bg,
                    border:`1px solid ${feats[feat]?tierColor+"55":C.border}`,
                    borderRadius:8,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{width:18,height:18,borderRadius:4,
                    background:feats[feat]?tierColor:"transparent",
                    border:`2px solid ${feats[feat]?tierColor:C.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,color:"#fff",flexShrink:0}}>
                    {feats[feat]?"✓":""}
                  </div>
                  <div>
                    <div style={{fontSize:12,color:C.text,fontWeight:feats[feat]?700:400}}>
                      {FEATURE_LABELS[feat]||feat}
                    </div>
                    <div style={{fontSize:9,color:tierColor,textTransform:"uppercase"}}>{tier}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <Btn onClick={handleSave} full disabled={saving} color={C.green}>
            {saving?"Saving...":"💾 Save All Changes"}
          </Btn>
          <Btn onClick={onClose} outline color={C.muted}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── ADD CLIENT ─────────────────────────────────────────────────────────────
function AddClientModal({onSave, onClose}) {
  const [form, setForm] = useState({name:"",slug:"",owner_name:"",phone:"",email:"",plan:"basic"});
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleCreate = async () => {
    if(!form.name||!form.slug) { alert("Name and slug are required"); return; }
    setSaving(true);
    const {data, error} = await adminSupabase.from("clients").insert({
      name: form.name, slug: form.slug, owner_name: form.owner_name,
      phone: form.phone, email: form.email, plan: form.plan,
      scans_included: PLAN_SCANS[form.plan]||50,
      monthly_fee: PLAN_FEES[form.plan]||3000,
      status: "active",
    }).select().single();

    if(!error && data) {
      // Seed features based on plan
      await adminSupabase.rpc("seed_features", {cid: data.id, plan_type: form.plan});
    }
    setSaving(false);
    if(!error) onSave();
    else alert("Error: "+error.message);
  };

  const Field = ({label, field, placeholder=""}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>{label}</div>
      <input value={form[field]||""} onChange={e=>set(field,e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
          padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}} />
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:999,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.card,borderRadius:16,padding:"24px 20px",width:400}}>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:20}}>➕ Add New Transporter</div>
        <Field label="Company Name" field="name" placeholder="Krishna Transport" />
        <Field label="Slug (URL)" field="slug" placeholder="krishna-transport" />
        <Field label="Owner Name" field="owner_name" />
        <Field label="Phone" field="phone" />
        <Field label="Email" field="email" />
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>PLAN</div>
          <select value={form.plan} onChange={e=>set("plan",e.target.value)}
            style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
              padding:"9px 12px",color:C.text,fontSize:13}}>
            <option value="basic">Basic (₹3K/mo · 50 scans)</option>
            <option value="professional">Professional (₹7K/mo · 200 scans)</option>
            <option value="enterprise">Enterprise (₹12K/mo · unlimited)</option>
          </select>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn onClick={handleCreate} full disabled={saving} color={C.green}>
            {saving?"Creating...":"Create Client"}
          </Btn>
          <Btn onClick={onClose} outline color={C.muted}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN APP ─────────────────────────────────────────────────────────
export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [clients, setClients] = useState([]);
  const [allFeatures, setAllFeatures] = useState({});
  const [scanCounts, setScanCounts] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState("clients");

  const loadClients = useCallback(async () => {
    const {data: cl} = await adminSupabase.from("clients").select("*").order("onboarded_at",{ascending:false});
    setClients(cl||[]);

    // Load all features
    const {data: feats} = await adminSupabase.from("client_features").select("*");
    const map = {};
    (feats||[]).forEach(f => {
      if(!map[f.client_id]) map[f.client_id] = {};
      map[f.client_id][f.feature] = f.enabled;
    });
    setAllFeatures(map);

    // Load scan counts this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const {data: scans} = await adminSupabase.from("client_scans")
      .select("client_id").gte("scanned_at", startOfMonth.toISOString());
    const counts = {};
    (scans||[]).forEach(s => { counts[s.client_id] = (counts[s.client_id]||0)+1; });
    setScanCounts(counts);
  }, []);

  useEffect(() => { if(admin) loadClients(); }, [admin, loadClients]);

  if(!admin) return <AdminLogin onLogin={setAdmin} />;

  const activeClients = clients.filter(c=>c.status==="active").length;
  const totalScans = Object.values(scanCounts).reduce((s,n)=>s+n,0);
  const totalRevenue = clients.filter(c=>c.status==="active").reduce((s,c)=>s+(c.monthly_fee||0),0);

  const statusColor = s => s==="active"?C.green:s==="suspended"?C.orange:C.red;
  const planColor = p => p==="enterprise"?C.purple:p==="professional"?C.blue:C.teal;

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:18,fontWeight:900,color:C.accent}}>M YANTRA</span>
          <span style={{fontSize:11,color:C.muted,marginLeft:8,letterSpacing:2}}>ADMIN</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:12,color:C.muted}}>👤 {admin.name}</span>
          <Btn small outline color={C.red} onClick={()=>setAdmin(null)}>Logout</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"flex",gap:12,padding:"16px 20px",flexWrap:"wrap"}}>
        <KPI label="Active Clients" value={activeClients} color={C.green} />
        <KPI label="Scans This Month" value={totalScans} color={C.accent} />
        <KPI label="Monthly Revenue" value={fmt(totalRevenue)} color={C.teal} />
        <KPI label="Total Clients" value={clients.length} color={C.muted} />
      </div>

      {/* Action Bar */}
      <div style={{padding:"0 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:15,fontWeight:800}}>🚛 Transporters ({clients.length})</div>
        <Btn onClick={()=>setAdding(true)} color={C.green} small>➕ Add Transporter</Btn>
      </div>

      {/* Client List */}
      <div style={{padding:"0 20px 40px"}}>
        {clients.map(c => {
          const feats = allFeatures[c.id]||{};
          const enabledCount = Object.values(feats).filter(Boolean).length;
          const scans = scanCounts[c.id]||0;
          const scanPct = c.scans_included ? Math.round((scans/c.scans_included)*100) : 0;

          return (
            <div key={c.id} onClick={()=>setEditing(c)}
              style={{background:C.card,borderRadius:12,padding:"14px 16px",marginBottom:8,
                cursor:"pointer",border:`1px solid ${C.border}`,transition:"all .15s",
                display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>

              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:15,fontWeight:700,color:C.text}}>{c.name}</span>
                  <Badge label={c.status} color={statusColor(c.status)} />
                  <Badge label={c.plan||"basic"} color={planColor(c.plan)} />
                </div>
                <div style={{fontSize:11,color:C.muted}}>
                  {c.owner_name||"—"} · {c.phone||"—"} · {c.subdomain||c.netlify_site||"no domain"}
                </div>
              </div>

              <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
                {/* Features count */}
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.accent}}>{enabledCount}</div>
                  <div style={{fontSize:9,color:C.muted}}>FEATURES</div>
                </div>
                {/* Scans meter */}
                <div style={{textAlign:"center",minWidth:60}}>
                  <div style={{fontSize:16,fontWeight:800,
                    color:scanPct>90?C.red:scanPct>70?C.orange:C.green}}>{scans}</div>
                  <div style={{fontSize:9,color:C.muted}}>/{c.scans_included||50} SCANS</div>
                  <div style={{height:3,background:C.card2,borderRadius:2,marginTop:3}}>
                    <div style={{height:3,borderRadius:2,width:`${Math.min(100,scanPct)}%`,
                      background:scanPct>90?C.red:scanPct>70?C.orange:C.green}} />
                  </div>
                </div>
                {/* Monthly fee */}
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.teal}}>{fmt(c.monthly_fee||0)}</div>
                  <div style={{fontSize:9,color:C.muted}}>/ MONTH</div>
                </div>
              </div>
            </div>
          );
        })}

        {clients.length===0 && (
          <div style={{textAlign:"center",padding:40,color:C.muted}}>
            No transporters yet. Click "Add Transporter" to onboard your first client.
          </div>
        )}
      </div>

      {/* Modals */}
      {editing && (
        <ClientEditor
          client={editing}
          features={allFeatures[editing.id]||{}}
          onSave={()=>{setEditing(null);loadClients();}}
          onClose={()=>setEditing(null)}
        />
      )}
      {adding && (
        <AddClientModal
          onSave={()=>{setAdding(false);loadClients();}}
          onClose={()=>setAdding(false)}
        />
      )}
    </div>
  );
}
