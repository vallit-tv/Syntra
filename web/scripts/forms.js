// Form handling JavaScript - Only for interactive features

document.addEventListener('DOMContentLoaded', function () {
    // Contact form handling
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                alert('Thank you for your message! We\'ll get back to you soon.');
                this.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1000);
        });
    }

    // Login form handling
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = this.querySelector('input[name="email"]').value;
            const password = this.querySelector('input[name="password"]').value;

            if (email && password) {
                // Show loading state
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.textContent = 'Signing In...';
                submitButton.disabled = true;

                // Simulate login (replace with actual authentication)
                setTimeout(() => {
                    alert('Login successful! Redirecting to dashboard...');
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                alert('Please enter both email and password');
            }
        });
    }
});
