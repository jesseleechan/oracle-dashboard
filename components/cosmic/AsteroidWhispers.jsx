"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ASTEROID_SYMBOLS = {
  'Chiron': '⚷',
  'Lilith': '⚸',
  'Juno': '⚵',
  'Vesta': '⚶',
  'Pallas': '⚴',
  'Ceres': '⚳',
  'Black Moon Lilith': '⚸'
};

export default function AsteroidWhispers({ transitAspect }) {
  const [whispers, setWhispers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check settings
    const setting = localStorage.getItem('showAsteroidWhisperer');
    if (setting === 'false') {
      setShowAsteroids(false);
      return;
    }

    const fetchWhispers = async () => {
      try {
        setLoading(true);
        // Check cache (daily)
        const cached = localStorage.getItem('asteroidWhispers');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.date === new Date().toDateString() && parsed.whispers?.length > 0) {
            setWhispers(parsed.whispers);
            setLoading(false);
            return;
          }
        }

        const birthYear = localStorage.getItem('birthYear');
        const birthMonth = localStorage.getItem('birthMonth');
        const birthDay = localStorage.getItem('birthDay');

        const res = await fetch('/api/asteroid-wisdom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthYear, birthMonth, birthDay, transitAspect })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.whispers) {
            setWhispers(data.whispers);
            localStorage.setItem('asteroidWhispers', JSON.stringify({
              date: new Date().toDateString(),
              whispers: data.whispers
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch asteroid whispers", e);
      } finally {
        setLoading(false);
      }
    };

    fetchWhispers();
  }, [transitAspect]);

  if (!showAsteroids) return null;

  return (
    <div className="bento-card bento-span-6">
      <div 
        className="asteroid-header" 
        onClick={() => setExpanded(!expanded)} 
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', userSelect: 'none', background: 'transparent', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}
      >
        <div>Asteroid Whispers <span style={{ opacity: 0.5, fontSize: '10px', marginLeft: '8px' }}>Shadow & Healing</span></div>
        <span className="ph-expand-icon">{expanded ? '−' : '+'}</span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            className="asteroid-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="asteroid-grid" style={{ padding: '0 16px 16px', marginTop: '16px' }}>
              {loading ? (
                <div className="asteroid-loading">Listening to the deeper orbits...</div>
              ) : whispers.map((whisper, idx) => (
                <div key={idx} className="asteroid-card">
                  <div className="asteroid-title-row">
                    <span className="asteroid-symbol" style={{ color: 'var(--transit-hue, var(--gold))' }}>{ASTEROID_SYMBOLS[whisper.name] || '✦'}</span>
                    <span className="asteroid-name">{whisper.name}</span>
                    <span className="asteroid-transit">— {whisper.transit}</span>
                    {whisper.potentForSats && (
                      <span className="sats-potent-tag" title="Exceptionally potent for SATS manifestation tonight">✦ Potent</span>
                    )}
                  </div>
                  <div className="asteroid-insight">{whisper.insight}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
