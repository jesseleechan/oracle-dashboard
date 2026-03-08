import React from 'react';

export default function SynthesisEngine({ aiOutput, aiLoading, visibleCards, generateStudioInsight }) {
  return (
    <div className={`studio-block ${(aiOutput || aiLoading) ? 'expanded' : ''}`}>
      <div className="studio-header">
        <div className="section-label" style={{ marginBottom: 0, gap: '8px' }}>Studio Synthesis</div>
        <button className="generate-btn" onClick={generateStudioInsight} disabled={aiLoading || visibleCards.some(c => !c.flipped)}>
          {aiLoading ? "Synthesizing..." : (aiOutput ? "Refresh Synthesis" : "Translate to Action")}
        </button>
      </div>
      
      {aiLoading ? (
        <div className="synthesis-skeleton">
          <div className="skeleton-tag-row">
             <div className="skeleton-tag" style={{ width: '90px' }}></div>
             <div className="skeleton-tag" style={{ width: '70px' }}></div>
          </div>
          <div className="skeleton-body">
             <div className="skeleton-line" style={{ width: '90%' }}></div>
             <div className="skeleton-line" style={{ width: '100%' }}></div>
             <div className="skeleton-line" style={{ width: '85%' }}></div>
             <div className="skeleton-line" style={{ width: '60%', marginBottom: '16px' }}></div>
             <div className="skeleton-line" style={{ width: '95%' }}></div>
             <div className="skeleton-line" style={{ width: '100%' }}></div>
             <div className="skeleton-line" style={{ width: '80%' }}></div>
          </div>
        </div>
      ) : aiOutput ? (
        <>
          <div className="studio-tags">
            {aiOutput.tags && Array.isArray(aiOutput.tags) ? aiOutput.tags.map(tag => <span key={tag} className="tag">{tag}</span>) : null}
          </div>
          <div className="studio-insight" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{aiOutput.insight}</div>
        </>
      ) : null}
    </div>
  );
}
