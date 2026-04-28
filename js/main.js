/**
 * Tanisha's 22nd Birthday - Cinematic Web Experience
 * main.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================
  // CONSTANTS & STATE
  // =========================================
  const TOTAL_SCREENS = 6;
  let currentScreen = 1;
  let musicStarted = false;

  // DOM Elements
  const screens = document.querySelectorAll('.screen');
  const navBtns = document.querySelectorAll('.nav-btn[data-target]');
  const progressContainer = document.getElementById('progressIndicator');
  const bgMusic = document.getElementById('bgMusic');
  const musicController = document.getElementById('musicController');
  const vinylRecord = musicController.querySelector('.vinyl-record');
  const mutedIcon = musicController.querySelector('.muted-icon');

  /* ── SCREEN 1 VIDEO AUTOPLAY FALLBACK ── */
  const s1Video = document.getElementById('s1Video');

  if (s1Video) {
    // Attempt autoplay immediately (muted, so browsers allow it)
    s1Video.play().catch(() => {
      // If blocked, play on first user interaction
      document.addEventListener('click', () => {
        s1Video.play().catch(() => {});
      }, { once: true });
    });

    // When bg music starts playing, keep video muted
    // (video is always muted — music is the audio layer)
    s1Video.muted = true;
    s1Video.volume = 0;
  }

  // =========================================
  // BACKGROUND MUSIC CONTROLLER
  // =========================================
  bgMusic.volume = 0.35;

  const attemptPlayMusic = () => {
    if (!musicStarted) {
      bgMusic.play().then(() => {
        musicStarted = true;
        vinylRecord.classList.add('playing');
        mutedIcon.style.display = 'none';
      }).catch((e) => {
        console.log("Autoplay blocked. Waiting for interaction.");
      });
    }
  };

  // Try on load
  attemptPlayMusic();

  // Try on first interaction anywhere
  document.body.addEventListener('click', attemptPlayMusic, { once: true });
  document.body.addEventListener('keydown', attemptPlayMusic, { once: true });

  // Toggle mute
  musicController.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent triggering the body click
    if (!musicStarted) {
      attemptPlayMusic();
      return;
    }
    bgMusic.muted = !bgMusic.muted;
    if (bgMusic.muted) {
      vinylRecord.classList.remove('playing');
      mutedIcon.style.display = 'block';
    } else {
      vinylRecord.classList.add('playing');
      mutedIcon.style.display = 'none';
    }
  });

  // =========================================
  // SCREEN MANAGER
  // =========================================
  
  // Build Progress Indicators
  for (let i = 1; i <= TOTAL_SCREENS; i++) {
    const dot = document.createElement('div');
    dot.className = `dot ${i === 1 ? 'active' : ''}`;
    dot.dataset.screen = i;
    dot.addEventListener('click', () => showScreen(i));
    progressContainer.appendChild(dot);
  }
  const dots = document.querySelectorAll('.dot');

  const curtain = document.getElementById('transitionCurtain');
  let isAnimating = false;

  const showScreen = (n) => {
    if (n === 3) console.log("screen 3 shown");
    if (n === currentScreen && n !== 1) return;
    if (isAnimating) return;
    
    isAnimating = true;
    curtain.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)';
    curtain.classList.add('slide-in');
    
    setTimeout(() => {
      executeScreenSwitch(n);
      curtain.classList.remove('slide-in');
      curtain.classList.add('slide-out');
      
      setTimeout(() => {
        curtain.style.transition = 'none';
        curtain.classList.remove('slide-out');
        isAnimating = false;
      }, 500);
    }, 500);
  };

  const executeScreenSwitch = (n) => {
    // Reset to 1 logic
    if (n === 1 && currentScreen === 8) {
       // Only reset visual state, not music
       document.getElementById('cakeModal').classList.remove('active');
       document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('flipped'));
    }

    screens.forEach(screen => screen.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Reset animations for screens 3, 4, 5
    document.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));
    const s3Overlay = document.getElementById('s3Overlay');
    if (s3Overlay) s3Overlay.classList.remove('active');
    
    const targetScreen = document.getElementById(`screen-${n}`);
    if (targetScreen) targetScreen.classList.add('active');
    if (dots[n-1]) dots[n-1].classList.add('active');
    
    // Toggle progress visibility (hide on screen 1)
    if (n === 1) {
      progressContainer.style.opacity = '0';
      progressContainer.style.pointerEvents = 'none';
    } else {
      progressContainer.style.opacity = '1';
      progressContainer.style.pointerEvents = 'auto';
    }

    currentScreen = n;
    
    // Screen-specific triggers
    const s1Vid = document.getElementById('s1Video');

    if (n === 1) {
      // Resume video when returning to screen 1
      if (s1Vid) s1Vid.play().catch(() => {});

      const titleSpan = document.querySelector('.entrance-title span');
      if(titleSpan) titleSpan.parentElement.classList.remove('animate');
      setTimeout(() => {
        document.querySelector('.entrance-title').classList.add('animate');
      }, 50);
      setTimeout(() => {
        const q = document.querySelector('.letter-quote');
        if (q) q.classList.add('lq-visible');
      }, 800);

      // Party Popper Burst at 3.5s
      setTimeout(() => {
        confetti({ 
          particleCount: 120, spread: 80, origin: { x: 0, y: 0.5 },
          colors: ['#FFB800','#FF4D8D','#D4AAFF','#FFE94D','#FF6B6B'], startVelocity: 45
        });
        confetti({ 
          particleCount: 120, spread: 80, origin: { x: 1, y: 0.5 },
          colors: ['#FFB800','#FF4D8D','#D4AAFF','#FFE94D','#FF6B6B'], startVelocity: 45
        });
      }, 3500);
    } else {
      // Pause when leaving screen 1 — saves battery/performance
      if (s1Vid) s1Vid.pause();
    }
    
    if (n === 2) {
      triggerLetterReveal();
      
      // Reset and trigger quote appearance
      const quote = document.querySelector('.s2-quote');
      if (quote) {
        quote.classList.remove('lq-visible');
        setTimeout(() => {
          quote.classList.add('lq-visible');
        }, 2500);
      }

      // Scroll screen 2 back to top on every visit
      const s2 = document.getElementById('screen-2');
      if (s2) s2.scrollTop = 0;
    }
    if (n === 3) {
      animateScreen3();
    } else if (window.resetScreen3Overlay) {
      window.resetScreen3Overlay();
    }
    if (n === 4) {
      // Reset scroll to top when entering gallery
      const s4 = document.getElementById('screen-4');
      if (s4) s4.scrollTop = 0;
      // Trigger card entrance animations
      if (window.animateScreen4) window.animateScreen4();
    }
    
    // Clear any previous fireworks interval
    if (window.fireworksInterval) {
      clearInterval(window.fireworksInterval);
      window.fireworksInterval = null;
    }

    if (n === 6) {
      triggerFinalTypewriter();
      fireFireworks();
      
      let fireCount = 0;
      window.fireworksInterval = setInterval(() => {
        fireCount++;
        // Gradually reduce fireworks density
        if (fireCount > 3) {
          clearInterval(window.fireworksInterval);
        } else {
          fireFireworks(1 - (fireCount * 0.25)); // Reduce scalar/particles
        }
      }, 6000);
    }
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Get target from the clicked button, or its closest nav-btn parent
      const targetElement = e.target.closest('.nav-btn');
      if (!targetElement) return;
      const target = parseInt(targetElement.dataset.target);
      if (!isNaN(target)) showScreen(target);
    });
  });

  // Wire Screen 2 continue button specifically
  const s2Btn = document.querySelector('.s2-continue-btn');
  if (s2Btn) {
    s2Btn.addEventListener('click', () => showScreen(3));
  }

  // Setup Title Animation for Screen 1
  const title = document.querySelector('.entrance-title');
  if (title) {
    const text = title.textContent;
    title.innerHTML = '';
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${i * 60}ms`;
      title.appendChild(span);
    });
    title.classList.add('animate');
  }

  // Animate quote on Screen 1
  setTimeout(() => {
    const q = document.querySelector('.letter-quote');
    if (q) q.classList.add('lq-visible');
  }, 800);

  // =========================================
  // UTILITIES (Typewriter & Word Reveal)
  // =========================================
  let letterRevealed = false;
  const triggerLetterReveal = () => {
    if (letterRevealed) return;
    const letterBody = document.getElementById('letterBody');
    if (!letterBody) return;
    
    const paragraphs = letterBody.querySelectorAll('.s2-para');
    let globalDelayIndex = 0;
    
    paragraphs.forEach((p) => {
      const text = p.innerHTML;
      p.innerHTML = '';
      
      // Split paragraph by spaces for word reveal
      const words = text.split(/\s+/).filter(w => w);
      
      words.forEach((word) => {
        const span = document.createElement('span');
        span.innerHTML = word + ' ';
        p.appendChild(span);
        
        setTimeout(() => {
          span.style.opacity = '1';
        }, globalDelayIndex * 35);
        globalDelayIndex++;
      });
    });
    
    letterRevealed = true;
  };

  const typewrite = (elementId, text, speed, delay) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (!el) return resolve();
        el.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
          if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, speed);
      }, delay);
    });
  };

  let finalRevealed = false;
  const triggerFinalTypewriter = () => {
    if (finalRevealed) return;
    
    // Staged entry
    const s6Staged = document.querySelector('.s6-staged');
    if (s6Staged) s6Staged.classList.add('is-visible');

    // Ambient audio
    const ambientAudio = document.getElementById('ambientAudio');
    if (ambientAudio) {
      ambientAudio.volume = 0.1;
      ambientAudio.play().catch(() => {});
    }

    // Typewriter
    typewrite('finalTypewriter1', 'Always here,', 60, 900).then(() => {
      typewrite('finalTypewriter2', 'Always got you.', 60, 300).then(() => {
        triggerStarRain();
        
        // Trigger Cinematic Fade Out after 6.5s
        setTimeout(triggerCinematicEnding, 6500);
      });
    });
    finalRevealed = true;
  };

  const fadeOutAllAudio = (duration) => {
    const allAudio = document.querySelectorAll('audio');
    const step = 50;
    const totalSteps = duration / step;
    
    allAudio.forEach(audio => {
      if (!audio.paused && audio.volume > 0) {
        const volStep = audio.volume / totalSteps;
        const fadeInterval = setInterval(() => {
          if (audio.volume > volStep) {
            audio.volume -= volStep;
          } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeInterval);
          }
        }, step);
      }
    });
  };

  const triggerCinematicEnding = () => {
    // Fade out audio over 2s
    fadeOutAllAudio(2000);

    // Step 1: Dim content
    const finalContent = document.querySelector('.final-content');
    if (finalContent) {
      finalContent.style.opacity = '0.2';
    }

    // Clear fireworks interval
    if (window.fireworksInterval) {
      clearInterval(window.fireworksInterval);
      window.fireworksInterval = null;
    }

    // Step 2: Fade to black
    setTimeout(() => {
      const cinemaOverlay = document.getElementById('s6CinemaOverlay');
      if (cinemaOverlay) {
        cinemaOverlay.classList.add('fade-to-black');
      }
    }, 800);

    // Step 3: Signature
    setTimeout(() => {
      const signature = document.getElementById('s6Signature');
      if (signature) {
        signature.classList.add('show');
        
        // Hold for 1.5s, then fade out completely
        setTimeout(() => {
          signature.classList.remove('show');
        }, 1500);
      }
    }, 2600); // 800ms dim + 1.8s fade to black
  };

  function fireFireworks(scale = 1) {
    if (scale <= 0) return;
    const positions = [
      {x:0.2,y:0.2},{x:0.8,y:0.15},{x:0.5,y:0.1},
      {x:0.15,y:0.4},{x:0.85,y:0.35},{x:0.5,y:0.3}
    ];
    positions.forEach((pos, i) => {
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(80 * scale),
          spread: 360,
          startVelocity: 30,
          gravity: 0.4,
          ticks: 200,
          origin: pos,
          colors: ['#FFB800','#FF4D8D','#D4AAFF','#FFE94D','#FF6B6B','#ffffff'],
          scalar: 1.1 * scale
        });
      }, i * 400);
    });
  }

  function triggerStarRain() {
    const container = document.getElementById('screen-6');
    for (let i = 0; i < 20; i++) {
      const star = document.createElement('span');
      star.textContent = '⭐';
      star.style.position = 'absolute';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = '-50px';
      star.style.fontSize = (16 + Math.random() * 12) + 'px';
      star.style.opacity = 0.6 + Math.random() * 0.4;
      star.style.zIndex = 5;
      star.style.willChange = 'transform, opacity';
      
      const dur = 2 + Math.random() * 3;
      star.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
      
      container.appendChild(star);
      
      // Force reflow
      star.offsetHeight;
      
      star.style.transform = `translate3d(0, ${window.innerHeight + 100}px, 0)`;
      
      setTimeout(() => {
        if(star.parentNode) star.parentNode.removeChild(star);
      }, dur * 1000);
    }
  }







  // =========================================
  // CAKE & CONFETTI
  // =========================================
  const cake = document.getElementById('birthdayCake');
  const flames = document.querySelectorAll('.flame');
  const cakeModal = document.getElementById('cakeModal');

  // Add sprinkles to tiers
  const colors = ['#D4881A', '#C1440E', '#E8B4A0', '#C9A8C7', '#F2C97A', '#ffffff'];
  document.querySelectorAll('.tier').forEach(tier => {
    for (let i = 0; i < 7; i++) {
      const sprinkle = document.createElement('div');
      sprinkle.className = 'sprinkle';
      sprinkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      sprinkle.style.left = `${10 + Math.random() * 80}%`;
      sprinkle.style.top = `${20 + Math.random() * 60}%`;
      sprinkle.style.transform = `rotate(${Math.random() * 360}deg)`;
      tier.appendChild(sprinkle);
    }
  });

  cake.addEventListener('click', () => {
    // 1. Blow out candles and remove sparkles
    flames.forEach((flame, index) => {
      setTimeout(() => {
        flame.style.opacity = '0';
        flame.style.transform = 'scaleY(0)';
      }, index * 150);
    });
    const sparkles = document.querySelector('.cake-sparkles');
    if (sparkles) {
      sparkles.style.opacity = '0';
      setTimeout(() => sparkles.remove(), 300);
    }
    cake.style.animation = 'none';

    // 2. Confetti cannon & corner bursts
    setTimeout(() => {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
      
      // Center burst
      confetti({
        particleCount: 400,
        spread: 360,
        colors: colors,
        velocity: 80,
        gravity: 0.8,
        scalar: 1.2,
        origin: { x: 0.5, y: 0.6 }
      });

      // Post-blow corner bursts
      const corners = [{x:0,y:0}, {x:1,y:0}, {x:0,y:1}, {x:1,y:1}];
      corners.forEach((origin, i) => {
        setTimeout(() => {
          confetti({
            particleCount: 60,
            spread: 70,
            startVelocity: 40,
            origin: origin,
            colors: ['#FFB800','#FF4D8D','#D4AAFF','#FFE94D','#FF6B6B']
          });
        }, i * 200);
      });
    }, 600);

    // 3. Show Modal
    setTimeout(() => {
      cakeModal.classList.add('active');
    }, 1400); // Delayed slightly to let corner bursts finish
  });

  // =========================================
  // BACKGROUND EFFECTS (CANVAS BOKEH & FAIRY LIGHTS)
  // =========================================
  
  // Fairy Lights
  const bulbColors = ['#FF4D8D', '#FFB800', '#D4AAFF', '#FF8FAB', '#FFE94D', '#4DFFB4', '#FF6B6B', '#ffffff'];
  const lightsContainer = document.getElementById('fairyLights');
  if (lightsContainer) {
    for (let i = 0; i < 40; i++) {
      const light = document.createElement('div');
      light.className = `light-bulb`;
      light.style.color = bulbColors[i % bulbColors.length];
      light.style.background = 'currentColor';
      light.style.animationDelay = `${Math.random() * 2}s`;
      lightsContainer.appendChild(light);
    }
  }

  const lightsBottom = document.getElementById('fairyLightsBottom');
  if (lightsBottom) {
    for (let i = 0; i < 40; i++) {
      const light = document.createElement('div');
      light.className = `light-bulb`;
      // Offset color cycle
      light.style.color = bulbColors[(i + 4) % bulbColors.length];
      light.style.background = 'currentColor';
      light.style.animationDelay = `${Math.random() * 2}s`;
      lightsBottom.appendChild(light);
    }
  }

  // Generate 14 Rose Petals dynamically
  const petalsContainer = document.querySelector('.rose-petals-container');
  if (petalsContainer) {
    const petalColors = ['#E8B4A0', '#C9A8C7', '#FF8FAB', '#FF4D8D'];
    for (let i = 0; i < 14; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const c1 = petalColors[Math.floor(Math.random()*petalColors.length)];
      const c2 = petalColors[Math.floor(Math.random()*petalColors.length)];
      petal.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
      const size = 12 + Math.random() * 16;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDelay = `${Math.random() * 10}s`;
      petal.style.animationDuration = `${10 + Math.random() * 10}s`;
      petalsContainer.appendChild(petal);
    }
  }

  // Bokeh Canvas
  const canvas = document.getElementById('bokehCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];

  const initCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    particles = [];
    const numParticles = window.innerWidth > 768 ? 150 : 80; // scale for mobile
    
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = 2 + Math.random() * 16;
      this.speedY = 0.1 + Math.random() * 0.3;
      this.speedX = (Math.random() - 0.5) * 0.5;
      
      const c = ['#FFB800','#FF4D8D','#D4AAFF','#FF8FAB','#FFE94D','#FF6B6B','#ffffff','#4DFFB4','#E8450A'];
      
      // Convert hex to rgb string for rgba usage
      const hex = c[Math.floor(Math.random() * c.length)];
      const bigint = parseInt(hex.replace('#',''), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      
      this.colorBase = `rgba(${r}, ${g}, ${b}, `;
      
      this.maxOpacity = 0.04 + Math.random() * 0.18; // max up to ~0.22
      this.opacity = Math.random() * this.maxOpacity;
      this.fadeDir = Math.random() > 0.5 ? 1 : -1;
      this.fadeSpeed = 0.001 + Math.random() * 0.002;
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      // Drift upwards
      this.y -= this.speedY;
      // Drift horizontally with sine wave
      this.angle += 0.02;
      this.x += Math.sin(this.angle) * this.speedX;

      // Wrap around
      if (this.y < -this.size) this.y = height + this.size;
      if (this.x < -this.size) this.x = width + this.size;
      if (this.x > width + this.size) this.x = -this.size;

      // Pulse opacity
      this.opacity += this.fadeSpeed * this.fadeDir;
      if (this.opacity >= this.maxOpacity) {
        this.opacity = this.maxOpacity;
        this.fadeDir = -1;
      } else if (this.opacity <= 0) {
        this.opacity = 0;
        this.fadeDir = 1;
        // reset position sometimes for organic feel
        if (Math.random() > 0.8) {
          this.y = height + this.size;
          this.x = Math.random() * width;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.colorBase}${this.opacity})`;
      ctx.fill();
    }
  }

  const animateCanvas = () => {
    ctx.clearRect(0, 0, width, height);
    
    // Check if on final screen to boost density slightly
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id === 'screen-8') {
      if (particles.length < (window.innerWidth > 768 ? 180 : 90)) {
        particles.push(new Particle());
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animateCanvas);
  };

  window.addEventListener('resize', initCanvas);
  
  // Start
  initCanvas();
  animateCanvas();
});

/* ══════════════════════════════════════
   SCREEN 3 — IMAGE BURST REVEAL
══════════════════════════════════════ */

(function() {
  const overlay = document.getElementById('s3Overlay');
  const cloneImg = document.querySelector('.s3-overlay-img');
  const cloneContainer = document.querySelector('.s3-overlay-clone-container');
  let isBusy = false;

  function resetOverlay() {
    if (overlay) overlay.classList.remove('s3-overlay-active', 's3-backdrop-in');
    if (cloneImg) {
      cloneImg.src = '';
      cloneImg.alt = '';
    }
    if (cloneContainer) {
      cloneContainer.style.filter = '';
      cloneContainer.style.transform = '';
    }
  }

  function initS3Cards() {
    if (cloneImg) cloneImg.src = '';

    const nextBtn = document.querySelector('.s3-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const dotTarget = document.querySelector('.dot[data-screen="4"]');
        if (dotTarget) dotTarget.click();
      });
    }

    document.querySelectorAll('.s3-card').forEach(card => {
      card.addEventListener('click', () => {
        if (isBusy) return;
        const isRevealed = card.classList.contains('s3-revealed');
        
        if (!isRevealed) {
          doBurst(card);
        } else {
          resetCard(card);
        }
      });
    });
  }

  function doBurst(card) {
    const imgSrc = card.dataset.img;
    if (!imgSrc) return;
    if (isBusy) return;

    isBusy = true;
    const rect = card.getBoundingClientRect();
    
    if (cloneImg) {
      cloneImg.src = '';
      cloneImg.alt = '';
      void cloneImg.offsetWidth; // force reset
      cloneImg.src = imgSrc;
    }
    
    if (cloneContainer && overlay) {
      // Set initial position of clone container
      cloneContainer.style.transition = 'none';
      cloneContainer.style.left = rect.left + 'px';
      cloneContainer.style.top = rect.top + 'px';
      cloneContainer.style.width = rect.width + 'px';
      cloneContainer.style.height = rect.height + 'px';
      cloneContainer.style.borderRadius = '20px';
      
      overlay.classList.add('s3-overlay-active');
      
      // Force reflow
      cloneContainer.offsetHeight;
      
      // Expand
      cloneContainer.style.transition = 'all 0.72s cubic-bezier(0.2, 0.8, 0.2, 1)';
      cloneContainer.style.filter = 'blur(2px)';
      cloneContainer.style.transform = 'scale(1.015) translate3d(0,0,0)';
      const targetWidth = window.innerWidth * 0.8;
      const targetHeight = window.innerHeight * 0.8;
      const targetLeft = (window.innerWidth - targetWidth) / 2;
      const targetTop = (window.innerHeight - targetHeight) / 2;
      
      cloneContainer.style.left = targetLeft + 'px';
      cloneContainer.style.top = targetTop + 'px';
      cloneContainer.style.width = targetWidth + 'px';
      cloneContainer.style.height = targetHeight + 'px';
      
      setTimeout(() => {
        cloneContainer.style.filter = 'blur(0px)';
        cloneContainer.style.transform = 'scale(1) translate3d(0,0,0)';
      }, 720);

      // Wait and Shrink
      setTimeout(() => {
        // Get new rect in case window resized
        const newRect = card.getBoundingClientRect();
        cloneContainer.style.transition = 'all 0.62s cubic-bezier(0.4, 0, 0.2, 1)';
        cloneContainer.style.filter = 'blur(2px)';
        cloneContainer.style.transform = 'scale(0.985) translate3d(0,0,0)';
        cloneContainer.style.left = newRect.left + 'px';
        cloneContainer.style.top = newRect.top + 'px';
        cloneContainer.style.width = newRect.width + 'px';
        cloneContainer.style.height = newRect.height + 'px';
        
        setTimeout(() => {
          cloneContainer.style.filter = 'blur(0px)';
          cloneContainer.style.transform = 'scale(1) translate3d(0,0,0)';
        }, 620);

        setTimeout(function () {
          // FORCE reveal immediately after 80ms delay
          setTimeout(() => {
            requestAnimationFrame(function () {
              card.classList.add('s3-revealed');
            });
          }, 80);

          // Hide overlay safely
          if (overlay) overlay.classList.remove('s3-overlay-active');

          // Confetti
          if (window.confetti && !card.dataset.burstDone) {
            confetti({
              particleCount: 25,
              spread: 40,
              origin: {
                x: (newRect.left + newRect.width / 2) / window.innerWidth,
                y: (newRect.top + newRect.height / 2) / window.innerHeight
              },
              colors: ['#FFB800','#FF4D8D','#D4AAFF']
            });
            card.dataset.burstDone = 'true';
          }
          
          resetOverlay();
          isBusy = false;
        }, 620);
        
      }, 1200); // 0.72s expand + 0.48s pause
    }
  }

  function resetCard(card) {
    isBusy = true;
    card.classList.remove('s3-revealed');
    setTimeout(() => {
      isBusy = false;
    }, 400); // match CSS transition time
  }

  function animateS3Cards() {
    resetOverlay(); // cleanup just in case
    document.querySelectorAll('.s3-card').forEach((card, i) => {
      card.classList.remove('s3-visible');
      card.classList.remove('s3-revealed');
    });

    setTimeout(() => {
      document.querySelectorAll('.s3-card').forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('s3-visible');
        }, i * 60);
      });
    }, 60);
  }

  document.addEventListener('DOMContentLoaded', initS3Cards);
  window.animateScreen3 = animateS3Cards;
  window.resetScreen3Overlay = resetOverlay;

})();

/* ══════════════════════════════════════
   SCREEN 4 — SCRAPBOOK GALLERY
══════════════════════════════════════ */

(function() {

  const PHOTO_COUNT = 10;
  let currentPhotoIndex = 0;

  /* ── TABS ── */
  function initTabs() {
    document.querySelectorAll('.sb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sb-tab')
          .forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sb-tab-content')
          .forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(
          'sb-' + tab.dataset.tab
        );
        if (target) target.classList.add('active');
      });
    });
  }

  /* ── PHOTO CARD ENTRANCES ── */
  function animatePhotoCards() {
    document.querySelectorAll('.sb-photo-card').forEach(card => {
      card.classList.remove('sb-visible');
    });
    setTimeout(() => {
      document.querySelectorAll('.sb-photo-card').forEach(card => {
        card.classList.add('sb-visible');
      });
    }, 60);
  }

  /* ── LIGHTBOX ── */
  const lightbox  = document.getElementById('sbLightbox');
  const lbImg     = document.getElementById('sbLightboxImg');
  const lbCounter = document.getElementById('sbCounter');
  const lbPrev    = document.getElementById('sbPrev');
  const lbNext    = document.getElementById('sbNext');
  const lbClose   = document.getElementById('sbClose');
  const lbBackdrop = document.getElementById('sbBackdrop');

  function openLightbox(index) {
    currentPhotoIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const n = currentPhotoIndex + 1;
    lbImg.src = 'assets/photos/photo' + n + '.jpg';
    lbCounter.textContent = n + ' / ' + PHOTO_COUNT;
    // Fade effect on image switch
    lbImg.style.opacity = '0';
    setTimeout(() => { lbImg.style.opacity = '1'; }, 80);
    lbImg.style.transition = 'opacity 0.3s ease';
  }

  function prevPhoto() {
    currentPhotoIndex = 
      (currentPhotoIndex - 1 + PHOTO_COUNT) % PHOTO_COUNT;
    updateLightboxImage();
  }

  function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % PHOTO_COUNT;
    updateLightboxImage();
  }

  if (lbPrev)    lbPrev.addEventListener('click', prevPhoto);
  if (lbNext)    lbNext.addEventListener('click', nextPhoto);
  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     closeLightbox();
  });

  // Touch/swipe support
  let touchStartX = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextPhoto() : prevPhoto();
      }
    }, { passive: true });
  }

  // Wire photo cards to lightbox
  function initPhotoCards() {
    const emojis = ['🌸','🎀','🎊','🎈','✨','💜','🩷','⭐','🎂','🍂','💫','🌟'];
    document.querySelectorAll('.sb-photo-card').forEach((card, i) => {
      card.addEventListener('click', () => openLightbox(i));
      
      const sticker = card.querySelector('.sb-sticker');
      if (sticker) {
        sticker.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        if (i % 3 === 2) {
          const mini = document.createElement('div');
          mini.className = 'sb-sticker';
          mini.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          mini.style.fontSize = '1rem';
          mini.style.top = '10px';
          mini.style.left = '10px';
          mini.style.bottom = 'auto';
          mini.style.right = 'auto';
          // Avoid triggering lightbox when clicking mini sticker
          mini.addEventListener('click', (e) => e.stopPropagation());
          card.appendChild(mini);
        }
      }
    });
  }

  /* ── VIDEO MODAL ── */
  const videoModal  = document.getElementById('sbVideoModal');
  const modalVideo  = document.getElementById('sbModalVideo');
  const vmClose     = document.getElementById('sbVmClose');
  const vmBackdrop  = document.getElementById('sbVmBackdrop');

  function openVideoModal(src) {
    modalVideo.src = src;
    modalVideo.load();
    modalVideo.play().catch(() => {});
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    modalVideo.pause();
    modalVideo.src = '';
    videoModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (vmClose)    vmClose.addEventListener('click', closeVideoModal);
  if (vmBackdrop) vmBackdrop.addEventListener('click', closeVideoModal);

  document.addEventListener('keydown', e => {
    if (videoModal.classList.contains('open') && e.key === 'Escape') {
      closeVideoModal();
    }
  });

  function initVideoCards() {
    document.querySelectorAll('.sb-video-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        openVideoModal(thumb.dataset.src);
      });
    });
  }

  /* ── NAV BUTTON ── */
  function initNavBtn() {
    const btn = document.querySelector('.sb-next-btn');
    if (btn) btn.addEventListener('click', () => {
      const dotTarget = document.querySelector('.dot[data-screen="5"]');
      if (dotTarget) dotTarget.click();
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initPhotoCards();
    initVideoCards();
    initNavBtn();
  });

  /* ── EXPORT animate function for showScreen() ── */
  window.animateScreen4 = animatePhotoCards;

})();
