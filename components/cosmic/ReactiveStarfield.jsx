import { useEffect, useRef } from 'react';
import { useStarfield } from './StarfieldContext';

export default function ReactiveStarfield() {
  const { velocity, hue, density, flowState, aspect } = useStarfield();
  const containerRef = useRef(null);
  const workerRef = useRef(null);
  const animRef = useRef(null);
  const flowStateRef = useRef(flowState);

  // Post flowState updates to worker without rebuilding
  useEffect(() => {
    flowStateRef.current = flowState;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'config', config: { flowState } });
    }
  }, [flowState]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return; // Do not render or animate starfield

    const container = containerRef.current;
    if (!container) return;

    // Create fresh canvas to bypass StrictMode OffscreenCanvas transfer state lock
    const canvas = document.createElement('canvas');
    canvas.className = 'starfield';
    container.appendChild(canvas);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const workerConfig = { speedMult: velocity, hue, density, flowState: flowStateRef.current };

    // --- Try OffscreenCanvas Worker ---
    if (typeof canvas.transferControlToOffscreen === 'function' && typeof Worker !== 'undefined') {
      try {
        const offscreen = canvas.transferControlToOffscreen();
        const worker = new Worker('/starfield-worker.js');
        workerRef.current = worker;

        worker.postMessage({ type: 'init', canvas: offscreen, width: w, height: h, config: workerConfig }, [offscreen]);

        const handleMouseMove = (e) => worker.postMessage({ type: 'mouse', x: e.clientX, y: e.clientY });
        const handleMouseLeave = () => worker.postMessage({ type: 'mouse', x: -1000, y: -1000 });
        const handleResize = () => worker.postMessage({ type: 'resize', width: window.innerWidth, height: window.innerHeight });

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);

        return () => {
          worker.terminate();
          workerRef.current = null;
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseleave', handleMouseLeave);
          window.removeEventListener('resize', handleResize);
          if (container.contains(canvas)) container.removeChild(canvas);
        };
      } catch (err) {
        console.warn("OffscreenCanvas failed, falling back to main thread", err);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    }

    // --- Fallback: Main Thread Rendering ---
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (container.contains(canvas)) container.removeChild(canvas);
      return; 
    }
    let cw = canvas.width = w;
    let ch = canvas.height = h;
    const speedMult = velocity;
    const isFiery = hue === "fiery";

    const renderNebulas = (ctx, w, h) => {
      ctx.globalCompositeOperation = "screen";
      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.6);
      const g2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.5);
      let c1 = "rgba(169, 185, 201, 0.03)", c2 = "rgba(154, 154, 196, 0.02)";
      if (isFiery) { c1 = "rgba(214, 106, 106, 0.03)"; c2 = "rgba(201, 110, 110, 0.02)"; }
      else if (hue === "ethereal") { c1 = "rgba(201, 169, 201, 0.03)"; c2 = "rgba(160, 140, 180, 0.02)"; }
      g1.addColorStop(0, c1); g1.addColorStop(1, "transparent");
      g2.addColorStop(0, c2); g2.addColorStop(1, "transparent");
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    };

    let stars = Array.from({ length: density }, () => ({
      x: Math.random() * cw, y: Math.random() * ch, z: Math.random(),
      r: Math.random() * 1.5 + 0.5, a: Math.random() * Math.PI * 2,
      f: Math.random() * 0.02 + 0.01, speed: (Math.random() * 0.005 + 0.001) * speedMult,
    }));

    let t = 0;
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const getNodes = (w, h) => {
      const cx = w / 2, cy = h / 2, radius = Math.min(w, h) * 0.25;
      const nodes = [{ x: cx, y: cy }];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        nodes.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
      }
      return nodes;
    };

    function draw() {
      ctx.clearRect(0, 0, cw, ch);
      renderNebulas(ctx, cw, ch);
      const nodes = getNodes(cw, ch);
      stars.forEach((s) => {
        s.y -= s.speed * 20; s.x -= Math.sin(s.a) * 0.5;
        if (s.y < -50) s.y = ch + 50;
        if (s.x < -50) s.x = cw + 50;
        if (s.x > cw + 50) s.x = -50;
        if (flowStateRef.current === "Pure Flow") {
          let cn = nodes[0], md = Infinity;
          nodes.forEach(n => { const d = Math.hypot(n.x - s.x, n.y - s.y); if (d < md) { md = d; cn = n; } });
          if (md > 40 && md < 300) { s.x += (cn.x - s.x) * 0.005; s.y += (cn.y - s.y) * 0.005; }
        }
        let dx2 = s.x, dy2 = s.y, ea = 0;
        if (mouse.x !== -1000) {
          const pF = (s.z * 0.15) + 0.02;
          dx2 -= (mouse.x - cw / 2) * pF; dy2 -= (mouse.y - ch / 2) * pF;
          const dist = Math.sqrt((mouse.x - dx2) ** 2 + (mouse.y - dy2) ** 2);
          if (dist < 250) ea = ((250 - dist) / 250) * 0.2 * s.z;
        }
        const o1 = Math.sin(t * s.f + s.a), o2 = Math.sin(t * (s.f * 1.5) + (s.a * 2));
        const alpha = Math.min(1, 0.15 + 0.4 * Math.abs(o1 * o2) + ea);
        ctx.beginPath(); ctx.arc(dx2, dy2, s.r * (0.8 + 0.5 * s.z), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${alpha})`; ctx.fill();
      });
      t += 1;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => { cw = canvas.width = window.innerWidth; ch = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, [velocity, hue, density]);

  // If reduced motion is preferred, return nothing
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: 'var(--background)' }} />;
  }

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
}
