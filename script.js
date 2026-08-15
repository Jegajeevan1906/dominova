/* ================================================================
   DOMINOVA — Premium Digital Studio
   script.js — All Interactions & Animations
   ================================================================ */

'use strict';

// ── DOM Ready ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();       // Royal Gold theme toggle
  initCursorGrid();        // CursorGrid interactive component
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initCursorGlow();
  initFAQ();
  initContactForm();
  initSmoothScroll();
  initStickyWhatsApp();
  initMagneticButtons();
  initParallaxBlobs();
  initPricingSwipe();
  initProjectFilters();
  initDynamicProjects();   // Dynamic projects API loader
  initEcosystemCarousel();
  respectReducedMotion();
  initPricingContact();   // BUG-07: pricing → contact integration
  initNavHoverIsolation(); // BUG-08: navbar hover isolation
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME TOGGLE — Royal Gold / Light Mode
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initThemeToggle() {
  const html        = document.documentElement;
  const btn         = document.getElementById('themeToggle');
  const STORAGE_KEY = 'dominova-theme';

  // Apply saved theme on load (default: dark)
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  html.setAttribute('data-theme', saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);

    // Update shader background fallback colour for the new theme
    const shaderCanvas = document.getElementById('dominova-shader-bg');
    if (shaderCanvas) {
      if (next === 'light') {
        shaderCanvas.style.background =
          'linear-gradient(165deg, #FAFAF7 0%, #F4F1EA 50%, #EDE8DD 100%)';
      } else {
        shaderCanvas.style.background =
          'linear-gradient(165deg, #0A0A0A 0%, #111111 50%, #0D0A05 100%)';
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CURSOR GRID COMPONENT (React Bits)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCursorGrid() {
  const container = document.querySelector('.hero-bg');
  if (!container || typeof window.CursorGrid !== 'function') return;

  window.cursorGridInstance = new window.CursorGrid(container, {
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
    autoThemeColor: true
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAVBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Active link highlight using IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (sections.length && navLinks.length) {
    const observerOptions = {
      root: null,
      // Adjust rootMargin so that the active section is identified when it occupies the upper-middle region of the viewport
      rootMargin: '-20% 0px -55% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === '#' + currentId) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOBILE MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Trigger link animations
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(l => {
      l.style.opacity = '0';
    });
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('active') ? closeMenu() : openMenu();
  });

  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);

  mobileNavLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on outside click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCROLL REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-scale');
  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COUNTER ANIMATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCounters() {
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1800;
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.floor(easedProgress * target);

      el.textContent = current.toLocaleString('en-IN');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('en-IN');
      }
    }

    requestAnimationFrame(update);
  }

  // Observer for stats containers
  const counterSections = document.querySelectorAll('.hero-stats, .why-grid');
  if (!counterSections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-target]');
        counters.forEach(counter => animateCounter(counter));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counterSections.forEach(section => obs.observe(section));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CURSOR GLOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCursorGlow() {
  const cursor = document.getElementById('cursorGlow');
  if (!cursor) return;

  // Only on pointer devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cursor.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;
    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Enlarge on interactive elements
  const interactives = document.querySelectorAll('a, button, .project-showcase-card, .project-card, .pricing-card, .faq-question');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '700px';
      cursor.style.height = '700px';
      cursor.style.background = 'radial-gradient(circle, rgba(201,123,71,0.1) 0%, transparent 70%)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '500px';
      cursor.style.height = '500px';
      cursor.style.background = 'radial-gradient(circle, rgba(201,123,71,0.06) 0%, transparent 70%)';
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAQ ACCORDION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = null;
      });

      // Open clicked if was closed
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTACT FORM — WhatsApp Enquiry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  // BUG-005: practical email regex — requires local@domain.tld
  // Accepts:  test@gmail.com, hello.world@domain.co.in, dev+tag@sub.example.org
  // Rejects:  gmail.com, abc@, @gmail.com, gmail, abc@.com, abc@domain
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function isValidEmail(val) {
    return EMAIL_RE.test(val.trim());
  }

  // ── Highlight / clear error state on a form group ──
  function markInvalid(el, invalid) {
    const group = el.closest('.form-group');
    if (!group) return;
    if (invalid) {
      group.classList.add('field-error');
    } else {
      group.classList.remove('field-error');
    }
  }

  // ── Show / hide the inline email hint (BUG-005) ──
  function setEmailHint(show) {
    const emailEl = form.querySelector('[name="email"]');
    if (!emailEl) return;
    const group = emailEl.closest('.form-group');
    if (!group) return;
    if (show) {
      group.classList.add('field-error');
    } else {
      group.classList.remove('field-error');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl        = form.querySelector('[name="name"]');
    const emailEl       = form.querySelector('[name="email"]');
    const projectTypeEl = form.querySelector('[name="projectType"]');
    const messageEl     = form.querySelector('[name="message"]');

    const name        = nameEl?.value.trim()        || '';
    const email       = emailEl?.value.trim()       || '';
    const projectType = projectTypeEl?.value.trim() || '';
    const message     = messageEl?.value.trim()     || '';

    // Validate required-field emptiness (existing checks)
    let hasError = false;
    [
      [nameEl,        !name],
      [emailEl,       !email],           // empty check (existing)
      [projectTypeEl, !projectType],
      [messageEl,     !message],
    ].forEach(([el, invalid]) => {
      markInvalid(el, invalid);
      if (invalid) hasError = true;
    });

    // BUG-005: additionally validate email FORMAT when the field is non-empty
    if (email && !isValidEmail(email)) {
      markInvalid(emailEl, true);   // apply red border + label colour
      hasError = true;
    }

    if (hasError) {
      // Shake the form to draw attention
      form.classList.remove('form-shake');
      void form.offsetWidth; // reflow to restart animation
      form.classList.add('form-shake');
      form.addEventListener('animationend', () => form.classList.remove('form-shake'), { once: true });
      return;
    }

    // Resolve human-readable tier label from the select
    const tierLabel = projectTypeEl.options[projectTypeEl.selectedIndex]?.text || projectType;

    // Build the WhatsApp message
    const waMessage =
      `🚀 New Project Enquiry\n\n` +
      `👤 Name:\n${name}\n\n` +
      `📧 Email:\n${email}\n\n` +
      `💼 Project Tier:\n${tierLabel}\n\n` +
      `📝 Project Description:\n${message}\n\n` +
      `Thank you for contacting Dominova.`;

    // URL-encode (encodeURIComponent handles emojis, newlines, special chars)
    const encoded = encodeURIComponent(waMessage);
    const waURL   = `https://wa.me/918754325192?text=${encoded}`;

    // Open WhatsApp (app on mobile / WhatsApp Web on desktop)
    window.open(waURL, '_blank', 'noopener,noreferrer');

    // Show brief success message and reset form
    if (success) {
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 6000);
    }
    form.reset();

    // Clear any error highlights after reset
    form.querySelectorAll('.field-error').forEach(g => g.classList.remove('field-error'));
  });

  // Remove error highlight as soon as the user starts typing / selecting
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      const isEmail = input.name === 'email';
      if (isEmail) {
        const val = input.value.trim();
        const group = input.closest('.form-group');
        const hasErrorAlready = group && group.classList.contains('field-error');
        if (hasErrorAlready) {
          // If already marked invalid, keep red outline until format is correct
          const stillInvalid = val.length === 0 || !isValidEmail(val);
          markInvalid(input, stillInvalid);
        }
      } else {
        markInvalid(input, false);
      }
    });
    input.addEventListener('change', () => markInvalid(input, false));
    if (input.name === 'email') {
      input.addEventListener('blur', () => {
        const val = input.value.trim();
        if (val.length > 0) {
          const invalid = !isValidEmail(val);
          markInvalid(input, invalid);
        }
      });
    }

    // Input focus ripple effect (preserved)
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMOOTH SCROLL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STICKY WHATSAPP CTA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initStickyWhatsApp() {
  const sticky = document.getElementById('stickyWhatsapp');
  if (!sticky) return;

  let ticking = false;

  function updateSticky() {
    if (window.scrollY > 400) {
      sticky.classList.add('visible');
    } else {
      sticky.classList.remove('visible');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateSticky);
      ticking = true;
    }
  }, { passive: true });

  // Hide when contact section or footer is visible to prevent overlap
  const contactSection = document.getElementById('contact');
  const footer = document.querySelector('.footer');
  const hideObserver = new IntersectionObserver((entries) => {
    const isAnyVisible = entries.some(e => e.isIntersecting);
    sticky.style.opacity = isAnyVisible ? '0' : '1';
    sticky.style.pointerEvents = isAnyVisible ? 'none' : 'all';
  }, { threshold: 0.1 });

  if (contactSection) hideObserver.observe(contactSection);
  if (footer) hideObserver.observe(footer);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAGNETIC BUTTONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initMagneticButtons() {
  // Only on desktop
  if (!window.matchMedia('(hover: hover)').matches) return;

  const btns = document.querySelectorAll('.btn-primary, .btn-ghost');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARALLAX BLOBS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initParallaxBlobs() {
  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  const blob3 = document.querySelector('.blob-3');

  if (!blob1 && !blob2 && !blob3) return;

  let ticking = false;

  function updateBlobs() {
    const scrollY = window.scrollY;
    if (blob1) blob1.style.transform = `translate(${scrollY * 0.05}px, ${scrollY * 0.07}px)`;
    if (blob2) blob2.style.transform = `translate(-${scrollY * 0.04}px, ${scrollY * 0.03}px)`;
    if (blob3) blob3.style.transform = `translate(${scrollY * 0.03}px, -${scrollY * 0.05}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateBlobs);
      ticking = true;
    }
  }, { passive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRICING CARD SWIPE (MOBILE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initPricingSwipe() {
  const grid = document.getElementById('pricingGrid');
  if (!grid) return;

  // Only enable swipe on mobile
  function checkMobile() {
    if (window.innerWidth <= 1023) {
      grid.style.overflowX = 'auto';
      grid.style.scrollSnapType = 'x mandatory';
      grid.style.webkitOverflowScrolling = 'touch';
      grid.style.paddingBottom = '16px';
      grid.style.display = 'flex';
      grid.querySelectorAll('.pricing-card').forEach(card => {
        card.style.minWidth = 'min(320px, 85vw)';
        card.style.scrollSnapAlign = 'center';
        card.style.flexShrink = '0';
      });
    } else {
      grid.style.cssText = '';
      grid.querySelectorAll('.pricing-card').forEach(card => {
        card.style.cssText = '';
      });
    }
  }

  checkMobile();
  window.addEventListener('resize', checkMobile);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REDUCED MOTION RESPECT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function respectReducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Stop blob animations
  document.querySelectorAll('.blob, .floating-card, .hero-visual').forEach(el => {
    el.style.animation = 'none';
  });

  // Stop marquee
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) marqueeTrack.style.animation = 'none';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TECH GRID HOVER RIPPLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.querySelectorAll('.tech-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.zIndex = '2';
  });
  item.addEventListener('mouseleave', () => {
    item.style.zIndex = '';
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROCESS STEP CLICK (MOBILE ACCORDION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.querySelectorAll('.process-step').forEach(step => {
  step.addEventListener('click', () => {
    step.classList.toggle('expanded');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIPPLE EFFECT ON BUTTONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255,255,255,0.4);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      left: ${x}px;
      top: ${y}px;
      animation: rippleOut 0.6s ease-out forwards;
      pointer-events: none;
    `;

    // Add ripple keyframe if not present
    if (!document.getElementById('rippleStyle')) {
      const style = document.createElement('style');
      style.id = 'rippleStyle';
      style.textContent = `
        @keyframes rippleOut {
          to { transform: translate(-50%, -50%) scale(60); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACTIVE NAV LINK STYLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (!document.getElementById('navActiveStyle')) {
  const style = document.createElement('style');
  style.id = 'navActiveStyle';
  style.textContent = `
    .nav-link.active {
      color: var(--accent) !important;
      background: rgba(201,123,71,0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROJECT PORTFOLIO FILTERS  (BUG-04 fix)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.pf-card');
  const grid       = document.getElementById('projectsGrid');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // ── Update active button ──
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      // ── BUG-002 fix: reduce stagger delay so switching feels instant ──
      let visibleIdx = 0;
      cards.forEach(card => {
        const cat     = card.dataset.category || '';
        const matches = (filter === 'all') || (cat === filter);

        if (matches) {
          card.classList.remove('pf-hidden');
          card.style.position     = '';
          card.style.visibility   = '';
          card.style.pointerEvents = '';

          // Tighter stagger: 18ms per card instead of 55ms
          const delay = visibleIdx * 18;
          card.style.transition = `opacity 0.22s ease ${delay}ms, transform 0.25s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`;
          card.style.opacity    = '0';
          card.style.transform  = 'translateY(16px) scale(0.97)';

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.opacity   = '1';
              card.style.transform = 'translateY(0) scale(1)';
            });
          });

          // Cleanup after animation so hover CSS takes over
          const cleanupDelay = delay + 280;
          card._cleanupTimer && clearTimeout(card._cleanupTimer);
          card._cleanupTimer = setTimeout(() => {
            card.style.transition = '';
            card.style.opacity    = '';
            card.style.transform  = '';
          }, cleanupDelay);

          visibleIdx++;
        } else {
          // Hide quickly — no perceptible lag
          card.style.transition   = 'opacity 0.12s ease, transform 0.12s ease';
          card.style.opacity      = '0';
          card.style.transform    = 'scale(0.94) translateY(8px)';

          card._hideTimer && clearTimeout(card._hideTimer);
          card._hideTimer = setTimeout(() => {
            card.classList.add('pf-hidden');
            card.style.transition = '';
          }, 130);
        }
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DYNAMIC PROJECTS LOADER (API Integration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initDynamicProjects() {
  const grid = document.getElementById('projectsGrid');
  const filterContainer = document.getElementById('projectFilters');
  if (!grid) return;

  fetch('/api/projects')
    .then(res => {
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    })
    .then(projects => {
      if (!Array.isArray(projects) || projects.length === 0) return;

      // Filter only published projects for public display
      const published = projects.filter(p => p.status === 'published');
      if (published.length === 0) return;

      // 1. Render Dynamic Project Cards
      grid.innerHTML = published.map((p, idx) => {
        const imageSrc = p.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
        const demoUrl = p.demoUrl || '#';
        const hasDemo = p.demoUrl && p.demoUrl.startsWith('http');
        const tags = Array.isArray(p.tags) ? p.tags : [];

        return `
          <div class="pf-card glass-card" data-category="${escapeHTML(p.category || 'General')}">
            <div class="pf-image-wrap">
              <img
                src="${escapeHTML(imageSrc)}"
                alt="${escapeHTML(p.title)} preview"
                loading="lazy"
                class="pf-img"
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'">
              <div class="pf-overlay">
                <a href="${escapeHTML(demoUrl)}" ${hasDemo ? 'target="_blank" rel="noopener noreferrer"' : ''} class="pf-overlay-btn" aria-label="Visit ${escapeHTML(p.title)}">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
            </div>
            <div class="pf-body">
              <span class="pf-category">${escapeHTML(p.category || 'General')}</span>
              <h3 class="pf-title">${escapeHTML(p.title)}</h3>
              <p class="pf-desc">${escapeHTML(p.shortDescription || '')}</p>
              <div class="pf-tags">
                ${tags.map(t => `<span class="pf-tag">${escapeHTML(t)}</span>`).join('')}
              </div>
              <a href="${escapeHTML(demoUrl)}" ${hasDemo ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary pf-btn">
                Visit Website <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        `;
      }).join('');

      // 2. Render Dynamic Category Filters
      if (filterContainer) {
        const categories = Array.from(new Set(published.map(p => p.category).filter(Boolean)));
        
        filterContainer.innerHTML = `
          <button class="filter-btn active" data-filter="all">All</button>
          ${categories.map(c => `<button class="filter-btn" data-filter="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('')}
        `;
      }

      // 3. Rebind filter listeners
      initProjectFilters();
    })
    .catch(err => {
      // Graceful fallback to static HTML cards if API server is not running
      console.log('Dynamic API offline, using fallback static projects.');
    });
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ECOSYSTEM CAROUSEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initEcosystemCarousel() {
  const wrapper  = document.querySelector('.ecosystem-carousel-wrapper');
  const carousel = document.getElementById('ecosystemCarousel');
  const track    = document.getElementById('ecosystemTrack');
  const prevBtn  = document.getElementById('ecoPrev');
  const nextBtn  = document.getElementById('ecoNext');

  if (!wrapper || !carousel || !track) return;

  // Respect reduced motion — keep static
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Helper: width of one item + gap ─────────────────────────
  function getItemWidth() {
    const item = track.querySelector('.tech-item');
    if (!item) return 130;
    const gap = parseInt(getComputedStyle(track).gap) || 16;
    return item.getBoundingClientRect().width + gap;
  }

  // ── Start CSS infinite auto-scroll animation ─────────────────
  track.classList.add('auto-scrolling');

  // Helper to read current translateX from computed style
  function getCurrentX() {
    const style = getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41;
  }

  // Restart animation from a given pixel offset so it looks seamless
  function restartFrom(offsetPx) {
    const totalW = track.scrollWidth / 2; // half = one full set of items
    const pct    = Math.abs(offsetPx % totalW) / totalW;
    const dur    = 18; // must match CSS animation duration
    track.style.animationDelay      = `${-(pct * dur)}s`;
    track.style.animationPlayState  = 'running';
  }

  // ── Pause on hover ───────────────────────────────────────────
  let isDragging = false;
  wrapper.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  wrapper.addEventListener('mouseleave', () => {
    if (!isDragging) track.style.animationPlayState = 'running';
  });

  // ── Arrow navigation ─────────────────────────────────────────
  function scrollByStep(direction) {
    const currentX = getCurrentX();

    // Freeze position
    track.classList.remove('auto-scrolling');
    track.style.transform  = `translateX(${currentX}px)`;
    track.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';

    const step    = getItemWidth() * direction;
    const totalW  = track.scrollWidth / 2;
    let   next    = currentX - step;

    // Wrap
    if (next > 0)       next = -totalW + next;
    if (next < -totalW) next =  totalW + next;

    track.style.transform = `translateX(${next}px)`;

    setTimeout(() => {
      track.style.transition = '';
      track.style.transform  = '';
      track.classList.add('auto-scrolling');
      restartFrom(next);
    }, 450);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByStep(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByStep(1));

  // ── Mouse drag ───────────────────────────────────────────────
  let dragStartX      = 0;
  let dragStartOffset = 0;
  let dragCurrent     = 0;

  carousel.addEventListener('mousedown', (e) => {
    isDragging      = true;
    dragStartX      = e.clientX;
    dragStartOffset = getCurrentX();

    track.classList.remove('auto-scrolling');
    track.style.transform = `translateX(${dragStartOffset}px)`;
    carousel.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragCurrent = dragStartOffset + (e.clientX - dragStartX);
    track.style.transform = `translateX(${dragCurrent}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');

    const iw      = getItemWidth();
    const snapped = Math.round(dragCurrent / iw) * iw;
    track.style.transition = 'transform 0.3s ease';
    track.style.transform  = `translateX(${snapped}px)`;

    setTimeout(() => {
      track.style.transition = '';
      track.style.transform  = '';
      track.classList.add('auto-scrolling');
      restartFrom(snapped);
    }, 330);
  });

  // ── Touch swipe ──────────────────────────────────────────────
  let touchStartX      = 0;
  let touchStartOffset = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX      = e.touches[0].clientX;
    touchStartOffset = getCurrentX();
    track.classList.remove('auto-scrolling');
    track.style.transform = `translateX(${touchStartOffset}px)`;
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - touchStartX;
    track.style.transform = `translateX(${touchStartOffset + dx}px)`;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const dx      = e.changedTouches[0].clientX - touchStartX;
    const iw      = getItemWidth();
    const raw     = touchStartOffset + dx;
    const snapped = Math.round(raw / iw) * iw;

    track.style.transition = 'transform 0.35s ease';
    track.style.transform  = `translateX(${snapped}px)`;

    setTimeout(() => {
      track.style.transition = '';
      track.style.transform  = '';
      track.classList.add('auto-scrolling');
      restartFrom(snapped);
    }, 370);
  }, { passive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRICING → CONTACT INTEGRATION  (BUG-07)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initPricingContact() {
  const pricingBtns   = document.querySelectorAll('.pricing-btn');
  const contactSection = document.getElementById('contact');
  const projectTypeEl  = document.getElementById('projectType');
  if (!pricingBtns.length || !contactSection || !projectTypeEl) return;

  pricingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Get the plan from data-plan attribute
      const plan = btn.getAttribute('data-plan') || '';

      // Set the select dropdown value to match the pricing tier
      if (plan && projectTypeEl) {
        // Map pricing card data-plan values to the select option values
        const planMap = {
          'basic':    'basic',
          'standard': 'standard',
          'premium':  'premium',
        };
        const targetValue = planMap[plan.toLowerCase()] || plan.toLowerCase();

        // Find the matching option
        const options = Array.from(projectTypeEl.options);
        const match   = options.find(opt => opt.value === targetValue);
        if (match) projectTypeEl.value = match.value;
      }

      // Smooth scroll to contact section
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
      ) || 72;
      const top = contactSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });

      // Briefly highlight the project tier select to draw attention
      if (projectTypeEl) {
        projectTypeEl.classList.add('field-highlight');
        setTimeout(() => projectTypeEl.classList.remove('field-highlight'), 1200);
      }
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAVBAR HOVER ISOLATION  (BUG-08)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initNavHoverIsolation() {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  // Use mouseenter/mouseleave on each individual link.
  // This ensures only the targeted link changes — no sibling repaint.
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      // Mark only this link as hovered
      link.setAttribute('data-hovered', 'true');
    });
    link.addEventListener('mouseleave', () => {
      link.removeAttribute('data-hovered');
    });
  });
}
