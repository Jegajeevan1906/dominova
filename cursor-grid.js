/**
 * CursorGrid — Interactive Canvas Grid Component
 * Vanilla JavaScript implementation ported from React Bits.
 */

class CursorGrid {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = {
      cellSize: 70,
      color: '#C9A84C',
      radius: 140,
      falloff: 'smooth',
      holdTime: 400,
      fadeDuration: 800,
      lineWidth: 1.2,
      maxOpacity: 1,
      fillOpacity: 0,
      gridOpacity: 0,
      cellRadius: 0,
      clickPulse: true,
      pulseSpeed: 600,
      className: '',
      autoThemeColor: true,
      ...options
    };

    this.falloffCurves = {
      linear: t => t,
      smooth: t => t * t * (3 - 2 * t),
      sharp: t => t * t * t
    };

    this.init();
  }

  hexToRgb(hex) {
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const num = parseInt(v.slice(0, 6), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  init() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = `cursor-grid${this.options.className ? ` ${this.options.className}` : ''}`;
    this.wrapper.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 1;';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'cursor-grid__canvas';
    this.canvas.style.cssText = 'display: block; width: 100%; height: 100%;';
    this.wrapper.appendChild(this.canvas);

    this.container.appendChild(this.wrapper);

    this.ctx = this.canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.wrapper.style.display = 'none';
      return;
    }
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.2);

    this.cols = 0;
    this.rows = 0;
    this.offX = 0;
    this.offY = 0;
    this.alphas = new Float32Array(0);
    this.touched = new Float64Array(0);
    this.w = 0;
    this.h = 0;
    this.pulses = [];
    this.raf = 0;
    this.running = false;
    this.lastFrame = 0;

    this.bindEvents();
    this.rebuild();
    this.wake();
  }

  bindEvents() {
    this.onResize = () => {
      this.rebuild();
      this.wake();
    };

    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.container);

    this.onPointerMove = e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.energize(x, y);
      this.wake();
    };

    this.onPointerDown = e => {
      if (!this.options.clickPulse) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.pulses.push({ x, y, t0: performance.now() });
      this.wake();
    };

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });

    if (this.options.autoThemeColor) {
      this.themeObserver = new MutationObserver(() => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        this.options.color = isLight ? '#A8782A' : '#C9A84C';
        this.wake();
      });
      this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      this.options.color = isLight ? '#A8782A' : '#C9A84C';
    }
  }

  rebuild() {
    const p = this.options;
    this.w = this.container.offsetWidth || window.innerWidth;
    this.h = this.container.offsetHeight || window.innerHeight;
    this.canvas.width = Math.max(1, Math.round(this.w * this.dpr));
    this.canvas.height = Math.max(1, Math.round(this.h * this.dpr));
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cols = Math.ceil(this.w / p.cellSize) + 1;
    this.rows = Math.ceil(this.h / p.cellSize) + 1;
    this.offX = (this.w - this.cols * p.cellSize) / 2;
    this.offY = (this.h - this.rows * p.cellSize) / 2;

    this.alphas = new Float32Array(this.cols * this.rows);
    this.touched = new Float64Array(this.cols * this.rows);
  }

  cellCenter(i) {
    const p = this.options;
    const cx = this.offX + (i % this.cols) * p.cellSize + p.cellSize / 2;
    const cy = this.offY + Math.floor(i / this.cols) * p.cellSize + p.cellSize / 2;
    return [cx, cy];
  }

  energize(x, y, boost) {
    const p = this.options;
    const r = Math.max(p.radius, 1);
    const ease = this.falloffCurves[p.falloff] ?? this.falloffCurves.linear;
    const now = performance.now();

    const minCol = Math.max(0, Math.floor((x - r - this.offX) / p.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + r - this.offX) / p.cellSize));
    const minRow = Math.max(0, Math.floor((y - r - this.offY) / p.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + r - this.offY) / p.cellSize));

    for (let cRow = minRow; cRow <= maxRow; cRow++) {
      for (let cCol = minCol; cCol <= maxCol; cCol++) {
        const i = cRow * this.cols + cCol;
        const [cx, cy] = this.cellCenter(i);
        const dist = Math.hypot(cx - x, cy - y);
        if (dist > r) continue;
        const level = ease(1 - dist / r) * p.maxOpacity * (boost ?? 1);
        if (level > this.alphas[i]) {
          this.alphas[i] = level;
          this.touched[i] = now;
        } else if (level > 0) {
          this.touched[i] = now;
        }
      }
    }
  }

  draw(now) {
    const p = this.options;
    const dt = Math.min(now - this.lastFrame, 50);
    this.lastFrame = now;
    this.ctx.clearRect(0, 0, this.w, this.h);
    const [cr, cg, cb] = this.hexToRgb(p.color);

    if (p.gridOpacity > 0) {
      this.ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.gridOpacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      for (let cCol = 0; cCol <= this.cols; cCol++) {
        const x = Math.round(this.offX + cCol * p.cellSize) + 0.5;
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.h);
      }
      for (let cRow = 0; cRow <= this.rows; cRow++) {
        const y = Math.round(this.offY + cRow * p.cellSize) + 0.5;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.w, y);
      }
      this.ctx.stroke();
    }

    for (let pi = this.pulses.length - 1; pi >= 0; pi--) {
      const pulse = this.pulses[pi];
      const age = (now - pulse.t0) / 1000;
      const ringR = age * p.pulseSpeed;
      if (ringR > Math.hypot(this.w, this.h)) {
        this.pulses.splice(pi, 1);
        continue;
      }
      const band = p.cellSize;
      const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - this.offX) / p.cellSize));
      const maxCol = Math.min(this.cols - 1, Math.floor((pulse.x + ringR + band - this.offX) / p.cellSize));
      const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - this.offY) / p.cellSize));
      const maxRow = Math.min(this.rows - 1, Math.floor((pulse.y + ringR + band - this.offY) / p.cellSize));
      for (let cRow = minRow; cRow <= maxRow; cRow++) {
        for (let cCol = minCol; cCol <= maxCol; cCol++) {
          const i = cRow * this.cols + cCol;
          const [cx, cy] = this.cellCenter(i);
          const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
          if (Math.abs(dist - ringR) < band / 2 && p.maxOpacity > this.alphas[i]) {
            this.alphas[i] = p.maxOpacity;
            this.touched[i] = now;
          }
        }
      }
    }

    let anyVisible = this.pulses.length > 0;
    const fadeStep = dt / Math.max(p.fadeDuration, 16);
    const half = p.cellSize / 2;

    for (let i = 0; i < this.alphas.length; i++) {
      let a = this.alphas[i];
      if (a <= 0) continue;
      if (now - this.touched[i] > p.holdTime) {
        a = Math.max(0, a - fadeStep);
        this.alphas[i] = a;
        if (a <= 0) continue;
      }
      anyVisible = true;

      const [cx, cy] = this.cellCenter(i);
      const gradient = this.ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, p.cellSize);
      gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
      gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

      const x = cx - half + 0.5;
      const y = cy - half + 0.5;
      const s = p.cellSize - 1;

      this.ctx.beginPath();
      if (p.cellRadius > 0) {
        this.ctx.roundRect(x, y, s, s, p.cellRadius);
      } else {
        this.ctx.rect(x, y, s, s);
      }
      if (p.fillOpacity > 0) {
        this.ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * p.fillOpacity})`;
        this.ctx.fill();
      }
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = p.lineWidth;
      this.ctx.stroke();
    }

    if (anyVisible) {
      this.raf = requestAnimationFrame(ts => this.draw(ts));
    } else {
      this.running = false;
      if (this.options.gridOpacity <= 0) this.ctx.clearRect(0, 0, this.w, this.h);
    }
  }

  wake() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(ts => this.draw(ts));
  }

  update(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.wake();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect();
    if (this.themeObserver) this.themeObserver.disconnect();
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}

window.CursorGrid = CursorGrid;
