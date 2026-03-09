import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_PHRASES = [
  "The ether is listening...",
  "Synthesizing energetic weather...",
  "Resistance softens...",
  "Aligning with cosmic frequencies...",
  "Transmuting the timeline..."
];

export default function SynthesisEngine({ aiOutput, aiLoading, visibleCards, generateStudioInsight }) {
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

  return (
    <div className={`studio-block ${(aiOutput || aiLoading) ? 'expanded' : ''}`}>
      <div className="studio-header">
        <div className="section-label" style={{ marginBottom: 0, gap: '8px' }}>Studio Synthesis</div>
        <button className="generate-btn" onClick={generateStudioInsight} disabled={aiLoading || visibleCards.some(c => !c.flipped)}>
          {aiLoading ? "Synthesizing..." : (aiOutput ? "Refresh Synthesis" : "Translate to Action")}
        </button>
      </div>
      
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
          <div className="studio-insight" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{aiOutput.insight}</div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </div>
  );
}
