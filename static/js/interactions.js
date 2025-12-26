/**
 * Syntra Advanced Interactions
 * Scroll animations, counters, and creative effects
 */

(function () {
    'use strict';

    // ================================
    // MOBILE MENU TOGGLE (Fix #1)
    // ================================
    const initMobileMenu = () => {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        const headerActions = document.querySelector('.header-actions');
        const body = document.body;

        if (!menuToggle) return;

        // Create mobile menu overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);

        const toggleMenu = (open) => {
            const isOpen = open ?? !menuToggle.classList.contains('active');

            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen);
            mainNav?.classList.toggle('mobile-open', isOpen);
            headerActions?.classList.toggle('mobile-open', isOpen);
            overlay.classList.toggle('active', isOpen);
            body.classList.toggle('menu-open', isOpen);

            // Trap focus when menu is open
            if (isOpen) {
                mainNav?.querySelector('a')?.focus();
            }
        };

        menuToggle.setAttribute('aria-label', 'Open menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', 'main-nav');

        menuToggle.addEventListener('click', () => toggleMenu());
        overlay.addEventListener('click', () => toggleMenu(false));

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuToggle.classList.contains('active')) {
                toggleMenu(false);
                menuToggle.focus();
            }
        });

        // Close on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && menuToggle.classList.contains('active')) {
                toggleMenu(false);
            }
        });
    };

    // ================================
    // TESTIMONIAL CAROUSEL PAUSE ON HOVER (Fix #4)
    // ================================
    const initTestimonialPause = () => {
        const carousel = document.querySelector('.testimonials-carousel');
        if (!carousel) return;

        // Access the interval from window (set in index.html)
        carousel.addEventListener('mouseenter', () => {
            window.testimonialPaused = true;
        });

        carousel.addEventListener('mouseleave', () => {
            window.testimonialPaused = false;
        });

        // Add keyboard navigation for testimonials
        const dots = carousel.querySelectorAll('.testimonial-dot');
        dots.forEach((dot, index) => {
            dot.setAttribute('role', 'button');
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);

            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dot.click();
                }
            });
        });
    };

    // ================================
    // ACCESSIBILITY: FOCUS VISIBLE STATES (Fix #8)
    // ================================
    const initFocusVisible = () => {
        // Add focus-visible polyfill behavior
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    };

    // ================================
    // SCROLL-TO-TOP BUTTON ENHANCEMENT (Fix #12)
    // ================================
    const enhanceScrollToTop = () => {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;

        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');

        // Add keyboard support
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    // ================================
    // SKIP LINK FOCUS MANAGEMENT (Fix #14)
    // ================================
    const initSkipLink = () => {
        const skipLink = document.querySelector('.skip-to-content');
        const mainContent = document.querySelector('#main-content');

        if (skipLink && mainContent) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                mainContent.removeAttribute('tabindex');
            });
        }
    };

    // Initialize all fixes on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        initMobileMenu();
        initTestimonialPause();
        initFocusVisible();
        enhanceScrollToTop();
        initSkipLink();
    });
    // ================================
    // INTERSECTION OBSERVER - SCROLL REVEALS
    // ================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const revealCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on element index within parent
                const siblings = entry.target.parentElement?.children;
                let delay = 0;
                if (siblings) {
                    const idx = Array.from(siblings).indexOf(entry.target);
                    delay = idx * 100; // 100ms stagger
                }

                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

    // Observe all elements with reveal classes
    document.addEventListener('DOMContentLoaded', () => {
        const revealElements = document.querySelectorAll(
            '.feature-card-v2, .feature-detail-card, .feature-benefit-card, ' +
            '.pricing-card, .pricing-card-premium, .use-case-card, .faq-item, ' +
            '.why-us-card, .about-value-card, .about-stat, .team-member-card, ' +
            '.security-badge, .more-feature-item, .benefit-plain-card, .process-step'
        );

        revealElements.forEach(el => {
            el.classList.add('reveal-element');
            revealObserver.observe(el);
        });
    });

    // ================================
    // ANIMATED NUMBER COUNTERS
    // ================================
    const animateCounter = (element, target, suffix = '') => {
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;

        const isFloat = target % 1 !== 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out-expo)
            const easeOut = 1 - Math.pow(2, -10 * progress);

            const currentValue = startValue + (target - startValue) * easeOut;

            if (isFloat) {
                element.textContent = currentValue.toFixed(1) + suffix;
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString('de-DE') + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    // Counter observer
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const rawText = el.textContent.trim();

                // Parse number and suffix
                const match = rawText.match(/^([\d.,]+)(.*)$/);
                if (match) {
                    const numStr = match[1].replace(/\./g, '').replace(',', '.');
                    const num = parseFloat(numStr);
                    const suffix = match[2];

                    if (!isNaN(num)) {
                        el.textContent = '0' + suffix;
                        animateCounter(el, num, suffix);
                    }
                }

                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    // Observe stat numbers
    document.addEventListener('DOMContentLoaded', () => {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(el => counterObserver.observe(el));
    });

    // ================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ================================
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }
    });

    // ================================
    // PARALLAX SCROLL EFFECT
    // ================================
    let ticking = false;

    const updateParallax = () => {
        const scrollY = window.scrollY;

        // Parallax for hero orbs
        const orbs = document.querySelectorAll('.hero-orb');
        orbs.forEach((orb, i) => {
            const speed = 0.3 + (i * 0.1);
            orb.style.transform = `translateY(${scrollY * speed}px)`;
        });

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // ================================
    // MAGNETIC BUTTON EFFECT
    // ================================
    const magneticButtons = document.querySelectorAll('.btn-cta-primary, .btn-hero-primary, .pricing-cta');

    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ================================
    // TILT EFFECT ON CARDS
    // ================================
    const tiltCards = document.querySelectorAll('.feature-detail-card, .pricing-card-premium');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            card.style.transform = `
                perspective(1000px)
                rotateY(${x * 8}deg)
                rotateX(${-y * 8}deg)
                translateY(-4px)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
        });
    });

    // ================================
    // TYPING EFFECT
    // ================================
    const typeText = (element, text, speed = 50) => {
        let index = 0;
        element.textContent = '';
        element.style.opacity = '1';

        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        };

        type();
    };

    // ================================
    // SCROLL PROGRESS BAR
    // ================================
    const createScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    };

    createScrollProgress();

    // ================================
    // RIPPLE EFFECT ON BUTTONS
    // ================================
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button, .btn-cta-primary, .btn-hero-primary, .pricing-cta');
        if (button) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }
    });

    // ================================
    // BACK TO TOP BUTTON
    // ================================
    const createBackToTop = () => {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
            </svg>
        `;
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    };

    createBackToTop();

    // ================================
    // FAQ ACCORDION (if exists)
    // ================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const title = item.querySelector('h4');
        if (title) {
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => {
                item.classList.toggle('expanded');
            });
        }
    });

    // ================================
    // LAZY LOAD IMAGES
    // ================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach(img => imageObserver.observe(img));

    // ================================
    // ACTIVE NAV HIGHLIGHTING
    // ================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // ================================
    // MOUSE SPOTLIGHT ON CARDS
    // ================================
    const spotlightCards = document.querySelectorAll('.feature-card-v2, .why-us-card, .benefit-plain-card');

    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

})();
