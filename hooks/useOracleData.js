import { useState, useEffect } from 'react';

export function useOracleData() {
  const [numerology, setNumerology] = useState({ universalDay: "?" });
  const [transitData, setTransitData] = useState(null);
  const [transitLoading, setTransitLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCards(3);
    fetchData();
  }, []);

  async function fetchData() {
    setTransitLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const numRes = await fetch('/api/numerology', { signal: controller.signal });
      const numData = await numRes.json();
      
      const astRes = await fetch('/api/astrology', { signal: controller.signal });
      const astData = await astRes.json();
      
      clearTimeout(timeoutId);
      
      setNumerology(numData);
      setTransitData(astData);
      
      // Cache the successful fetch payload for offline use
      localStorage.setItem('cachedCosmicState', JSON.stringify({ numerology: numData, transit: astData }));
      
    } catch (e) {
      console.warn("API Fetch failed, attempting offline cache fallback.", e);
      const cached = localStorage.getItem('cachedCosmicState');
      if (cached) {
         const parsed = JSON.parse(cached);
         setNumerology(parsed.numerology);
         setTransitData(parsed.transit);
      } else {
         // Failsafe empty state
         setNumerology({ universalDay: "?" });
         setTransitData({ transit: { aspect: "Cosmic Static (Offline)", synthesis: "Connection lost to the Oracle." }});
      }
    } finally {
      setTransitLoading(false);
    }
  }

  async function fetchCards(count) {
    try {
      const res = await fetch(`/api/tarot?count=${count}`);
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error(err);
    }
  }

  return {
    numerology,
    transitData,
    transitLoading,
    cards,
    setCards,
    fetchCards
  };
}
