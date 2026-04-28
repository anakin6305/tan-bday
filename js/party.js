/* ═══════════════════════════════════
   GLOBAL PARTY LAYER
   Balloons + Confetti + Streamers
   Runs across all screens always
═══════════════════════════════════ */

(function() {

  /* ── 1. FLOATING BALLOONS ── */
  const BALLOON_COLORS = [
    '#FF4D8D','#FFB800','#D4AAFF','#FF8FAB',
    '#FFE94D','#FF6B6B','#4DFFB4','#E8450A',
    '#B57BFF','#FF8FAB','#FFB800','#FF4D8D',
    '#FFE94D','#D4AAFF'
  ];

  const balloonContainer = document.createElement('div');
  balloonContainer.id = 'balloon-layer';
  balloonContainer.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  `;
  document.body.appendChild(balloonContainer);

  function createBalloon(index) {
    const size   = 44 + Math.random() * 36;
    const color  = BALLOON_COLORS[index % BALLOON_COLORS.length];
    const x      = 3 + Math.random() * 94; // % from left
    const dur    = 12 + Math.random() * 16; // seconds to float up
    const delay  = Math.random() * 20;      // stagger start
    const sway   = 18 + Math.random() * 24; // px horizontal sway

    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position: absolute;
      bottom: -120px;
      left: ${x}%;
      width: ${size}px;
      animation: balloonFloat ${dur}s ${delay}s ease-in-out infinite;
    `;

    // Balloon SVG: circle body + triangle knot + string
    wrap.innerHTML = `
      <svg width="${size}" height="${size * 1.35}" 
           viewBox="0 0 100 135" xmlns="http://www.w3.org/2000/svg">
        <!-- Balloon body -->
        <ellipse cx="50" cy="48" rx="46" ry="44" 
                 fill="${color}" opacity="0.92"/>
        <!-- Shine highlight -->
        <ellipse cx="35" cy="28" rx="14" ry="10" 
                 fill="white" opacity="0.25" 
                 transform="rotate(-30 35 28)"/>
        <!-- Knot -->
        <polygon points="44,90 56,90 50,100" 
                 fill="${color}" opacity="0.85"/>
        <!-- String -->
        <path d="M50,100 Q${50 + sway / 3},115 ${50 - sway / 5},135" 
              stroke="rgba(255,255,255,0.4)" 
              stroke-width="1.5" fill="none"/>
      </svg>
    `;

    balloonContainer.appendChild(wrap);
  }

  for (let i = 0; i < 14; i++) createBalloon(i);

  /* ── 2. CONFETTI RAIN ── */
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.id = 'confetti-rain-canvas';
  confettiCanvas.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    width: 100%;
    height: 100%;
  `;
  document.body.appendChild(confettiCanvas);
  const cctx = confettiCanvas.getContext('2d');

  function resizeConfettiCanvas() {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);

  const CONFETTI_COLORS = [
    '#FFB800','#FF4D8D','#D4AAFF','#FF8FAB',
    '#FFE94D','#FF6B6B','#ffffff','#E8450A','#4DFFB4'
  ];

  const CONFETTI_COUNT = 65;
  const pieces = Array.from({ length: CONFETTI_COUNT }, () => ({
    x:       Math.random() * window.innerWidth,
    y:       Math.random() * window.innerHeight - window.innerHeight,
    w:       5 + Math.random() * 7,
    h:       10 + Math.random() * 8,
    color:   CONFETTI_COLORS[
               Math.floor(Math.random() * CONFETTI_COLORS.length)
             ],
    speedY:  0.6 + Math.random() * 1.2,
    speedX:  (Math.random() - 0.5) * 0.8,
    angle:   Math.random() * Math.PI * 2,
    spin:    (Math.random() - 0.5) * 0.08,
    opacity: 0.5 + Math.random() * 0.5,
    shape:   Math.random() > 0.5 ? 'rect' : 'circle'
  }));

  function drawConfettiRain() {
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    pieces.forEach(p => {
      cctx.save();
      cctx.globalAlpha = p.opacity;
      cctx.fillStyle   = p.color;
      cctx.translate(p.x, p.y);
      cctx.rotate(p.angle);

      if (p.shape === 'circle') {
        cctx.beginPath();
        cctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        cctx.fill();
      } else {
        cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      cctx.restore();

      // Update position
      p.y     += p.speedY;
      p.x     += p.speedX;
      p.angle += p.spin;

      // Reset when off screen
      if (p.y > window.innerHeight + 20) {
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
      }
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
    });

    requestAnimationFrame(drawConfettiRain);
  }
  drawConfettiRain();

  /* ── 3. STREAMERS ── */
  const streamerWrap = document.createElement('div');
  streamerWrap.id = 'streamer-layer';
  streamerWrap.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  `;
  document.body.appendChild(streamerWrap);

  const STREAMER_COLORS = [
    'linear-gradient(180deg,#FF4D8D,#FFB800)',
    'linear-gradient(180deg,#D4AAFF,#FF8FAB)',
    'linear-gradient(180deg,#FFE94D,#FF6B6B)',
    'linear-gradient(180deg,#4DFFB4,#D4AAFF)',
    'linear-gradient(180deg,#FFB800,#FF4D8D)',
    'linear-gradient(180deg,#FF8FAB,#FFE94D)'
  ];

  [8, 22, 38, 58, 74, 90].forEach((xPct, i) => {
    const s = document.createElement('div');
    const dur = 6 + Math.random() * 6;
    const delay = Math.random() * 4;
    s.style.cssText = `
      position: absolute;
      top: -120px;
      left: ${xPct}%;
      width: ${4 + Math.random() * 4}px;
      height: ${80 + Math.random() * 80}px;
      background: ${STREAMER_COLORS[i]};
      border-radius: 4px;
      opacity: 0.7;
      animation: streamerFall ${dur}s ${delay}s ease-in-out infinite;
      transform-origin: top center;
    `;
    streamerWrap.appendChild(s);
  });

  /* ── 4. INJECT CSS KEYFRAMES ── */
  const style = document.createElement('style');
  style.textContent = `

    @keyframes balloonFloat {
      0%   { transform: translateY(0) translateX(0)    rotate(-3deg); 
             opacity: 0; }
      5%   { opacity: 0.9; }
      50%  { transform: translateY(-55vh) translateX(22px)  rotate(3deg); }
      100% { transform: translateY(-115vh) translateX(-10px) rotate(-2deg); 
             opacity: 0; }
    }

    @keyframes streamerFall {
      0%   { transform: translateY(0)    rotate(-8deg)  scaleX(1);   
             opacity: 0; }
      10%  { opacity: 0.75; }
      40%  { transform: translateY(45vh) rotate(12deg)  scaleX(0.6); }
      70%  { transform: translateY(80vh) rotate(-6deg)  scaleX(1.2); }
      100% { transform: translateY(115vh) rotate(8deg)  scaleX(0.8); 
             opacity: 0; }
    }

    /* Fairy lights upgrade — brighter, more colorful */
    .fairy-light {
      box-shadow:
        0 0 6px 3px currentColor,
        0 0 14px 6px currentColor !important;
    }

    /* Global glow upgrade on all nav buttons */
    .nav-btn {
      box-shadow:
        0 0 20px rgba(255,184,0,0.5),
        0 4px 20px rgba(232,69,10,0.4) !important;
      animation: btnPulse 2.5s ease-in-out infinite !important;
    }

    @keyframes btnPulse {
      0%,100% { box-shadow: 0 0 20px rgba(255,184,0,0.4),
                            0 4px 20px rgba(232,69,10,0.35); }
      50%      { box-shadow: 0 0 36px rgba(255,184,0,0.75),
                            0 8px 32px rgba(232,69,10,0.6); }
    }

    /* Progress dots upgrade */
    .progress-dot.active {
      background: #FFB800 !important;
      box-shadow: 0 0 10px #FFB800 !important;
    }
  `;
  document.head.appendChild(style);

})();
