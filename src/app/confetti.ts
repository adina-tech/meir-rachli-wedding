const COLORS = ['#c6a15b', '#e8d3a2', '#e9cfc4', '#c9968a', '#fffcf7', '#d8b9a6'];

interface Piece {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; rot: number; vr: number;
  color: string; round: boolean;
}

/** Fires a soft gold/blush confetti shower over the whole viewport. */
export function launchConfetti(durationMs = 7000): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  const pieces: Piece[] = [];
  const spawn = (count: number) => {
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: Math.random() * innerWidth,
        y: -20 - Math.random() * innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 1.5 + Math.random() * 2.5,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        round: Math.random() < 0.3,
      });
    }
  };

  const start = performance.now();
  let last = start;
  const frame = (t: number) => {
    const elapsed = t - start;
    if (elapsed < durationMs && t - last > 120) {
      spawn(innerWidth < 600 ? 6 : 12);
      last = t;
    }
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.x += p.vx + Math.sin(t / 600 + i) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > innerHeight + 30) { pieces.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot)));
      }
      ctx.restore();
    }
    if (elapsed < durationMs || pieces.length) {
      requestAnimationFrame(frame);
    } else {
      removeEventListener('resize', resize);
      canvas.remove();
    }
  };
  spawn(innerWidth < 600 ? 60 : 140);
  requestAnimationFrame(frame);
}
