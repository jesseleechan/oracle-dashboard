"use client";

import { useState, useEffect, useRef } from "react";

const CardBack = () => (
  <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <rect width="120" height="200" rx="8" fill="#0e0e1a" stroke="#c9a96e" strokeWidth="1.2" />
    <rect x="8" y="8" width="104" height="184" rx="5" fill="none" stroke="#c9a96e" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.5" />
    <circle cx="60" cy="100" r="32" fill="none" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6" />
    <circle cx="60" cy="100" r="20" fill="none" stroke="#c9a96e" strokeWidth="0.4" opacity="0.4" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <line key={i}
        x1={60 + 20 * Math.cos((deg * Math.PI) / 180)}
        y1={100 + 20 * Math.sin((deg * Math.PI) / 180)}
        x2={60 + 32 * Math.cos((deg * Math.PI) / 180)}
        y2={100 + 32 * Math.sin((deg * Math.PI) / 180)}
        stroke="#c9a96e" strokeWidth="0.6" opacity="0.5"
      />
    ))}
    <text x="60" y="55" textAnchor="middle" fill="#c9a96e" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
    <text x="60" y="155" textAnchor="middle" fill="#c9a96e" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
  </svg>
);

const CardFace = ({ card }) => (
  <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <rect width="120" height="200" rx="8" fill="#13101f" stroke="#c9a96e" strokeWidth="1.2" />
    <rect x="6" y="6" width="108" height="188" rx="5" fill="none" stroke="#c9a96e" strokeWidth="0.5" opacity="0.4" />
    <text x="60" y="32" textAnchor="middle" fill="#c9a96e" fontSize="9" fontFamily="serif" opacity="0.7">{card.num}</text>
    <text x="60" y="115" textAnchor="middle" fill="#c9a96e" fontSize="28" fontFamily="serif">
      {card.num === "0" ? "☽" : card.num === "I" ? "☿" : card.num === "II" ? "☽" : card.num === "III" ? "♀" :
        card.num === "IV" ? "♂" : card.num === "V" ? "♃" : card.num === "VI" ? "♀" :
          card.num === "VII" ? "♂" : card.num === "VIII" ? "☀" : card.num === "IX" ? "☿" :
            card.num === "X" ? "♃" : card.num === "XI" ? "♎" : card.num === "XII" ? "♆" :
              card.num === "XIII" ? "♏" : card.num === "XIV" ? "♐" : card.num === "XV" ? "♑" :
                card.num === "XVI" ? "♂" : card.num === "XVII" ? "♒" : card.num === "XVIII" ? "☽" :
                  card.num === "XIX" ? "☀" : card.num === "XX" ? "♇" : "✦"}
    </text>
    <text x="60" y="148" textAnchor="middle" fill="#e8dfc8" fontSize="8.5" fontFamily="serif" fontWeight="500">{card.name}</text>
    <line x1="20" y1="155" x2="100" y2="155" stroke="#c9a96e" strokeWidth="0.5" opacity="0.5" />
    {card.keywords.split(" · ").map((kw, i) => (
      <text key={i} x="60" y={166 + i * 10} textAnchor="middle" fill="#c9a96e" fontSize="6.5" fontFamily="serif" opacity="0.7">{kw}</text>
    ))}
  </svg>
);

const SPREAD_LABELS = ["Current State", "Friction", "The Anchor"];

export default function MundaneDashboard() {
  const [spreadMode, setSpreadMode] = useState("daily");
  const [cards, setCards] = useState([]);
  const [numerology, setNumerology] = useState({ universalDay: "?" });
  
  const [anchored, setAnchored] = useState(false);
  const [scene, setScene] = useState("");
  const [transitData, setTransitData] = useState(null);
  const [transitLoading, setTransitLoading] = useState(true);
  const [satsMode, setSatsMode] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialAiFetched, setInitialAiFetched] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [log, setLog] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    fetchCards(3);
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const numRes = await fetch('/api/numerology');
      const numData = await numRes.json();
      setNumerology(numData);

      setTransitLoading(true);
      const astRes = await fetch('/api/astrology');
      const astData = await astRes.json();
      setTransitData(astData);
    } catch (e) {
      console.error(e);
    } finally {
      setTransitLoading(false);
    }
  }

  async function fetchCards(count) {
    try {
      const res = await fetch(`/api/tarot?count=${count}`);
      const data = await res.json();
      setCards(data);
      setAiOutput(null);
      setAnchored(false);
    } catch (err) {
      console.error(err);
    }
  }

  const visibleCards = spreadMode === "daily" ? (cards.length ? [cards[0]] : []) : cards;

  function flipCard(i) {
    setCards((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, flipped: !c.flipped } : c))
    );
  }

  function reshuffle() {
    fetchCards(spreadMode === 'daily' ? 1 : 3);
  }

  async function generateStudioInsight() {
    setAiLoading(true);
    setAiOutput(null);
    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarotCards: visibleCards.map(c => c.name),
          universalDay: numerology.universalDay,
          transit: transitData?.transit // Use optional chaining
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setAiOutput(data);
    } catch (e) {
      console.error(e);
      setAiOutput({ tags: ["#HighDemand", "#CosmicStatic"], insight: "The synthesis engine is currently meditating under high cosmic demand. Please cast again in a moment." });
    }
    setAiLoading(false);
  }

  // Auto-trigger synthesis on load when data is ready
  useEffect(() => {
    if (!initialAiFetched && !transitLoading && transitData?.transit && numerology.universalDay !== "?" && cards.length > 0) {
      // Don't generate if visible cards aren't fully resolved or flipped initially
      generateStudioInsight();
      setInitialAiFetched(true);
    }
  }, [transitLoading, transitData, numerology, cards, initialAiFetched, visibleCards]);

  async function handleAnchor() {
    if (!anchored && scene.trim()) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toLocaleDateString(),
            universalDay: numerology.universalDay,
            transitAspect: transitData?.transit?.aspect, // Use optional chaining
            tarotCards: visibleCards.map((c) => c.name).join(", "),
            scene: scene.trim()
          })
        });
        setAnchored(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setAnchored((v) => !v);
    }
  }

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
    }));
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const alpha = 0.2 + 0.5 * Math.abs(Math.sin(t * s.speed + s.a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${alpha})`;
        ctx.fill();
      });
      t += 1;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <>
      {satsMode && (
        <div 
          className="sats-overlay flex-center" 
          onClick={() => setSatsMode(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: '#000000', zIndex: 9999, cursor: 'pointer',
            padding: '2rem', boxSizing: 'border-box'
          }}
        >
          <div style={{
            color: '#ffffff',
            opacity: 0.8,
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(24px, 5vw, 42px)',
            lineHeight: 1.4,
            textAlign: 'center',
            maxWidth: '800px'
          }}>
            {scene || "No scene anchored."}
          </div>
        </div>
      )}

      <div className="dashboard">
        <canvas ref={canvasRef} className="starfield" />
      <div className="noise" />
      <div className="content">
        <header>
          <div className="logo">Mundane <span>State</span></div>
          <div className="header-meta">
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-value">Toronto, ON</span>
            </div>
            <div className="sep" />
            <div className="meta-item">
              <span className="meta-label">Local Time</span>
              <span className="meta-value">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        <section className="section">
          <div className="section-label">Cosmic Baseline</div>
          <div className="cosmic-grid">
            <div className="cosmic-col">
              <div className="transit-label">Daily Transit</div>
              <div className="transit-aspect">{transitLoading ? "Loading..." : transitData?.transit?.aspect || "N/A"}</div>
              <div className="transit-synthesis">{transitLoading ? "Parsing cosmic frequencies..." : transitData?.transit?.synthesis || "N/A"}</div>
            </div>
            <div className="cosmic-divider" />
            <div className="cosmic-col">
              <div className="transit-label">Numerology</div>
              <div className="num-day">{numerology.universalDay}</div>
              <div className="num-directive">A day for manifestation and action.</div>
              <div className="num-sub">Universal day {numerology.universalDay} carries resonant frequencies for focused intention.</div>
            </div>
          </div>
          <div className="energy-ratings-container" style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', minHeight: '380px' }}>
            <div className="section-label" style={{ fontSize: '14px', marginBottom: '12px' }}>Current Energetic Weather</div>
            
            {aiLoading || !aiOutput?.energyRatings ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem 0', opacity: 0.5, fontSize: '14px', fontFamily: 'serif' }}>
                 ✦ Synthesizing energetic weather...
              </div>
            ) : (
              aiOutput.energyRatings && Array.isArray(aiOutput.energyRatings) && aiOutput.energyRatings.map((rating, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '14px', color: 'rgba(255,255,255,0.8)'
                }}>
                  <span>{rating.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--gold)' }}>{rating.rating}</span>
                    <span style={{ opacity: 0.3, fontSize: '12px' }}>›</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-label">The Oracle</div>
          <div className="oracle-toggle">
            <button className={`toggle-btn ${spreadMode === 'daily' ? 'active' : ''}`} onClick={() => { setSpreadMode('daily'); fetchCards(1); }}>Daily Draw</button>
            <button className={`toggle-btn ${spreadMode === 'three' ? 'active' : ''}`} onClick={() => { setSpreadMode('three'); fetchCards(3); }}>Three Card</button>
          </div>

          <div className="card-stage">
            {visibleCards.map((card, i) => (
              <div key={i} className="card-slot">
                <div className="card-wrapper" onClick={() => flipCard(i)}>
                  <div className={`card-inner ${card.flipped ? 'flipped' : ''}`}>
                    <div className="card-back-side"><CardBack /></div>
                    <div className="card-face"><CardFace card={card} /></div>
                  </div>
                </div>
                {spreadMode === 'three' && <div className="card-slot-label">{SPREAD_LABELS[i]}</div>}
              </div>
            ))}
          </div>
          
          {visibleCards.length === 1 && visibleCards[0].flipped && (
             <div className="card-reveal">
               <div className="card-reveal-name">{visibleCards[0].name}</div>
               <div className="card-reveal-keys">{visibleCards[0].keywords}</div>
             </div>
          )}

          <button className="reshuffle-btn" onClick={reshuffle}>Reshuffle</button>
        </section>

        <section className="section">
          <div className="action-grid">
            <div className="studio-block">
              <div className="studio-header">
                <div className="section-label" style={{ marginBottom: 0, gap: '8px' }}>Studio Synthesis</div>
                <button className="generate-btn" onClick={generateStudioInsight} disabled={aiLoading || visibleCards.some(c => !c.flipped)}>
                  {aiLoading ? <div className="loading-pulse"><span/><span/><span/></div> : (aiOutput ? "Refresh Synthesis" : "Translate to Action")}
                </button>
              </div>
              {aiOutput && (
                <>
                  <div className="studio-tags">
                    {aiOutput.tags && Array.isArray(aiOutput.tags) ? aiOutput.tags.map(tag => <span key={tag} className="tag">{tag}</span>) : null}
                  </div>
                  <div className="studio-insight">{aiOutput.insight}</div>
                </>
              )}
            </div>

            <div className="goddard-block">
              <div className="goddard-prompt">Neville Goddard Protocol</div>
              <textarea 
                className="scene-textarea" 
                placeholder="Describe your desired reality as if you are already experiencing it..." 
                value={scene} 
                onChange={(e) => setScene(e.target.value)} 
                disabled={anchored}
              />
              <div className="anchor-row">
                <input 
                  type="checkbox" 
                  className="anchor-checkbox" 
                  checked={anchored} 
                  onChange={handleAnchor} 
                />
                <span className={`anchor-label ${anchored ? 'anchored' : ''}`} onClick={() => !anchored && handleAnchor()}>
                  {anchored ? "Scene Anchored in Database" : "Anchor Scene"}
                </span>
                
                <button 
                  className="toggle-btn" 
                  style={{ marginLeft: 'auto', fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => setSatsMode(true)}
                  disabled={!scene.trim()}
                >
                  Enter SATS Mode
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-nav">
            <button className="footer-link">Dashboard</button>
            <button className="footer-link">Log Archive</button>
            <button className="footer-link">Settings</button>
          </div>
          <div className="footer-status">DB Connected · AI Ready</div>
        </footer>
      </div>
    </div>
  </>
  );
}
