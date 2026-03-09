"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Briefcase, Sparkles, Coins, Lightbulb, Smile, MessageCircle, Activity, Heart, ChevronRight, Variable, RefreshCw, Download } from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useOracleData } from '@/hooks/useOracleData';
import StarfieldCanvas from '@/components/cosmic/ReactiveStarfield';
import { StarfieldProvider } from '@/components/cosmic/StarfieldContext';
import SatsOverlay from '@/components/sats/SatsOverlay';
import TarotStage from '@/components/tarot/TarotStage';
import SynthesisEngine from '@/components/tarot/SynthesisEngine';
import NavOrbs from '@/components/cosmic/NavOrbs';
import PlanetaryHours from '@/components/cosmic/PlanetaryHours';
import NumerologyOracle from '@/components/cosmic/NumerologyOracle';
import HermeticPrinciple from '@/components/cosmic/HermeticPrinciple';
import AssumptionTracker from '@/components/cosmic/AssumptionTracker';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';
import { getPersonalNumerology } from '@/lib/personalNumerology';
import { getPlanetaryHours } from '@/lib/planetaryHours';

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
  const router = useRouter();
  const { numerology, transitData, transitLoading, cards, setCards, fetchCards } = useOracleData();
  const [spreadMode, setSpreadMode] = useState("daily");
  
  const [anchored, setAnchored] = useState(false);
  const [baselineExpanded, setBaselineExpanded] = useState(false);
  const [scene, setScene] = useState("");
  const [satsMode, setSatsMode] = useState(false);
  const [flowState, setFlowState] = useState("Flow");
  const [aiOutput, setAiOutput] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialAiFetched, setInitialAiFetched] = useState(false);
  const [reflection, setReflection] = useState("");
  const [isRedrawing, setIsRedrawing] = useState(false);
  const contentRef = useRef(null);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#080810',
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`mundane-state-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
    }
  };

  const visibleCards = useMemo(
    () => spreadMode === "daily" ? (cards.length ? [cards[0]] : []) : cards,
    [spreadMode, cards]
  );

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
    setIsRedrawing(true);
    setTimeout(() => {
      handleFetchCards(spreadMode === 'daily' ? 1 : 3);
      setIsRedrawing(false);
    }, 600);
  }

  async function generateStudioInsight() {
    setAiLoading(true);
    setAiOutput(null);
    try {
      const geminiSuffix = localStorage.getItem('geminiSuffix') || '';
      const customApiKey = localStorage.getItem('customApiKey') || '';

      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tarotCards: visibleCards.map(c => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`),
          universalDay: numerology.universalDay,
          transit: transitData?.transit,
          geminiSuffix,
          customApiKey,
          planetaryHour: (() => { try { const ph = getPlanetaryHours(); return ph?.hours[ph?.currentIdx]?.planet || null; } catch { return null; } })(),
          personalYear: (() => { try { const bm = parseInt(localStorage.getItem('birthMonth')); const bd = parseInt(localStorage.getItem('birthDay')); if (bm && bd) { const n = getPersonalNumerology(bm, bd); return n?.personalYear; } return null; } catch { return null; } })(),
          personalMonth: (() => { try { const bm = parseInt(localStorage.getItem('birthMonth')); const bd = parseInt(localStorage.getItem('birthDay')); if (bm && bd) { const n = getPersonalNumerology(bm, bd); return n?.personalMonth; } return null; } catch { return null; } })(),
          personalDay: (() => { try { const bm = parseInt(localStorage.getItem('birthMonth')); const bd = parseInt(localStorage.getItem('birthDay')); if (bm && bd) { const n = getPersonalNumerology(bm, bd); return n?.personalDay; } return null; } catch { return null; } })(),
          hermeticPrinciple: (() => { try { return getDailyPrinciple()?.name || null; } catch { return null; } })(),
          assumptionText: (() => { try { const c = JSON.parse(localStorage.getItem('assumptionToday') || '{}'); return c.date === new Date().toDateString() ? c.text : null; } catch { return null; } })(),
          feelingRating: (() => { try { const c = JSON.parse(localStorage.getItem('assumptionToday') || '{}'); return c.date === new Date().toDateString() ? c.rating : null; } catch { return null; } })()
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
            transitAspect: transitData?.transit?.aspect,
            tarotCards: visibleCards.map((c) => `${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`).join(", "),
            scene: scene.trim(),
            flowState: flowState,
            reflection: reflection
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

  // Keyboard Shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
       if (e.key === 'd' || e.key === 'D') { e.preventDefault(); handleFetchCards(1); }
       if (e.key === 't' || e.key === 'T') { e.preventDefault(); generateStudioInsight(); }
       if (e.key === 's' || e.key === 'S') { e.preventDefault(); setSatsMode(true); }
       if (e.key === 'a' || e.key === 'A') { e.preventDefault(); router.push('/archive'); }
    }
  }, [handleFetchCards, generateStudioInsight, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Starfield canvas logic has been extracted to ReactiveStarfield.jsx
  const themeStyle = useMemo(() => {
    if (!transitData?.transit?.aspect) return {};
    const aspect = transitData.transit.aspect.toLowerCase();
    
    if (aspect.includes("mars")) return { "--bg": "#120505", "--surface": "#1a0808", "--rose": "#d66a6a", "--gold": "#c96e6e" };
    if (aspect.includes("neptune") || aspect.includes("moon")) return { "--bg": "#050812", "--surface": "#080d1a", "--gold": "#a9b9c9", "--rose": "#9a9ac4" };
    if (aspect.includes("venus") || aspect.includes("jupiter")) return { "--bg": "#0f0812", "--surface": "#140a1a", "--gold": "#c9a9c9" };
    if (aspect.includes("saturn") || aspect.includes("pluto")) return { "--bg": "#040404", "--surface": "#0a0a0a", "--text": "#bfbfbf", "--gold": "#8a8a8a" };
    return {};
  }, [transitData?.transit?.aspect]);

  return (
    <>
      <SatsOverlay satsMode={satsMode} setSatsMode={setSatsMode} scene={scene} flowState={flowState} />
      <NavOrbs synthesisReady={!!aiOutput} />

      <StarfieldProvider transitData={transitData} flowState={flowState}>
      <div className="dashboard" style={themeStyle}>
        <StarfieldCanvas />
      <div className="noise" />
      <div className="content" ref={contentRef}>
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
            <div className="sep" />
            <button 
              onClick={handleExportPDF} 
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s', padding: '4px' }}
              title="Export Daily Dashboard to PDF"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
            >
              <Download size={14} />
            </button>
          </div>
        </header>

        <section className="section">
          <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }} onClick={() => setBaselineExpanded(!baselineExpanded)}>
            <span>Cosmic Baseline</span>
            <span style={{ fontSize: '10px', opacity: 0.5 }}>{baselineExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          </div>
          
          <div className="baseline-block" style={{
            background: 'var(--surface2)', borderRadius: '4px', border: '1px solid var(--border)',
            padding: baselineExpanded ? '24px' : '12px 24px', transition: 'all 0.3s ease', cursor: baselineExpanded ? 'default' : 'pointer'
          }} onClick={() => !baselineExpanded && setBaselineExpanded(true)}>
            
            {!baselineExpanded ? (
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8, fontSize: '12px', fontFamily: 'monospace' }}>
                 <span><Sparkles size={12} style={{display:'inline', marginRight:'8px', verticalAlign:'-2px'}}/> {transitData?.transit?.aspect || "Loading..."}</span>
                 <span><Variable size={12} style={{display:'inline', marginRight:'8px', verticalAlign:'-2px'}}/> Universal Day {numerology.universalDay}</span>
               </div>
            ) : (
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
            )}
            
          </div>

          <PlanetaryHours onStartSats={(sceneText) => { setScene(sceneText); setSatsMode(true); }} />

          <NumerologyOracle 
            onStartSats={(sceneText) => { setScene(sceneText); setSatsMode(true); }}
            currentPlanetaryHour={null}
            currentTarotCard={visibleCards[0]?.flipped ? visibleCards[0]?.name : null}
          />

          <HermeticPrinciple 
            onStartSats={(sceneText) => { setScene(sceneText); setSatsMode(true); }}
            transitColor={null}
          />

          <AssumptionTracker 
            onStartSats={(sceneText) => { setScene(sceneText); setSatsMode(true); }}
            todayLogId={null}
          />

          <div className="energy-ratings-container" style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', minHeight: '380px' }}>
            <div className="section-label" style={{ fontSize: '14px', marginBottom: '12px' }}>Current Energetic Weather</div>
            
            {aiLoading || !aiOutput?.energyRatings ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem 0', opacity: 0.5, fontSize: '14px', fontFamily: 'serif' }}>
                 ✦ Synthesizing energetic weather...
              </div>
            ) : (
              <div className="energy-grid">
                {aiOutput.energyRatings && Array.isArray(aiOutput.energyRatings) && aiOutput.energyRatings.map((rating, idx) => {
                  const IconComponent = ICON_MAP[rating.category] || Activity;
                  const getRatingPercentage = (r) => {
                    if (r === "Strong") return "90%";
                    if (r === "Active") return "65%";
                    if (r === "Light") return "30%";
                    return "50%";
                  };
                  return (
                    <div key={idx} style={{ 
                      padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.01)', fontSize: '14px', color: 'rgba(255,255,255,0.8)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconComponent size={14} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                          <span>{rating.category}</span>
                        </div>
                        <span style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 500 }}>{rating.rating}</span>
                      </div>
                      <div className="energy-progress-bg" style={{height: '2px'}}>
                        <div className="energy-progress-fill" style={{ width: getRatingPercentage(rating.rating), height: '100%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
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
          isRedrawing={isRedrawing}
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
                {[
                  { id: "High Friction", icon: "🌪️" },
                  { id: "Neutral", icon: "⚖️" },
                  { id: "Pure Flow", icon: "🌊" }
                ].map((level) => (
                  <button
                    key={level.id}
                    disabled={anchored}
                    onClick={() => setFlowState(level.id)}
                    style={{
                      flex: 1, padding: '8px 0', fontSize: '12px', fontFamily: 'monospace',
                      background: flowState === level.id ? 'rgba(201,169,110,0.1)' : 'transparent',
                      color: flowState === level.id ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
                      border: 'none', borderRadius: '4px', cursor: anchored ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', 
                      pointerEvents: anchored ? 'none' : 'auto',
                      position: 'relative', overflow: 'hidden'
                    }}
                  >
                    {flowState === level.id && <span className="starburst" />}
                  </button>
                ))}
              </div>

              <div className="goddard-prompt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span>Tarot Journal (Optional)</span>
              </div>
              
              <textarea 
                className="scene-textarea" 
                placeholder="What immediate intuitive sparks or resistance arose during this draw?" 
                value={reflection} 
                onChange={(e) => setReflection(e.target.value)} 
                disabled={anchored}
                style={{ minHeight: '60px', marginBottom: '16px' }}
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
            <button className="footer-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Dashboard</button>
            <Link href="/archive" className="footer-link" style={{ textDecoration: 'none' }}>Log Archive</Link>
          </div>
          <div className="footer-status">DB Connected · AI Ready</div>
        </footer>
      </div>
    </div>
    </StarfieldProvider>
  </>
  );
}
