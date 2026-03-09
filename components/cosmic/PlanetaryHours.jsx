"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlanetaryHours, formatTime12h, AUSPICIOUS_PLANETS } from '@/lib/planetaryHours';

export default function PlanetaryHours({ onStartSats }) {
  const [expanded, setExpanded] = useState(false);
  const [hoursData, setHoursData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [lastInsightPlanet, setLastInsightPlanet] = useState(null);

  const calculate = useCallback(() => {
    const lat = parseFloat(localStorage.getItem('lat')) || 43.6532;
    const lon = parseFloat(localStorage.getItem('lon')) || -79.3832;
    const data = getPlanetaryHours(lat, lon);
    setHoursData(data);
    return data;
  }, []);

  // Recalculate every 60 seconds
  useEffect(() => {
    const data = calculate();
    const interval = setInterval(calculate, 60000);

    // Try geolocation on first mount only
    if (!localStorage.getItem('lat') && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.setItem('lat', pos.coords.latitude);
          localStorage.setItem('lon', pos.coords.longitude);
          calculate();
        },
        () => {} // silent fail — Toronto fallback
      );
    }

    return () => clearInterval(interval);
  }, [calculate]);

  // Fetch Gemini insight when planetary hour changes
  useEffect(() => {
    if (!hoursData || hoursData.currentIdx < 0) return;
    const current = hoursData.hours[hoursData.currentIdx];
    if (!current || current.planet === lastInsightPlanet) return;

    setInsightLoading(true);
    setLastInsightPlanet(current.planet);

    fetch('/api/planetary-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planet: current.planet, isDay: current.isDay })
    })
      .then(r => r.json())
      .then(data => setInsight(data.insight))
      .catch(() => setInsight("This hour is yours. It is already done."))
      .finally(() => setInsightLoading(false));
  }, [hoursData?.currentIdx, lastInsightPlanet, hoursData]);

  if (!hoursData || hoursData.currentIdx < 0) return null;

  const current = hoursData.hours[hoursData.currentIdx];
  const upcoming = [];
  for (let i = 1; i <= 3; i++) {
    const idx = hoursData.currentIdx + i;
    if (idx < hoursData.hours.length) upcoming.push(hoursData.hours[idx]);
  }

  const handleStartSats = (planet) => {
    if (onStartSats) {
      onStartSats(`${planet} Hour Ritual — I breathe into the feeling of the wish fulfilled under ${planet}'s influence.`);
    }
  };

  return (
    <div className="planetary-hours-widget">
      {/* Collapsible Header */}
      <div
        className="ph-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="ph-header-left">
          <span className="ph-glyph-current" style={{ color: current.color, textShadow: `0 0 12px ${current.color}40` }}>
            {current.glyph}
          </span>
          <div className="ph-header-info">
            <span className="ph-label">Planetary Hour</span>
            <span className="ph-planet-name" style={{ color: current.color }}>{current.planet}</span>
          </div>
        </div>
        <div className="ph-header-right">
          <span className="ph-time-range">
            {formatTime12h(current.start)} — {formatTime12h(current.end)}
          </span>
          {current.isAuspicious && (
            <span className="ph-auspicious-tag">✦ auspicious</span>
          )}
          <span className="ph-expand-icon">{expanded ? '−' : '+'}</span>
        </div>
      </div>

      {/* Current Hour Detail + Upcoming */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="ph-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Current Hour Card */}
            <div className="ph-current-card" style={{ borderColor: `${current.color}40` }}>
              <div className="ph-current-glyph-large" style={{ color: current.color, textShadow: `0 0 24px ${current.color}60` }}>
                {current.glyph}
              </div>
              <div className="ph-current-details">
                <div className="ph-current-planet" style={{ color: current.color }}>{current.planet} Hour</div>
                <div className="ph-current-time">{formatTime12h(current.start)} — {formatTime12h(current.end)}</div>
                <div className="ph-current-type">{current.isDay ? '☀ Day Hour' : '☾ Night Hour'} #{current.hourNumber}</div>
              </div>
              {current.isAuspicious && (
                <div className="ph-auspicious-badge" style={{ borderColor: current.color, color: current.color }}>
                  ✦ Auspicious for Manifestation
                </div>
              )}
            </div>

            {/* Gemini Insight */}
            <div className="ph-insight">
              {insightLoading ? (
                <span className="ph-insight-loading">Reading the planetary ether...</span>
              ) : insight ? (
                <span className="ph-insight-text">"{insight}"</span>
              ) : null}
            </div>

            {/* Start SATS button */}
            <button
              className="ph-sats-btn"
              onClick={(e) => { e.stopPropagation(); handleStartSats(current.planet); }}
              style={{ borderColor: `${current.color}60`, color: current.color }}
            >
              <span className="ph-sats-glyph">{current.glyph}</span>
              Enter SATS in {current.planet} Hour
            </button>

            {/* Upcoming Hours */}
            <div className="ph-upcoming-label">Next Hours</div>
            <div className="ph-upcoming-list">
              {upcoming.map((hour, i) => (
                <motion.div
                  key={`${hour.planet}-${i}`}
                  className="ph-upcoming-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <span className="ph-upcoming-glyph" style={{ color: hour.color }}>{hour.glyph}</span>
                  <span className="ph-upcoming-name">{hour.planet}</span>
                  <span className="ph-upcoming-time">{formatTime12h(hour.start)} — {formatTime12h(hour.end)}</span>
                  {hour.isAuspicious && <span className="ph-auspicious-dot" style={{ background: hour.color }}>✦</span>}
                </motion.div>
              ))}
            </div>

            {/* Day Ruler */}
            <div className="ph-day-ruler">
              Today's ruler: <span style={{ color: current.color }}>{hoursData.dayRulerGlyph} {hoursData.dayRuler}</span>
              <span className="ph-sun-times">
                ↑ {formatTime12h(hoursData.sunrise)} · ↓ {formatTime12h(hoursData.sunset)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
