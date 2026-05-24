import { useState, useEffect } from "react";

const DOG_SVG = (
  <svg viewBox="0 0 120 120" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="72" rx="32" ry="28" fill="#EF9F27"/>
    <ellipse cx="60" cy="52" rx="26" ry="24" fill="#EF9F27"/>
    <ellipse cx="38" cy="34" rx="11" ry="16" fill="#BA7517" transform="rotate(-15 38 34)"/>
    <ellipse cx="82" cy="34" rx="11" ry="16" fill="#BA7517" transform="rotate(15 82 34)"/>
    <ellipse cx="38" cy="36" rx="7" ry="11" fill="#FAC775" transform="rotate(-15 38 36)"/>
    <ellipse cx="82" cy="36" rx="7" ry="11" fill="#FAC775" transform="rotate(15 82 36)"/>
    <circle cx="52" cy="50" r="5" fill="#2C2C2A"/>
    <circle cx="68" cy="50" r="5" fill="#2C2C2A"/>
    <circle cx="53" cy="49" r="2" fill="white"/>
    <circle cx="69" cy="49" r="2" fill="white"/>
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
    <circle cx="51" cy="49" r="1.5" fill="white"/>
    <circle cx="67" cy="49" r="1.5" fill="white"/>
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

const STORES = ["PetSmart","Petco","Walmart","Chewy","Amazon","Target"];
const BADGES = [
  { min:0, max:0, label:"Pup", icon:"🐶" },
  { min:1, max:4, label:"Bone Collector", icon:"🦴" },
  { min:5, max:14, label:"Pack Leader", icon:"🐾" },
  { min:15, max:999, label:"Top Sniffer", icon:"🥇" },
];
function getBadge(count) { return BADGES.find(b => count >= b.min && count <= b.max) || BADGES[0]; }

const INIT_DEALS = [
  { id:1, user:"PawHunterMike", pet:"dogs", store:"Walmart", product:"Purina Pro Plan 35lb", price:"$62.00", location:"Denver, CO", upvotes:14, ts: Date.now()-3600000 },
  { id:2, user:"CatLadyJess", pet:"cats", store:"Petco", product:"Blue Buffalo 12lb", price:"$27.50", location:"Austin, TX", upvotes:9, ts: Date.now()-7200000 },
  { id:3, user:"BudgetPawrent", pet:"dogs", store:"Target", product:"Hill's Science Diet 15lb", price:"$39.99", location:"Chicago, IL", upvotes:5, ts: Date.now()-86400000 },
];
const INIT_USERS = {
  PawHunterMike: { deals:3, upvotes:28 },
  CatLadyJess: { deals:2, upvotes:11 },
  BudgetPawrent: { deals:1, upvotes:5 },
};

export default function App() {
  const [tab, setTab] = useState("search");
  const [pet, setPet] = useState("dogs");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [deals, setDeals] = useState(INIT_DEALS);
  const [users, setUsers] = useState(INIT_USERS);
  const [upvoted, setUpvoted] = useState({});
  const [dealForm, setDealForm] = useState({ user:"", store:"", product:"", price:"", location:"", pet:"dogs" });
  const [dealSubmitted, setDealSubmitted] = useState(false);
  const [myUsername, setMyUsername] = useState("");
  const [sortDeals, setSortDeals] = useState("newest");

  // My Pets state
  const [myPets, setMyPets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pawprice_pets") || "[]"); } catch { return []; }
  });
  const [petForm, setPetForm] = useState({ name: "", type: "dogs", food: "" });
  const [petSaved, setPetSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("pawprice_pets", JSON.stringify(myPets));
  }, [myPets]);

  const accent = pet === "dogs" ? "#EF9F27" : "#7F77DD";
  const accentLight = pet === "dogs" ? "#FAEEDA" : "#EEEDFE";

  function addPet() {
    if (!petForm.name.trim() || !petForm.food.trim()) return;
    const newPet = { id: Date.now(), ...petForm };
    setMyPets(prev => [...prev, newPet]);
    setPetForm({ name: "", type: "dogs", food: "" });
    setPetSaved(true);
    setTimeout(() => setPetSaved(false), 2000);
  }

  function deletePet(id) {
    setMyPets(prev => prev.filter(p => p.id !== id));
  }

  function searchForPet(p) {
    setPet(p.type);
    setSearch(p.food);
    setTab("search");
    setResults(null);
    setSelectedProduct(null);
    setError("");
  }

  async function searchProducts() {
    if (!search.trim()) return;
    setLoading(true); setResults(null); setSelectedProduct(null); setError("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a pet food price comparison assistant. The user is searching for "${search}" for their ${pet}. Return a JSON array of up to 4 matching pet food products. Each product must have: name, brand, type (Dry/Wet/Treats), size, stage (Puppy/Kitten/Adult/Senior), and prices array with store and price for: ${STORES.join(", ")}. Make prices realistic and varied. Return ONLY valid JSON, no markdown, no explanation. Example: [{"name":"Blue Buffalo Life Protection Chicken","brand":"Blue Buffalo","type":"Dry","size":"30 lb","stage":"Adult","prices":[{"store":"PetSmart","price":62.99},{"store":"Petco","price":64.49},{"store":"Walmart","price":58.97},{"store":"Chewy","price":59.98},{"store":"Amazon","price":61.50},{"store":"Target","price":63.49}]}]`
          }]
        })
      });
      const data = await response.json();
      if (!data.content) throw new Error(JSON.stringify(data));
      const text = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
    } catch(e) {
      setError("Search failed: " + e.message);
    }
    setLoading(false);
  }

  function getMin(prices) { return Math.min(...prices.map(p=>p.price)); }
  function getMax(prices) { return Math.max(...prices.map(p=>p.price)); }

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
    padding:"8px 14px", borderRadius:"20px", border:"none", cursor:"pointer", fontWeight:500, fontSize:13,
    background: tab===t ? accent : "transparent",
    color: tab===t ? "white" : "#666", transition:"all 0.2s"
  });

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
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&searchProducts()}
                  placeholder={`Search any ${pet==="dogs"?"dog":"cat"} food…`}
                  style={{flex:1,padding:"11px 16px",borderRadius:12,border:`1.5px solid ${accent}`,fontSize:14,outline:"none"}}/>
                <button onClick={searchProducts} disabled={loading}
                  style={{padding:"11px 22px",borderRadius:12,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:14,opacity:loading?0.7:1}}>
                  {loading?"…":"Search"}
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,fontSize:12,color:"#666"}}>
                <span style={{background:accentLight,color:accent,padding:"3px 10px",borderRadius:10,fontWeight:500}}>✨ AI-powered</span>
                <span>Real brands, realistic prices across 6 major retailers</span>
              </div>
              {error && <div style={{color:"#E24B4A",fontSize:14,marginBottom:12}}>{error}</div>}
              {loading && (
                <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                  <div style={{fontSize:15,fontWeight:500,color:accent}}>Comparing prices…</div>
                </div>
              )}
              {!loading && !results && (
                <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
                  <div style={{fontSize:40,marginBottom:8}}>{pet==="dogs"?"🐶":"🐱"}</div>
                  <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Search any pet food</div>
                  <div style={{fontSize:13}}>Try "Blue Buffalo chicken adult", "Purina Pro Plan kitten"</div>
                </div>
              )}
              {results && results.map((prod,i)=>{
                const minP=getMin(prod.prices), maxP=getMax(prod.prices);
                return (
                  <div key={i} onClick={()=>setSelectedProduct(prod)}
                    style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:500,fontSize:15}}>{prod.name}</div>
                      <div style={{fontSize:12,color:"#666",marginTop:3}}>{prod.brand} · {prod.type} · {prod.size} · {prod.stage}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:18,fontWeight:500,color:accent}}>${minP.toFixed(2)}</div>
                      <div style={{fontSize:11,color:"#666"}}>Save up to ${(maxP-minP).toFixed(2)}</div>
                      <div style={{fontSize:11,color:accent,marginTop:2}}>Compare →</div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div>
              <button onClick={()=>setSelectedProduct(null)}
                style={{background:"transparent",border:"none",color:accent,cursor:"pointer",fontSize:14,fontWeight:500,marginBottom:14,padding:0}}>
                ← Back to results
              </button>
              <div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontWeight:500,fontSize:17,marginBottom:2}}>{selectedProduct.name}</div>
                <div style={{fontSize:13,color:"#666",marginBottom:16}}>{selectedProduct.brand} · {selectedProduct.type} · {selectedProduct.size} · {selectedProduct.stage}</div>
                {[...selectedProduct.prices].sort((a,b)=>a.price-b.price).map((p,i)=>(
                  <div key={p.store} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f0f0f0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {i===0&&<span style={{fontSize:11,background:accentLight,color:accent,borderRadius:6,padding:"2px 8px",fontWeight:500}}>Best deal</span>}
                      <span style={{fontWeight:i===0?500:400,fontSize:14}}>{p.store}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:16,fontWeight:500,color:i===0?accent:"#333"}}>${p.price.toFixed(2)}</span>
                      <a href="https://google.com" style={{fontSize:12,color:accent,textDecoration:"none",border:`1px solid ${accent}`,borderRadius:6,padding:"4px 10px"}}>View →</a>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:14,padding:"10px 14px",background:accentLight,borderRadius:8,fontSize:13,color:"#666"}}>
                  💡 You save <strong style={{color:accent}}>${(getMax(selectedProduct.prices)-getMin(selectedProduct.prices)).toFixed(2)}</strong> by choosing the best deal.
                </div>
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
              <button onClick={addPet}
                style={{padding:"9px 22px",borderRadius:8,background:accent,color:"white",border:"none",cursor:"pointer",fontWeight:500,fontSize:14,width:"fit-content"}}>
                {petSaved ? "Saved! ✓" : "Save Pet"}
              </button>
            </div>
          </div>

          {myPets.length === 0 ? (
            <div style={{textAlign:"center",padding:"3rem",color:"#666"}}>
              <div style={{fontSize:40,marginBottom:8}}>🐾</div>
              <div style={{fontSize:15,fontWeight:500}}>No pets saved yet</div>
              <div style={{fontSize:13,marginTop:4}}>Add your first pet above!</div>
            </div>
          ) : (
            myPets.map(p=>(
              <div key={p.id} style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
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
            ))
          )}
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
    </div>
  );
}
