/**
 * Vallit - Core JavaScript
 * Minimal, performant interactions with subtle animations
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================================================
    // Navbar scroll behavior
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // update scroll progress
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (currentScroll / height) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrolled + "%";
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // ==========================================================================
    // Mobile menu toggle
    // ==========================================================================
    const menuToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-nav');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
        });
    }

    // ==========================================================================
    // Enhanced Scroll reveal animations with stagger
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add slight stagger to elements entering at same time
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 50);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -80px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ==========================================================================
    // Smooth scroll for anchor links
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // Subtle mouse-follow glow effect (optional, very subtle)
    // ==========================================================================
    const enableMouseGlow = false; // Set to true to enable

    if (enableMouseGlow) {
        const glowEffect = document.createElement('div');
        glowEffect.className = 'glow-effect';
        document.body.appendChild(glowEffect);

        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            glowEffect.style.left = glowX + 'px';
            glowEffect.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ==========================================================================
    // Card tilt effect (subtle 3D tilt on hover)
    // ==========================================================================
    const tiltCards = document.querySelectorAll('.card, .pricing-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(1000px) translateY(0) rotateX(0) rotateY(0)';
        });
    });

    // ==========================================================================
    // Number counter animation for stats
    // ==========================================================================
    const counters = document.querySelectorAll('[data-counter]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-counter'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counterObserver.observe(counter);
    });

    // ==========================================================================
    // Hero badge pulse animation trigger
    // ==========================================================================
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
        heroBadge.style.animation = 'fadeInUp 0.6s ease-out forwards';
    }

    // ==========================================================================
    // Typing effect for hero (optional)
    // ==========================================================================
    const typingElement = document.querySelector('[data-typing]');

    if (typingElement) {
        const text = typingElement.getAttribute('data-typing');
        typingElement.textContent = '';
        let index = 0;

        function typeCharacter() {
            if (index < text.length) {
                typingElement.textContent += text.charAt(index);
                index++;
                setTimeout(typeCharacter, 50);
            }
        }

        setTimeout(typeCharacter, 500);
    }

    // ==========================================================================
    // Parallax effect for hero gradients (subtle)
    // ==========================================================================
    const heroGradients = document.querySelectorAll('.hero-gradient');

    if (heroGradients.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            heroGradients.forEach((gradient, index) => {
                const speed = 0.1 + (index * 0.05);
                gradient.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }, { passive: true });
    }

    // ==========================================================================
    // Intersection observer for section divider animation
    // ==========================================================================
    const sections = document.querySelectorAll('.section');

    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // ==========================================================================
    // Form validation
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Check honeypot
            const honeypot = contactForm.querySelector('[name="website"]');
            if (honeypot && honeypot.value) {
                console.log('Bot detected');
                return;
            }

            // Validate required fields
            const requiredFields = contactForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                const errorEl = field.parentElement.querySelector('.form-error');

                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    if (errorEl) errorEl.textContent = 'This field is required';
                } else if (field.type === 'email' && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                    if (errorEl) errorEl.textContent = 'Please enter a valid email address';
                } else {
                    field.classList.remove('error');
                    if (errorEl) errorEl.textContent = '';
                }
            });

            if (!isValid) return;

            // Show loading state with animation
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading">Sending...</span>';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            // Simulate form submission (replace with actual endpoint)
            const formData = new FormData(contactForm);

            fetch('/api/contact', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showFormSuccess();
                    } else {
                        showFormError(data.message || 'An error occurred.');
                    }
                })
                .catch(error => {
                    // For now, show success since we don't have backend yet
                    showFormSuccess();
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                });
        });

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function showFormSuccess() {
            const successEl = document.getElementById('form-success');
            const formWrapper = contactForm.closest('.contact-form-wrapper');

            if (successEl) {
                contactForm.style.opacity = '0';
                contactForm.style.transform = 'translateY(-20px)';

                setTimeout(() => {
                    contactForm.style.display = 'none';
                    successEl.style.display = 'block';
                    successEl.style.opacity = '0';
                    successEl.style.transform = 'translateY(20px)';

                    setTimeout(() => {
                        successEl.style.transition = 'all 0.5s ease';
                        successEl.style.opacity = '1';
                        successEl.style.transform = 'translateY(0)';
                    }, 50);
                }, 300);
            }
        }

        function showFormError(message) {
            const errorEl = document.getElementById('form-error');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
                errorEl.style.animation = 'fadeInUp 0.3s ease';
            }
        }

        // Clear errors on input with subtle animation
        contactForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function () {
                this.classList.remove('error');
                const errorEl = this.parentElement.querySelector('.form-error');
                if (errorEl) {
                    errorEl.style.opacity = '0';
                    setTimeout(() => {
                        errorEl.textContent = '';
                        errorEl.style.opacity = '1';
                    }, 200);
                }
            });

            // Add focus animation
            field.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });

            field.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused');
            });
        });
    }

    // ==========================================================================
    // Logo marquee pause on hover
    // ==========================================================================
    const logoMarquee = document.querySelector('.logo-marquee');
    const logoTrack = document.querySelector('.logo-track');

    if (logoMarquee && logoTrack) {
        logoMarquee.addEventListener('mouseenter', () => {
            logoTrack.style.animationPlayState = 'paused';
        });

        logoMarquee.addEventListener('mouseleave', () => {
            logoTrack.style.animationPlayState = 'running';
        });
    }

});

// ==========================================================================
// Smooth page transition (optional)
// ==========================================================================
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});
