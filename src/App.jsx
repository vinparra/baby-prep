import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const SEED_TASKS = [
  { section: "Healthcare & insurance", icon: "🏥", items: [
    { id: "h1", name: "Confirm OB/GYN or midwife and schedule first prenatal appointment", timing: "T1", tip: "Ask about group prenatal care options like Centering Pregnancy.", label: null, order: 0 },
    { id: "h2", name: "Notify health insurance of pregnancy and review maternity coverage", timing: "T1", tip: "Find out your deductible, out-of-pocket max, and which hospitals are in-network.", label: null, order: 1 },
    { id: "h3", name: "Research and choose a pediatrician before the birth", timing: "T2", tip: "Most pediatricians offer free meet-and-greet appointments.", label: null, order: 2 },
    { id: "h4", name: "Schedule anatomy ultrasound (around 20 weeks)", timing: "T2", tip: "This scan checks for structural development and can reveal the sex if you want to know.", label: null, order: 3 },
    { id: "h5", name: "Complete glucose screening test (24–28 weeks)", timing: "T2", tip: "Screens for gestational diabetes. Eat normally beforehand.", label: null, order: 4 },
    { id: "h6", name: "Tour your birth hospital or birthing center", timing: "T2", tip: "Ask about parking, visitor policies, and what's included in the room.", label: null, order: 5 },
    { id: "h7", name: "Finalize birth plan and share with OB or midwife", timing: "T3", tip: "Keep it to one page. Include preferences for pain management, labor support, and immediate newborn care.", label: null, order: 6 },
    { id: "h8", name: "Pre-register at the hospital or birth center", timing: "T3", tip: "Doing this now saves precious time when you arrive in labor.", label: null, order: 7 },
    { id: "h9", name: "Schedule Group B Strep test (~36 weeks)", timing: "T3", tip: "A simple swab test — affects your IV antibiotic plan during labor if positive.", label: null, order: 8 },
    { id: "h10", name: "Confirm pediatrician accepts your insurance", timing: "T3", tip: "Call both the office and your insurer to double-check.", label: null, order: 9 },
    { id: "h11", name: "Add baby to health insurance within 30 days of birth", timing: "newborn", tip: "Missing this window is a big deal — it's a special enrollment period.", label: null, order: 10 },
  ]},
  { section: "Budget & finances", icon: "💰", items: [
    { id: "b1", name: "Create a new baby budget", timing: "T1", tip: "Budget $15,000–$20,000+ for the first year.", label: null, order: 0 },
    { id: "b2", name: "Review and update life insurance coverage", timing: "T1", tip: "Term life insurance is affordable and critical once you have a dependent.", label: null, order: 1 },
    { id: "b3", name: "Research your FMLA and parental leave policy with your employer", timing: "T1", tip: "Check what paid leave your employer offers and how to apply.", label: null, order: 2 },
    { id: "b4", name: "Open or fund a 529 college savings account", timing: "T2", tip: "Many states offer a tax deduction for contributions to a 529 plan.", label: "vinny", order: 3 },
    { id: "b5", name: "Update or create your will and designate a guardian", timing: "T2", tip: "This is the single most important legal document for new parents.", label: "both", order: 4 },
    { id: "b6", name: "Look into a financial advisor", timing: "T2", tip: "A fee-only financial advisor can help you plan for college savings, insurance, and estate planning.", label: "both", order: 5 },
    { id: "b7", name: "File for tax credits like Child Tax Credit and Dependent Care FSA", timing: "newborn", tip: "The Child Tax Credit is $2,000/child.", label: null, order: 6 },
    { id: "b8", name: "Apply for Social Security number for the baby", timing: "newborn", tip: "You can do this at the hospital at birth.", label: null, order: 7 },
  ]},
  { section: "Childcare & daycare", icon: "🍼", items: [
    { id: "c1", name: "Research childcare options — daycare, nanny, family, au pair", timing: "T1", tip: "Daycare can have 6–18 month waitlists. Start researching immediately.", label: null, order: 0 },
    { id: "c2", name: "Tour daycare centers in your area", timing: "T1", tip: "Look for low staff turnover, cleanliness, and how caregivers interact with babies.", label: null, order: 1 },
    { id: "c3", name: "Get on daycare waitlists as early as possible", timing: "T1", tip: "Put yourself on multiple lists. You can always decline when the time comes.", label: null, order: 2 },
    { id: "c4", name: "Research and find a school", timing: "T1", tip: "Some Chicago preschools have waitlists starting in infancy.", label: null, order: 3 },
    { id: "c5", name: "Look into Bright Horizons and Emergency Back-up Dependent Care (Deloitte)", timing: "T2", tip: "Deloitte's backup care benefit can cover last-minute care gaps.", label: "vinny", order: 4 },
    { id: "c6", name: "If hiring a nanny, begin interviewing process", timing: "T2", tip: "Background checks, references, and a trial period are non-negotiables.", label: null, order: 5 },
    { id: "c7", name: "Finalize childcare arrangements and sign contracts", timing: "T3", tip: "Confirm your start date and ask about their settling-in process for newborns.", label: null, order: 6 },
    { id: "c8", name: "Set up Dependent Care FSA if available through your employer", timing: "T3", tip: "Max contribution is $5,000/year.", label: null, order: 7 },
  ]},
  { section: "Nursery & home prep", icon: "🏠", items: [
    { id: "n1", name: "Decide on nursery room and start decluttering", timing: "T1", tip: "A crib, dresser/changer combo, and a glider are the essentials.", label: null, order: 0 },
    { id: "n2", name: "Go through all closets, cabinets, and shelves", timing: "T1", tip: "Decluttering now makes space for all the baby gear.", label: "both", order: 1 },
    { id: "n3", name: "Replace nursery flooring", timing: "T1", tip: "Easier to do before furniture arrives.", label: "both", order: 2 },
    { id: "n4", name: "Paint the nursery", timing: "T2", tip: "Use low-VOC paint and keep the room well-ventilated.", label: "both", order: 3 },
    { id: "n5", name: "Assemble crib, dresser, and changing table", timing: "T2", tip: "Anchor all furniture to the wall.", label: null, order: 4 },
    { id: "n6", name: "Buy sleeper sofa for nursery", timing: "T2", tip: "Helpful for overnight stays and night feeds in the first weeks.", label: "both", order: 5 },
    { id: "n7", name: "Buy area rug (8x10 or 9x12) and thick rug pad for nursery", timing: "T2", tip: "Helps with cushioning, noise reduction, and warmth in Chicago winters.", label: "both", order: 6 },
    { id: "n8", name: "Add felt pads to rocking chair, dresser, and other furniture", timing: "T2", tip: "Protects the floor, especially after replacing the flooring.", label: "both", order: 7 },
    { id: "n9", name: "Install baby monitors, outlet covers, and cabinet locks", timing: "T3", tip: "Video monitors with temperature readouts are especially useful.", label: null, order: 8 },
    { id: "n10", name: "Wash all baby clothes and bedding in fragrance-free detergent", timing: "T3", tip: "Dreft or All Free & Clear are popular picks.", label: null, order: 9 },
    { id: "n11", name: "Organize and stock the changing station", timing: "T3", tip: "Stock with diapers, wipes, diaper cream, extra onesies, and a waterproof liner.", label: null, order: 10 },
    { id: "n12", name: "Install and inspect car seat — many fire stations offer free checks", timing: "T3", tip: "Infant seats must be rear-facing. Most are misinstalled — always get it checked.", label: null, order: 11 },
    { id: "n13", name: "Set up bassinet in your bedroom for the first few months", timing: "T3", tip: "AAP recommends room-sharing (not bed-sharing) for the first 6 months.", label: null, order: 12 },
  ]},
  { section: "Birthing & parenting classes", icon: "📚", items: [
    { id: "cl1", name: "Enroll in childbirth or Lamaze class — fills up quickly", timing: "T2", tip: "Your hospital likely offers classes. Also check Lamaze.org and local doulas.", label: null, order: 0 },
    { id: "cl2", name: "Take a breastfeeding class or consult a lactation consultant", timing: "T2", tip: "Many insurance plans cover lactation consultant visits.", label: null, order: 1 },
    { id: "cl3", name: "Take an infant CPR and first aid class", timing: "T2", tip: "Bring your partner.", label: null, order: 2 },
    { id: "cl4", name: "Schedule delivery prep class", timing: "T3", tip: "Covers what to expect during labor, delivery, and the immediate postpartum period.", label: null, order: 3 },
    { id: "cl5", name: "Watch Maven classes — newborn care 101", timing: "T3", tip: "Maven offers virtual classes on newborn care, feeding, and sleep.", label: "both", order: 4 },
    { id: "cl6", name: "Take a newborn care class — bathing, swaddling, diapering", timing: "T3", tip: "Even 2 hours of practice makes the first week dramatically calmer.", label: null, order: 5 },
  ]},
  { section: "Go bag & hospital prep", icon: "🎒", items: [
    { id: "g1", name: "Start researching what to pack in your hospital bag", timing: "T2", tip: "Pack separately for mom, partner, and baby.", label: null, order: 0 },
    { id: "g2", name: "Pack the hospital go bag", timing: "T3", tip: "For mom: lip balm, hair ties, slippers, snacks, phone charger. For baby: first outfit, swaddle, car seat.", label: null, order: 1 },
    { id: "g3", name: "Buy things for bringing home the baby", timing: "T3", tip: "Stock up on items for the first week — nursing pads, postpartum care, easy snacks.", label: "both", order: 2 },
    { id: "g4", name: "Save the hospital number and know the route", timing: "T3", tip: "Do a practice drive, especially to know the parking situation at night.", label: null, order: 3 },
    { id: "g5", name: "Arrange pet or child care for during labor", timing: "T3", tip: "Have a backup person lined up.", label: null, order: 4 },
    { id: "g6", name: "Set up a contact list and plan for announcements", timing: "T3", tip: "Designate one person to spread the news.", label: null, order: 5 },
  ]},
  { section: "Self-care & wellbeing", icon: "💚", items: [
    { id: "s1", name: "Start or continue prenatal vitamins with folic acid, DHA, and iron", timing: "T1", tip: "Take with food to reduce nausea.", label: null, order: 0 },
    { id: "s2", name: "Review all medications with your OB for safety during pregnancy", timing: "T1", tip: "This includes supplements, OTC meds, and anything herbal.", label: null, order: 1 },
    { id: "s3", name: "Start reading to baby and playing music", timing: "T1", tip: "Babies can hear from around 18 weeks.", label: "vinny", order: 2 },
    { id: "s4", name: "Discuss mental health and postpartum depression awareness with your OB", timing: "T2", tip: "Postpartum depression affects 1 in 5 new mothers. Having a plan makes a real difference.", label: null, order: 3 },
    { id: "s5", name: "Plan simple meals for postpartum period", timing: "T3", tip: "Set up a meal train with friends/family, or subscribe to a delivery service.", label: "both", order: 4 },
    { id: "s6", name: "Identify a postpartum support network", timing: "T3", tip: "A postpartum doula can help with night feeds, baby care, and household tasks.", label: null, order: 5 },
    { id: "s7", name: "Schedule your postpartum OB check-up in advance", timing: "T3", tip: "The standard is 6 weeks, but ask about an earlier check-in at 2–3 weeks.", label: null, order: 6 },
  ]},
  { section: "Legal & admin", icon: "📋", items: [
    { id: "l1", name: "Update beneficiaries on all accounts — 401k, IRA, life insurance", timing: "T1", tip: "Beneficiary designations on accounts override the will.", label: "both", order: 0 },
    { id: "l2", name: "Update or create your will", timing: "T2", tip: "Online services like Trust & Will are a cheaper option.", label: "both", order: 1 },
    { id: "l3", name: "Designate a legal guardian for the baby in your will", timing: "T2", tip: "Talk to your chosen guardian first.", label: "both", order: 2 },
    { id: "l4", name: "Prepare FMLA and parental leave paperwork with HR", timing: "T3", tip: "Give HR at least 30 days notice.", label: null, order: 3 },
    { id: "l5", name: "Get approval for parental leave", timing: "T3", tip: "Confirm dates and handoff plan with your manager.", label: "both", order: 4 },
    { id: "l6", name: "Look into work utilization, bonus, and timing considerations", timing: "T3", tip: "Understand how leave timing may affect year-end reviews or bonuses.", label: "both", order: 5 },
    { id: "l7", name: "Register baby's birth and obtain birth certificate", timing: "newborn", tip: "Usually done at the hospital.", label: null, order: 6 },
    { id: "l8", name: "Apply for baby's Social Security number", timing: "newborn", tip: "Doing it at the hospital is the fastest option.", label: null, order: 7 },
  ]},
  { section: "Insurance & benefits", icon: "🏦", items: [
    { id: "ins1", name: "Decide on open enrollment options", timing: "T1", tip: "Adding a dependent is a qualifying life event — review all plan options.", label: "both", order: 0 },
    { id: "ins2", name: "Schedule insurance consultation", timing: "T1", tip: "Review coverage for maternity, newborn care, and pediatric visits.", label: "zijia", order: 1 },
    { id: "ins3", name: "Look into additional insurer benefits (Bright Beginnings etc.)", timing: "T1", tip: "Many plans include free lactation support and postpartum mental health visits.", label: "both", order: 2 },
    { id: "ins4", name: "Add baby to insurance policy within 30 days of birth", timing: "newborn", tip: "This is a hard deadline — missing it means waiting until open enrollment.", label: "both", order: 3 },
  ]},
];

const TIMING_META = {
  T1: { label: "1st trimester", weeks: "Weeks 1–12", color: "#0F6E56", bg: "#E1F5EE", dot: "#1D9E75" },
  T2: { label: "2nd trimester", weeks: "Weeks 13–26", color: "#185FA5", bg: "#E6F1FB", dot: "#378ADD" },
  T3: { label: "3rd trimester", weeks: "Weeks 27–40", color: "#854F0B", bg: "#FAEEDA", dot: "#EF9F27" },
  newborn: { label: "After birth", weeks: "First 30 days", color: "#3C3489", bg: "#EEEDFE", dot: "#7F77DD" },
};

const LABELS = [
  { key: "vinny", name: "Vinny", color: "#3B82F6", bg: "#EFF6FF" },
  { key: "zijia", name: "Zijia", color: "#EC4899", bg: "#FDF2F8" },
  { key: "both", name: "Both", color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "urgent", name: "Urgent", color: "#EF4444", bg: "#FEF2F2" },
];

const SEED_ITEMS = [
  { id: "i1", category: "Sleep – Bassinet", name: "Bedside/co-sleeper bassinet", priority: "Must-Have", price: 300, notes: "Halo BassiNest Swivel Sleeper or Maxi-Cosi Iora. Drop-down side docks flush against your mattress.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i2", category: "Sleep – Bassinet", name: "Bassinet fitted sheets (3–4)", priority: "Must-Have", price: 28, notes: "Buy sheets made for your exact bassinet model.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i3", category: "Sleep – Bassinet", name: "Muslin bassinet sheets – Pink Rainbow (TansyPanda)", priority: "Must-Have", price: 20, notes: "Fits Maxi-Cosi Iora, Delta Children, Graco, Munchkin Brica, 4moms MamaRoo, Chicco LullaGlide.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i4", category: "Sleep – Bassinet", name: "Delta Children Bondi Bedside Bassinet", priority: "Must-Have", price: 175, notes: "Adjustable height, PureAir mesh sheet, FSC-certified beechwood.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i5", category: "Sleep – Crib", name: "Mini crib (~24x38\")", priority: "Must-Have", price: 220, notes: "Dream On Me Aden 4-in-1 Mini Crib. Uses roughly half the floor space of a standard crib.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i6", category: "Sleep – Crib", name: "Mini crib mattress + 2 waterproof protectors", priority: "Must-Have", price: 120, notes: "Buy the mini-crib-sized mattress that matches your crib brand. Firm and well-fitting is essential.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i7", category: "Sleep – Crib", name: "Mini crib fitted sheets (3–4)", priority: "Must-Have", price: 30, notes: "Mini-crib sheets are a different size than standard crib sheets — double-check fit.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i8", category: "Sleep – General", name: "Swaddles (4–6)", priority: "Must-Have", price: 30, notes: "Love to Dream Swaddle Up or HALO Cotton Swaddle recommended.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i9", category: "Sleep – General", name: "Arms-up swaddle 2-pack (Gray Stars)", priority: "Must-Have", price: 31, notes: "0–3 months, cuff removable, 2-way zipper.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i10", category: "Sleep – General", name: "Arms-up swaddle 2-pack (Pink Bunny)", priority: "Must-Have", price: 30, notes: "0–3 months, cuff removable, 2-way zipper.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i11", category: "Sleep – General", name: "Burt's Bees Wearable Blanket (0.5 TOG)", priority: "Must-Have", price: 23, notes: "Light weight, organic cotton, unisex.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i12", category: "Sleep – General", name: "Burt's Bees Wearable Blanket (1.5 TOG)", priority: "Must-Have", price: 23, notes: "Medium weight, organic cotton, unisex.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i13", category: "Sleep – General", name: "HALO SleepSack (TOG 0.5, Midnight Moons, 6–12mo)", priority: "Must-Have", price: 35, notes: "For the transition out of swaddling.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i14", category: "Sleep – General", name: "HALO SleepSack (TOG 0.5, Lullaby Forest, 6–12mo)", priority: "Must-Have", price: 35, notes: "For the transition out of swaddling.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i15", category: "Sleep – General", name: "Sleep sacks 2.5 TOG for Chicago winter", priority: "Must-Have", price: 44, notes: "Aim for 2.5 TOG for a room around 68°F. Kyte Baby Sleep Bag recommended.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i16", category: "Sleep – General", name: "Sound machine / white noise machine", priority: "Nice-to-Have", price: 50, notes: "Yogasleep Dohm Classic or Hatch Rest 2nd Gen (app-controlled).", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i17", category: "Sleep – General", name: "Cool-mist humidifier", priority: "Must-Have", price: 55, notes: "Chicago forced-air winter heat dries indoor air fast. Never warm mist (burn risk). Levoit Classic 160 recommended.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i18", category: "Sleep – General", name: "Vicks SleepyTime Cool Mist Humidifier 3-in-1", priority: "Must-Have", price: 38, notes: "With night light. Works with Vicks SleepyTime Vapopads.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "i19", category: "Sleep – General", name: "Baby monitor", priority: "Must-Have", price: 180, notes: "Eufy E21 (hybrid WiFi/local, no subscription) is best value. Nanit Pro for sleep tracking.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "i20", category: "Sleep – General", name: "Crib mobile (pink, 35 lullabies)", priority: "Nice-to-Have", price: 36, notes: "3 modes: turn only, music only, turn & music.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d1", category: "Diapering", name: "Pampers Swaddlers Newborn diapers (84 count)", priority: "Must-Have", price: 28, notes: "Fragrance-free, hypoallergenic.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d2", category: "Diapering", name: "Pampers Swaddlers Newborn diapers (140 count)", priority: "Must-Have", price: 45, notes: "Don't over-stock newborn — babies size up within 4–8 weeks.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d3", category: "Diapering", name: "Baby wipes (8–12 packs bulk)", priority: "Must-Have", price: 25, notes: "Buy in bulk once you know which brand works for baby's skin.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "d4", category: "Diapering", name: "Diaper Genie Complete + refill + carbon filter", priority: "Must-Have", price: 55, notes: "Holds 270 newborn diapers per refill.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d5", category: "Diapering", name: "Diaper Genie refill bags 270-count (Pack of 3)", priority: "Must-Have", price: 20, notes: "Clean Laundry scent, holds up to 810 newborn diapers.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d6", category: "Diapering", name: "Keekaroo Peanut Changer (vanilla)", priority: "Must-Have", price: 150, notes: "Water-repellant, fully wipeable changing pad.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d7", category: "Diapering", name: "Disposable underpads / changing liners (100 count)", priority: "Must-Have", price: 26, notes: "13x18\", waterproof, quick-absorb.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d8", category: "Diapering", name: "Maliton felt diaper caddy organizer (Khaki)", priority: "Nice-to-Have", price: 13, notes: "15x9x7\", portable.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d9", category: "Diapering", name: "Frida Baby diaper cream spatula (silicone)", priority: "Nice-to-Have", price: 8, notes: "BPA-free, suction-cup base.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d10", category: "Diapering", name: "Aquaphor Baby Skincare Set (14oz ointment + 3.5oz diaper cream)", priority: "Must-Have", price: 27, notes: "Fragrance-free, dermatologist-tested.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "d11", category: "Diapering", name: "Diaper rash cream (Desitin or Boudreaux's)", priority: "Must-Have", price: 8, notes: "Zinc-oxide creams are the pediatrician-standard first choice.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "f1", category: "Feeding", name: "Breast pump — check insurance first", priority: "Must-Have", price: 0, notes: "Most ACA-compliant plans cover at least one pump. Spectra S1/S2 often fully covered.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "f2", category: "Feeding", name: "My Brest Friend nursing pillow (Deluxe)", priority: "Must-Have", price: 57, notes: "Adjustable backrest, side pocket. Also works as tummy-time support.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f3", category: "Feeding", name: "Dr. Brown's Anti-Colic Bottle Gift Set (4oz + 8oz)", priority: "Must-Have", price: 25, notes: "Includes HappyPaci and storage caps.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f4", category: "Feeding", name: "Philips Avent bottle drying rack", priority: "Nice-to-Have", price: 17, notes: "Fits 8 bottles. Compact, dishwasher safe.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f5", category: "Feeding", name: "4-in-1 bottle brush set", priority: "Nice-to-Have", price: 9, notes: "Nylon bottle brush, cap brushes, straw brushes. BPA-free.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f6", category: "Feeding", name: "Momcozy KleanPal Pro bottle washer/sterilizer/dryer", priority: "Nice-to-Have", price: 300, notes: "9 cleaning modes, 26 spray jets. All-in-one appliance.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f7", category: "Feeding", name: "Grownsy 8-in-1 bottle warmer with timer", priority: "Nice-to-Have", price: 32, notes: "Fast & even heating, multi-use.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f8", category: "Feeding", name: "Muslin burp cloths 12-pack (100% cotton, 20x10\")", priority: "Must-Have", price: 12, notes: "Extra soft and absorbent. Doubles as light blanket.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f9", category: "Feeding", name: "KeaBabies 8-pack organic baby bibs (Constellation)", priority: "Nice-to-Have", price: 14, notes: "Soft cotton, extra absorbent, 0–24 months.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f10", category: "Feeding", name: "Philips Avent Soothie pacifiers (4-pack, Lilac/Pink)", priority: "Must-Have", price: 11, notes: "BPA-free, medical-grade silicone, 0–3 months.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f11", category: "Feeding", name: "Bubs Grass Fed Infant Formula (20oz)", priority: "Nice-to-Have", price: 28, notes: "Non-GMO, with iron, DHA, prebiotics & probiotics. Good to have as backup.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f12", category: "Feeding", name: "Stokke Steps High Chair (White/Natural)", priority: "Consider Waiting", price: 249, notes: "6 months to 10 years. Buy closer to month 5–6.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f13", category: "Feeding", name: "Dr. Brown's first straw cup 2-pack", priority: "Consider Waiting", price: 10, notes: "For 4–6+ months transition from bottle.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "f14", category: "Feeding", name: "Baby tongue cleaner / disposable oral cleaner (40 count)", priority: "Nice-to-Have", price: 10, notes: "For newborn mouth and gum cleaning.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ba1", category: "Bathing", name: "Baby bath support with thermometer", priority: "Must-Have", price: 30, notes: "For babies under 6 months. Puj Flyte folds flat for storage.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ba2", category: "Bathing", name: "Baby Dove Sensitive Skin Care baby wash (fragrance-free, 20oz)", priority: "Must-Have", price: 8, notes: "Tear-free formula, for sensitive baby skin.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ba3", category: "Bathing", name: "Cetaphil Baby wash & shampoo + lotion bundle (2ct)", priority: "Must-Have", price: 15, notes: "Hypoallergenic, tear-free, gentle for newborns.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ba4", category: "Bathing", name: "Hooded towels (2–3)", priority: "Must-Have", price: 25, notes: "Newborns only need a bath 2–3x/week.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "cl1i", category: "Clothing", name: "Gerber 8-pack onesies (Newborn)", priority: "Must-Have", price: 17, notes: "Don't over-buy newborn — often outgrown within 2–4 weeks.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl2i", category: "Clothing", name: "Gerber 8-pack onesies (0–3 months)", priority: "Must-Have", price: 17, notes: "0–3 month size goes much further than newborn.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl3i", category: "Clothing", name: "Little Me footie & headband set (Preemie–9 months)", priority: "Must-Have", price: 15, notes: "100% cotton, scratch-free tag, zipper closure.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl4i", category: "Clothing", name: "Little Me footie pajamas — Flora (Newborn)", priority: "Must-Have", price: 14, notes: "Long sleeve, scratch-free tag, zipper front.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl5i", category: "Clothing", name: "Little Me Sweet Bear Footie (Light Pink, Newborn)", priority: "Must-Have", price: 13, notes: "Long sleeve footed sleeper.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl6i", category: "Clothing", name: "Little Me Ivory Floral Side-Snap Footie (3 months)", priority: "Must-Have", price: 18, notes: "Long sleeve, scratch-free tag.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl7i", category: "Clothing", name: "Carter's fleece footed sleepers warm (6–8)", priority: "Must-Have", price: 25, notes: "Prioritize warm fleece for the Chicago winter.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "cl8i", category: "Clothing", name: "8-pair newborn no-scratch mittens (0–6 months)", priority: "Must-Have", price: 8, notes: "Cotton gloves to prevent face scratching.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl9i", category: "Clothing", name: "Cotton newborn hats with bear ears (0–6 months)", priority: "Must-Have", price: 20, notes: "Newborns lose a lot of heat through their heads.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl10i", category: "Clothing", name: "Organic cotton baby girl socks 6-pack (0–6 months)", priority: "Must-Have", price: 9, notes: "GOTS certified, Oeko-Tex certified, pink.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "cl11i", category: "Clothing", name: "Dreft baby liquid laundry detergent (42oz, 2-pack)", priority: "Must-Have", price: 22, notes: "Gentle on sensitive skin, 32 loads per bottle.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ng1", category: "Nursery Gear", name: "Glider or recliner (compact/small-space model)", priority: "Must-Have", price: 450, notes: "Delta Children Mercer Power Recliner or DaVinci Suzy Glider.", fromRegistry: false, boughtBy: "", purchased: true },
  { id: "ng2", category: "Nursery Gear", name: "Dresser (doubles as changing station)", priority: "Must-Have", price: 350, notes: "One piece doing two jobs saves space. IKEA Hemnes or Storkcraft Modern Nursery Dresser.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "ng3", category: "Nursery Gear", name: "Graco Benton changing table with waterproof pad", priority: "Must-Have", price: 130, notes: "GREENGUARD Gold Certified, includes diaper change pad with safety strap.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ng4", category: "Nursery Gear", name: "Sleeper sofa for nursery", priority: "Must-Have", price: 800, notes: "Helpful for overnight stays and night feeds.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "ng5", category: "Nursery Gear", name: "Area rug 8x10 or 9x12", priority: "Must-Have", price: 300, notes: "Cushioning and warmth for Chicago winters.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "ng6", category: "Nursery Gear", name: "Thick rug pad", priority: "Must-Have", price: 60, notes: "For cushioning and noise reduction.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "ng7", category: "Nursery Gear", name: "Felt furniture pads", priority: "Nice-to-Have", price: 10, notes: "Protects new nursery floors.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "ng8", category: "Nursery Gear", name: "Storage bins / closet organizers", priority: "Nice-to-Have", price: 35, notes: "Under-crib bins and hanging closet dividers make a small nursery closet function much better.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "t1", category: "Travel & Gear", name: "Infant car seat", priority: "Must-Have", price: 350, notes: "Nuna PIPA RX (~8.5 lbs, Consumer Reports Best) recommended for a smaller-build parent. Must have before hospital discharge.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "t2", category: "Travel & Gear", name: "Graco 4Ever DLX 4-in-1 car seat (Charlie)", priority: "Must-Have", price: 320, notes: "Infant to toddler, 10 years of use.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "t3", category: "Travel & Gear", name: "Stroller", priority: "Must-Have", price: 380, notes: "Baby Jogger City Mini GT2 is top pick for Chicago winters — puncture-proof tires, all-wheel suspension.", fromRegistry: false, boughtBy: "", purchased: true },
  { id: "t4", category: "Travel & Gear", name: "Car seat winter cover / footmuff", priority: "Must-Have", price: 50, notes: "Never put baby in car seat with a bulky coat. A cover goes over the buckled baby instead.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "t5", category: "Travel & Gear", name: "Momcozy baby wrap carrier (Grey, XXS–XXL)", priority: "Must-Have", price: 34, notes: "Easy-on 2-piece design, newborn to 33 lbs, IHDI hip-healthy.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "t6", category: "Travel & Gear", name: "BabyBjörn Baby Carrier Mini (Dark Gray, 7–25 lbs)", priority: "Must-Have", price: 100, notes: "Ergonomic, easy-to-use infant carrier.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "t7", category: "Travel & Gear", name: "Structured baby carrier for month 3–4+", priority: "Must-Have", price: 70, notes: "Ergobaby Omni 360 for toddler phase.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "t8", category: "Travel & Gear", name: "Graco Pack n Play with bassinet (Reeves)", priority: "Nice-to-Have", price: 89, notes: "Folding playpen with bassinet and portable crib.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "hs1", category: "Health & Safety", name: "Digital thermometer (rectal)", priority: "Must-Have", price: 10, notes: "Pediatricians recommend rectal thermometers as most accurate for newborns.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "hs2", category: "Health & Safety", name: "GROWNSY electric nasal aspirator", priority: "Must-Have", price: 40, notes: "Powerful suction, soft silicone tips, music and light soothing function.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "hs3", category: "Health & Safety", name: "Baby nail kit 4-in-1 (nail clippers, scissors, file, tweezers)", priority: "Must-Have", price: 9, notes: "Newborn nails grow fast and scratch.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "hs4", category: "Health & Safety", name: "Kids First Aid Kit 75-piece", priority: "Nice-to-Have", price: 29, notes: "TSA approved, latex-free, fits diaper bag.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ag1", category: "Activity & Gear", name: "LITTLE Bot Ofie Play Mat (Country Road, Large 6.5x4.5ft)", priority: "Must-Have", price: 166, notes: "Reversible foam floor mat, durable and non-toxic.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ag2", category: "Activity & Gear", name: "Wooden baby playpen / indoor play yard (73x63\")", priority: "Consider Waiting", price: 170, notes: "Montessori style. Buy closer to when baby is mobile.", fromRegistry: true, boughtBy: "", purchased: false },
  { id: "ow1", category: "Health & Safety", name: "Owlet Smart Sock baby monitor", priority: "Nice-to-Have", price: 299, notes: "Tracks baby's oxygen level and heart rate while sleeping. Alerts you to readings outside normal ranges. Not a medical device but gives many parents peace of mind.", fromRegistry: false, boughtBy: "", purchased: false },
  { id: "oi1", category: "Self-Care & Wellness", name: "Baby-safe oils (coconut, chamomile, or baby massage oil)", priority: "Nice-to-Have", price: 20, notes: "Used for baby massage, dry skin, and cradle cap. Look for fragrance-free, cold-pressed options. Always do a patch test first.", fromRegistry: false, boughtBy: "", purchased: false },
];

const BUDGET_PRE = [
  { category: "Nursery & furniture", items: [{ name: "Crib or mini crib", estimate: 220 }, { name: "Crib mattress + protectors", estimate: 120 }, { name: "Crib fitted sheets (3–4)", estimate: 30 }, { name: "Bassinet (bedside)", estimate: 300 }, { name: "Bassinet sheets", estimate: 28 }, { name: "Dresser / changing station", estimate: 350 }, { name: "Changing pad or table", estimate: 130 }, { name: "Glider or recliner", estimate: 450 }, { name: "Sleeper sofa", estimate: 800 }, { name: "Area rug + rug pad", estimate: 360 }, { name: "Baby monitor", estimate: 180 }, { name: "Storage bins / organizers", estimate: 35 }] },
  { category: "Travel & gear", items: [{ name: "Infant car seat", estimate: 350 }, { name: "Stroller", estimate: 380 }, { name: "Car seat winter cover", estimate: 50 }, { name: "Baby carrier / wrap (newborn)", estimate: 70 }, { name: "Pack n Play", estimate: 89 }] },
  { category: "Feeding", items: [{ name: "Breast pump (check insurance first)", estimate: 0 }, { name: "Nursing pillow", estimate: 57 }, { name: "Bottles starter set", estimate: 25 }, { name: "Bottle drying rack", estimate: 17 }, { name: "Bottle brush / cleaning set", estimate: 9 }, { name: "Bottle warmer", estimate: 32 }, { name: "Bottle washer / sterilizer", estimate: 300 }, { name: "Burp cloths (12-pack)", estimate: 12 }, { name: "Formula (backup supply)", estimate: 28 }] },
  { category: "Sleep", items: [{ name: "Swaddles (4–6)", estimate: 60 }, { name: "Sleep sacks / wearable blankets", estimate: 80 }, { name: "Sound machine / white noise", estimate: 50 }, { name: "Cool-mist humidifier", estimate: 55 }] },
  { category: "Diapering", items: [{ name: "Newborn diapers (2–4 boxes to start)", estimate: 75 }, { name: "Baby wipes (bulk)", estimate: 25 }, { name: "Diaper pail + refills", estimate: 75 }, { name: "Changing pad / liner", estimate: 150 }, { name: "Diaper caddy", estimate: 13 }, { name: "Diaper rash cream + Aquaphor", estimate: 35 }] },
  { category: "Bathing", items: [{ name: "Infant bathtub", estimate: 30 }, { name: "Baby wash / shampoo", estimate: 23 }, { name: "Hooded towels (2–3)", estimate: 25 }] },
  { category: "Clothing", items: [{ name: "Newborn onesies / bodysuits", estimate: 35 }, { name: "0–3 month clothing", estimate: 75 }, { name: "Footed sleepers / pajamas (6–8)", estimate: 50 }, { name: "Hats, mittens, socks", estimate: 37 }, { name: "Laundry detergent (Dreft)", estimate: 22 }] },
  { category: "Health & safety", items: [{ name: "Digital thermometer", estimate: 10 }, { name: "Nasal aspirator", estimate: 40 }, { name: "Baby nail kit", estimate: 9 }, { name: "First aid kit", estimate: 29 }, { name: "Pacifiers", estimate: 11 }] },
  { category: "Activity & play", items: [{ name: "Play mat (large foam)", estimate: 166 }, { name: "Crib mobile", estimate: 36 }] },
  { category: "Classes & prep", items: [{ name: "Childbirth / Lamaze class", estimate: 150 }, { name: "Infant CPR class", estimate: 50 }, { name: "Breastfeeding / lactation consultant", estimate: 200 }] },
  { category: "Medical (pre-birth)", items: [{ name: "Hospital delivery out-of-pocket", estimate: 1500 }, { name: "Prenatal vitamins (remaining months)", estimate: 100 }, { name: "OB copays (remaining prenatal visits)", estimate: 200 }] },
  { category: "Legal & admin", items: [{ name: "Will and estate planning", estimate: 800 }, { name: "Life insurance (annual premium)", estimate: 400 }, { name: "529 college savings (initial contribution)", estimate: 500 }] },
];

const BUDGET_FIRST_YEAR = [
  { category: "Childcare", items: [{ name: "Daycare (monthly × 12)", estimate: 21600 }, { name: "Backup care / sick days", estimate: 1200 }] },
  { category: "Diapers & wipes (ongoing)", items: [{ name: "Diapers — monthly × 12", estimate: 960 }, { name: "Wipes — monthly × 12", estimate: 360 }, { name: "Diaper pail refills", estimate: 120 }] },
  { category: "Feeding (ongoing)", items: [{ name: "Formula if not breastfeeding (monthly × 12)", estimate: 1800 }, { name: "Bibs", estimate: 14 }, { name: "High chair (month 5–6)", estimate: 249 }, { name: "Baby food / purees (month 4–12)", estimate: 600 }] },
  { category: "Clothing (ongoing)", items: [{ name: "3–6 month clothing", estimate: 75 }, { name: "6–9 month clothing", estimate: 75 }, { name: "9–12 month clothing", estimate: 75 }] },
  { category: "Healthcare", items: [{ name: "Pediatrician copays (first year, ~8–10 visits)", estimate: 300 }, { name: "Postpartum lactation / mental health visits", estimate: 300 }] },
  { category: "Activity & gear (4–6+ months)", items: [{ name: "Baby playpen / indoor play yard", estimate: 170 }, { name: "Structured carrier (month 3–4)", estimate: 70 }, { name: "Baby books and toys", estimate: 100 }] },
];

const DOCTOR_QUESTIONS = {
  T1: ["What prenatal vitamins do you recommend?","Which medications are safe to take during pregnancy?","What foods and drinks should I avoid?","What are the signs of a miscarriage I should watch for?","How much weight gain is expected?","What genetic tests or screenings do you recommend?","Can I continue my current exercise routine?","When should I call the office vs. go to the ER?","What should I know about postpartum depression — what are the signs and how do we plan for it?"],
  T2: ["What does the anatomy ultrasound check for?","What is the glucose screening test and how should I prepare?","Should I start kick counts and when?","When should I tour the birth hospital?","What are signs of preterm labor?","Can I travel during this trimester?","What are my options for pain management during labor?","Should I see a lactation consultant before the birth?","Which labor and delivery positions are available and recommended?"],
  T3: ["What are the signs that labor has started?","When should we head to the hospital?","What does Group B Strep positive mean for my birth plan?","What happens if I go past my due date?","Who is allowed in the room during labor, delivery, or surgery?","Can you walk me through what a C-section involves if needed?","Do you offer a waffle or donut pillow post-surgery for sitting comfort?","What should I know about umbilical cord cutting — who cuts it, what's the process, and what are the options for cord blood storage?","What is your approach to skin-to-skin time immediately after birth?","What should I know about delayed cord clamping?","What postpartum symptoms should I call about right away?","When is my postpartum follow-up appointment?"],
  newborn: ["What are normal newborn behaviors vs. warning signs?","How do I know if baby is getting enough to eat?","What is the recommended sleep position and setup?","When does baby need their first pediatrician visit?","What vaccinations does baby get at birth and in the first weeks?","What are signs of postpartum depression I should watch for in myself?","When can we take baby out in public?"],
};

const MEALS = [
  { name: "Slow cooker chicken soup", time: "20 min prep", servings: "8 servings", ingredients: ["1 whole chicken or 4 bone-in thighs","4 carrots, chopped","4 celery stalks, chopped","1 onion, diced","4 cloves garlic","8 cups chicken broth","2 tsp salt","1 tsp black pepper","1 tsp thyme","2 cups egg noodles (add last 30 min)"], tip: "Freeze in quart containers. Skip the noodles when freezing — add fresh when reheating." },
  { name: "Beef & vegetable lasagna", time: "45 min prep", servings: "12 servings", ingredients: ["1 lb ground beef","1 jar marinara sauce (24 oz)","12 lasagna noodles, cooked","15 oz ricotta cheese","2 cups shredded mozzarella","1 egg","2 cups spinach","1 tsp Italian seasoning","Salt and pepper"], tip: "Make two pans — eat one now, freeze one unbaked. Thaw overnight in fridge before baking at 375F for 50 min." },
  { name: "Turkey & black bean chili", time: "30 min prep", servings: "10 servings", ingredients: ["1.5 lb ground turkey","2 cans black beans, drained","1 can diced tomatoes","1 can tomato sauce","1 onion, diced","1 red pepper, diced","3 cloves garlic","2 tbsp chili powder","1 tsp cumin","1 tsp smoked paprika"], tip: "Freezes perfectly. Serve with shredded cheese, sour cream, and cornbread." },
  { name: "Baked ziti", time: "25 min prep", servings: "10 servings", ingredients: ["1 lb ziti pasta, cooked","1 lb Italian sausage or ground beef","1 jar marinara (24 oz)","15 oz ricotta","2 cups shredded mozzarella","1 tsp garlic powder","1 tsp Italian seasoning"], tip: "Assemble in a foil pan for easy freezing. Bake at 375F covered 30 min, uncovered 15 min." },
  { name: "Chicken and rice casserole", time: "15 min prep", servings: "8 servings", ingredients: ["4 boneless chicken breasts","2 cups long-grain white rice","4 cups chicken broth","1 can cream of mushroom soup","1 cup frozen peas","1 onion, diced","Salt and pepper","1 cup shredded cheddar (topping)"], tip: "Add cheese on top before baking the last 10 minutes for a golden crust." },
  { name: "Lentil and vegetable soup", time: "15 min prep", servings: "8 servings", ingredients: ["2 cups red or green lentils","4 carrots, chopped","3 celery stalks, chopped","1 onion, diced","3 cloves garlic","1 can diced tomatoes","8 cups vegetable broth","2 tsp cumin","1 tsp turmeric","Juice of 1 lemon"], tip: "Naturally vegan and packed with protein. Lemon juice added at the end brightens the flavor." },
  { name: "Sheet pan meatballs", time: "20 min prep", servings: "40 meatballs", ingredients: ["2 lb ground beef or turkey","1/2 cup breadcrumbs","1/4 cup parmesan","2 eggs","3 cloves garlic, minced","1 tsp Italian seasoning","1 tsp salt"], tip: "Bake at 400F for 20 min. Freeze in a single layer, then transfer to a bag." },
  { name: "Banana oat muffins", time: "10 min prep", servings: "12 muffins", ingredients: ["3 ripe bananas, mashed","2 cups rolled oats","2 eggs","1/4 cup honey or maple syrup","1 tsp vanilla","1 tsp baking powder","1/2 tsp cinnamon","Pinch of salt"], tip: "No flour needed. Freeze and microwave 45 seconds for a quick breakfast." },
];

const DEFAULT_TODOS = [
  { id: 1, text: "Notify each of our employers about the pregnancy", done: false },
  { id: 2, text: "Decide on when to take leave", done: true },
  { id: 3, text: "Look into company resources for new parents", done: true },
  { id: 4, text: "Plan for announcements", done: false },
  { id: 5, text: "Choose a name", done: false },
  { id: 6, text: "Look into financial advisor", done: false },
  { id: 7, text: "Buy 2026 wine", done: false },
  { id: 8, text: "Subscribe to Amazon Prime", done: true },
  { id: 9, text: "Remove no-pest strips from nursery", done: true },
  { id: 10, text: "Tell parents", done: true },
  { id: 11, text: "Decide on baby shower", done: true },
  { id: 12, text: "Buy sleeper sofa", done: false },
  { id: 13, text: "Open a Trump/investment account for baby", done: false },
  { id: 14, text: "Buy items for bringing home the baby", done: false },
  { id: 15, text: "Work — review utilization, bonus timing, and leave impact", done: false },
  { id: 16, text: "Add money to 529 account", done: false },
];

const DOC_REF = () => doc(db, "babyprep", "shared");
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function App() {
  const [state, setState] = useState({ todos: DEFAULT_TODOS });
  const [activeTab, setActiveTab] = useState("checklist");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(DOC_REF(), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (!data.todos) data.todos = DEFAULT_TODOS;
        if (!data.customTasks) data.customTasks = SEED_TASKS.flatMap(s => s.items.map(i => ({ ...i, section: s.section })));
        if (!data.buyItems) data.buyItems = SEED_ITEMS;
        setState(data);
      } else {
        const seed = { todos: DEFAULT_TODOS, customTasks: SEED_TASKS.flatMap(s => s.items.map(i => ({ ...i, section: s.section }))), buyItems: SEED_ITEMS, checked: {}, actuals: {}, customQs: {}, answeredQs: {} };
        setDoc(DOC_REF(), seed);
      }
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  async function updateState(patch) {
    const next = { ...state, ...patch };
    setState(next);
    await setDoc(DOC_REF(), next);
  }

  if (!loaded) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", color: "#aaa" }}>Loading...</div>;

  const tabs = [
    { key: "checklist", label: "✓ Checklist" },
    { key: "buy", label: "🛒 Items to Buy" },
    { key: "budget", label: "💰 Budget" },
    { key: "doctor", label: "👩‍⚕️ Doctor Q&A" },
    { key: "meals", label: "🍲 Meals" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "16px 24px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 14 }}>🌱 Baby prep plan</div>
          <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "8px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === t.key ? 700 : 400, color: activeTab === t.key ? "#1a1a1a" : "#888", borderBottom: activeTab === t.key ? "2px solid #1a1a1a" : "2px solid transparent", whiteSpace: "nowrap", flexShrink: 0 }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 80px" }}>
        {activeTab === "checklist" && <ChecklistTab state={state} updateState={updateState} />}
        {activeTab === "buy" && <BuyTab state={state} updateState={updateState} />}
        {activeTab === "budget" && <BudgetTab state={state} updateState={updateState} />}
        {activeTab === "doctor" && <DoctorTab state={state} updateState={updateState} />}
        {activeTab === "meals" && <MealsTab />}
      </div>
    </div>
  );
}

function ChecklistTab({ state, updateState }) {
  const checked = state.checked || {};
  const customTasks = state.customTasks || SEED_TASKS.flatMap(s => s.items.map(i => ({ ...i, section: s.section })));
  const [filter, setFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [sortMode, setSortMode] = useState("manual");
  const [openSections, setOpenSections] = useState(() => { const o = {}; SEED_TASKS.forEach(t => o[t.section] = true); return o; });
  const [activeTip, setActiveTip] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [addingSection, setAddingSection] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemTiming, setNewItemTiming] = useState("T1");
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const sections = (() => {
    const map = {}; const order = [];
    customTasks.forEach(t => { if (!map[t.section]) { map[t.section] = []; order.push(t.section); } map[t.section].push(t); });
    const icons = {}; SEED_TASKS.forEach(s => icons[s.section] = s.icon);
    return order.map(s => ({ section: s, icon: icons[s] || "📌", items: map[s].sort((a, b) => a.order - b.order) }));
  })();

  const totalCount = customTasks.length;
  const doneCount = customTasks.filter(t => checked[t.id]).length;
  const pct = totalCount ? Math.round(doneCount / totalCount * 100) : 0;
  const progressColor = pct < 33 ? "#378ADD" : pct < 66 ? "#EF9F27" : "#1D9E75";

  function toggle(id) { updateState({ checked: { ...checked, [id]: !checked[id] } }); }
  function startEdit(item) { setEditingId(item.id); setEditText(item.name); }
  function commitEdit(id) { if (!editText.trim()) { setEditingId(null); return; } updateState({ customTasks: customTasks.map(t => t.id === id ? { ...t, name: editText.trim() } : t) }); setEditingId(null); }
  function changeTiming(id, timing) { updateState({ customTasks: customTasks.map(t => t.id === id ? { ...t, timing } : t) }); }
  function changeLabel(id, label) { updateState({ customTasks: customTasks.map(t => t.id === id ? { ...t, label: t.label === label ? null : label } : t) }); }
  function deleteItem(id) { const next = { ...checked }; delete next[id]; updateState({ customTasks: customTasks.filter(t => t.id !== id), checked: next }); }
  function addItem(section) { if (!newItemText.trim()) { setAddingSection(null); return; } const sectionItems = customTasks.filter(t => t.section === section); const maxOrder = sectionItems.reduce((m, t) => Math.max(m, t.order), -1); updateState({ customTasks: [...customTasks, { id: uid(), name: newItemText.trim(), timing: newItemTiming, tip: "", label: null, section, order: maxOrder + 1 }] }); setNewItemText(""); setAddingSection(null); }
  function addSection() { if (!newSectionName.trim()) { setShowAddSection(false); return; } updateState({ customTasks: [...customTasks, { id: uid(), name: "New item — click to edit", timing: "T1", tip: "", label: null, section: newSectionName.trim(), order: 0 }] }); setNewSectionName(""); setShowAddSection(false); }
  function deleteSection(section) { const remaining = customTasks.filter(t => t.section !== section); const nextChecked = { ...checked }; customTasks.filter(t => t.section === section).forEach(t => delete nextChecked[t.id]); updateState({ customTasks: remaining, checked: nextChecked }); }
  function onDragStart(id) { setDragId(id); }
  function onDragOver(e, id) { e.preventDefault(); setDragOverId(id); }
  function onDrop(section) { if (!dragId || !dragOverId || dragId === dragOverId) { setDragId(null); setDragOverId(null); return; } const si = customTasks.filter(t => t.section === section).sort((a, b) => a.order - b.order); const di = si.findIndex(t => t.id === dragId); const oi = si.findIndex(t => t.id === dragOverId); if (di === -1 || oi === -1) { setDragId(null); setDragOverId(null); return; } const re = [...si]; const [m] = re.splice(di, 1); re.splice(oi, 0, m); updateState({ customTasks: [...customTasks.filter(t => t.section !== section), ...re.map((t, i) => ({ ...t, order: i }))] }); setDragId(null); setDragOverId(null); }
  function getSortedItems(items) { if (sortMode === "trimester") { const o = { T1: 0, T2: 1, T3: 2, newborn: 3 }; return [...items].sort((a, b) => o[a.timing] - o[b.timing]); } if (sortMode === "status") { return [...items].sort((a, b) => (checked[a.id] ? 1 : 0) - (checked[b.id] ? 1 : 0)); } return items; }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[["Total", totalCount], ["Done", doneCount], ["Progress", pct + "%"], ["Left", totalCount - doneCount]].map(([l, v]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#F0EFEA", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: progressColor, borderRadius: 6, transition: "width 0.4s" }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {[{ key: "all", label: "All" }, { key: "T1", label: "1st trimester" }, { key: "T2", label: "2nd trimester" }, { key: "T3", label: "3rd trimester" }, { key: "newborn", label: "After birth" }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: filter === f.key ? "none" : "1px solid #ddd", background: filter === f.key ? "#1a1a1a" : "#fff", color: filter === f.key ? "#fff" : "#555" }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>Label:</span>
        <button onClick={() => setLabelFilter("all")} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: labelFilter === "all" ? "none" : "1px solid #ddd", background: labelFilter === "all" ? "#1a1a1a" : "#fff", color: labelFilter === "all" ? "#fff" : "#555" }}>All</button>
        {LABELS.map(lb => <button key={lb.key} onClick={() => setLabelFilter(lb.key === labelFilter ? "all" : lb.key)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "none", background: labelFilter === lb.key ? lb.color : lb.bg, color: labelFilter === lb.key ? "#fff" : lb.color, fontWeight: 600 }}>{lb.name}</button>)}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa", alignSelf: "center" }}>Sort:</span>
          {[["manual", "⠿ Manual"], ["trimester", "📅 Trimester"], ["status", "✓ Status"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setSortMode(key)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: sortMode === key ? "none" : "1px solid #ddd", background: sortMode === key ? "#1a1a1a" : "#fff", color: sortMode === key ? "#fff" : "#555" }}>{lbl}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map(section => {
          let items = section.items;
          if (filter !== "all") items = items.filter(i => i.timing === filter);
          if (labelFilter !== "all") items = items.filter(i => i.label === labelFilter);
          if (!items.length) return null;
          items = getSortedItems(items);
          const sectionDone = items.filter(i => checked[i.id]).length;
          const isOpen = openSections[section.section] !== false;
          const allDone = sectionDone === items.length && items.length > 0;
          return (
            <div key={section.section} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", background: allDone ? "#F6FBF7" : "#fff", padding: "12px 16px", gap: 8 }}>
                <button onClick={() => setOpenSections(p => ({ ...p, [section.section]: !isOpen }))} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                  <span style={{ fontSize: 18 }}>{section.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", flex: 1 }}>{section.section}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: allDone ? "#E1F5EE" : "#F0EFEA", color: allDone ? "#0F6E56" : "#888" }}>{sectionDone}/{items.length}</span>
                  <span style={{ fontSize: 14, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>
                <button onClick={() => { setAddingSection(section.section); setNewItemText(""); setNewItemTiming("T1"); }} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "3px 8px", cursor: "pointer", fontSize: 14, color: "#888" }}>+</button>
                <button onClick={() => { if (window.confirm(`Delete "${section.section}"?`)) deleteSection(section.section); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ddd", padding: "3px 6px" }}>🗑</button>
              </div>
              {addingSection === section.section && (
                <div style={{ padding: "10px 16px", borderTop: "1px solid #F0EFEA", background: "#FAFAF8", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input autoFocus value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addItem(section.section); if (e.key === "Escape") setAddingSection(null); }} placeholder="New task name..." style={{ flex: 1, minWidth: 180, padding: "7px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13 }} />
                  <select value={newItemTiming} onChange={e => setNewItemTiming(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, background: "#fff" }}>
                    <option value="T1">1st trimester</option><option value="T2">2nd trimester</option><option value="T3">3rd trimester</option><option value="newborn">After birth</option>
                  </select>
                  <button onClick={() => addItem(section.section)} style={{ padding: "7px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Add</button>
                  <button onClick={() => setAddingSection(null)} style={{ padding: "7px 10px", background: "none", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#888" }}>Cancel</button>
                </div>
              )}
              {isOpen && (
                <div style={{ borderTop: "1px solid #F0EFEA" }} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(section.section)}>
                  {items.map(item => {
                    const isDone = !!checked[item.id];
                    const meta = TIMING_META[item.timing];
                    const showTip = activeTip === item.id;
                    const isEditing = editingId === item.id;
                    return (
                      <div key={item.id} draggable={sortMode === "manual"} onDragStart={() => onDragStart(item.id)} onDragOver={e => onDragOver(e, item.id)} style={{ borderBottom: "1px solid #F8F8F6", background: dragOverId === item.id ? "#F0EFEA" : isDone ? "#FCFCFA" : "#fff" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 16px" }}>
                          {sortMode === "manual" && <span style={{ color: "#ccc", cursor: "grab", fontSize: 14, marginTop: 3, flexShrink: 0 }}>⠿</span>}
                          <div onClick={() => toggle(item.id)} style={{ width: 20, height: 20, borderRadius: 6, border: isDone ? "none" : "2px solid #D0CFC8", background: isDone ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            {isDone && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {isEditing ? (
                              <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") commitEdit(item.id); if (e.key === "Escape") setEditingId(null); }} onBlur={() => commitEdit(item.id)} style={{ width: "100%", padding: "4px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }} />
                            ) : (
                              <div style={{ fontSize: 14, color: isDone ? "#aaa" : "#1a1a1a", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.5 }} onDoubleClick={() => startEdit(item)}>{item.name}</div>
                            )}
                            <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                              <select value={item.timing} onChange={e => changeTiming(item.id, e.target.value)} style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 10, background: meta.bg, color: meta.color, border: "none", cursor: "pointer", appearance: "none" }}>
                                <option value="T1">1st trimester</option><option value="T2">2nd trimester</option><option value="T3">3rd trimester</option><option value="newborn">After birth</option>
                              </select>
                              <div style={{ display: "flex", gap: 3 }}>
                                {LABELS.map(lb => <button key={lb.key} onClick={() => changeLabel(item.id, lb.key)} title={lb.name} style={{ padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: item.label === lb.key ? lb.color : lb.bg, color: item.label === lb.key ? "#fff" : lb.color, opacity: item.label && item.label !== lb.key ? 0.4 : 1 }}>{lb.name}</button>)}
                              </div>
                              {item.tip && <button onClick={() => setActiveTip(showTip ? null : item.id)} style={{ fontSize: 11, color: "#888", background: "none", border: "1px solid #E0DFDA", borderRadius: 10, padding: "2px 8px", cursor: "pointer" }}>{showTip ? "hide tip" : "💡 tip"}</button>}
                            </div>
                            {showTip && <div style={{ marginTop: 8, padding: "10px 12px", background: "#FFFBF0", border: "1px solid #FAEEDA", borderRadius: 8, fontSize: 13, color: "#6B4800", lineHeight: 1.6 }}>{item.tip}</div>}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            <button onClick={() => startEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ccc" }}>✏️</button>
                            <button onClick={() => { if (window.confirm("Delete this task?")) deleteItem(item.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ccc" }}>🗑</button>
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
        {showAddSection ? (
          <div style={{ background: "#fff", border: "1px dashed #ddd", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 8 }}>
            <input autoFocus value={newSectionName} onChange={e => setNewSectionName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setShowAddSection(false); }} placeholder="Section name..." style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
            <button onClick={addSection} style={{ padding: "8px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Add</button>
            <button onClick={() => setShowAddSection(false)} style={{ padding: "8px 12px", background: "none", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#888" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowAddSection(true)} style={{ padding: "12px", background: "#fff", border: "1px dashed #ddd", borderRadius: 14, cursor: "pointer", fontSize: 13, color: "#aaa", textAlign: "center", width: "100%" }}>+ Add new section</button>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F0EFEA" }}>
            <span style={{ fontSize: 20 }}>📝</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>To-do</span>
            <span style={{ fontSize: 12, color: "#aaa" }}>{(state.todos || []).filter(t => !t.done).length} remaining</span>
          </div>
          <div style={{ padding: "12px 16px" }}><TodoInline state={state} updateState={updateState} /></div>
        </div>
      </div>
    </div>
  );
}

function TodoInline({ state, updateState }) {
  const todos = state.todos || [];
  const [input, setInput] = useState("");
  function addTodo() { if (!input.trim()) return; updateState({ todos: [...todos, { id: Date.now(), text: input.trim(), done: false }] }); setInput(""); }
  function toggleTodo(id) { updateState({ todos: todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }); }
  function deleteTodo(id) { updateState({ todos: todos.filter(t => t.id !== id) }); }
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} placeholder="Add a task..." style={{ flex: 1, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none" }} />
        <button onClick={addTodo} style={{ padding: "9px 16px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Add</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {todos.length === 0 && <div style={{ fontSize: 13, color: "#ccc", padding: "8px 0" }}>No tasks yet</div>}
        {todos.filter(t => !t.done).map(todo => (
          <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#FAFAF8", borderRadius: 8 }}>
            <div onClick={() => toggleTodo(todo.id)} style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid #D0CFC8", flexShrink: 0, cursor: "pointer" }} />
            <div style={{ flex: 1, fontSize: 14 }}>{todo.text}</div>
            <button onClick={() => deleteTodo(todo.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        ))}
        {todos.some(t => t.done) && <>
          <div style={{ fontSize: 11, color: "#ccc", margin: "6px 0 2px", textTransform: "uppercase", letterSpacing: 1 }}>Completed</div>
          {todos.filter(t => t.done).map(todo => (
            <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#FAFAF8", borderRadius: 8, opacity: 0.6 }}>
              <div onClick={() => toggleTodo(todo.id)} style={{ width: 18, height: 18, borderRadius: 5, background: "#1a1a1a", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: "#aaa", textDecoration: "line-through" }}>{todo.text}</div>
              <button onClick={() => deleteTodo(todo.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}

function BuyTab({ state, updateState }) {
  const items = state.buyItems || SEED_ITEMS;
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [registryFilter, setRegistryFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [editingBoughtBy, setEditingBoughtBy] = useState(null);
  const [boughtByInput, setBoughtByInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Other", priority: "Must-Have", price: "", notes: "", fromRegistry: false });

  const categories = ["all", ...Array.from(new Set(items.map(i => i.category)))];
  const purchased = items.filter(i => i.purchased).length;
  const totalSpend = items.filter(i => i.purchased).reduce((s, i) => s + (i.price || 0), 0);
  const totalEstimate = items.reduce((s, i) => s + (i.price || 0), 0);

  const filtered = items.filter(i => {
    if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
    if (statusFilter === "needed" && i.purchased) return false;
    if (statusFilter === "purchased" && !i.purchased) return false;
    if (registryFilter === "registry" && !i.fromRegistry) return false;
    if (registryFilter === "own" && i.fromRegistry) return false;
    return true;
  });

  function togglePurchased(id) { updateState({ buyItems: items.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i) }); }
  function saveBoughtBy(id) { updateState({ buyItems: items.map(i => i.id === id ? { ...i, boughtBy: boughtByInput } : i) }); setEditingBoughtBy(null); }
  function deleteItem(id) { updateState({ buyItems: items.filter(i => i.id !== id) }); }
  function addItem() { if (!newItem.name.trim()) return; updateState({ buyItems: [...items, { ...newItem, id: uid(), price: parseFloat(newItem.price) || 0, purchased: false, boughtBy: "" }] }); setNewItem({ name: "", category: "Other", priority: "Must-Have", price: "", notes: "", fromRegistry: false }); setShowAddForm(false); }

  const priorityColor = { "Must-Have": "#EF4444", "Nice-to-Have": "#F59E0B", "Consider Waiting": "#6B7280" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[["Items", items.length], ["Purchased", purchased], ["Spent", "$" + totalSpend.toLocaleString()], ["Est. remaining", "$" + (totalEstimate - totalSpend).toLocaleString()]].map(([l, v]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#F0EFEA", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${items.length ? Math.round(purchased / items.length * 100) : 0}%`, height: "100%", background: "#1D9E75", borderRadius: 6 }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#aaa", alignSelf: "center" }}>Status:</span>
        {[["all", "All"], ["needed", "Still needed"], ["purchased", "Purchased"]].map(([k, l]) => <button key={k} onClick={() => setStatusFilter(k)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: statusFilter === k ? "none" : "1px solid #ddd", background: statusFilter === k ? "#1a1a1a" : "#fff", color: statusFilter === k ? "#fff" : "#555" }}>{l}</button>)}
        <span style={{ fontSize: 12, color: "#aaa", alignSelf: "center", marginLeft: 4 }}>Source:</span>
        {[["all", "All"], ["registry", "Registry"], ["own", "Buying ourselves"]].map(([k, l]) => <button key={k} onClick={() => setRegistryFilter(k)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: registryFilter === k ? "none" : "1px solid #ddd", background: registryFilter === k ? "#1a1a1a" : "#fff", color: registryFilter === k ? "#fff" : "#555" }}>{l}</button>)}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#aaa", alignSelf: "center" }}>Category:</span>
        {categories.map(c => <button key={c} onClick={() => setCategoryFilter(c)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: categoryFilter === c ? "none" : "1px solid #ddd", background: categoryFilter === c ? "#1a1a1a" : "#fff", color: categoryFilter === c ? "#fff" : "#555", whiteSpace: "nowrap" }}>{c === "all" ? "All" : c}</button>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden", opacity: item.purchased ? 0.75 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                <div onClick={e => { e.stopPropagation(); togglePurchased(item.id); }} style={{ width: 20, height: 20, borderRadius: 6, border: item.purchased ? "none" : "2px solid #D0CFC8", background: item.purchased ? "#1D9E75" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {item.purchased && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: item.purchased ? "#aaa" : "#1a1a1a", textDecoration: item.purchased ? "line-through" : "none", lineHeight: 1.4 }}>{item.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{item.category}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: priorityColor[item.priority] || "#888" }}>{item.priority}</span>
                    {item.fromRegistry && <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: "#E6F1FB", color: "#185FA5", fontWeight: 600 }}>Registry</span>}
                    {item.boughtBy && <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: "#E1F5EE", color: "#0F6E56" }}>Gift from: {item.boughtBy}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", flexShrink: 0 }}>{item.price ? `$${item.price.toLocaleString()}` : "—"}</div>
                <span style={{ fontSize: 14, color: "#bbb", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </div>
              {isExpanded && (
                <div style={{ borderTop: "1px solid #F0EFEA", padding: "12px 14px", background: "#FAFAF8" }}>
                  {item.notes && <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>{item.notes}</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#aaa" }}>Gift from / bought by:</span>
                    {editingBoughtBy === item.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input autoFocus value={boughtByInput} onChange={e => setBoughtByInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveBoughtBy(item.id); if (e.key === "Escape") setEditingBoughtBy(null); }} placeholder="Name..." style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, width: 140 }} />
                        <button onClick={() => saveBoughtBy(item.id)} style={{ padding: "4px 10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Save</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingBoughtBy(item.id); setBoughtByInput(item.boughtBy || ""); }} style={{ fontSize: 12, color: "#888", background: "none", border: "1px solid #E0DFDA", borderRadius: 8, padding: "3px 10px", cursor: "pointer" }}>
                        {item.boughtBy ? `✏️ ${item.boughtBy}` : "+ Add name"}
                      </button>
                    )}
                    <button onClick={() => { if (window.confirm("Delete this item?")) deleteItem(item.id); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13 }}>🗑 Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "40px 0" }}>No items match your filters</div>}
      </div>
      <div style={{ marginTop: 16 }}>
        {showAddForm ? (
          <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add item</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="Item name *" style={{ padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} placeholder="Category" style={{ flex: 1, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
                <input value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} placeholder="Price $" style={{ width: 100, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={newItem.priority} onChange={e => setNewItem(p => ({ ...p, priority: e.target.value }))} style={{ flex: 1, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, background: "#fff" }}>
                  <option>Must-Have</option><option>Nice-to-Have</option><option>Consider Waiting</option>
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", padding: "0 4px" }}>
                  <input type="checkbox" checked={newItem.fromRegistry} onChange={e => setNewItem(p => ({ ...p, fromRegistry: e.target.checked }))} />From registry
                </label>
              </div>
              <input value={newItem.notes} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" style={{ padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addItem} style={{ flex: 1, padding: "10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Add item</button>
                <button onClick={() => setShowAddForm(false)} style={{ padding: "10px 16px", background: "none", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#888" }}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{ width: "100%", padding: "12px", background: "#fff", border: "1px dashed #ddd", borderRadius: 14, cursor: "pointer", fontSize: 13, color: "#aaa" }}>+ Add item</button>
        )}
      </div>
    </div>
  );
}

function BudgetTab({ state, updateState }) {
  const actuals = state.actuals || {};
  const [editing, setEditing] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [view, setView] = useState("pre");
  const data = view === "pre" ? BUDGET_PRE : BUDGET_FIRST_YEAR;
  const totalEstimate = data.flatMap(c => c.items).reduce((s, i) => s + i.estimate, 0);
  const totalActual = Object.entries(actuals).filter(([k]) => k.startsWith(view + "||")).reduce((s, [, v]) => s + (parseFloat(v) || 0), 0);
  function startEdit(key, current) { setEditing(key); setInputVal(current !== undefined ? String(current) : ""); }
  function commitEdit(key) { const val = parseFloat(inputVal); const next = { ...actuals }; if (isNaN(val) || inputVal.trim() === "") { delete next[key]; } else { next[key] = val; } updateState({ actuals: next }); setEditing(null); }
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setView("pre")} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: view === "pre" ? "none" : "1px solid #ddd", background: view === "pre" ? "#1a1a1a" : "#fff", color: view === "pre" ? "#fff" : "#555", fontWeight: 500 }}>Before baby arrives</button>
        <button onClick={() => setView("year1")} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: view === "year1" ? "none" : "1px solid #ddd", background: view === "year1" ? "#1a1a1a" : "#fff", color: view === "year1" ? "#fff" : "#555", fontWeight: 500 }}>First year with baby</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>Estimated total</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>${totalEstimate.toLocaleString()}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>Your actual spend</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: totalActual > totalEstimate ? "#C0392B" : "#1D9E75" }}>${totalActual.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>click any row to enter</div>
        </div>
      </div>
      {data.map(cat => (
        <div key={cat.category} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "12px 16px", background: "#FAFAF8", borderBottom: "1px solid #F0EFEA", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{cat.category}</div>
          {cat.items.map(item => {
            const key = `${view}||${cat.category}||${item.name}`;
            const actual = actuals[key];
            const isEditing = editing === key;
            return (
              <div key={item.name} onClick={() => !isEditing && startEdit(key, actual)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid #F8F8F6", cursor: "pointer" }}>
                <div style={{ flex: 1, fontSize: 13, color: "#333" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#bbb", marginRight: 8 }}>${item.estimate.toLocaleString()}</div>
                {isEditing ? (
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <input autoFocus value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") commitEdit(key); if (e.key === "Escape") setEditing(null); }} placeholder="0" style={{ width: 80, padding: "4px 8px", border: "1px solid #ccc", borderRadius: 8, fontSize: 13 }} />
                    <button onClick={() => commitEdit(key)} style={{ padding: "4px 10px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Save</button>
                  </div>
                ) : (
                  <div style={{ minWidth: 70, textAlign: "right", fontSize: 13, fontWeight: 600, color: actual !== undefined ? "#1D9E75" : "#ddd" }}>{actual !== undefined ? `$${Number(actual).toLocaleString()}` : "—"}</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DoctorTab({ state, updateState }) {
  const customQs = state.customQs || {};
  const answeredQs = state.answeredQs || {};
  const [activePhase, setActivePhase] = useState("all");
  const [newQ, setNewQ] = useState("");
  const [newQPhase, setNewQPhase] = useState("T3");
  const phaseKeys = ["T1", "T2", "T3", "newborn"];
  const TIMING_LABELS = { T1: "1st trimester", T2: "2nd trimester", T3: "3rd trimester", newborn: "After birth" };
  const TIMING_COLORS = { T1: { bg: "#E1F5EE", color: "#0F6E56" }, T2: { bg: "#E6F1FB", color: "#185FA5" }, T3: { bg: "#FAEEDA", color: "#854F0B" }, newborn: { bg: "#EEEDFE", color: "#3C3489" } };
  const totalQ = phaseKeys.reduce((s, p) => s + (DOCTOR_QUESTIONS[p] || []).length + (customQs[p] || []).length, 0);
  const answeredCount = Object.values(answeredQs).filter(Boolean).length;
  function toggleAnswered(key) { updateState({ answeredQs: { ...answeredQs, [key]: !answeredQs[key] } }); }
  function addQuestion() { if (!newQ.trim()) return; const phase = activePhase === "all" ? newQPhase : activePhase; const existing = customQs[phase] || []; updateState({ customQs: { ...customQs, [phase]: [...existing, { id: Date.now(), text: newQ.trim() }] } }); setNewQ(""); }
  function deleteCustomQ(phase, id) { updateState({ customQs: { ...customQs, [phase]: (customQs[phase] || []).filter(q => q.id !== id) } }); }
  const phasesToShow = activePhase === "all" ? phaseKeys : [activePhase];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#aaa" }}>{answeredCount} of {totalQ} asked</div>
        <div style={{ flex: 1, background: "#F0EFEA", borderRadius: 6, height: 5, overflow: "hidden" }}>
          <div style={{ width: `${totalQ ? Math.round(answeredCount / totalQ * 100) : 0}%`, height: "100%", background: "#1D9E75", borderRadius: 6, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ key: "all", label: "All questions" }, { key: "T1", label: "1st trimester" }, { key: "T2", label: "2nd trimester" }, { key: "T3", label: "3rd trimester" }, { key: "newborn", label: "After birth" }].map(p => (
          <button key={p.key} onClick={() => setActivePhase(p.key)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: activePhase === p.key ? "none" : "1px solid #ddd", background: activePhase === p.key ? "#1a1a1a" : "#fff", color: activePhase === p.key ? "#fff" : "#555" }}>{p.label}</button>
        ))}
      </div>
      {phasesToShow.map(phase => {
        const preloaded = DOCTOR_QUESTIONS[phase] || [];
        const custom = customQs[phase] || [];
        const tc = TIMING_COLORS[phase];
        return (
          <div key={phase} style={{ marginBottom: 24 }}>
            {activePhase === "all" && <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: tc.bg, color: tc.color, marginBottom: 10 }}>{TIMING_LABELS[phase]}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {preloaded.map((q, i) => {
                const key = `${phase}||pre||${i}`;
                const done = !!answeredQs[key];
                return (
                  <div key={i} onClick={() => toggleAnswered(key)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", background: "#fff", border: "1px solid #EBEBEB", borderRadius: 10, cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: done ? "none" : "2px solid #D0CFC8", background: done ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 14, color: done ? "#aaa" : "#1a1a1a", textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{q}</div>
                  </div>
                );
              })}
              {custom.map(q => {
                const key = `${phase}||custom||${q.id}`;
                const done = !!answeredQs[key];
                return (
                  <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", background: "#fff", border: "1px solid #EBEBEB", borderRadius: 10 }}>
                    <div onClick={() => toggleAnswered(key)} style={{ width: 18, height: 18, borderRadius: 5, border: done ? "none" : "2px solid #D0CFC8", background: done ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, fontSize: 14, color: done ? "#aaa" : "#1a1a1a", textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{q.text}</div>
                    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: "#F0EFEA", color: "#888", flexShrink: 0 }}>custom</span>
                    <button onClick={() => deleteCustomQ(phase, q.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>Add a question</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === "Enter" && addQuestion()} placeholder="Your question..." style={{ flex: 1, minWidth: 180, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none" }} />
          {activePhase === "all" && (
            <select value={newQPhase} onChange={e => setNewQPhase(e.target.value)} style={{ padding: "9px 12px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, background: "#fff" }}>
              <option value="T1">1st trimester</option><option value="T2">2nd trimester</option><option value="T3">3rd trimester</option><option value="newborn">After birth</option>
            </select>
          )}
          <button onClick={addQuestion} style={{ padding: "9px 18px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Add</button>
        </div>
      </div>
    </div>
  );
}

function MealsTab() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>Freezer-friendly meals to batch cook before baby arrives.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MEALS.map((meal, i) => {
          const isOpen = open === i;
          return (
            <div key={meal.name} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : i)} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 24 }}>🍲</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{meal.name}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{meal.time} · {meal.servings}</div>
                </div>
                <span style={{ fontSize: 16, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </button>
              {isOpen && (
                <div style={{ borderTop: "1px solid #F0EFEA", padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Ingredients</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {meal.ingredients.map((ing, j) => <div key={j} style={{ display: "flex", gap: 8, fontSize: 14, color: "#333" }}><span style={{ color: "#ccc" }}>•</span><span>{ing}</span></div>)}
                  </div>
                  <div style={{ padding: "10px 12px", background: "#FFFBF0", border: "1px solid #FAEEDA", borderRadius: 8, fontSize: 13, color: "#6B4800", lineHeight: 1.6 }}>💡 {meal.tip}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}