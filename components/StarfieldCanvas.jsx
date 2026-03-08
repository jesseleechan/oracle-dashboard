import { useEffect, useRef } from 'react';

export default function StarfieldCanvas({ transitData }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isEthereal = transitData?.transit?.aspect?.toLowerCase().includes("neptune") || transitData?.transit?.aspect?.toLowerCase().includes("moon");
    const speedMult = isEthereal ? 0.3 : 1;

    let stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      a: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.003 + 0.001) * speedMult,
    }));
    
    let t = 0;
    
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        let drawX = s.x;
        let drawY = s.y;
        let extraAlpha = 0;
        
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 250;
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            extraAlpha = force * 0.15;
            drawX += dx * force * 0.06;
            drawY += dy * force * 0.06;
          }
        }

        const baseAlpha = 0.2 + 0.5 * Math.abs(Math.sin(t * s.speed + s.a));
        const alpha = Math.min(1, baseAlpha + extraAlpha);
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${alpha})`;
        ctx.fill();
      });
      t += 1;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { 
      cancelAnimationFrame(animRef.current); 
      window.removeEventListener("resize", resize); 
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [transitData]);

  return <canvas ref={canvasRef} className="starfield" />;
}
