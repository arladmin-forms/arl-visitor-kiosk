import { useState, useRef, useEffect, useCallback } from "react";

// AR Hexagon Logo as SVG component
function ARLogo({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" fill="#1a1a2e" />
      <text x="50" y="62" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="38" fontWeight="700" fill="white" letterSpacing="-1">AR</text>
    </svg>
  );
}

// Signature Pad Component
function SignaturePad({ onSave, label }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };
  const startDraw = (e) => { e.preventDefault(); setDrawing(true); setHasDrawn(true); lastPos.current = getPos(e); };
  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos;
  };
  const endDraw = () => setDrawing(false);
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontSize: 13, color: "#8a8a9a", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
      <div style={{ border: "2px solid #d0d0e0", borderRadius: 12, overflow: "hidden", background: "#fafaff", position: "relative" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: 150, touchAction: "none", cursor: "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
        {!hasDrawn && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#c0c0d0", fontSize: 15, fontFamily: "'DM Sans', sans-serif", pointerEvents: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0c0d0" strokeWidth="2"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Sign here with finger or stylus
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={clear} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #d0d0e0", background: "white", color: "#666", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Clear</button>
        <button onClick={() => hasDrawn && onSave(canvasRef.current.toDataURL())} disabled={!hasDrawn} style={{
          padding: "8px 24px", borderRadius: 8, border: "none", background: hasDrawn ? "#1a1a2e" : "#d0d0e0", color: "white", fontSize: 13,
          cursor: hasDrawn ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s"
        }}>Accept & Sign</button>
      </div>
    </div>
  );
}

// "Other" purpose modal
function OtherPurposeModal({ onSave, onClose }) {
  const [text, setText] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Purpose of Visit</h3>
        <p style={{ fontSize: 14, color: "#8a8a9a", marginBottom: 18, fontFamily: "'DM Sans', sans-serif" }}>Please describe the purpose of your visit:</p>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter purpose of visit..."
          style={{ width: "100%", minHeight: 100, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0e0ea", fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", background: "#fafaff", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #d0d0e0", background: "white", color: "#666", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={() => text.trim() && onSave(text.trim())} disabled={!text.trim()} style={{
            flex: 1, padding: "12px", borderRadius: 10, border: "none", background: text.trim() ? "#1a1a2e" : "#d0d0e0", color: "white", fontSize: 14,
            cursor: text.trim() ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif"
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// Email status banner
function EmailStatus({ status, message }) {
  if (!status) return null;
  const colors = { sending: { bg: "#fff8e6", border: "#ffd866", text: "#8a6d00" }, success: { bg: "#e8fae8", border: "#66d466", text: "#2a7a2a" }, error: { bg: "#fae8e8", border: "#d46666", text: "#7a2a2a" } };
  const c = colors[status];
  return (
    <div style={{ padding: "10px 16px", borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, fontSize: 13, color: c.text, fontFamily: "'DM Sans', sans-serif", marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
      {status === "sending" && "⏳"}
      {status === "success" && "✓"}
      {status === "error" && "⚠"}
      {message}
    </div>
  );
}

export default function VisitorKiosk() {
  const STEPS = ["welcome", "info", "nda", "emailOptIn", "complete"];
  const [step, setStep] = useState("welcome");
  const [mode, setMode] = useState("signin");
  const [transitioning, setTransitioning] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", company: "", email: "", hostName: "", purpose: "" });
  const [otherPurpose, setOtherPurpose] = useState("");
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [signature, setSignature] = useState(null);
  const [emailOptIn, setEmailOptIn] = useState(null);
  const [signOutEmail, setSignOutEmail] = useState("");
  const [signOutDone, setSignOutDone] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailMsg, setEmailMsg] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const goTo = useCallback((next) => { setTransitioning(true); setTimeout(() => { setStep(next); setTransitioning(false); }, 300); }, []);

  const resetAll = () => {
    setFormData({ firstName: "", lastName: "", company: "", email: "", hostName: "", purpose: "" });
    setOtherPurpose(""); setNdaAgreed(false); setSignature(null); setEmailOptIn(null);
    setSignOutEmail(""); setSignOutDone(false); setEmailStatus(null); setEmailMsg(""); setMode("signin");
    goTo("welcome");
  };

  // ─── CONFIGURATION ───────────────────────────────────────────
  // API endpoint — uses same domain since backend is deployed together
  const API_BASE_URL = "";
  // ─────────────────────────────────────────────────────────────

  const sendNotificationEmail = async (data) => {
    setEmailStatus("sending");
    setEmailMsg("Sending notification to ARL team...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/notify-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          email: data.email,
          hostName: data.hostName,
          purpose: data.purpose === "Other" ? `Other: ${otherPurpose}` : data.purpose,
          emailOptIn: data.emailOptIn,
          signature: data.signature,
        }),
      });

      if (!response.ok) throw new Error("Send failed");

      setEmailStatus("success");
      setEmailMsg("Notification sent to Jared@aboverinaldilabs.com");
    } catch (err) {
      console.error("Email notification error:", err);
      setEmailStatus("error");
      setEmailMsg("Could not send notification. Please inform your host directly.");
    }
  };

  const handleSignIn = async () => {
    goTo("complete");
    const data = { ...formData, emailOptIn, signature };
    await sendNotificationEmail(data);
  };

  const handleSignOut = () => setSignOutDone(true);

  const purposeDisplay = formData.purpose === "Other" ? `Other: ${otherPurpose}` : formData.purpose;
  const isFormValid = formData.firstName && formData.lastName && formData.company && formData.email && formData.hostName && formData.purpose && (formData.purpose !== "Other" || otherPurpose);

  const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const cs = {
    wrap: { minHeight: "100vh", background: "linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 60%, #0f0f1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
    card: { background: "rgba(255,255,255,0.97)", borderRadius: 28, padding: step === "welcome" ? "48px 44px" : "36px 40px", maxWidth: step === "welcome" ? 520 : 600, width: "100%", boxShadow: "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)", opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(12px) scale(0.98)" : "translateY(0) scale(1)", transition: "opacity 0.3s ease, transform 0.3s ease", position: "relative", zIndex: 2, maxHeight: "92vh", overflowY: "auto" },
    input: { width: "100%", padding: "13px 16px", borderRadius: 10, border: "1.5px solid #e0e0ea", fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: "#1a1a2e", background: "#fafaff", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
    label: { fontSize: 12.5, fontWeight: 600, color: "#6a6a8a", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" },
  };
  const primaryBtn = (disabled) => ({ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: disabled ? "#c0c0d0" : "linear-gradient(135deg, #1a1a2e, #2a2a4e)", color: "white", fontSize: 16, fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em", transition: "all 0.2s", boxShadow: disabled ? "none" : "0 4px 16px rgba(26,26,46,0.3)" });
  const secondaryBtn = { width: "100%", padding: "15px", borderRadius: 12, border: "1.5px solid #d0d0e0", background: "white", color: "#3a3a4a", fontSize: 16, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" };

  const ndaSections = [
    { title: null, text: `THIS MUTUAL NON-DISCLOSURE AGREEMENT (the "Agreement") is dated effective as of the date of digital signature below (the "Effective Date") by and between the undersigned visitor ("Customer") and Above Rinaldi Laboratories Inc., having offices located at 19821 Nordhoff Place., Suite 112, Chatsworth, CA 91311 ("ARL"). Customer and ARL are referred to herein individually as a "Party" and collectively as the "Parties."\n\nWHEREAS, the Parties intend to disclose to each other confidential information in connection with discussions of a potential business relationship relating to cosmeceutical, nutraceutical, personal care and wellness products for the health and beauty industry ("Purpose").\n\nNOW, THEREFORE, in consideration of the promises, mutual covenants and agreements set forth herein, and other good and valuable consideration, the receipt, sufficiency and adequacy of which are hereby acknowledged, the parties, intending to be legally bound, agree as follows:` },
    { title: "1. Definition.", text: `"Confidential Information" means all non-public proprietary or confidential information that is supplied by the disclosing Party ("Disclosing Party"), or its affiliates and their respective employees contractors and advisors ("Representatives"), during the term of this Agreement to either the Party receiving the information ("Receiving Party") or its Representatives, that is in oral, visual, written, electronic or other tangible or intangible form, whether or not marked or designated as confidential, and all notes, analyses, summaries and other materials prepared by Receiving Party or its Representatives that contain, are based on or otherwise reflect such information. Confidential Information includes all trade secrets and proprietary and confidential information and know-how relating to products, services, designs, software, documentation, strategies, pricing, employees, negotiations and contracts with other companies, permits, licenses, regulatory approvals, procedures, research, sources, customer lists, concepts, and any other subject matter pertaining to the business of the Disclosing Party, its affiliates and their clients, customers, suppliers, vendors or creditors. Confidential Information also includes the fact that the Parties are discussing the Purpose and the terms under discussion.` },
    { title: "2. Exclusions.", text: `Confidential Information does not include any information that: (a) is or becomes generally available to the public other than as a result of Receiving Party's or its Representatives' breach of this Agreement; (b) is obtained by Receiving Party or its Representatives on a non-confidential basis from a third-party that was not legally restricted from disclosing such information; (c) was in the Receiving Party's or its Representatives' possession prior to Disclosing Party's disclosure without restriction on use or disclosure; (d) was or is independently developed by Receiving Party or its Representatives without using any Confidential Information; or (e) is approved for release by written authorization of the Disclosing Party, but only to the extent of such authorization.` },
    { title: "3. Use and Disclosure.", text: `The Receiving Party shall (a) use the Confidential Information solely for the Purpose; (b) not disclose the Confidential Information other than to its Representatives who need access to Confidential Information for the Purpose, are informed of its confidential nature, and are bound by confidentiality obligations no less protective than this Agreement; (c) cause its Representatives to comply with this Agreement, and agree to be liable for their breach; and (d) safeguard the Confidential Information from unauthorized use, access or disclosure using at least the degree of care it uses to protect its similar information.` },
    { title: "4. Legal Disclosure.", text: `If Receiving Party or any of its Representatives is required by applicable law or a valid legal order to disclose any Confidential Information, Receiving Party shall notify Disclosing Party so that Disclosing Party may seek a protective order or other remedy. Receiving Party shall provide reasonable assistance in seeking such order. If Receiving Party remains legally compelled to make the disclosure, it may only disclose that required portion of the Confidential Information and must use reasonable efforts to ensure its confidential treatment.` },
    { title: "5. Return or Destruction.", text: `At the Disclosing Party's request, Receiving Party shall promptly return or destroy all Confidential Information in its and its Representatives' possession. Receiving Party may retain copies that are stored solely for archival or legal retention until its deletion in the ordinary course.` },
    { title: "6. No Obligation or License.", text: `This Agreement imposes no obligation on either Party to disclose any Confidential Information or to negotiate for, enter into or otherwise pursue the Purpose. Disclosing Party retains its entire right, title and interest in and to all Confidential Information, and no disclosure under this Agreement will be construed as a license, assignment or other transfer of any such right, title and interest to Receiving Party.` },
    { title: "7. Non-Solicitation; Non-Competition; Non-Disparagement.", text: `The Parties agree that during the term of this Agreement and for one year thereafter, it will not, directly or indirectly, for itself or on behalf of, or in conjunction with, any other person (a) hire or attempt to hire any person that is an employee of the Parties or was an employee within six months prior to the date of the termination of this Agreement; or (b) solicit, advise, or encourage any person, firm, government agency or corporation to withdraw, curtail or cancel its business with the Parties or attempt to engage in a direct business relationship with any Client introduced or referred to either Party during the term of this agreement, unless the engaging Party had a pre-existing business relationship with the Client or obtains prior written consent from the other Party.` },
    { title: "8. Term.", text: `The term of this Agreement will end 3 years after the Effective Date, but either Party may terminate this Agreement earlier with 30 days' written notice. Sections 1, 2, 3, 4, 5, 8 and 9 shall survive for 3 years after the effective date of such termination.` },
    { title: "9. Remedy.", text: `The Parties agree that money damages may not be a sufficient remedy for breach of this Agreement and that the Disclosing Party shall be entitled, without posting security, to injunctive or other equitable relief to remedy or forestall any such breach or threatened breach, in addition to other remedies available at law or in equity.` },
    { title: "10. Miscellaneous.", text: `Neither Party may assign any of its rights or delegate its performance arising under or relating to this Agreement to any unaffiliated third party without the prior written consent of the other Party. In the event of any dispute between ARL and Customer, such dispute shall be resolved by arbitration through JAMS using its Comprehensive Arbitration Rules and Procedures then in effect. The arbitration shall be before a single arbitrator in Los Angeles and shall be a final binding resolution. All matters arising from or relating to this Agreement shall be governed by the internal substantive laws of the State of California. This Agreement constitutes the final agreement between the Parties and supersedes all prior and contemporaneous negotiations and agreements relating to the subject matter of this Agreement.` },
  ];

  return (
    <div style={cs.wrap}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,90,239,0.12) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,80,200,0.08) 0%, transparent 70%)", bottom: -100, left: -80, pointerEvents: "none" }} />

      {showOtherModal && <OtherPurposeModal onSave={(t) => { setOtherPurpose(t); setShowOtherModal(false); }} onClose={() => { setFormData(p => ({ ...p, purpose: "" })); setShowOtherModal(false); }} />}

      {step !== "welcome" && step !== "complete" && (
        <button onClick={() => { const idx = STEPS.indexOf(step); if (idx > 1) goTo(STEPS[idx - 1]); else goTo("welcome"); }}
          style={{ position: "fixed", top: 24, left: 24, zIndex: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 18px", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg> Back
        </button>
      )}

      {step !== "welcome" && step !== "complete" && mode === "signin" && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {["info", "nda", "emailOptIn"].map((s, i) => (
            <div key={s} style={{ width: STEPS.indexOf(step) - 1 >= i ? 28 : 10, height: 6, borderRadius: 3, background: STEPS.indexOf(step) - 1 >= i ? "rgba(74,90,239,0.8)" : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />
          ))}
        </div>
      )}

      <div style={cs.card}>

        {/* WELCOME */}
        {step === "welcome" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ margin: "0 auto 20px" }}><ARLogo size={80} /></div>
            <p style={{ fontSize: 13, color: "#8a8a9a", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>Above Rinaldi Laboratories</p>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1a1a2e", marginBottom: 6, letterSpacing: "-0.02em" }}>Welcome, Visitor</h1>
            <p style={{ fontSize: 15, color: "#8a8a9a", marginBottom: 8 }}>{dateStr}</p>
            <p style={{ fontSize: 38, fontWeight: 300, color: "#4a5aef", marginBottom: 36, letterSpacing: "-0.02em" }}>{timeStr}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => { setMode("signin"); goTo("info"); }} style={primaryBtn(false)}>Sign In</button>
              <button onClick={() => { setMode("signout"); goTo("info"); }} style={secondaryBtn}>Sign Out</button>
            </div>
            <p style={{ fontSize: 12, color: "#b0b0c0", marginTop: 24 }}>All visitors must complete a Mutual NDA before entry</p>
          </div>
        )}

        {/* SIGN OUT */}
        {step === "info" && mode === "signout" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>Sign Out</h2>
            <p style={{ fontSize: 14, color: "#8a8a9a", marginBottom: 28 }}>Enter the email you used to sign in</p>
            {!signOutDone ? (
              <>
                <label style={cs.label}>Email Address</label>
                <input type="email" value={signOutEmail} onChange={e => setSignOutEmail(e.target.value)} placeholder="your@email.com" style={{ ...cs.input, marginBottom: 20 }} />
                <button onClick={handleSignOut} disabled={!signOutEmail} style={primaryBtn(!signOutEmail)}>Sign Out</button>
                <button onClick={resetAll} style={{ ...secondaryBtn, marginTop: 12 }}>Cancel</button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Signed Out Successfully</h3>
                <p style={{ fontSize: 14, color: "#8a8a9a", marginBottom: 28 }}>Thank you for visiting. Have a great day!</p>
                <button onClick={resetAll} style={primaryBtn(false)}>Return to Welcome</button>
              </div>
            )}
          </div>
        )}

        {/* VISITOR INFO */}
        {step === "info" && mode === "signin" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Visitor Information</h2>
            <p style={{ fontSize: 14, color: "#8a8a9a", marginBottom: 24 }}>Please provide your details below</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={cs.label}>First Name *</label>
                <input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} placeholder="Jane" style={cs.input} />
              </div>
              <div>
                <label style={cs.label}>Last Name *</label>
                <input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} placeholder="Smith" style={cs.input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={cs.label}>Company *</label>
                <input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" style={cs.input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={cs.label}>Email Address *</label>
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="jane@acme.com" style={cs.input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={cs.label}>Host Name *</label>
                <input value={formData.hostName} onChange={e => setFormData(p => ({ ...p, hostName: e.target.value }))} placeholder="Who are you visiting?" style={cs.input} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={cs.label}>Purpose of Visit *</label>
                <select value={formData.purpose} onChange={e => {
                  const v = e.target.value;
                  setFormData(p => ({ ...p, purpose: v }));
                  if (v === "Other") setShowOtherModal(true);
                  else setOtherPurpose("");
                }} style={{ ...cs.input, appearance: "auto" }}>
                  <option value="">Select purpose...</option>
                  <option value="Innovation Meeting">Innovation Meeting</option>
                  <option value="Facility Tour">Facility Tour</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Project Status Updates">Project Status Updates</option>
                  <option value="Other">Other</option>
                </select>
                {formData.purpose === "Other" && otherPurpose && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "#f0f0ff", borderRadius: 8, fontSize: 13, color: "#4a4a6a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{otherPurpose}</span>
                    <button onClick={() => setShowOtherModal(true)} style={{ background: "none", border: "none", color: "#4a5aef", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Edit</button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => goTo("nda")} disabled={!isFormValid} style={{ ...primaryBtn(!isFormValid), marginTop: 20 }}>Continue to NDA</button>
          </div>
        )}

        {/* NDA */}
        {step === "nda" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <ARLogo size={36} />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Mutual Non-Disclosure Agreement</h2>
                <p style={{ fontSize: 12, color: "#8a8a9a", margin: 0 }}>Confidential Information of Above Rinaldi Laboratories Inc.</p>
              </div>
            </div>

            <div style={{ background: "#fafaff", borderRadius: 14, padding: "24px 22px", overflowY: "auto", border: "1px solid #e8e8f0", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, lineHeight: 1.65, color: "#3a3a4a", maxHeight: 320 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#1a1a2e", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em" }}>Mutual Non-Disclosure Agreement</h3>
              {ndaSections.map((s, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  {s.title && <p style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{s.title}</p>}
                  <p style={{ marginBottom: 0, whiteSpace: "pre-line" }}>{s.text}</p>
                </div>
              ))}
              <div style={{ marginTop: 20, borderTop: "1px solid #e0e0ea", paddingTop: 16 }}>
                <p style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>IN WITNESS WHEREOF, the Parties hereby agree to the terms and conditions of this Agreement.</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6a6a8a" }}>
                  <div>
                    <p style={{ marginBottom: 2 }}>Customer:</p>
                    <p style={{ fontWeight: 600, color: "#1a1a2e" }}>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.company}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ marginBottom: 2 }}>Above Rinaldi Laboratories Inc.</p>
                    <p style={{ fontWeight: 600, color: "#1a1a2e" }}>Fred Khoury</p>
                    <p>President</p>
                  </div>
                </div>
              </div>
            </div>

            <label style={{
              display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#3a3a4a",
              padding: "12px 16px", borderRadius: 10, background: ndaAgreed ? "#eef0ff" : "#f5f5fa",
              border: ndaAgreed ? "1.5px solid #4a5aef" : "1.5px solid transparent",
              transition: "all 0.2s", marginTop: 14
            }}>
              <input type="checkbox" checked={ndaAgreed} onChange={e => setNdaAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: "#4a5aef", width: 18, height: 18 }} />
              <span>I have read, understood, and agree to the terms of this Mutual Non-Disclosure Agreement.</span>
            </label>

            {ndaAgreed && !signature && (
              <div style={{ marginTop: 14 }}>
                <SignaturePad onSave={sig => { setSignature(sig); setTimeout(() => goTo("emailOptIn"), 800); }} label="Your signature below confirms acceptance:" />
              </div>
            )}
            {signature && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#e8fae8", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#2a7a2a", marginTop: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a7a2a" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                Agreement signed successfully
              </div>
            )}
          </div>
        )}

        {/* EMAIL OPT-IN */}
        {step === "emailOptIn" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px", background: "linear-gradient(135deg, #4a5aef, #7a6af0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>Stay Connected</h2>
            <p style={{ fontSize: 14, color: "#8a8a9a", marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
              Would you like to receive updates about our latest innovations, events, and news?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380, margin: "0 auto" }}>
              <button onClick={() => setEmailOptIn("yes")} style={{
                padding: "16px 20px", borderRadius: 12, textAlign: "center",
                border: emailOptIn === "yes" ? "2px solid #4a5aef" : "1.5px solid #e0e0ea",
                background: emailOptIn === "yes" ? "#eef0ff" : "white", cursor: "pointer", transition: "all 0.2s"
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>Yes — Sign me up!</div>
              </button>
              <button onClick={() => setEmailOptIn("no")} style={{
                padding: "16px 20px", borderRadius: 12, textAlign: "center",
                border: emailOptIn === "no" ? "2px solid #4a5aef" : "1.5px solid #e0e0ea",
                background: emailOptIn === "no" ? "#eef0ff" : "white", cursor: "pointer", transition: "all 0.2s"
              }}>
                <div style={{ fontSize: 16, color: "#6a6a8a" }}>No — Not at this time</div>
              </button>
            </div>
            {emailOptIn && (
              <button onClick={handleSignIn} style={{ ...primaryBtn(false), maxWidth: 380, margin: "24px auto 0" }}>
                Complete Sign-In
              </button>
            )}
          </div>
        )}

        {/* COMPLETE */}
        {step === "complete" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>You're All Set!</h2>
            <p style={{ fontSize: 15, color: "#8a8a9a", marginBottom: 6 }}>Welcome, {formData.firstName}. Your host has been notified.</p>

            <div style={{ background: "#f5f5fa", borderRadius: 14, padding: "18px 24px", margin: "24px auto", maxWidth: 360, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Visit Summary</div>
              {[
                ["Name", `${formData.firstName} ${formData.lastName}`],
                ["Company", formData.company],
                ["Host", formData.hostName],
                ["Purpose", purposeDisplay],
                ["Signed In", new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })],
                ["NDA", "Signed ✓"],
                ["Newsletter", emailOptIn === "yes" ? "Subscribed ✓" : "Declined"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eaeaf0" }}>
                  <span style={{ fontSize: 13, color: "#6a6a8a" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                </div>
              ))}
            </div>

            <EmailStatus status={emailStatus} message={emailMsg} />

            <p style={{ fontSize: 13, color: "#b0b0c0", marginTop: 16, marginBottom: 24 }}>Please remember to sign out when you leave</p>
            <button onClick={resetAll} style={primaryBtn(false)}>Return to Welcome Screen</button>
          </div>
        )}
      </div>
    </div>
  );
}
