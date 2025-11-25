import React, { useRef, useEffect } from 'react';
import './asteroids.css';

// Minimal interactive canvas: a circle "ship" you can move with arrow keys and shoot bullets with Space
// This is intentionally small and easy to replace with a fuller implementation later.
export default function AsteroidsApp() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    width: 800,
    height: 600,
    ship: { x: 400, y: 300, vx: 0, vy: 0, speed: 0.25 },
    keys: {},
    bullets: [],
  });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      const parent = canvas.parentElement || document.body;
      const w = Math.max(320, Math.min(1200, parent.clientWidth - 32));
      const h = Math.max(240, parent.clientHeight - 120);
      canvas.width = w;
      canvas.height = h;
      stateRef.current.width = w;
      stateRef.current.height = h;
    }

    function handleKeyDown(e) {
      stateRef.current.keys[e.code] = true;
    }
    function handleKeyUp(e) {
      stateRef.current.keys[e.code] = false;
    }

    function step(ts) {
      const s = stateRef.current;
      const ship = s.ship;
      // Controls: Arrow keys or WASD
      if (s.keys['ArrowUp'] || s.keys['KeyW']) {
        ship.vy -= ship.speed;
      }
      if (s.keys['ArrowDown'] || s.keys['KeyS']) {
        ship.vy += ship.speed;
      }
      if (s.keys['ArrowLeft'] || s.keys['KeyA']) {
        ship.vx -= ship.speed;
      }
      if (s.keys['ArrowRight'] || s.keys['KeyD']) {
        ship.vx += ship.speed;
      }
      // Fire bullet
      if (s.keys['Space'] && (!s._spaceHeld)) {
        s._spaceHeld = true;
        s.bullets.push({ x: ship.x, y: ship.y, vx: (Math.random() - 0.5) * 6, vy: -6, life: 60 });
      }
      if (!s.keys['Space']) s._spaceHeld = false;

      // Apply velocity & damping
      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.vx *= 0.98;
      ship.vy *= 0.98;

      // Wrap around edges
      if (ship.x < 0) ship.x = s.width;
      if (ship.x > s.width) ship.x = 0;
      if (ship.y < 0) ship.y = s.height;
      if (ship.y > s.height) ship.y = 0;

      // Update bullets
      s.bullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.0; // gravity none
        b.life -= 1;
      });
      s.bullets = s.bullets.filter(b => b.life > 0 && b.x > -50 && b.x < s.width + 50 && b.y > -50 && b.y < s.height + 50);

      // render
      ctx.fillStyle = '#071019';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw ship
      ctx.fillStyle = '#F6D55C';
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // draw a small velocity indicator
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y);
      ctx.lineTo(ship.x + ship.vx * 6, ship.y + ship.vy * 6);
      ctx.stroke();

      // draw bullets
      ctx.fillStyle = '#FF6B6B';
      s.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="asteroids-root">
      <div className="asteroids-instructions">Use arrow keys or WASD to move. Press Space to shoot.</div>
      <canvas ref={canvasRef} className="asteroids-canvas" />
    </div>
  );
}
