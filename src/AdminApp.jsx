import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  import.meta.env.VITE_ADMIN_SUPABASE_URL,
  import.meta.env.VITE_ADMIN_SUPABASE_SERVICE_KEY
);

const C = {
  bg:"#0f172a",card:"#1e293b",card2:"#334155",border:"#475569",
  text:"#f1f5f9",muted:"#94a3b8",accent:"#38bdf8",
  green:"#22c55e",red:"#ef4444",orange:"#f97316",purple:"#a78bfa",
  blue:"#3b82f6",teal:"#14b8a6",
};
const fmt=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const ALL_FEATURES=["trips","vehicles","employees","driver_pay","di_scan","payment_scan","diesel_tab","tafal","pdf_reports","shortage_recovery","loan_ledger","party_billing","pump_portal","batch_di_scanner","gst_reconciliation","owner_reports","inbound_trips","expense_tracking","custom_branding","husk_manager"];
const PLAN_PRESETS={basic:["trips","vehicles","employees","driver_pay","di_scan"],professional:["trips","vehicles","employees","driver_pay","di_scan","payment_scan","diesel_tab","tafal","pdf_reports","shortage_recovery","loan_ledger","expense_tracking"],enterprise:ALL_FEATURES};
const PLAN_SCANS={basic:50,professional:200,enterprise:9999};
const PLAN_FEES={basic:3000,professional:7000,enterprise:12000};
const FEATURE_LABELS={trips:"Trips",vehicles:"Vehicles",employees:"Employees",driver_pay:"Driver Pay",di_scan:"DI Scan",payment_scan:"Payment Scan",diesel_tab:"Diesel",tafal:"TAFAL",pdf_reports:"PDF Reports",shortage_recovery:"Shortage Recovery",loan_ledger:"Loan Ledger",party_billing:"Party Billing",pump_portal:"Pump Portal",batch_di_scanner:"Batch DI Scanner",gst_reconciliation:"GST Reconciliation",owner_reports:"Owner Reports",inbound_trips:"Inbound Trips",expense_tracking:"Expense Tracking",custom_branding:"Custom Branding",husk_manager:"Husk Manager"};
const FEATURE_TIERS={trips:"basic",vehicles:"basic",employees:"basic",driver_pay:"basic",di_scan:"basic",payment_scan:"pro",diesel_tab:"pro",tafal:"pro",pdf_reports:"pro",shortage_recovery:"pro",loan_ledger:"pro",expense_tracking:"pro",party_billing:"ent",pump_portal:"ent",batch_di_scanner:"ent",gst_reconciliation:"ent",owner_reports:"ent",inbound_trips:"ent",custom_branding:"ent",husk_manager:"ent"};

const Btn=({children,onClick,color=C.accent,outline,small,full,disabled})=>(<button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":color,color:outline?color:"#fff",border:outline?`1.5px solid ${color}`:"none",borderRadius:8,padding:small?"6px 12px":"10px 18px",fontSize:small?12:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,width:full?"100%":"auto"}}>{children}</button>);
const Badge=({label,color=C.muted})=>(<span style={{background:color+"22",color,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{label}</span>);
const KPI=({label,value,color=C.accent})=>(<div style={{background:C.card,borderRadius:12,padding:"14px 16px",flex:1,minWidth:120}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{label}</div><div style={{fontSize:22,fontWeight:800,color,marginTop:4}}>{value}</div></div>);
const Field=({label,value,onChange,type="text",placeholder="",area,half})=>(<div style={{marginBottom:12,flex:half?1:undefined}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{label}</div>{area?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"monospace",resize:"vertical"}}/>:<input value={value||""} onChange={e=>onChange(type==="number"?+e.target.value:e.target.value)} type={type} placeholder={placeholder} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}</div>);
const Section=({title,color=C.accent,children})=>(<div style={{marginTop:20,marginBottom:8}}><div style={{fontSize:12,fontWeight:800,color,marginBottom:10,borderBottom:`1px solid ${color}33`,paddingBottom:6}}>{title}</div>{children}</div>);

function AdminLogin({onLogin}){const[pin,setPin]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const go=async()=>{setLoading(true);setErr("");const{data}=await adminSupabase.from("admin_users").select("*").eq("pin",pin).eq("role","superadmin").single();setLoading(false);if(!data){setErr("Invalid PIN");return;}onLogin(data);};return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:C.card,borderRadius:16,padding:"40px 32px",width:340,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:C.accent,marginBottom:4}}>M YANTRA</div><div style={{fontSize:11,color:C.muted,letterSpacing:3,marginBottom:30}}>ADMIN CONTROL</div><input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="Enter Admin PIN" onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:16,textAlign:"center",marginBottom:16,outline:"none",boxSizing:"border-box"}}/>{err&&<div style={{color:C.red,fontSize:12,marginBottom:12}}>{err}</div>}<Btn onClick={go} full disabled={loading}>{loading?"Checking...":"Login →"}</Btn></div></div>);}

function ClientEditor({client,features,onSave,onClose}){
  const[form,setForm]=useState({...client});
  const[biz,setBiz]=useState(client.business_config||{clients:[],defaultClient:"",defaultConsignee:"",shreeClients:[],lrPrefixes:{},clientAbbreviations:{},clientDetection:{},clientColors:{},bankType:"universal",placeMap:{},roles:{}});
  const[feats,setFeats]=useState({...features});
  const[saving,setSaving]=useState(false);
  const[activeTab,setActiveTab]=useState("details");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const applyPreset=plan=>{const preset=PLAN_PRESETS[plan]||[];const nf={};ALL_FEATURES.forEach(f=>{nf[f]=preset.includes(f);});setFeats(nf);set("plan",plan);set("scans_included",PLAN_SCANS[plan]||50);set("monthly_fee",PLAN_FEES[plan]||3000);};

  const handleSave=async()=>{
    setSaving(true);
    await adminSupabase.from("clients").update({
      name:form.name,slug:form.slug,owner_name:form.owner_name,phone:form.phone,email:form.email,
      plan:form.plan,status:form.status,scans_included:form.scans_included,
      supabase_url:form.supabase_url,supabase_key:form.supabase_key,
      netlify_site:form.netlify_site,subdomain:form.subdomain,git_branch:form.git_branch,
      monthly_fee:form.monthly_fee,onboarding_fee:form.onboarding_fee,notes:form.notes,
      company_short:form.company_short,pan:form.pan,gstn:form.gstn,
      address:form.address,tagline:form.tagline,logo_base64:form.logo_base64,
      anthropic_api_key:form.anthropic_api_key,
      primary_color:form.primary_color,accent_color:form.accent_color,header_bg:form.header_bg,
      business_config:biz,
    }).eq("id",client.id);
    for(const feat of ALL_FEATURES){
      await adminSupabase.from("client_features").upsert({client_id:client.id,feature:feat,enabled:feats[feat]===true,updated_at:new Date().toISOString()},{onConflict:"client_id,feature"});
    }
    setSaving(false);onSave();
  };

  const tabs=[{id:"details",label:"📋 Details"},{id:"branding",label:"🎨 Branding"},{id:"business",label:"🏭 Business"},{id:"api",label:"🔑 API & DB"},{id:"features",label:"⚡ Features"}];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:999,display:"flex",justifyContent:"center",overflowY:"auto",padding:"20px 16px"}}>
      <div style={{background:C.card,borderRadius:16,padding:"20px",width:"100%",maxWidth:600,alignSelf:"flex-start"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:18,fontWeight:800,color:C.text}}>{form.name||"New Client"}</div>
          <span onClick={onClose} style={{cursor:"pointer",fontSize:20,color:C.muted}}>✕</span>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
          {tabs.map(t=>(<div key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",background:activeTab===t.id?C.accent+"22":"transparent",color:activeTab===t.id?C.accent:C.muted,border:`1px solid ${activeTab===t.id?C.accent+"44":"transparent"}`}}>{t.label}</div>))}
        </div>

        {activeTab==="details"&&(<div>
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{flex:1}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>STATUS</div><select value={form.status||"active"} onChange={e=>set("status",e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13}}><option value="active">✅ Active</option><option value="suspended">⏸ Suspended</option><option value="cancelled">❌ Cancelled</option></select></div>
            <div style={{flex:1}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>PLAN</div><select value={form.plan||"basic"} onChange={e=>applyPreset(e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13}}><option value="basic">Basic (₹3K)</option><option value="professional">Professional (₹7K)</option><option value="enterprise">Enterprise (₹12K)</option></select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Field label="Company Name" value={form.name} onChange={v=>set("name",v)}/>
            <Field label="Short Name" value={form.company_short} onChange={v=>set("company_short",v)} placeholder="AB"/>
            <Field label="Owner Name" value={form.owner_name} onChange={v=>set("owner_name",v)}/>
            <Field label="Phone" value={form.phone} onChange={v=>set("phone",v)}/>
            <Field label="Email" value={form.email} onChange={v=>set("email",v)}/>
            <Field label="Address" value={form.address} onChange={v=>set("address",v)}/>
            <Field label="PAN" value={form.pan} onChange={v=>set("pan",v)} placeholder="XXXXXXXXXX"/>
            <Field label="GSTN" value={form.gstn} onChange={v=>set("gstn",v)} placeholder="29XXXXXXXXX1ZX"/>
            <Field label="Monthly Fee ₹" value={form.monthly_fee} onChange={v=>set("monthly_fee",v)} type="number"/>
            <Field label="Scans Included" value={form.scans_included} onChange={v=>set("scans_included",v)} type="number"/>
          </div>
          <Field label="Notes" value={form.notes} onChange={v=>set("notes",v)}/>
        </div>)}

        {activeTab==="branding"&&(<div>
          <Field label="Tagline" value={form.tagline} onChange={v=>set("tagline",v)} placeholder="TRANSPORT MANAGEMENT"/>
          <Field label="Logo (base64 data URI)" value={form.logo_base64} onChange={v=>set("logo_base64",v)} area placeholder="data:image/jpeg;base64,/9j/4AAQ..."/>
          {form.logo_base64&&<div style={{marginBottom:12,textAlign:"center"}}><img src={form.logo_base64} alt="preview" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`2px solid ${C.border}`}}/><div style={{fontSize:10,color:C.muted,marginTop:4}}>Logo Preview</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[["PRIMARY COLOR","primary_color","#1565c0"],["ACCENT COLOR","accent_color","#0d9488"],["HEADER BG","header_bg","#0d1b2a"]].map(([l,k,d])=>(
              <div key={k}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>{l}</div><div style={{display:"flex",gap:6,alignItems:"center"}}><input type="color" value={form[k]||d} onChange={e=>set(k,e.target.value)} style={{width:36,height:36,border:"none",cursor:"pointer",borderRadius:6}}/><span style={{fontSize:11,color:C.muted,fontFamily:"monospace"}}>{form[k]||d}</span></div></div>
            ))}
          </div>
        </div>)}

        {activeTab==="business"&&(<div>
          <Section title="CEMENT CLIENTS">
            <Field label="Clients (comma separated)" value={(biz.clients||[]).join(", ")} onChange={v=>setBiz(p=>({...p,clients:v.split(",").map(s=>s.trim()).filter(Boolean)}))} placeholder="ACC Cement, Ultratech"/>
            <Field label="Default Client" value={biz.defaultClient} onChange={v=>setBiz(p=>({...p,defaultClient:v}))}/>
            <Field label="Default Consignee" value={biz.defaultConsignee} onChange={v=>setBiz(p=>({...p,defaultConsignee:v}))}/>
            <Field label="Shree Clients (comma separated)" value={(biz.shreeClients||[]).join(", ")} onChange={v=>setBiz(p=>({...p,shreeClients:v.split(",").map(s=>s.trim()).filter(Boolean)}))}/>
          </Section>
          <Section title="LR PREFIXES (JSON)" color={C.purple}>
            <Field label='{"Client|Material": "PREFIX"}' value={JSON.stringify(biz.lrPrefixes||{},null,2)} onChange={v=>{try{setBiz(p=>({...p,lrPrefixes:JSON.parse(v)}));}catch{}}} area placeholder='{"ACC Cement|Cement": "ACC"}'/>
          </Section>
          <Section title="CLIENT DETECTION KEYWORDS (JSON)" color={C.orange}>
            <Field label='{"keyword": "Client Name"}' value={JSON.stringify(biz.clientDetection||{},null,2)} onChange={v=>{try{setBiz(p=>({...p,clientDetection:JSON.parse(v)}));}catch{}}} area placeholder='{"ultratech": "Ultratech Malkhed"}'/>
          </Section>
          <Section title="CLIENT ABBREVIATIONS (JSON)" color={C.teal}>
            <Field label='{"Full ": "Short "}' value={JSON.stringify(biz.clientAbbreviations||{},null,2)} onChange={v=>{try{setBiz(p=>({...p,clientAbbreviations:JSON.parse(v)}));}catch{}}} area/>
          </Section>
          <Section title="CLIENT COLORS (JSON)" color={C.green}>
            <Field label='{"keyword": "#hex"}' value={JSON.stringify(biz.clientColors||{},null,2)} onChange={v=>{try{setBiz(p=>({...p,clientColors:JSON.parse(v)}));}catch{}}} area/>
          </Section>
          <Field label="Bank Type" value={biz.bankType||"universal"} onChange={v=>setBiz(p=>({...p,bankType:v}))} placeholder="universal / hdfc / sbi"/>
        </div>)}

        {activeTab==="api"&&(<div>
          <Section title="🤖 ANTHROPIC (CLAUDE AI)" color={C.orange}>
            <Field label="Anthropic API Key" value={form.anthropic_api_key} onChange={v=>set("anthropic_api_key",v)} placeholder="sk-ant-api03-..."/>
            <div style={{fontSize:10,color:C.muted,marginTop:-8,marginBottom:12}}>Used for DI/GR/Payment scanning. Share your key across clients — usage tracked per client.</div>
          </Section>
          <Section title="📦 CLIENT SUPABASE" color={C.green}>
            <Field label="Supabase URL" value={form.supabase_url} onChange={v=>set("supabase_url",v)} placeholder="https://xxx.supabase.co"/>
            <Field label="Supabase Anon Key" value={form.supabase_key} onChange={v=>set("supabase_key",v)} placeholder="eyJ..."/>
          </Section>
          <Section title="🌐 DEPLOYMENT" color={C.blue}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
              <Field label="Netlify Site" value={form.netlify_site} onChange={v=>set("netlify_site",v)} placeholder="abc.netlify.app"/>
              <Field label="Subdomain" value={form.subdomain} onChange={v=>set("subdomain",v)} placeholder="abc.myantraenterprises.com"/>
              <Field label="Git Branch" value={form.git_branch} onChange={v=>set("git_branch",v)} placeholder="client/abc"/>
            </div>
          </Section>
        </div>)}

        {activeTab==="features"&&(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,color:C.muted}}>Apply preset or toggle individually:</div>
            <div style={{display:"flex",gap:6}}>
              {["basic","professional","enterprise"].map(p=>(<Btn key={p} small outline={form.plan!==p} color={form.plan===p?C.green:C.muted} onClick={()=>applyPreset(p)}>{p.slice(0,3).toUpperCase()}</Btn>))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {ALL_FEATURES.map(feat=>{const tier=FEATURE_TIERS[feat];const tc=tier==="basic"?C.green:tier==="pro"?C.blue:C.purple;return(
              <div key={feat} onClick={()=>setFeats(p=>({...p,[feat]:!p[feat]}))} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:feats[feat]?tc+"15":C.bg,border:`1px solid ${feats[feat]?tc+"55":C.border}`,borderRadius:8,cursor:"pointer"}}>
                <div style={{width:18,height:18,borderRadius:4,background:feats[feat]?tc:"transparent",border:`2px solid ${feats[feat]?tc:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",flexShrink:0}}>{feats[feat]?"✓":""}</div>
                <div><div style={{fontSize:12,color:C.text,fontWeight:feats[feat]?700:400}}>{FEATURE_LABELS[feat]}</div><div style={{fontSize:9,color:tc,textTransform:"uppercase"}}>{tier}</div></div>
              </div>);})}
          </div>
        </div>)}

        <div style={{display:"flex",gap:10,marginTop:20}}>
          <Btn onClick={handleSave} full disabled={saving} color={C.green}>{saving?"Saving...":"💾 Save All Changes"}</Btn>
          <Btn onClick={onClose} outline color={C.muted}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

function AddClientModal({onSave,onClose}){
  const[form,setForm]=useState({name:"",slug:"",owner_name:"",phone:"",email:"",plan:"basic",company_short:""});
  const[saving,setSaving]=useState(false);const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const go=async()=>{if(!form.name||!form.slug){alert("Name and slug required");return;}setSaving(true);
    const{data,error}=await adminSupabase.from("clients").insert({name:form.name,slug:form.slug,owner_name:form.owner_name,phone:form.phone,email:form.email,plan:form.plan,company_short:form.company_short||form.name.slice(0,2).toUpperCase(),scans_included:PLAN_SCANS[form.plan]||50,monthly_fee:PLAN_FEES[form.plan]||3000,status:"active"}).select().single();
    if(!error&&data)await adminSupabase.rpc("seed_features",{cid:data.id,plan_type:form.plan});
    setSaving(false);if(!error)onSave();else alert("Error: "+error.message);};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:C.card,borderRadius:16,padding:"24px 20px",width:420}}>
    <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:20}}>➕ Add New Transporter</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
      <Field label="Company Name" value={form.name} onChange={v=>set("name",v)} placeholder="Krishna Transport"/>
      <Field label="Short Name" value={form.company_short} onChange={v=>set("company_short",v)} placeholder="KT"/>
      <Field label="Slug" value={form.slug} onChange={v=>set("slug",v)} placeholder="krishna-transport"/>
      <Field label="Owner" value={form.owner_name} onChange={v=>set("owner_name",v)}/>
      <Field label="Phone" value={form.phone} onChange={v=>set("phone",v)}/>
      <Field label="Email" value={form.email} onChange={v=>set("email",v)}/>
    </div>
    <div style={{marginBottom:16}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>PLAN</div><select value={form.plan} onChange={e=>set("plan",e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13}}><option value="basic">Basic (₹3K)</option><option value="professional">Professional (₹7K)</option><option value="enterprise">Enterprise (₹12K)</option></select></div>
    <div style={{display:"flex",gap:10}}><Btn onClick={go} full disabled={saving} color={C.green}>{saving?"Creating...":"Create Client"}</Btn><Btn onClick={onClose} outline color={C.muted}>Cancel</Btn></div>
  </div></div>);
}

export default function AdminApp(){
  const[admin,setAdmin]=useState(null);const[clients,setClients]=useState([]);const[allFeatures,setAllFeatures]=useState({});const[scanCounts,setScanCounts]=useState({});const[editing,setEditing]=useState(null);const[adding,setAdding]=useState(false);
  const load=useCallback(async()=>{
    const{data:cl}=await adminSupabase.from("clients").select("*").order("onboarded_at",{ascending:false});setClients(cl||[]);
    const{data:feats}=await adminSupabase.from("client_features").select("*");const map={};(feats||[]).forEach(f=>{if(!map[f.client_id])map[f.client_id]={};map[f.client_id][f.feature]=f.enabled;});setAllFeatures(map);
    const som=new Date();som.setDate(1);som.setHours(0,0,0,0);const{data:scans}=await adminSupabase.from("client_scans").select("client_id").gte("scanned_at",som.toISOString());const counts={};(scans||[]).forEach(s=>{counts[s.client_id]=(counts[s.client_id]||0)+1;});setScanCounts(counts);
  },[]);
  useEffect(()=>{if(admin)load();},[admin,load]);
  if(!admin)return<AdminLogin onLogin={setAdmin}/>;
  const active=clients.filter(c=>c.status==="active").length;const totalScans=Object.values(scanCounts).reduce((s,n)=>s+n,0);const revenue=clients.filter(c=>c.status==="active").reduce((s,c)=>s+(c.monthly_fee||0),0);
  const sc=s=>s==="active"?C.green:s==="suspended"?C.orange:C.red;const pc=p=>p==="enterprise"?C.purple:p==="professional"?C.blue:C.teal;
  return(<div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
    <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><span style={{fontSize:18,fontWeight:900,color:C.accent}}>M YANTRA</span><span style={{fontSize:11,color:C.muted,marginLeft:8,letterSpacing:2}}>ADMIN</span></div>
      <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:12,color:C.muted}}>👤 {admin.name}</span><Btn small outline color={C.red} onClick={()=>setAdmin(null)}>Logout</Btn></div>
    </div>
    <div style={{display:"flex",gap:12,padding:"16px 20px",flexWrap:"wrap"}}>
      <KPI label="Active Clients" value={active} color={C.green}/><KPI label="Scans This Month" value={totalScans} color={C.accent}/><KPI label="Monthly Revenue" value={fmt(revenue)} color={C.teal}/><KPI label="Total Clients" value={clients.length} color={C.muted}/>
    </div>
    <div style={{padding:"0 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:15,fontWeight:800}}>🚛 Transporters ({clients.length})</div>
      <Btn onClick={()=>setAdding(true)} color={C.green} small>➕ Add Transporter</Btn>
    </div>
    <div style={{padding:"0 20px 40px"}}>
      {clients.map(c=>{const feats=allFeatures[c.id]||{};const ec=Object.values(feats).filter(Boolean).length;const scans=scanCounts[c.id]||0;const sp=c.scans_included?Math.round((scans/c.scans_included)*100):0;
        return(<div key={c.id} onClick={()=>setEditing(c)} style={{background:C.card,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              {c.logo_base64?<img src={c.logo_base64} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>:<div style={{width:28,height:28,borderRadius:"50%",background:c.accent_color||C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff"}}>{c.company_short||c.name?.slice(0,2)||"?"}</div>}
              <span style={{fontSize:15,fontWeight:700}}>{c.name}</span><Badge label={c.status} color={sc(c.status)}/><Badge label={c.plan||"basic"} color={pc(c.plan)}/>
            </div>
            <div style={{fontSize:11,color:C.muted}}>{c.owner_name||"—"} · {c.phone||"—"} · {c.subdomain||c.netlify_site||"no domain"}</div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.accent}}>{ec}</div><div style={{fontSize:9,color:C.muted}}>FEATURES</div></div>
            <div style={{textAlign:"center",minWidth:60}}><div style={{fontSize:16,fontWeight:800,color:sp>90?C.red:sp>70?C.orange:C.green}}>{scans}</div><div style={{fontSize:9,color:C.muted}}>/{c.scans_included||50} SCANS</div><div style={{height:3,background:C.card2,borderRadius:2,marginTop:3}}><div style={{height:3,borderRadius:2,width:`${Math.min(100,sp)}%`,background:sp>90?C.red:sp>70?C.orange:C.green}}/></div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.teal}}>{fmt(c.monthly_fee||0)}</div><div style={{fontSize:9,color:C.muted}}>/ MONTH</div></div>
          </div>
        </div>);})}
      {clients.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted}}>No transporters yet.</div>}
    </div>
    {editing&&<ClientEditor client={editing} features={allFeatures[editing.id]||{}} onSave={()=>{setEditing(null);load();}} onClose={()=>setEditing(null)}/>}
    {adding&&<AddClientModal onSave={()=>{setAdding(false);load();}} onClose={()=>setAdding(false)}/>}
  </div>);
}
