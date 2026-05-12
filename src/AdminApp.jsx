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

// ── Phase 2: GST Invoice PDF Generator ──────────────────────────────────────
function generateInvoiceHTML(inv, client) {
  const cgst = Math.round((+inv.gst_amount||0)/2);
  const sgst = cgst;
  const amtWords = numberToWords(+inv.total_amount||0);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${inv.invoice_no}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto;color:#1e293b}
.hdr{display:flex;justify-content:space-between;border-bottom:3px solid #1565c0;padding-bottom:12px;margin-bottom:16px}
.hdr h1{font-size:22px;color:#1565c0}.hdr .sub{font-size:11px;color:#64748b}
.inv-title{text-align:center;font-size:18px;font-weight:800;color:#1565c0;margin:16px 0;text-transform:uppercase;letter-spacing:2px}
table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #cbd5e1;padding:8px 10px;font-size:12px;text-align:left}
th{background:#f1f5f9;font-weight:700;font-size:11px;text-transform:uppercase;color:#475569}
.right{text-align:right}.bold{font-weight:700}.total-row{background:#eff6ff;font-weight:800;font-size:14px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.meta-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px}
.meta-box h3{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.meta-box p{font-size:12px;line-height:1.6;color:#1e293b}
.status{display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase}
.status-paid{background:#dcfce7;color:#166534}.status-unpaid{background:#fee2e2;color:#991b1b}
.footer{margin-top:24px;border-top:2px solid #e2e8f0;padding-top:12px;font-size:10px;color:#94a3b8;text-align:center}
.words{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px;font-size:11px;color:#78350f;margin:8px 0}
.bank{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;margin-top:12px}
.bank h3{font-size:10px;color:#0369a1;text-transform:uppercase;margin-bottom:6px}
.bank p{font-size:11px;color:#1e293b;line-height:1.6}
@media print{body{padding:10px}button{display:none!important}}
</style></head><body>
<div class="hdr">
  <div><h1>M YANTRA ENTERPRISES</h1><div class="sub">Transport Management Solutions<br/>Kodla, Sedam, Gulbarga, Karnataka<br/>GSTN: 29XXXXXXXXXXXZX</div></div>
  <div style="text-align:right"><div class="sub">Phone: 9008420384<br/>Email: myantraenterprises@gmail.com</div></div>
</div>
<div class="inv-title">Tax Invoice</div>
<div class="meta">
  <div class="meta-box"><h3>Bill To</h3><p><b>${client.name||""}</b><br/>${client.owner_name||""}<br/>Phone: ${client.phone||"—"}<br/>Email: ${client.email||"—"}<br/>GSTN: ${client.gstn||"—"}<br/>PAN: ${client.pan||"—"}</p></div>
  <div class="meta-box"><h3>Invoice Details</h3><p><b>Invoice No:</b> ${inv.invoice_no}<br/><b>Date:</b> ${inv.invoice_date}<br/><b>Period:</b> ${inv.billing_period}<br/><b>Type:</b> ${(inv.type||"").toUpperCase()}<br/><b>Status:</b> <span class="status ${inv.status==="paid"?"status-paid":"status-unpaid"}">${inv.status}</span>${inv.paid_ref?`<br/><b>Paid Ref:</b> ${inv.paid_ref}`:""}</p></div>
</div>
<table>
  <tr><th style="width:40px">#</th><th>Description</th><th class="right" style="width:80px">HSN/SAC</th><th class="right" style="width:120px">Amount</th></tr>
  <tr><td>1</td><td>${inv.description||inv.billing_period}</td><td class="right">998599</td><td class="right">${fmt(inv.base_amount)}</td></tr>
  <tr><td colspan="3" class="right">Subtotal</td><td class="right bold">${fmt(inv.base_amount)}</td></tr>
  <tr><td colspan="3" class="right">CGST @ ${(+inv.gst_rate||18)/2}%</td><td class="right">${fmt(cgst)}</td></tr>
  <tr><td colspan="3" class="right">SGST @ ${(+inv.gst_rate||18)/2}%</td><td class="right">${fmt(sgst)}</td></tr>
  <tr class="total-row"><td colspan="3" class="right">Total Amount</td><td class="right">${fmt(inv.total_amount)}</td></tr>
</table>
<div class="words"><b>Amount in words:</b> ${amtWords} Only</div>
<div class="bank"><h3>Bank Details (for payment)</h3><p><b>Account Name:</b> M Yantra Enterprises<br/><b>Bank:</b> HDFC Bank<br/><b>Account No:</b> XXXXXXXXXX<br/><b>IFSC:</b> HDFC0XXXXXX<br/><b>UPI:</b> myantra@hdfcbank</p></div>
<div class="footer">This is a computer-generated invoice. · M Yantra Enterprises · myantraenterprises@gmail.com</div>
<br/><button onclick="window.print()" style="background:#1565c0;color:#fff;border:none;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;display:block;margin:0 auto">🖨️ Print / Save PDF</button>
</body></html>`;
}

function numberToWords(n) {
  if(n===0) return "Zero Rupees";
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const convert = (num) => {
    if(num<20) return ones[num];
    if(num<100) return tens[Math.floor(num/10)]+(num%10?" "+ones[num%10]:"");
    if(num<1000) return ones[Math.floor(num/100)]+" Hundred"+(num%100?" "+convert(num%100):"");
    if(num<100000) return convert(Math.floor(num/1000))+" Thousand"+(num%1000?" "+convert(num%1000):"");
    if(num<10000000) return convert(Math.floor(num/100000))+" Lakh"+(num%100000?" "+convert(num%100000):"");
    return convert(Math.floor(num/10000000))+" Crore"+(num%10000000?" "+convert(num%10000000):"");
  };
  const rupees = Math.floor(n);
  const paise = Math.round((n-rupees)*100);
  let result = convert(rupees) + " Rupees";
  if(paise>0) result += " and " + convert(paise) + " Paise";
  return result;
}

function openInvoicePDF(inv, client) {
  const html = generateInvoiceHTML(inv, client);
  const w = window.open("", "_blank", "width=850,height=1100");
  w.document.write(html);
  w.document.close();
}
const PLAN_SCANS={basic:50,professional:200,enterprise:9999};
const PLAN_FEES={basic:3000,professional:7000,enterprise:12000};
const PLAN_ORDER={basic:0,pro:1,professional:1,enterprise:2};

const Btn=({children,onClick,color=C.accent,outline,small,full,disabled})=>(<button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":color,color:outline?color:"#fff",border:outline?`1.5px solid ${color}`:"none",borderRadius:8,padding:small?"6px 12px":"10px 18px",fontSize:small?12:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,width:full?"100%":"auto"}}>{children}</button>);
const Badge=({label,color=C.muted})=>(<span style={{background:color+"22",color,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6}}>{label}</span>);
const KPI=({label,value,color=C.accent})=>(<div style={{background:C.card,borderRadius:12,padding:"14px 16px",flex:1,minWidth:120}}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{label}</div><div style={{fontSize:22,fontWeight:800,color,marginTop:4}}>{value}</div></div>);
const Field=({label,value,onChange,type="text",placeholder="",area,half})=>(<div style={{marginBottom:12,flex:half?1:undefined}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>{label}</div>{area?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"monospace",resize:"vertical"}}/>:<input value={value||""} onChange={e=>onChange(type==="number"?+e.target.value:e.target.value)} type={type} placeholder={placeholder} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}</div>);
const Section=({title,color=C.accent,children})=>(<div style={{marginTop:20,marginBottom:8}}><div style={{fontSize:12,fontWeight:800,color,marginBottom:10,borderBottom:`1px solid ${color}33`,paddingBottom:6}}>{title}</div>{children}</div>);

function AdminLogin({onLogin}){const[pin,setPin]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const go=async()=>{setLoading(true);setErr("");const{data}=await adminSupabase.from("admin_users").select("*").eq("pin",pin).eq("role","superadmin").single();setLoading(false);if(!data){setErr("Invalid PIN");return;}onLogin(data);};return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:C.card,borderRadius:16,padding:"40px 32px",width:340,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:C.accent,marginBottom:4}}>M YANTRA</div><div style={{fontSize:11,color:C.muted,letterSpacing:3,marginBottom:30}}>ADMIN CONTROL</div><input value={pin} onChange={e=>setPin(e.target.value)} type="password" placeholder="Enter Admin PIN" onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:16,textAlign:"center",marginBottom:16,outline:"none",boxSizing:"border-box"}}/>{err&&<div style={{color:C.red,fontSize:12,marginBottom:12}}>{err}</div>}<Btn onClick={go} full disabled={loading}>{loading?"Checking...":"Login →"}</Btn></div></div>);}

function ClientEditor({client,features,featureDefs=[],onSave,onClose}){
  const[form,setForm]=useState({...client});
  const[biz,setBiz]=useState(client.business_config||{clients:[],defaultClient:"",defaultConsignee:"",shreeClients:[],lrPrefixes:{},clientAbbreviations:{},clientDetection:{},clientColors:{},bankType:"universal",placeMap:{},roles:{}});
  const[feats,setFeats]=useState({...features});
  const[saving,setSaving]=useState(false);
  const[activeTab,setActiveTab]=useState("details");
  const[invoices,setInvoices]=useState([]);
  const[invLoading,setInvLoading]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  // Fetch invoices for this client
  useEffect(()=>{
    (async()=>{
      setInvLoading(true);
      const{data}=await adminSupabase.from("subscription_invoices").select("*").eq("client_id",client.id).order("created_at",{ascending:false});
      setInvoices(data||[]);
      setInvLoading(false);
    })();
  },[client.id]);

  // Build plan presets from featureDefs
  const allFeatureKeys = featureDefs.map(d=>d.key);
  const featureLabel = k => (featureDefs.find(d=>d.key===k)||{}).label || k;
  const featureTier = k => { const d=featureDefs.find(d=>d.key===k); return d ? (d.min_plan==="basic"?"basic":d.min_plan==="pro"?"pro":"ent") : "ent"; };
  const featureCat = k => (featureDefs.find(d=>d.key===k)||{}).category || "Other";
  const planIncludes = (plan, minPlan) => {
    const order = {basic:0, pro:1, professional:1, enterprise:2};
    return (order[plan]||0) >= (order[minPlan]||0);
  };
  const applyPreset=plan=>{
    const nf={};
    featureDefs.forEach(d=>{nf[d.key]=planIncludes(plan,d.min_plan);});
    setFeats(nf);
    set("plan",plan);
    set("scans_included",PLAN_SCANS[plan]||50);
    set("monthly_fee",PLAN_FEES[plan]||3000);
  };

  const handleSave=async()=>{
    setSaving(true);
    await adminSupabase.from("clients").update({
      name:form.name,slug:form.slug,owner_name:form.owner_name,phone:form.phone,email:form.email,
      plan:form.plan,status:form.status,scans_included:form.scans_included,
      paid_until:form.paid_until||null,billing_cycle:form.billing_cycle||"monthly",
      payment_bypass:form.payment_bypass||false,
      last_payment_date:form.last_payment_date||null,last_payment_ref:form.last_payment_ref||"",
      supabase_url:form.supabase_url,supabase_key:form.supabase_key,
      netlify_site:form.netlify_site,subdomain:form.subdomain,git_branch:form.git_branch,
      monthly_fee:form.monthly_fee,onboarding_fee:form.onboarding_fee,notes:form.notes,
      company_short:form.company_short,pan:form.pan,gstn:form.gstn,
      address:form.address,tagline:form.tagline,logo_base64:form.logo_base64,
      anthropic_api_key:form.anthropic_api_key,
      primary_color:form.primary_color,accent_color:form.accent_color,header_bg:form.header_bg,
      business_config:biz,
    }).eq("id",client.id);
    for(const feat of allFeatureKeys){
      await adminSupabase.from("client_features").upsert({client_id:client.id,feature:feat,enabled:feats[feat]===true,updated_at:new Date().toISOString()},{onConflict:"client_id,feature"});
    }
    setSaving(false);onSave();
  };

  const tabs=[{id:"details",label:"📋 Details"},{id:"branding",label:"🎨 Branding"},{id:"business",label:"🏭 Business"},{id:"api",label:"🔑 API & DB"},{id:"features",label:"⚡ Features"},{id:"billing",label:"💰 Billing"}];

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
          <div style={{fontSize:10,color:C.purple,fontWeight:700,marginTop:12,marginBottom:8,textTransform:"uppercase",letterSpacing:1,borderTop:`1px solid ${C.border}`,paddingTop:12}}>💳 Payment Gate</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Paid Until (YYYY-MM-DD)" value={form.paid_until||""} onChange={v=>set("paid_until",v)} placeholder="2026-06-30"/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>Billing Cycle</div>
              <select value={form.billing_cycle||"monthly"} onChange={e=>set("billing_cycle",e.target.value)}
                style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13}}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Last Payment Date" value={form.last_payment_date||""} onChange={v=>set("last_payment_date",v)} placeholder="2026-05-01"/>
            <Field label="Last Payment Ref" value={form.last_payment_ref||""} onChange={v=>set("last_payment_ref",v)} placeholder="UTR / Cheque No"/>
          </div>
          <div onClick={()=>set("payment_bypass",!form.payment_bypass)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:form.payment_bypass?C.green+"15":C.bg,border:`1px solid ${form.payment_bypass?C.green:C.border}`,borderRadius:8,cursor:"pointer",marginBottom:12}}>
            <div style={{width:20,height:20,borderRadius:4,background:form.payment_bypass?C.green:"transparent",border:`2px solid ${form.payment_bypass?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff"}}>{form.payment_bypass?"✓":""}</div>
            <div><div style={{fontSize:12,fontWeight:600,color:C.text}}>Bypass Payment Check</div><div style={{fontSize:10,color:C.muted}}>App works even without payment (e.g. your own transport)</div></div>
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
          {[...new Set(featureDefs.map(d=>d.category))].map(cat=>(
            <div key={cat} style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:6,borderBottom:`1px solid ${C.border}33`,paddingBottom:4}}>{cat}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {featureDefs.filter(d=>d.category===cat).map(d=>{
                  const tier=featureTier(d.key);const tc=tier==="basic"?C.green:tier==="pro"?C.blue:C.purple;
                  return(
                    <div key={d.key} onClick={()=>setFeats(p=>({...p,[d.key]:!p[d.key]}))} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:feats[d.key]?tc+"15":C.bg,border:`1px solid ${feats[d.key]?tc+"55":C.border}`,borderRadius:8,cursor:"pointer"}} title={d.description}>
                      <div style={{width:18,height:18,borderRadius:4,background:feats[d.key]?tc:"transparent",border:`2px solid ${feats[d.key]?tc:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",flexShrink:0}}>{feats[d.key]?"✓":""}</div>
                      <div><div style={{fontSize:12,color:C.text,fontWeight:feats[d.key]?700:400}}>{d.label}</div><div style={{fontSize:9,color:tc,textTransform:"uppercase"}}>{d.min_plan}</div></div>
                    </div>);
                })}
              </div>
            </div>
          ))}
        </div>)}

        {/* ═══ BILLING TAB ═══ */}
        {activeTab==="billing"&&(<div>
          {(()=>{
            const [invFrom, setInvFrom] = [form._invFrom||"", v=>set("_invFrom",v)];
            const [invTo, setInvTo] = [form._invTo||"", v=>set("_invTo",v)];
            const filtered = invoices.filter(i=>{
              if(invFrom && i.invoice_date < invFrom) return false;
              if(invTo && i.invoice_date > invTo) return false;
              return true;
            });
            const activeInvs = filtered.filter(i=>i.status!=="cancelled");
            const totalBilled = activeInvs.reduce((s,i)=>s+(+i.total_amount||0),0);
            const totalPaid = activeInvs.filter(i=>i.status==="paid").reduce((s,i)=>s+(+i.paid_amount||+i.total_amount||0),0);
            const outstanding = activeInvs.filter(i=>i.status==="unpaid").reduce((s,i)=>s+(+i.total_amount||0),0);
            const onboardingDone = invoices.some(i=>i.type==="onboarding"&&i.status!=="cancelled");

            const createInvoice = async (type, baseAmt, desc) => {
              const gstRate = 18;
              const gstAmt = Math.round(baseAmt * gstRate / 100);
              const total = baseAmt + gstAmt;
              const{data:invNo} = await adminSupabase.rpc("get_next_invoice_no");
              if(!invNo){alert("Failed to generate invoice number");return;}
              const now = new Date();
              const period = type==="onboarding" ? "Onboarding" : now.toLocaleString("en-US",{month:"long",year:"numeric"});
              const{error} = await adminSupabase.from("subscription_invoices").insert({
                client_id: client.id, invoice_no: invNo, invoice_date: now.toISOString().split("T")[0],
                billing_period: period, type, description: desc || `${type.charAt(0).toUpperCase()+type.slice(1)} — ${form.name}`,
                base_amount: baseAmt, gst_rate: gstRate, gst_amount: gstAmt, total_amount: total,
                status: "unpaid", created_by: "admin",
              });
              if(error){alert("Error: "+error.message);return;}
              const{data:updated}=await adminSupabase.from("subscription_invoices").select("*").eq("client_id",client.id).order("created_at",{ascending:false});
              setInvoices(updated||[]);
            };

            const markPaid = async (inv) => {
              const ref = window.prompt("Payment reference (UTR/Cheque):", "");
              if(ref===null) return;
              await adminSupabase.from("subscription_invoices").update({
                status:"paid", paid_date:new Date().toISOString().split("T")[0],
                paid_amount:inv.total_amount, paid_ref:ref
              }).eq("id",inv.id);
              const{data:updated}=await adminSupabase.from("subscription_invoices").select("*").eq("client_id",client.id).order("created_at",{ascending:false});
              setInvoices(updated||[]);
            };

            const cancelInvoice = async (inv) => {
              if(!window.confirm(`Cancel invoice ${inv.invoice_no}?`)) return;
              await adminSupabase.from("subscription_invoices").update({status:"cancelled"}).eq("id",inv.id);
              const{data:updated}=await adminSupabase.from("subscription_invoices").select("*").eq("client_id",client.id).order("created_at",{ascending:false});
              setInvoices(updated||[]);
            };

            return (<>
              {/* Summary cards */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.accent}}>{fmt(totalBilled)}</div>
                  <div style={{fontSize:9,color:C.muted}}>TOTAL BILLED</div>
                </div>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.green}}>{fmt(totalPaid)}</div>
                  <div style={{fontSize:9,color:C.muted}}>TOTAL PAID</div>
                </div>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:outstanding>0?C.red:C.green}}>{fmt(outstanding)}</div>
                  <div style={{fontSize:9,color:C.muted}}>OUTSTANDING</div>
                </div>
              </div>

              {/* Date filters */}
              <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
                <div><div style={{fontSize:9,color:C.muted,fontWeight:700}}>FROM</div><input type="date" value={invFrom} onChange={e=>setInvFrom(e.target.value)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:C.text,fontSize:11}}/></div>
                <div><div style={{fontSize:9,color:C.muted,fontWeight:700}}>TO</div><input type="date" value={invTo} onChange={e=>setInvTo(e.target.value)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:C.text,fontSize:11}}/></div>
                <Btn small outline color={C.muted} onClick={()=>{setInvFrom("");setInvTo("");}}>All</Btn>
                <Btn small outline color={C.muted} onClick={()=>{const d=new Date();setInvFrom(new Date(d.getFullYear(),d.getMonth(),1).toISOString().split("T")[0]);setInvTo(d.toISOString().split("T")[0]);}}>This Month</Btn>
                <Btn small outline color={C.muted} onClick={()=>{const d=new Date();const fy=d.getMonth()>=3?d.getFullYear():d.getFullYear()-1;setInvFrom(`${fy}-04-01`);setInvTo(d.toISOString().split("T")[0]);}}>This FY</Btn>
                <Btn small outline color={C.accent} onClick={()=>{
                  const rows=activeInvs.map(i=>`<tr><td>${i.invoice_no}</td><td>${i.invoice_date}</td><td>${i.billing_period}</td><td>${i.type}</td><td style="text-align:right">${fmt(i.base_amount)}</td><td style="text-align:right">${fmt(i.gst_amount)}</td><td style="text-align:right"><b>${fmt(i.total_amount)}</b></td><td>${i.status}</td><td>${i.paid_ref||"—"}</td></tr>`).join("");
                  const html=`<!DOCTYPE html><html><head><title>Billing — ${form.name}</title><style>*{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#f1f5f9;text-align:left}.right{text-align:right}h2{color:#1565c0}.summary{display:flex;gap:30px;margin:12px 0}.summary div{text-align:center}.summary .n{font-size:20px;font-weight:800}@media print{button{display:none!important}}</style></head><body>
<div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #1565c0;padding-bottom:10px;margin-bottom:12px"><div style="font-size:22px;font-weight:900;color:#1565c0">M YANTRA ENTERPRISES</div><div style="font-size:11px;color:#64748b">Transport Management Solutions</div></div>
<h2>Billing Report — ${form.name}</h2><p>${invFrom||"All time"} to ${invTo||"Present"} · Plan: ${form.plan} · ${form.billing_cycle||"monthly"}</p>
<div class="summary"><div><div class="n">${fmt(totalBilled)}</div>Billed</div><div><div class="n" style="color:green">${fmt(totalPaid)}</div>Paid</div><div><div class="n" style="color:${outstanding>0?"red":"green"}">${fmt(outstanding)}</div>Outstanding</div></div>
<table><tr><th>Invoice</th><th>Date</th><th>Period</th><th>Type</th><th class="right">Base</th><th class="right">GST</th><th class="right">Total</th><th>Status</th><th>Ref</th></tr>${rows}</table>
<p style="font-size:10px;color:#94a3b8;margin-top:20px">Generated by M Yantra Admin · ${new Date().toLocaleString()}</p>
<br/><button onclick="window.print()" style="background:#1565c0;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:13px">🖨 Print</button></body></html>`;
                  const w=window.open("","_blank","width=900,height=700");w.document.write(html);w.document.close();
                }}>🖨 Report</Btn>
              </div>

              {/* Quick create buttons */}
              <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Create Invoice</div>
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {!onboardingDone && (
                  <Btn small color={C.purple} onClick={()=>{
                    const amt = +window.prompt("Onboarding fee (base amount before GST):", "100000");
                    if(!amt) return;
                    createInvoice("onboarding", amt, `Onboarding fee — ${form.name}`);
                  }}>🏁 Onboarding</Btn>
                )}
                <Btn small color={C.teal} onClick={()=>createInvoice("monthly", +(form.monthly_fee||0), `Monthly subscription — ${form.name}`)}>
                  📅 Monthly ₹{fmt(+(form.monthly_fee||0))}
                </Btn>
                <Btn small color={C.blue} onClick={()=>createInvoice("quarterly", +(form.monthly_fee||0)*3, `Quarterly — ${form.name}`)}>
                  📊 Quarterly
                </Btn>
                <Btn small outline color={C.muted} onClick={()=>{
                  const amt = +window.prompt("Custom amount (base before GST):", "");
                  const desc = window.prompt("Description:", "");
                  if(!amt) return;
                  createInvoice("custom", amt, desc||"Custom invoice");
                }}>➕ Custom</Btn>
              </div>

              {/* Invoice list */}
              <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
                Invoices ({filtered.length}{filtered.length!==invoices.length?` of ${invoices.length}`:""}) {invLoading && "⏳"}
              </div>
              {filtered.length===0 && <div style={{color:C.muted,fontSize:12,padding:20,textAlign:"center"}}>No invoices{invFrom||invTo?" in this date range":""}</div>}
              {filtered.map(inv=>{
                const sc = inv.status==="paid"?C.green:inv.status==="cancelled"?C.muted:C.red;
                return (
                  <div key={inv.id} style={{background:C.bg,borderRadius:10,padding:"12px 14px",marginBottom:6,
                    border:`1px solid ${inv.status==="unpaid"?C.red+"44":C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:13,fontWeight:700,color:C.text}}>{inv.invoice_no}</span>
                          <span style={{fontSize:9,fontWeight:800,color:sc,background:sc+"22",padding:"2px 6px",
                            borderRadius:4,textTransform:"uppercase"}}>{inv.status}</span>
                          <span style={{fontSize:9,color:C.muted,background:C.card2,padding:"2px 6px",
                            borderRadius:4,textTransform:"uppercase"}}>{inv.type}</span>
                        </div>
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                          {inv.invoice_date} · {inv.billing_period}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:15,fontWeight:800,color:inv.status==="paid"?C.green:C.text}}>
                          ₹{(+inv.total_amount||0).toLocaleString("en-IN")}
                        </div>
                        <div style={{fontSize:9,color:C.muted}}>
                          Base ₹{(+inv.base_amount||0).toLocaleString("en-IN")} + GST ₹{(+inv.gst_amount||0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                    {inv.status==="paid" && inv.paid_ref && (
                      <div style={{fontSize:10,color:C.green,marginTop:4}}>✅ Paid: {inv.paid_date} · Ref: {inv.paid_ref}</div>
                    )}
                    {inv.status==="unpaid" && (
                      <div style={{display:"flex",gap:6,marginTop:8}}>
                        <Btn small color={C.green} onClick={()=>markPaid(inv)}>✅ Mark Paid</Btn>
                        <Btn small outline color={C.accent} onClick={()=>openInvoicePDF(inv, form)}>📄 Invoice</Btn>
                        <Btn small outline color={C.red} onClick={()=>cancelInvoice(inv)}>Cancel</Btn>
                      </div>
                    )}
                    {inv.status==="paid" && (
                      <div style={{display:"flex",gap:6,marginTop:8}}>
                        <Btn small outline color={C.accent} onClick={()=>openInvoicePDF(inv, form)}>📄 Invoice</Btn>
                      </div>
                    )}
                  </div>
                );
              })}
            </>);
          })()}
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
  const[featureDefs,setFeatureDefs]=useState([]);
  const[subPayments,setSubPayments]=useState([]);
  const[allInvoices,setAllInvoices]=useState([]);
  const[showBillingReport,setShowBillingReport]=useState(false);
  const[reportFrom,setReportFrom]=useState(new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split("T")[0]);
  const[reportTo,setReportTo]=useState(new Date().toISOString().split("T")[0]);
  const load=useCallback(async()=>{
    const{data:cl}=await adminSupabase.from("clients").select("*").order("onboarded_at",{ascending:false});setClients(cl||[]);
    const{data:feats}=await adminSupabase.from("client_features").select("*");const map={};(feats||[]).forEach(f=>{if(!map[f.client_id])map[f.client_id]={};map[f.client_id][f.feature]=f.enabled;});setAllFeatures(map);
    const{data:defs}=await adminSupabase.from("feature_definitions").select("*").eq("active",true).order("sort_order");setFeatureDefs(defs||[]);
    const som=new Date();som.setDate(1);som.setHours(0,0,0,0);const{data:scans}=await adminSupabase.from("client_scans").select("client_id").gte("scanned_at",som.toISOString());const counts={};(scans||[]).forEach(s=>{counts[s.client_id]=(counts[s.client_id]||0)+1;});setScanCounts(counts);
    const{data:payments}=await adminSupabase.from("subscription_payments").select("*").order("submitted_at",{ascending:false}).limit(50);setSubPayments(payments||[]);
    const{data:invs}=await adminSupabase.from("subscription_invoices").select("*").order("created_at",{ascending:false});setAllInvoices(invs||[]);
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
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>setShowBillingReport(!showBillingReport)} small outline color={showBillingReport?C.accent:C.muted}>
          {showBillingReport?"✕ Close":"📊 Billing Report"}
        </Btn>
        <Btn onClick={()=>setAdding(true)} color={C.green} small>➕ Add Transporter</Btn>
      </div>
    </div>

    {/* ═══ GLOBAL BILLING REPORT ═══ */}
    {showBillingReport&&(
      <div style={{padding:"0 20px 16px"}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:14,fontWeight:800,color:C.accent,marginBottom:12}}>📊 Billing Report</div>
          {/* Date filters */}
          <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
            <div><div style={{fontSize:9,color:C.muted,fontWeight:700}}>FROM</div><input type="date" value={reportFrom} onChange={e=>setReportFrom(e.target.value)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12}}/></div>
            <div><div style={{fontSize:9,color:C.muted,fontWeight:700}}>TO</div><input type="date" value={reportTo} onChange={e=>setReportTo(e.target.value)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",color:C.text,fontSize:12}}/></div>
            <Btn small outline color={C.muted} onClick={()=>{const d=new Date();setReportFrom(new Date(d.getFullYear(),d.getMonth(),1).toISOString().split("T")[0]);setReportTo(d.toISOString().split("T")[0]);}}>This Month</Btn>
            <Btn small outline color={C.muted} onClick={()=>{const d=new Date();const fy=d.getMonth()>=3?d.getFullYear():d.getFullYear()-1;setReportFrom(`${fy}-04-01`);setReportTo(d.toISOString().split("T")[0]);}}>This FY</Btn>
            <Btn small outline color={C.muted} onClick={()=>{setReportFrom("2020-01-01");setReportTo("2030-12-31");}}>All Time</Btn>
          </div>
          {(()=>{
            const filtered = allInvoices.filter(i=>i.invoice_date>=reportFrom && i.invoice_date<=reportTo);
            const totalBilled = filtered.reduce((s,i)=>s+(+i.total_amount||0),0);
            const totalPaid = filtered.filter(i=>i.status==="paid").reduce((s,i)=>s+(+i.total_amount||0),0);
            const totalUnpaid = filtered.filter(i=>i.status==="unpaid").reduce((s,i)=>s+(+i.total_amount||0),0);
            const totalGST = filtered.reduce((s,i)=>s+(+i.gst_amount||0),0);
            // Group by client
            const byClient = {};
            filtered.forEach(i=>{const cn=clients.find(c=>c.id===i.client_id)?.name||"Unknown";if(!byClient[cn])byClient[cn]={billed:0,paid:0,unpaid:0,count:0};byClient[cn].count++;byClient[cn].billed+=(+i.total_amount||0);if(i.status==="paid")byClient[cn].paid+=(+i.total_amount||0);if(i.status==="unpaid")byClient[cn].unpaid+=(+i.total_amount||0);});
            return (<>
              {/* Summary */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.accent}}>{fmt(totalBilled)}</div><div style={{fontSize:9,color:C.muted}}>BILLED ({filtered.length})</div></div>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.green}}>{fmt(totalPaid)}</div><div style={{fontSize:9,color:C.muted}}>COLLECTED</div></div>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:totalUnpaid>0?C.red:C.green}}>{fmt(totalUnpaid)}</div><div style={{fontSize:9,color:C.muted}}>OUTSTANDING</div></div>
                <div style={{background:C.bg,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.teal}}>{fmt(totalGST)}</div><div style={{fontSize:9,color:C.muted}}>GST COLLECTED</div></div>
              </div>
              {/* Per-client breakdown */}
              <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Per Client</div>
              {Object.entries(byClient).map(([name,d])=>(
                <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:C.bg,borderRadius:6,marginBottom:4,fontSize:12}}>
                  <span style={{fontWeight:600,color:C.text}}>{name} <span style={{color:C.muted,fontWeight:400}}>({d.count})</span></span>
                  <div style={{display:"flex",gap:16}}>
                    <span style={{color:C.accent}}>{fmt(d.billed)}</span>
                    <span style={{color:C.green}}>{fmt(d.paid)}</span>
                    {d.unpaid>0&&<span style={{color:C.red}}>{fmt(d.unpaid)} due</span>}
                  </div>
                </div>
              ))}
              {/* Invoice table */}
              <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginTop:12,marginBottom:6}}>Invoices ({filtered.length})</div>
              <div style={{maxHeight:300,overflowY:"auto"}}>
                {filtered.map(inv=>{
                  const cl=clients.find(c=>c.id===inv.client_id);const sc=inv.status==="paid"?C.green:inv.status==="cancelled"?C.muted:C.red;
                  return(
                    <div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderBottom:`1px solid ${C.border}33`,fontSize:12}}>
                      <div style={{flex:1}}>
                        <span style={{fontWeight:700,marginRight:8}}>{inv.invoice_no}</span>
                        <span style={{color:C.muted}}>{cl?.name||"—"}</span>
                        <span style={{fontSize:9,color:sc,marginLeft:6,fontWeight:700}}>{inv.status.toUpperCase()}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{color:C.text,fontWeight:600}}>{fmt(inv.total_amount)}</span>
                        <span style={{color:C.muted,fontSize:10}}>{inv.invoice_date}</span>
                        <span onClick={(e)=>{e.stopPropagation();openInvoicePDF(inv,cl||{});}} style={{cursor:"pointer",fontSize:10,color:C.accent}}>📄</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Print report button */}
              <div style={{marginTop:12,textAlign:"center"}}>
                <Btn small outline color={C.accent} onClick={()=>{
                  const rows=filtered.map(i=>`<tr><td>${i.invoice_no}</td><td>${clients.find(c=>c.id===i.client_id)?.name||""}</td><td>${i.invoice_date}</td><td>${i.type}</td><td style="text-align:right">${fmt(i.base_amount)}</td><td style="text-align:right">${fmt(i.gst_amount)}</td><td style="text-align:right"><b>${fmt(i.total_amount)}</b></td><td>${i.status}</td><td>${i.paid_ref||"—"}</td></tr>`).join("");
                  const html=`<!DOCTYPE html><html><head><title>Billing Report</title><style>*{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#f1f5f9;text-align:left}h2{color:#1565c0}.summary{display:flex;gap:20px;margin:12px 0}.summary div{text-align:center}.summary .n{font-size:18px;font-weight:800}@media print{button{display:none!important}}</style></head><body><h2>M Yantra — Billing Report</h2><p>${reportFrom} to ${reportTo}</p><div class="summary"><div><div class="n">${fmt(totalBilled)}</div>Billed</div><div><div class="n" style="color:green">${fmt(totalPaid)}</div>Collected</div><div><div class="n" style="color:${totalUnpaid>0?"red":"green"}">${fmt(totalUnpaid)}</div>Outstanding</div><div><div class="n" style="color:teal">${fmt(totalGST)}</div>GST</div></div><table><tr><th>Invoice</th><th>Client</th><th>Date</th><th>Type</th><th>Base</th><th>GST</th><th>Total</th><th>Status</th><th>Ref</th></tr>${rows}</table><br/><button onclick="window.print()" style="background:#1565c0;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:13px">🖨 Print</button></body></html>`;
                  const w=window.open("","_blank","width=900,height=700");w.document.write(html);w.document.close();
                }}>🖨 Print Report</Btn>
              </div>
            </>);
          })()}
        </div>
      </div>
    )}

    {/* ── Pending Payment Reviews ── */}
    {(()=>{
      const pending = subPayments.filter(p=>p.status==="pending");
      if(pending.length===0) return null;
      const approvePayment = async (pay) => {
        const cl = clients.find(c=>c.id===pay.client_id);
        if(!cl) return;
        // Calculate next paid_until based on billing cycle
        const cycle = cl.billing_cycle || "monthly";
        const base = cl.paid_until ? new Date(cl.paid_until) : new Date();
        const from = base < new Date() ? new Date() : base;
        const next = new Date(from);
        if(cycle==="yearly") next.setFullYear(next.getFullYear()+1);
        else if(cycle==="quarterly") next.setMonth(next.getMonth()+3);
        else next.setMonth(next.getMonth()+1);
        const nextStr = next.toISOString().split("T")[0];

        if(!window.confirm(`Approve ₹${(pay.amount||0).toLocaleString("en-IN")} from ${cl.name}?\n\nPaid until will be set to: ${nextStr}\n\nProceed?`)) return;
        await adminSupabase.from("subscription_payments").update({status:"approved",reviewed_at:new Date().toISOString(),reviewed_by:admin.name}).eq("id",pay.id);
        await adminSupabase.from("clients").update({paid_until:nextStr,last_payment_date:pay.payment_date||new Date().toISOString().split("T")[0],last_payment_amount:pay.amount,last_payment_ref:pay.utr||""}).eq("id",pay.client_id);
        // Auto-mark the latest unpaid invoice as paid
        const{data:unpaidInvs}=await adminSupabase.from("subscription_invoices").select("id").eq("client_id",pay.client_id).eq("status","unpaid").order("created_at",{ascending:false}).limit(1);
        if(unpaidInvs&&unpaidInvs[0]){
          await adminSupabase.from("subscription_invoices").update({status:"paid",paid_date:new Date().toISOString().split("T")[0],paid_amount:pay.amount,paid_ref:pay.utr||"",payment_id:pay.id}).eq("id",unpaidInvs[0].id);
        }
        load();
      };
      const rejectPayment = async (pay) => {
        const reason = window.prompt("Rejection reason:");
        if(reason===null) return;
        await adminSupabase.from("subscription_payments").update({status:"rejected",notes:reason,reviewed_at:new Date().toISOString(),reviewed_by:admin.name}).eq("id",pay.id);
        load();
      };
      return (
        <div style={{padding:"0 20px 12px"}}>
          <div style={{background:"#451a03",border:"1px solid #f59e0b55",borderRadius:12,padding:16}}>
            <div style={{fontSize:14,fontWeight:800,color:"#fbbf24",marginBottom:12}}>💳 Pending Payment Reviews ({pending.length})</div>
            {pending.map(pay=>{
              const cl = clients.find(c=>c.id===pay.client_id);
              return (
                <div key={pay.id} style={{background:"#1e293b",borderRadius:10,padding:14,marginBottom:8,border:"1px solid #334155"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{cl?.name||"Unknown"}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{cl?.plan} plan · {cl?.billing_cycle||"monthly"}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:18,fontWeight:800,color:"#34d399"}}>₹{(pay.amount||0).toLocaleString("en-IN")}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{pay.utr||"No UTR"} · {pay.payment_date||"—"}</div>
                    </div>
                  </div>
                  {pay.screenshot_base64 && (
                    <div style={{marginBottom:8,textAlign:"center"}}>
                      <img src={pay.screenshot_base64} alt="Payment proof" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,border:"1px solid #334155"}}/>
                    </div>
                  )}
                  {pay.notes&&<div style={{fontSize:11,color:"#94a3b8",marginBottom:8}}>Note: {pay.notes}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={()=>approvePayment(pay)} color={C.green} full small>✅ Approve & Activate</Btn>
                    <Btn onClick={()=>rejectPayment(pay)} color={C.red} outline small>❌ Reject</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })()}
    <div style={{padding:"0 20px 40px"}}>
      {clients.map(c=>{const feats=allFeatures[c.id]||{};const ec=Object.values(feats).filter(Boolean).length;const scans=scanCounts[c.id]||0;const sp=c.scans_included?Math.round((scans/c.scans_included)*100):0;const isPaid=c.payment_bypass||(c.monthly_fee===0)||!!(c.paid_until&&new Date(c.paid_until)>=new Date());const isOverdue=!c.payment_bypass&&(c.monthly_fee||0)>0&&(!c.paid_until||new Date(c.paid_until)<new Date());
        return(<div key={c.id} onClick={()=>setEditing(c)} style={{background:C.card,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer",border:`1px solid ${isOverdue?C.red+"55":C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              {c.logo_base64?<img src={c.logo_base64} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>:<div style={{width:28,height:28,borderRadius:"50%",background:c.accent_color||C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff"}}>{c.company_short||c.name?.slice(0,2)||"?"}</div>}
              <span style={{fontSize:15,fontWeight:700}}>{c.name}</span><Badge label={c.status} color={sc(c.status)}/><Badge label={c.plan||"basic"} color={pc(c.plan)}/>
              {isOverdue&&<Badge label="PAYMENT DUE" color={C.red}/>}
              {c.payment_bypass&&<Badge label="BYPASS" color={C.orange}/>}
            </div>
            <div style={{fontSize:11,color:C.muted}}>{c.owner_name||"—"} · {c.phone||"—"} · {c.subdomain||c.netlify_site||"no domain"}{c.paid_until?` · Paid until: ${c.paid_until}`:""}</div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.accent}}>{ec}</div><div style={{fontSize:9,color:C.muted}}>FEATURES</div></div>
            <div style={{textAlign:"center",minWidth:60}}><div style={{fontSize:16,fontWeight:800,color:sp>90?C.red:sp>70?C.orange:C.green}}>{scans}</div><div style={{fontSize:9,color:C.muted}}>/{c.scans_included||50} SCANS</div><div style={{height:3,background:C.card2,borderRadius:2,marginTop:3}}><div style={{height:3,borderRadius:2,width:`${Math.min(100,sp)}%`,background:sp>90?C.red:sp>70?C.orange:C.green}}/></div></div>
            <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:C.teal}}>{fmt(c.monthly_fee||0)}</div><div style={{fontSize:9,color:C.muted}}>/ MONTH</div></div>
          </div>
        </div>);})}
      {clients.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted}}>No transporters yet.</div>}
    </div>
    {editing&&<ClientEditor client={editing} features={allFeatures[editing.id]||{}} featureDefs={featureDefs} onSave={()=>{setEditing(null);load();}} onClose={()=>setEditing(null)}/>}
    {adding&&<AddClientModal featureDefs={featureDefs} onSave={()=>{setAdding(false);load();}} onClose={()=>setAdding(false)}/>}
  </div>);
}
