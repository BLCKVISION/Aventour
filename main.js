/* ============================================================
   AVENTOUR — MAIN.JS
   Stack: Vanilla JS + GSAP 3 + ScrollTrigger + Lenis
   NOTA: SplitText es Club GSAP (premium), no usamos CDN gratuito.
         Animamos las .hero__title-line directamente con mask reveal.
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {

  // Forzar que la página siempre cargue arriba para que el preloader funcione bien
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Registrar plugins GSAP (solo los disponibles en CDN gratuito)
  gsap.registerPlugin(ScrollTrigger);

  // Evitar Flash of Unstyled Content (elementos visibles antes del scroll)
  gsap.set('.hero__subtitle, .features__bg, .features__title, .metric, .package-card, .packages__info > *, .cta__breadcrumb, .footer__watermark, .footer__panel, .footer__bottom-row', { opacity: 0 });

  // ─────────────────────────────────────────────────────────────────────────
  // 1. LENIS — Smooth Scroll
  // ─────────────────────────────────────────────────────────────────────────
  const lenis = new Lenis({
    lerp: 0.1, // Suavidad estándar, muy natural y poco pegajosa
    wheelMultiplier: 1.2, // Rueda un poco más ágil
  });

  // Forzar a Lenis al top inmediatamente
  lenis.scrollTo(0, { immediate: true });

  // Engañar al navegador para que guarde 0 como posición al refrescar
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };

  // Usamos el bucle nativo (requestAnimationFrame) en lugar de gsap.ticker 
  // para evitar conflicto de frames y esa sensación pegajosa.
  lenis.on('scroll', ScrollTrigger.update);

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. NAVBAR — Hide on scroll down / Show on scroll up
  //    Transición suave via CSS (transform definida en style.css)
  // ─────────────────────────────────────────────────────────────────────────
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  let lastScrollY = 0;
  let ticking     = false;
  const SCROLL_THRESHOLD = 80; // px antes de esconder

  function handleNavbarScroll() {
    const currentScrollY = lenis.scroll;

    // Clase is-scrolled: fondo ligeramente más sólido después del primer scroll
    navbar.classList.toggle('is-scrolled', currentScrollY > 30);

    // Esconder / mostrar según dirección de scroll
    if (currentScrollY > SCROLL_THRESHOLD) {
      navbar.classList.toggle('is-hidden', currentScrollY > lastScrollY);
    } else {
      // Parte superior: siempre visible
      navbar.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  lenis.on('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleNavbarScroll);
      ticking = true;
    }
  });

  // ── Hamburger toggle (mobile) ──────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const isOpen = !mobileMenu.hidden;
    hamburger.classList.toggle('is-active', !isOpen);
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
  });

  mobileMenu.querySelectorAll('.navbar__mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.hidden = true;
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. HERO — Animaciones de entrada
  //    Orden (stagger jerárquico del prompt inicial):
  //    título → subtítulo → thumbnails → rating text → estrellas
  // ─────────────────────────────────────────────────────────────────────────

  const ctx = gsap.context(() => {

    // ── Preparar líneas del título para mask reveal ───────────────────────
    // Cada .hero__title-line tiene overflow:hidden en CSS.
    // Animamos el contenido interno (spans) desde abajo hacia arriba.
    const titleLines = gsap.utils.toArray('.hero__title-line');

    // ============================================================
    // PRELOADER ANIMATION
    // ============================================================
    // Detener el scroll nativo de lenis durante el preloader
    lenis.stop();
    document.body.style.overflow = 'hidden';

    // Timeline principal del Hero (Pausada inicialmente)
    const heroTL = gsap.timeline({
      defaults: { ease: 'power3.out' },
      paused: true
    });

    const preloaderTL = gsap.timeline({
      onComplete: () => {
        // Desvanecer preloader y arrancar hero
        gsap.to('#preloader', {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            document.getElementById('preloader').style.display = 'none';
            document.body.style.overflow = '';
            lenis.start();
            heroTL.play();
          }
        });
      }
    });

    preloaderTL.fromTo('.preloader-char',
      { yPercent: -100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)'
      }
    )
    .to({}, { duration: 0.8 }); // Pausa para que se lea antes de desvanecer

    // ── Navbar: Animación stagger (Logo, Links, CTA) ──────────────────────
    heroTL.fromTo(
      ['.navbar__logo', '.navbar__link', '.navbar__cta'],
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2, /* Más lento */
        stagger: 0.25, /* Mucho más espaciado entre elementos */
      },
      0
    );

    // ── Líneas del título: mask reveal (translateY desde abajo) ───────────
    heroTL.fromTo(
      titleLines,
      { yPercent: 115, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.13,
      },
      0.3 // Empieza ligeramente después de la navbar
    );

    // ── Título principal: Stagger de las líneas (mask reveal) ────────────────
    heroTL.fromTo(
      '.hero__title-line',
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.3, ease: 'power4.out' }, // Más lento y escalonado
      0.2
    );

    // ── Subtítulo: Fade in desde abajo ──────────────────────────────────────
    heroTL.fromTo(
      '.hero__subtitle',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      "-=0.8"
    );

    // ── Thumbnails: Fade in de la escena 3D ────────────────────────────────
    heroTL.fromTo(
      '.hero__thumbnails-scene',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
      },
      0.4
    );

    // ── Rating text y thumbnails carga escalonada ─────────────────────────────
    heroTL.fromTo(
      '.hero__rating-text',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      "-=0.5"
    );

    heroTL.fromTo(
      '.hero__thumb-img',
      { opacity: 0, filter: 'blur(10px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }, // Quitamos stagger para que aparezcan juntas
      "-=0.8"
    );

    // ── Estrellas: escala + rotación, una a una ───────────────────────────
    heroTL.fromTo(
      '.star',
      { scale: 0, opacity: 0, rotation: -20 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.50,
        stagger: 0.08,
        ease: 'back.out(1.8)',
      },
      1.45
    );

    // ============================================================
    // SECCIÓN 2: DESTINATIONS SLIDER AUTOMÁTICO
    // ============================================================
    const slides = document.querySelectorAll('.slider__slide');
    const pagination = document.getElementById('slider-pagination');
    const pillContainer = document.querySelector('.slider__pill');
    const totalSlides = slides.length;
    let currentSlide = 0;
    const slideDuration = 4500; // Incrementado a 4.5s (1 segundo más)
    let sliderInterval = null;

    // Diferentes beneficios para cada slide (5 por slide)
    const slideBenefits = [
      // Slide 1: Bali
      `
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Estancia</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
          <span>Desayuno</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          <span>Turismo</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line></svg>
          <span>Visa</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Entradas</span>
        </li>
      `,
      // Slide 2: Santorini
      `
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Hotel 5 Estrellas</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
          <span>Todo Incluido</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          <span>Yate Privado</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line></svg>
          <span>Sin Visa</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Museos</span>
        </li>
      `,
      // Slide 3: Lençóis
      `
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Resort Natural</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
          <span>Desayuno Buffet</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          <span>Tours en Jeep</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line></svg>
          <span>Visa Guiada</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Pase V.I.P</span>
        </li>
      `,
      // Slide 4: Río
      `
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Boutique Hotel</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
          <span>Media Pensión</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          <span>Guía Bilingüe</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line></svg>
          <span>Visa Express</span>
        </li>
        <li class="pill-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Carnaval</span>
        </li>
      `
    ];

    if (slides.length > 0) {
      function animatePill() {
        gsap.fromTo('.slider__pill li', 
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', overwrite: 'auto' }
        );
      }

      function goToNextSlide() {
        // Kill previous animations and reset
        const prevContent = slides[currentSlide].querySelectorAll('.slider__title, .slider__subtitle');
        gsap.killTweensOf(prevContent);
        gsap.set(prevContent, { y: 30, opacity: 0 });

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('active');
        
        // Animate new content
        const nextContent = slides[currentSlide].querySelectorAll('.slider__title, .slider__subtitle');
        gsap.killTweensOf(nextContent);
        gsap.fromTo(nextContent,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', overwrite: 'auto' }
        );

        const currentNum = String(currentSlide + 1).padStart(2, '0');
        const totalNum = String(totalSlides).padStart(2, '0');
        pagination.innerHTML = `${currentNum} &nbsp;&mdash;&nbsp; 07`;

        const currentPills = document.querySelectorAll('.slider__pill li');
        if (currentPills.length > 0) {
          gsap.to(currentPills, {
            y: -15, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.in',
            onComplete: () => {
              pillContainer.innerHTML = slideBenefits[currentSlide];
              animatePill();
            }
          });
        } else {
          pillContainer.innerHTML = slideBenefits[currentSlide];
          animatePill();
        }
      }

      // Animación inicial de la píldora
      pillContainer.innerHTML = slideBenefits[0];

      // Arrancar el slider SOLO cuando la sección sea casi completamente visible
      ScrollTrigger.create({
        trigger: '.destinations-slider',
        start: 'top 15%', // Cambiado de 60% a 15% para que se vea la animación al llegar
        onEnter: () => {
          if (!slides[0].classList.contains('active')) {
            slides[0].classList.add('active');
          }
          
          // Animar el texto del primer slide (estaba con opacity 0 inline)
          const firstContent = slides[0].querySelector('.slider__content');
          if (firstContent && firstContent.style.opacity === "0") {
            gsap.set(firstContent, { opacity: 1 });
            gsap.fromTo(slides[0].querySelectorAll('.slider__title, .slider__subtitle'),
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
            );
          }

          animatePill();
          if (!sliderInterval) {
            sliderInterval = setInterval(goToNextSlide, slideDuration);
          }
        }
      });
    }

    // ============================================================
    // SECCIÓN 3: SEQUENCE ANIMATION (CANVAS)
    // ============================================================
    function initSequenceAnimation() {
      const canvas = document.getElementById("sequence-canvas");
      const seqText = document.getElementById("sequence-text");
      if (!canvas) return;
      const context = canvas.getContext("2d");

      const setcanvassize = () => {
          const pixelRatio = window.devicePixelRatio || 1;
          const targetHeight = window.innerHeight;

          canvas.width = window.innerWidth * pixelRatio;
          canvas.height = targetHeight * pixelRatio;
          canvas.style.width = window.innerWidth + "px";
          canvas.style.height = targetHeight + "px";
          context.scale(pixelRatio, pixelRatio);
      };

      setcanvassize();
      
      const frameCount = 227;
      const currentFrame = (index) => {
          const frameNum = index + 1;
          return `img/Vid/${frameNum.toString().padStart(3, "0")}.webp`;
      };

      let images = [];
      let videoFrames = { frame: 0 };
      let imageToLoad = frameCount;

      const render = () => {
          const canvasWidth  = window.innerWidth;
          const canvasHeight = window.innerHeight;

          context.clearRect(0, 0, canvasWidth, canvasHeight);
          
          // Mejorar la calidad de escalado (evitar pixelado)
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = 'high';

          const img = images[videoFrames.frame];
          if (img && img.complete && img.naturalWidth > 0) {
              const imageAspect  = img.naturalWidth / img.naturalHeight;
              const canvasAspect = canvasWidth / canvasHeight;
              let drawWidth, drawHeight, drawX, drawY;

              if (imageAspect > canvasAspect) {
                  drawHeight = canvasHeight;
                  drawWidth = img.width * (canvasHeight / img.height);
                  drawX = (canvasWidth - drawWidth) / 2;
                  drawY = 0;
              } else {
                  drawWidth = canvasWidth;
                  drawHeight = img.height * (canvasWidth / img.width);
                  drawX = 0;
                  drawY = 0; // Cambiado a 0 para alinear desde el top hacia abajo
              }
              context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          }
      };

      for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.onload = () => {
              // Si la imagen que acaba de cargar es la que deberíamos mostrar, la renderizamos.
              if (i === videoFrames.frame) {
                  render();
              }
          };
          img.src = currentFrame(i);
          images.push(img);
      }

      ScrollTrigger.create({
          trigger: ".hero-sequence",
          start: "top top",
          end: `+=${window.innerHeight * 5}px`, // 5 viewports duration
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          onUpdate: (self) => {
              const p = self.progress;
              const targetFrame = Math.min(Math.round(p * (frameCount - 1)), frameCount - 1);
              videoFrames.frame = targetFrame;
              render();
              
              // Overlay End (Stagger words)
              const overlayEnd = document.getElementById('seq-overlay-end');
              if (overlayEnd) {
                if (p > 0.8) {
                  const textP = (p - 0.8) / 0.2;
                  overlayEnd.style.opacity = Math.min(1, textP * 2); // Container fades in quickly
                  const words = document.querySelectorAll('.seq-word');
                  words.forEach((word, index) => {
                      const threshold = index * (1 / words.length);
                      const wordP = (textP - threshold) * words.length; 
                      word.style.opacity = Math.max(0, Math.min(1, wordP));
                      const translateY = Math.max(0, 10 - wordP * 10);
                      word.style.transform = `translateY(${translateY}px)`;
                  });
                } else {
                  overlayEnd.style.opacity = 0;
                }
              }
          }
      });

      window.addEventListener("resize", () => {
          setcanvassize();
          render();
      });
    }

    initSequenceAnimation();

    // ============================================================
    // SECCIÓN 4 (FEATURES) - ANIMACIONES
    // ============================================================
    const s4Section = document.querySelector('.features-section');
    if (s4Section) {
      ScrollTrigger.create({
        trigger: s4Section,
        start: 'top 40%', // Dispara cuando la sección asoma un 40% en pantalla
        once: true,
        onEnter: () => {
          // 1. Título principal: fade in up suave
          gsap.fromTo('.features__title',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
          );

          // Fondo escalonado (aparece después del título)
          gsap.fromTo('.features__bg',
            { opacity: 0 },
            { opacity: 1, duration: 0.7, delay: 0.3, ease: 'power2.out' }
          );

          // 2. Elementos métricos (.metric): fade in up escalonado
          gsap.fromTo('.metric',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.3, ease: 'power2.out' }
          );

          // 3. Animación de los números (contador 0 a meta)
          const s4Metrics = document.querySelectorAll('.metric__number');
          s4Metrics.forEach((el, index) => {
            const target = parseFloat(el.getAttribute('data-target') || 0);
            const suffix = el.getAttribute('data-suffix') || '';
            const obj = { val: 0 };

            gsap.to(obj, {
              val: target,
              duration: 2.5,
              delay: index * 0.3, // Sincronizado con el stagger
              ease: 'power3.out', // Fluido, rápido al principio y lento al final
              onUpdate: () => {
                el.innerHTML = Math.floor(obj.val) + suffix;
              }
            });
          });
        }
      });
    }

    // ============================================================
    // SCROLL HORIZONTAL (S5 & S6)
    // ============================================================
    const horizContainer = document.querySelector('.horizontal-container');
    const horizWrapper = document.querySelector('.horizontal-wrapper');
    const horizPanels = gsap.utils.toArray('.horizontal-wrapper > section');

    if (horizContainer && horizWrapper && horizPanels.length > 0) {
      
      // Animación principal del Scroll Horizontal
      let horizTween = gsap.to(horizPanels, {
        xPercent: -100 * (horizPanels.length - 1),
        ease: "none", // important for smooth scrubbing
        scrollTrigger: {
          trigger: horizContainer,
          pin: true,
          scrub: 1, // suavizado del scrub
          end: () => "+=" + horizWrapper.offsetWidth, // dura lo que mide de ancho
          toggleClass: { targets: '.navbar', className: 'navbar--dark-text' }
        }
      });

      // Animación interna S5 (Lema) - Se dispara apenas arranca el contenedor horizontal
      gsap.to('.lema-word', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: horizContainer, // Ocurre al llegar al contenedor
          start: 'top 40%',
          once: true
        }
      });

      // Animación interna S6 (Paquetes) - Usa containerAnimation
      const s6Section = document.querySelector('.packages-section');
      if (s6Section) {
        // Tarjetas entran desde la izquierda
        gsap.fromTo('.package-card',
          { opacity: 0, x: -50 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.7, 
            stagger: 0.2, 
            ease: 'power2.out',
            scrollTrigger: {
              trigger: s6Section,
              containerAnimation: horizTween,
              start: "left center", // arranca cuando la sección entra a la mitad
              toggleActions: "play none none reverse"
            }
          }
        );
        
        // Textos e info de la derecha entran desde abajo
        gsap.fromTo('.packages__info > *',
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.7, 
            stagger: 0.2, 
            ease: 'power2.out', 
            scrollTrigger: {
              trigger: s6Section,
              containerAnimation: horizTween,
              start: "left center",
              toggleActions: "play none none reverse"
            }
          }
        );
        
        // --- Accordion Logic para las tarjetas ---
        const cards = document.querySelectorAll('.package-card');
        cards.forEach(card => {
          card.addEventListener('click', () => {
            // Si ya está activa, no hacer nada (o cerrarla, pero en un acordeón suele quedar 1 abierta)
            if (card.classList.contains('is-active')) return;
            
            // Cerrar todas
            cards.forEach(c => c.classList.remove('is-active'));
            // Abrir la clickeada
            card.classList.add('is-active');
          });
        });
      }
    }

    // ============================================================
    // SECCIÓN 7 (CTA) - ANIMACIONES
    // ============================================================
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
      ScrollTrigger.create({
        trigger: ctaSection,
        start: 'top 50%', // Más abajo para asegurar que el contenido ya esté visible
        once: true,
        onEnter: () => {
          // Animar palabras del título
          gsap.to('.cta-word', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.25,
            ease: 'power2.out'
          });

          // Animar footer/breadcrumb (dirección, botón, paginación)
          gsap.to('.cta__breadcrumb', {
            opacity: 1,
            duration: 0.7,
            delay: 0.3,
            ease: 'power2.out'
          });
        }
      });
    }

    // ============================================================
    // SECCIÓN 8 (FOOTER) - ANIMACIONES
    // ============================================================
    const footerSection = document.querySelector('.footer-section');
    if (footerSection) {
      ScrollTrigger.create({
        trigger: footerSection,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to('.footer__watermark', { opacity: 0.04, duration: 1.5, ease: 'power2.out' });
          gsap.fromTo('.footer__panel, .footer__bottom-row', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.4, ease: 'power2.out', delay: 0.2 }
          );
        }
      });
    }

    // ============================================================
    // INVERSIÓN DE NAVBAR SOBRE SECCIONES CLARAS (S4)
    // ============================================================
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      ScrollTrigger.create({
        trigger: featuresSection,
        start: 'top 60px',
        end: 'bottom 60px',
        toggleClass: { targets: '.navbar', className: 'navbar--dark-text' }
      });
    }

    // ============================================================
    // ANIMACIONES GLOBALES (Botones Hover)
    // ============================================================
    const buttons = document.querySelectorAll('.btn, .navbar__cta');
    buttons.forEach(btn => {
      // Evitar doble split si el script corre de nuevo
      if (btn.querySelector('.btn-char')) return;
      
      const text = btn.innerText;
      btn.innerHTML = '';
      
      // Separar el texto en spans para animar letra por letra
      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char; // preservar espacios
        span.style.display = 'inline-block';
        span.classList.add('btn-char');
        btn.appendChild(span);
      });

      const chars = btn.querySelectorAll('.btn-char');

      btn.addEventListener('mouseenter', () => {
        // Reducir el botón un 5%
        gsap.to(btn, { scale: 0.95, duration: 1, ease: 'power3.out' });
        
        // Stagger en las letras (entrada desde abajo)
        gsap.fromTo(chars, 
          { y: 8, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1, stagger: 0.04, ease: 'power3.out' }
        );
      });

      btn.addEventListener('mouseleave', () => {
        // Restaurar tamaño del botón
        gsap.to(btn, { scale: 1, duration: 1, ease: 'power3.out' });
      });
    });

  }); // fin gsap.context

});
