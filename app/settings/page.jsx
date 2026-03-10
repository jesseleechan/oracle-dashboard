"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [starfieldDensity, setStarfieldDensity] = useState('Medium');
  const [breathingPattern, setBreathingPattern] = useState('4-7-8');
  const [geminiSuffix, setGeminiSuffix] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [showAsteroidWhisperer, setShowAsteroidWhisperer] = useState('true');
  const [showAncientStars, setShowAncientStars] = useState('true');
  const [showPatternOracle, setShowPatternOracle] = useState('true');

  useEffect(() => {
    // Hydrate from localStorage
    const density = localStorage.getItem('starfieldDensity');
    const pattern = localStorage.getItem('breathingPattern');
    const suffix = localStorage.getItem('geminiSuffix');
    const key = localStorage.getItem('customApiKey');
    const asteroids = localStorage.getItem('showAsteroidWhisperer');
    const ancientStars = localStorage.getItem('showAncientStars');
    const oracle = localStorage.getItem('showPatternOracle');

    if (density) setStarfieldDensity(density);
    if (pattern) setBreathingPattern(pattern);
    if (suffix) setGeminiSuffix(suffix);
    if (key) setApiKey(key);
    if (asteroids) setShowAsteroidWhisperer(asteroids);
    if (ancientStars) setShowAncientStars(ancientStars);
    if (oracle) setShowPatternOracle(oracle);

    // Birthdate
    const bm = localStorage.getItem('birthMonth');
    const bd = localStorage.getItem('birthDay');
    const by = localStorage.getItem('birthYear');
    if (bm && bd && by) {
      setBirthdate(`${by}-${String(bm).padStart(2,'0')}-${String(bd).padStart(2,'0')}`);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('starfieldDensity', starfieldDensity);
    localStorage.setItem('breathingPattern', breathingPattern);
    localStorage.setItem('geminiSuffix', geminiSuffix);
    localStorage.setItem('customApiKey', apiKey);
    localStorage.setItem('showAsteroidWhisperer', showAsteroidWhisperer);
    localStorage.setItem('showAncientStars', showAncientStars);
    localStorage.setItem('showPatternOracle', showPatternOracle);

    // Save birthdate parts
    if (birthdate) {
      const parts = birthdate.split('-');
      if (parts.length === 3) {
        localStorage.setItem('birthYear', parseInt(parts[0]));
        localStorage.setItem('birthMonth', parseInt(parts[1]));
        localStorage.setItem('birthDay', parseInt(parts[2]));
      }
    }

    alert('Settings Saved to the Ether.');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error("Failed to export logs");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mundane-state-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
      alert('Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const text = await file.text();
      const logs = JSON.parse(text);
      
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      });
      
      if (!res.ok) throw new Error("Failed to map logs to DB");
      alert("Timeline Restored Successfully.");
      
    } catch (err) {
      console.error(err);
      alert('Import failed. Invalid JSON or Database Error.');
    } finally {
      setIsImporting(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className="dashboard" style={{ minHeight: '100vh', padding: '32px' }}>
      <div className="noise" />
      <div className="content" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
        
        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="logo">Mundane <span>Settings</span></div>
          </div>
          <Link href="/" style={{ fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ← Return to Dashboard
          </Link>
        </header>

        <section className="section">
          <div className="section-label">Aesthetics & Immersion</div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '4px', marginBottom: '32px' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Starfield Density</label>
              <select 
                value={starfieldDensity} 
                onChange={e => setStarfieldDensity(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px' }}
              >
                <option value="Low">Low (Better Performance)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="High">High (Deep Immersion)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>SATS Breathing Overlay Pattern</label>
              <select 
                value={breathingPattern} 
                onChange={e => setBreathingPattern(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px' }}
              >
                <option value="4-7-8">Neville 4-7-8 (Deep Reset)</option>
                <option value="Box">Box Breathing (Symmetrical)</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Asteroid Whisperer (Chiron, Lilith, Juno, etc.)</label>
              <select 
                value={showAsteroidWhisperer} 
                onChange={e => setShowAsteroidWhisperer(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px' }}
              >
                <option value="true">Enabled (Whispers in Cosmic Baseline)</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Fixed Stars & Lunar Mansions</label>
              <select 
                value={showAncientStars} 
                onChange={e => setShowAncientStars(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px' }}
              >
                <option value="true">Enabled (Stellar Alignments in Baseline)</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Pattern Oracle Integration</label>
              <select 
                value={showPatternOracle} 
                onChange={e => setShowPatternOracle(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px' }}
              >
                <option value="true">Enabled (Weaving saved patterns into daily flow)</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Birth Date (for Personal Numerology Oracle)</label>
              <input 
                type="date"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
                style={{ width: '200px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px', colorScheme: 'dark' }}
              />
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '12px', color: 'var(--dim)', marginTop: '6px', fontStyle: 'italic' }}>Used to compute your Personal Year, Month, and Day cycles. Stored locally only.</div>
            </div>

          </div>
        </section>

        <section className="section">
          <div className="section-label">Oracle AI Configurations</div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '24px', borderRadius: '4px', marginBottom: '32px' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Custom Gemini Prompt Suffix</label>
              <textarea 
                value={geminiSuffix} 
                onChange={e => setGeminiSuffix(e.target.value)}
                placeholder="Append custom directives to the Oracle (e.g. 'Focus heavily on financial abundance and strictly ignore romantic advice.')"
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', fontFamily: 'inherit', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Custom API Key (Optional Override)</label>
              <input 
                type="password"
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)}
                placeholder="Leave blank to use default .env mapping"
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: 'Inconsolata', fontSize: '12px', letterSpacing: '0.1em' }}
              />
            </div>

          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <button className="generate-btn" onClick={saveSettings} style={{ width: '200px' }}>Save Parameters</button>
        </div>

        <section className="section">
          <div className="section-label" style={{ color: 'var(--muted)' }}>Data Continuity</div>
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inconsolata', fontSize: '12px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Export Timeline</div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '14px', color: 'var(--muted)' }}>Download a full SQLite JSON raw blob.</div>
            </div>
            <button className="toggle-btn" onClick={handleExportData} disabled={isExporting} style={{ padding: '6px 16px', fontSize: '11px' }}>
              {isExporting ? "Exporting..." : "Download JSON"}
            </button>
            
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inconsolata', fontSize: '12px', color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Restore Timeline</div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '14px', color: 'var(--rose)', opacity: 0.6 }}>Warning: Overwrites duplicate timeline markers natively.</div>
            </div>
            
            <label className="toggle-btn" style={{ padding: '6px 16px', fontSize: '11px', cursor: 'pointer', textAlign: 'center' }}>
              {isImporting ? "Restoring..." : "Upload JSON"}
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportData} 
                disabled={isImporting}
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </section>
        
      </div>
    </div>
  );
}
