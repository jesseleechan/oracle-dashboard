import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AncientStars({ transitHue }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeature, setShowFeature] = useState(false);

  useEffect(() => {
    // Check settings
    try {
      const stored = localStorage.getItem('showAncientStars');
      if (stored === 'false') {
        setShowFeature(false);
        setLoading(false);
        return;
      }
      setShowFeature(true);
    } catch {}

    const fetchData = async () => {
      try {
        const today = new Date().toDateString();
        const cached = localStorage.getItem('ancientStars');
        
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.date === today && parsed.data) {
            setData(parsed.data);
            setLoading(false);
            return;
          }
        }

        const res = await fetch('/api/ancient-stars', { method: 'POST' });
        const freshData = await res.json();
        
        if (freshData.insight) {
          setData(freshData);
          localStorage.setItem('ancientStars', JSON.stringify({
            date: today,
            data: freshData
          }));
        }
      } catch (e) {
        console.error("Ancient stars fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!showFeature) return null;

  return (
    <div className="asteroid-whispers-container" style={{ borderTop: 'none', paddingTop: '0', marginTop: '1rem' }}>
      
      <div className="asteroid-header">
        <span style={{ fontSize: '14px', color: 'var(--transit-hue, var(--gold))' }}>✨</span>
        Ancient Stars
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="asteroid-loading"
          >
            ✧ Tuning to the silver frequency…
          </motion.div>
        ) : data ? (
          <motion.div 
            className="asteroid-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Lunar Mansion */}
            <div className="asteroid-card" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="asteroid-title-row">
                <span className="asteroid-symbol">☾</span>
                <span className="asteroid-name">{data.mansion?.name}</span>
                <span className="asteroid-transit">Lunar Mansion</span>
                <span className="sats-potent-tag" style={{ background: 'transparent', color: 'var(--dim)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {data.mansion?.keyword}
                </span>
              </div>
            </div>

            {/* Fixed Stars */}
            {data.stars?.length > 0 && data.stars.map((star, idx) => (
              <div key={idx} className="asteroid-card" style={{ '--gold': transitHue || 'var(--gold)' }}>
                <div className="asteroid-title-row">
                  <span className="asteroid-symbol" style={{ animation: 'pulseFade 3s infinite', color: 'var(--transit-hue, var(--gold))' }}>✦</span>
                  <span className="asteroid-name">{star.name}</span>
                  <span className="asteroid-transit">{star.aspect}</span>
                  {star.potency && (
                    <span className="sats-potent-tag" style={{ color: 'var(--transit-hue, var(--gold))', background: 'rgba(201, 169, 110, 0.1)', animation: 'none' }}>
                      Royal Star
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Insight */}
            <div className="asteroid-insight" style={{ marginTop: '8px', paddingLeft: '0', borderLeft: '2px solid var(--transit-hue, var(--gold))', paddingLeft: '12px' }}>
              {data.insight}
            </div>

          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
