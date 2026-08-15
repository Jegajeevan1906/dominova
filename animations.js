/* ================================================================
   DOMINOVA — Premium Animation Engine
   animations.js — Cinematic scroll, reveal, parallax, micro-interactions
   ================================================================ */

'use strict';

// ── Guard: respect prefers-reduced-motion ──────────────────────
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Detect mobile for performance optimisations ─────────────────
const IS_MOBILE = window.innerWidth < 768;

// ── Entry point ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!REDUCED) {
    initScrollProgressBar();
    initHeroWordReveal();
    initEnhancedScrollReveal();
    initParallaxSections();
    initMouseParallaxHero();
    initCardHoverEffects();
    initProjectCardEffects();
    initButtonEffects();
    initServiceCardGlow();
    initSectionTransitions();
    initNavLinkUnderlines();
    initFooterReveal();
    initProcessStaggerReveal();
    initTestimonialCardReveal();
    initTextFadeUp();
    initPageLoadSequence();
    initInputHighlightEffects();
    initTechItemHover();
    initUniversal3DTilt();
  } else {
    // Ensure everything is visible if reduced motion is preferred
    document.querySelectorAll('[data-anim]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. SCROLL PROGRESS BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initScrollProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgressBar';
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #C97B47, #E8904A, #F0C49A);
    z-index: 9999;
    pointer-events: none;
    will-change: width;
    transition: width 0.1s linear;
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(201,123,71,0.5);
  `;
  document.body.appendChild(bar);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. PAGE LOAD SEQUENCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initPageLoadSequence() {
  // Fade in the navbar on load
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.opacity = '0';
    navbar.style.transform = 'translateY(-10px)';
    navbar.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    requestAnimationFrame(() => {
      setTimeout(() => {
        navbar.style.opacity = '1';
        navbar.style.transform = 'translateY(0)';
      }, 100);
    });
  }

  // Scale-in hero stats on load
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    heroStats.style.opacity = '0';
    heroStats.style.transform = 'translateY(30px)';
    heroStats.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(() => {
      heroStats.style.opacity = '1';
      heroStats.style.transform = 'translateY(0)';
    }, 900);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. HERO HEADING — WORD-BY-WORD BLUR REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initHeroWordReveal() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  // Inject word-reveal CSS once
  injectStyle('wordRevealStyle', `
    .word-reveal-word {
      display: inline-block;
      opacity: 0;
      transform: translateY(24px);
      filter: blur(8px);
      transition: opacity 0.7s cubic-bezier(0,0,0.2,1),
                  transform 0.7s cubic-bezier(0,0,0.2,1),
                  filter 0.7s cubic-bezier(0,0,0.2,1);
      will-change: opacity, transform, filter;
    }
    .word-reveal-word.visible {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
    /* Keep gradient text working after split */
    .gradient-text .word-reveal-word {
      background: inherit;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `);

  // Split text into word spans (preserving .gradient-text spans)
  splitNodeIntoWords(heroTitle);

  // Trigger with stagger
  const words = heroTitle.querySelectorAll('.word-reveal-word');
  words.forEach((word, i) => {
    setTimeout(() => word.classList.add('visible'), 200 + i * 80);
  });

  // Subtitle fade-up
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(20px)';
    heroSubtitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(() => {
      heroSubtitle.style.opacity = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }, 500 + words.length * 80);
  }

  // Hero CTAs
  const heroCtas = document.querySelector('.hero-ctas');
  if (heroCtas) {
    heroCtas.style.opacity = '0';
    heroCtas.style.transform = 'translateY(20px)';
    heroCtas.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(() => {
      heroCtas.style.opacity = '1';
      heroCtas.style.transform = 'translateY(0)';
    }, 700 + words.length * 80);
  }

  // Hero pills
  const heroPills = document.querySelector('.hero-pills');
  if (heroPills) {
    heroPills.style.opacity = '0';
    heroPills.style.transform = 'translateY(16px)';
    heroPills.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(() => {
      heroPills.style.opacity = '1';
      heroPills.style.transform = 'translateY(0)';
    }, 900 + words.length * 80);
  }
}

/**
 * Walk the text nodes of an element, wrap each word in a span,
 * leaving child element nodes (like .gradient-text spans) intact.
 */
function splitNodeIntoWords(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (!text.trim()) return;
    const words = text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    words.forEach(part => {
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else if (part) {
        const span = document.createElement('span');
        span.className = 'word-reveal-word';
        span.textContent = part;
        frag.appendChild(span);
      }
    });
    node.parentNode.replaceChild(frag, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Wrap the entire child element as a single word unit
    if (node.classList && node.classList.contains('gradient-text')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'word-reveal-word';
      node.parentNode.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    } else {
      // Recurse into child nodes (copy so we don't mutate live list)
      Array.from(node.childNodes).forEach(child => splitNodeIntoWords(child));
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ENHANCED SCROLL REVEAL (section headings, paragraphs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initEnhancedScrollReveal() {
  injectStyle('enhancedRevealStyle', `
    [data-anim="fade-up"] {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.75s cubic-bezier(0,0,0.2,1),
                  transform 0.75s cubic-bezier(0,0,0.2,1);
      will-change: opacity, transform;
    }
    [data-anim="fade-up"].anim-visible {
      opacity: 1;
      transform: translateY(0);
    }
    [data-anim="blur-up"] {
      opacity: 0;
      transform: translateY(20px);
      filter: blur(6px);
      transition: opacity 0.8s cubic-bezier(0,0,0.2,1),
                  transform 0.8s cubic-bezier(0,0,0.2,1),
                  filter 0.8s cubic-bezier(0,0,0.2,1);
      will-change: opacity, transform, filter;
    }
    [data-anim="blur-up"].anim-visible {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
    [data-anim="scale-up"] {
      opacity: 0;
      transform: scale(0.94) translateY(24px);
      transition: opacity 0.7s cubic-bezier(0,0,0.2,1),
                  transform 0.7s cubic-bezier(0.34,1.56,0.64,1);
      will-change: opacity, transform;
    }
    [data-anim="scale-up"].anim-visible {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  `);

  // Tag section titles, tags, and subtitles
  document.querySelectorAll('.section-title').forEach(el => {
    if (!el.hasAttribute('data-anim')) el.setAttribute('data-anim', 'blur-up');
  });
  document.querySelectorAll('.section-tag').forEach(el => {
    if (!el.hasAttribute('data-anim')) el.setAttribute('data-anim', 'fade-up');
  });
  document.querySelectorAll('.section-subtitle').forEach(el => {
    if (!el.hasAttribute('data-anim')) {
      el.setAttribute('data-anim', 'fade-up');
      el.style.transitionDelay = '0.15s';
    }
  });

  // Observe all data-anim elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. PARALLAX BACKGROUNDS (section by section)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initParallaxSections() {
  if (IS_MOBILE) return; // skip heavy parallax on mobile

  const parallaxTargets = [
    { selector: '.hero-visual', speed: 0.12 },
    { selector: '.hero-bg',     speed: 0.06 },
    { selector: '.team-section .section-header', speed: 0.04 },
    { selector: '.why-section .section-header',  speed: 0.04 },
  ];

  const nodes = parallaxTargets.map(t => ({
    el: document.querySelector(t.selector),
    speed: t.speed
  })).filter(t => t.el);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        nodes.forEach(({ el, speed }) => {
          const rect = el.getBoundingClientRect();
          // Only update if near viewport
          if (rect.bottom > -300 && rect.top < window.innerHeight + 300) {
            const offset = scrollY * speed;
            el.style.transform = `translateY(${offset}px)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. MOUSE PARALLAX ON HERO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initMouseParallaxHero() {
  if (IS_MOBILE) return;

  const heroVisual = document.querySelector('.hero-visual');
  const floatingCards = document.querySelectorAll('.floating-card');
  const heroCard = document.querySelector('.hero-card');
  if (!heroVisual) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    // Normalise to -1 … 1 from center
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animFrame() {
    // Smooth lerp
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    if (heroCard) {
      heroCard.style.transform = `
        rotateY(${currentX * 6}deg)
        rotateX(${-currentY * 4}deg)
        translateZ(0)
      `;
    }
    floatingCards.forEach((card, i) => {
      const depth = (i + 1) * 6;
      card.style.transform += `translate(${currentX * depth}px, ${currentY * depth}px)`;
    });

    rafId = requestAnimationFrame(animFrame);
  }

  animFrame();

  // Stop when hero leaves viewport
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!rafId) animFrame();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
        // Reset
        if (heroCard) heroCard.style.transform = '';
      }
    }, { threshold: 0.05 }).observe(heroSection);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. CARD HOVER EFFECTS — SHOWCASE CARDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCardHoverEffects() {
  // Styles moved to styles.css, kept function for compatibility if needed.
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. PROJECT CARD HOVER — IMAGE ZOOM + OVERLAY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initProjectCardEffects() {
  injectStyle('projectCardStyle', `
    .project-card {
      transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.45s ease !important;
      overflow: hidden;
    }
    .project-card:hover {
      transform: translateY(-8px) !important;
      box-shadow: 0 32px 80px rgba(201,123,71,0.2) !important;
    }
    .project-browser {
      transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
    }
    .project-card:hover .project-browser {
      transform: scale(1.03);
    }
    .project-btn.primary {
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.3s ease,
                  opacity 0.3s ease !important;
    }
    .project-btn.primary:hover {
      transform: translateY(-3px) scale(1.04) !important;
      box-shadow: 0 8px 24px rgba(201,123,71,0.35) !important;
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. SHOWCASE CARD BORDER GLOW (pointer tracking)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initServiceCardGlow() {
  if (IS_MOBILE) return;
  const cards = document.querySelectorAll('.project-showcase-card, .pricing-card, .why-card, .team-card, .pf-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--glow-x', x.toFixed(2) + '%');
      card.style.setProperty('--glow-y', y.toFixed(2) + '%');
    });
  });

  injectStyle('glowTrackStyle', `
    .project-showcase-card,
    .pricing-card,
    .why-card,
    .team-card,
    .pf-card {
      --glow-x: 50%;
      --glow-y: 50%;
      position: relative;
    }
    .project-showcase-card::after,
    .pricing-card::after,
    .why-card::after,
    .team-card::after,
    .pf-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(
        320px circle at var(--glow-x, 50%) var(--glow-y, 50%),
        rgba(201, 168, 76, 0.16),
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.35s ease;
      pointer-events: none;
      z-index: 1;
    }
    [data-theme="light"] .project-showcase-card::after,
    [data-theme="light"] .pricing-card::after,
    [data-theme="light"] .why-card::after,
    [data-theme="light"] .team-card::after,
    [data-theme="light"] .pf-card::after {
      background: radial-gradient(
        320px circle at var(--glow-x, 50%) var(--glow-y, 50%),
        rgba(168, 120, 42, 0.14),
        transparent 70%
      );
    }
    .project-showcase-card:hover::after,
    .pricing-card:hover::after,
    .why-card:hover::after,
    .team-card:hover::after,
    .pf-card:hover::after {
      opacity: 1;
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. BUTTON EFFECTS — GLOW + PRESS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initButtonEffects() {
  injectStyle('buttonEffectStyle', `
    .btn {
      /* Only transition transform and box-shadow — NOT "all".
         Transitioning "all" causes color/opacity to animate
         simultaneously with the ::before overlay, making text
         temporarily invisible on hover. */
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.25s ease !important;
    }
    .btn:active {
      transform: scale(0.96) translateY(1px) !important;
    }
    .btn-primary {
      color: #fff !important;
    }
    .btn-primary:hover {
      color: #fff !important;
      box-shadow: 0 8px 32px rgba(201,123,71,0.45),
                  0 0 0 1px rgba(201,123,71,0.2) !important;
    }
    .btn-ghost:hover {
      background: rgba(201,123,71,0.14) !important;
      box-shadow: 0 4px 20px rgba(201,123,71,0.2) !important;
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. PROCESS TIMELINE STAGGER REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initProcessStaggerReveal() {
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  injectStyle('processStepStyle', `
    .process-step {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
      transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1);
      will-change: opacity, transform;
    }
    .process-step.step-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .process-step:hover .step-icon {
      transform: scale(1.15) rotate(-5deg);
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    .step-icon {
      transition: transform 0.3s ease;
    }
  `);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger each step
        steps.forEach((step, i) => {
          setTimeout(() => step.classList.add('step-visible'), i * 100);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  const timeline = document.querySelector('.process-timeline');
  if (timeline) observer.observe(timeline);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 12. TESTIMONIAL CARD REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initTestimonialCardReveal() {
  injectStyle('testimonialRevealStyle', `
    .testimonials-section {
      overflow: hidden;
    }
    @keyframes premiumMarquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .marquee-track {
      animation: premiumMarquee 30s linear infinite !important;
    }
    .marquee-wrapper:hover .marquee-track {
      animation-play-state: paused !important;
    }
    .testimonial-card {
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.4s ease !important;
    }
    .testimonial-card:hover {
      transform: translateY(-8px) scale(1.02) !important;
      box-shadow: 0 24px 60px rgba(201,123,71,0.18) !important;
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 13. GENERAL TEXT FADE UP (paragraphs in sections)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initTextFadeUp() {
  const selector = [
    '.contact-info-title',
    '.contact-info-desc',
    '.form-title',
    '.why-desc',
    '.team-bio',
    '.team-role',
    '.service-desc',
    '.project-desc',
    '.step-desc',
    '.pricing-billing',
  ].join(',');

  const els = document.querySelectorAll(selector);

  injectStyle('textFadeUpStyle', `
    .text-fade-target {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.65s ease, transform 0.65s ease;
      will-change: opacity, transform;
    }
    .text-fade-target.text-fade-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('text-fade-visible'), 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => {
    el.classList.add('text-fade-target');
    observer.observe(el);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 14. NAV LINK ANIMATED UNDERLINES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initNavLinkUnderlines() {
  injectStyle('navUnderlineStyle', `
    .nav-link {
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 4px; left: 50%;
      width: 0; height: 2px;
      background: var(--accent);
      border-radius: 2px;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1),
                  left 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .nav-link:hover::after,
    .nav-link.active::after {
      width: calc(100% - 28px);
      left: 14px;
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 15. FOOTER REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initFooterReveal() {
  const footer = document.querySelector('.footer');
  if (!footer) return;

  footer.style.opacity = '0';
  footer.style.transform = 'translateY(40px)';
  footer.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      footer.style.opacity = '1';
      footer.style.transform = 'translateY(0)';
      observer.disconnect();
    }
  }, { threshold: 0.05 });

  observer.observe(footer);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 16. SECTION TRANSITIONS (background fade shifts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initSectionTransitions() {
  injectStyle('sectionTransitionStyle', `
    .section {
      transition: background 0.5s ease;
    }
    /* Hero badge pulse enhancement */
    .badge-dot {
      animation: badgeBlink 2s ease-in-out infinite;
    }
    /* Pill hover lift */
    .pill {
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.3s ease,
                  background 0.3s ease !important;
    }
    .pill:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 6px 20px rgba(201,123,71,0.2) !important;
    }
    /* Stat card hover */
    .stat-card {
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.4s ease !important;
    }
    .stat-card:hover {
      transform: translateY(-6px) scale(1.03) !important;
      box-shadow: 0 20px 50px rgba(201,123,71,0.18) !important;
    }
    /* Pricing card hover */
    .pricing-card {
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.4s ease !important;
    }
    .pricing-card:hover {
      transform: translateY(-8px) !important;
    }
    /* Why cards */
    .why-card:hover {
      transform: translateY(-10px) scale(1.02) !important;
    }
    /* Team card */
    .team-card {
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.4s ease !important;
    }
    .team-card:hover {
      transform: translateY(-8px) !important;
      box-shadow: 0 24px 60px rgba(201,123,71,0.18) !important;
    }
    /* Contact channel card */
    .contact-channel {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.35s ease !important;
    }
    .contact-channel:hover {
      transform: translateX(6px) !important;
      box-shadow: 0 12px 36px rgba(201,123,71,0.15) !important;
    }
    /* Footer social icons */
    .footer-social {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                  color 0.3s ease !important;
    }
    .footer-social:hover {
      transform: translateY(-4px) scale(1.15) !important;
      color: var(--accent) !important;
    }
    /* team avatar glow pulse */
    .team-avatar-glow {
      animation: teamAvatarGlow 3s ease-in-out infinite;
    }
    @keyframes teamAvatarGlow {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.08); }
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 17. INPUT HIGHLIGHT SMOOTH EFFECTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initInputHighlightEffects() {
  injectStyle('inputHighlightStyle', `
    .form-group input,
    .form-group textarea,
    .form-group select {
      transition: border-color 0.3s ease,
                  box-shadow 0.3s ease,
                  transform 0.2s ease !important;
    }
    .form-group.focused input,
    .form-group.focused textarea,
    .form-group.focused select {
      transform: translateY(-1px) !important;
      box-shadow: 0 0 0 3px rgba(201,123,71,0.12),
                  0 4px 16px rgba(201,123,71,0.08) !important;
    }
    .form-group label {
      transition: color 0.3s ease;
    }
    .form-group.focused label {
      color: var(--accent);
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 18. TECH ITEM HOVER LIFT + COLOUR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initTechItemHover() {
  injectStyle('techHoverStyle', `
    .tech-item {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.35s ease,
                  background 0.35s ease !important;
    }
    .tech-item:hover {
      transform: translateY(-6px) scale(1.06) !important;
      box-shadow: 0 12px 32px rgba(201,123,71,0.15) !important;
      background: rgba(201,123,71,0.08) !important;
      color: var(--accent) !important;
    }
    .tech-item .tech-icon {
      transition: color 0.3s ease;
    }
    .tech-item:hover .tech-icon {
      color: var(--accent) !important;
    }
  `);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTIL: inject a <style> block once by id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function injectStyle(id, css) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 19. UNIVERSAL 3D TILT & PARALLAX ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initUniversal3DTilt() {
  if (IS_MOBILE) return;

  const selectors = [
    '.pf-card',
    '.why-card',
    '.stat-card',
    '.testimonial-card',
    '.service-card',
    '.faq-item',
    '.contact-channel',
    '.contact-form',
    '.tech-item',
    '.hero-card',
    '.floating-card',
    '.process-step',
    '.pricing-card',
    '.project-showcase-card'
  ];

  const elements = document.querySelectorAll(selectors.join(', '));

  elements.forEach(el => {
    let state = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      isHovered: false,
      rafId: null
    };

    const updateTilt = () => {
      if (!state.isHovered && Math.abs(state.currentX) < 0.01 && Math.abs(state.currentY) < 0.01) {
        el.style.transform = '';
        state.rafId = null;
        return;
      }

      state.currentX += (state.targetX - state.currentX) * 0.12;
      state.currentY += (state.targetY - state.currentY) * 0.12;

      const scale = state.isHovered ? 1.04 : 1.0;
      const tz = state.isHovered ? 25 : 0;

      el.style.transform = `
        perspective(1000px)
        rotateX(${state.currentX.toFixed(2)}deg)
        rotateY(${state.currentY.toFixed(2)}deg)
        translateZ(${tz}px)
        scale(${scale})
      `;

      state.rafId = requestAnimationFrame(updateTilt);
    };

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Max 3D tilt ±12 deg
      state.targetX = (-mouseY / (rect.height / 2)) * 12;
      state.targetY = (mouseX / (rect.width / 2)) * 12;

      if (!state.isHovered) {
        state.isHovered = true;
        if (!state.rafId) state.rafId = requestAnimationFrame(updateTilt);
      }
    });

    el.addEventListener('mouseleave', () => {
      state.isHovered = false;
      state.targetX = 0;
      state.targetY = 0;
      if (!state.rafId) state.rafId = requestAnimationFrame(updateTilt);
    });
  });
}

