// starfield-worker.js - OffscreenCanvas Web Worker for particle physics
// Receives the offscreen canvas and config, runs the full animation loop off main thread.

let canvas, ctx;
let cw, ch;
let stars = [];
let t = 0;
let mouse = { x: -1000, y: -1000 };
let config = { speedMult: 1, hue: "neutral", density: 200, flowState: "Flow" };

function getNebulaColors() {
  if (config.hue === "fiery") {
    return { c1: "rgba(214, 106, 106, 0.03)", c2: "rgba(201, 110, 110, 0.02)" };
  } else if (config.hue === "ethereal") {
    return { c1: "rgba(201, 169, 201, 0.03)", c2: "rgba(160, 140, 180, 0.02)" };
  }
  return { c1: "rgba(169, 185, 201, 0.03)", c2: "rgba(154, 154, 196, 0.02)" };
}

function renderNebulas() {
  ctx.globalCompositeOperation = "screen";
  const { c1, c2 } = getNebulaColors();

  const g1 = ctx.createRadialGradient(cw * 0.2, ch * 0.3, 0, cw * 0.2, ch * 0.3, cw * 0.6);
  g1.addColorStop(0, c1);
  g1.addColorStop(1, "transparent");

  const g2 = ctx.createRadialGradient(cw * 0.8, ch * 0.7, 0, cw * 0.8, ch * 0.7, cw * 0.5);
  g2.addColorStop(0, c2);
  g2.addColorStop(1, "transparent");

  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = "source-over";
}

function getNodes() {
  const cx = cw / 2;
  const cy = ch / 2;
  const radius = Math.min(cw, ch) * 0.25;
  const nodes = [{ x: cx, y: cy }];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    nodes.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return nodes;
}

function initStars() {
  stars = Array.from({ length: config.density }, () => ({
    x: Math.random() * cw,
    y: Math.random() * ch,
    z: Math.random(),
    r: Math.random() * 1.5 + 0.5,
    a: Math.random() * Math.PI * 2,
    f: Math.random() * 0.02 + 0.01,
    speed: (Math.random() * 0.005 + 0.001) * config.speedMult,
  }));
}

function draw() {
  ctx.clearRect(0, 0, cw, ch);
  renderNebulas();
  const nodes = getNodes();

  stars.forEach((s) => {
    s.y -= s.speed * 20;
    s.x -= Math.sin(s.a) * 0.5;
    if (s.y < -50) s.y = ch + 50;
    if (s.x < -50) s.x = cw + 50;
    if (s.x > cw + 50) s.x = -50;

    if (config.flowState === "Pure Flow") {
      let closestNode = nodes[0];
      let minDist = Infinity;
      nodes.forEach(n => {
        const d = Math.hypot(n.x - s.x, n.y - s.y);
        if (d < minDist) { minDist = d; closestNode = n; }
      });
      if (minDist > 40 && minDist < 300) {
        s.x += (closestNode.x - s.x) * 0.005;
        s.y += (closestNode.y - s.y) * 0.005;
      }
    }

    let drawX = s.x;
    let drawY = s.y;
    let extraAlpha = 0;

    if (mouse.x !== -1000 && mouse.y !== -1000) {
      const cx = cw / 2;
      const cy = ch / 2;
      const pForce = (s.z * 0.15) + 0.02;
      drawX -= (mouse.x - cx) * pForce;
      drawY -= (mouse.y - cy) * pForce;

      const dx = mouse.x - drawX;
      const dy = mouse.y - drawY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250) {
        extraAlpha = ((250 - dist) / 250) * 0.2 * s.z;
      }
    }

    const osc1 = Math.sin(t * s.f + s.a);
    const osc2 = Math.sin(t * (s.f * 1.5) + (s.a * 2));
    const baseAlpha = 0.15 + 0.4 * Math.abs(osc1 * osc2);
    const alpha = Math.min(1, baseAlpha + extraAlpha);

    ctx.beginPath();
    ctx.arc(drawX, drawY, s.r * (0.8 + 0.5 * s.z), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(201,169,110,${alpha})`;
    ctx.fill();
  });

  t += 1;
  requestAnimationFrame(draw);
}

self.onmessage = function (e) {
  const msg = e.data;

  if (msg.type === "init") {
    canvas = msg.canvas;
    ctx = canvas.getContext("2d");
    cw = canvas.width = msg.width;
    ch = canvas.height = msg.height;
    config = { ...config, ...msg.config };
    initStars();
    draw();
  }

  if (msg.type === "resize") {
    cw = canvas.width = msg.width;
    ch = canvas.height = msg.height;
  }

  if (msg.type === "mouse") {
    mouse = { x: msg.x, y: msg.y };
  }

  if (msg.type === "config") {
    const needsReinit = msg.config.density !== config.density || msg.config.speedMult !== config.speedMult;
    config = { ...config, ...msg.config };
    if (needsReinit) initStars();
  }
};
