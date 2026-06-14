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

const DIET_FILTERS = [
  { id:"grain_free",        label:"Grain Free",             icon:"🌾", desc:"No wheat, corn, or grains" },
  { id:"limited_ingredient",label:"Limited Ingredient",     icon:"🧪", desc:"Fewer ingredients, great for sensitive pets" },
  { id:"hypoallergenic",    label:"Hypoallergenic",          icon:"💊", desc:"Formulated to reduce allergic reactions" },
  { id:"high_protein",      label:"High Protein",            icon:"💪", desc:"More than 30% protein content" },
  { id:"low_fat",           label:"Low Fat",                 icon:"🥗", desc:"Ideal for weight management" },
  { id:"low_sodium",        label:"Low Sodium",              icon:"🧂", desc:"Heart and kidney health support" },
  { id:"weight_management", label:"Weight Management",       icon:"⚖️", desc:"Calorie-controlled formula" },
  { id:"senior",            label:"Senior Formula",          icon:"👴", desc:"Formulated for older pets" },
  { id:"puppy_kitten",      label:"Puppy / Kitten",          icon:"🍼", desc:"Growth and development formula" },
  { id:"no_chicken",        label:"No Chicken",              icon:"🚫🍗",desc:"Chicken-free for allergies" },
  { id:"no_beef",           label:"No Beef",                 icon:"🚫🥩",desc:"Beef-free for allergies" },
  { id:"no_fish",           label:"No Fish",                 icon:"🚫🐟",desc:"Fish-free for allergies" },
  { id:"no_grain_corn",     label:"No Corn or Soy",          icon:"🌽", desc:"Avoids common filler allergens" },
  { id:"no_dairy",          label:"No Dairy",                icon:"🥛", desc:"Dairy-free formula" },
  { id:"organic",           label:"Organic",                 icon:"🌿", desc:"USDA certified organic ingredients" },
  { id:"no_artificial",     label:"No Artificial Additives", icon:"✅", desc:"No artificial colors, flavors, or preservatives" },
];

function buildDietPrompt(activeFilters) {
  if (activeFilters.length === 0) return "";
  const labels = activeFilters.map(id => DIET_FILTERS.find(f => f.id === id)?.label).filter(Boolean);
  return `\n\nDIETARY REQUIREMENTS (STRICT): The user requires products that meet ALL of the following criteria: ${labels.join(", ")}. Only return products that genuinely meet these requirements. If no products match, return [].`;
}

const DOG_SUGGESTIONS = [
  "Blue Buffalo Life Protection Chicken & Brown Rice","Blue Buffalo Wilderness Chicken","Blue Buffalo Homestyle Recipe Chicken",
  "Purina Pro Plan Chicken & Rice Adult","Purina Pro Plan Salmon & Rice Adult","Purina Pro Plan Puppy Chicken & Rice",
  "Purina ONE SmartBlend Chicken & Rice","Purina ONE Natural Lamb & Rice","Purina Dog Chow Complete Adult","Purina Puppy Chow Complete Nutrition",
  "Hill's Science Diet Adult Chicken & Barley","Hill's Science Diet Puppy Chicken Meal & Barley","Hill's Science Diet Senior 7+ Chicken",
  "Royal Canin Adult Breed Health Nutrition","Royal Canin Medium Adult","Royal Canin Puppy",
  "Pedigree Adult Complete Nutrition","Pedigree Puppy Complete Nutrition",
  "Iams ProActive Health Adult MiniChunks","Iams ProActive Health Puppy",
  "Eukanuba Adult Medium Breed","Eukanuba Puppy Medium Breed",
  "Diamond Naturals Adult Lamb & Rice","Diamond Naturals Large Breed Adult","Diamond Naturals Puppy",
  "Taste of the Wild High Prairie","Taste of the Wild Pacific Stream","Taste of the Wild Sierra Mountain",
  "Merrick Grain Free Real Chicken","Merrick Classic Real Chicken & Sweet Potato",
  "Wellness CORE Grain Free Original","Wellness Complete Health Adult Deboned Chicken",
  "Nutro Natural Choice Adult Chicken & Brown Rice","Nutro Ultra Adult",
  "Orijen Original","Orijen Puppy","Acana Grasslands","Acana Heritage Free-Run Poultry",
  "Fromm Gold Adult","Fromm Four-Star Salmon & Chicken Pate",
  "4Health Adult Chicken & Rice","4Health Puppy Chicken & Rice",
  "Kirkland Signature Adult Chicken Rice & Vegetable","Kirkland Signature Puppy Chicken Rice & Vegetable",
  "Victor Classic Hi-Pro Plus","Victor Select Beef Meal & Brown Rice",
  "Sportmix Wholesome Chicken Meal & Rice","Retriever Adult Dog Food","Ol Roy Complete Nutrition",
  "Natural Balance L.I.D. Sweet Potato & Fish",
];

const CAT_SUGGESTIONS = [
  "Blue Buffalo Adult Chicken & Brown Rice","Blue Buffalo Wilderness Chicken Adult",
  "Purina ONE Tender Selects Chicken","Purina Cat Chow Complete","Purina Pro Plan Adult Salmon & Rice",
  "Hill's Science Diet Adult Indoor","Royal Canin Indoor Adult",
  "Friskies Seafood Sensations","Fancy Feast Grilled Chicken","Meow Mix Original Choice",
  "Iams ProActive Health Indoor Weight & Hairball","Wellness CORE Grain Free Indoor",
  "Taste of the Wild Rocky Mountain","Natural Balance L.I.D. Green Pea & Salmon","Diamond Naturals Indoor Cat",
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
    <ellipse cx="40" cy="72" rx="8" ry="5" fill="#BA7517"/><ellipse cx="80" cy="72" rx="8" ry="5" fill="#BA7517"/>
    <ellipse cx="60" cy="88" rx="12" ry="8" fill="#BA7517"/>
    <path d="M50 92 Q60 100 70 92" stroke="#D85A30" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <ellipse cx="47" cy="68" rx="4" ry="3" fill="#2C2C2A"/><ellipse cx="73" cy="68" rx="4" ry="3" fill="#2C2C2A"/>
    <ellipse cx="60" cy="57" rx="4" ry="3" fill="#E24B4A"/>
  </svg>
);

const CAT_SVG = (
  <svg viewBox="0 0 120 120" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="75" rx="30" ry="26" fill="#AFA9EC"/>
    <ellipse cx="60" cy="52" rx="24" ry="22" fill="#AFA9EC"/>
    <polygon points="36,36 30,10 48,28" fill="#7F77DD"/><polygon points="84,36 90,10 72,28" fill="#7F77DD"/>
    <polygon points="37,35 33,14 47,29" fill="#F4C0D1"/><polygon points="83,35 87,14 73,29" fill="#F4C0D1"/>
    <ellipse cx="52" cy="50" rx="6" ry="7" fill="#1D9E75"/><ellipse cx="68" cy="50" rx="6" ry="7" fill="#1D9E75"/>
    <ellipse cx="52" cy="51" rx="3" ry="5" fill="#2C2C2A"/><ellipse cx="68" cy="51" rx="3" ry="5" fill="#2C2C2A"/>
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
  { min:0,  max:0,   label:"Pup",            icon:"🐶" },
  { min:1,  max:4,   label:"Bone Collector",  icon:"🦴" },
  { min:5,  max:14,  label:"Pack Leader",     icon:"🐾" },
  { min:15, max:999, label:"Top Sniffer",     icon:"🥇" },
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

// ── Price Alert helpers ──
function loadAlerts() {
  try { return JSON.parse(localStorage.getItem("pawprice_alerts") || "[]"); } catch { return []; }
}
function saveAlerts(alerts) {
  localStorage.setItem("pawprice_alerts", JSON.stringify(alerts));
}
function checkAlerts(alerts, results) {
  if (!results || results.length === 0) return [];
  const triggered = [];
  alerts.forEach(alert => {
    results.forEach(prod => {
      if (prod.name.toLowerCase().includes(alert.productName.toLowerCase()) ||
          alert.productName.toLowerCase().includes(prod.name.toLowerCase())) {
        const minPrice = Math.min(...prod.prices.map(p => p.price));
        const bestStore = [...prod.prices].sort((a,b) => a.price - b.price)[0];
        if (minPrice <= alert.targetPrice) {
          triggered.push({ alert, prod, minPrice, bestStore });
        }
      }
    });
  });
  return triggered;
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

  // ── Barcode Scanner state ──
  const [showScanner, setShowScanner]         = useState(false);
  const [scanResult, setScanResult]           = useState(null);
  const [scanLoading, setScanLoading]         = useState(false);
  const [scanError, setScanError]             = useState("");
  const [cameraStream, setCameraStream]       = useState(null);

  // ── Price Alert state ──
  const [alerts, setAlerts]                   = useState(loadAlerts);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal]   = useState(false);
  const [alertProduct, setAlertProduct]       = useState(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState("");
  const [alertSaved, setAlertSaved]           = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => { localStorage.setItem("pawprice_pets", JSON.stringify(myPets)); }, [myPets]);
  useEffect(() => { saveAlerts(alerts); }, [alerts]);
  useEffect(() => { setSortResults("default"); }, [results]);

  // Check alerts whenever results change
  useEffect(() => {
    if (results && alerts.length > 0) {
      const triggered = checkAlerts(alerts, results);
      setTriggeredAlerts(triggered);
    } else {
      setTriggeredAlerts([]);
    }
  }, [results, alerts]);

  useEffect(() => {
    if (!selectedProduct) { setIngText(null); setIngSource(null); setIngDisclaimer(false); return; }
    setIngLoading(true); setIngText(null); setIngSource(null); setIngDisclaimer(false);
    fetch("/api/ingredients", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ productName: selectedProduct.name }),
    })
      .then(r => r.json())
      .then(data => { setIngText(data.ingredients || "unavailable"); setIngSource(data.source || "none"); setIngDisclaimer(data.aiDisclaimer || false); })
      .catch(() => { setIngText("unavailable"); setIngSource("none"); })
      .finally(() => setIngLoading(false));
  }, [selectedProduct]);

  const accent      = pet === "dogs" ? "#EF9F27" : "#7F77DD";
  const accentLight = pet === "dogs" ? "#FAEEDA" : "#EEEDFE";

  function toggleFilter(id) {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }
  function clearFilters() { setActiveFilters([]); }

  // ── Barcode Scanner functions ──
  async function openScanner() {
    setScanResult(null); setScanError(""); setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setTimeout(() => {
        const video = document.getElementById("pawprice-scanner-video");
        if (video) { video.srcObject = stream; video.play(); }
        startBarcodeDetection(stream);
      }, 300);
    } catch(e) {
      setScanError("Camera access denied. Please allow camera access and try again.");
    }
  }

  function closeScanner() {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    setShowScanner(false); setScanResult(null); setScanError("");
  }

  function startBarcodeDetection(stream) {
    if (!("BarcodeDetector" in window)) {
      setScanError("Barcode scanning not supported on this browser. Try Chrome on Android.");
      return;
    }
    const detector = new window.BarcodeDetector({ formats: ["ean_13","ean_8","upc_a","upc_e"] });
    const video = document.getElementById("pawprice-scanner-video");
    if (!video) return;
    const interval = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0) {
            clearInterval(interval);
            const barcode = barcodes[0].rawValue;
            lookupBarcode(barcode);
          }
        } catch(e) {}
      }
    }, 500);
    // Auto-stop after 30 seconds
    setTimeout(() => { clearInterval(interval); }, 30000);
  }

  async function lookupBarcode(barcode) {
    setScanLoading(true); setScanError("");
    try {
      // Try Open Pet Food Facts API first
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const productName = p.product_name || p.brands || "";
        const brand = p.brands || "";
        const ingredients = p.ingredients_text || "";
        if (productName) {
          await processScanResult(productName, brand, ingredients, barcode);
          return;
        }
      }
      // Fallback: ask AI to identify by barcode
      await processScanResult("", "", "", barcode);
    } catch(e) {
      setScanError("Could not look up barcode. Try searching manually.");
      setScanLoading(false);
    }
  }

  async function processScanResult(productName, brand, ingredients, barcode) {
    try {
      const response = await fetch("/api/search", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:1500,
          messages:[{ role:"user", content:`You are a pet food analyzer. ${productName ? `The product is "${productName}" by "${brand}".` : `The barcode is ${barcode}.`}

${ingredients ? `Known ingredients: ${ingredients}` : ""}

Please analyze this pet food and return a JSON object with:
- name: full product name
- brand: brand name
- type: Dry/Wet/Treats
- size: typical size (e.g. "30 lb")
- stage: Adult/Puppy/Kitten/Senior
- healthScore: number 0-100 rating the nutritional quality
- healthLabel: "Excellent" / "Good" / "Fair" / "Poor"
- healthSummary: 1-2 sentence explanation of the health rating
- positives: array of up to 3 good things about this food
- concerns: array of up to 3 concerns or watch-outs
- dietaryTags: array from: grain_free, limited_ingredient, high_protein, low_fat, no_chicken, no_beef, no_fish, no_grain_corn, no_dairy, organic, no_artificial
- typicalPrice: estimated typical retail price as a number
- cheaperOnline: true/false — is this product typically cheaper online than in pet stores?
- onlineNote: if cheaperOnline is true, where is the best online price typically found

Return ONLY valid JSON, no markdown.` }]
        })
      });
      const data = await response.json();
      const text = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setScanResult(parsed);
      if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    } catch(e) {
      setScanError("Could not analyze product. Try searching manually.");
    }
    setScanLoading(false);
  }

  function useScanResult() {
    if (!scanResult) return;
    setSearch(scanResult.name);
    setPet("dogs");
    closeScanner();
    setTimeout(() => searchProducts(), 100);
  }

  // ── Alert functions ──
  function openAlertModal(prod) { setAlertProduct(prod); setAlertTargetPrice(""); setAlertSaved(false); setShowAlertModal(true); }
  function closeAlertModal() { setShowAlertModal(false); setAlertProduct(null); }

  function saveAlert() {
    if (!alertProduct || !alertTargetPrice || isNaN(parseFloat(alertTargetPrice))) return;
    const newAlert = {
      id: Date.now(),
      productName: alertProduct.name,
      brand: alertProduct.brand,
      targetPrice: parseFloat(alertTargetPrice),
      pet,
      createdAt: Date.now(),
    };
    setAlerts(prev => {
      const filtered = prev.filter(a => a.productName !== newAlert.productName);
      return [...filtered, newAlert];
    });
    setAlertSaved(true);
    setTimeout(() => { closeAlertModal(); }, 1200);
  }

  function deleteAlert(id) { setAlerts(prev => prev.filter(a => a.id !== id)); }

  function dismissTriggeredAlert(alertId) {
    setDismissedAlerts(prev => [...prev, alertId]);
  }

  function getStoreLink(store, productName) {
    const brand = encodeURIComponent(productName.split(' ').slice(0,2).join(' '));
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
    setPetSaved(true); setTimeout(() => setPetSaved(false), 2000);
  }
  function deletePet(id) { setMyPets(prev => prev.filter(p => p.id !== id)); }
  function searchForPet(p) {
    setPet(p.type); setSearch(p.food); setTab("search");
    setResults(null); setSelectedProduct(null); setError("");
    if (p.dietaryNeeds && p.dietaryNeeds.length > 0) setActiveFilters(p.dietaryNeeds);
  }
  function togglePetDiet(id) {
    setPetForm(prev => ({
      ...prev,
      dietaryNeeds: prev.dietaryNeeds.includes(id) ? prev.dietaryNeeds.filter(f => f !== id) : [...prev.dietaryNeeds, id]
    }));
  }

  // ── Browse by Diet (no brand name needed) ──
  async function browseByDiet() {
    if (activeFilters.length === 0) return;
    setLoading(true); setResults(null); setSelectedProduct(null); setError("");
    const dietPrompt = buildDietPrompt(activeFilters);
    try {
      const response = await fetch("/api/search", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:1500,
          messages:[{ role:"user", content:`You are a pet food price comparison assistant. The user wants to browse ${pet} food by dietary requirements only — they have not specified a brand or product name.${dietPrompt}

STRICT RULES:
1. Return 4 real, popular products for ${pet} that genuinely meet ALL of the dietary requirements listed above.
2. Only return products actually made for ${pet}. Never invent products.
3. Every brand, product name, and size must be real and verifiable.
4. Prices must be realistic. Never use 0 or null.
5. Each product must include a "dietaryTags" array listing which apply: grain_free, limited_ingredient, hypoallergenic, high_protein, low_fat, low_sodium, weight_management, senior, puppy_kitten, no_chicken, no_beef, no_fish, no_grain_corn, no_dairy, organic, no_artificial.

Return a JSON array of up to 4 real matching products. Each must have: name, brand, type (Dry/Wet/Treats), size, stage (Puppy/Kitten/Adult/Senior), dietaryTags (array), typicalLow (number), typicalHigh (number), typicalAvg (number), and prices array with store and price for: ${STORES.join(", ")}.

REQUIRED: Every product MUST include typicalLow, typicalHigh, and typicalAvg as numbers representing realistic US retail pricing.

If no real products match, return: []
Return ONLY valid JSON, no markdown.` }]
        })
      });
      const data = await response.json();
      if (!data.content) throw new Error(JSON.stringify(data));
      const text  = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      const valid = parsed.filter(p => p.prices && p.prices.length > 0 && p.prices.every(s => s.price > 0));
      setResults(valid);
    } catch(e) { setError("Browse failed: " + e.message); }
    setLoading(false);
  }

  async function searchProducts() {
    if (!search.trim()) return;
    setLoading(true); setResults(null); setSelectedProduct(null); setError("");
    const dietPrompt = buildDietPrompt(activeFilters);
    try {
      const response = await fetch("/api/search", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:1500,
          messages:[{ role:"user", content:`You are a pet food price comparison assistant. The user is searching for "${search}" for their ${pet}.${dietPrompt}

STRICT RULES:
1. Only return products that ACTUALLY EXIST and are made for ${pet}. Never invent products.
2. NEVER mix brands with animal types they don't serve. Friskies, Fancy Feast, Meow Mix = CAT ONLY. Pedigree, Puppy Chow, Milk-Bone, Ol Roy = DOG ONLY.
3. Every brand, product name, and size must be real and verifiable.
4. Stage field must accurately reflect the real product.
5. Prices must be realistic. Never use 0 or null.
6. Each product must include a "dietaryTags" array listing which apply: grain_free, limited_ingredient, hypoallergenic, high_protein, low_fat, low_sodium, weight_management, senior, puppy_kitten, no_chicken, no_beef, no_fish, no_grain_corn, no_dairy, organic, no_artificial.

Return a JSON array of up to 4 real matching products. Each must have: name, brand, type (Dry/Wet/Treats), size, stage (Puppy/Kitten/Adult/Senior), dietaryTags (array), typicalLow (number), typicalHigh (number), typicalAvg (number), and prices array with store and price for: ${STORES.join(", ")}.

REQUIRED: Every product MUST include typicalLow, typicalHigh, and typicalAvg as numbers. These represent the realistic historical price range for that product size based on your knowledge of typical US retail pricing. Never omit these fields. Example: a 30lb bag of Purina Pro Plan typically sells between $38-$48, so typicalLow=38, typicalHigh=48, typicalAvg=43.

If no real products match for ${pet}, return: []
Return ONLY valid JSON, no markdown.` }]
        })
      });
      const data = await response.json();
      if (!data.content) throw new Error(JSON.stringify(data));
      const text  = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      const valid = parsed.filter(p => p.prices && p.prices.length > 0 && p.prices.every(s => s.price > 0));
      setResults(valid);
    } catch(e) { setError("Search failed: " + e.message); }
    setLoading(false);
  }

  function getMin(prices) { return Math.min(...prices.map(p=>p.price)); }
  function getMax(prices) { return Math.max(...prices.map(p=>p.price)); }

  function getPriceTrend(prod) {
    const current = getMin(prod.prices);
    const maxP = getMax(prod.prices);
    const typicalAvg  = prod.typicalAvg  || ((current + maxP) / 2);
    const typicalLow  = prod.typicalLow  || (current * 0.95);
    const typicalHigh = prod.typicalHigh || (maxP * 1.08);
    const pct = (current - typicalAvg) / typicalAvg;
    if (current <= typicalLow * 1.03) return { label:"Best price we've seen", icon:"🟢", color:"#2E7D32", bg:"#E8F5E9", detail:`Usually $${typicalAvg.toFixed(2)} avg — great deal!` };
    if (pct <= -0.08) return { label:"Below average price", icon:"🟢", color:"#2E7D32", bg:"#E8F5E9", detail:`Avg is $${typicalAvg.toFixed(2)} — good time to buy` };
    if (pct <= 0.05)  return { label:"Average price", icon:"🟡", color:"#F57F17", bg:"#FFF8E1", detail:`Typical range $${typicalLow.toFixed(2)}–$${typicalHigh.toFixed(2)}` };
    return { label:"Above average price", icon:"🔴", color:"#C62828", bg:"#FFEBEE", detail:`Avg is $${typicalAvg.toFixed(2)} — might want to wait` };
  }

  function getSortedResults() {
    if (!results) return [];
    const copy = [...results];
    if (sortResults === "price")  return copy.sort((a,b) => getMin(a.prices) - getMin(b.prices));
    if (sortResults === "health") return copy.sort((a,b) => getHealthScore(b) - getHealthScore(a));
    return copy;
  }

  function hasAlert(prodName) {
    return alerts.some(a => a.productName.toLowerCase() === prodName.toLowerCase());
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
    ? ingText.split(/,(?![^()]*\))/).map(s=>s.trim()).filter(Boolean) : [];
  const { good, bad } = qualityFlags(ingText || "");
  const score      = Math.min(100, Math.max(0, 50 + good.length*12 - bad.length*18));
  const scoreColor = score >= 70 ? "#2E7D32" : score >= 45 ? "#F57F17" : "#C62828";
  const scoreBg    = score >= 70 ? "#E8F5E9" : score >= 45 ? "#FFF8E1" : "#FFEBEE";
  const scoreLabel = score >= 70 ? "Good" : score >= 45 ? "Fair" : "Poor";
  const sourceLabel = ingSource === "opff" ? "Open Pet Food Facts" : ingSource === "chewy" ? "Chewy" : ingSource === "ai" ? "AI-generated · verify on manufacturer's site" : null;

  const visibleTriggered = triggeredAlerts.filter(t => !dismissedAlerts.includes(t.alert.id));

  return (
    <div style={{fontFamily:"sans-serif",maxWidth:720,margin:"0 auto",padding:"1rem 1rem 2rem"}}>

      {/* ── Barcode Scanner Modal ── */}
      {showScanner && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.92)",zIndex:1000,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px"}}>
            <div style={{color:"white",fontWeight:500,fontSize:17}}>📷 Scan Pet Food Barcode</div>
            <button onClick={closeScanner}
              style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",cursor:"pointer",fontSize:16,padding:"8px 14px",borderRadius:8}}>
              Close ✕
            </button>
          </div>

          {!scanResult && !scanLoading && !scanError && (
            <>
              <div style={{flex:1,position:"relative",margin:"0 16px"}}>
                <video id="pawprice-scanner-video" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:16}} playsInline muted/>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:240,height:160,border:"3px solid #EF9F27",borderRadius:12,boxShadow:"0 0 0 9999px rgba(0,0,0,0.5)"}}>
                  <div style={{position:"absolute",top:-2,left:-2,width:24,height:24,borderTop:"4px solid #EF9F27",borderLeft:"4px solid #EF9F27",borderRadius:"4px 0 0 0"}}/>
                  <div style={{position:"absolute",top:-2,right:-2,width:24,height:24,borderTop:"4px solid #EF9F27",borderRight:"4px solid #EF9F27",borderRadius:"0 4px 0 0"}}/>
                  <div style={{position:"absolute",bottom:-2,left:-2,width:24,height:24,borderBottom:"4px solid #EF9F27",borderLeft:"4px solid #EF9F27",borderRadius:"0 0 0 4px"}}/>
                  <div style={{position:"absolute",bottom:-2,right:-2,width:24,height:24,borderBottom:"4px solid #EF9F27",borderRight:"4px solid #EF9F27",borderRadius:"0 0 4px 0"}}/>
                </div>
              </div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:13,textAlign:"center",padding:"16px"}}>
                Point camera at the barcode on any pet food package
              </div>
            </>
          )}

          {scanLoading && (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"white"}}>
              <div style={{fontSize:48,marginBottom:16}}>🔍</div>
              <div style={{fontSize:16,fontWeight:500}}>Analyzing product…</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:8}}>Checking ingredients & prices</div>
            </div>
          )}

          {scanError && (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
              <div style={{fontSize:48,marginBottom:16}}>😔</div>
              <div style={{color:"white",fontSize:15,fontWeight:500,marginBottom:8,textAlign:"center"}}>{scanError}</div>
              <button onClick={closeScanner}
                style={{marginTop:16,padding:"10px 24px",borderRadius:12,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500}}>
                Search Instead
              </button>
            </div>
          )}

          {scanResult && !scanLoading && (
            <div style={{flex:1,overflow:"auto",padding:"0 16px 16px"}}>
              <div style={{background:"white",borderRadius:16,padding:"20px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                  <div style={{
                    width:64,height:64,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    border:`4px solid ${scanResult.healthScore>=70?"#2E7D32":scanResult.healthScore>=45?"#F57F17":"#C62828"}`,
                    background:scanResult.healthScore>=70?"#E8F5E9":scanResult.healthScore>=45?"#FFF8E1":"#FFEBEE"
                  }}>
                    <span style={{fontSize:20,fontWeight:700,color:scanResult.healthScore>=70?"#2E7D32":scanResult.healthScore>=45?"#F57F17":"#C62828"}}>{scanResult.healthScore}</span>
                  </div>
                  <div>
                    <div style={{fontWeight:500,fontSize:16}}>{scanResult.name}</div>
                    <div style={{fontSize:13,color:"#666"}}>{scanResult.brand} · {scanResult.type} · {scanResult.stage}</div>
                    <div style={{fontSize:13,fontWeight:600,marginTop:4,color:scanResult.healthScore>=70?"#2E7D32":scanResult.healthScore>=45?"#F57F17":"#C62828"}}>
                      {scanResult.healthLabel} Quality
                    </div>
                  </div>
                </div>

                <div style={{fontSize:13,color:"#444",marginBottom:12,lineHeight:1.5}}>{scanResult.healthSummary}</div>

                {scanResult.positives?.length>0&&(
                  <div style={{marginBottom:8}}>
                    {scanResult.positives.map((p,i)=>(
                      <div key={i} style={{fontSize:12,color:"#2E7D32",display:"flex",gap:6,marginBottom:3}}>
                        <span>✓</span><span>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {scanResult.concerns?.length>0&&(
                  <div style={{marginBottom:12}}>
                    {scanResult.concerns.map((c,i)=>(
                      <div key={i} style={{fontSize:12,color:"#C62828",display:"flex",gap:6,marginBottom:3}}>
                        <span>⚠</span><span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {scanResult.dietaryTags?.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
                    {scanResult.dietaryTags.map(tagId=>{
                      const tagDef=DIET_FILTERS.find(f=>f.id===tagId);
                      if(!tagDef) return null;
                      const isAllergen=tagId.startsWith("no_");
                      return <span key={tagId} style={{fontSize:11,padding:"3px 10px",borderRadius:10,background:isAllergen?"#FFEBEE":"#E8F5E9",color:isAllergen?"#C62828":"#2E7D32",fontWeight:500}}>{tagDef.icon} {tagDef.label}</span>;
                    })}
                  </div>
                )}

                {scanResult.cheaperOnline&&(
                  <div style={{padding:"10px 12px",background:"#E8F5E9",borderRadius:8,fontSize:12,color:"#2E7D32",marginBottom:12}}>
                    💰 <strong>Cheaper online!</strong> {scanResult.onlineNote}
                  </div>
                )}

                <div style={{display:"flex",gap:8}}>
                  <button onClick={useScanResult}
                    style={{flex:1,padding:"11px",borderRadius:10,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:14}}>
                    Compare Prices →
                  </button>
                  <button onClick={closeScanner}
                    style={{padding:"11px 16px",borderRadius:10,background:"transparent",color:"#666",border:"1px solid #ddd",cursor:"pointer",fontSize:14}}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Price Alert Modal ── */}
      {showAlertModal && alertProduct && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"white",borderRadius:16,padding:"24px 20px",maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:24,marginBottom:4}}>🔔</div>
            <div style={{fontWeight:500,fontSize:17,marginBottom:4}}>Set Price Alert</div>
            <div style={{fontSize:13,color:"#666",marginBottom:16}}>{alertProduct.name}</div>
            <div style={{fontSize:13,color:"#444",marginBottom:6}}>Alert me when the price drops below:</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:18,color:"#666"}}>$</span>
              <input
                type="number"
                value={alertTargetPrice}
                onChange={e => setAlertTargetPrice(e.target.value)}
                placeholder={`e.g. ${(getMin(alertProduct.prices) - 5).toFixed(2)}`}
                style={{flex:1,padding:"10px 12px",borderRadius:8,border:`1.5px solid ${accent}`,fontSize:16,outline:"none"}}
                autoFocus
              />
            </div>
            <div style={{fontSize:12,color:"#999",marginBottom:16}}>
              Current lowest price: <strong style={{color:accent}}>${getMin(alertProduct.prices).toFixed(2)}</strong> at {[...alertProduct.prices].sort((a,b)=>a.price-b.price)[0].store}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={closeAlertModal}
                style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid #ddd",background:"transparent",color:"#666",cursor:"pointer",fontSize:14}}>
                Cancel
              </button>
              <button onClick={saveAlert}
                style={{flex:2,padding:"10px",borderRadius:8,border:"none",background:accent,color:"white",cursor:"pointer",fontSize:14,fontWeight:500}}>
                {alertSaved ? "Saved! ✓" : "Set Alert"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
        <div style={{flexShrink:0}}>{pet==="dogs"?DOG_SVG:CAT_SVG}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:26,fontWeight:500,lineHeight:1}}>🐾 PawPrice</div>
          <div style={{fontSize:14,color:"#666",marginTop:4}}>AI-powered pet food price comparison</div>
        </div>
        {alerts.length > 0 && (
          <button onClick={()=>setTab("alerts")}
            style={{position:"relative",background:"transparent",border:"none",cursor:"pointer",fontSize:22,padding:4}}>
            🔔
            <span style={{position:"absolute",top:0,right:0,background:"#E24B4A",color:"white",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:500}}>
              {alerts.length}
            </span>
          </button>
        )}
      </div>

      <div style={{display:"flex",gap:4,marginBottom:20,background:"#f5f5f5",padding:4,borderRadius:24,flexWrap:"wrap"}}>
        {[["search","Search Prices"],["alerts",`🔔 Alerts${alerts.length>0?" ("+alerts.length+")":""}`],["mypets","My Pets"],["deals","Community Deals"],["leaderboard","Leaderboard"]].map(([t,l])=>(
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
                    placeholder={`Search any ${pet==="dogs"?"dog":"cat"} food…`}
                    style={{flex:1,padding:"11px 16px",borderRadius:12,border:`1.5px solid ${accent}`,fontSize:14,outline:"none"}}/>
                  <button onClick={openScanner}
                    title="Scan barcode"
                    style={{padding:"11px 14px",borderRadius:12,background:"white",color:accent,border:`1.5px solid ${accent}`,cursor:"pointer",fontSize:18,flexShrink:0}}>
                    📷
                  </button>
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
                          <span style={{color:accent,fontSize:16}}>🔍</span><span>{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Dietary Filters */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <button onClick={()=>setShowFilters(f=>!f)}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,
                      border:`1.5px solid ${activeFilters.length>0?accent:"#ddd"}`,
                      background:activeFilters.length>0?accentLight:"white",
                      color:activeFilters.length>0?accent:"#666",cursor:"pointer",fontSize:13,fontWeight:500}}>
                    <span>🔬</span><span>Dietary Filters</span>
                    {activeFilters.length>0&&<span style={{background:accent,color:"white",borderRadius:10,padding:"1px 7px",fontSize:11}}>{activeFilters.length}</span>}
                    <span style={{fontSize:11}}>{showFilters?"▲":"▼"}</span>
                  </button>
                  {activeFilters.length>0&&(
                    <button onClick={clearFilters}
                      style={{padding:"6px 12px",borderRadius:20,border:"1px solid #ddd",background:"transparent",color:"#999",cursor:"pointer",fontSize:12}}>
                      Clear all
                    </button>
                  )}
                  {activeFilters.map(id=>{
                    const f=DIET_FILTERS.find(f=>f.id===id);
                    return f?(
                      <span key={id} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:16,background:accentLight,color:accent,fontSize:12,fontWeight:500}}>
                        {f.icon} {f.label}
                        <span onClick={()=>toggleFilter(id)} style={{cursor:"pointer",marginLeft:2,opacity:0.7}}>✕</span>
                      </span>
                    ):null;
                  })}
                </div>
                {showFilters && (
                  <div style={{background:"white",border:`1px solid ${accent}33`,borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                    <div style={{fontSize:12,color:"#666",marginBottom:10,fontWeight:500}}>Select dietary needs — AI will filter results automatically</div>
                    <div style={{fontSize:11,color:"#999",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Health & Lifestyle</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                      {DIET_FILTERS.slice(0,9).map(f=>(
                        <button key={f.id} onClick={()=>toggleFilter(f.id)} title={f.desc}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:18,
                            border:`1.5px solid ${activeFilters.includes(f.id)?accent:"#e0e0e0"}`,
                            background:activeFilters.includes(f.id)?accentLight:"#fafafa",
                            color:activeFilters.includes(f.id)?accent:"#555",
                            cursor:"pointer",fontSize:12,fontWeight:activeFilters.includes(f.id)?600:400,transition:"all 0.15s"}}>
                          <span>{f.icon}</span><span>{f.label}</span>
                          {activeFilters.includes(f.id)&&<span style={{fontSize:10}}>✓</span>}
                        </button>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:"#999",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Allergen Exclusions</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {DIET_FILTERS.slice(9).map(f=>(
                        <button key={f.id} onClick={()=>toggleFilter(f.id)} title={f.desc}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:18,
                            border:`1.5px solid ${activeFilters.includes(f.id)?"#E24B4A":"#e0e0e0"}`,
                            background:activeFilters.includes(f.id)?"#FFEBEE":"#fafafa",
                            color:activeFilters.includes(f.id)?"#C62828":"#555",
                            cursor:"pointer",fontSize:12,fontWeight:activeFilters.includes(f.id)?600:400,transition:"all 0.15s"}}>
                          <span>{f.icon}</span><span>{f.label}</span>
                          {activeFilters.includes(f.id)&&<span style={{fontSize:10}}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,fontSize:12,color:"#666",flexWrap:"wrap"}}>
                <span style={{background:accentLight,color:accent,padding:"3px 10px",borderRadius:10,fontWeight:500}}>✨ AI-powered</span>
                <span>Real brands, estimated prices across 8 major retailers</span>
              </div>

              {/* ── Browse by Diet Banner ── */}
              {activeFilters.length > 0 && !search.trim() && (
                <div style={{marginBottom:16,padding:"14px 16px",background:accentLight,border:`1.5px solid ${accent}44`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:accent,marginBottom:2}}>Browse by dietary need</div>
                    <div style={{fontSize:12,color:"#666"}}>Find {pet} food matching your filters — no brand name needed</div>
                  </div>
                  <button onClick={browseByDiet} disabled={loading}
                    style={{flexShrink:0,padding:"9px 18px",borderRadius:10,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:13,opacity:loading?0.7:1,whiteSpace:"nowrap"}}>
                    {loading?"…":"Find Food →"}
                  </button>
                </div>
              )}

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
                  <div style={{fontSize:13}}>Type a brand above, or tap <strong>Dietary Filters</strong> and use <strong>Find Food →</strong> to browse without knowing a brand</div>
                </div>
              )}

              {results && results.length===0 && (
                <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
                  <div style={{fontSize:40,marginBottom:8}}>🔎</div>
                  <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>No matching products found</div>
                  <div style={{fontSize:13}}>{activeFilters.length>0?"Try removing some dietary filters or broadening your search.":  `Try a different search — make sure the brand makes food for ${pet==="dogs"?"dogs":"cats"}!`}</div>
                </div>
              )}

              {/* ── Triggered Alert Banners ── */}
              {visibleTriggered.length > 0 && (
                <div style={{marginBottom:16}}>
                  {visibleTriggered.map(({alert, prod, minPrice, bestStore}) => (
                    <div key={alert.id} style={{background:"#E8F5E9",border:"1.5px solid #81C784",borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:16}}>🔔</span>
                          <span style={{fontWeight:500,fontSize:13,color:"#2E7D32"}}>Price Alert Hit!</span>
                        </div>
                        <div style={{fontSize:12,color:"#444"}}>{prod.name}</div>
                        <div style={{fontSize:12,color:"#2E7D32",fontWeight:500}}>${minPrice.toFixed(2)} at {bestStore.store} — under your ${alert.targetPrice.toFixed(2)} target!</div>
                      </div>
                      <button onClick={()=>dismissTriggeredAlert(alert.id)}
                        style={{background:"transparent",border:"none",color:"#999",cursor:"pointer",fontSize:18,padding:4}}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {results && results.length > 0 && (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:"#666",fontWeight:500}}>Sort by:</span>
                    {[{val:"default",label:"Relevance",icon:"✦"},{val:"price",label:"Lowest Price",icon:"💰"},{val:"health",label:"Healthiest First",icon:"🥦"}].map(({val,label,icon})=>(
                      <button key={val} onClick={()=>setSortResults(val)}
                        style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:20,
                          border:`1.5px solid ${sortResults===val?accent:"#ddd"}`,
                          background:sortResults===val?accentLight:"white",
                          color:sortResults===val?accent:"#666",cursor:"pointer",fontSize:12,
                          fontWeight:sortResults===val?600:400,transition:"all 0.18s",
                          boxShadow:sortResults===val?`0 2px 8px ${accent}33`:"none"}}>
                        <span>{icon}</span><span>{label}</span>
                        {sortResults===val&&<span style={{fontSize:10}}>▼</span>}
                      </button>
                    ))}
                  </div>

                  {activeFilters.length>0&&(
                    <div style={{marginBottom:12,padding:"8px 14px",background:"#E8F5E9",borderRadius:8,fontSize:12,color:"#2E7D32",display:"flex",alignItems:"center",gap:6}}>
                      <span>✅</span>
                      <span>Results filtered for: {activeFilters.map(id=>DIET_FILTERS.find(f=>f.id===id)?.label).join(", ")}</span>
                    </div>
                  )}

                  {getSortedResults().map((prod,i)=>{
                    const minP=getMin(prod.prices), maxP=getMax(prod.prices);
                    const hs=getHealthScore(prod);
                    const healthBadge=hs>=4?{label:"Top Pick 🥦",bg:"#E8F5E9",color:"#2E7D32"}:hs>=1?{label:"Good Choice",bg:"#F1F8E9",color:"#558B2F"}:hs<0?{label:"Check Ingredients",bg:"#FFEBEE",color:"#C62828"}:null;
                    const alreadyAlerted = hasAlert(prod.name);
                    const trend = getPriceTrend(prod);
                    return (
                      <div key={i} style={{background:"white",border:`1px solid ${trend&&trend.icon==="🟢"?"#81C784":"#eee"}`,borderRadius:12,padding:"14px 16px",marginBottom:10,transition:"box-shadow 0.2s,border-color 0.2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.09)";}}
                        onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",cursor:"pointer"}} onClick={()=>setSelectedProduct(prod)}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:500,fontSize:15,marginBottom:2}}>{prod.name}</div>
                            <div style={{fontSize:12,color:"#666",marginBottom:6}}>{prod.brand} · {prod.type} · {prod.size} · {prod.stage}</div>
                            {prod.dietaryTags&&prod.dietaryTags.length>0&&(
                              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                                {prod.dietaryTags.slice(0,4).map(tagId=>{
                                  const tagDef=DIET_FILTERS.find(f=>f.id===tagId);
                                  if(!tagDef) return null;
                                  const isAllergen=tagId.startsWith("no_");
                                  return <span key={tagId} style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:isAllergen?"#FFEBEE":"#E8F5E9",color:isAllergen?"#C62828":"#2E7D32"}}>{tagDef.icon} {tagDef.label}</span>;
                                })}
                                {prod.dietaryTags.length>4&&<span style={{fontSize:11,color:"#999"}}>+{prod.dietaryTags.length-4} more</span>}
                              </div>
                            )}
                            {sortResults==="health"&&healthBadge&&(
                              <span style={{fontSize:11,padding:"2px 9px",borderRadius:8,background:healthBadge.bg,color:healthBadge.color,fontWeight:500}}>{healthBadge.label}</span>
                            )}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                            <div style={{fontSize:18,fontWeight:500,color:accent}}>${minP.toFixed(2)}</div>
                            <div style={{fontSize:11,color:"#999"}}>Save up to ${(maxP-minP).toFixed(2)}</div>
                            <div style={{fontSize:11,color:accent,marginTop:2}}>Compare →</div>
                          </div>
                        </div>
                        {trend && (
                          <div style={{margin:"8px 0 4px",padding:"7px 12px",background:trend.bg,borderRadius:8,display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:13}}>{trend.icon}</span>
                            <div>
                              <span style={{fontSize:12,fontWeight:600,color:trend.color}}>{trend.label}</span>
                              <span style={{fontSize:11,color:"#666",marginLeft:6}}>{trend.detail}</span>
                            </div>
                          </div>
                        )}
                        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #f5f5f5",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <button onClick={()=>openAlertModal(prod)}
                            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:16,
                              border:`1px solid ${alreadyAlerted?"#639922":"#ddd"}`,
                              background:alreadyAlerted?"#EAF3DE":"transparent",
                              color:alreadyAlerted?"#3B6D11":"#888",cursor:"pointer",fontSize:12}}>
                            {alreadyAlerted?"🔔 Alert set":"🔔 Set price alert"}
                          </button>
                          {sortResults==="price"&&i===0&&(
                            <div style={{fontSize:11,padding:"3px 10px",background:accentLight,color:accent,borderRadius:8,fontWeight:600}}>💰 Lowest price</div>
                          )}
                        </div>
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
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
                  <div style={{fontWeight:500,fontSize:17,flex:1}}>{selectedProduct.name}</div>
                  <button onClick={()=>openAlertModal(selectedProduct)}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:16,
                      border:`1px solid ${hasAlert(selectedProduct.name)?"#639922":accent}`,
                      background:hasAlert(selectedProduct.name)?"#EAF3DE":accentLight,
                      color:hasAlert(selectedProduct.name)?"#3B6D11":accent,
                      cursor:"pointer",fontSize:12,fontWeight:500,flexShrink:0,marginLeft:10}}>
                    🔔 {hasAlert(selectedProduct.name)?"Alert set":"Set alert"}
                  </button>
                </div>
                <div style={{fontSize:13,color:"#666",marginBottom:8}}>{selectedProduct.brand} · {selectedProduct.type} · {selectedProduct.size} · {selectedProduct.stage}</div>
                {selectedProduct.dietaryTags&&selectedProduct.dietaryTags.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:14}}>
                    {selectedProduct.dietaryTags.map(tagId=>{
                      const tagDef=DIET_FILTERS.find(f=>f.id===tagId);
                      if(!tagDef) return null;
                      const isAllergen=tagId.startsWith("no_");
                      return <span key={tagId} style={{fontSize:11,padding:"3px 10px",borderRadius:10,background:isAllergen?"#FFEBEE":"#E8F5E9",color:isAllergen?"#C62828":"#2E7D32",fontWeight:500}}>{tagDef.icon} {tagDef.label}</span>;
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
                        Buy →
                      </a>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:14,padding:"10px 14px",background:accentLight,borderRadius:8,fontSize:13,color:"#666"}}>
                  💡 You could save up to <strong style={{color:accent}}>${(getMax(selectedProduct.prices)-getMin(selectedProduct.prices)).toFixed(2)}</strong> by choosing the best deal.
                </div>
                {getPriceTrend(selectedProduct) && (() => { const t = getPriceTrend(selectedProduct); return (
                  <div style={{marginTop:8,padding:"10px 14px",background:t.bg,borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{t.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:t.color}}>{t.label}</div>
                      <div style={{fontSize:12,color:"#666"}}>{t.detail}</div>
                    </div>
                  </div>
                ); })()}
                <div style={{marginTop:8,padding:"8px 12px",background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:8,fontSize:11,color:"#7a5800"}}>
                  ⚠️ Prices shown are AI-generated estimates. Always verify on the retailer's site before purchasing.
                </div>
              </div>
              <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontWeight:500,fontSize:16,marginBottom:12}}>🧪 Ingredients</div>
                {ingLoading&&<div style={{textAlign:"center",padding:"20px 0",color:"#999",fontSize:14}}>Looking up ingredients…</div>}
                {!ingLoading&&ingText==="unavailable"&&(
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={{fontSize:28,marginBottom:8}}>😔</div>
                    <div style={{fontSize:14,fontWeight:500,color:"#666"}}>Ingredients not available for this product.</div>
                    <div style={{fontSize:12,marginTop:6,color:"#aaa"}}>Check the manufacturer's website for full details.</div>
                  </div>
                )}
                {!ingLoading&&ingredientList.length>0&&(
                  <>
                    {ingDisclaimer&&<div style={{padding:"8px 12px",background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:8,fontSize:12,color:"#7a5800",marginBottom:14}}>⚠️ Ingredients sourced from AI — verify on the manufacturer's website.</div>}
                    <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:scoreBg,borderRadius:10,marginBottom:16,border:`1px solid ${scoreColor}44`}}>
                      <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${scoreColor}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:15,fontWeight:700,color:scoreColor}}>{score}</span>
                      </div>
                      <div>
                        <div style={{fontWeight:600,color:scoreColor,fontSize:15}}>{scoreLabel} Quality</div>
                        <div style={{fontSize:12,color:"#666",marginTop:2}}>
                          {good.length>0&&`✓ Contains ${good.slice(0,2).join(", ")}. `}
                          {bad.length>0&&`⚠ Watch: ${bad.slice(0,2).join(", ")}.`}
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
                    <div style={{lineHeight:1.9}}>{ingredientList.map((ing,i)=><IngredientBadge key={i} word={ing} index={i}/>)}</div>
                    {sourceLabel&&<div style={{fontSize:11,color:"#bbb",marginTop:12}}>Source: {sourceLabel}</div>}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Alerts Tab ── */}
      {tab==="alerts" && (
        <div>
          <div style={{fontWeight:500,fontSize:16,marginBottom:4}}>🔔 Price Alerts</div>
          <div style={{fontSize:13,color:"#666",marginBottom:16}}>Search for a product and tap "Set price alert" to get notified when it drops below your target price.</div>
          {alerts.length===0 ? (
            <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
              <div style={{fontSize:40,marginBottom:8}}>🔔</div>
              <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>No alerts set yet</div>
              <div style={{fontSize:13,marginBottom:16}}>Search for a product and tap "Set price alert"</div>
              <button onClick={()=>setTab("search")}
                style={{padding:"10px 24px",borderRadius:12,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:14}}>
                Search Products
              </button>
            </div>
          ) : (
            <>
              {visibleTriggered.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:"#2E7D32",fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>🎉 Alerts Triggered</div>
                  {visibleTriggered.map(({alert,prod,minPrice,bestStore})=>(
                    <div key={alert.id} style={{background:"#E8F5E9",border:"1.5px solid #81C784",borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontWeight:500,fontSize:14,marginBottom:2}}>{prod.name}</div>
                          <div style={{fontSize:13,color:"#2E7D32",fontWeight:500}}>Now ${minPrice.toFixed(2)} at {bestStore.store}</div>
                          <div style={{fontSize:12,color:"#666",marginTop:2}}>Your target: under ${alert.targetPrice.toFixed(2)}</div>
                        </div>
                        <a href={getStoreLink(bestStore.store,prod.name)} target="_blank" rel="noopener noreferrer"
                          style={{padding:"8px 14px",borderRadius:8,background:"#2E7D32",color:"white",textDecoration:"none",fontSize:12,fontWeight:500,flexShrink:0}}>
                          Buy Now →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{fontSize:12,color:"#999",fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Active Alerts</div>
              {alerts.map(alert=>(
                <div key={alert.id} style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:500,fontSize:14,marginBottom:2}}>{alert.productName}</div>
                    <div style={{fontSize:12,color:"#666"}}>{alert.brand} · {alert.pet==="dogs"?"🐶":"🐱"}</div>
                    <div style={{fontSize:13,color:accent,fontWeight:500,marginTop:4}}>Alert below ${alert.targetPrice.toFixed(2)}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                    <button onClick={()=>deleteAlert(alert.id)}
                      style={{padding:"5px 12px",borderRadius:8,background:"transparent",color:"#999",border:"1px solid #ddd",cursor:"pointer",fontSize:12}}>
                      Remove
                    </button>
                    <button onClick={()=>{setSearch(alert.productName);setPet(alert.pet);setTab("search");searchProducts();}}
                      style={{padding:"5px 12px",borderRadius:8,background:accentLight,color:accent,border:`1px solid ${accent}44`,cursor:"pointer",fontSize:12,fontWeight:500}}>
                      Check now →
                    </button>
                  </div>
                </div>
              ))}
            </>
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
              <div>
                <div style={{fontSize:13,color:"#666",marginBottom:6,fontWeight:500}}>🔬 Dietary needs (optional)</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {DIET_FILTERS.map(f=>(
                    <button key={f.id} onClick={()=>togglePetDiet(f.id)} title={f.desc}
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
              {p.dietaryNeeds&&p.dietaryNeeds.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                  {p.dietaryNeeds.map(id=>{
                    const f=DIET_FILTERS.find(f=>f.id===id);
                    return f?(<span key={id} style={{fontSize:11,padding:"2px 8px",borderRadius:8,background:id.startsWith("no_")?"#FFEBEE":"#E8F5E9",color:id.startsWith("no_")?"#C62828":"#2E7D32"}}>{f.icon} {f.label}</span>):null;
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
