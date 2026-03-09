import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SatsOverlay({ satsMode, setSatsMode, scene, flowState }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [breathingPattern, setBreathingPattern] = useState("4-7-8");
  const audioRef = useRef(null);

  useEffect(() => {
    const override = localStorage.getItem('breathingPattern');
    if (override) setBreathingPattern(override);
  }, [satsMode]);

  // Typewriter effect
  useEffect(() => {
    if (satsMode && scene) {
      setDisplayedText("");
      setIsTyping(true);
      let currentIndex = 0;
      const textToType = scene;
      
      const interval = setInterval(() => {
        if (currentIndex < textToType.length) {
           setDisplayedText(textToType.slice(0, currentIndex + 1));
           currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 45); // Adjust typing speed here

      return () => clearInterval(interval);
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

  // Escape key listener for fast dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && satsMode) {
        setSatsMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [satsMode, setSatsMode]);

  // Audio syncer
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
