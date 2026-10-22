/**
 * miniGamba Particle Engine
 * High-performance 60fps Canvas-based particle effects.
 * Supports celebratory confetti, cascading gold coins, sparkles, and smoke.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
  type: 'confetti' | 'coin' | 'sparkle' | 'smoke';
}

class ParticleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animId: number | null = null;

  private ensureCanvas(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    if (this.canvas && document.body.contains(this.canvas)) return true;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'minigamba-particle-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    return true;
  }

  private resize(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private loop = (): void => {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.vRot;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'coin') {
        // Gold coin circle with embossed rim
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = '#FFE066';
        this.ctx.stroke();
      } else if (p.type === 'sparkle') {
        // 4-point star sparkle
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size * 0.3, -p.size * 0.3);
        this.ctx.lineTo(p.size, 0);
        this.ctx.lineTo(p.size * 0.3, p.size * 0.3);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size * 0.3, p.size * 0.3);
        this.ctx.lineTo(-p.size, 0);
        this.ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.type === 'smoke') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.animId = null;
    }
  };

  private startLoop(): void {
    if (!this.animId) {
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  burstConfetti(originX?: number, originY?: number, count = 45): void {
    if (!this.ensureCanvas()) return;
    const x = originX ?? (this.canvas ? this.canvas.width / 2 : 200);
    const y = originY ?? (this.canvas ? this.canvas.height / 3 : 150);
    const colors = ['#FF4B4B', '#48FF9A', '#4BA3FF', '#A855F7', '#FFD84B', '#3CF3FF'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 7 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        gravity: 0.18,
        drag: 0.98,
        type: 'confetti',
      });
    }
    this.startLoop();
  }

  burstCoins(originX?: number, originY?: number, count = 28): void {
    if (!this.ensureCanvas()) return;
    const x = originX ?? (this.canvas ? this.canvas.width / 2 : 200);
    const y = originY ?? (this.canvas ? this.canvas.height / 2 : 200);

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 6 + Math.random() * 9;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 10 + Math.random() * 4,
        color: '#FFD700',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        alpha: 1,
        life: 0,
        maxLife: 50 + Math.random() * 30,
        gravity: 0.28,
        drag: 0.99,
        type: 'coin',
      });
    }
    this.startLoop();
  }

  burstSparkles(originX: number, originY: number, count = 16): void {
    if (!this.ensureCanvas()) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: Math.random() > 0.5 ? '#3CF3FF' : '#FFD84B',
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.1,
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        gravity: 0.05,
        drag: 0.96,
        type: 'sparkle',
      });
    }
    this.startLoop();
  }

  burstSmoke(originX: number, originY: number, count = 24): void {
    if (!this.ensureCanvas()) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      const isFire = Math.random() < 0.4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 6 + Math.random() * 10,
        color: isFire ? (Math.random() > 0.5 ? '#FF4B4B' : '#FFA834') : '#4B4B55',
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.05,
        alpha: 0.9,
        life: 0,
        maxLife: 35 + Math.random() * 25,
        gravity: -0.05, // Float up slightly
        drag: 0.94,
        type: 'smoke',
      });
    }
    this.startLoop();
  }
}

export const particles = new ParticleEngine();
