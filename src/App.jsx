import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

// ─── STATIC DATA (used only to seed Firebase the first time) ─────────────────

const SEED_TASKS = [
  { section: "Healthcare & insurance", icon: "🏥", items: [
    { id: "h1", name: "Confirm OB/GYN or midwife and schedule first prenatal appointment", timing: "T1", tip: "Ask about group prenatal care options like Centering Pregnancy.", label: null, order: 0 },
    { id: "h2", name: "Notify health insurance of pregnancy and review maternity coverage", timing: "T1", tip: "Find out your deductible, out-of-pocket max, and which hospitals are in-network.", label: null, order: 1 },
    { id: "h3", name: "Understand your deductible, out-of-pocket max, and in-network hospitals", timing: "T1", tip: "Call your insurer and get specifics in writing.", label: null, order: 2 },
    { id: "h4", name: "Research and choose a pediatrician before the birth", timing: "T2", tip: "Most pediatricians offer free meet-and-greet appointments.", label: null, order: 3 },
    { id: "h5", name: "Schedule anatomy ultrasound (around 20 weeks)", timing: "T2", tip: "This scan checks for structural development and can reveal the sex if you want to know.", label: null, order: 4 },
    { id: "h6", name: "Complete glucose screening test (24–28 weeks)", timing: "T2", tip: "Screens for gestational diabetes. Eat normally beforehand.", label: null, order: 5 },
    { id: "h7", name: "Tour your birth hospital or birthing center", timing: "T2", tip: "Ask about parking, visitor policies, and what's included in the room.", label: null, order: 6 },
    { id: "h8", name: "Finalize birth plan and share with OB or midwife", timing: "T3", tip: "Keep it to one page. Include preferences for pain management, labor support, and immediate newborn care.", label: null, order: 7 },
    { id: "h9", name: "Pre-register at the hospital or birth center", timing: "T3", tip: "Doing this now saves precious time when you arrive in labor.", label: null, order: 8 },
    { id: "h10", name: "Schedule Group B Strep test (~36 weeks)", timing: "T3", tip: "A simple swab test — affects your IV antibiotic plan during labor if positive.", label: null, order: 9 },
    { id: "h11", name: "Confirm pediatrician accepts your insurance", timing: "T3", tip: "Call both the office and your insurer to double-check.", label: null, order: 10 },
    { id: "h12", name: "Add baby to health insurance within 30 days of birth", timing: "newborn", tip: "Missing this window is a big deal — it's a special enrollment period. Set a calendar reminder now.", label: null, order: 11 },
  ]},
  { section: "Budget & finances", icon: "💰", items: [
    { id: "b1", name: "Create a new baby budget covering diapers, formula/breastfeeding, childcare", timing: "T1", tip: "Budget $15,000–$20,000+ for the first year. Childcare alone can be $15k–$30k annually.", label: null, order: 0 },
    { id: "b2", name: "Review and update life insurance coverage", timing: "T1", tip: "Term life insurance is affordable and critical once you have a dependent.", label: null, order: 1 },
    { id: "b3", name: "Look into disability insurance for parental leave income protection", timing: "T1", tip: "Short-term disability can replace part of your income during leave.", label: null, order: 2 },
    { id: "b4", name: "Research your FMLA and parental leave policy with your employer", timing: "T1", tip: "Check what paid leave your employer offers and how to apply.", label: null, order: 3 },
    { id: "b5", name: "Open or fund a 529 college savings account", timing: "T2", tip: "Many states offer a tax deduction for contributions to a 529 plan.", label: null, order: 4 },
    { id: "b6", name: "Update or create your will and designate a guardian", timing: "T2", tip: "This is the single most important legal document for new parents.", label: null, order: 5 },
    { id: "b7", name: "Set aside emergency fund of 3–6 months of expenses", timing: "T2", tip: "A new baby is unpredictable — a cushion prevents debt spirals from unexpected costs.", label: null, order: 6 },
    { id: "b8", name: "File for tax credits like Child Tax Credit and Dependent Care FSA", timing: "newborn", tip: "The Child Tax Credit is $2,000/child. A Dependent Care FSA lets you use pre-tax dollars for childcare.", label: null, order: 7 },
    { id: "b9", name: "Apply for Social Security number for the baby", timing: "newborn", tip: "You can do this at the hospital at birth — it's the easiest time.", label: null, order: 8 },
  ]},
  { section: "Childcare & daycare", icon: "🍼", items: [
    { id: "c1", name: "Research childcare options — daycare, nanny, family, au pair", timing: "T1", tip: "Daycare can have 6–18 month waitlists. Start researching immediately.", label: null, order: 0 },
    { id: "c2", name: "Tour daycare centers in your area", timing: "T1", tip: "Look for low staff turnover, cleanliness, and how caregivers interact with babies.", label: null, order: 1 },
    { id: "c3", name: "Get on daycare waitlists as early as possible", timing: "T1", tip: "Put yourself on multiple lists. You can always decline when the time comes.", label: null, order: 2 },
    { id: "c4", name: "Compare costs and get contracts reviewed", timing: "T2", tip: "Watch for deposit forfeiture clauses, illness policies, and rate increase terms.", label: null, order: 3 },
    { id: "c5", name: "If hiring a nanny, begin interviewing process", timing: "T2", tip: "Background checks, references, and a trial period are non-negotiables.", label: null, order: 4 },
    { id: "c6", name: "Finalize childcare arrangements and sign contracts", timing: "T3", tip: "Confirm your start date and ask about their settling-in process for newborns.", label: null, order: 5 },
    { id: "c7", name: "Set up Dependent Care FSA if available through your employer", timing: "T3", tip: "Max contribution is $5,000/year — covers daycare, nannies, and preschool.", label: null, order: 6 },
  ]},
  { section: "Nursery & home prep", icon: "🏠", items: [
    { id: "n1", name: "Decide on nursery room and start decluttering", timing: "T1", tip: "You don't need much space — a crib, dresser/changer combo, and a glider are the essentials.", label: null, order: 0 },
    { id: "n2", name: "Research and choose crib or bassinet and mattress", timing: "T2", tip: "The mattress matters more than the crib. Choose firm, flat, and breathable.", label: null, order: 1 },
    { id: "n3", name: "Paint or prep the nursery (avoid fumes — ventilate well)", timing: "T2", tip: "Use low-VOC paint and keep the room well-ventilated for a few days after painting.", label: null, order: 2 },
    { id: "n4", name: "Assemble crib, dresser, and changing table", timing: "T2", tip: "Anchor all furniture to the wall — tip-over accidents are a leading cause of injury.", label: null, order: 3 },
    { id: "n5", name: "Install baby monitors, outlet covers, and cabinet locks", timing: "T3", tip: "Video monitors with temperature readouts are especially useful.", label: null, order: 4 },
    { id: "n6", name: "Wash all baby clothes, bedding, and blankets in fragrance-free detergent", timing: "T3", tip: "Dreft or All Free & Clear are popular picks.", label: null, order: 5 },
    { id: "n7", name: "Organize and stock the changing station", timing: "T3", tip: "Stock with diapers, wipes, diaper cream, extra onesies, and a waterproof liner.", label: null, order: 6 },
    { id: "n8", name: "Install and inspect car seat — many fire stations offer free checks", timing: "T3", tip: "Infant seats must be rear-facing. Most are misinstalled — always get it checked.", label: null, order: 7 },
    { id: "n9", name: "Babyproof sharp corners and secure bookshelves to walls", timing: "T3", tip: "Even pre-mobile babies end up in surprising places fast.", label: null, order: 8 },
    { id: "n10", name: "Set up bassinet in your bedroom for the first few months", timing: "T3", tip: "AAP recommends room-sharing (not bed-sharing) for the first 6 months.", label: null, order: 9 },
  ]},
  { section: "What to buy", icon: "🛒", items: [
    { id: "w1", name: "Create a baby registry", timing: "T1", tip: "Do Target and Amazon — completion discounts are real savings after the shower.", label: null, order: 0 },
    { id: "w2", name: "Research and purchase infant car seat", timing: "T2", tip: "Chicco KeyFit, Graco SnugRide, and Britax B-Safe are consistently top-rated.", label: null, order: 1 },
    { id: "w3", name: "Purchase stroller — test it in-store if possible", timing: "T2", tip: "Think about how it fits in your car and folds. Ease matters a lot day-to-day.", label: null, order: 2 },
    { id: "w4", name: "Baby carrier or wrap", timing: "T2", tip: "Ergobaby Embrace and Solly Baby Wrap are popular for newborns. Try before you buy.", label: null, order: 3 },
    { id: "w5", name: "Breast pump — often covered 100% by insurance", timing: "T2", tip: "Get a prescription from your OB and order through your insurer's preferred supplier.", label: null, order: 4 },
    { id: "w6", name: "Stock up on newborn and 0–3 month clothing", timing: "T2", tip: "Don't overbuy newborn size — many babies skip it entirely. 0–3 month goes much further.", label: null, order: 5 },
    { id: "w7", name: "White noise machine", timing: "T2", tip: "Hatch Rest is beloved for its sleep timer and gentle wake feature.", label: null, order: 6 },
    { id: "w8", name: "Baby bathtub and bath supplies", timing: "T3", tip: "The Puj Tub or 4moms Infant Tub are popular newborn picks.", label: null, order: 7 },
    { id: "w9", name: "Bottles, nipples, and bottle brush — even if breastfeeding", timing: "T3", tip: "Try a few different brands before committing — babies can be picky about nipple flow.", label: null, order: 8 },
    { id: "w10", name: "Diapers and wipes — don't overbuy newborn size", timing: "T3", tip: "Get one pack of newborn, then stock size 1 and 2.", label: null, order: 9 },
    { id: "w11", name: "Swaddle blankets and sleep sacks", timing: "T3", tip: "HALO SleepSack and Aden + Anais muslin swaddles are crowd favorites.", label: null, order: 10 },
    { id: "w12", name: "Diaper bag stocked and ready to go", timing: "T3", tip: "Pack extra outfits, diapers, wipes, a changing pad, snacks for you, and a burp cloth.", label: null, order: 11 },
    { id: "w13", name: "Thermometer, nasal aspirator, and baby nail file", timing: "T3", tip: "Frida Baby NoseFrida and their nail kit are practically cult items for new parents.", label: null, order: 12 },
    { id: "w14", name: "Formula on hand as backup even if planning to breastfeed", timing: "T3", tip: "Supply can be unpredictable in the early days. Having some on hand reduces stress.", label: null, order: 13 },
  ]},
  { section: "Birthing & parenting classes", icon: "📚", items: [
    { id: "cl1", name: "Enroll in childbirth or Lamaze class — fills up quickly", timing: "T2", tip: "Your hospital likely offers classes. Also check Lamaze.org and local doulas.", label: null, order: 0 },
    { id: "cl2", name: "Take a breastfeeding class or consult a lactation consultant", timing: "T2", tip: "Many insurance plans cover lactation consultant visits. Book one before the birth too.", label: null, order: 1 },
    { id: "cl3", name: "Take an infant CPR and first aid class", timing: "T2", tip: "American Red Cross and local hospitals offer hands-on classes. Bring your partner.", label: null, order: 2 },
    { id: "cl4", name: "Take a newborn care class — bathing, swaddling, diapering", timing: "T3", tip: "Even 2 hours of practice before birth makes the first week dramatically calmer.", label: null, order: 3 },
  ]},
  { section: "Go bag & hospital prep", icon: "🎒", items: [
    { id: "g1", name: "Start researching what to pack in your hospital bag", timing: "T2", tip: "Pack separately for mom, partner, and baby — three zones makes it easy to find things.", label: null, order: 0 },
    { id: "g2", name: "Pack the hospital go bag", timing: "T3", tip: "For mom: lip balm, hair ties, slippers, snacks, phone charger, toiletries. For baby: first outfit, swaddle, car seat.", label: null, order: 1 },
    { id: "g3", name: "Save the hospital's number and know the route", timing: "T3", tip: "Do a practice drive, especially to know the parking situation at night.", label: null, order: 2 },
    { id: "g4", name: "Arrange pet or child care for during labor", timing: "T3", tip: "Have a backup person lined up — labor doesn't always give you much notice.", label: null, order: 3 },
    { id: "g5", name: "Set up a contact list to notify after birth", timing: "T3", tip: "Designate one person to spread the news so you're not texting 40 people while recovering.", label: null, order: 4 },
    { id: "g6", name: "Discuss and confirm your support person and birth team", timing: "T3", tip: "A doula can significantly reduce labor duration and C-section rates.", label: null, order: 5 },
  ]},
  { section: "Self-care & wellbeing", icon: "💚", items: [
    { id: "s1", name: "Start or continue prenatal vitamins with folic acid, DHA, and iron", timing: "T1", tip: "Take with food to reduce nausea. DHA supports baby's brain development.", label: null, order: 0 },
    { id: "s2", name: "Review all medications with your OB for safety during pregnancy", timing: "T1", tip: "This includes supplements, OTC meds, and anything herbal.", label: null, order: 1 },
    { id: "s3", name: "Discuss mental health and postpartum depression awareness with your OB", timing: "T2", tip: "Postpartum depression affects 1 in 5 new mothers. Having a plan makes a real difference.", label: null, order: 2 },
    { id: "s4", name: "Arrange meal prep or meal delivery for postpartum recovery", timing: "T3", tip: "Set up a meal train with friends/family, or subscribe to a delivery service for the first month.", label: null, order: 3 },
    { id: "s5", name: "Identify a postpartum support network — family, friends, or doula", timing: "T3", tip: "A postpartum doula can help with night feeds, baby care, and household tasks.", label: null, order: 4 },
    { id: "s6", name: "Schedule your postpartum OB check-up in advance", timing: "T3", tip: "The standard is 6 weeks, but ask about an earlier check-in at 2–3 weeks if you need it.", label: null, order: 5 },
  ]},
  { section: "Legal & admin", icon: "📋", items: [
    { id: "l1", name: "Update beneficiaries on all accounts — 401k, IRA, life insurance", timing: "T1", tip: "Beneficiary designations on accounts override the will.", label: null, order: 0 },
    { id: "l2", name: "Update or create your will", timing: "T2", tip: "An estate attorney can do this for $500–$2,000. Online services like Trust & Will are cheaper.", label: null, order: 1 },
    { id: "l3", name: "Designate a legal guardian for the baby in your will", timing: "T2", tip: "Talk to your chosen guardian first — make sure they're willing and prepared.", label: null, order: 2 },
    { id: "l4", name: "Prepare FMLA and parental leave paperwork with HR", timing: "T3", tip: "Give HR at least 30 days notice. FMLA requires 12 months of employment to qualify.", label: null, order: 3 },
    { id: "l5", name: "Register baby's birth and obtain birth certificate", timing: "newborn", tip: "Usually done at the hospital. You'll need this for everything — insurance, passport, school.", label: null, order: 4 },
    { id: "l6", name: "Apply for baby's Social Security number at the hospital or SSA", timing: "newborn", tip: "Doing it at the hospital is the fastest option.", label: null, order: 5 },
    { id: "l7", name: "Update auto and home or renter's insurance if needed", timing: "newborn", tip: "Your home policy may cover baby items. Check if you need riders for expensive gear.", label: null, order: 6 },
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
  { key: "wife", name: "Wife", color: "#EC4899", bg: "#FDF2F8" },
  { key: "both", name: "Both", color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "urgent", name: "Urgent", color: "#EF4444", bg: "#FEF2F2" },
];

const BUDGET_CATEGORIES = [
  { category: "Nursery & furniture", items: [
    { name: "Crib or bassinet", estimate: 200 }, { name: "Crib mattress", estimate: 150 },
    { name: "Dresser / changing table", estimate: 300 }, { name: "Glider or rocking chair", estimate: 250 },
    { name: "Baby monitor", estimate: 100 }, { name: "Nursery decor & lighting", estimate: 150 },
  ]},
  { category: "Gear & equipment", items: [
    { name: "Infant car seat", estimate: 250 }, { name: "Stroller", estimate: 400 },
    { name: "Baby carrier or wrap", estimate: 80 }, { name: "Breast pump (check insurance first)", estimate: 0 },
    { name: "White noise machine", estimate: 60 }, { name: "Baby swing or bouncer", estimate: 120 },
    { name: "Baby bathtub", estimate: 40 },
  ]},
  { category: "Feeding", items: [
    { name: "Bottles and nipples", estimate: 50 }, { name: "Bottle brush and sterilizer", estimate: 30 },
    { name: "Breastfeeding supplies (pads, cream, nursing pillow)", estimate: 80 },
    { name: "Formula (monthly, if not breastfeeding)", estimate: 150 },
    { name: "Lactation consultant visits", estimate: 200 },
  ]},
  { category: "Clothing & linens", items: [
    { name: "Newborn clothing (0–3 months)", estimate: 150 },
    { name: "Swaddle blankets and sleep sacks", estimate: 80 },
    { name: "Crib sheets and waterproof mattress covers", estimate: 60 },
  ]},
  { category: "Diapers & hygiene", items: [
    { name: "Diapers — monthly cost", estimate: 80 }, { name: "Wipes — monthly cost", estimate: 30 },
    { name: "Diaper bag", estimate: 60 }, { name: "Thermometer, nail file, nasal aspirator", estimate: 40 },
    { name: "Baby wash, lotion, diaper cream", estimate: 30 },
  ]},
  { category: "Healthcare & classes", items: [
    { name: "Prenatal vitamins (monthly)", estimate: 25 }, { name: "Childbirth class", estimate: 150 },
    { name: "Infant CPR class", estimate: 50 }, { name: "Pediatrician copays (first year)", estimate: 300 },
    { name: "Hospital delivery out-of-pocket", estimate: 1500 },
  ]},
  { category: "Childcare", items: [
    { name: "Daycare (monthly)", estimate: 1800 }, { name: "Backup care or sick days", estimate: 200 },
  ]},
  { category: "Legal & admin", items: [
    { name: "Will and estate planning", estimate: 800 }, { name: "Life insurance (annual premium)", estimate: 400 },
    { name: "529 college savings (initial contribution)", estimate: 500 },
  ]},
];

const DOCTOR_QUESTIONS = {
  T1: ["What prenatal vitamins do you recommend?","Which medications are safe to take during pregnancy?","What foods and drinks should I avoid?","What are the signs of a miscarriage I should watch for?","How much weight gain is expected?","What genetic tests or screenings do you recommend?","Can I continue my current exercise routine?","When should I call the office vs. go to the ER?"],
  T2: ["What does the anatomy ultrasound check for?","What is the glucose screening test and how should I prepare?","Should I start kick counts and when?","When should I tour the birth hospital?","What are signs of preterm labor?","Can I travel during this trimester?","What are my options for pain management during labor?","Should I see a lactation consultant before the birth?"],
  T3: ["What are the signs that labor has started?","When should we head to the hospital?","What does Group B Strep positive mean for my birth plan?","What happens if I go past my due date?","Can you walk me through what a C-section involves if needed?","What should I know about delayed cord clamping and skin-to-skin?","What postpartum symptoms should I call about right away?","When is my postpartum follow-up appointment?"],
  newborn: ["What are normal newborn behaviors vs. warning signs?","How do I know if baby is getting enough to eat?","What is the recommended sleep position and setup?","When does baby need their first pediatrician visit?","What vaccinations does baby get at birth and in the first weeks?","What are signs of postpartum depression I should watch for in myself?","When can we take baby out in public?"],
};

const MEALS = [
  { name: "Slow cooker chicken soup", time: "20 min prep", servings: "8 servings", ingredients: ["1 whole chicken or 4 bone-in thighs","4 carrots, chopped","4 celery stalks, chopped","1 onion, diced","4 cloves garlic","8 cups chicken broth","2 tsp salt","1 tsp black pepper","1 tsp thyme","2 cups egg noodles (add last 30 min)"], tip: "Freeze in quart containers. Skip the noodles when freezing — add fresh when reheating." },
  { name: "Beef & vegetable lasagna", time: "45 min prep", servings: "12 servings", ingredients: ["1 lb ground beef","1 jar marinara sauce (24 oz)","12 lasagna noodles, cooked","15 oz ricotta cheese","2 cups shredded mozzarella","½ cup parmesan","1 egg","2 cups spinach","1 tsp Italian seasoning","Salt and pepper"], tip: "Make two pans — eat one now, freeze one unbaked. Thaw overnight in fridge before baking at 375°F for 50 min." },
  { name: "Turkey & black bean chili", time: "30 min prep", servings: "10 servings", ingredients: ["1.5 lb ground turkey","2 cans black beans, drained","1 can diced tomatoes","1 can tomato sauce","1 onion, diced","1 red pepper, diced","3 cloves garlic","2 tbsp chili powder","1 tsp cumin","1 tsp smoked paprika","Salt to taste"], tip: "Freezes perfectly. Serve with shredded cheese, sour cream, and cornbread." },
  { name: "Baked ziti", time: "25 min prep", servings: "10 servings", ingredients: ["1 lb ziti pasta, cooked","1 lb Italian sausage or ground beef","1 jar marinara (24 oz)","15 oz ricotta","2 cups shredded mozzarella","½ cup parmesan","1 tsp garlic powder","1 tsp Italian seasoning"], tip: "Assemble in a foil pan for easy freezing. Cover tightly with foil. Bake at 375°F covered 30 min, uncovered 15 min." },
  { name: "Chicken and rice casserole", time: "15 min prep", servings: "8 servings", ingredients: ["4 boneless chicken breasts","2 cups long-grain white rice","4 cups chicken broth","1 can cream of mushroom soup","1 cup frozen peas","1 onion, diced","2 cloves garlic","1 tsp garlic powder","Salt and pepper","1 cup shredded cheddar (topping)"], tip: "Great one-pan meal. Add cheese on top before baking the last 10 minutes for a golden crust." },
  { name: "Lentil and vegetable soup", time: "15 min prep", servings: "8 servings", ingredients: ["2 cups red or green lentils","4 carrots, chopped","3 celery stalks, chopped","1 onion, diced","3 cloves garlic","1 can diced tomatoes","8 cups vegetable broth","2 tsp cumin","1 tsp turmeric","1 tsp coriander","Juice of 1 lemon","Salt and pepper"], tip: "Naturally vegan and packed with protein. Lemon juice added at the end brightens the flavor." },
  { name: "Sheet pan meatballs", time: "20 min prep", servings: "40 meatballs", ingredients: ["2 lb ground beef or turkey","½ cup breadcrumbs","¼ cup parmesan","2 eggs","3 cloves garlic, minced","2 tbsp fresh parsley","1 tsp Italian seasoning","1 tsp salt","½ tsp black pepper"], tip: "Bake at 400°F for 20 min. Freeze in a single layer on a sheet, then transfer to a bag. Use in pasta, subs, or soup." },
  { name: "Banana oat muffins", time: "10 min prep", servings: "12 muffins", ingredients: ["3 ripe bananas, mashed","2 cups rolled oats","2 eggs","¼ cup honey or maple syrup","1 tsp vanilla","1 tsp baking powder","½ tsp cinnamon","Pinch of salt","Optional: chocolate chips, walnuts, or blueberries"], tip: "No flour needed. Great for a quick breakfast in the early newborn weeks. Freeze and microwave for 45 seconds." },
];

const DEFAULT_TODOS = [
  { id: 1, text: "Notify each of our employers about the pregnancy", done: false },
  { id: 2, text: "Decide on when to take leave", done: false },
  { id: 3, text: "Look into company resources for new parents", done: false },
];

const DOC_REF = () => doc(db, "babyprep", "shared");

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState({ todos: DEFAULT_TODOS });
  const [activeTab, setActiveTab] = useState("checklist");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(DOC_REF(), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (!data.todos) data.todos = DEFAULT_TODOS;
        if (!data.customTasks) data.customTasks = SEED_TASKS.flatMap(s => s.items.map(item => ({ ...item, section: s.section })));
        setState(data);
      } else {
        const seed = {
          todos: DEFAULT_TODOS,
          customTasks: SEED_TASKS.flatMap(s => s.items.map(item => ({ ...item, section: s.section }))),
          checked: {}, actuals: {}, customQs: {}, answeredQs: {},
        };
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

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", color: "#aaa" }}>
        Loading...
      </div>
    );
  }

  const tabs = [
    { key: "checklist", label: "✓ Checklist" },
    { key: "budget", label: "💰 Budget" },
    { key: "doctor", label: "👩‍⚕️ Doctor Q&A" },
    { key: "meals", label: "🍲 Meals" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #EBEBEB", padding: "16px 24px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 14 }}>🌱 Baby prep plan</div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: "8px 16px", border: "none", background: "none", cursor: "pointer",
                fontSize: 13, fontWeight: activeTab === t.key ? 700 : 400,
                color: activeTab === t.key ? "#1a1a1a" : "#888",
                borderBottom: activeTab === t.key ? "2px solid #1a1a1a" : "2px solid transparent",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 60px" }}>
        {activeTab === "checklist" && <ChecklistTab state={state} updateState={updateState} />}
        {activeTab === "budget" && <BudgetTab state={state} updateState={updateState} />}
        {activeTab === "doctor" && <DoctorTab state={state} updateState={updateState} />}
        {activeTab === "meals" && <MealsTab />}
      </div>
    </div>
  );
}

// ─── CHECKLIST TAB ───────────────────────────────────────────────────────────

function ChecklistTab({ state, updateState }) {
  const checked = state.checked || {};
  const customTasks = state.customTasks || SEED_TASKS.flatMap(s => s.items.map(i => ({ ...i, section: s.section })));
  const [filter, setFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [sortMode, setSortMode] = useState("manual"); // manual | trimester | status
  const [openSections, setOpenSections] = useState(() => {
    const o = {}; SEED_TASKS.forEach(t => o[t.section] = true); return o;
  });
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

  // Derive sections from customTasks
  const sections = (() => {
    const map = {};
    const sectionOrder = [];
    customTasks.forEach(task => {
      if (!map[task.section]) { map[task.section] = []; sectionOrder.push(task.section); }
      map[task.section].push(task);
    });
    const seedIcons = {};
    SEED_TASKS.forEach(s => seedIcons[s.section] = s.icon);
    return sectionOrder.map(s => ({ section: s, icon: seedIcons[s] || "📌", items: map[s].sort((a, b) => a.order - b.order) }));
  })();

  function saveTasks(tasks) { updateState({ customTasks: tasks }); }

  const allItems = customTasks;
  const totalCount = allItems.length;
  const doneCount = allItems.filter(t => checked[t.id]).length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const progressColor = pct < 33 ? "#378ADD" : pct < 66 ? "#EF9F27" : "#1D9E75";

  function toggle(id) { updateState({ checked: { ...checked, [id]: !checked[id] } }); }

  function deleteItem(id) {
    saveTasks(customTasks.filter(t => t.id !== id));
    const next = { ...checked }; delete next[id];
    updateState({ customTasks: customTasks.filter(t => t.id !== id), checked: next });
  }

  function startEdit(item) { setEditingId(item.id); setEditText(item.name); }

  function commitEdit(id) {
    if (!editText.trim()) { setEditingId(null); return; }
    updateState({ customTasks: customTasks.map(t => t.id === id ? { ...t, name: editText.trim() } : t) });
    setEditingId(null);
  }

  function changeTiming(id, timing) {
    updateState({ customTasks: customTasks.map(t => t.id === id ? { ...t, timing } : t) });
  }

  function changeLabel(id, label) {
    updateState({ customTasks: customTasks.map(t => t.id === id ? { ...t, label: t.label === label ? null : label } : t) });
  }

  function addItem(section) {
    if (!newItemText.trim()) { setAddingSection(null); return; }
    const sectionItems = customTasks.filter(t => t.section === section);
    const maxOrder = sectionItems.reduce((m, t) => Math.max(m, t.order), -1);
    const newTask = { id: uid(), name: newItemText.trim(), timing: newItemTiming, tip: "", label: null, section, order: maxOrder + 1 };
    updateState({ customTasks: [...customTasks, newTask] });
    setNewItemText(""); setAddingSection(null);
  }

  function addSection() {
    if (!newSectionName.trim()) { setShowAddSection(false); return; }
    const newTask = { id: uid(), name: "New item — click to edit", timing: "T1", tip: "", label: null, section: newSectionName.trim(), order: 0 };
    updateState({ customTasks: [...customTasks, newTask] });
    setNewSectionName(""); setShowAddSection(false);
  }

  function deleteSection(section) {
    const remaining = customTasks.filter(t => t.section !== section);
    const nextChecked = { ...checked };
    customTasks.filter(t => t.section === section).forEach(t => delete nextChecked[t.id]);
    updateState({ customTasks: remaining, checked: nextChecked });
  }

  // Drag and drop
  function onDragStart(id) { setDragId(id); }
  function onDragOver(e, id) { e.preventDefault(); setDragOverId(id); }
  function onDrop(section) {
    if (!dragId || !dragOverId || dragId === dragOverId) { setDragId(null); setDragOverId(null); return; }
    const sectionItems = customTasks.filter(t => t.section === section).sort((a, b) => a.order - b.order);
    const dragIdx = sectionItems.findIndex(t => t.id === dragId);
    const overIdx = sectionItems.findIndex(t => t.id === dragOverId);
    if (dragIdx === -1 || overIdx === -1) { setDragId(null); setDragOverId(null); return; }
    const reordered = [...sectionItems];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(overIdx, 0, moved);
    const updated = reordered.map((t, i) => ({ ...t, order: i }));
    updateState({ customTasks: [...customTasks.filter(t => t.section !== section), ...updated] });
    setDragId(null); setDragOverId(null);
  }

  // Sorting
  function getSortedItems(items) {
    if (sortMode === "trimester") {
      const order = { T1: 0, T2: 1, T3: 2, newborn: 3 };
      return [...items].sort((a, b) => order[a.timing] - order[b.timing]);
    }
    if (sortMode === "status") {
      return [...items].sort((a, b) => (checked[a.id] ? 1 : 0) - (checked[b.id] ? 1 : 0));
    }
    return items;
  }

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "T1", label: "1st trimester" },
    { key: "T2", label: "2nd trimester" },
    { key: "T3", label: "3rd trimester" },
    { key: "newborn", label: "After birth" },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[["Total", totalCount], ["Done", doneCount], ["Progress", pct + "%"], ["Left", totalCount - doneCount]].map(([l, v]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: "#F0EFEA", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: progressColor, borderRadius: 6, transition: "width 0.4s ease" }} />
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {filterOptions.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: filter === f.key ? "none" : "1px solid #ddd",
            background: filter === f.key ? "#1a1a1a" : "#fff",
            color: filter === f.key ? "#fff" : "#555",
          }}>{f.label}</button>
        ))}
      </div>

      {/* Label filter + sort row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>Label:</span>
        <button onClick={() => setLabelFilter("all")} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: labelFilter === "all" ? "none" : "1px solid #ddd", background: labelFilter === "all" ? "#1a1a1a" : "#fff", color: labelFilter === "all" ? "#fff" : "#555" }}>All</button>
        {LABELS.map(lb => (
          <button key={lb.key} onClick={() => setLabelFilter(lb.key === labelFilter ? "all" : lb.key)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "none", background: labelFilter === lb.key ? lb.color : lb.bg, color: labelFilter === lb.key ? "#fff" : lb.color, fontWeight: 600 }}>{lb.name}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Sort:</span>
          {[["manual", "⠿ Manual"], ["trimester", "📅 Trimester"], ["status", "✓ Status"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setSortMode(key)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: sortMode === key ? "none" : "1px solid #ddd", background: sortMode === key ? "#1a1a1a" : "#fff", color: sortMode === key ? "#fff" : "#555" }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map(section => {
          let items = section.items;
          if (filter !== "all") items = items.filter(i => i.timing === filter);
          if (labelFilter !== "all") items = items.filter(i => i.label === labelFilter);
          if (!items.length && filter === "all" && labelFilter === "all") items = section.items;
          else if (!items.length) return null;
          items = getSortedItems(items);
          const sectionDone = items.filter(i => checked[i.id]).length;
          const isOpen = openSections[section.section] !== false;
          const allDone = sectionDone === items.length && items.length > 0;

          return (
            <div key={section.section} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", background: allDone ? "#F6FBF7" : "#fff", padding: "12px 16px", gap: 8 }}>
                <button onClick={() => setOpenSections(p => ({ ...p, [section.section]: !isOpen }))} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                  <span style={{ fontSize: 18 }}>{section.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", flex: 1 }}>{section.section}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: allDone ? "#E1F5EE" : "#F0EFEA", color: allDone ? "#0F6E56" : "#888" }}>{sectionDone}/{items.length}</span>
                  <span style={{ fontSize: 14, color: "#bbb", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>
                <button onClick={() => { setAddingSection(section.section); setNewItemText(""); setNewItemTiming("T1"); }} title="Add item" style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "3px 8px", cursor: "pointer", fontSize: 14, color: "#888" }}>+</button>
                <button onClick={() => { if (window.confirm(`Delete the entire "${section.section}" section?`)) deleteSection(section.section); }} title="Delete section" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ddd", padding: "3px 6px" }}>🗑</button>
              </div>

              {/* Add item form */}
              {addingSection === section.section && (
                <div style={{ padding: "10px 16px", borderTop: "1px solid #F0EFEA", background: "#FAFAF8", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input autoFocus value={newItemText} onChange={e => setNewItemText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addItem(section.section); if (e.key === "Escape") setAddingSection(null); }} placeholder="New task name..." style={{ flex: 1, minWidth: 180, padding: "7px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13 }} />
                  <select value={newItemTiming} onChange={e => setNewItemTiming(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, background: "#fff" }}>
                    <option value="T1">1st trimester</option>
                    <option value="T2">2nd trimester</option>
                    <option value="T3">3rd trimester</option>
                    <option value="newborn">After birth</option>
                  </select>
                  <button onClick={() => addItem(section.section)} style={{ padding: "7px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Add</button>
                  <button onClick={() => setAddingSection(null)} style={{ padding: "7px 10px", background: "none", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#888" }}>Cancel</button>
                </div>
              )}

              {/* Items */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #F0EFEA" }} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(section.section)}>
                  {items.map(item => {
                    const isDone = !!checked[item.id];
                    const meta = TIMING_META[item.timing];
                    const showTip = activeTip === item.id;
                    const isEditing = editingId === item.id;
                    const itemLabel = LABELS.find(l => l.key === item.label);

                    return (
                      <div key={item.id}
                        draggable={sortMode === "manual"}
                        onDragStart={() => onDragStart(item.id)}
                        onDragOver={e => onDragOver(e, item.id)}
                        style={{ borderBottom: "1px solid #F8F8F6", background: dragOverId === item.id ? "#F0EFEA" : isDone ? "#FCFCFA" : "#fff", transition: "background 0.1s" }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 16px" }}>
                          {/* Drag handle */}
                          {sortMode === "manual" && <span style={{ color: "#ccc", cursor: "grab", fontSize: 14, marginTop: 3, flexShrink: 0 }}>⠿</span>}
                          {/* Checkbox */}
                          <div onClick={() => toggle(item.id)} style={{ width: 20, height: 20, borderRadius: 6, border: isDone ? "none" : "2px solid #D0CFC8", background: isDone ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            {isDone && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                          </div>
                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {isEditing ? (
                              <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") commitEdit(item.id); if (e.key === "Escape") setEditingId(null); }} onBlur={() => commitEdit(item.id)} style={{ width: "100%", padding: "4px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14 }} />
                            ) : (
                              <div style={{ fontSize: 14, color: isDone ? "#aaa" : "#1a1a1a", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.5, cursor: "text" }} onDoubleClick={() => startEdit(item)}>{item.name}</div>
                            )}
                            <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                              {/* Timing badge — clickable to change */}
                              <select value={item.timing} onChange={e => changeTiming(item.id, e.target.value)} style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 10, background: meta.bg, color: meta.color, border: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
                                <option value="T1">1st trimester</option>
                                <option value="T2">2nd trimester</option>
                                <option value="T3">3rd trimester</option>
                                <option value="newborn">After birth</option>
                              </select>
                              {/* Label picker */}
                              <div style={{ display: "flex", gap: 3 }}>
                                {LABELS.map(lb => (
                                  <button key={lb.key} onClick={() => changeLabel(item.id, lb.key)} title={lb.name} style={{ padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: item.label === lb.key ? lb.color : lb.bg, color: item.label === lb.key ? "#fff" : lb.color, opacity: item.label && item.label !== lb.key ? 0.4 : 1 }}>{lb.name}</button>
                                ))}
                              </div>
                              {/* Tip */}
                              {item.tip && <button onClick={() => setActiveTip(showTip ? null : item.id)} style={{ fontSize: 11, color: "#888", background: "none", border: "1px solid #E0DFDA", borderRadius: 10, padding: "2px 8px", cursor: "pointer" }}>{showTip ? "hide tip" : "💡 tip"}</button>}
                            </div>
                            {showTip && <div style={{ marginTop: 8, padding: "10px 12px", background: "#FFFBF0", border: "1px solid #FAEEDA", borderRadius: 8, fontSize: 13, color: "#6B4800", lineHeight: 1.6 }}>{item.tip}</div>}
                          </div>
                          {/* Actions */}
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            <button onClick={() => startEdit(item)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ccc", padding: "2px 4px" }}>✏️</button>
                            <button onClick={() => { if (window.confirm("Delete this task?")) deleteItem(item.id); }} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ccc", padding: "2px 4px" }}>🗑</button>
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

        {/* Add new section */}
        {showAddSection ? (
          <div style={{ background: "#fff", border: "1px dashed #ddd", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 8, alignItems: "center" }}>
            <input autoFocus value={newSectionName} onChange={e => setNewSectionName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setShowAddSection(false); }} placeholder="Section name..." style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
            <button onClick={addSection} style={{ padding: "8px 14px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Add</button>
            <button onClick={() => setShowAddSection(false)} style={{ padding: "8px 12px", background: "none", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#888" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowAddSection(true)} style={{ padding: "12px", background: "#fff", border: "1px dashed #ddd", borderRadius: 14, cursor: "pointer", fontSize: 13, color: "#aaa", textAlign: "center", width: "100%" }}>+ Add new section</button>
        )}
      </div>

      {/* To-do section */}
      <div style={{ marginTop: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F0EFEA" }}>
            <span style={{ fontSize: 20 }}>📝</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>To-do</span>
            <span style={{ fontSize: 12, color: "#aaa" }}>{(state.todos || []).filter(t => !t.done).length} remaining</span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <TodoInline state={state} updateState={updateState} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TO-DO INLINE ────────────────────────────────────────────────────────────

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
            <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a" }}>{todo.text}</div>
            <button onClick={() => deleteTodo(todo.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        ))}
        {todos.some(t => t.done) && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

// ─── BUDGET TAB ──────────────────────────────────────────────────────────────

function BudgetTab({ state, updateState }) {
  const actuals = state.actuals || {};
  const [editing, setEditing] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const totalEstimate = BUDGET_CATEGORIES.flatMap(c => c.items).reduce((s, i) => s + i.estimate, 0);
  const totalActual = Object.values(actuals).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  function startEdit(key, current) { setEditing(key); setInputVal(current !== undefined ? String(current) : ""); }
  function commitEdit(key) {
    const val = parseFloat(inputVal);
    const next = { ...actuals };
    if (isNaN(val) || inputVal.trim() === "") { delete next[key]; } else { next[key] = val; }
    updateState({ actuals: next }); setEditing(null);
  }
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>Estimated total</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a" }}>${totalEstimate.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>one-time + first year</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>Your actual spend</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: totalActual > totalEstimate ? "#C0392B" : "#1D9E75" }}>${totalActual.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>click any row to enter</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Tap any row to enter your actual cost.</div>
      {BUDGET_CATEGORIES.map(cat => (
        <div key={cat.category} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "12px 16px", background: "#FAFAF8", borderBottom: "1px solid #F0EFEA", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{cat.category}</div>
          {cat.items.map(item => {
            const key = `${cat.category}||${item.name}`;
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
                  <div style={{ minWidth: 70, textAlign: "right", fontSize: 13, fontWeight: 600, color: actual !== undefined ? "#1D9E75" : "#ddd" }}>
                    {actual !== undefined ? `$${Number(actual).toLocaleString()}` : "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── DOCTOR Q&A TAB ──────────────────────────────────────────────────────────

function DoctorTab({ state, updateState }) {
  const customQs = state.customQs || {};
  const answeredQs = state.answeredQs || {};
  const [activePhase, setActivePhase] = useState("T1");
  const [newQ, setNewQ] = useState("");
  const phases = [{ key: "T1", label: "1st trimester" }, { key: "T2", label: "2nd trimester" }, { key: "T3", label: "3rd trimester" }, { key: "newborn", label: "After birth" }];
  function toggleAnswered(key) { updateState({ answeredQs: { ...answeredQs, [key]: !answeredQs[key] } }); }
  function addQuestion() { if (!newQ.trim()) return; const existing = customQs[activePhase] || []; updateState({ customQs: { ...customQs, [activePhase]: [...existing, { id: Date.now(), text: newQ.trim() }] } }); setNewQ(""); }
  function deleteCustomQ(phase, id) { updateState({ customQs: { ...customQs, [phase]: (customQs[phase] || []).filter(q => q.id !== id) } }); }
  const preloaded = DOCTOR_QUESTIONS[activePhase] || [];
  const custom = customQs[activePhase] || [];
  return (
    <div>
      <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>Pre-filled questions for each appointment stage. Check them off as you ask them, and add your own.</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {phases.map(p => (
          <button key={p.key} onClick={() => setActivePhase(p.key)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: activePhase === p.key ? "none" : "1px solid #ddd", background: activePhase === p.key ? "#1a1a1a" : "#fff", color: activePhase === p.key ? "#fff" : "#555" }}>{p.label}</button>
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Suggested questions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {preloaded.map((q, i) => {
            const key = `${activePhase}||pre||${i}`;
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
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>My questions</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === "Enter" && addQuestion()} placeholder="Add a question..." style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 14, outline: "none" }} />
          <button onClick={addQuestion} style={{ padding: "10px 18px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Add</button>
        </div>
        {custom.length === 0 && <div style={{ color: "#ccc", fontSize: 13, padding: "12px 0" }}>No custom questions yet</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {custom.map(q => {
            const key = `${activePhase}||custom||${q.id}`;
            const done = !!answeredQs[key];
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", background: "#fff", border: "1px solid #EBEBEB", borderRadius: 10 }}>
                <div onClick={() => toggleAnswered(key)} style={{ width: 18, height: 18, borderRadius: 5, border: done ? "none" : "2px solid #D0CFC8", background: done ? "#1a1a1a" : "transparent", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: done ? "#aaa" : "#1a1a1a", textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{q.text}</div>
                <button onClick={() => deleteCustomQ(activePhase, q.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MEALS TAB ───────────────────────────────────────────────────────────────

function MealsTab() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>Freezer-friendly meals to batch cook before baby arrives. Click any recipe to see ingredients.</div>
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
                    {meal.ingredients.map((ing, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, fontSize: 14, color: "#333" }}>
                        <span style={{ color: "#ccc" }}>•</span><span>{ing}</span>
                      </div>
                    ))}
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