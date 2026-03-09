import React from 'react';
import { motion } from 'framer-motion';

const CardBack = () => (
  <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <rect width="120" height="200" rx="8" fill="#0e0e1a" stroke="#c9a96e" strokeWidth="1.2" />
    <rect x="8" y="8" width="104" height="184" rx="5" fill="none" stroke="#c9a96e" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.5" />
    <circle cx="60" cy="100" r="32" fill="none" stroke="#c9a96e" strokeWidth="0.8" opacity="0.6" />
    <circle cx="60" cy="100" r="20" fill="none" stroke="#c9a96e" strokeWidth="0.4" opacity="0.4" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <line key={i}
        x1={60 + 20 * Math.cos((deg * Math.PI) / 180)}
        y1={100 + 20 * Math.sin((deg * Math.PI) / 180)}
        x2={60 + 32 * Math.cos((deg * Math.PI) / 180)}
        y2={100 + 32 * Math.sin((deg * Math.PI) / 180)}
        stroke="#c9a96e" strokeWidth="0.6" opacity="0.5"
      />
    ))}
    <text x="60" y="55" textAnchor="middle" fill="#c9a96e" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
    <text x="60" y="155" textAnchor="middle" fill="#c9a96e" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
  </svg>
);

const CardFace = ({ card }) => (
  <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <rect width="120" height="200" rx="8" fill="#13101f" stroke="#c9a96e" strokeWidth="1.2" />
    <rect x="6" y="6" width="108" height="188" rx="5" fill="none" stroke="#c9a96e" strokeWidth="0.5" opacity="0.4" />
    <text x="60" y="32" textAnchor="middle" fill="#c9a96e" fontSize="9" fontFamily="serif" opacity="0.7">{card.num}</text>
    <text x="60" y="115" textAnchor="middle" fill="#c9a96e" fontSize="28" fontFamily="serif">
      {card.num === "0" ? "☽" : card.num === "I" ? "☿" : card.num === "II" ? "☽" : card.num === "III" ? "♀" :
        card.num === "IV" ? "♂" : card.num === "V" ? "♃" : card.num === "VI" ? "♀" :
          card.num === "VII" ? "♂" : card.num === "VIII" ? "☀" : card.num === "IX" ? "☿" :
            card.num === "X" ? "♃" : card.num === "XI" ? "♎" : card.num === "XII" ? "♆" :
              card.num === "XIII" ? "♏" : card.num === "XIV" ? "♐" : card.num === "XV" ? "♑" :
                card.num === "XVI" ? "♂" : card.num === "XVII" ? "♒" : card.num === "XVIII" ? "☽" :
                  card.num === "XIX" ? "☀" : card.num === "XX" ? "♇" : "✦"}
    </text>
    
    <g className="card-reveal-name-group">
      <text x="60" y="148" textAnchor="middle" fill="#e8dfc8" fontSize="8.5" fontFamily="serif" fontWeight="500">{card.name}</text>
      <line x1="20" y1="155" x2="100" y2="155" stroke="#c9a96e" strokeWidth="0.5" opacity="0.5" />
    </g>
    
    <g className="card-reveal-keywords-group">
      {card.keywords.split(" · ").map((kw, i) => (
        <text key={i} x="60" y={166 + i * 10} textAnchor="middle" fill="#c9a96e" fontSize="6.5" fontFamily="serif" opacity="0.7">{kw}</text>
      ))}
    </g>
  </svg>
);

const SPREAD_LABELS = ["Current State", "Friction", "The Anchor"];

export default function TarotStage({ spreadMode, setSpreadMode, visibleCards, fetchCards, flipCard, reshuffle, isRedrawing }) {
  return (
    <section className="section">
      <div className="section-label">The Oracle</div>
      <div className="oracle-toggle">
        <button className={`toggle-btn ${spreadMode === 'daily' ? 'active' : ''}`} onClick={() => { setSpreadMode('daily'); fetchCards(1); }}>Daily Draw</button>
        <button className={`toggle-btn ${spreadMode === 'three' ? 'active' : ''}`} onClick={() => { setSpreadMode('three'); fetchCards(3); }}>Three Card</button>
      </div>

      <div className="card-stage">
        {visibleCards.map((card, i) => {
          const isCups = card.name.includes("Cups");
          const isWands = card.name.includes("Wands");
          
          return (
            <motion.div
              key={i}
              className={`card-slot ${card.flipped ? 'flipped-wrapper' : ''}`}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: 'easeOut' }}
            >
              <div 
                className={`card-wrapper ${isRedrawing ? 'fast-fly-back' : ''}`} 
                onClick={() => flipCard(i)}
              >
                <div className={`card-inner ${card.flipped ? 'flipped' : ''} ${card.isReversed ? 'is-reversed' : ''}`}>
                  <div className="card-back-side"><CardBack /></div>
                  <div className="card-face">
                    <div className="card-face-glare"></div>
                    {isCups && card.flipped && <div className="pip-fx water" />}
                    {isWands && card.flipped && <div className="pip-fx ember" />}
                    
                    <div className="card-svg-container" style={{ transform: card.isReversed ? 'rotateY(180deg) rotateZ(180deg)' : 'rotateY(180deg)', width: '100%', height: '100%' }}>
                      <CardFace card={card} />
                    </div>
                  </div>
                </div>
              </div>
              {spreadMode === 'three' && <div className="card-slot-label">{SPREAD_LABELS[i]}</div>}
            </motion.div>
          );
        })}
      </div>
      
      {visibleCards.length === 1 && visibleCards[0].flipped && (
         <div className="card-reveal">
           <div className="card-reveal-name">{visibleCards[0].name}</div>
           <div className="card-reveal-keys">{visibleCards[0].keywords}</div>
         </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button className="reshuffle-btn" onClick={reshuffle}>Reshuffle Matrix</button>
        <button className="reshuffle-btn" onClick={reshuffle} style={{ borderColor: 'rgba(214,106,106,0.3)', color: 'rgba(214,106,106,0.8)' }}>Redo Draw</button>
      </div>
    </section>
  );
}
