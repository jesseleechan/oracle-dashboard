"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';

const TEMPLATES = [
  "I am the one who…",
  "It is done. I now…",
  "I remember when I used to worry about this, but now…",
  "It is natural and mundane that I…",
  "I give thanks that I already…",
];

export default function AssumptionTracker({ onStartSats, todayLogId }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showGold, setShowGold] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const autoSaveRef = useRef(null);
  const principle = getDailyPrinciple();

  // Hydrate from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const cached = localStorage.getItem('assumptionToday');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === today) {
        setText(parsed.text || '');
        setRating(parsed.rating || 0);
        setSaved(!!parsed.text);
      }
    }
  }, []);

  // Auto-save every 10s
  useEffect(() => {
    if (!text) return;
    autoSaveRef.current = setInterval(() => {
      saveToCache();
    }, 10000);
    return () => clearInterval(autoSaveRef.current);
  }, [text, rating]);

  const saveToCache = () => {
    const today = new Date().toDateString();
    localStorage.setItem('assumptionToday', JSON.stringify({ date: today, text, rating }));
  };

  const handleSave = async () => {
    saveToCache();
    setSaved(true);

    // Save to Prisma if we have a log ID
    if (todayLogId) {
      try {
        await fetch('/api/logs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: todayLogId, assumptionText: text, feelingRating: rating })
        });
      } catch {}
    }

    if (rating >= 8) {
      setShowGold(true);
      setTimeout(() => setShowGold(false), 3000);
    }
  };

  const handleRating = (val) => {
    setRating(val);
    setSaved(false);
  };

  const handleTemplate = (tmpl) => {
    setText(tmpl);
    setSaved(false);
  };

  const handleBlur = () => {
    if (text) handleSave();
  };

  const handleSats = () => {
    if (onStartSats && text) {
      onStartSats(`Living in the End: ${text}`);
    }
  };

  const isHighFeeling = rating >= 8;

  return (
    <div className="assumption-widget">
      <div className="at-header" onClick={() => setExpanded(!expanded)}>
        <div className="at-header-left">
          <span className={`at-glyph ${isHighFeeling ? 'at-glow' : ''}`}>◉</span>
          <div className="at-header-info">
            <span className="at-label">Living in the End</span>
            <span className="at-sublabel">
              {text ? `"${text.substring(0, 40)}${text.length > 40 ? '…' : ''}"` : 'Log today\'s assumption'}
            </span>
          </div>
        </div>
        <div className="at-header-right">
          {rating > 0 && (
            <span className="at-rating-badge" style={{ color: isHighFeeling ? 'var(--gold)' : 'var(--muted)' }}>
              {rating}/10
            </span>
          )}
          <span className="ph-expand-icon">{expanded ? '−' : '+'}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="at-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Templates */}
            <div className="at-templates">
              {TEMPLATES.map((t, i) => (
                <button key={i} className="at-template-btn" onClick={() => handleTemplate(t)}>{t}</button>
              ))}
            </div>

            {/* Textarea */}
            <div className="at-input-area">
              <div className="at-prompt-label">Today I assumed…</div>
              <textarea
                className="at-textarea"
                value={text}
                onChange={(e) => { setText(e.target.value); setSaved(false); }}
                onBlur={handleBlur}
                placeholder="Write your assumption as though it is already done. First person, present tense, natural and mundane."
              />
            </div>

            {/* Feeling Rating */}
            <div className="at-rating-section">
              <div className="at-rating-label">How real does this feel? (1–10)</div>
              <div className="at-stars">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
                  <button
                    key={val}
                    className={`at-star ${val <= rating ? 'filled' : ''} ${val <= rating && isHighFeeling ? 'gold' : ''}`}
                    onClick={() => handleRating(val)}
                  >
                    {val <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="at-actions">
              <button
                className="at-save-btn"
                onClick={handleSave}
                disabled={!text}
              >
                {saved ? '✦ Sealed' : '⊛ Seal This Assumption'}
              </button>
              {text && (
                <button className="at-sats-btn" onClick={handleSats}>
                  Bring Into SATS
                </button>
              )}
            </div>

            {/* High-feeling confirmation */}
            <AnimatePresence>
              {saved && isHighFeeling && (
                <motion.div
                  className="at-confirmation"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  It is done. The assumption lives.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gold Thread Particles */}
      <AnimatePresence>
        {showGold && (
          <div className="at-gold-burst">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="at-gold-particle"
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  x: (Math.random() - 0.5) * 500,
                  y: -(Math.random() * 300 + 100),
                  scale: 0
                }}
                transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
