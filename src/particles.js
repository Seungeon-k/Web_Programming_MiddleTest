const COLORS = ['#6eae49', '#f2d447', '#e76878', '#58a6cd', '#a78bbd'];

export class Particles {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.items = [];
    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    this.width = bounds.width;
    this.height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  clear() {
    this.items = [];
    this.context?.clearRect(0, 0, this.width, this.height);
  }

  swoosh(origin, target, color) {
    this.items.push({ kind: 'swoosh', x: origin.x, y: origin.y, target, color, life: 0, maxLife: 850, bend: Math.min(this.height * .12, 90) });
  }

  burst(x, y, count = 32, power = 1, color) {
    if (!this.context) return;
    const compact = this.width < 600;
    const amount = compact ? Math.ceil(count * .6) : count;
    for (let i = 0; i < amount && this.items.length < 220; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1.5 + Math.random() * 5) * power * (compact ? .75 : 1);
      this.items.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        life: 0, maxLife: 1100 + Math.random() * 1700, size: 3 + Math.random() * 6,
        rotation: Math.random() * Math.PI, spin: (Math.random() - .5) * .17,
        color: color && Math.random() < .4 ? color : COLORS[i % COLORS.length], kind: i % 4,
      });
    }
    this.items.push({ x, y, kind: 'ring', life: 0, maxLife: 550, color: color || '#a3bb58' });
  }

  frame(delta) {
    const ctx = this.context;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    const step = Math.min(delta, 34) / 16.67;
    this.items = this.items.filter(item => item.life < item.maxLife);
    for (const p of this.items) {
      p.life += Math.min(delta, 34);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.kind === 'swoosh') {
        const progress = Math.min(p.life / 550, 1);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let ribbon = 0; ribbon < 3; ribbon++) {
          ctx.beginPath();
          for (let step = 0; step <= 16; step++) {
            const t = Math.max(0, progress - .28) + step / 16 * Math.min(progress, .28);
            const x = p.x + (p.target.x - p.x) * t + ribbon * 5;
            const y = p.y + (p.target.y - p.y) * t - Math.sin(t * Math.PI) * p.bend + ribbon * 4;
            step ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }
      if (p.kind === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * (1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + p.life / p.maxLife * 85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += .065 * step;
      p.vx *= .996;
      p.rotation += p.spin * step;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.kind === 0) {
        ctx.beginPath();
        for (let point = 0; point < 10; point++) {
          const radius = point % 2 ? p.size * .43 : p.size;
          const angle = point / 10 * Math.PI * 2 - Math.PI / 2;
          ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();ctx.fill();
      } else if (p.kind === 1) {
        ctx.beginPath();ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);ctx.fill();
      } else {
        ctx.scale(Math.cos(p.life / 150), 1);
        ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.7);
      }
      ctx.restore();
    }
  }
}
