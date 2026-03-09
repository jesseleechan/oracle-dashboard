"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';

export default function HermeticPrinciple({ onStartSats, transitColor }) {
  const [expanded, setExpanded] = useState(false);
  const [principle, setPrinciple] = useState(null);

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem('cachedHermetic');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === new Date().toDateString()) {
        setPrinciple(parsed);
        return;
      }
    }
    const p = getDailyPrinciple();
    setPrinciple(p);
    localStorage.setItem('cachedHermetic', JSON.stringify(p));
  }, []);

  if (!principle) return null;

  const color = transitColor || principle.color;

  const handleStartSats = () => {
    if (onStartSats) {
      onStartSats(`Hermetic Principle: ${principle.name} — "${principle.axiom}" ${principle.nevilleGuidance}`);
    }
  };

  return (
    <div className="hermetic-widget">
      <div className="hm-header" onClick={() => setExpanded(!expanded)}>
        <div className="hm-header-left">
          <span className="hm-orb" style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`, color }}>
            ◈
          </span>
          <div className="hm-header-info">
            <span className="hm-label">Hermetic Principle</span>
            <span className="hm-principle-name" style={{ color }}>{principle.name}</span>
          </div>
        </div>
        <div className="hm-header-right">
          {principle.potent && <span className="ph-auspicious-tag">✦ extra potent</span>}
          <span className="ph-expand-icon">{expanded ? '−' : '+'}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="hm-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Axiom Card */}
            <div className="hm-axiom-card" style={{ borderColor: `${color}30` }}>
              <div className="hm-axiom-orb" style={{ color, textShadow: `0 0 24px ${color}60` }}>◈</div>
              <div className="hm-axiom-content">
                <div className="hm-axiom-text" style={{ color }}>"{principle.axiom}"</div>
                <div className="hm-axiom-name">{principle.name}</div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="hm-interpretation">{principle.interpretation}</div>

            {/* Neville Guidance */}
            <div className="hm-neville">
              <span className="hm-neville-label">Neville Speaks:</span>
              <span className="hm-neville-text">{principle.nevilleGuidance}</span>
            </div>

            {/* Mental Diet Reminder */}
            <div className="hm-diet" style={{ borderColor: `${color}25` }}>
              <span className="hm-diet-label">Daily Mental Diet</span>
              <span className="hm-diet-text">
                Today practice {principle.name}: {principle.name === 'Correspondence' ? 'as within, so without — assume the feeling now' : 
                principle.name === 'Vibration' ? 'shift your frequency to the state of the wish fulfilled' :
                principle.name === 'Mentalism' ? 'guard your inner conversation — it builds worlds' :
                principle.name === 'Polarity' ? 'transmute the unwanted by moving along the pole' :
                principle.name === 'Rhythm' ? 'trust the ebb — persist gently in the assumption' :
                principle.name === 'Cause & Effect' ? 'plant the seed consciously in imagination' :
                'unite conception and feeling — conceive and receive'}.
              </span>
            </div>

            {/* SATS Button */}
            <button
              className="ph-sats-btn"
              onClick={(e) => { e.stopPropagation(); handleStartSats(); }}
              style={{ borderColor: `${color}40`, color }}
            >
              <span className="ph-sats-glyph">◈</span>
              Apply This Principle in SATS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
