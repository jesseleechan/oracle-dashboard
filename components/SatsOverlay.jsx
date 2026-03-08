export default function SatsOverlay({ satsMode, setSatsMode, scene }) {
  if (!satsMode) return null;

  return (
    <div 
      className="sats-overlay flex-center" 
      onClick={() => setSatsMode(false)}
    >
      <div className="sats-text">
        {scene || "No scene anchored."}
      </div>
    </div>
  );
}
