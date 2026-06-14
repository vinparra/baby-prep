import { useState } from "react";

const TASKS = [
  { section: "Healthcare & insurance", icon: "🏥", items: [
    { name: "Confirm OB/GYN or midwife and schedule first prenatal appointment", timing: "T1", tip: "Ask about group prenatal care options like Centering Pregnancy." },
    { name: "Notify health insurance of pregnancy and review maternity coverage", timing: "T1", tip: "Find out your deductible, out-of-pocket max, and which hospitals are in-network." },
    { name: "Understand your deductible, out-of-pocket max, and in-network hospitals", timing: "T1", tip: "Call your insurer and get specifics in writing." },
    { name: "Research and choose a pediatrician before the birth", timing: "T2", tip: "Most pediatricians offer free meet-and-greet appointments." },
    { name: "Schedule anatomy ultrasound (around 20 weeks)", timing: "T2", tip: "This scan checks for structural development and can reveal the sex if you want to know." },
    { name: "Complete glucose screening test (24–28 weeks)", timing: "T2", tip: "Screens for gestational diabetes. Eat normally beforehand." },
    { name: "Tour your birth hospital or birthing center", timing: "T2", tip: "Ask about parking, visitor policies, and what's included in the room." },
    { name: "Finalize birth plan and share with OB or midwife", timing: "T3", tip: "Keep it to one page. Include preferences for pain management, labor support, and immediate newborn care." },
    { name: "Pre-register at the hospital or birth center", timing: "T3", tip: "Doing this now saves precious time when you arrive in labor." },
    { name: "Schedule Group B Strep test (~36 weeks)", timing: "T3", tip: "A simple swab test — affects your IV antibiotic plan during labor if positive." },
    { name: "Confirm pediatrician accepts your insurance", timing: "T3", tip: "Call both the office and your insurer to double-check." },
    { name: "Add baby to health insurance within 30 days of birth", timing: "newborn", tip: "Missing this window is a big deal — it's a special enrollment period. Set a calendar reminder now." },
  ]},
  { section: "Budget & finances", icon: "💰", items: [
    { name: "Create a new baby budget covering diapers, formula/breastfeeding, childcare", timing: "T1", tip: "Budget $15,000–$20,000+ for the first year. Childcare alone can be $15k–$30k annually in Chicago." },
    { name: "Review and update life insurance coverage", timing: "T1", tip: "Term life insurance is affordable and critical once you have a dependent." },
    { name: "Look into disability insurance for parental leave income protection", timing: "T1", tip: "Short-term disability can replace part of your income during leave if your employer doesn't offer full pay." },
    { name: "Research your FMLA and parental leave policy with your employer", timing: "T1", tip: "Illinois also has the Illinois Paid Leave Act — check what applies to you." },
    { name: "Open or fund a 529 college savings account", timing: "T2", tip: "Illinois residents get a state income tax deduction for contributions to the Bright Start plan." },
    { name: "Update or create your will and designate a guardian", timing: "T2", tip: "This is the single most important legal document for new parents." },
    { name: "Set aside emergency fund of 3–6 months of expenses", timing: "T2", tip: "A new baby is unpredictable — a cushion prevents debt spirals from unexpected costs." },
    { name: "File for tax credits like Child Tax Credit and Dependent Care FSA", timing: "newborn", tip: "The Child Tax Credit is $2,000/child. A Dependent Care FSA lets you use pre-tax dollars for childcare." },
    { name: "Apply for Social Security number for the baby", timing: "newborn", tip: "You can do this at the hospital at birth — it's the easiest time." },
  ]},
  { section: "Childcare & daycare", icon: "🍼", items: [
    { name: "Research childcare options — daycare, nanny, family, au pair", timing: "T1", tip: "Chicago daycare can have 6–18 month waitlists. Start researching immediately." },
    { name: "Tour daycare centers in your area — waitlists can be 6–12+ months", timing: "T1", tip: "Look for low staff turnover, cleanliness, and how caregivers interact with babies." },
    { name: "Get on daycare waitlists as early as possible", timing: "T1", tip: "Put yourself on multiple lists. You can always decline when the time comes." },
    { name: "Compare costs and get contracts reviewed", timing: "T2", tip: "Watch for deposit forfeiture clauses, illness policies, and rate increase terms." },
    { name: "If hiring a nanny, begin interviewing process", timing: "T2", tip: "Background checks, references, and a trial period are non-negotiables." },
    { name: "Finalize childcare arrangements and sign contracts", timing: "T3", tip: "Confirm your start date and ask about their settling-in process for newborns." },
    { name: "Set up Dependent Care FSA if available through your employer", timing: "T3", tip: "Max contribution is $5,000/year — covers daycare, nannies, and preschool." },
  ]},
  { section: "Nursery & home prep", icon: "🏠", items: [
    { name: "Decide on nursery room and start decluttering", timing: "T1", tip: "You don't need much space — a crib, dresser/changer combo, and a glider are the essentials." },
    { name: "Research and choose crib or bassinet and mattress", timing: "T2", tip: "The mattress matters more than the crib. Choose firm, flat, and breathable." },
    { name: "Paint or prep the nursery (avoid fumes — ventilate well)", timing: "T2", tip: "Use low-VOC paint and keep the room well-ventilated for a few days after painting." },
    { name: "Assemble crib, dresser, and changing table", timing: "T2", tip: "Anchor all furniture to the wall — tip-over accidents are a leading cause of injury." },
    { name: "Install baby monitors, outlet covers, and cabinet locks", timing: "T3", tip: "Video monitors with temperature readouts are especially useful." },
    { name: "Wash all baby clothes, bedding, and blankets in fragrance-free detergent", timing: "T3", tip: "Dreft or All Free & Clear are popular picks." },
    { name: "Organize and stock the changing station", timing: "T3", tip: "Stock with diapers, wipes, diaper cream, extra onesies, and a waterproof liner." },
    { name: "Install and inspect car seat — many fire stations offer free checks", timing: "T3", tip: "Infant seats must be rear-facing. Most are misinstalled — always get it checked." },
    { name: "Babyproof sharp corners and secure bookshelves to walls", timing: "T3", tip: "Even pre-mobile babies end up in surprising places fast." },
    { name: "Set up bassinet in your bedroom for the first few months", timing: "T3", tip: "AAP recommends room-sharing (not bed-sharing) for the first 6 months." },
  ]},
  { section: "What to buy", icon: "🛒", items: [
    { name: "Create a baby registry", timing: "T1", tip: "Do Target and Amazon — completion discounts are real savings after the shower." },
    { name: "Research and purchase infant car seat", timing: "T2", tip: "Chicco KeyFit, Graco SnugRide, and Britax B-Safe are consistently top-rated." },
    { name: "Purchase stroller — test it in-store if possible", timing: "T2", tip: "Think about Chicago winters and how it fits in your car. Folding ease matters a lot." },
    { name: "Baby carrier or wrap", timing: "T2", tip: "Ergobaby Embrace and Solly Baby Wrap are popular for newborns. Try before you buy." },
    { name: "Breast pump — often covered 100% by insurance", timing: "T2", tip: "Get a prescription from your OB and order through your insurer's preferred supplier." },
    { name: "Stock up on newborn and 0–3 month clothing", timing: "T2", tip: "Don't overbuy newborn size — many babies skip it entirely. 0–3 month goes much further." },
    { name: "White noise machine", timing: "T2", tip: "Hatch Rest is beloved for its sleep timer and gentle wake feature." },
    { name: "Baby bathtub and bath supplies", timing: "T3", tip: "The Puj Tub or 4moms Infant Tub are popular newborn picks." },
    { name: "Bottles, nipples, and bottle brush — even if breastfeeding", timing: "T3", tip: "Try a few different brands before committing — babies can be picky about nipple flow." },
    { name: "Diapers and wipes — don't overbuy newborn size", timing: "T3", tip: "Get one pack of newborn, then stock size 1 and 2. Huggies and Pampers are staples." },
    { name: "Swaddle blankets and sleep sacks", timing: "T3", tip: "HALO SleepSack and Aden + Anais muslin swaddles are crowd favorites." },
    { name: "Diaper bag stocked and ready to go", timing: "T3", tip: "Pack extra outfits, diapers, wipes, a changing pad, snacks for you, and a burp cloth." },
    { name: "Thermometer, nasal aspirator, and baby nail file", timing: "T3", tip: "Frida Baby NoseFrida and their nail kit are practically cult items for new parents." },
    { name: "Formula on hand as backup even if planning to breastfeed", timing: "T3", tip: "Supply can be unpredictable in the early days. Having some on hand reduces stress." },
  ]},
  { section: "Birthing & parenting classes", icon: "📚", items: [
    { name: "Enroll in childbirth or Lamaze class — fills up quickly", timing: "T2", tip: "Your hospital likely offers classes. Also check Lamaze.org and local doulas." },
    { name: "Take a breastfeeding class or consult a lactation consultant", timing: "T2", tip: "Many insurance plans cover lactation consultant visits. Book one before the birth too." },
    { name: "Take an infant CPR and first aid class", timing: "T2", tip: "American Red Cross and local hospitals offer hands-on classes. Bring your partner." },
    { name: "Take a newborn care class — bathing, swaddling, diapering", timing: "T3", tip: "Even 2 hours of practice before birth makes the first week dramatically calmer." },
  ]},
  { section: "Go bag & hospital prep", icon: "🎒", items: [
    { name: "Start researching what to pack in your hospital bag", timing: "T2", tip: "Pack separately for mom, partner, and baby — three zones makes it easy to find things." },
    { name: "Pack the hospital go bag", timing: "T3", tip: "For mom: lip balm, hair ties, slippers, snacks, phone charger, toiletries. For baby: first outfit, swaddle, car seat." },
    { name: "Save the hospital's number and know the route", timing: "T3", tip: "Do a practice drive, especially to know the parking situation at night." },
    { name: "Arrange pet or child care for during labor", timing: "T3", tip: "Have a backup person lined up — labor doesn't always give you much notice." },
    { name: "Set up a contact list to notify after birth", timing: "T3", tip: "Designate one person to spread the news so you're not texting 40 people while recovering." },
    { name: "Discuss and confirm your support person and birth team", timing: "T3", tip: "A doula can significantly reduce labor duration and C-section rates." },
  ]},
  { section: "Self-care & wellbeing", icon: "💚", items: [
    { name: "Start or continue prenatal vitamins with folic acid, DHA, and iron", timing: "T1", tip: "Take with food to reduce nausea. DHA supports baby's brain development." },
    { name: "Review all medications with your OB for safety during pregnancy", timing: "T1", tip: "This includes supplements, OTC meds, and anything herbal." },
    { name: "Discuss mental health and postpartum depression awareness with your OB", timing: "T2", tip: "Postpartum depression affects 1 in 5 new mothers. Having a plan makes a real difference." },
    { name: "Arrange meal prep or meal delivery for postpartum recovery", timing: "T3", tip: "Set up a meal train with friends/family, or subscribe to a delivery service for the first month." },
    { name: "Identify a postpartum support network — family, friends, or doula", timing: "T3", tip: "A postpartum doula can help with night feeds, baby care, and household tasks." },
    { name: "Schedule your postpartum OB check-up in advance", timing: "T3", tip: "The standard is 6 weeks, but ask about an earlier check-in at 2–3 weeks if you need it." },
  ]},
  { section: "Legal & admin", icon: "📋", items: [
    { name: "Update beneficiaries on all accounts — 401k, IRA, life insurance", timing: "T1", tip: "This is separate from your will. Beneficiary designations on accounts override the will." },
    { name: "Update or create your will", timing: "T2", tip: "An estate attorney can do this for $500–$2,000. Online services like Trust & Will are cheaper." },
    { name: "Designate a legal guardian for the baby in your will", timing: "T2", tip: "Talk to your chosen guardian first — make sure they're willing and prepared." },
    { name: "Prepare FMLA and parental leave paperwork with HR", timing: "T3", tip: "Give HR at least 30 days notice. FMLA requires 12 months of employment to qualify." },
    { name: "Register baby's birth and obtain birth certificate", timing: "newborn", tip: "Usually done at the hospital. You'll need this for everything — insurance, passport, school." },
    { name: "Apply for baby's Social Security number at the hospital or SSA", timing: "newborn", tip: "Doing it at the hospital is the fastest option." },
    { name: "Update auto and home or renter's insurance if needed", timing: "newborn", tip: "Your home policy may cover baby items. Check if you need riders for expensive gear." },
  ]},
];

const TIMING_META = {
  T1: { label: "1st trimester", weeks: "Weeks 1–12", color: "#0F6E56", bg: "#E1F5EE", dot: "#1D9E75" },
  T2: { label: "2nd trimester", weeks: "Weeks 13–26", color: "#185FA5", bg: "#E6F1FB", dot: "#378ADD" },
  T3: { label: "3rd trimester", weeks: "Weeks 27–40", color: "#854F0B", bg: "#FAEEDA", dot: "#EF9F27" },
  newborn: { label: "After birth", weeks: "First 30 days", color: "#3C3489", bg: "#EEEDFE", dot: "#7F77DD" },
};

const STORAGE_KEY = "baby_prep_v2";

function loadChecked() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
function saveChecked(c) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* storage unavailable */ }
}

export default function App() {
  const [checked, setChecked] = useState(loadChecked);
  const [filter, setFilter] = useState("all");
  const [openSections, setOpenSections] = useState(() => {
    const o = {}; TASKS.forEach(t => o[t.section] = true); return o;
  });
  const [activeTip, setActiveTip] = useState(null);
  const [view, setView] = useState("checklist"); // checklist | timeline

  const allIds = TASKS.flatMap(s => s.items.map((_, i) => `${s.section}||${i}`));
  const totalCount = allIds.length;
  const doneCount = allIds.filter(id => checked[id]).length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  function toggle(id) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveChecked(next);
  }

  function toggleSection(sec) {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  }

  const filterOptions = [
    { key: "all", label: "All tasks" },
    { key: "T1", label: "1st trimester" },
    { key: "T2", label: "2nd trimester" },
    { key: "T3", label: "3rd trimester" },
    { key: "newborn", label: "After birth" },
  ];

  const progressColor = pct < 33 ? "#378ADD" : pct < 66 ? "#EF9F27" : "#1D9E75";

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "20px 24px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>
                🌱 Baby prep plan
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                {doneCount} of {totalCount} tasks complete
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["checklist", "timeline"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "7px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: view === v ? "none" : "1px solid #ddd",
                  background: view === v ? "#1a1a1a" : "#fff",
                  color: view === v ? "#fff" : "#555", fontWeight: 500,
                }}>
                  {v === "checklist" ? "✓ Checklist" : "📅 Timeline"}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: "#F0EFEA", borderRadius: 6, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: progressColor, borderRadius: 6, transition: "width 0.4s ease, background 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#aaa" }}>
              <span>0%</span><span style={{ color: progressColor, fontWeight: 600 }}>{pct}% done</span><span>100%</span>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {filterOptions.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                border: filter === f.key ? "none" : "1px solid #ddd",
                background: filter === f.key ? "#1a1a1a" : "#fff",
                color: filter === f.key ? "#fff" : "#555", fontWeight: filter === f.key ? 600 : 400,
                flexShrink: 0,
              }}>
                {f.key !== "all" && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: TIMING_META[f.key]?.dot, marginRight: 6 }} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 24px 60px" }}>

        {view === "checklist" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TASKS.map(section => {
              const filtered = filter === "all" ? section.items : section.items.filter(i => i.timing === filter);
              if (!filtered.length) return null;
              const sectionDone = filtered.filter((_, i) => {
                const realIdx = section.items.indexOf(filtered[i]);
                return checked[`${section.section}||${realIdx}`];
              }).length;
              const isOpen = openSections[section.section];
              const allDone = sectionDone === filtered.length;

              return (
                <div key={section.section} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
                  {/* Section header */}
                  <button onClick={() => toggleSection(section.section)} style={{
                    width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
                    background: allDone ? "#F6FBF7" : "#fff", border: "none", cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 20 }}>{section.icon}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{section.section}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12,
                      background: allDone ? "#E1F5EE" : "#F0EFEA",
                      color: allDone ? "#0F6E56" : "#888",
                    }}>
                      {sectionDone}/{filtered.length}
                    </span>
                    <span style={{ fontSize: 16, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                  </button>

                  {/* Tasks */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid #F0EFEA" }}>
                      {filtered.map((item) => {
                        const realIdx = section.items.indexOf(item);
                        const id = `${section.section}||${realIdx}`;
                        const isDone = !!checked[id];
                        const meta = TIMING_META[item.timing];
                        const showTip = activeTip === id;

                        return (
                          <div key={id} style={{ borderBottom: "1px solid #F8F8F6" }}>
                            <div
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
                                background: isDone ? "#FCFCFA" : "#fff", cursor: "pointer",
                                transition: "background 0.1s",
                              }}
                              onClick={() => toggle(id)}
                            >
                              {/* Checkbox */}
                              <div style={{
                                width: 20, height: 20, borderRadius: 6, border: isDone ? "none" : "2px solid #D0CFC8",
                                background: isDone ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                              }}>
                                {isDone && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: 14, color: isDone ? "#aaa" : "#1a1a1a",
                                  textDecoration: isDone ? "line-through" : "none",
                                  lineHeight: 1.5,
                                }}>
                                  {item.name}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                                    background: meta.bg, color: meta.color,
                                  }}>
                                    {meta.label}
                                  </span>
                                  <button
                                    onClick={e => { e.stopPropagation(); setActiveTip(showTip ? null : id); }}
                                    style={{
                                      fontSize: 11, color: "#888", background: "none", border: "1px solid #E0DFDA",
                                      borderRadius: 10, padding: "2px 8px", cursor: "pointer",
                                    }}
                                  >
                                    {showTip ? "hide tip" : "💡 tip"}
                                  </button>
                                </div>
                                {showTip && (
                                  <div style={{
                                    marginTop: 8, padding: "10px 12px", background: "#FFFBF0",
                                    border: "1px solid #FAEEDA", borderRadius: 8, fontSize: 13,
                                    color: "#6B4800", lineHeight: 1.6,
                                  }}>
                                    {item.tip}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === "timeline" && (
          <div>
            {Object.entries(TIMING_META).map(([key, meta]) => {
              const allItems = TASKS.flatMap(s =>
                s.items.map((item, i) => ({ ...item, section: s.section, icon: s.icon, realIdx: i }))
              ).filter(item => item.timing === key);
              const done = allItems.filter(item => checked[`${item.section}||${item.realIdx}`]).length;

              return (
                <div key={key} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>{meta.label}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{meta.weeks} · {done}/{allItems.length} done</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: 24, display: "flex", flexDirection: "column", gap: 6 }}>
                    {allItems.map(item => {
                      const id = `${item.section}||${item.realIdx}`;
                      const isDone = !!checked[id];
                      return (
                        <div
                          key={id}
                          onClick={() => toggle(id)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                            background: "#fff", border: "1px solid #EBEBEB", borderRadius: 10, cursor: "pointer",
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, border: isDone ? "none" : "2px solid #D0CFC8",
                            background: isDone ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isDone && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: isDone ? "#aaa" : "#1a1a1a", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.5 }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{item.icon} {item.section}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}