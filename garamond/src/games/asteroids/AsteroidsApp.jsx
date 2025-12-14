import React, { useRef, useEffect, useState } from 'react';
import './asteroids.css';
import { getStoredUser } from '../../utils/session';
import { recordGameMetrics } from '../../utils/gameMetricsCollector';

// Full Asteroids game with collision detection, splitting asteroids, and game over logic
export default function AsteroidsApp({ settings = { shipColor: '#F6D55C', backgroundColor: '#071019', shipShape: 'triangle' }, topScore = { score: 0, player: '' } }) {
   console.log("AsteroidsApp received topScore prop:", topScore);
 
   const canvasRef = useRef(null);
  const [, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const stateRef = useRef({
    width: 800,
    height: 600,
  ship: { x: 400, y: 300, vx: 0, vy: 0, speed: 0.25, radius: 12, heading: -Math.PI / 2 },
    keys: {},
    bullets: [],
    asteroids: [],
    particles: [],
    score: 0,
    lives: 3,
    level: 1,
    asteroidsDestroyed: 0,
    asteroidsToDestroy: 12,
    gameOver: false,
    paused: false,
    invulnerable: false,
    invulnerableTime: 0,
    soundEnabled: true,
  });
  const audioRef = useRef({ ctx: null, osc: null, gain: null, playing: false });
  const rafRef = useRef(null);
  const resetGameRef = useRef(null);
  const settingsRef = useRef(settings);
  const metricsRecordedRef = useRef(false);
  const gameStartTimeRef = useRef(Date.now());
  // Keep latest top score without reinitializing the heavy canvas effect
  const topScoreRef = useRef(topScore);
  const isMobileRef = useRef(false);
  const lastTapRef = useRef(0);
  const doubleTapDelayRef = useRef(300);

  useEffect(() => {
    topScoreRef.current = topScore;
  }, [topScore]);

  // Update settings ref whenever settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile touch control handlers
  const touchStartPos = useRef(null);
  
  const handleTouchStart = (e) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    touchStartPos.current = { x, y };
  };
  
  const handleTouchMove = (e) => {
    if (!touchStartPos.current || !canvasRef.current) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const s = stateRef.current;
    const ship = s.ship;
    
    // Calculate angle from ship to touch point
    const canvasX = (x / rect.width) * s.width;
    const canvasY = (y / rect.height) * s.height;
    const dx = canvasX - ship.x;
    const dy = canvasY - ship.y;
    const targetAngle = Math.atan2(dy, dx);
    
    // Rotate ship toward touch point
    let angleDiff = targetAngle - ship.heading;
    // Normalize angle difference to -PI to PI
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    // Auto-rotate toward touch
    if (Math.abs(angleDiff) > 0.1) {
      s.keys['ArrowLeft'] = angleDiff < 0;
      s.keys['ArrowRight'] = angleDiff > 0;
    } else {
      s.keys['ArrowLeft'] = false;
      s.keys['ArrowRight'] = false;
    }
    
    // Thrust if touch is far enough from ship
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = 30;
    s.keys['ArrowUp'] = distance > minDistance;
  };
  
  const handleTouchEnd = () => {
    const s = stateRef.current;
    s.keys['ArrowLeft'] = false;
    s.keys['ArrowRight'] = false;
    s.keys['ArrowUp'] = false;
    touchStartPos.current = null;
  };
  
  const handleShoot = () => {
    const s = stateRef.current;
    s.keys['Space'] = true;
    setTimeout(() => { s.keys['Space'] = false; }, 100);
  };

  const handleDoubleTap = (e) => {
    // Ignore double-tap if it's on a button or control element
    if (e.target.closest('button') || e.target.closest('.mobile-controls-left') || e.target.closest('.mobile-controls-right') || e.target.closest('.mobile-controls-center')) {
      return;
    }
    
    const now = Date.now();
    const timeSinceLast = now - lastTapRef.current;
    
    if (timeSinceLast < doubleTapDelayRef.current && timeSinceLast > 0) {
      // Double tap detected
      const s = stateRef.current;
      s.paused = !s.paused;
      setIsPaused(s.paused);
      lastTapRef.current = 0; // Reset to prevent triple-tap issues
    } else {
      lastTapRef.current = now;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const MIN_DESTROY_RADIUS = 20; // asteroids at or below this radius are destroyed rather than split
    function colorsForRadius(r) {
      // Define tiered colors: large, medium, small
      if (r > 48) {
        // Large
        return {
          fill: '#4B3F72',
          stroke: '#B8A1E6',
          flashFill: '#7A66B1',
          flashStroke: '#E0D1FF',
          particles: ['#B8A1E6', '#7A66B1']
        };
      } else if (r > 32) {
        // Medium
        return {
          fill: '#2F5D8A',
          stroke: '#A7C7E7',
          flashFill: '#5693C0',
          flashStroke: '#D6EBFA',
          particles: ['#A7C7E7', '#5693C0']
        };
      } else {
        // Small
        return {
          fill: '#1B6F5B',
          stroke: '#A7E7D8',
          flashFill: '#39A58B',
          flashStroke: '#D2FFF5',
          particles: ['#A7E7D8', '#39A58B']
        };
      }
    }
    function spawnBurst(x, y, radius, particleColors = ['#F6D55C', '#FF6B6B']) {
      const s = stateRef.current;
      const count = Math.max(10, Math.floor(8 + radius / 2));
      const maxLife = 28;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.8 + Math.random() * 1.6) * (40 / Math.max(radius, 12));
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        s.particles.push({
          x,
          y,
          vx,
          vy,
          life: maxLife,
          maxLife,
          size: 2 + Math.random() * 2,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        });
      }
    }


    function resize() {
      const parent = canvas.parentElement || document.body;
      const w = Math.max(320, Math.min(1200, parent.clientWidth - 32));
      const h = Math.max(240, parent.clientHeight - 120);
      canvas.width = w;
      canvas.height = h;
      stateRef.current.width = w;
      stateRef.current.height = h;
      // Reset ship position on resize
      if (!stateRef.current.gameOver) {
        stateRef.current.ship.x = w / 2;
        stateRef.current.ship.y = h / 2;
      }
    }

    function ensureAudio() {
      const a = audioRef.current;
      if (!a.ctx) {
        try {
          a.ctx = new (window.AudioContext || window.webkitAudioContext)();
          
          // Main gain for master volume
          a.gain = a.ctx.createGain();
          a.gain.gain.value = 0;
          a.gain.connect(a.ctx.destination);
          
          // Load the rocket sound MP3
          fetch('/audio/Rocket_Sounds.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => a.ctx.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
              a.audioBuffer = audioBuffer;
              a.isLoaded = true;
            })
            .catch(e => console.error('Failed to load rocket sound:', e));
  } catch (e) { /* ignore AudioContext init errors */ void e; }
      }
    }

    function setThrustSound(thrusting) {
      const s = stateRef.current;
      const a = audioRef.current;
      
      if (!s.soundEnabled) {
        // Stop sound if disabled
        if (a.source) {
          a.gain.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.1);
          setTimeout(() => {
            if (a.source) {
              a.source.stop();
              a.source = null;
            }
          }, 100);
        }
        a.playing = false;
        return;
      }
      
      ensureAudio();
      if (!a.ctx || !a.gain) return;
      
      // Resume audio context if suspended (browser autoplay policy)
      if (a.ctx.state === 'suspended') {
        a.ctx.resume();
      }
      
      // Start playing the sound
      if (thrusting && !a.playing && a.isLoaded && a.audioBuffer) {
        // Create new buffer source
        a.source = a.ctx.createBufferSource();
        a.source.buffer = a.audioBuffer;
        a.source.loop = true;
        a.source.connect(a.gain);
        a.source.start(0);
        
        // Fade in
        a.gain.gain.setValueAtTime(0, a.ctx.currentTime);
        a.gain.gain.linearRampToValueAtTime(0.5, a.ctx.currentTime + 0.1);
        a.playing = true;
      } else if (!thrusting && a.playing) {
        // Fade out and stop
        a.gain.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.1);
        setTimeout(() => {
          if (a.source && !thrusting) {
            a.source.stop();
            a.source = null;
          }
        }, 100);
        a.playing = false;
      }
    }

    function spawnAsteroids(count) {
      const s = stateRef.current;
      // Level-based velocity multiplier: starts at 0.4 in level 1, increases by 0.15 per level
      const levelSpeedMultiplier = 0.4 + (s.level - 1) * 0.15;
      // Mobile: fewer asteroids, smaller size
      const actualCount = isMobileRef.current ? Math.ceil(count * 0.6) : count;

      for (let i = 0; i < actualCount; i++) {
        // Spawn asteroids away from ship
        let x, y;
        do {
          x = Math.random() * s.width;
          y = Math.random() * s.height;
        } while (Math.hypot(x - s.ship.x, y - s.ship.y) < 150);

        // Choose varied sizes and speeds (smaller move faster)
        // Mobile: 24-42px, Desktop: 36-64px
        const radius = isMobileRef.current ? (24 + Math.random() * 18) : (36 + Math.random() * 28);
        const speedBase = 0.6 + Math.random() * 0.9; // 0.6 - 1.5
        const speedScale = 60 / radius; // small => faster
        // Mobile: reduce speed by 50%
        const mobileSpeedMultiplier = isMobileRef.current ? 0.5 : 1;
        const vx = (Math.random() - 0.5) * speedBase * speedScale * 2 * levelSpeedMultiplier * mobileSpeedMultiplier;
        const vy = (Math.random() - 0.5) * speedBase * speedScale * 2 * levelSpeedMultiplier * mobileSpeedMultiplier;

        const palette = colorsForRadius(radius);
        s.asteroids.push({
          x,
          y,
          vx,
          vy,
          radius,
          canSplit: radius > MIN_DESTROY_RADIUS,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          flash: 0,
          colorFill: palette.fill,
          colorStroke: palette.stroke,
          flashFill: palette.flashFill,
          flashStroke: palette.flashStroke,
          particleColors: palette.particles,
        });
      }
    }

    function splitAsteroid(asteroid) {
      const s = stateRef.current;
      // Create 2 smaller asteroids; children can split again only if still above threshold
      const newRadius = Math.max(asteroid.radius * 0.6, 12);
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + Math.PI + (Math.random() - 0.5) * 0.8;
      const speed = 1.5 + Math.random();
      const speedScale = 60 / newRadius;
      // Apply level-based speed multiplier to split asteroids
      const levelSpeedMultiplier = 0.4 + (s.level - 1) * 0.15;
      // Mobile: reduce speed by 50%
      const mobileSpeedMultiplier = isMobileRef.current ? 0.5 : 1;

      const palette1 = colorsForRadius(newRadius);
      s.asteroids.push({
        x: asteroid.x,
        y: asteroid.y,
        vx: Math.cos(angle1) * speed * speedScale * levelSpeedMultiplier * mobileSpeedMultiplier,
        vy: Math.sin(angle1) * speed * speedScale * levelSpeedMultiplier * mobileSpeedMultiplier,
        radius: newRadius,
        canSplit: newRadius > MIN_DESTROY_RADIUS,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        flash: 0,
        colorFill: palette1.fill,
        colorStroke: palette1.stroke,
        flashFill: palette1.flashFill,
        flashStroke: palette1.flashStroke,
        particleColors: palette1.particles,
      });

      const palette2 = colorsForRadius(newRadius);
      s.asteroids.push({
        x: asteroid.x,
        y: asteroid.y,
        vx: Math.cos(angle2) * speed * speedScale * levelSpeedMultiplier * mobileSpeedMultiplier,
        vy: Math.sin(angle2) * speed * speedScale * levelSpeedMultiplier * mobileSpeedMultiplier,
        radius: newRadius,
        canSplit: newRadius > MIN_DESTROY_RADIUS,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        flash: 0,
        colorFill: palette2.fill,
        colorStroke: palette2.stroke,
        flashFill: palette2.flashFill,
        flashStroke: palette2.flashStroke,
        particleColors: palette2.particles,
      });
    }

    function checkCollision(x1, y1, r1, x2, y2, r2) {
      const dx = x1 - x2;
      const dy = y1 - y2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < r1 + r2;
    }

    function resetShip() {
      const s = stateRef.current;
      s.ship.x = s.width / 2;
      s.ship.y = s.height / 2;
      s.ship.vx = 0;
      s.ship.vy = 0;
      s.invulnerable = true;
      s.invulnerableTime = 120; // 2 seconds at 60fps
    }

    function resetGame() {
      const s = stateRef.current;
      s.lives = 3;
      s.score = 0;
      s.level = 1;
      s.asteroidsDestroyed = 0;
      s.asteroidsToDestroy = isMobileRef.current ? 6 : 12;
      s.asteroids = [];
      s.bullets = [];
      s.particles = [];
      s.paused = false;
      resetShip();
      spawnAsteroids(isMobileRef.current ? 2 : 4);
      setLives(3);
      setScore(0);
      setIsPaused(false);
      setShowResetConfirm(false);
      metricsRecordedRef.current = false;
      gameStartTimeRef.current = Date.now();
    }

    // Store resetGame in ref so it can be accessed outside useEffect
    resetGameRef.current = resetGame;

    function handleKeyDown(e) {
      const s = stateRef.current;
      // Prevent page scrolling or focus changes from game control keys
      const controlKeys = new Set([
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'
      ]);
      if (controlKeys.has(e.code)) {
        e.preventDefault?.();
      }

      s.keys[e.code] = true;
      if (e.code === 'KeyM') {
        s.soundEnabled = !s.soundEnabled;
        if (!s.soundEnabled) setThrustSound(false);
      }
      
      // Pause game on 'P' key (only if not game over)
      if (e.code === 'KeyP' && !s.gameOver) {
        e.preventDefault?.();
        s.paused = !s.paused;
        setIsPaused(s.paused);
        if (s.paused) {
          setThrustSound(false); // Stop thrust sound when pausing
        }
        return;
      }
      
      // Reset game on 'R' key (only if not game over)
      if (e.code === 'KeyR' && !s.gameOver) {
        e.preventDefault?.();
        // Pause the game if not already paused
        if (!s.paused) {
          s.paused = true;
          setIsPaused(true);
          setThrustSound(false);
        }
        // Show reset confirmation
        setShowResetConfirm(true);
        return;
      }
      
      // Restart game on Enter when game over
      if (e.code === 'Enter' && s.gameOver) {
        s.gameOver = false;
        s.lives = 3;
        s.score = 0;
        s.level = 1;
        s.asteroidsDestroyed = 0;
        s.asteroidsToDestroy = isMobileRef.current ? 6 : 12;
        s.asteroids = [];
        s.bullets = [];
        s.paused = false;
        resetShip();
        spawnAsteroids(isMobileRef.current ? 2 : 4);
        setGameOver(false);
        setLives(3);
        setScore(0);
        setIsPaused(false);
        metricsRecordedRef.current = false;
        gameStartTimeRef.current = Date.now();
      }
    }
    
    function handleKeyUp(e) {
      const controlKeys = new Set([
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'
      ]);
      if (controlKeys.has(e.code)) {
        e.preventDefault?.();
      }
      stateRef.current.keys[e.code] = false;
    }

    function step() {
      const s = stateRef.current;
      
      if (s.gameOver) {
        // Just render game over state
        ctx.fillStyle = settingsRef.current.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', s.width / 2, s.height / 2 - 40);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${s.score}`, s.width / 2, s.height / 2 + 10);
        ctx.fillText('Press ENTER to restart', s.width / 2, s.height / 2 + 50);
        
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const ship = s.ship;
      
      // If paused, just render current state without updating
      if (s.paused) {
        // Render everything but skip game logic updates
        ctx.fillStyle = settingsRef.current.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw particles
        s.particles.forEach(p => {
          const alpha = p.life / p.maxLife;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // Draw asteroids
        s.asteroids.forEach(a => {
          ctx.save();
          ctx.translate(a.x, a.y);
          ctx.rotate(a.rotation);
          ctx.strokeStyle = a.flash > 0 ? a.flashStroke : a.colorStroke;
          ctx.fillStyle = a.flash > 0 ? a.flashFill : a.colorFill;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const sides = 8;
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const variance = 0.7 + Math.sin(i * 2.3) * 0.3;
            const r = a.radius * variance;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        // Draw ship
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.fillStyle = settingsRef.current.shipColor;
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 1.5;
        
        if (settingsRef.current.shipShape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, ship.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.rotate(ship.heading);
          ctx.strokeStyle = '#2b2b2b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(ship.radius * 1.5, 0);
          ctx.stroke();
        } else {
          ctx.rotate(ship.heading);
          const L = ship.radius * 2.2;
          const W = ship.radius * 1.0;
          ctx.beginPath();
          ctx.moveTo(L, 0);
          ctx.lineTo(-ship.radius * 0.8, W * 0.7);
          ctx.lineTo(-ship.radius * 0.8, -W * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        // Draw bullets
        ctx.fillStyle = '#FF6B6B';
        s.bullets.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

      // Draw HUD - compact format
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`S: ${s.score}`, 20, 30);
        ctx.fillText(`❤️ ${s.lives}`, 20, 50);

        // Draw top score in top-right corner
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFD700';
        ctx.font = '14px Arial';
  const ts = topScoreRef.current;
  const topScoreText = ts.player ? `${ts.player}: ${ts.score}` : `${ts.score}`;
        ctx.fillText(topScoreText, s.width - 20, 30);

        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#F6D55C';
        ctx.fillText(`L${s.level}`, 20, 75);
        const progressPercent = s.asteroidsDestroyed / s.asteroidsToDestroy;
        ctx.font = '14px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${s.asteroidsDestroyed}/${s.asteroidsToDestroy}`, 20, 95);
        const barX = 20;
        const barY = 100;
        const barWidth = 150;
        const barHeight = 10;
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = progressPercent >= 1 ? '#3DDC97' : '#F6D55C';
        ctx.fillRect(barX, barY, barWidth * Math.min(progressPercent, 1), barHeight);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);        // Draw PAUSED indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#F6D55C';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', s.width / 2, s.height / 2);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Press P to resume', s.width / 2, s.height / 2 + 40);

        rafRef.current = requestAnimationFrame(step);
        return;
      }
      
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
        // Fire in direction of heading (velocity direction if moving, otherwise last heading)
        const speed = 8;
        const mag = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
        if (mag > 0.2) {
          ship.heading = Math.atan2(ship.vy, ship.vx);
        }
        const bulletVx = Math.cos(ship.heading) * speed;
        const bulletVy = Math.sin(ship.heading) * speed;
        s.bullets.push({ 
          x: ship.x, 
          y: ship.y, 
          vx: bulletVx, 
          vy: bulletVy, 
          life: 90 
        });
      }
      if (!s.keys['Space']) s._spaceHeld = false;

      // Apply velocity & damping
      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.vx *= 0.98;
      ship.vy *= 0.98;

      // Update ship heading to follow motion when moving
      const vmag = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
      if (vmag > 0.2) {
        ship.heading = Math.atan2(ship.vy, ship.vx);
      }

      // Wrap around edges
      if (ship.x < 0) ship.x = s.width;
      if (ship.x > s.width) ship.x = 0;
      if (ship.y < 0) ship.y = s.height;
      if (ship.y > s.height) ship.y = 0;

      // Update invulnerability timer
      if (s.invulnerable) {
        s.invulnerableTime--;
        if (s.invulnerableTime <= 0) {
          s.invulnerable = false;
        }
      }

      // Update bullets
      s.bullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.life -= 1;
      });
      s.bullets = s.bullets.filter(b => b.life > 0);

      // Update asteroids (position/rotation) and wrap
      s.asteroids.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.rotationSpeed;
        if (a.flash > 0) a.flash -= 1;
        // Wrap around edges
        if (a.x < -a.radius) a.x = s.width + a.radius;
        if (a.x > s.width + a.radius) a.x = -a.radius;
        if (a.y < -a.radius) a.y = s.height + a.radius;
        if (a.y > s.height + a.radius) a.y = -a.radius;
      });

      // Update particles
      s.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 1;
      });
      s.particles = s.particles.filter(p => p.life > 0);

      // Spawn brake-style puff particles from rear of ship when accelerating
      const anyAccel = s.keys['ArrowUp'] || s.keys['KeyW'] || 
                       s.keys['ArrowDown'] || s.keys['KeyS'] ||
                       s.keys['ArrowLeft'] || s.keys['KeyA'] || 
                       s.keys['ArrowRight'] || s.keys['KeyD'];

      if (anyAccel) {
        // Always spawn puffs from the back of the triangle (opposite to heading)
        const rearDist = ship.radius * 0.9;
        const rx = ship.x - Math.cos(ship.heading) * rearDist;
        const ry = ship.y - Math.sin(ship.heading) * rearDist;
        const count = 2;
        for (let i = 0; i < count; i++) {
          const spread = (Math.random() - 0.5) * 0.6;
          const speed = 1.0 + Math.random() * 0.8;
          // Particles move opposite to ship heading
          const vx = -Math.cos(ship.heading + spread) * speed;
          const vy = -Math.sin(ship.heading + spread) * speed;
          s.particles.push({
            x: rx,
            y: ry,
            vx,
            vy,
            life: 12,
            maxLife: 12,
            size: 1.2 + Math.random() * 1.0,
            color: Math.random() < 0.5 ? '#77c7ff' : '#cfe8ff',
          });
        }
      }

      // Check bullet-asteroid collisions
      const asteroidsToRemove = [];
      s.bullets = s.bullets.filter(bullet => {
        for (let i = 0; i < s.asteroids.length; i++) {
          const asteroid = s.asteroids[i];
          if (checkCollision(bullet.x, bullet.y, 3, asteroid.x, asteroid.y, asteroid.radius)) {
            // Scoring per hit
            let scoreAdd = 10;

            if (asteroid.radius > MIN_DESTROY_RADIUS) {
              // Split into two pieces and remove original
              splitAsteroid(asteroid);
              asteroidsToRemove.push(i);
            } else {
              // Too small to split: destroy completely
              asteroidsToRemove.push(i);
              s.asteroidsDestroyed++;
              // size-based bonus for destruction
              const destroyBonus = Math.max(8, Math.round(asteroid.radius * 0.5));
              scoreAdd += destroyBonus;
              // spawn particle burst with tiered colors
              spawnBurst(asteroid.x, asteroid.y, asteroid.radius, asteroid.particleColors);
            }

            // set flash for visual feedback (parent will be removed if splitting)
            asteroid.flash = 10;

            s.score += scoreAdd;
            setScore(s.score);

            return false; // Remove bullet
          }
        }
        return true;
      });

      // Process asteroid removals (splits are handled inline)
      for (let i = asteroidsToRemove.length - 1; i >= 0; i--) {
        s.asteroids.splice(asteroidsToRemove[i], 1);
      }

      // Check ship-asteroid collisions
      if (!s.invulnerable) {
        for (const asteroid of s.asteroids) {
          if (checkCollision(ship.x, ship.y, ship.radius, asteroid.x, asteroid.y, asteroid.radius)) {
            s.lives--;
            setLives(s.lives);
            
            if (s.lives <= 0) {
              s.gameOver = true;
              setGameOver(true);
              
              // Record game metrics if user is logged in
              if (!metricsRecordedRef.current) {
                metricsRecordedRef.current = true;
                const user = getStoredUser();
                if (user) {
                  const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
                  console.log("Asteroids game over - recording metrics with score:", s.score, "level:", s.level, "destroyed:", s.asteroidsDestroyed);
                  recordGameMetrics({
                    playerName: user.name,
                    playerNickname: user.nickname,
                    gameType: "Asteroids",
                    outcome: "Loss",
                    score: s.score,
                    level: s.level,
                    asteroidsDestroyed: s.asteroidsDestroyed,
                    gameDuration: gameDuration
                  }).catch(err => console.error("Failed to record Asteroids metrics:", err));
                  
                  // Dispatch custom event to refresh top score
                  window.dispatchEvent(new CustomEvent('asteroidsGameEnded'));
                }
              }
            } else {
              resetShip();
            }
            break;
          }
        }
      }

      // Check if level is complete and advance
      if (s.asteroids.length === 0 && !s.gameOver) {
        if (s.asteroidsDestroyed >= s.asteroidsToDestroy) {
          // Level complete! Advance to next level
          s.level++;
          s.asteroidsDestroyed = 0;
          s.asteroidsToDestroy = isMobileRef.current ? (6 * s.level) : (12 * s.level);
          // Spawn initial asteroids for new level (3-8 asteroids based on level, reduced on mobile)
          spawnAsteroids(Math.min(3 + s.level, 8));
        } else {
          // Still working on current level, spawn more asteroids
          const remaining = s.asteroidsToDestroy - s.asteroidsDestroyed;
          const toSpawn = Math.min(remaining, Math.min(3 + s.level, 8));
          if (toSpawn > 0) {
            spawnAsteroids(toSpawn);
          }
        }
      }

  // Render
      ctx.fillStyle = settingsRef.current.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles (behind asteroids)
      s.particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw asteroids
      s.asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.strokeStyle = a.flash > 0 ? a.flashStroke : a.colorStroke;
        ctx.fillStyle = a.flash > 0 ? a.flashFill : a.colorFill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw irregular polygon for asteroid
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const variance = 0.7 + Math.sin(i * 2.3) * 0.3;
          const r = a.radius * variance;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Draw ship (with flashing when invulnerable)
      if (!s.invulnerable || Math.floor(s.invulnerableTime / 10) % 2 === 0) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        
        ctx.fillStyle = settingsRef.current.shipColor;
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 1.5;
        
        if (settingsRef.current.shipShape === 'circle') {
          // Draw circle ship
          ctx.beginPath();
          ctx.arc(0, 0, ship.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw direction indicator line
          ctx.rotate(ship.heading);
          ctx.strokeStyle = '#2b2b2b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(ship.radius * 1.5, 0);
          ctx.stroke();
        } else {
          // Draw triangle ship
          ctx.rotate(ship.heading);
          const L = ship.radius * 2.2; // length from center towards tip
          const W = ship.radius * 1.0; // base half-width
          
          ctx.beginPath();
          // Triangle pointing to +X in local space
          ctx.moveTo(L, 0);          // tip
          ctx.lineTo(-ship.radius * 0.8, W * 0.7);  // back-bottom
          ctx.lineTo(-ship.radius * 0.8, -W * 0.7); // back-top
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        
        ctx.restore();
      }

      // Draw bullets
      ctx.fillStyle = '#FF6B6B';
      s.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw HUD - compact format for all devices
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`S: ${s.score}`, 20, 30);
      ctx.fillText(`❤️ ${s.lives}`, 20, 50);
      
      // Draw top score in top-right corner
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFD700';
      ctx.font = '14px Arial';
  const ts2 = topScoreRef.current;
  const topScoreText2 = ts2.player ? `${ts2.player}: ${ts2.score}` : `${ts2.score}`;
  ctx.fillText(topScoreText2, s.width - 20, 30);
      
      // Highlight level and progress counter
      ctx.textAlign = 'left';
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#F6D55C';
      ctx.fillText(`L${s.level}`, 20, 75);
      
      // Progress bar with visual indicator
      const progressPercent = s.asteroidsDestroyed / s.asteroidsToDestroy;
      ctx.font = '14px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${s.asteroidsDestroyed}/${s.asteroidsToDestroy}`, 20, 95);
      
      // Draw progress bar
      const barX = 20;
      const barY = 100;
      const barWidth = 150;
      const barHeight = 10;
      
      // Background bar
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress fill
      ctx.fillStyle = progressPercent >= 1 ? '#3DDC97' : '#F6D55C';
      ctx.fillRect(barX, barY, barWidth * Math.min(progressPercent, 1), barHeight);
      
      // Bar border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Update thrust sound envelope after drawing frame (use anyAccel from earlier in step function)
  setThrustSound(anyAccel && !s.gameOver && !s.paused);

  rafRef.current = requestAnimationFrame(step);
    }

    resize();
    spawnAsteroids(isMobileRef.current ? 2 : 4);
  window.addEventListener('resize', resize);
  // Use non-passive listeners to allow preventDefault on control keys
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('keyup', handleKeyUp, { passive: false });

    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // Settings are used directly in render loop, no need to restart game loop on settings change

  const handleResetYes = () => {
    if (resetGameRef.current) {
      resetGameRef.current();
    }
  };

  const handleResetNo = () => {
    setShowResetConfirm(false);
    // Game remains paused, player can press P to unpause
  };

  return (
    <div
      className="asteroids-root"
      onTouchEnd={isMobile ? handleDoubleTap : undefined}
    >
      <div className="asteroids-instructions">
        {isMobile ? 'Use on-screen controls to play. Double-tap to pause.' : 'Use arrow keys or WASD to move. Press Space to shoot. P to pause. R to reset.'}
        {gameOver && <span style={{ color: '#FF6B6B', marginLeft: '1rem' }}>{isMobile ? 'Tap Reset to restart' : 'Press ENTER to restart'}</span>}
        {isPaused && !gameOver && !showResetConfirm && <span style={{ color: '#F6D55C', marginLeft: '1rem' }}>PAUSED</span>}
      </div>
      <canvas ref={canvasRef} className="asteroids-canvas" />
      
      {isMobile && (
        <>
          <div className="mobile-controls-left">
            <div className="arrow-keys">
              <button 
                className="mobile-arrow-btn mobile-arrow-up"
                onTouchStart={() => { stateRef.current.keys['ArrowUp'] = true; }}
                onTouchEnd={() => { stateRef.current.keys['ArrowUp'] = false; }}
                onMouseDown={() => { stateRef.current.keys['ArrowUp'] = true; }}
                onMouseUp={() => { stateRef.current.keys['ArrowUp'] = false; }}
                onMouseLeave={() => { stateRef.current.keys['ArrowUp'] = false; }}
              >
                ▲
              </button>
              <div className="arrow-keys-middle">
                <button 
                  className="mobile-arrow-btn mobile-arrow-left"
                  onTouchStart={() => { stateRef.current.keys['ArrowLeft'] = true; }}
                  onTouchEnd={() => { stateRef.current.keys['ArrowLeft'] = false; }}
                  onMouseDown={() => { stateRef.current.keys['ArrowLeft'] = true; }}
                  onMouseUp={() => { stateRef.current.keys['ArrowLeft'] = false; }}
                  onMouseLeave={() => { stateRef.current.keys['ArrowLeft'] = false; }}
                >
                  ◄
                </button>
                <button 
                  className="mobile-arrow-btn mobile-arrow-down"
                  onTouchStart={() => { stateRef.current.keys['ArrowDown'] = true; }}
                  onTouchEnd={() => { stateRef.current.keys['ArrowDown'] = false; }}
                  onMouseDown={() => { stateRef.current.keys['ArrowDown'] = true; }}
                  onMouseUp={() => { stateRef.current.keys['ArrowDown'] = false; }}
                  onMouseLeave={() => { stateRef.current.keys['ArrowDown'] = false; }}
                >
                  ▼
                </button>
                <button 
                  className="mobile-arrow-btn mobile-arrow-right"
                  onTouchStart={() => { stateRef.current.keys['ArrowRight'] = true; }}
                  onTouchEnd={() => { stateRef.current.keys['ArrowRight'] = false; }}
                  onMouseDown={() => { stateRef.current.keys['ArrowRight'] = true; }}
                  onMouseUp={() => { stateRef.current.keys['ArrowRight'] = false; }}
                  onMouseLeave={() => { stateRef.current.keys['ArrowRight'] = false; }}
                >
                  ►
                </button>
              </div>
            </div>
          </div>
          <div className="mobile-controls-right">
            <button 
              className="mobile-btn mobile-btn-shoot"
              onTouchStart={() => { 
                stateRef.current.keys['Space'] = true;
                setTimeout(() => { stateRef.current.keys['Space'] = false; }, 100);
              }}
              onClick={() => { 
                stateRef.current.keys['Space'] = true;
                setTimeout(() => { stateRef.current.keys['Space'] = false; }, 100);
              }}
            >
              🔥
            </button>
          </div>
          {gameOver && (
            <div className="mobile-controls-center">
              <button
                className="mobile-btn mobile-btn-reset"
                onClick={() => { 
                  if (resetGameRef.current) {
                    const s = stateRef.current;
                    s.gameOver = false;
                    setGameOver(false);
                    resetGameRef.current();
                  }
                }}
              >
                🔄
              </button>
            </div>
          )}
        </>
      )}      {showResetConfirm && (
        <div className="asteroids-modal-overlay">
          <div className="asteroids-modal">
            <h2>Reset Game?</h2>
            <p>Are you sure you want to reset? All progress will be lost.</p>
            <div className="asteroids-modal-buttons">
              <button 
                className="asteroids-modal-button asteroids-modal-button-yes"
                onClick={handleResetYes}
              >
                Yes, Reset
              </button>
              <button 
                className="asteroids-modal-button asteroids-modal-button-no"
                onClick={handleResetNo}
              >
                No, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
