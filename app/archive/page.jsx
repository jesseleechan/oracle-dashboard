import Link from 'next/link';
import { prisma } from '@/lib/db';

export const metadata = { title: "Mundane State | Log Archive" };

export default async function ArchivePage() {
  const logs = await prisma.log.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Calculate the last 60 days for the heatmap
  const DAYS = 60;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const calendarDays = Array.from({ length: DAYS }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const dateStr = d.toLocaleDateString();
    // Find if a log matches this date string (naive matching relies on the stored string)
    const logForDay = logs.find(l => l.date === dateStr);
    return {
      date: dateStr,
      flowState: logForDay?.flowState || null,
    };
  });

  const getHeatmapColor = (state) => {
    if (state === "Pure Flow") return "var(--gold)";
    if (state === "Neutral") return "var(--rose)";
    if (state === "High Friction") return "#4a4760"; // dim
    return "rgba(255,255,255,0.05)"; // empty
  };

  return (
    <div className="dashboard" style={{ minHeight: '100vh', padding: '32px' }}>
      <div className="noise" />
      <div className="content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        
        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="logo">Mundane <span>Archive</span></div>
          </div>
          <Link href="/" style={{ fontFamily: 'Inconsolata', fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ← Return to Dashboard
          </Link>
        </header>

        <section className="section">
          <div className="section-label">Flow State Heatmap (Last 60 Days)</div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', 
            padding: '24px', borderRadius: '2px', display: 'flex', 
            flexWrap: 'wrap', gap: '6px', marginBottom: '40px'
          }}>
            {calendarDays.map((day, idx) => (
              <div 
                key={idx} 
                className="heatmap-cell"
                title={`${day.date}${day.flowState ? ` - ${day.flowState}` : ''}`}
                style={{
                  width: '14px', height: '14px', borderRadius: '2px',
                  backgroundColor: getHeatmapColor(day.flowState),
                  transition: 'transform 0.2s', cursor: 'pointer'
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'Inconsolata', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: 'var(--gold)' }} /> Pure Flow</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: 'var(--rose)' }} /> Neutral</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: '#4a4760' }} /> High Friction</span>
          </div>
        </section>

        <section className="section">
          <div className="section-label">Historical Logs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No scenes anchored yet.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${getHeatmapColor(log.flowState)}`,
                  padding: '24px', borderRadius: '2px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontFamily: 'Inconsolata', fontSize: '10px', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    <span>{log.date}</span>
                    <span>Universal Day {log.universalDay}</span>
                  </div>
                  {log.transitAspect && (
                    <div style={{ color: 'var(--rose)', fontSize: '11px', fontFamily: 'Inconsolata', marginBottom: '12px', letterSpacing: '0.1em' }}>
                      {log.transitAspect}
                    </div>
                  )}
                  {log.tarotCards && (
                    <div style={{ color: 'var(--gold)', fontSize: '11px', fontFamily: 'Inconsolata', marginBottom: '16px', letterSpacing: '0.1em' }}>
                      DRAW: {log.tarotCards}
                    </div>
                  )}
                  <div style={{
                    color: 'var(--text)', fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '16px', lineHeight: '1.6', letterSpacing: '0.02em',
                    fontStyle: 'italic', fontWeight: 300, whiteSpace: 'pre-wrap'
                  }}>
                    "{log.scene}"
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
