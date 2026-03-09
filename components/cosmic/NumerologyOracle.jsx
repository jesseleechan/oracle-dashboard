"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalNumerology } from '@/lib/personalNumerology';

export default function NumerologyOracle({ onStartSats, currentPlanetaryHour, currentTarotCard }) {
  const [expanded, setExpanded] = useState(false);
  const [numData, setNumData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [affirmation, setAffirmation] = useState(null);
  const [affirmationLoading, setAffirmationLoading] = useState(false);
  const [hasBirthdate, setHasBirthdate] = useState(false);
  const [showDatePrompt, setShowDatePrompt] = useState(false);
  const [birthInput, setBirthInput] = useState('');

  const calculate = useCallback(() => {
    const birthMonth = parseInt(localStorage.getItem('birthMonth'));
    const birthDay = parseInt(localStorage.getItem('birthDay'));

    if (birthMonth && birthDay) {
      setHasBirthdate(true);
      const data = getPersonalNumerology(birthMonth, birthDay);
      setNumData(data);

      // Cache for instant load
      if (data) localStorage.setItem('cachedNumerology', JSON.stringify(data));
      return data;
    } else {
      setHasBirthdate(false);
      // Try cached
      const cached = localStorage.getItem('cachedNumerology');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === new Date().toDateString()) {
          setNumData(parsed);
          setHasBirthdate(true);
        }
      }
      return null;
    }
  }, []);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Fetch Gemini insight once per day
  useEffect(() => {
    if (!numData) return;
    const cacheKey = `numInsight_${numData.date}_${numData.personalYear}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setInsight(cached); return; }

    setInsightLoading(true);
    fetch('/api/numerology-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalYear: numData.personalYear,
        personalMonth: numData.personalMonth,
        personalDay: numData.personalDay,
        yearName: numData.yearName,
        planetaryHour: currentPlanetaryHour || null,
        mode: 'insight'
      })
    })
      .then(r => r.json())
      .then(data => {
        setInsight(data.insight);
        localStorage.setItem(cacheKey, data.insight);
      })
      .catch(() => setInsight("The numbers resonate. Assume the state."))
      .finally(() => setInsightLoading(false));
  }, [numData, currentPlanetaryHour]);

  const handleGenerateAffirmation = () => {
    if (!numData) return;
    setAffirmationLoading(true);
    setAffirmation(null);

    fetch('/api/numerology-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalYear: numData.personalYear,
        personalMonth: numData.personalMonth,
        personalDay: numData.personalDay,
        yearName: numData.yearName,
        planetaryHour: currentPlanetaryHour || null,
        tarotCard: currentTarotCard || null,
        mode: 'affirmation'
      })
    })
      .then(r => r.json())
      .then(data => setAffirmation(data.insight))
      .catch(() => setAffirmation("I AM the fulfilled state. It was never a question."))
      .finally(() => setAffirmationLoading(false));
  };

  const handleSaveBirthdate = () => {
    if (!birthInput) return;
    const parts = birthInput.split('-');
    if (parts.length === 3) {
      localStorage.setItem('birthMonth', parseInt(parts[1]));
      localStorage.setItem('birthDay', parseInt(parts[2]));
      localStorage.setItem('birthYear', parseInt(parts[0]));
      setShowDatePrompt(false);
      calculate();
    }
  };

  const handleStartSats = () => {
    if (onStartSats && numData) {
      onStartSats(`${numData.personalYear} Personal Year — ${numData.yearArchetype} I breathe into the frequency of ${numData.yearName}.`);
    }
  };

  // Not configured state
  if (!hasBirthdate && !showDatePrompt) {
    return (
      <div className="numerology-widget">
        <div className="no-header" onClick={() => setShowDatePrompt(true)}>
          <span className="no-glyph">✦</span>
          <div className="no-info">
            <span className="no-label">Personal Numerology Oracle</span>
            <span className="no-hint">Tap to enter your birth date and unlock your Personal Year cycle</span>
          </div>
        </div>
      </div>
    );
  }

  // Date prompt
  if (showDatePrompt && !hasBirthdate) {
    return (
      <div className="numerology-widget">
        <div className="no-date-prompt">
          <div className="no-label" style={{ marginBottom: '12px' }}>Enter Your Birth Date</div>
          <input
            type="date"
            value={birthInput}
            onChange={(e) => setBirthInput(e.target.value)}
            className="no-date-input"
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="no-save-btn" onClick={handleSaveBirthdate}>Activate Oracle</button>
            <button className="no-cancel-btn" onClick={() => setShowDatePrompt(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (!numData) return null;

  return (
    <div className="numerology-widget">
      {/* Collapsed Header */}
      <div className="no-header" onClick={() => setExpanded(!expanded)}>
        <div className="no-header-left">
          <span className={`no-year-number ${numData.isHighManifestation ? 'high-manifestation' : ''}`}>
            {numData.personalYear}
          </span>
          <div className="no-header-info">
            <span className="no-label">Personal Year</span>
            <span className="no-year-name">{numData.yearName}</span>
          </div>
        </div>
        <div className="no-header-right">
          <div className="no-badges">
            <span className="no-badge no-badge-month">M{numData.personalMonth}</span>
            <span className="no-badge no-badge-day">D{numData.personalDay}</span>
          </div>
          {numData.isHighManifestation && <span className="ph-auspicious-tag">✦ high manifestation</span>}
          <span className="ph-expand-icon">{expanded ? '−' : '+'}</span>
        </div>
      </div>

      {/* Expanded Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="no-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Year Card */}
            <div className="no-year-card">
              <div className={`no-year-big ${numData.isHighManifestation ? 'high-manifestation' : ''}`}>
                {numData.personalYear}
              </div>
              <div className="no-year-details">
                <div className="no-year-title">You are in a {numData.personalYear} Personal Year</div>
                <div className="no-year-subtitle">{numData.yearName}</div>
                <div className="no-year-archetype">{numData.yearArchetype}</div>
              </div>
            </div>

            {/* Month + Day Badges */}
            <div className="no-cycle-row">
              <div className="no-cycle-card">
                <div className="no-cycle-num">{numData.personalMonth}</div>
                <div className="no-cycle-label">Personal Month</div>
              </div>
              <div className="no-cycle-card">
                <div className={`no-cycle-num ${numData.isDayHighManifestation ? 'high-manifestation' : ''}`}>{numData.personalDay}</div>
                <div className="no-cycle-label">Personal Day</div>
              </div>
            </div>

            {/* Insight */}
            <div className="no-insight">
              {insightLoading ? (
                <span className="ph-insight-loading">Channeling the numbers...</span>
              ) : insight ? (
                <span className="ph-insight-text">"{insight}"</span>
              ) : null}
            </div>

            {/* Affirmation Generator */}
            <button
              className="no-affirmation-btn"
              onClick={handleGenerateAffirmation}
              disabled={affirmationLoading}
            >
              {affirmationLoading ? '✦ Channeling...' : '✦ Generate Daily Numerology Affirmation'}
            </button>

            {affirmation && (
              <motion.div
                className="no-affirmation-text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {affirmation}
              </motion.div>
            )}

            {/* SATS Button */}
            <button
              className="ph-sats-btn"
              onClick={(e) => { e.stopPropagation(); handleStartSats(); }}
              style={{ borderColor: 'rgba(201, 169, 110, 0.3)', color: 'var(--gold)' }}
            >
              <span className="ph-sats-glyph">{numData.yearGlyph}</span>
              Start SATS with Numerology Focus
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
