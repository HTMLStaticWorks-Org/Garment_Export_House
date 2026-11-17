/* ==========================================================================
   VALERIS — Global Interactive Logic
   Theme, RTL/LTR, Navigation, Scroll Animations, Counters, Timelines, Forms
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_THEME = 'valeris_theme';
  const STORAGE_DIR = 'valeris_dir';

  // 1. Theme (Light / Dark) & Direction (LTR / RTL) Initialization
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_THEME, theme);
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      const label = btn.querySelector('.toggle-label');
      if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
      btn.title = theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode';
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  }

  function applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem(STORAGE_DIR, dir);
    document.querySelectorAll('[data-dir-toggle]').forEach((btn) => {
      const label = btn.querySelector('.toggle-label');
      if (label) label.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      btn.title = dir === 'rtl' ? 'Switch to LTR layout' : 'Switch to RTL layout';
      btn.setAttribute('aria-pressed', dir === 'rtl' ? 'true' : 'false');
    });
  }

  const savedTheme = localStorage.getItem(STORAGE_THEME) || 'light';
  const savedDir = localStorage.getItem(STORAGE_DIR) || 'ltr';
  applyTheme(savedTheme);
  applyDir(savedDir);

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem(STORAGE_THEME) || 'light');
    applyDir(localStorage.getItem(STORAGE_DIR) || 'ltr');

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    document.querySelectorAll('[data-dir-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
        applyDir(current === 'rtl' ? 'ltr' : 'rtl');
      });
    });

    // 2. Sticky Header & Mobile Hamburger Drawer
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 24);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const hamburger = document.querySelector('[data-hamburger]');
    const drawer = document.querySelector('[data-mobile-drawer]');
    if (hamburger && drawer) {
      hamburger.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.documentElement.style.overflow = isOpen ? 'hidden' : '';
      });
      drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.documentElement.style.overflow = '';
        });
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.documentElement.style.overflow = '';
        }
      });
    }

    // 3. Scroll-Triggered Section & Element Animations
    const animTargets = Array.from(document.querySelectorAll('[data-anim]'));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEl = (el) => {
      if (el.classList.contains('is-visible')) return;
      const delay = el.getAttribute('data-delay');
      if (delay) el.style.transitionDelay = delay + 'ms';
      el.classList.add('is-visible');
    };
    const revealVisibleInViewport = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      animTargets.forEach((el) => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh + 120 && rect.bottom >= -120) {
          revealEl(el);
        }
      });
    };
    if (prefersReduced || !('IntersectionObserver' in window)) {
      animTargets.forEach(revealEl);
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealEl(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: '120px 0px 120px 0px' }
      );
      animTargets.forEach((el) => observer.observe(el));
      window.addEventListener('scroll', revealVisibleInViewport, { passive: true });
      window.addEventListener('resize', revealVisibleInViewport, { passive: true });
      revealVisibleInViewport();
    }

    // 4. Animated Counters
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length && 'IntersectionObserver' in window) {
      const countObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.getAttribute('data-count'));
            const suffix = el.getAttribute('data-suffix') || '';
            const prefix = el.getAttribute('data-prefix') || '';
            const duration = 1300;
            const start = performance.now();
            function tick(now) {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              const val = Math.round(target * eased);
              el.textContent = prefix + val.toLocaleString() + suffix;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            countObs.unobserve(el);
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((c) => countObs.observe(c));
    }

    // 5. Interactive Timelines (About Us & Home 2 Quality Promise)
    document.querySelectorAll('[data-timeline-root]').forEach((root) => {
      const tabs = root.querySelectorAll('[data-timeline-tab]');
      const panels = root.querySelectorAll('[data-timeline-panel]');
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const id = tab.getAttribute('data-timeline-tab');
          tabs.forEach((t) => {
            t.classList.toggle('active', t === tab);
            t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
          });
          panels.forEach((p) => {
            p.hidden = p.getAttribute('data-timeline-panel') !== id;
          });
        });
      });
    });

    // 6. FAQ Accordion & Category Dropdown (Contact Us)
    document.querySelectorAll('.faq-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });

    const faqFilter = document.getElementById('faq-category-filter');
    if (faqFilter) {
      faqFilter.addEventListener('change', () => {
        const val = faqFilter.value;
        document.querySelectorAll('.faq-item[data-faq-cat]').forEach((item) => {
          item.hidden = val !== 'all' && item.getAttribute('data-faq-cat') !== val;
        });
      });
    }

    // 7. Back-to-Top Button
    document.querySelectorAll('[data-back-to-top]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // 8. Footer Newsletter Form
    document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const feedback = form.parentElement.querySelector('.newsletter-feedback');
        const email = (input.value || '').trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!valid) {
          feedback.textContent = 'Please enter a valid corporate email address.';
          return;
        }
        feedback.textContent = 'Subscribed locally (preview mode — connect your ESP/CRM endpoint for live dispatch).';
        input.value = '';
      });
    });

    // 9. Password Visibility Toggles (Login & Signup)
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle-password');
        const input = document.getElementById(targetId);
        if (!input) return;
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      });
    });

    // 10. Contact Sourcing Enquiry Form Validation & File Dropzone
    const enquiryForm = document.getElementById('sourcing-enquiry-form');
    if (enquiryForm) {
      const fileInput = document.getElementById('enquiry-file');
      const dropzone = document.getElementById('file-dropzone');
      const fileListEl = document.getElementById('file-selected-name');
      const statusBox = document.getElementById('enquiry-status-box');

      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            fileListEl.textContent = Array.from(e.dataTransfer.files).map((f) => f.name).join(', ');
          }
        });
        fileInput.addEventListener('change', () => {
          if (fileInput.files.length) {
            fileListEl.textContent = Array.from(fileInput.files).map((f) => f.name).join(', ');
          }
        });
      }

      enquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        const requiredFields = enquiryForm.querySelectorAll('[data-required]');
        requiredFields.forEach((field) => {
          const err = field.parentElement.querySelector('.field-error');
          let msg = '';
          const val = (field.value || '').trim();
          if (!val) {
            msg = 'This field is required.';
          } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            msg = 'Enter a valid business email.';
          } else if (field.id === 'order-qty' && (isNaN(Number(val)) || Number(val) < 50)) {
            msg = 'Minimum export order quantity is 50 units.';
          }
          if (msg) {
            valid = false;
            field.classList.add('invalid');
            if (err) err.textContent = msg;
          } else {
            field.classList.remove('invalid');
            if (err) err.textContent = '';
          }
        });

        statusBox.classList.remove('show', 'success', 'error');
        if (!valid) {
          statusBox.className = 'form-status-box show error';
          statusBox.textContent = 'Please review the highlighted fields before submitting your sourcing brief.';
          return;
        }
        statusBox.className = 'form-status-box show success';
        statusBox.textContent =
          'Enquiry validated on the client. No backend server is connected in this static build—connect this form handler to your B2B CRM/API endpoint to transmit the brief.';
      });
    }

    // 11. Login Form Validation (Realistic Frontend Flow)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      const status = document.getElementById('login-status');
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-password');
        let ok = true;
        const emailErr = email.closest('.form-group').querySelector('.field-error');
        const passErr = pass.closest('.form-group').querySelector('.field-error');

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          email.classList.add('invalid');
          emailErr.textContent = 'Enter a valid corporate email address.';
          ok = false;
        } else {
          email.classList.remove('invalid');
          emailErr.textContent = '';
        }

        if (pass.value.length < 8) {
          pass.classList.add('invalid');
          passErr.textContent = 'Password must be at least 8 characters.';
          ok = false;
        } else {
          pass.classList.remove('invalid');
          passErr.textContent = '';
        }

        status.className = 'form-status-box show ' + (ok ? 'error' : 'error');
        if (ok) {
          status.textContent =
            'Credentials validated locally. Authentication requires a live backend identity provider; connect your OAuth/JWT endpoint to complete sign-in.';
        } else {
          status.textContent = 'Please fix the validation errors above.';
        }
      });
    }

    // 12. Signup Form Validation (Password Match + Terms)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      const status = document.getElementById('signup-status');
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        const name = document.getElementById('signup-name');
        const company = document.getElementById('signup-company');
        const email = document.getElementById('signup-email');
        const phone = document.getElementById('signup-phone');
        const pass = document.getElementById('signup-password');
        const confirm = document.getElementById('signup-confirm');
        const terms = document.getElementById('signup-terms');

        const check = (el, cond, msg) => {
          const err = el.closest('.form-group').querySelector('.field-error');
          if (!cond) {
            el.classList.add('invalid');
            if (err) err.textContent = msg;
            ok = false;
          } else {
            el.classList.remove('invalid');
            if (err) err.textContent = '';
          }
        };

        check(name, name.value.trim().length >= 2, 'Enter your full name.');
        check(company, company.value.trim().length >= 2, 'Enter your company name.');
        check(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Enter a valid business email.');
        check(phone, phone.value.trim().length >= 7, 'Enter a valid contact number.');
        check(pass, pass.value.length >= 8, 'Password must be at least 8 characters.');
        check(confirm, confirm.value === pass.value && confirm.value.length >= 8, 'Passwords do not match.');

        const termsErr = terms.closest('.form-group').querySelector('.field-error');
        if (!terms.checked) {
          termsErr.textContent = 'You must accept the B2B Terms & Privacy Policy.';
          ok = false;
        } else {
          termsErr.textContent = '';
        }

        status.className = 'form-status-box show ' + (ok ? 'success' : 'error');
        status.textContent = ok
          ? 'Registration fields validated locally. Connect your buyer onboarding API endpoint to provision the account.'
          : 'Please review the highlighted registration fields.';
      });
    }
  });
})();
