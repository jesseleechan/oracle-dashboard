"use client";

import { useState, useEffect } from "react";
import { Briefcase, Sparkles, Coins, Lightbulb, Smile, MessageCircle, Activity, Heart, ChevronRight, Variable } from "lucide-react";
import Link from 'next/link';

import { useOracleData } from '@/hooks/useOracleData';
import StarfieldCanvas from '@/components/StarfieldCanvas';
import SatsOverlay from '@/components/SatsOverlay';
import TarotStage from '@/components/TarotStage';
import SynthesisEngine from '@/components/SynthesisEngine';

const ICON_MAP = {
  "Career Ambition": Briefcase,
  "Spiritual Attunement": Sparkles,
  "Financial Resources": Coins,
  "Mental Flow": Lightbulb,
  "Emotional State": Smile,
  "Social Connection": MessageCircle,
  "Physical Vitality": Activity,
  "Romantic Charge": Heart
};

export default function MundaneDashboard() {
  const { numerology, transitData, transitLoading, cards, setCards, fetchCards } = useOracleData();
  const [spreadMode, setSpreadMode] = useState("daily");
  
  const [anchored, setAnchored] = useState(false);
  const [scene, setScene] = useState("");
  const [satsMode, setSatsMode] = useState(false);
  const [flowState, setFlowState] = useState("Flow");
  const [aiOutput, setAiOutput] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialAiFetched, setInitialAiFetched] = useState(false);

  const visibleCards = spreadMode === "daily" ? (cards.length ? [cards[0]] : []) : cards;

  function flipCard(i) {
    setCards((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, flipped: !c.flipped } : c))
    );
  }

  async function handleFetchCards(count) {
    await fetchCards(count);
    setAiOutput(null);
    setAnchored(false);
  }

  function reshuffle() {
    handleFetchCards(spreadMode === 'daily' ? 1 : 3);
  }

  async function generateStudioInsight() {
    setAiLoading(true);
    setAiOutput(null);
    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarotCards: visibleCards.map(c => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`),
          universalDay: numerology.universalDay,
          transit: transitData?.transit // Use optional chaining
        })
      });

      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
      }
      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setAiOutput(data);
    } catch (e) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setAiOutput({ tags: ["#CosmicRest", "#DailyLimitReached"], insight: "The Oracle has reached its daily cosmic generation limit (Free Tier). Please return tomorrow when the ether clears, or click 'Generate' again to verify if the cooldown has lifted." });
      } else {
        setAiOutput({ tags: ["#HighDemand", "#CosmicStatic"], insight: "The synthesis engine is currently meditating under high cosmic demand. Please cast again in a moment." });
      }
    }
    setAiLoading(false);
  }

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
            tarotCards: visibleCards.map((c) => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`).join(", "),
            scene: scene.trim(),
            flowState: flowState
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

  // Starfield canvas logic has been extracted to StarfieldCanvas.jsx
  const getThemeStyle = () => {
    if (!transitData?.transit?.aspect) return {};
    const aspect = transitData.transit.aspect.toLowerCase();
    
    if (aspect.includes("mars")) return { "--bg": "#120505", "--surface": "#1a0808", "--rose": "#d66a6a", "--gold": "#c96e6e" };
    if (aspect.includes("neptune") || aspect.includes("moon")) return { "--bg": "#050812", "--surface": "#080d1a", "--gold": "#a9b9c9", "--rose": "#9a9ac4" };
    if (aspect.includes("venus") || aspect.includes("jupiter")) return { "--bg": "#0f0812", "--surface": "#140a1a", "--gold": "#c9a9c9" };
    if (aspect.includes("saturn") || aspect.includes("pluto")) return { "--bg": "#040404", "--surface": "#0a0a0a", "--text": "#bfbfbf", "--gold": "#8a8a8a" };
    return {};
  };

  return (
    <>
      <SatsOverlay satsMode={satsMode} setSatsMode={setSatsMode} scene={scene} />

      <div className="dashboard" style={getThemeStyle()}>
        <StarfieldCanvas transitData={transitData} />
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
              aiOutput.energyRatings && Array.isArray(aiOutput.energyRatings) && aiOutput.energyRatings.map((rating, idx) => {
                const IconComponent = ICON_MAP[rating.category] || Activity;
                const getRatingPercentage = (r) => {
                  if (r === "Strong") return "90%";
                  if (r === "Active") return "65%";
                  if (r === "Light") return "30%";
                  return "50%";
                };
                return (
                  <div key={idx} style={{ 
                    padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '14px', color: 'rgba(255,255,255,0.8)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <IconComponent size={16} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                        <span>{rating.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--gold)' }}>{rating.rating}</span>
                      </div>
                    </div>
                    <div className="energy-progress-bg">
                      <div className="energy-progress-fill" style={{ width: getRatingPercentage(rating.rating) }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <TarotStage 
          spreadMode={spreadMode} 
          setSpreadMode={setSpreadMode} 
          visibleCards={visibleCards} 
          fetchCards={handleFetchCards} 
          flipCard={flipCard} 
          reshuffle={reshuffle} 
        />

        <section className="section">
          <div className="action-grid">
            <SynthesisEngine 
              aiOutput={aiOutput} 
              aiLoading={aiLoading} 
              visibleCards={visibleCards} 
              generateStudioInsight={generateStudioInsight} 
            />

            <div className="goddard-block">
              <div className="goddard-prompt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Neville Goddard Protocol</span>
              </div>
              
              <textarea 
                className="scene-textarea" 
                placeholder="Describe your desired reality as if you are already experiencing it..." 
                value={scene} 
                onChange={(e) => setScene(e.target.value)} 
                disabled={anchored}
                style={{ minHeight: '120px' }}
              />

              <div className="flow-tracker" style={{ 
                margin: '8px 0 16px', display: 'flex', background: 'rgba(255,255,255,0.02)', 
                borderRadius: '6px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' 
              }}>
                {["High Friction", "Neutral", "Pure Flow"].map((level) => (
                  <button
                    key={level}
                    disabled={anchored}
                    onClick={() => setFlowState(level)}
                    style={{
                      flex: 1, padding: '8px 0', fontSize: '12px', fontFamily: 'monospace',
                      background: flowState === level ? 'rgba(201,169,110,0.1)' : 'transparent',
                      color: flowState === level ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                      border: 'none', borderRadius: '4px', cursor: anchored ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', 
                      pointerEvents: anchored ? 'none' : 'auto'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>

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
            <button className="footer-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Dashboard</button>
            <Link href="/archive" className="footer-link" style={{ textDecoration: 'none' }}>Log Archive</Link>
          </div>
          <div className="footer-status">DB Connected · AI Ready</div>
        </footer>
      </div>
    </div>
  </>
  );
}
