"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function ArchiveInteractive({ initialLogs }) {
  const [logs, setLogs] = useState(initialLogs);
  const [oracleData, setOracleData] = useState(null);
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [activeMonth, setActiveMonth] = useState(null);
  const [oracleTimeframe, setOracleTimeframe] = useState('30'); // '30' or '90'
  const [typedPatterns, setTypedPatterns] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const triggerConfetti = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti star';
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        document.body.appendChild(confetti);
        
        const tx = (Math.random() - 0.5) * 150 + 'px';
        const ty = (Math.random() - 0.5) * 150 - 50 + 'px';
        confetti.style.setProperty('--tx', tx);
        confetti.style.setProperty('--ty', ty);
        
        setTimeout(() => confetti.remove(), 800);
    }
  };

  const handleToggleRealized = async (e, id, currentStatus) => {
    try {
      if (!currentStatus) triggerConfetti(e);
      
      const res = await fetch('/api/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRealized: !currentStatus })
      });
      if (res.ok) {
        setLogs(prev => prev.map(l => l.id === id ? { ...l, isRealized: !currentStatus } : l));
      }
    } catch (err) { console.error(err); }
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditValue(log.scene);
  };

  const saveEdit = async (log) => {
    if (editValue.trim() === log.scene) {
      setEditingId(null);
      return;
    }
    
    try {
      const historyArr = log.sceneHistory ? JSON.parse(log.sceneHistory) : [];
      historyArr.push({ timestamp: Date.now(), text: log.scene });
      
      const res = await fetch('/api/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: log.id, 
          scene: editValue,
          sceneHistory: JSON.stringify(historyArr)
        })
      });
      
      if (res.ok) {
        setLogs(prev => prev.map(l => l.id === log.id ? { 
          ...l, 
          scene: editValue, 
          sceneHistory: JSON.stringify(historyArr) 
        } : l));
        setEditingId(null);
      }
    } catch (err) { console.error(err); }
  };

  // Filtering Logs
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (log.tarotCards && log.tarotCards.toLowerCase().includes(q)) || 
           (log.scene && log.scene.toLowerCase().includes(q)) ||
           (log.transitAspect && log.transitAspect.toLowerCase().includes(q));
  });

  // Group logs by month string
  const getMonthStr = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  };

  const logsByMonth = logs.reduce((acc, log) => {
    const m = getMonthStr(log.date);
    if (!acc[m]) acc[m] = [];
    acc[m].push(log);
    return acc;
  }, {});

  const monthKeys = Object.keys(logsByMonth);

  // Month Statistics Analyzer
  const analyzeMonth = (monthLogs) => {
    const flowDays = monthLogs.filter(l => l.flowState === "Pure Flow");
    const transits = flowDays.map(l => l.transitAspect).filter(Boolean);
    const topTransit = transits.length ? transits.sort((a,b) =>
          transits.filter(v => v===a).length - transits.filter(v => v===b).length
    ).pop() : "Establishing resonance...";
    
    return {
      flowCount: flowDays.length,
      topTransit
    };
  };

  const getHeatmapColor = (state) => {
    if (state === "Pure Flow") return "var(--gold)";
    if (state === "Neutral") return "var(--rose)";
    if (state === "High Friction") return "#4a4760"; 
    return "rgba(255,255,255,0.05)"; 
  };

  async function generatePatternOracle() {
    setIsOracleLoading(true);
    setOracleData(null);
    setTypedPatterns([]);
    setIsPinned(false);
    try {
      // Also fetch journals
      const journalsRes = await fetch(`/api/journal?limit=${oracleTimeframe === '90' ? 90 : 30}`);
      const journalsData = await journalsRes.json();
      
      const response = await fetch('/api/pattern-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          logs: logs.slice(0, parseInt(oracleTimeframe)),
          journals: journalsData.entries || [],
          timeframe: oracleTimeframe
        })
      });
      if (!response.ok) throw new Error("Failed to fetch patterns");
      const data = await response.json();
      setOracleData(data);
      typewriterReveal(data.patterns || []);
    } catch (e) {
      console.error(e);
      alert("Pattern Oracle could not connect to the ether. Try again.");
    } finally {
      setIsOracleLoading(false);
    }
  }

  const typewriterReveal = (patternsArray) => {
    setIsTyping(true);
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < patternsArray.length) {
        setTypedPatterns(prev => [...prev, patternsArray[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 800);
  };

  const handlePinInsight = async () => {
    if (!oracleData) return;
    try {
      const res = await fetch('/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframe: oracleTimeframe,
          patterns: JSON.stringify(oracleData)
        })
      });
      if (res.ok) setIsPinned(true);
    } catch (e) {
      console.error('Failed to pin pattern:', e);
    }
  };

  const syncIntegration = (action, text) => {
    if (action === 'sats') {
       localStorage.setItem('satsInjectedPattern', text);
       alert("Pattern injected into tonight's SATS script.");
    } else if (action === 'revision') {
       localStorage.setItem('revisionInjectedPattern', text);
       alert("Pattern seeded for the Revision Chamber.");
    } else if (action === 'synthesis') {
       localStorage.setItem('dailySynthesisPattern', text);
       alert("Pattern will weave into tomorrow's synthesis.");
    }
  };

  return (
    <div className="dashboard" style={{ minHeight: '100vh', padding: '32px' }}>
      <div className="noise" />
      <div className="content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        
        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="logo">Mundane <span>Archive</span></div>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search tarot, transits, or scenes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)',
                padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontFamily: 'Inconsolata', width: '240px'
              }}
            />
            <Link href="/" style={{ fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              ← Return
            </Link>
          </div>
        </header>

        {/* Pattern Oracle UI */}
        <section className={`section ${oracleData ? 'oracle-active' : ''}`} style={{ position: 'relative' }}>
          {oracleData && <div className="oracle-starfield-bg" />}
          <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <span style={{ color: oracleData ? 'var(--transit-hue, var(--gold))' : 'inherit', textShadow: oracleData ? '0 0 10px rgba(201,169,110,0.5)' : 'none' }}>Advanced Pattern Oracle</span>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <select 
                value={oracleTimeframe} 
                onChange={(e) => setOracleTimeframe(e.target.value)}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Inconsolata', fontSize: '11px', padding: '4px 8px' }}
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <button className="generate-btn" onClick={generatePatternOracle} disabled={isOracleLoading} style={{ padding: '4px 12px', fontSize: '10px', borderColor: 'var(--transit-hue, var(--gold))' }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }}/>
                {isOracleLoading ? "Reading the Ether..." : "Invoke Oracle"}
              </button>
            </div>
          </div>
          
          {(oracleData || isOracleLoading) && (
            <div className={`studio-block ${oracleData ? 'expanded pattern-block' : ''}`} style={{ marginBottom: '40px', borderColor: 'var(--transit-hue, var(--gold))', position: 'relative', zIndex: 10 }}>
              {isOracleLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', opacity: 0.6, animation: 'pulse 2s infinite' }}>
                  ✦ Gazing into the Akashic records...
                </div>
              ) : oracleData ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                    {typedPatterns.map((p, i) => (
                      <div key={i} className="pattern-card-fade" style={{ border: '1px solid rgba(201,169,110,0.2)', padding: '20px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ fontFamily: 'Inconsolata', fontSize: '13px', color: 'var(--transit-hue, var(--gold))', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{p.title}</div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => syncIntegration('sats', p.guidance)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '9px', fontFamily: 'Inconsolata', textTransform: 'uppercase', padding: '2px 6px', cursor: 'pointer' }}>To SATS</button>
                            <button onClick={() => syncIntegration('revision', p.guidance)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '9px', fontFamily: 'Inconsolata', textTransform: 'uppercase', padding: '2px 6px', cursor: 'pointer' }}>To Revision</button>
                          </div>
                        </div>
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '12px' }}>{p.detail}</div>
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', fontStyle: 'italic', color: 'var(--rose)' }}>✦ {p.guidance}</div>
                      </div>
                    ))}
                  </div>
                  
                  {!isTyping && (
                    <div className="pattern-card-fade" style={{ borderTop: '1px dashed rgba(201,169,110,0.3)', paddingTop: '24px', position: 'relative' }}>
                      <div style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text)', lineHeight: '1.6', opacity: 0.9, marginBottom: '24px' }}>
                        {oracleData.synthesis}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button onClick={() => syncIntegration('synthesis', oracleData.synthesis)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '10px', fontFamily: 'Inconsolata', textTransform: 'uppercase', padding: '6px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
                          Weave into Daily Synthesis
                        </button>
                        <button onClick={handlePinInsight} disabled={isPinned} style={{ background: isPinned ? 'transparent' : 'var(--transit-hue, var(--gold))', border: isPinned ? '1px solid var(--transit-hue, var(--gold))' : 'none', color: isPinned ? 'var(--transit-hue, var(--gold))' : '#000', fontSize: '10px', fontFamily: 'Inconsolata', textTransform: 'uppercase', padding: '6px 16px', cursor: 'pointer', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                          {isPinned ? '✦ Insight Pinned to Archive' : 'Pin Insight'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-label">Flow State Heatmap (Monthly)</div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {monthKeys.map(m => (
              <button 
                key={m} 
                onClick={() => setActiveMonth(activeMonth === m ? null : m)}
                className="toggle-btn"
                style={{ opacity: activeMonth === m ? 1 : 0.6, fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                {m}
              </button>
            ))}
          </div>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', 
            padding: '24px', borderRadius: '2px', display: 'flex', 
            flexWrap: 'wrap', gap: '6px', marginBottom: '40px'
          }}>
            {activeMonth ? logsByMonth[activeMonth].map((log) => (
              <div 
                key={log.id} 
                className="heatmap-cell"
                title={`${log.date}${log.flowState ? ` - ${log.flowState}` : ''}`}
                style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  backgroundColor: getHeatmapColor(log.flowState),
                  transition: 'transform 0.2s', cursor: 'pointer'
                }}
              />
            )) : logs.slice(0, 60).map((log) => (
              <div 
                key={log.id} 
                className="heatmap-cell"
                title={`${log.date}${log.flowState ? ` - ${log.flowState}` : ''}`}
                style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  backgroundColor: getHeatmapColor(log.flowState),
                  transition: 'transform 0.2s', cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {activeMonth && (
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', padding: '16px', borderRadius: '2px', marginBottom: '40px', display: 'flex', gap: '32px' }}>
               <div>
                 <div style={{ fontFamily: 'Inconsolata', fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Pure Flow Days</div>
                 <div style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond', fontSize: '24px' }}>{analyzeMonth(logsByMonth[activeMonth]).flowCount}</div>
               </div>
               <div>
                 <div style={{ fontFamily: 'Inconsolata', fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Dominant Flow Transit</div>
                 <div style={{ color: 'var(--rose)', fontFamily: 'Cormorant Garamond', fontSize: '20px', fontStyle: 'italic' }}>{analyzeMonth(logsByMonth[activeMonth]).topTransit}</div>
               </div>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-label">Historical Logs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No scenes found matching criteria.</div>
            ) : (
              filteredLogs.map(log => {
                const isEdited = log.sceneHistory && JSON.parse(log.sceneHistory).length > 0;
                
                return (
                <div key={log.id} className={`log-card ${log.isRealized ? 'log-realized' : ''}`} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${getHeatmapColor(log.flowState)}`,
                  padding: '24px', borderRadius: '2px', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => startEditing(log)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Inconsolata', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      {editingId === log.id ? '' : 'Edit'}
                    </button>
                    <button 
                      onClick={(e) => handleToggleRealized(e, log.id, log.isRealized)}
                      style={{ background: 'none', border: 'none', color: log.isRealized ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                      title="Mark as Realized"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontFamily: 'Inconsolata', fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.2em', paddingRight: '50px' }}>
                    <span>{log.date} {isEdited && <span style={{ color: 'var(--gold-dim)' }}>(Edited)</span>}</span>
                    <span>Universal Day {log.universalDay}</span>
                  </div>
                  {log.transitAspect && (
                    <div style={{ color: 'var(--rose)', fontSize: '11px', fontFamily: 'Inconsolata', marginBottom: '12px', letterSpacing: '0.1em' }}>
                      {log.transitAspect}
                    </div>
                  )}
                  {log.tarotCards && (
                    <div style={{ color: 'var(--gold)', fontSize: '11px', fontFamily: 'Inconsolata', marginBottom: '16px', letterSpacing: '0.1em' }}>
                      DRAW: {log.tarotCards}
                    </div>
                  )}
                  
                  {editingId === log.id ? (
                    <div>
                      <textarea 
                        className="edit-textarea" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button className="toggle-btn" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => saveEdit(log)}>Save Pattern</button>
                        <button className="toggle-btn" style={{ padding: '4px 12px', fontSize: '11px', opacity: 0.5 }} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="log-scene" style={{
                      color: 'var(--text)', fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '16px', lineHeight: '1.6', letterSpacing: '0.02em',
                      fontStyle: 'italic', fontWeight: 300, whiteSpace: 'pre-wrap',
                      transition: 'opacity 0.3s'
                    }}>
                      "{log.scene}"
                    </div>
                  )}
                </div>
              )})
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
