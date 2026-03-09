"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';
import { getPersonalNumerology } from '@/lib/personalNumerology';
import { getPlanetaryHours } from '@/lib/planetaryHours';

export default function JournalPage() {
  const [tab, setTab] = useState('dream');
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?type=${filter}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Hydrate draft
  useEffect(() => {
    const draft = localStorage.getItem('journalDraft');
    if (draft) {
      const parsed = JSON.parse(draft);
      if (parsed.date === new Date().toDateString()) {
        setContent(parsed.content || '');
        setTab(parsed.tab || 'dream');
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (content) {
      localStorage.setItem('journalDraft', JSON.stringify({
        date: new Date().toDateString(), content, tab
      }));
    }
  }, [content, tab]);

  const handleSaveAndAnalyze = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      let planetaryHour = null, hermeticPrinciple = null, personalYear = null, personalMonth = null, personalDay = null;
      try { const ph = getPlanetaryHours(); planetaryHour = ph?.hours[ph?.currentIdx]?.planet; } catch {}
      try { hermeticPrinciple = getDailyPrinciple()?.name; } catch {}
      try {
        const bm = parseInt(localStorage.getItem('birthMonth'));
        const bd = parseInt(localStorage.getItem('birthDay'));
        if (bm && bd) {
          const n = getPersonalNumerology(bm, bd);
          personalYear = n?.personalYear; personalMonth = n?.personalMonth; personalDay = n?.personalDay;
        }
      } catch {}

      let assumptionText = null;
      try { const c = JSON.parse(localStorage.getItem('assumptionToday') || '{}'); if (c.date === new Date().toDateString()) assumptionText = c.text; } catch {}

      let asteroidInsight = null;
      try {
        const aData = localStorage.getItem('asteroidWhispers');
        if (aData) {
          const parsed = JSON.parse(aData);
          if (parsed.date === new Date().toDateString() && parsed.whispers?.length) {
            asteroidInsight = `${parsed.whispers[0].name} - ${parsed.whispers[0].insight}`;
          }
        }
      } catch {}

      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tab, content, analyze: true,
          planetaryHour, hermeticPrinciple, personalYear, personalMonth, personalDay, assumptionText, asteroidInsight
        })
      });
      const data = await res.json();
      if (data.entry) {
        setEntries(prev => [data.entry, ...prev]);
        setExpandedId(data.entry.id);
        setContent('');
        localStorage.removeItem('journalDraft');
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'dream', label: 'Dreams' },
    { key: 'synchronicity', label: 'Signs' }
  ];

  return (
    <div className="dashboard journal-page">
      <div className="noise" />
      <div className="content" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>

        <header className="jn-header">
          <div>
            <div className="logo">Morning <span>Whispers</span></div>
            <div className="jn-subtitle">Dreams, signs, and messages from the subconscious</div>
          </div>
          <Link href="/" className="rc-back-link">← Dashboard</Link>
        </header>

        {/* Input Area */}
        <div className="jn-input-card">
          <div className="jn-tabs">
            <button className={`jn-tab ${tab === 'dream' ? 'active' : ''}`} onClick={() => setTab('dream')}>
              🌙 I dreamed…
            </button>
            <button className={`jn-tab ${tab === 'synchronicity' ? 'active' : ''}`} onClick={() => setTab('synchronicity')}>
              ✦ I saw a sign…
            </button>
          </div>

          <textarea
            className="jn-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={tab === 'dream'
              ? "Describe what you experienced in the dream. Include feelings, symbols, people, and places…"
              : "What sign did you see? Repeating numbers, unexpected encounters, meaningful coincidences…"
            }
          />

          <button
            className="jn-analyze-btn"
            onClick={handleSaveAndAnalyze}
            disabled={saving || !content.trim()}
          >
            {saving ? '✦ The ether is interpreting…' : '✦ Save & Receive Archetypal Analysis'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="jn-filters">
          {filters.map(f => (
            <button key={f.key} className={`rc-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="jn-entries">
          {loading ? (
            <div className="rc-loading">Gathering whispers from the dreamscape…</div>
          ) : entries.length === 0 ? (
            <div className="rc-empty">No entries yet. Record your first dream or sign above.</div>
          ) : (
            entries.map(entry => (
              <div
                key={entry.id}
                className={`jn-entry ${expandedId === entry.id ? 'expanded' : ''}`}
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className="jn-entry-header">
                  <div className="jn-entry-left">
                    <span className="jn-entry-icon">{entry.type === 'dream' ? '🌙' : '✦'}</span>
                    <div>
                      <div className="jn-entry-date">{entry.date}</div>
                      <div className="jn-entry-preview">{entry.content.substring(0, 100)}{entry.content.length > 100 ? '…' : ''}</div>
                    </div>
                  </div>
                  <span className="jn-entry-type">{entry.type}</span>
                </div>

                <AnimatePresence>
                  {expandedId === entry.id && (
                    <motion.div
                      className="jn-entry-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="jn-entry-content">{entry.content}</div>
                      {entry.geminiAnalysis && (
                        <div className="jn-analysis">
                          <div className="jn-analysis-label">Archetypal Analysis</div>
                          <div className="jn-analysis-text">{entry.geminiAnalysis}</div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
