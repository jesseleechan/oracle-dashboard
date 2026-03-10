"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SEPHIROTH, PATHS } from '@/lib/treeOfLife';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';
import { getPersonalNumerology } from '@/lib/personalNumerology';
import { getPlanetaryHours } from '@/lib/planetaryHours';

export default function TreePage() {
  const [selected, setSelected] = useState(null); // { type: 'sephira'|'path', data }
  const [scene, setScene] = useState('');
  const [pathworking, setPathworking] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [mappedNodes, setMappedNodes] = useState({});
  const [animatingPath, setAnimatingPath] = useState(null);
  const [asteroidData, setAsteroidData] = useState(null);

  // Load cached mappings
  useEffect(() => {
    const cached = localStorage.getItem('treeMappings');
    if (cached) setMappedNodes(JSON.parse(cached));
  }, []);

  // Load today's scene
  useEffect(() => {
    try {
      const cached = localStorage.getItem('assumptionToday');
      if (cached) {
        const p = JSON.parse(cached);
        if (p.date === new Date().toDateString() && p.text) setScene(p.text);
      }
    } catch {}

    try {
      const aData = localStorage.getItem('asteroidWhispers');
      if (aData) {
        const parsed = JSON.parse(aData);
        if (parsed.date === new Date().toDateString() && parsed.whispers?.length) {
          setAsteroidData(parsed.whispers[0]);
        }
      }
    } catch {}
  }, []);

  const handleSelectSephira = (seph) => {
    setSelected({ type: 'sephira', data: seph });
    setPathworking(null);
  };

  const handleSelectPath = (path) => {
    setSelected({ type: 'path', data: path });
    setPathworking(null);
  };

  const handleMap = () => {
    if (!selected || !scene) return;
    const key = selected.type === 'sephira' ? `s_${selected.data.name}` : `p_${selected.data.number}`;
    const newMappings = { ...mappedNodes, [key]: { scene, date: new Date().toDateString() } };
    setMappedNodes(newMappings);
    localStorage.setItem('treeMappings', JSON.stringify(newMappings));

    // Animate
    if (selected.type === 'sephira') {
      setAnimatingPath(selected.data.name);
      setTimeout(() => setAnimatingPath(null), 2000);
    }
  };

  const handleGeneratePathworking = async () => {
    if (!selected || !scene) return;
    setGenerating(true);
    try {
      let planetaryHour = null, hermeticPrinciple = null, personalYear = null;
      try { const ph = getPlanetaryHours(); planetaryHour = ph?.hours[ph?.currentIdx]?.planet; } catch {}
      try { hermeticPrinciple = getDailyPrinciple()?.name; } catch {}
      try {
        const bm = parseInt(localStorage.getItem('birthMonth'));
        const bd = parseInt(localStorage.getItem('birthDay'));
        if (bm && bd) personalYear = getPersonalNumerology(bm, bd)?.personalYear;
      } catch {}

      const res = await fetch('/api/pathworking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          sephira: selected.type === 'sephira' ? selected.data.name : null,
          pathNumber: selected.type === 'path' ? selected.data.number : null,
          planetaryHour, hermeticPrinciple, personalYear,
          asteroidInsight: asteroidData ? `${asteroidData.name} - ${asteroidData.insight}` : null
        })
      });
      const data = await res.json();
      setPathworking(data.pathworking || '');
    } catch {} finally { setGenerating(false); }
  };

  const getCoords = (name) => SEPHIROTH.find(s => s.name === name) || { x: 0, y: 0 };

  return (
    <div className="dashboard tree-page">
      <div className="noise" />
      <div className="content" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>

        <header className="jn-header">
          <div>
            <div className="logo" style={{ color: 'var(--transit-hue, var(--gold))' }}>Tree of <span>Life</span></div>
            <div className="jn-subtitle">Map your desires to the sacred architecture of creation</div>
          </div>
          <Link href="/" className="rc-back-link">← Dashboard</Link>
        </header>

        <div className="tol-layout">
          {/* SVG Tree */}
          <div className="tol-diagram">
            <svg viewBox="0 0 400 560" className="tol-svg">
              {/* Paths */}
              {PATHS.map(path => {
                const from = getCoords(path.from);
                const to = getCoords(path.to);
                const key = `p_${path.number}`;
                const isMapped = !!mappedNodes[key];
                return (
                  <line
                    key={path.number}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    className={`tol-path-line ${isMapped ? 'mapped' : ''} ${selected?.type === 'path' && selected?.data?.number === path.number ? 'selected' : ''}`}
                    onClick={() => handleSelectPath(path)}
                    style={selected?.type === 'path' && selected?.data?.number === path.number ? { stroke: 'var(--transit-hue, var(--gold))' } : {}}
                  />
                );
              })}

              {/* Sephiroth */}
              {SEPHIROTH.map(seph => {
                const key = `s_${seph.name}`;
                const isMapped = !!mappedNodes[key];
                const isAnimating = animatingPath === seph.name;
                return (
                  <g key={seph.name} onClick={() => handleSelectSephira(seph)} className="tol-sephira-group">
                    {isAnimating && (
                      <circle cx={seph.x} cy={seph.y} r="28" className="tol-sephira-pulse" style={{ stroke: seph.color }} />
                    )}
                    <circle
                      cx={seph.x} cy={seph.y} r="20"
                      className={`tol-sephira ${isMapped ? 'mapped' : ''} ${selected?.type === 'sephira' && selected?.data?.name === seph.name ? 'selected' : ''}`}
                      style={{ stroke: seph.color }}
                    />
                    <text x={seph.x} y={seph.y + 4} className="tol-sephira-label">{seph.number}</text>
                    <title>{seph.name} — {seph.keyword}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Info Panel */}
          <div className="tol-panel">
            {!selected ? (
              <div className="tol-panel-empty">
                <div className="rc-editor-empty-glyph">✡</div>
                <div className="rc-editor-empty-text">Select a Sephira or Path</div>
                <div className="rc-editor-empty-sub">Click any node on the Tree to map your current scene or desire to that sphere of creation.</div>
              </div>
            ) : (
              <div className="tol-panel-content">
                <div className="tol-panel-name" style={{ color: selected.type === 'sephira' ? selected.data.color : 'var(--gold)' }}>
                  {selected.type === 'sephira' ? selected.data.name : `Path ${selected.data.number}`}
                </div>
                <div className="tol-panel-keyword">
                  {selected.type === 'sephira' ? selected.data.keyword : `${selected.data.from} → ${selected.data.to}`}
                </div>

                {asteroidData && (
                  <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(214,106,106,0.1)', borderRadius: '4px', borderLeft: '2px solid var(--rose)', fontFamily: 'Cormorant Garamond', fontSize: '13px', color: 'var(--text)' }}>
                    <span style={{color: 'var(--rose)', fontWeight: 'bold'}}>{asteroidData.name} Influence:</span> {asteroidData.insight}
                  </div>
                )}

                {/* Scene Input */}
                <div className="tol-scene-area">
                  <div className="at-prompt-label">Scene or Desire</div>
                  <textarea
                    className="at-textarea"
                    value={scene}
                    onChange={(e) => setScene(e.target.value)}
                    placeholder="Write the scene or desire you want to map here…"
                  />
                </div>

                <div className="at-actions">
                  <button className="at-save-btn" onClick={handleMap} disabled={!scene}>⊛ Map This Here</button>
                  <button className="rc-generate-btn" onClick={handleGeneratePathworking} disabled={generating || !scene}>
                    {generating ? '✦ Channeling…' : '✦ Pathworking'}
                  </button>
                </div>

                {/* Mapped info */}
                {mappedNodes[selected.type === 'sephira' ? `s_${selected.data.name}` : `p_${selected.data.number}`] && (
                  <div className="tol-mapped-info">
                    ✦ Mapped: "{mappedNodes[selected.type === 'sephira' ? `s_${selected.data.name}` : `p_${selected.data.number}`].scene.substring(0, 60)}…"
                  </div>
                )}

                {/* Pathworking Result */}
                <AnimatePresence>
                  {pathworking && (
                    <motion.div
                      className="tol-pathworking"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="jn-analysis-label">Pathworking Script</div>
                      <div className="jn-analysis-text">{pathworking}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
