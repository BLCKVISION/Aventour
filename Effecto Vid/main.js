/* ═══════════════════════════════════════════════════════════
   OMNIVISION — MAIN JAVASCRIPT
   Flow:
     1. Loader: isotipo scale-in centrado
     2. Isotipo desliza izq + clip del logotipo-clip se abre
        y logotipo PNG hace fade-in simultáneo
     3. Hold → cortina wipe up
     4. Hero: navbar + heading clip-cut stagger + subtitle + dashboard
     5. Navbar: se oculta al bajar scroll, aparece al subir
     6. About: ScrollTrigger stagger al entrar al viewport
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.normalizeScroll(true);

  /* ── Prevent scroll during load ────────────────────────── */
  document.body.style.overflow = 'hidden';

  /* ── Element refs ───────────────────────────────────────── */
  const loader        = document.getElementById('loader');
  const loaderLogo    = document.getElementById('loader-logo');
  const isotipo       = document.getElementById('loader-isotipo');
  const logotipoClip  = document.getElementById('loader-logotipo-clip');
  const logotipo      = document.getElementById('loader-logotipo');
  const site          = document.getElementById('site');
  const navbar        = document.getElementById('navbar');
  const lineInners    = document.querySelectorAll('#hero .line-inner');
  const wordInners    = document.querySelectorAll('.word-inner');
  const dashboard     = document.getElementById('dashboard-wrapper');
  const dashImg       = document.getElementById('dashboard-img');
  const glow          = document.getElementById('dashboard-glow');

  /* ═══════════════════════════════════════════════════════
     LOADER — initial states
  ═══════════════════════════════════════════════════════ */

  /* Center the group: isotipo is 52px, logotipo is 200px + 14px gap.
     At start, only isotipo is visible so we center on it:
     translate(-50%,-50%) on the flex container handles it. */
  gsap.set(loaderLogo,   { xPercent: -50, yPercent: -50 });
  gsap.set(isotipo,      { opacity: 0, scale: 0.65 });
  gsap.set(logotipoClip, { maxWidth: 0, opacity: 1 });  /* clip closed */
  gsap.set(logotipo,     { opacity: 0 });

  /* ═══════════════════════════════════════════════════════
     MASTER LOADER TIMELINE
  ═══════════════════════════════════════════════════════ */
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* Step 1 — Isotipo scale-in centrado */
  tl.to(isotipo, {
    opacity: 1,
    scale: 1,
    duration: 0.9,
    ease: 'back.out(1.5)'
  }, 0.3);

  /* Step 2a — Isotipo se desliza a la izquierda dentro del flex row.
     Animamos el loaderLogo completo hacia la izquierda para que
     visualmente el isotipo se desplace dejando espacio al logotipo. */
  const isMobileLoader = window.innerWidth <= 768;
  tl.to(loaderLogo, {
    xPercent: isMobileLoader ? -50 : -65,    /* en móvil lo dejamos en -50 para que quede perfectamente centrado */
    duration: 0.9,
    ease: 'power2.inOut'
  }, '+=0.5');

  /* Step 2b — Al mismo tiempo, abre el clip del logotipo */
  tl.to(logotipoClip, {
    maxWidth: 220,    /* abre hasta el ancho del logotipo */
    duration: 0.9,
    ease: 'power2.inOut'
  }, '<');

  /* Step 2c — Fade in del logotipo PNG mientras se abre el clip */
  tl.to(logotipo, {
    opacity: 1,
    duration: 0.75,
    ease: 'power2.out'
  }, '<0.1');

  /* Step 3 — Hold para que el usuario pueda leer */
  tl.to({}, { duration: 0.7 });

  /* Step 4 — Revelar el site antes del wipe */
  tl.call(() => {
    site.classList.remove('hidden');
    gsap.set(site, { visibility: 'visible', opacity: 1 });
  });

  /* Step 5 — Cortina negra sube como teatro */
  tl.to(loader, {
    yPercent: -100,
    duration: 1.05,
    ease: 'power4.inOut'
  });

  /* Step 6 — Cleanup */
  tl.call(() => {
    loader.style.display = 'none';
    document.body.style.overflow = '';
    
    runHeroAnimations();
    initAboutAnimations();
    initSequenceAnimation();
    initFeaturesAnimations();
    initOmniboxAnimations();
    initStepSlider();
    initNavScroll();

    // Fundamental: Refresh ScrollTrigger una vez que el DOM es visible
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  });

  /* ═══════════════════════════════════════════════════════
     HERO ANIMATIONS
  ═══════════════════════════════════════════════════════ */
  function runHeroAnimations() {

    /* Navbar drop-in inicial */
    gsap.to(navbar, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      delay: 0.08
    });

    /* Heading: clip cut line by line */
    gsap.to(lineInners, {
      y: 0,
      duration: 1.05,
      ease: 'power4.out',
      stagger: 0.2,
      delay: 0.22
    });

    /* Subtitle: word-by-word stagger */
    gsap.to(wordInners, {
      y: 0,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.04,
      delay: 0.52
    });

    /* Mobile hero button (if exists) */
    const mobileHeroBtn = document.querySelector('.mobile-hero-btn');
    if (mobileHeroBtn) {
      gsap.to(mobileHeroBtn, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.85
      });
    }

    /* Dashboard fade-up */
    gsap.to(dashboard, {
      opacity: 1, y: 0, scale: 1,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.65
    });

    /* Idle floating loop */
    gsap.to(dashImg, {
      y: -10,
      duration: 4.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2.2
    });

    /* Top glow pulse */
    gsap.to(glow, {
      opacity: 0.55,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2.8
    });
  }

  /* ═══════════════════════════════════════════════════════
     NAVBAR — HIDE ON SCROLL DOWN / SHOW ON SCROLL UP
     Usa la CSS transition que ya está definida en el navbar.
     Sólo cuando el navbar ya está visible (opacity: 1).
  ═══════════════════════════════════════════════════════ */
  function initNavScroll() {
    let lastScrollY    = 0;
    let navVisible     = true;
    let scrolledPast   = false;   /* true después de bajar 80px */

    /* Glass effect al pasar de 80px */
    ScrollTrigger.create({
      trigger: 'body',
      start: '80px top',
      onEnter: () => {
        scrolledPast = true;
        gsap.to(navbar, {
          backdropFilter: 'blur(20px)',
          background: 'rgba(0,0,0,0.65)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transform: 'translateZ(0)',
          duration: 0.4
        });
      },
      onLeaveBack: () => {
        scrolledPast = false;
        gsap.to(navbar, {
          backdropFilter: 'blur(0px)',
          background: 'transparent',
          borderBottom: '1px solid transparent',
          transform: 'none',
          duration: 0.4
        });
      }
    });

    /* Hide / show basado en dirección del scroll */
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const delta    = currentY - lastScrollY;

      /* Solo actuar si pasamos el umbral */
      if (currentY < 80) {
        if (!navVisible) {
          navVisible = true;
          navbar.style.transform = 'translateY(0)';
          navbar.style.opacity   = '1';
        }
        lastScrollY = currentY;
        return;
      }

      if (delta > 4 && navVisible) {
        /* Scrolling DOWN → ocultar */
        navVisible = false;
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.opacity   = '0';
      } else if (delta < -4 && !navVisible) {
        /* Scrolling UP → mostrar */
        navVisible = true;
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity   = '1';
      }

      lastScrollY = currentY;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════
     ABOUT / NOSOTROS SCROLL ANIMATIONS
  ═══════════════════════════════════════════════════════ */
  function initAboutAnimations() {

    /* Tags — stagger fade+up */
    gsap.from('.tag', {
      opacity: 0,
      y: 18,
      duration: 0.7,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#nosotros',
        start: 'top 80%',
      }
    });

    /* Title: clip-reveal.
       IMPORTANTE: el CSS ya tiene translateY(110%) en .line-inner.
       Usamos gsap.to() para animar DESDE ese estado CSS hacia y:0.
       gsap.from() no funciona correctamente cuando el CSS ya define el estado. */
    const aboutLines = document.querySelectorAll('#nosotros .line-inner');
    gsap.to(aboutLines, {
      y: 0,
      duration: 1.0,
      stagger: 0.18,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.nosotros-title',
        start: 'top 82%',
      }
    });

    /* Description fade */
    gsap.from('.nosotros-desc', {
      opacity: 0,
      y: 20,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.nosotros-desc',
        start: 'top 85%',
      }
    });

    /* Marquee fade in */
    gsap.from('.marquee-wrapper', {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.marquee-wrapper',
        start: 'top 90%',
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     HERO PARALLAX ON SCROLL
  ═══════════════════════════════════════════════════════ */
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(dashboard, {
        y: p * 55,
        rotationX: p * 4,
        transformPerspective: 1000
      });
      gsap.set('.hero-content', {
        y: p * -35,
        opacity: 1 - p * 0.5
      });
    }
  });

  /* ═══════════════════════════════════════════════════════
     FEATURES — SCROLLTRIGGER STAGGER
     Cards animate in per row as they enter the viewport.
     Inside each card, elements stagger: image -> title -> desc.
  ═══════════════════════════════════════════════════════ */
  function initFeaturesAnimations() {
    const cards = document.querySelectorAll('.feat-card');

    cards.forEach((card, i) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 50%',
          toggleActions: 'play none none none'
        }
      });

      const img = card.querySelector('.feat-img-wrap');
      const title = card.querySelector('.feat-desc strong');
      const text = card.querySelector('.feat-text');

      tl.to(img, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(title, { opacity: 1, duration: 0.7, ease: 'power2.out' }, "-=0.4")
        .to(text, { opacity: 1, duration: 0.7, ease: 'power2.out' }, "-=0.45")
        // Animate the CSS variable to fade in the card body last
        .to(card, { '--bg-opacity': 1, duration: 0.8, ease: 'power2.out' }, "-=0.2");
    });
  }
  /* ═══════════════════════════════════════════════════════
     OMNIBOX — SCROLLTRIGGER
  ═══════════════════════════════════════════════════════ */
  function initOmniboxAnimations() {
    gsap.to('#omnibox .line-inner', {
      scrollTrigger: {
        trigger: '#omnibox',
        start: 'top 50%',
        toggleActions: 'play none none none'
      },
      y: 0,
      yPercent: 0,
      duration: 1.05,
      ease: 'power4.out',
      stagger: 0.15
    });
  }

  /* ═══════════════════════════════════════════════════════
     STEP SLIDER
  ═══════════════════════════════════════════════════════ */
  function initStepSlider() {
    const tabs = document.querySelectorAll('.step-tab');
    const panels = document.querySelectorAll('.step-visual-panel');
    const contents = document.querySelectorAll('.step-content');
    if (!tabs.length) return;

    let currentStep = 0;
    let intervalId = null;
    const DURATION = 4000;

    function goToStep(index) {
        tabs.forEach(t => {
            t.classList.remove('active');
            const fill = t.querySelector('.step-tab-fill');
            if (fill) {
                fill.style.animation = 'none';
                fill.offsetHeight;
                fill.style.animation = '';
            }
        });
        panels.forEach(p => p.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tabs[index].classList.add('active');
        panels[index].classList.add('active');
        contents[index].classList.add('active');

        const columns = document.querySelectorAll('.step-column');
        columns.forEach((col, i) => {
            col.classList.toggle('active', i === index);
        });

        tabs.forEach((t, i) => {
            const label = t.querySelector('.step-tab-label');
            const dataLabel = t.getAttribute('data-label');
            if (label && dataLabel) {
                label.textContent = dataLabel;
            }
        });

        currentStep = index;
    }

    function nextStep() {
        goToStep((currentStep + 1) % tabs.length);
    }

    function startAutoPlay() {
        stopAutoPlay();
        intervalId = setInterval(nextStep, DURATION);
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            goToStep(i);
            startAutoPlay();
        });
    });

    const tlSlider = gsap.timeline({
      scrollTrigger: {
        trigger: '#slider-interactivo',
        start: 'top 50%',
        toggleActions: 'play none none none'
      }
    });
    tlSlider.from('#slider-interactivo .outro-inner', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
            .from('#slider-interactivo .step-visual', { scale: 0.95, opacity: 0, duration: 0.8, ease: 'power3.out' }, "-=0.4")
            .from('#slider-interactivo .step-tab', { y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, "-=0.4");

    goToStep(0);
    startAutoPlay();
  }

  /* ═══════════════════════════════════════════════════════
     SEQUENCE ANIMATION (200 to 1)
  ═══════════════════════════════════════════════════════ */
  function initSequenceAnimation() {
    const canvas = document.getElementById("sequence-canvas");
    const seqText = document.getElementById("sequence-text");
    if (!canvas) return;
    const context = canvas.getContext("2d");

    const setcanvassize = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        const isMobile = window.innerWidth <= 768;
        const targetHeight = isMobile ? window.innerHeight * 0.6 : window.innerHeight;

        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = targetHeight * pixelRatio;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = targetHeight + "px";
        context.scale(pixelRatio, pixelRatio);
    };

    setcanvassize();
    
    const frameCount = 200;
    const currentFrame = (index) => {
        // Starts at frame 200, ends at frame 1 as index goes 0 to 199
        const frameNum = 200 - index;
        return `img/${frameNum.toString().padStart(3, "0")}.webp`;
    };

    let images = [];
    let videoFrames = { frame: 0 };
    let imageToLoad = frameCount;

    const render = () => {
        const isMobile = window.innerWidth <= 768;
        const canvasWidth  = window.innerWidth;
        const canvasHeight = isMobile ? window.innerHeight * 0.6 : window.innerHeight;

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const img = images[videoFrames.frame];
        if (img && img.complete && img.naturalWidth > 0) {
            const imageAspect  = img.naturalWidth / img.naturalHeight;
            const canvasAspect = canvasWidth / canvasHeight;
            let drawWidth, drawHeight, drawX, drawY;

            if (imageAspect > canvasAspect) {
                drawHeight = canvasHeight;
                drawWidth  = canvasHeight * imageAspect;
                drawX      = (canvasWidth - drawWidth) / 2;
                drawY      = 0;
            } else {
                drawWidth  = canvasWidth;
                drawHeight = canvasWidth / imageAspect;
                drawX      = 0;
                drawY      = (canvasHeight - drawHeight) / 2;
            }
            context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }
    };

    const onLoad = () => {
        imageToLoad--;
        if (!imageToLoad) {
            render();
        }
    };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = function () {
            onLoad.call(this);
        };
        img.src = currentFrame(i);
        images.push(img);
    }

    ScrollTrigger.create({
        trigger: ".hero-sequence",
        start: "top top",
        end: `+=${window.innerHeight * 10}px`, // 10 viewports duration to slow it down
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        onUpdate: (self) => {
            const p = self.progress;
            const targetFrame = Math.min(Math.round(p * (frameCount - 1)), frameCount - 1);
            videoFrames.frame = targetFrame;
            render();
            
            // Fade in text word by word
            const words = document.querySelectorAll('.seq-word');
            if (words.length && p > 0.8) {
                const textP = (p - 0.8) / 0.2;
                words.forEach((word, index) => {
                    const threshold = index * (1 / words.length);
                    const wordP = (textP - threshold) * words.length; 
                    word.style.opacity = Math.max(0, Math.min(1, wordP));
                    const translateY = Math.max(0, 10 - wordP * 10);
                    word.style.transform = `translateY(${translateY}px)`;
                });
                if (seqText) seqText.style.opacity = 1;
            } else if (words.length) {
                words.forEach(word => {
                    word.style.opacity = 0;
                    word.style.transform = 'translateY(10px)';
                });
                if (seqText) seqText.style.opacity = 0;
            }
        }
    });

    window.addEventListener("resize", () => {
        setcanvassize();
        render();
    });
  }

  /* ═══════════════════════════════════════════════════════
     MOBILE MENU TOGGLE
  ═══════════════════════════════════════════════════════ */
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileMenuFooter = document.querySelector('.mobile-menu-footer');
  let menuOpen = false;

  if (mobileToggle && mobileOverlay) {
    mobileToggle.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileToggle.classList.toggle('active');
      document.body.classList.toggle('menu-open', menuOpen);
      
      if (menuOpen) {
        gsap.to(mobileOverlay, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
        gsap.to(mobileLinks, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
        if(mobileMenuFooter) gsap.to(mobileMenuFooter, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.5 });
      } else {
        gsap.to(mobileLinks, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' });
        if(mobileMenuFooter) gsap.to(mobileMenuFooter, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to(mobileOverlay, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.in', delay: 0.2 });
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        gsap.to(mobileLinks, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' });
        if(mobileMenuFooter) gsap.to(mobileMenuFooter, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to(mobileOverlay, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.in', delay: 0.2 });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     USER DROPDOWN TOGGLE
  ═══════════════════════════════════════════════════════ */
  const userToggle = document.querySelector('.mobile-login');
  const userDropdown = document.querySelector('.user-dropdown');
  
  if (userToggle && userDropdown) {
    userToggle.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        userDropdown.classList.toggle('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (!userToggle.contains(e.target)) {
        userDropdown.classList.remove('active');
      }
    });
  }
});
