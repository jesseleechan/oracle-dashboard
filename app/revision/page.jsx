"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';
import { getPersonalNumerology } from '@/lib/personalNumerology';
import { getPlanetaryHours } from '@/lib/planetaryHours';

export default function RevisionChamber() {
  const [scenes, setScenes] = useState([]);
  const [filter, setFilter] = useState('unrevised');
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState(null);
  const [revisedText, setRevisedText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [impressing, setImpressing] = useState(false);
  const [impressed, setImpressed] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const autoSaveRef = useRef(null);

  const fetchScenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/revisions?filter=${filter}`);
      const data = await res.json();
      setScenes(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchScenes(); }, [fetchScenes]);

  // Auto-save draft every 10 seconds
  useEffect(() => {
    if (!selectedScene || !revisedText) return;
    autoSaveRef.current = setInterval(async () => {
      try {
        await fetch('/api/revisions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedScene.id, revisedScene: revisedText })
        });
      } catch {}
    }, 10000);
    return () => clearInterval(autoSaveRef.current);
  }, [selectedScene, revisedText]);

  const handleSelectScene = (scene) => {
    setSelectedScene(scene);
    setRevisedText(scene.revisedScene || '');
    setImpressed(scene.isImpressed);
    setConfirmText('');
    setShowConfetti(false);
  };

  const handleGenerateRevision = async () => {
    if (!selectedScene) return;
    setGenerating(true);
    try {
      const principle = getDailyPrinciple();
      const bm = parseInt(localStorage.getItem('birthMonth'));
      const bd = parseInt(localStorage.getItem('birthDay'));
      const numData = (bm && bd) ? getPersonalNumerology(bm, bd) : null;
      let planetaryHour = null;
      try { const ph = getPlanetaryHours(); planetaryHour = ph?.hours[ph?.currentIdx]?.planet; } catch {}

      const res = await fetch('/api/revision-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalScene: selectedScene.scene,
          hermeticPrinciple: principle?.name,
          personalYear: numData?.personalYear,
          planetaryHour
        })
      });
      const data = await res.json();
      setRevisedText(data.revisedScene || '');
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleImpress = async () => {
    if (!selectedScene || !revisedText) return;
    setImpressing(true);
    try {
      await fetch('/api/revisions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedScene.id, revisedScene: revisedText, isImpressed: true })
      });
      setImpressed(true);
      setShowConfetti(true);

      // Typewriter confirmation
      const fullText = revisedText;
      let i = 0;
      setConfirmText('');
      const typeInterval = setInterval(() => {
        if (i < fullText.length) {
          setConfirmText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 30);

      // Update scene in list
      setScenes(prev => prev.map(s => s.id === selectedScene.id ? { ...s, revisedScene: revisedText, isImpressed: true } : s));
      setSelectedScene(prev => ({ ...prev, revisedScene: revisedText, isImpressed: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setImpressing(false);
    }
  };

  const filters = [
    { key: 'unrevised', label: 'Awaiting Revision' },
    { key: 'friction', label: 'Friction' },
    { key: 'neutral', label: 'Neutral' },
    { key: 'impressed', label: 'Impressed' },
    { key: 'all', label: 'All Scenes' }
  ];

  return (
    <div className="dashboard revision-page">
      <div className="noise" />
      <div className="content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

        <header className="rc-header">
          <div>
            <div className="logo">Revision <span>Chamber</span></div>
            <div className="rc-subtitle">A sacred space for revising the past into the ideal</div>
          </div>
          <Link href="/" className="rc-back-link">← Return to Dashboard</Link>
        </header>

        {/* Filters */}
        <div className="rc-filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`rc-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => { setFilter(f.key); setSelectedScene(null); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="rc-layout">
          {/* Scene List */}
          <div className="rc-list">
            <div className="rc-list-label">Scenes ({scenes.length})</div>
            {loading ? (
              <div className="rc-loading">Gathering memories from the ether...</div>
            ) : scenes.length === 0 ? (
              <div className="rc-empty">No scenes found for this filter. Live, and return when there is something to revise.</div>
            ) : (
              scenes.map(scene => (
                <div
                  key={scene.id}
                  className={`rc-scene-item ${selectedScene?.id === scene.id ? 'selected' : ''} ${scene.isImpressed ? 'impressed' : ''}`}
                  onClick={() => handleSelectScene(scene)}
                >
                  <div className="rc-scene-date">{scene.date}</div>
                  <div className="rc-scene-preview">{scene.scene.substring(0, 80)}...</div>
                  <div className="rc-scene-meta">
                    <span className={`rc-flow-tag ${(scene.flowState || '').toLowerCase().replace(' ', '-')}`}>
                      {scene.flowState || 'Unknown'}
                    </span>
                    {scene.isImpressed && <span className="rc-impressed-tag">✦ Impressed</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Editor */}
          <div className="rc-editor">
            {!selectedScene ? (
              <div className="rc-editor-empty">
                <div className="rc-editor-empty-glyph">◈</div>
                <div className="rc-editor-empty-text">Select a scene to begin revision</div>
                <div className="rc-editor-empty-sub">Choose a friction or neutral scene from the list. Revise it so the wish is already fulfilled.</div>
              </div>
            ) : (
              <>
                {/* Side by side */}
                <div className="rc-side-by-side">
                  {/* Original */}
                  <div className="rc-panel rc-panel-original">
                    <div className="rc-panel-label">Original Scene</div>
                    <div className="rc-panel-tag" style={{ color: selectedScene.flowState === 'Friction' ? 'var(--rose)' : 'var(--muted)' }}>
                      {selectedScene.flowState || 'Unknown'} · {selectedScene.date}
                    </div>
                    <div className="rc-panel-text">{selectedScene.scene}</div>
                    {selectedScene.transitAspect && (
                      <div className="rc-panel-transit">Transit: {selectedScene.transitAspect}</div>
                    )}
                  </div>

                  {/* Revised */}
                  <div className="rc-panel rc-panel-revised">
                    <div className="rc-panel-label" style={{ color: 'var(--gold)' }}>Revised Scene</div>
                    {impressed ? (
                      <div className="rc-panel-impressed-text">{selectedScene.revisedScene || revisedText}</div>
                    ) : (
                      <textarea
                        className="rc-textarea"
                        value={revisedText}
                        onChange={(e) => setRevisedText(e.target.value)}
                        placeholder="Rewrite this scene as if the wish is already fulfilled. Use first person, present tense, sensory detail. Make it natural and mundane — it is already done."
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!impressed && (
                  <div className="rc-actions">
                    <button
                      className="rc-generate-btn"
                      onClick={handleGenerateRevision}
                      disabled={generating}
                    >
                      {generating ? '✦ Channeling revised scene...' : '✦ Generate Revised Version with Wisdom'}
                    </button>
                    <button
                      className="rc-impress-btn"
                      onClick={handleImpress}
                      disabled={impressing || !revisedText}
                    >
                      {impressing ? 'Sealing...' : '⊛ Impress This Revision'}
                    </button>
                  </div>
                )}

                {/* Impressed Confirmation */}
                <AnimatePresence>
                  {impressed && confirmText && (
                    <motion.div
                      className="rc-confirmation"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="rc-seal">⊛</div>
                      <div className="rc-seal-label">This is now true in imagination</div>
                      <div className="rc-seal-text">{confirmText}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Confetti */}
                <AnimatePresence>
                  {showConfetti && (
                    <div className="rc-confetti-container">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="rc-confetti-particle"
                          initial={{
                            opacity: 1,
                            x: Math.random() * 800 - 400,
                            y: 0,
                            scale: Math.random() * 0.5 + 0.5,
                            rotate: 0
                          }}
                          animate={{
                            opacity: 0,
                            y: -(Math.random() * 400 + 200),
                            x: Math.random() * 600 - 300,
                            rotate: Math.random() * 720 - 360,
                            scale: 0
                          }}
                          transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
                          onAnimationComplete={() => { if (i === 0) setShowConfetti(false); }}
                          style={{
                            background: ['#c9a96e', '#e8b4b8', '#c9a9c9', '#a9b9c9'][i % 4],
                          }}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
