/* ============================================================
   MAGIC UI — behavior layer
   - Blur-fade scroll reveal (IntersectionObserver)
   - Spotlight cards follow the mouse
   - Magic rating slider gradient fill
   ============================================================ */
(() => {
  'use strict';

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Blur-fade reveal ------------------------------- */
  const revealEls = document.querySelectorAll('.magic-blur-fade');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => {
      // Stagger siblings automatically unless a --delay is set in markup
      if (!el.style.getPropertyValue('--delay') && el.parentElement) {
        const idx = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty('--delay', `${Math.min(idx, 9) * 90}ms`);
      }
      io.observe(el);
    });

    // Safety net: if a reveal got stuck (background tab on load, suspended
    // renderer), snap it to its final state so content is never invisible.
    setTimeout(() => {
      document.querySelectorAll('.magic-blur-fade.in-view').forEach((el) => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
          el.classList.add('magic-reveal-instant');
        }
      });
    }, 2000);
  }

  /* ---------- Spotlight cards follow the mouse ---------------- */
  document.querySelectorAll('.magic-spotlight').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  /* ---------- Magic rating slider gradient fill ---------------- */
  document.querySelectorAll('.magic-rating').forEach((range) => {
    const paint = () => {
      const min = Number(range.min) || 0;
      const max = Number(range.max) || 100;
      const pct = ((Number(range.value) - min) / (max - min)) * 100;
      range.style.setProperty('--fill', `${pct}%`);
    };
    paint();
    range.addEventListener('input', paint);
  });
})();
