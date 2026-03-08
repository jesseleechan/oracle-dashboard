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
    try {
      const numRes = await fetch('/api/numerology');
      const numData = await numRes.json();
      setNumerology(numData);

      setTransitLoading(true);
      const astRes = await fetch('/api/astrology');
      const astData = await astRes.json();
      setTransitData(astData);
    } catch (e) {
      console.error(e);
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
