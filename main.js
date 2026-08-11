/* ─────────────────────────────────────────────────────────────
   波風ミナト — 黄色い閃光 (Minato Namikaze - Yellow Flash)
   Canvas Animation Engine & Particle Physics Loop
   ───────────────────────────────────────────────────────────── */

/* ───────────────────────── Helpers ───────────────────────── */
const pad   = n => String(n).padStart(3, '0');
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rand  = (a, b) => a + Math.random() * (b - a);

/* Fade in over [a,b], hold over [b,c], fade out over [c,d] */
const window4 = (p, a, b, c, d) =>
  p < a || p > d ? 0 : p < b ? (p - a) / (b - a) : p > c ? 1 - (p - c) / (d - c) : 1;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  return { width: rect.width, height: rect.height, dpr };
}

/* ──────────────────────── Canvas Setup ──────────────────────── */
const canvas = document.getElementById('minato-canvas');
const ctx = canvas.getContext('2d');

let bounds = fitCanvas(canvas);

window.addEventListener('resize', () => {
  bounds = fitCanvas(canvas);
  initParticles();
});

/* ──────────────── Pointer & Scroll Tracking ──────────────── */
const pointer = {
  x: bounds.width / 2,
  y: bounds.height / 2,
  targetX: bounds.width / 2,
  targetY: bounds.height / 2,
  trail: []
};

window.addEventListener('pointermove', (e) => {
  pointer.targetX = e.clientX;
  pointer.targetY = e.clientY;
});

let scrollProgress = 0;
function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0;
}
window.addEventListener('scroll', updateScroll);

/* ──────────────── Particle System Setup ──────────────── */
const PARTICLE_COUNT = reduceMotion ? 40 : (coarse ? 120 : 250);
let particles = [];

class Particle {
  constructor(w, h) {
    this.reset(w, h);
  }

  reset(w, h) {
    // Original face layout target coordinates
    this.baseX = w * 0.5 + rand(-120, 120);
    this.baseY = h * 0.4 + rand(-100, 100);
    
    // Dispersed particle positioning
    this.x = this.baseX;
    this.y = this.baseY;
    
    this.vx = rand(-4, 4);
    this.vy = rand(-6, 2);
    this.size = rand(1.5, 4);
    
    // Minato theme colors (gold, yellow flash, chakra cyan)
    const palette = ['#FFD700', '#FFCC00', '#FFF8DC', '#00E5FF'];
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.alpha = rand(0.3, 0.9);
  }

  update(w, h, dispersionFactor) {
    if (dispersionFactor > 0.05) {
      this.x += this.vx * dispersionFactor * 1.5;
      this.y += this.vy * dispersionFactor * 1.5;
      
      // Wrap around screen boundaries during dispersion
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;
    } else {
      // Re-anchor to baseline position
      this.x = lerp(this.x, this.baseX, 0.1);
      this.y = lerp(this.y, this.baseY, 0.1);
    }
  }

  draw(ctx, opacity) {
    if (opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha * opacity;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(bounds.width, bounds.height));
}
initParticles();

/* ──────────────── Sequence Stage Renderers ──────────────── */

/* Stage 1: Closed Eyes Portrait */
function drawPortrait(opacity) {
  if (opacity <= 0) return;
  const cx = bounds.width / 2;
  const cy = bounds.height * 0.4;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 12;

  // Closed eyes curves
  ctx.beginPath();
  ctx.arc(cx - 35, cy, 18, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + 35, cy, 18, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Headband plate silhouette outline
  ctx.strokeRect(cx - 65, cy - 50, 130, 28);
  ctx.restore();
}

/* Stage 3: Full-Bleed Yellow Flash Speed Dash */
function drawYellowFlash(opacity) {
  if (opacity <= 0) return;
  const h = bounds.height;
  const w = bounds.width;

  ctx.save();
  ctx.globalAlpha = opacity;
  
  // High-speed energetic light streaks
  const streakCount = 12;
  for (let i = 0; i < streakCount; i++) {
    const y = (h / streakCount) * i + rand(-10, 10);
    const length = rand(w * 0.4, w * 0.9);
    const x = rand(-100, w * 0.3);

    const grad = ctx.createLinearGradient(x, y, x + length, y);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
    grad.addColorStop(0.5, 'rgba(255, 255, 220, 0.8)');
    grad.addColorStop(1, 'rgba(255, 200, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, length, rand(2, 6));
  }
  ctx.restore();
}

/* Stage 4: Interactive Mouse-Tracking Rasengan */
let rasenganAngle = 0;
function drawRasengan(opacity) {
  if (opacity <= 0) return;

  // Smooth pointer physics damping
  pointer.x = lerp(pointer.x, pointer.targetX, 0.12);
  pointer.y = lerp(pointer.y, pointer.targetY, 0.12);

  // Store trail points for ghosting tail effect
  pointer.trail.push({ x: pointer.x, y: pointer.y });
  if (pointer.trail.length > 8) pointer.trail.shift();

  ctx.save();
  ctx.globalAlpha = opacity;

  // Render ghost cursor trail
  for (let i = 0; i < pointer.trail.length; i++) {
    const pt = pointer.trail[i];
    const trailAlpha = (i / pointer.trail.length) * 0.3 * opacity;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 25 * (i / pointer.trail.length), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 229, 255, ${trailAlpha})`;
    ctx.fill();
  }

  // Core spinning Chakra Orb
  const px = pointer.x;
  const py = pointer.y;
  const radius = 42;

  // Ambient outer aura
  const auraGrad = ctx.createRadialGradient(px, py, 5, px, py, radius * 2);
  auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  auraGrad.addColorStop(0.4, 'rgba(0, 229, 255, 0.6)');
  auraGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(px, py, radius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Spinning dynamic internal chakra rings
  rasenganAngle += 0.15;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rasenganAngle * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 4);
    ctx.strokeStyle = i % 2 === 0 ? '#00E5FF' : '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/* Stage 5: Thunder & Lightning Flash */
let thunderTimer = 0;
function drawThunder(opacity) {
  if (opacity <= 0) return;

  thunderTimer += 0.05;
  const isFlashing = Math.sin(thunderTimer * 8) > 0.85;

  if (isFlashing) {
    ctx.save();
    ctx.globalAlpha = opacity * 0.25;
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(0, 0, bounds.width, bounds.height);
    ctx.restore();
  }
}

/* ───────────────────── Main Animation Loop ───────────────────── */
function render() {
  ctx.clearRect(0, 0, bounds.width, bounds.height);

  const p = scrollProgress;

  // Window envelopes for sequence transition points [a, b, c, d]
  const opacityStage1 = window4(p, 0.00, 0.05, 0.18, 0.25); // Closed Eyes
  const opacityStage2 = window4(p, 0.18, 0.28, 0.42, 0.50); // Particle Dissolve
  const opacityStage3 = window4(p, 0.42, 0.52, 0.68, 0.75); // Yellow Dash Streak
  const opacityStage4 = window4(p, 0.68, 0.78, 0.92, 1.00); // Rasengan Pointer
  const opacityStage5 = window4(p, 0.85, 0.92, 1.00, 1.00); // Thunder & Final Frame

  // Render sequence layers
  drawPortrait(opacityStage1);

  // Update & draw particle engine
  particles.forEach(pt => {
    pt.update(bounds.width, bounds.height, opacityStage2);
    pt.draw(ctx, opacityStage1 + opacityStage2);
  });

  drawYellowFlash(opacityStage3);
  drawRasengan(opacityStage4);
  drawThunder(opacityStage5);

  requestAnimationFrame(render);
}

// Start rendering loop & ensure initial page scroll status is read
updateScroll();
requestAnimationFrame(render);
