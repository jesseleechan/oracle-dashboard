import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyPrinciple } from '@/lib/hermeticPrinciples';
import { getPlanetaryHours } from '@/lib/planetaryHours';
import { getPersonalNumerology } from '@/lib/personalNumerology';

const SENSES = [
  { key: 'smell', emoji: '🌹', label: 'Smell the roses…', color: '#e8b4b8' },
  { key: 'touch', emoji: '✋', label: 'Feel the silk sheets…', color: '#c9a96e' },
  { key: 'hearing', emoji: '👂', label: 'Hear the congratulations…', color: '#a9c9b9' },
  { key: 'taste', emoji: '🍷', label: 'Taste the victory wine…', color: '#c9a9c9' },
  { key: 'sight', emoji: '👁', label: 'See the golden light…', color: '#c9a96e' }
];

const PLANET_SENSE_MAP = {
  'Venus': 'touch', 'Jupiter': 'sight', 'Mars': 'hearing',
  'Sun': 'sight', 'Mercury': 'hearing', 'Moon': 'smell', 'Saturn': 'touch'
};

export default function SatsOverlay({ satsMode, setSatsMode, scene, flowState }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [breathingPattern, setBreathingPattern] = useState("4-7-8");
  const [sensoryText, setSensoryText] = useState(null);
  const [sensoryLoading, setSensoryLoading] = useState(null);
  const [suggestedSense, setSuggestedSense] = useState(null);
  const [showSensory, setShowSensory] = useState(false);
  const audioRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    const override = localStorage.getItem('breathingPattern');
    if (override) setBreathingPattern(override);

    // Determine suggested sense from planetary hour
    try {
      const ph = getPlanetaryHours();
      if (ph && ph.currentIdx >= 0) {
        const planet = ph.hours[ph.currentIdx].planet;
        setSuggestedSense(PLANET_SENSE_MAP[planet] || 'sight');
      }
    } catch {}
  }, [satsMode]);

  // Typewriter effect for main scene
  useEffect(() => {
    if (satsMode && scene) {
      setDisplayedText("");
      setIsTyping(true);
      setSensoryText(null);
      setShowSensory(false);
      let currentIndex = 0;
      const textToType = scene;
      
      typingRef.current = setInterval(() => {
        if (currentIndex < textToType.length) {
           setDisplayedText(textToType.slice(0, currentIndex + 1));
           currentIndex++;
        } else {
          clearInterval(typingRef.current);
          setIsTyping(false);
        }
      }, 45);

      return () => clearInterval(typingRef.current);
    } else {
      setDisplayedText("");
      setSessionTime(0);
    }
  }, [satsMode, scene]);

  // Session timer
  useEffect(() => {
    let timer;
    if (satsMode) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(timer);
  }, [satsMode]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && satsMode) setSatsMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [satsMode, setSatsMode]);

  // Audio
  useEffect(() => {
    if (audioRef.current) {
      if (satsMode && !isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted, satsMode]);

  if (!satsMode) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isPureFlow = flowState === "Pure Flow";
  
  const getBreathingClass = () => {
    if (breathingPattern === "Disabled") return "";
    if (breathingPattern === "Box" && isPureFlow) return "is-pure-flow box-breathing";
    if (isPureFlow) return "is-pure-flow";
    return "";
  };

  const handleSensoryClick = async (senseKey) => {
    if (sensoryLoading) return;
    setSensoryLoading(senseKey);
    setSensoryText(null);
    setShowSensory(true);

    // Check cache
    const cacheKey = `sensory_${senseKey}_${scene?.substring(0, 50)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setSensoryText(cached);
      setSensoryLoading(null);
      return;
    }

    try {
      let planetaryHour = null;
      let hermeticPrinciple = null;
      try { const ph = getPlanetaryHours(); planetaryHour = ph?.hours[ph?.currentIdx]?.planet; } catch {}
      try { hermeticPrinciple = getDailyPrinciple()?.name; } catch {}

      const res = await fetch('/api/sensory-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: scene || '',
          sense: senseKey,
          planetaryHour,
          hermeticPrinciple,
          personalYear: (() => {
            try {
              const bm = parseInt(localStorage.getItem('birthMonth'));
              const bd = parseInt(localStorage.getItem('birthDay'));
              return (bm && bd) ? getPersonalNumerology(bm, bd)?.personalYear : null;
            } catch { return null; }
          })()
        })
      });
      const data = await res.json();
      const text = data.sensoryText || '';
      setSensoryText(text);
      localStorage.setItem(cacheKey, text);
    } catch (e) {
      setSensoryText("Every sense confirms this is real. I rest in it.");
    } finally {
      setSensoryLoading(null);
    }
  };

  const activeSenseColor = sensoryLoading
    ? SENSES.find(s => s.key === sensoryLoading)?.color
    : null;

  return (
    <motion.div 
      className={`sats-overlay ${getBreathingClass()}`} 
      onClick={() => setSatsMode(false)}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="sats-header" onClick={(e) => e.stopPropagation()}>
        <div className="sats-timer">Session: {formatTime(sessionTime)}</div>
        <div className="sats-audio-toggle" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </div>
      </div>
      
      <div className={`sats-text-container ${!isTyping ? 'float-up' : ''}`}>
        <div className="sats-text">
          {displayedText}
          <span className={`typewriter-cursor ${!isTyping ? 'hidden' : ''}`}>&nbsp;</span>
        </div>

        {/* Sensory Expansion Display */}
        <AnimatePresence>
          {showSensory && (
            <motion.div
              className="sensory-result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {sensoryLoading ? (
                <div className="sensory-loading">✦ Expanding {SENSES.find(s => s.key === sensoryLoading)?.label.split('…')[0]}…</div>
              ) : sensoryText ? (
                <div className="sensory-text sats-breathe">{sensoryText}</div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sensory Buttons */}
      <div className="sensory-toolbar" onClick={(e) => e.stopPropagation()}>
        {suggestedSense && (
          <div className="sensory-suggest">
            ✦ suggested: {SENSES.find(s => s.key === suggestedSense)?.label.split('…')[0]}
          </div>
        )}
        <div className="sensory-buttons">
          {SENSES.map(sense => (
            <button
              key={sense.key}
              className={`sensory-btn ${sensoryLoading === sense.key ? 'loading' : ''} ${suggestedSense === sense.key ? 'suggested' : ''}`}
              onClick={() => handleSensoryClick(sense.key)}
              disabled={!!sensoryLoading}
              style={{ '--sense-color': sense.color }}
              title={sense.label}
            >
              <span className="sensory-emoji">{sense.emoji}</span>
              <span className="sensory-btn-label">{sense.label}</span>
            </button>
          ))}
        </div>
      </div>

      <audio 
        ref={audioRef}
        src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Binaural_Beat_8Hz_200Hz_208Hz.ogg" 
        loop
        preload="auto"
      />
    </motion.div>
  );
}
