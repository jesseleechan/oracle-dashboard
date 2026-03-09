import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_PHRASES = [
  "The ether is listening...",
  "Weaving planetary threads...",
  "Aligning the Tree of Life...",
  "Channeling the unified field...",
  "The oracle speaks as one voice..."
];

const LAYER_ICONS = {
  planetary: { icon: '☿', label: 'Planetary Hour' },
  numerology: { icon: '⑦', label: 'Numerology' },
  hermetic: { icon: '☤', label: 'Hermetic Law' },
  tree: { icon: '✡', label: 'Tree of Life' },
  dream: { icon: '🌙', label: 'Dream/Synch' },
  assumption: { icon: '◉', label: 'Assumption' },
  sensory: { icon: '✋', label: 'Sensory Script' },
  asteroid: { icon: '⚷', label: 'Asteroid Whisper' }
};

export default function SynthesisEngine({ aiOutput, aiLoading, visibleCards, generateStudioInsight, onDeepen }) {
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);

  useEffect(() => {
    let interval;
    if (aiLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 3000);
    } else {
      setLoadingPhraseIdx(0);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

  const layers = aiOutput?.layersActive || [];
  const depth = aiOutput?.depth || 0;
  const isUnified = depth >= 3;

  return (
    <div className={`studio-block ${(aiOutput || aiLoading) ? 'expanded' : ''}`}>
      <div className="studio-header">
        <div className="section-label" style={{ marginBottom: 0, gap: '8px' }}>
          {isUnified ? '✦ Unified Oracle' : 'Studio Synthesis'}
        </div>
        <div className="synth-header-actions">
          {aiOutput && !aiLoading && onDeepen && (
            <button className="synth-deepen-btn" onClick={onDeepen}>Deepen</button>
          )}
          <button className="generate-btn" onClick={generateStudioInsight} disabled={aiLoading || visibleCards.some(c => !c.flipped)}>
            {aiLoading ? "Synthesizing..." : (aiOutput ? "Refresh" : "Translate to Action")}
          </button>
        </div>
      </div>
      
      {/* Layers Active Badges */}
      {aiOutput && layers.length > 0 && (
        <div className="synth-layers">
          <span className="synth-layers-label">Layers:</span>
          {layers.map(layer => (
            <span key={layer} className="synth-layer-badge" title={LAYER_ICONS[layer]?.label}>
              {LAYER_ICONS[layer]?.icon || '•'}
            </span>
          ))}
          {depth >= 4 && <span className="synth-depth-glow">Full Alignment</span>}
        </div>
      )}

      <AnimatePresence mode="wait">
      {aiLoading ? (
        <motion.div
          key="loading"
          className="synthesis-skeleton"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="poetic-loader" key={loadingPhraseIdx} style={{
             fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontStyle: 'italic', 
             opacity: 0.6, letterSpacing: '0.02em', animation: 'pulseFade 3s ease-in-out infinite'
          }}>
             ✦ {LOADING_PHRASES[loadingPhraseIdx]}
          </div>
        </motion.div>
      ) : aiOutput ? (
        <motion.div
          key="output"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="studio-tags">
            {aiOutput.tags && Array.isArray(aiOutput.tags) ? aiOutput.tags.map(tag => <span key={tag} className="tag">{tag}</span>) : null}
          </div>
          <div className={`studio-insight ${isUnified ? 'unified-insight' : ''}`} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{aiOutput.insight}</div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </div>
  );
}
