import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect } from "react";

const qualityFlags = (ingredients = "") => {
  const text = ingredients.toLowerCase();
  const good = ["chicken","beef","salmon","turkey","lamb","duck","venison","egg"].filter(i => text.includes(i));
  const bad  = ["by-product","corn syrup","artificial color","bha","bht","propylene glycol","menadione"].filter(i => text.includes(i));
  return { good, bad };
};

const IngredientBadge = ({ word, index }) => {
  const lower = word.toLowerCase();
  const isGood = ["chicken","beef","salmon","turkey","lamb","duck","egg","venison","rice","oat","sweet potato","pea","blueberry","cranberry","carrot","spinach"].some(g => lower.includes(g));
  const isBad  = ["by-product","corn syrup","artificial","bha","bht","propylene","menadione","dye","red 40","yellow 5"].some(b => lower.includes(b));
  const isFirst = index === 0;
  let bg = "#f5f5f5", border = "#e0e0e0", color = "#555";
  if (isFirst)     { bg = "#FFF8E1"; border = "#FFD54F"; color = "#F57F17"; }
  else if (isGood) { bg = "#E8F5E9"; border = "#81C784"; color = "#2E7D32"; }
  else if (isBad)  { bg = "#FFEBEE"; border = "#EF9A9A"; color = "#C62828"; }
  return (
    <span style={{ display:"inline-block", margin:"3px 4px", padding:"4px 10px",
      background:bg, border:`1px solid ${border}`, borderRadius:20,
      color, fontSize:12, cursor:"default" }}>
      {isFirst && <span style={{ marginRight:4 }}>★</span>}
      {word.trim()}
    </span>
  );
};

// ── Dietary filter definitions ──
const DIET_FILTERS = [
  { id:"grain_free",        label:"Grain Free",          icon:"🌾",  desc:"No wheat, corn, or grains" },
  { id:"limited_ingredient",label:"Limited Ingredient",  icon:"🧪",  desc:"Fewer ingredients, great for sensitive pets" },
  { id:"hypoallergenic",    label:"Hypoallergenic",       icon:"💊",  desc:"Formulated to reduce allergic reactions" },
  { id:"high_protein",      label:"High Protein",         icon:"💪",  desc:"More than 30% protein content" },
  { id:"low_fat",           label:"Low Fat",              icon:"🥗",  desc:"Ideal for weight management" },
  { id:"low_sodium",        label:"Low Sodium",           icon:"🧂",  desc:"Heart and kidney health support" },
  { id:"weight_management", label:"Weight Management",    icon:"⚖️",  desc:"Calorie-controlled formula" },
  { id:"senior",            label:"Senior Formula",       icon:"👴",  desc:"Formulated for older pets" },
  { id:"puppy_kitten",      label:"Puppy / Kitten",       icon:"🍼",  desc:"Growth and development formula" },
  { id:"no_chicken",        label:"No Chicken",           icon:"🚫🍗", desc:"Chicken-free for allergies" },
  { id:"no_beef",           label:"No Beef",              icon:"🚫🥩", desc:"Beef-free for allergies" },
  { id:"no_fish",           label:"No Fish",              icon:"🚫🐟", desc:"Fish-free for allergies" },
  { id:"no_grain_corn",     label:"No Corn or Soy",       icon:"🌽",  desc:"Avoids common filler allergens" },
  { id:"no_dairy",          label:"No Dairy",             icon:"🥛",  desc:"Dairy-free formula" },
  { id:"organic",           label:"Organic",              icon:"🌿",  desc:"USDA certified organic ingredients" },
  { id:"no_artificial",     label:"No Artificial Additives",icon:"✅", desc:"No artificial colors, flavors, or preservatives" },
];

function buildDietPrompt(activeFilters) {
  if (activeFilters.length === 0) return "";
  const labels = activeFilters.map(id => DIET_FILTERS.find(f => f.id === id)?.label).filter(Boolean);
  return `\n\nDIETARY REQUIREMENTS (STRICT): The user requires products that meet ALL of the following criteria: ${labels.join(", ")}. Only return products that genuinely meet these requirements. If no products match, return [].`;
}

const DOG_SUGGESTIONS = [
  "Blue Buffalo Life Protection Chicken & Brown Rice",
  "Blue Buffalo Wilderness Chicken",
  "Blue Buffalo Homestyle Recipe Chicken",
  "Purina Pro Plan Chicken & Rice Adult",
  "Purina Pro Plan Salmon & Rice Adult",
  "Purina Pro Plan Puppy Chicken & Rice",
  "Purina ONE SmartBlend Chicken & Rice",
  "Purina ONE Natural Lamb & Rice",
  "Purina Dog Chow Complete Adult",
  "Purina Puppy Chow Complete Nutrition",
  "Hill's Science Diet Adult Chicken & Barley",
  "Hill's Science Diet Puppy Chicken Meal & Barley",
  "Hill's Science Diet Senior 7+ Chicken",
  "Royal Canin Adult Breed Health Nutrition",
  "Royal Canin Medium Adult",
  "Royal Canin Puppy",
  "Pedigree Adult Complete Nutrition",
  "Pedigree Puppy Complete Nutrition",
  "Iams ProActive Health Adult MiniChunks",
  "Iams ProActive Health Puppy",
  "Eukanuba Adult Medium Breed",
  "Eukanuba Puppy Medium Breed",
  "Diamond Naturals Adult Lamb & Rice",
  "Diamond Naturals Large Breed Adult",
  "Diamond Naturals Puppy",
  "Taste of the Wild High Prairie",
  "Taste of the Wild Pacific Stream",
  "Taste of the Wild Sierra Mountain",
  "Merrick Grain Free Real Chicken",
  "Merrick Classic Real Chicken & Sweet Potato",
  "Wellness CORE Grain Free Original",
  "Wellness Complete Health Adult Deboned Chicken",
  "Nutro Natural Choice Adult Chicken & Brown Rice",
  "Nutro Ultra Adult",
  "Orijen Original",
  "Orijen Puppy",
  "Acana Grasslands",
  "Acana Heritage Free-Run Poultry",
  "Fromm Gold Adult",
  "Fromm Four-Star Salmon & Chicken Pate",
  "4Health Adult Chicken & Rice",
  "4Health Puppy Chicken & Rice",
  "Kirkland Signature Adult Chicken Rice & Vegetable",
  "Kirkland Signature Puppy Chicken Rice & Vegetable",
  "Victor Classic Hi-Pro Plus",
  "Victor Select Beef Meal & Brown Rice",
  "Sportmix Wholesome Chicken Meal & Rice",
  "Retriever Adult Dog Food",
  "Ol Roy Complete Nutrition",
  "Natural Balance L.I.D. Sweet Potato & Fish",
];

const CAT_SUGGESTIONS = [
  "Blue Buffalo Adult Chicken & Brown Rice",
  "Blue Buffalo Wilderness Chicken Adult",
  "Purina ONE Tender Selects Chicken",
  "Purina Cat Chow Complete",
  "Purina Pro Plan Adult Salmon & Rice",
  "Hill's Science Diet Adult Indoor",
  "Royal Canin Indoor Adult",
  "Friskies Seafood Sensations",
  "Fancy Feast Grilled Chicken",
  "Meow Mix Original Choice",
  "Iams ProActive Health Indoor Weight & Hairball",
  "Wellness CORE Grain Free Indoor",
  "Taste of the Wild Rocky Mountain",
  "Natural Balance L.I.D. Green Pea & Salmon",
  "Diamond Naturals Indoor Cat",
];

const DOG_SVG = (
  <svg viewBox="0 0 120 120" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="72" rx="32" ry="28" fill="#EF9F27"/>
    <ellipse cx="60" cy="52" rx="26" ry="24" fill="#EF9F27"/>
    <ellipse cx="38" cy="34" rx="11" ry="16" fill="#BA7517" transform="rotate(-15 38 34)"/>
    <ellipse cx="82" cy="34" rx="11" ry="16" fill="#BA7517" transform="rotate(15 82 34)"/>
    <ellipse cx="38" cy="36" rx="7" ry="11" fill="#FAC775" transform="rotate(-15 38 36)"/>
    <ellipse cx="82" cy="36" rx="7" ry="11" fill="#FAC775" transform="rotate(15 82 36)"/>
    <circle cx="52" cy="50" r="5" fill="#2C2C2A"/><circle cx="68" cy="50" r="5" fill="#2C2C2A"/>
    <circle cx="53" cy="49" r="2" fill="white"/><circle cx="69" cy="49" r="2" fill="white"/>
    <ellipse cx="60" cy="60" rx="9" ry="6" fill="#D85A30"/>
    <ellipse cx="60" cy="62" rx="6" ry="4" fill="#F0997B"/>
    <ellipse cx="40" cy="72" rx="8" ry="5" fill="#BA7517"/>
    <ellipse cx="80" cy="72" rx="8" ry="5" fill="#BA7517"/>
    <ellipse cx="60" cy="88" rx="12" ry="8" fill="#BA7517"/>
    <path d="M50 92 Q60 100 70 92" stroke="#D85A30" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <ellipse cx="47" cy="68" rx="4" ry="3" fill="#2C2C2A"/>
    <ellipse cx="73" cy="68" rx="4" ry="3" fill="#2C2C2A"/>
    <ellipse cx="60" cy="57" rx="4" ry="3" fill="#E24B4A"/>
  </svg>
);

const CAT_SVG = (
  <svg viewBox="0 0 120 120" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="75" rx="30" ry="26" fill="#AFA9EC"/>
    <ellipse cx="60" cy="52" rx="24" ry="22" fill="#AFA9EC"/>
    <polygon points="36,36 30,10 48,28" fill="#7F77DD"/>
    <polygon points="84,36 90,10 72,28" fill="#7F77DD"/>
    <polygon points="37,35 33,14 47,29" fill="#F4C0D1"/>
    <polygon points="83,35 87,14 73,29" fill="#F4C0D1"/>
    <ellipse cx="52" cy="50" rx="6" ry="7" fill="#1D9E75"/>
    <ellipse cx="68" cy="50" rx="6" ry="7" fill="#1D9E75"/>
    <ellipse cx="52" cy="51" rx="3" ry="5" fill="#2C2C2A"/>
    <ellipse cx="68" cy="51" rx="3" ry="5" fill="#2C2C2A"/>
    <circle cx="51" cy="49" r="1.5" fill="white"/><circle cx="67" cy="49" r="1.5" fill="white"/>
    <ellipse cx="60" cy="59" rx="5" ry="4" fill="#ED93B1"/>
    <path d="M55 63 Q60 67 65 63" stroke="#D4537E" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="40" y1="57" x2="25" y2="53" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="40" y1="60" x2="24" y2="60" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="40" y1="63" x2="25" y2="67" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="80" y1="57" x2="95" y2="53" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="80" y1="60" x2="96" y2="60" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="80" y1="63" x2="95" y2="67" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M60 75 Q80 70 85 85 Q60 95 35 85 Q40 70 60 75Z" fill="#CECBF6"/>
    <path d="M48 95 Q60 105 72 95" stroke="#9FE1CB" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const STORES = ["PetSmart","Petco","Walmart","Chewy","Amazon","Target","Tractor Supply","Pet Supplies Plus"];

const BADGES = [
  { min:0,  max:0,   label:"Pup",           icon:"🐶" },
  { min:1,  max:4,   label:"Bone Collector", icon:"🦴" },
  { min:5,  max:14,  label:"Pack Leader",    icon:"🐾" },
  { min:15, max:999, label:"Top Sniffer",    icon:"🥇" },
];
function getBadge(count) { return BADGES.find(b => count >= b.min && count <= b.max) || BADGES[0]; }

const INIT_DEALS = [
  { id:1, user:"PawHunterMike",  pet:"dogs", store:"Walmart",        product:"Purina Pro Plan 35lb",      price:"$62.00", location:"Denver, CO",  upvotes:14, ts:Date.now()-3600000  },
  { id:2, user:"CatLadyJess",    pet:"cats", store:"Petco",          product:"Blue Buffalo 12lb",         price:"$27.50", location:"Austin, TX",   upvotes:9,  ts:Date.now()-7200000  },
  { id:3, user:"BudgetPawrent",  pet:"dogs", store:"Tractor Supply", product:"Hill's Science Diet 15lb", price:"$39.99", location:"Chicago, IL",  upvotes:5,  ts:Date.now()-86400000 },
];
const INIT_USERS = {
  PawHunterMike: { deals:3, upvotes:28 },
  CatLadyJess:   { deals:2, upvotes:11 },
  BudgetPawrent: { deals:1, upvotes:5  },
};

function getHealthScore(prod) {
  const text = (prod.name + " " + prod.brand).toLowerCase();
  const goodTerms = ["chicken","beef","salmon","turkey","lamb","duck","egg","venison","fish","herring","whitefish","bison","rabbit","pea","sweet potato","brown rice","oat","blueberry","cranberry","carrot","spinach","grain free","natural","real","deboned","wild","organic"];
  const badTerms  = ["by-product","corn syrup","artificial","bha","bht","propylene","menadione","dye","red 40","yellow 5","meat meal","animal digest","added color","added sugar"];
  const good = goodTerms.filter(i => text.includes(i)).length;
  const bad  = badTerms.filter(i => text.includes(i)).length;
  return good * 2 - bad * 3;
}

export default function App() {
  const [tab, setTab]                         = useState("search");
  const [pet, setPet]                         = useState("dogs");
  const [search, setSearch]                   = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults]                 = useState(null);
  const [sortResults, setSortResults]         = useState("default");
  const [loading, setLoading]                 = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError]                     = useState("");

  // ── Dietary filters state ──
  const [activeFilters, setActiveFilters]     = useState([]);
  const [showFilters, setShowFilters]         = useState(false);

  const [ingText, setIngText]             = useState(null);
  const [ingSource, setIngSource]         = useState(null);
  const [ingDisclaimer, setIngDisclaimer] = useState(false);
  const [ingLoading, setIngLoading]       = useState(false);

  const [deals, setDeals]                 = useState(INIT_DEALS);
  const [users, setUsers]                 = useState(INIT_USERS);
  const [upvoted, setUpvoted]             = useState({});
  const [dealForm, setDealForm]           = useState({ user:"", store:"", product:"", price:"", location:"", pet:"dogs" });
  const [dealSubmitted, setDealSubmitted] = useState(false);
  const [myUsername, setMyUsername]       = useState("");
  const [sortDeals, setSortDeals]         = useState("newest");

  const [myPets, setMyPets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pawprice_pets") || "[]"); } catch { return []; }
  });
  const [petForm, setPetForm] = useState({ name:"", type:"dogs", food:"", dietaryNeeds:[] });
  const [petSaved, setPetSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("pawprice_pets", JSON.stringify(myPets));
  }, [myPets]);

  useEffect(() => {
    setSortResults("default");
  }, [results]);

  useEffect(() => {
    if (!selectedProduct) { setIngText(null); setIngSource(null); setIngDisclaimer(false); return; }
    setIngLoading(true);
    setIngText(null);
    setIngSource(null);
    setIngDisclaimer(false);
    fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: selectedProduct.name }),
    })
      .then(r => r.json())
      .then(data => {
        setIngText(data.ingredients || "unavailable");
        setIngSource(data.source || "none");
        setIngDisclaimer(data.aiDisclaimer || false);
      })
      .catch(() => { setIngText("unavailable"); setIngSource("none"); })
      .finally(() => setIngLoading(false));
  }, [selectedProduct]);

  const accent      = pet === "dogs" ? "#EF9F27" : "#7F77DD";
  const accentLight = pet === "dogs" ? "#FAEEDA" : "#EEEDFE";

  function toggleFilter(id) {
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  }

  function clearFilters() { setActiveFilters([]); }

  function getStoreLink(store, productName, brandName) {
    const brand = encodeURIComponent(brandName || productName.split(' ').slice(0,2).join(' '));
    const full  = encodeURIComponent(productName);
    const links = {
      "Amazon":         `https://www.amazon.com/s?k=${full}&i=pet-supplies&tag=pawprice-20`,
      "Chewy":          `https://www.chewy.com/s?query=${full}`,
      "PetSmart":       `https://www.petsmart.com/search/?q=${brand}+dog+food`,
      "Petco":          `https://www.petco.com/shop/en/petcostore/search?q=${brand}+dog+food`,
      "Walmart":        `https://www.walmart.com/search?q=${brand}+dog+food`,
      "Target":         `https://www.target.com/s?searchTerm=${brand}+dog+food`,
      "Tractor Supply": `https://www.tractorsupply.com/tsc/search/${brand}+dog+food`,
    };
    return links[store] || `https://www.google.com/search?q=${full}+${encodeURIComponent(store)}`;
  }

  function addPet() {
    if (!petForm.name.trim() || !petForm.food.trim()) return;
    setMyPets(prev => [...prev, { id:Date.now(), ...petForm }]);
    setPetForm({ name:"", type:"dogs", food:"", dietaryNeeds:[] });
    setPetSaved(true);
    setTimeout(() => setPetSaved(false), 2000);
  }
  function deletePet(id) { setMyPets(prev => prev.filter(p => p.id !== id)); }
  function searchForPet(p) {
    setPet(p.type);
    setSearch(p.food);
    setTab("search");
    setResults(null);
    setSelectedProduct(null);
    setError("");
    // Apply pet's saved dietary needs as active filters
    if (p.dietaryNeeds && p.dietaryNeeds.length > 0) {
      setActiveFilters(p.dietaryNeeds);
    }
  }

  function togglePetDiet(id) {
    setPetForm(prev => ({
      ...prev,
      dietaryNeeds: prev.dietaryNeeds.includes(id)
        ? prev.dietaryNeeds.filter(f => f !== id)
        : [...prev.dietaryNeeds, id]
    }));
  }

  async function searchProducts() {
    if (!search.trim()) return;
    setLoading(true); setResults(null); setSelectedProduct(null); setError("");
    const dietPrompt = buildDietPrompt(activeFilters);
    try {
      const response = await fetch("/api/search", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001",
          max_tokens:1500,
          messages:[{ role:"user", content:`You are a pet food price comparison assistant. The user is searching for "${search}" for their ${pet}.${dietPrompt}

STRICT RULES - follow exactly:
1. Only return products that ACTUALLY EXIST and are made for ${pet}. Never invent or fabricate products.
2. NEVER mix brands with animal types they don't serve. Examples: Friskies, Fancy Feast, and Meow Mix are CAT-ONLY brands. Pedigree, Purina Puppy Chow, Milk-Bone, and Ol' Roy are DOG-ONLY brands. If the search does not match any real products made for ${pet}, return an empty array [].
3. Every brand name, product name, and size must be real and verifiable.
4. The "stage" field must accurately reflect the real product (do NOT label an adult formula as Puppy or Kitten).
5. Prices must be realistic for that product's actual market price.
6. Not every store carries every product. If a store does not realistically carry the product, use your best estimate of a realistic price — but NEVER use 0 or null.
7. CRITICAL: Every single price value must be a real positive number greater than 0. If you do not know the price for a store, estimate based on similar products. A price of 0 is never acceptable.
8. If you are not confident enough to provide realistic prices for a product, do not include it in the results at all.
9. Each product object must include a "dietaryTags" array listing which of these apply: grain_free, limited_ingredient, hypoallergenic, high_protein, low_fat, low_sodium, weight_management, senior, puppy_kitten, no_chicken, no_beef, no_fish, no_grain_corn, no_dairy, organic, no_artificial.

Return a JSON array of up to 4 real matching products. Each product must have: name, brand, type (Dry/Wet/Treats), size, stage (Puppy/Kitten/Adult/Senior), dietaryTags (array), and a prices array with store and price for every store in this list: ${STORES.join(", ")}.

If no real products match the search for ${pet}, return: []

Return ONLY valid JSON, no markdown, no explanation.` }]
        })
      });
      const data = await response.json();
      if (!data.content) throw new Error(JSON.stringify(data));
      const text  = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      const valid = parsed.filter(p =>
        p.prices && p.prices.length > 0 && p.prices.every(s => s.price > 0)
      );
      setResults(valid);
    } catch(e) { setError("Search failed: " + e.message); }
    setLoading(false);
  }

  function getMin(prices) { return Math.min(...prices.map(p=>p.price)); }
  function getMax(prices) { return Math.max(...prices.map(p=>p.price)); }

  function getSortedResults() {
    if (!results) return [];
    const copy = [...results];
    if (sortResults === "price")  return copy.sort((a,b) => getMin(a.prices) - getMin(b.prices));
    if (sortResults === "health") return copy.sort((a,b) => getHealthScore(b) - getHealthScore(a));
    return copy;
  }

  function submitDeal() {
    if (!dealForm.user||!dealForm.store||!dealForm.product||!dealForm.price||!dealForm.location) return;
    const newDeal = { id:Date.now(), ...dealForm, upvotes:0, ts:Date.now() };
    setDeals(prev=>[newDeal,...prev]);
    setUsers(prev=>{ const u=prev[dealForm.user]||{deals:0,upvotes:0}; return {...prev,[dealForm.user]:{deals:u.deals+1,upvotes:u.upvotes}}; });
    setMyUsername(dealForm.user);
    setDealForm({user:"",store:"",product:"",price:"",location:"",pet:"dogs"});
    setDealSubmitted(true); setTimeout(()=>setDealSubmitted(false),3000);
    setTab("deals");
  }
  function upvoteDeal(id, dealUser) {
    if (upvoted[id]) return;
    setDeals(prev=>prev.map(d=>d.id===id?{...d,upvotes:d.upvotes+1}:d));
    setUsers(prev=>{ const u=prev[dealUser]||{deals:0,upvotes:0}; return {...prev,[dealUser]:{...u,upvotes:u.upvotes+1}}; });
    setUpvoted(prev=>({...prev,[id]:true}));
  }

  const sortedDeals = [...deals].sort((a,b)=>sortDeals==="newest"?b.ts-a.ts:b.upvotes-a.upvotes);
  const leaderboard = Object.entries(users).map(([name,data])=>({name,...data,score:data.deals*3+data.upvotes})).sort((a,b)=>b.score-a.score);

  const tabStyle = (t) => ({
    padding:"8px 14px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:500, fontSize:13,
    background: tab===t ? accent : "transparent",
    color: tab===t ? "white" : "#666", transition:"all 0.2s",
  });

  const ingredientList = ingText && ingText !== "unavailable"
    ? ingText.split(/,(?![^()]*\))/).map(s=>s.trim()).filter(Boolean)
    : [];
  const { good, bad } = qualityFlags(ingText || "");
  const score      = Math.min(100, Math.max(0, 50 + good.length*12 - bad.length*18));
  const scoreColor = score >= 70 ? "#2E7D32" : score >= 45 ? "#F57F17" : "#C62828";
  const scoreBg    = score >= 70 ? "#E8F5E9" : score >= 45 ? "#FFF8E1" : "#FFEBEE";
  const scoreLabel = score >= 70 ? "Good" : score >= 45 ? "Fair" : "Poor";

  const sourceLabel = ingSource === "opff" ? "Open Pet Food Facts"
    : ingSource === "chewy" ? "Chewy"
    : ingSource === "ai" ? "AI-generated · verify on manufacturer's site"
    : null;

  return (
    <div style={{fontFamily:"sans-serif",maxWidth:720,margin:"0 auto",padding:"1rem 1rem 2rem"}}>

      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
        <div style={{flexShrink:0}}>{pet==="dogs"?DOG_SVG:CAT_SVG}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:26,fontWeight:500,lineHeight:1}}>🐾 PawPrice</div>
          <div style={{fontSize:14,color:"#666",marginTop:4}}>AI-powered pet food price comparison</div>
        </div>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:20,background:"#f5f5f5",padding:4,borderRadius:24,flexWrap:"wrap"}}>
        {[["search","Search Prices"],["mypets","My Pets"],["deals","Community Deals"],["leaderboard","Leaderboard"]].map(([t,l])=>(
          <button key={t} style={tabStyle(t)} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {tab==="search" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{display:"flex",background:"#f0f0f0",borderRadius:20,padding:3}}>
              {["dogs","cats"].map(p=>(
                <button key={p} onClick={()=>{setPet(p);setResults(null);setSelectedProduct(null);setSearch("");}}
                  style={{padding:"6px 16px",borderRadius:18,border:"none",cursor:"pointer",fontWeight:500,fontSize:13,
                    background:pet===p?(p==="dogs"?"#EF9F27":"#7F77DD"):"transparent",
                    color:pet===p?"white":"#666",transition:"all 0.2s"}}>
                  {p==="dogs"?"🐶 Dogs":"🐱 Cats"}
                </button>
              ))}
            </div>
          </div>

          {!selectedProduct ? (
            <>
              <div style={{position:"relative",marginBottom:12}}>
                <div style={{display:"flex",gap:8}}>
                  <input value={search}
                    onChange={e=>{setSearch(e.target.value);setShowSuggestions(true);}}
                    onKeyDown={e=>{if(e.key==="Enter"){setShowSuggestions(false);searchProducts();}if(e.key==="Escape")setShowSuggestions(false);}}
                    onFocus={()=>setShowSuggestions(true)}
                    onBlur={()=>setTimeout(()=>setShowSuggestions(false),150)}
                    placeholder={`Search any ${pet==="dogs"?"dog":"cat"} food… or describe needs`}
                    style={{flex:1,padding:"11px 16px",borderRadius:12,border:`1.5px solid ${accent}`,fontSize:14,outline:"none"}}/>
                  <button onClick={()=>{setShowSuggestions(false);searchProducts();}} disabled={loading}
                    style={{padding:"11px 22px",borderRadius:12,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:14,opacity:loading?0.7:1}}>
                    {loading?"…":"Search"}
                  </button>
                </div>
                {showSuggestions && search.trim().length > 0 && (() => {
                  const list = pet==="dogs" ? DOG_SUGGESTIONS : CAT_SUGGESTIONS;
                  const filtered = list.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0,6);
                  return filtered.length > 0 ? (
                    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1px solid #eee",borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",zIndex:100,overflow:"hidden",marginTop:4}}>
                      {filtered.map((s,i)=>(
                        <div key={i} onMouseDown={()=>{setSearch(s);setShowSuggestions(false);}}
                          style={{padding:"10px 16px",cursor:"pointer",fontSize:14,borderBottom:i<filtered.length-1?"1px solid #f5f5f5":"none",display:"flex",alignItems:"center",gap:10}}
                          onMouseEnter={e=>e.currentTarget.style.background="#f9f9f9"}
                          onMouseLeave={e=>e.currentTarget.style.background="white"}>
                          <span style={{color:accent,fontSize:16}}>🔍</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* ── Dietary Filter Section ── */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <button onClick={()=>setShowFilters(f=>!f)}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,
                      border:`1.5px solid ${activeFilters.length>0?accent:"#ddd"}`,
                      background:activeFilters.length>0?accentLight:"white",
                      color:activeFilters.length>0?accent:"#666",cursor:"pointer",fontSize:13,fontWeight:500}}>
                    <span>🔬</span>
                    <span>Dietary Filters</span>
                    {activeFilters.length>0&&<span style={{background:accent,color:"white",borderRadius:10,padding:"1px 7px",fontSize:11}}>{activeFilters.length}</span>}
                    <span style={{fontSize:11}}>{showFilters?"▲":"▼"}</span>
                  </button>
                  {activeFilters.length>0&&(
                    <button onClick={clearFilters}
                      style={{padding:"6px 12px",borderRadius:20,border:"1px solid #ddd",background:"transparent",color:"#999",cursor:"pointer",fontSize:12}}>
                      Clear all
                    </button>
                  )}
                  {/* Active filter chips */}
                  {activeFilters.map(id=>{
                    const f = DIET_FILTERS.find(f=>f.id===id);
                    return f ? (
                      <span key={id} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:16,
                        background:accentLight,color:accent,fontSize:12,fontWeight:500}}>
                        {f.icon} {f.label}
                        <span onClick={()=>toggleFilter(id)} style={{cursor:"pointer",marginLeft:2,opacity:0.7}}>✕</span>
                      </span>
                    ) : null;
                  })}
                </div>

                {showFilters && (
                  <div style={{background:"white",border:`1px solid ${accent}33`,borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                    <div style={{fontSize:12,color:"#666",marginBottom:10,fontWeight:500}}>Select your pet's dietary needs — AI will filter results automatically</div>

                    {/* Health conditions */}
                    <div style={{fontSize:11,color:"#999",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Health & Lifestyle</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                      {DIET_FILTERS.slice(0,9).map(f=>(
                        <button key={f.id} onClick={()=>toggleFilter(f.id)}
                          title={f.desc}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:18,
                            border:`1.5px solid ${activeFilters.includes(f.id)?accent:"#e0e0e0"}`,
                            background:activeFilters.includes(f.id)?accentLight:"#fafafa",
                            color:activeFilters.includes(f.id)?accent:"#555",
                            cursor:"pointer",fontSize:12,fontWeight:activeFilters.includes(f.id)?600:400,
                            transition:"all 0.15s"}}>
                          <span>{f.icon}</span>
                          <span>{f.label}</span>
                          {activeFilters.includes(f.id)&&<span style={{fontSize:10}}>✓</span>}
                        </button>
                      ))}
                    </div>

                    {/* Allergen exclusions */}
                    <div style={{fontSize:11,color:"#999",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Allergen Exclusions</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {DIET_FILTERS.slice(9).map(f=>(
                        <button key={f.id} onClick={()=>toggleFilter(f.id)}
                          title={f.desc}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:18,
                            border:`1.5px solid ${activeFilters.includes(f.id)?"#E24B4A":"#e0e0e0"}`,
                            background:activeFilters.includes(f.id)?"#FFEBEE":"#fafafa",
                            color:activeFilters.includes(f.id)?"#C62828":"#555",
                            cursor:"pointer",fontSize:12,fontWeight:activeFilters.includes(f.id)?600:400,
                            transition:"all 0.15s"}}>
                          <span>{f.icon}</span>
                          <span>{f.label}</span>
                          {activeFilters.includes(f.id)&&<span style={{fontSize:10}}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,fontSize:12,color:"#666"}}>
                <span style={{background:accentLight,color:accent,padding:"3px 10px",borderRadius:10,fontWeight:500}}>✨ AI-powered</span>
                <span>Real brands, estimated prices across 8 major retailers</span>
              </div>
              {error && <div style={{color:"#E24B4A",fontSize:14,marginBottom:12}}>{error}</div>}
              {loading && (
                <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                  <div style={{fontSize:15,fontWeight:500,color:accent}}>
                    {activeFilters.length>0?"Finding products matching your dietary requirements…":"Comparing prices…"}
                  </div>
                </div>
              )}
              {!loading && !results && (
                <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
                  <div style={{fontSize:40,marginBottom:8}}>{pet==="dogs"?"🐶":"🐱"}</div>
                  <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Search any pet food</div>
                  <div style={{fontSize:13}}>Try "Blue Buffalo chicken adult" or use Dietary Filters above for allergy-friendly results</div>
                </div>
              )}
              {results && results.length===0 && (
                <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
                  <div style={{fontSize:40,marginBottom:8}}>🔎</div>
                  <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>No matching products found</div>
                  <div style={{fontSize:13}}>
                    {activeFilters.length>0
                      ? "Try removing some dietary filters or broadening your search."
                      : `Try a different search — make sure the brand makes food for ${pet==="dogs"?"dogs":"cats"}!`}
                  </div>
                </div>
              )}

              {results && results.length > 0 && (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:"#666",fontWeight:500}}>Sort by:</span>
                    {[
                      { val:"default", label:"Relevance",       icon:"✦" },
                      { val:"price",   label:"Lowest Price",     icon:"💰" },
                      { val:"health",  label:"Healthiest First", icon:"🥦" },
                    ].map(({ val, label, icon }) => (
                      <button key={val} onClick={() => setSortResults(val)}
                        style={{
                          display:"flex", alignItems:"center", gap:5,
                          padding:"6px 14px", borderRadius:20,
                          border:`1.5px solid ${sortResults===val ? accent : "#ddd"}`,
                          background: sortResults===val ? accentLight : "white",
                          color: sortResults===val ? accent : "#666",
                          cursor:"pointer", fontSize:12, fontWeight: sortResults===val ? 600 : 400,
                          transition:"all 0.18s",
                          boxShadow: sortResults===val ? `0 2px 8px ${accent}33` : "none",
                        }}>
                        <span>{icon}</span>
                        <span>{label}</span>
                        {sortResults===val && <span style={{fontSize:10}}>▼</span>}
                      </button>
                    ))}
                  </div>

                  {activeFilters.length>0&&(
                    <div style={{marginBottom:12,padding:"8px 14px",background:"#E8F5E9",borderRadius:8,fontSize:12,color:"#2E7D32",display:"flex",alignItems:"center",gap:6}}>
                      <span>✅</span>
                      <span>Results filtered for: {activeFilters.map(id=>DIET_FILTERS.find(f=>f.id===id)?.label).join(", ")}</span>
                    </div>
                  )}

                  {getSortedResults().map((prod, i) => {
                    const minP = getMin(prod.prices);
                    const maxP = getMax(prod.prices);
                    const hs   = getHealthScore(prod);
                    const healthBadge = hs >= 4
                      ? { label:"Top Pick 🥦", bg:"#E8F5E9", color:"#2E7D32" }
                      : hs >= 1
                      ? { label:"Good Choice", bg:"#F1F8E9", color:"#558B2F" }
                      : hs < 0
                      ? { label:"Check Ingredients", bg:"#FFEBEE", color:"#C62828" }
                      : null;

                    return (
                      <div key={i} onClick={() => setSelectedProduct(prod)}
                        style={{
                          background:"white", border:"1px solid #eee", borderRadius:12,
                          padding:"14px 16px", cursor:"pointer", marginBottom:10,
                          transition:"box-shadow 0.2s, border-color 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor=accent+"66"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="#eee"; }}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:500,fontSize:15,marginBottom:2}}>{prod.name}</div>
                            <div style={{fontSize:12,color:"#666",marginBottom:6}}>{prod.brand} · {prod.type} · {prod.size} · {prod.stage}</div>
                            {/* Dietary tags */}
                            {prod.dietaryTags && prod.dietaryTags.length>0&&(
                              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                                {prod.dietaryTags.slice(0,4).map(tagId=>{
                                  const tagDef = DIET_FILTERS.find(f=>f.id===tagId);
                                  if(!tagDef) return null;
                                  const isAllergen = tagId.startsWith("no_");
                                  return (
                                    <span key={tagId} style={{fontSize:11,padding:"2px 8px",borderRadius:8,
                                      background:isAllergen?"#FFEBEE":"#E8F5E9",
                                      color:isAllergen?"#C62828":"#2E7D32"}}>
                                      {tagDef.icon} {tagDef.label}
                                    </span>
                                  );
                                })}
                                {prod.dietaryTags.length>4&&<span style={{fontSize:11,color:"#999"}}>+{prod.dietaryTags.length-4} more</span>}
                              </div>
                            )}
                            {sortResults==="health" && healthBadge && (
                              <span style={{fontSize:11,padding:"2px 9px",borderRadius:8,background:healthBadge.bg,color:healthBadge.color,fontWeight:500}}>
                                {healthBadge.label}
                              </span>
                            )}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                            <div style={{fontSize:18,fontWeight:500,color:accent}}>${minP.toFixed(2)}</div>
                            <div style={{fontSize:11,color:"#999"}}>Save up to ${(maxP-minP).toFixed(2)}</div>
                            <div style={{fontSize:11,color:accent,marginTop:2}}>Compare →</div>
                          </div>
                        </div>
                        {sortResults==="price" && i===0 && (
                          <div style={{marginTop:8,fontSize:11,padding:"3px 10px",background:accentLight,color:accent,borderRadius:8,display:"inline-block",fontWeight:600}}>
                            💰 Lowest price in results
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </>
          ) : (
            <div>
              <button onClick={()=>setSelectedProduct(null)}
                style={{background:"transparent",border:"none",color:accent,cursor:"pointer",fontSize:14,fontWeight:500,marginBottom:14,padding:0}}>
                ← Back to results
              </button>

              <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"18px 20px",marginBottom:16}}>
                <div style={{fontWeight:500,fontSize:17,marginBottom:2}}>{selectedProduct.name}</div>
                <div style={{fontSize:13,color:"#666",marginBottom:8}}>{selectedProduct.brand} · {selectedProduct.type} · {selectedProduct.size} · {selectedProduct.stage}</div>
                {selectedProduct.dietaryTags && selectedProduct.dietaryTags.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:14}}>
                    {selectedProduct.dietaryTags.map(tagId=>{
                      const tagDef = DIET_FILTERS.find(f=>f.id===tagId);
                      if(!tagDef) return null;
                      const isAllergen = tagId.startsWith("no_");
                      return (
                        <span key={tagId} style={{fontSize:11,padding:"3px 10px",borderRadius:10,
                          background:isAllergen?"#FFEBEE":"#E8F5E9",
                          color:isAllergen?"#C62828":"#2E7D32",fontWeight:500}}>
                          {tagDef.icon} {tagDef.label}
                        </span>
                      );
                    })}
                  </div>
                )}
                {[...selectedProduct.prices].sort((a,b)=>a.price-b.price).map((p,i)=>(
                  <div key={p.store} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f0f0f0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {i===0&&<span style={{fontSize:11,background:accentLight,color:accent,borderRadius:6,padding:"2px 8px",fontWeight:500}}>Best deal</span>}
                      <span style={{fontWeight:i===0?500:400,fontSize:14}}>{p.store}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:16,fontWeight:500,color:i===0?accent:"#333"}}>${p.price.toFixed(2)}</span>
                      <a href={getStoreLink(p.store,selectedProduct.name)} target="_blank" rel="noopener noreferrer"
                        style={{fontSize:12,color:accent,textDecoration:"none",border:`1px solid ${accent}`,borderRadius:6,padding:"4px 10px"}}>
                        Buy at {p.store} →
                      </a>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:14,padding:"10px 14px",background:accentLight,borderRadius:8,fontSize:13,color:"#666"}}>
                  💡 Based on estimates, you could save up to <strong style={{color:accent}}>${(getMax(selectedProduct.prices)-getMin(selectedProduct.prices)).toFixed(2)}</strong> by choosing the best deal.
                </div>
                <div style={{marginTop:8,padding:"8px 12px",background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:8,fontSize:11,color:"#7a5800"}}>
                  ⚠️ Prices shown are AI-generated estimates and may not reflect current retail prices. Always verify the actual price before purchasing.
                </div>
              </div>

              <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontWeight:500,fontSize:16,marginBottom:12}}>🧪 Ingredients</div>
                {ingLoading && (
                  <div style={{textAlign:"center",padding:"20px 0",color:"#999",fontSize:14}}>Looking up ingredients…</div>
                )}
                {!ingLoading && ingText === "unavailable" && (
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={{fontSize:28,marginBottom:8}}>😔</div>
                    <div style={{fontSize:14,fontWeight:500,color:"#666"}}>We're sorry, the ingredients list is not available for this product.</div>
                    <div style={{fontSize:12,marginTop:6,color:"#aaa"}}>Try checking the manufacturer's website for full ingredient details.</div>
                  </div>
                )}
                {!ingLoading && ingredientList.length>0 && (
                  <>
                    {ingDisclaimer && (
                      <div style={{padding:"8px 12px",background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:8,fontSize:12,color:"#7a5800",marginBottom:14}}>
                        ⚠️ Ingredients sourced from AI — please verify on the manufacturer's website before making feeding decisions.
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:scoreBg,borderRadius:10,marginBottom:16,border:`1px solid ${scoreColor}44`}}>
                      <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${scoreColor}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:15,fontWeight:700,color:scoreColor}}>{score}</span>
                      </div>
                      <div>
                        <div style={{fontWeight:600,color:scoreColor,fontSize:15}}>{scoreLabel} Quality</div>
                        <div style={{fontSize:12,color:"#666",marginTop:2}}>
                          {good.length>0 && `✓ Contains ${good.slice(0,2).join(", ")}. `}
                          {bad.length>0  && `⚠ Watch: ${bad.slice(0,2).join(", ")}.`}
                          {good.length===0&&bad.length===0&&"Review ingredients below."}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
                      {[["#F57F17","★ First ingredient"],["#2E7D32","Quality protein/veggie"],["#C62828","Watch out for"]].map(([c,l])=>(
                        <span key={l} style={{fontSize:11,color:c,display:"flex",alignItems:"center",gap:4}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}
                        </span>
                      ))}
                    </div>
                    <div style={{fontSize:12,color:"#999",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{ingredientList.length} Ingredients</div>
                    <div style={{lineHeight:1.9}}>
                      {ingredientList.map((ing,i)=><IngredientBadge key={i} word={ing} index={i}/>)}
                    </div>
                    {sourceLabel && (
                      <div style={{fontSize:11,color:"#bbb",marginTop:12}}>Source: {sourceLabel}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab==="mypets" && (
        <div>
          <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"16px 18px",marginBottom:18}}>
            <div style={{fontWeight:500,fontSize:15,marginBottom:12}}>Add a Pet</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <input value={petForm.name} onChange={e=>setPetForm({...petForm,name:e.target.value})}
                placeholder="Pet name (e.g. Max)"
                style={{padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14}}/>
              <div style={{display:"flex",background:"#f0f0f0",borderRadius:20,padding:3,width:"fit-content"}}>
                {["dogs","cats"].map(p=>(
                  <button key={p} onClick={()=>setPetForm({...petForm,type:p})}
                    style={{padding:"6px 20px",borderRadius:18,border:"none",cursor:"pointer",fontWeight:500,fontSize:13,
                      background:petForm.type===p?(p==="dogs"?"#EF9F27":"#7F77DD"):"transparent",
                      color:petForm.type===p?"white":"#666",transition:"all 0.2s"}}>
                    {p==="dogs"?"🐶 Dog":"🐱 Cat"}
                  </button>
                ))}
              </div>
              <input value={petForm.food} onChange={e=>setPetForm({...petForm,food:e.target.value})}
                placeholder="Favourite food (e.g. Purina Pro Plan)"
                style={{padding:"9px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14}}/>

              {/* Dietary needs for pet profile */}
              <div>
                <div style={{fontSize:13,color:"#666",marginBottom:6,fontWeight:500}}>🔬 Dietary needs (optional)</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {DIET_FILTERS.map(f=>(
                    <button key={f.id} onClick={()=>togglePetDiet(f.id)}
                      title={f.desc}
                      style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:16,
                        border:`1px solid ${petForm.dietaryNeeds.includes(f.id)?(f.id.startsWith("no_")?"#E24B4A":accent):"#e0e0e0"}`,
                        background:petForm.dietaryNeeds.includes(f.id)?(f.id.startsWith("no_")?"#FFEBEE":accentLight):"#fafafa",
                        color:petForm.dietaryNeeds.includes(f.id)?(f.id.startsWith("no_")?"#C62828":accent):"#777",
                        cursor:"pointer",fontSize:11,transition:"all 0.15s"}}>
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={addPet}
                style={{padding:"9px 22px",borderRadius:8,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:14,width:"fit-content"}}>
                {petSaved?"Saved! ✓":"Save Pet"}
              </button>
            </div>
          </div>
          {myPets.length===0 ? (
            <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
              <div style={{fontSize:40,marginBottom:8}}>🐾</div>
              <div style={{fontSize:15,fontWeight:500}}>No pets saved yet</div>
              <div style={{fontSize:13,marginTop:4}}>Add your first pet above!</div>
            </div>
          ) : myPets.map(p=>(
            <div key={p.id} style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:p.dietaryNeeds&&p.dietaryNeeds.length>0?8:0}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:20}}>{p.type==="dogs"?"🐶":"🐱"}</span>
                    <span style={{fontWeight:500,fontSize:16}}>{p.name}</span>
                  </div>
                  <div style={{fontSize:13,color:"#666"}}>Favourite: {p.food}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>searchForPet(p)}
                    style={{padding:"7px 14px",borderRadius:8,background:p.type==="dogs"?"#EF9F27":"#7F77DD",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:500}}>
                    Search
                  </button>
                  <button onClick={()=>deletePet(p.id)}
                    style={{padding:"7px 12px",borderRadius:8,background:"transparent",color:"#999",border:"1px solid #ddd",cursor:"pointer",fontSize:13}}>
                    ✕
                  </button>
                </div>
              </div>
              {p.dietaryNeeds && p.dietaryNeeds.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                  {p.dietaryNeeds.map(id=>{
                    const f=DIET_FILTERS.find(f=>f.id===id);
                    return f?(
                      <span key={id} style={{fontSize:11,padding:"2px 8px",borderRadius:8,
                        background:id.startsWith("no_")?"#FFEBEE":"#E8F5E9",
                        color:id.startsWith("no_")?"#C62828":"#2E7D32"}}>
                        {f.icon} {f.label}
                      </span>
                    ):null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==="deals" && (
        <div>
          <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"16px 18px",marginBottom:18}}>
            <div style={{fontWeight:500,fontSize:15,marginBottom:12}}>Post a great deal you found</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {[["user","Your username"],["store","Store name"],["product","Product name & size"],["price","Price (e.g. $29.99)"],["location","City, State"]].map(([k,ph])=>(
                <input key={k} value={dealForm[k]} onChange={e=>setDealForm({...dealForm,[k]:e.target.value})}
                  placeholder={ph} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13}}/>
              ))}
              <select value={dealForm.pet} onChange={e=>setDealForm({...dealForm,pet:e.target.value})}
                style={{padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13}}>
                <option value="dogs">Dogs</option><option value="cats">Cats</option>
              </select>
            </div>
            <button onClick={submitDeal}
              style={{padding:"9px 22px",borderRadius:8,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:13}}>
              {dealSubmitted?"Deal posted! ✓":"Post deal"}
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:13,color:"#666"}}>Sort by:</span>
            {["newest","most upvoted"].map(s=>(
              <button key={s} onClick={()=>setSortDeals(s)}
                style={{padding:"5px 14px",borderRadius:16,border:`1px solid ${sortDeals===s?accent:"#ddd"}`,background:sortDeals===s?accentLight:"transparent",color:sortDeals===s?accent:"#666",cursor:"pointer",fontSize:12}}>
                {s}
              </button>
            ))}
          </div>
          {sortedDeals.map(deal=>{
            const b=getBadge(users[deal.user]?.deals||0);
            return (
              <div key={deal.id} style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:500}}>{deal.user}</span>
                    <span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:deal.pet==="dogs"?"#FAEEDA":"#EEEDFE",color:deal.pet==="dogs"?"#BA7517":"#534AB7"}}>
                      {deal.pet==="dogs"?"🐶":"🐱"} {b.icon} {b.label}
                    </span>
                  </div>
                  <div style={{fontSize:14,fontWeight:500}}>{deal.product}</div>
                  <div style={{fontSize:12,color:"#666",marginTop:3}}>{deal.store} · {deal.location}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  <div style={{fontSize:18,fontWeight:500,color:deal.pet==="dogs"?"#EF9F27":"#7F77DD"}}>{deal.price}</div>
                  <button onClick={()=>upvoteDeal(deal.id,deal.user)}
                    style={{display:"flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:16,border:`1px solid ${upvoted[deal.id]?"#639922":"#ddd"}`,background:upvoted[deal.id]?"#EAF3DE":"transparent",color:upvoted[deal.id]?"#3B6D11":"#666",cursor:"pointer",fontSize:12}}>
                    👍 {deal.upvotes}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="leaderboard" && (
        <div>
          <div style={{fontWeight:500,fontSize:16,marginBottom:4}}>Deal Finder Leaderboard</div>
          <div style={{fontSize:13,color:"#666",marginBottom:16}}>Top community contributors who hunt down the best pet food deals</div>
          {leaderboard.map((u,i)=>{
            const b=getBadge(u.deals);
            return (
              <div key={u.name} style={{background:"white",border:i===0?`2px solid ${accent}`:"1px solid #eee",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:i===0?accentLight:i===1?"#E1F5EE":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:500,fontSize:14,color:i===0?accent:i===1?"#1D9E75":"#666",flexShrink:0}}>
                  {i===0?"🥇":i===1?"🥈":"#"+(i+1)}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:500,fontSize:14}}>{u.name}</span>
                    {u.name===myUsername&&<span style={{fontSize:11,padding:"1px 7px",borderRadius:6,background:"#E1F5EE",color:"#1D9E75"}}>You</span>}
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:accentLight,color:accent}}>{b.icon} {b.label}</span>
                  </div>
                  <div style={{fontSize:12,color:"#666",marginTop:2}}>{u.deals} deals posted · {u.upvotes} upvotes received</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:500,color:accent}}>{u.score}</div>
                  <div style={{fontSize:11,color:"#666"}}>pts</div>
                </div>
              </div>
            );
          })}
          <div style={{marginTop:16,padding:"12px 16px",background:"#f5f5f5",borderRadius:10,fontSize:12,color:"#666"}}>
            Points: 3 per deal posted + 1 per upvote received. Post deals to climb the ranks!
          </div>
        </div>
      )}

      <div style={{marginTop:24,padding:"12px 16px",background:"#f5f5f5",borderRadius:10,fontSize:11,color:"#999",textAlign:"center",lineHeight:1.5}}>
        🐾 PawPrice earns a commission when you purchase through our links at no extra cost to you. Prices shown are estimates and may vary. Always verify pricing on the retailer's site.
      </div>

      <Analytics />
    </div>
  );
}
