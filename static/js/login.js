// Progressive Login System
(function () {
    'use strict';

    // State management
    let currentState = {
        username: '',
        needsPassword: false,
        userExists: false,
        isCreatingPassword: false
    };

    // DOM elements
    const elements = {
        form: document.getElementById('loginForm'),
        stepUsername: document.getElementById('stepUsername'),
        stepPassword: document.getElementById('stepPassword'),
        nameInput: document.getElementById('name'),
        passwordInput: document.getElementById('password'),
        confirmPasswordInput: document.getElementById('confirmPassword'),
        confirmPasswordGroup: document.getElementById('confirmPasswordGroup'),
        passwordRequirements: document.getElementById('passwordRequirements'),
        passwordLabel: document.getElementById('passwordLabel'),
        passwordStrength: document.getElementById('passwordStrength'),
        passwordToggle: document.getElementById('passwordToggle'),
        continueBtn: document.getElementById('continueBtn'),
        backBtn: document.getElementById('backBtn'),
        submitBtn: document.getElementById('submitBtn'),
        submitText: document.getElementById('submitText'),
        submitSpinner: document.getElementById('submitSpinner'),
        usernameError: document.getElementById('usernameError'),
        passwordError: document.getElementById('passwordError'),
        loadingIndicator: document.getElementById('loadingOverlay'),
        eyeIcon: document.getElementById('eyeIcon')
    };

    // Initialize
    function init() {
        setupEventListeners();
        elements.nameInput.focus();
    }

    // Event listeners
    function setupEventListeners() {
        // Username input - Enter key
        elements.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleUsernameSubmit();
            }
        });

        // Continue button
        elements.continueBtn.addEventListener('click', handleUsernameSubmit);

        // Back button
        elements.backBtn.addEventListener('click', () => {
            showUsernameStep();
        });

        // Password toggle
        elements.passwordToggle.addEventListener('click', togglePasswordVisibility);

        // Password input - real-time validation
        elements.passwordInput.addEventListener('input', () => {
            if (currentState.isCreatingPassword) {
                validatePasswordStrength();
            }
        });

        // Confirm password input
        elements.confirmPasswordInput.addEventListener('input', () => {
            if (currentState.isCreatingPassword) {
                validatePasswordMatch();
            }
        });

        // Form submit
        elements.form.addEventListener('submit', handleFormSubmit);
    }

    // Handle username submission
    async function handleUsernameSubmit() {
        const username = elements.nameInput.value.trim();

        if (!username || username.length < 2) {
            showError(elements.usernameError, 'Username must be at least 2 characters');
            return;
        }

        currentState.username = username;
        showLoading(true);
        hideError(elements.usernameError);

        try {
            const response = await fetch('/api/auth/check-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin', // Include cookies in request
                body: JSON.stringify({ name: username })
            });

            const data = await response.json();

            if (response.status === 429) {
                showError(elements.usernameError, data.error || 'Too many attempts. Please try again later.');
                showLoading(false);
                return;
            }

            if (!data.exists) {
                showError(elements.usernameError, 'User not found. Please contact an administrator.');
                showLoading(false);
                return;
            }

            // User exists
            currentState.userExists = true;
            currentState.needsPassword = data.needs_password;
            currentState.isCreatingPassword = data.needs_password;

            showLoading(false);
            showPasswordStep();
        } catch (error) {
            showError(elements.usernameError, 'Network error. Please try again.');
            showLoading(false);
        }
    }

    // Show password step
    function showPasswordStep() {
        // Update UI based on password status
        if (currentState.needsPassword) {
            elements.passwordLabel.textContent = 'Create your password';
            elements.submitText.textContent = 'Create Password';
            elements.confirmPasswordGroup.style.display = 'block';
            elements.passwordRequirements.style.display = 'block';
            elements.passwordInput.placeholder = 'Create a strong password';
            elements.confirmPasswordInput.required = true;
        } else {
            elements.passwordLabel.textContent = 'Enter your password';
            elements.submitText.textContent = 'Login';
            elements.confirmPasswordGroup.style.display = 'none';
            elements.passwordRequirements.style.display = 'none';
            elements.passwordInput.placeholder = 'Enter your password';
            elements.confirmPasswordInput.required = false;
        }

        // Switch steps
        elements.stepUsername.classList.remove('active');
        elements.stepPassword.classList.add('active');
        elements.passwordInput.focus();
    }

    // Show username step (back button)
    function showUsernameStep() {
        // Switch steps
        elements.stepPassword.classList.remove('active');
        elements.stepUsername.classList.add('active');

        // Reset state
        currentState.needsPassword = false;
        currentState.isCreatingPassword = false;
        elements.passwordInput.value = '';
        elements.confirmPasswordInput.value = '';
        hideError(elements.passwordError);
        if (elements.passwordStrength) elements.passwordStrength.style.display = 'none';

        elements.nameInput.focus();
    }

    // Handle form submit
    async function handleFormSubmit(e) {
        e.preventDefault();

        const password = elements.passwordInput.value;

        if (!password) {
            showError(elements.passwordError, 'Password is required');
            return;
        }

        if (currentState.isCreatingPassword) {
            // Validate password creation
            const confirmPassword = elements.confirmPasswordInput.value;
            if (password !== confirmPassword) {
                showError(elements.passwordError, 'Passwords do not match');
                return;
            }

            // Check password strength
            if (!isPasswordStrong(password)) {
                showError(elements.passwordError, 'Password does not meet requirements');
                return;
            }

            await createPassword();
        } else {
            await login();
        }
    }

    // Create password
    async function createPassword() {
        showLoading(true);
        hideError(elements.passwordError);
        setSubmitLoading(true);

        try {
            const response = await fetch('/api/auth/setup-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin', // Include cookies in request
                body: JSON.stringify({
                    name: currentState.username,
                    password: elements.passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success - redirect based on user role
                const redirectUrl = data.redirect || '/dashboard';
                showSuccess('Password created successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            } else {
                showError(elements.passwordError, data.error || 'Failed to create password');
                showLoading(false);
                setSubmitLoading(false);
            }
        } catch (error) {
            showError(elements.passwordError, 'Network error. Please try again.');
            showLoading(false);
            setSubmitLoading(false);
        }
    }

    // Login
    async function login() {
        showLoading(true);
        hideError(elements.passwordError);
        setSubmitLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin', // Include cookies in request
                body: JSON.stringify({
                    name: currentState.username,
                    password: elements.passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success - redirect based on user role
                const redirectUrl = data.redirect || '/dashboard';
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            } else {
                showError(elements.passwordError, data.error || 'Invalid credentials');
                showLoading(false);
                setSubmitLoading(false);
            }
        } catch (error) {
            showError(elements.passwordError, 'Network error. Please try again.');
            showLoading(false);
            setSubmitLoading(false);
        }
    }

    // Password strength validation
    function validatePasswordStrength() {
        const password = elements.passwordInput.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };

        // Update requirement indicators
        updateRequirement('req-length', requirements.length);
        updateRequirement('req-uppercase', requirements.uppercase);
        updateRequirement('req-lowercase', requirements.lowercase);
        updateRequirement('req-number', requirements.number);

        // Show strength indicator
        if (password.length > 0) {
            elements.passwordStrength.style.display = 'block';
            const strength = calculateStrength(requirements);
            elements.passwordStrength.className = `password-strength strength-${strength.level}`;
            elements.passwordStrength.textContent = strength.text;
        } else {
            elements.passwordStrength.style.display = 'none';
        }
    }

    function updateRequirement(id, met) {
        const element = document.getElementById(id);
        const icon = element.querySelector('.requirement-icon');
        if (met) {
            element.classList.add('requirement-met');
            icon.textContent = '✓';
        } else {
            element.classList.remove('requirement-met');
            icon.textContent = '○';
        }
    }

    function calculateStrength(requirements) {
        const met = Object.values(requirements).filter(Boolean).length;
        if (met === 4) {
            return { level: 'strong', text: 'Strong password' };
        } else if (met === 3) {
            return { level: 'medium', text: 'Medium strength' };
        } else if (met === 2) {
            return { level: 'weak', text: 'Weak password' };
        }
        return { level: 'weak', text: 'Very weak password' };
    }

    function isPasswordStrong(password) {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password);
    }

    function validatePasswordMatch() {
        const password = elements.passwordInput.value;
        const confirm = elements.confirmPasswordInput.value;

        if (confirm && password !== confirm) {
            elements.confirmPasswordInput.setCustomValidity('Passwords do not match');
        } else {
            elements.confirmPasswordInput.setCustomValidity('');
        }
    }

    // Toggle password visibility
    function togglePasswordVisibility() {
        const type = elements.passwordInput.type === 'password' ? 'text' : 'password';
        elements.passwordInput.type = type;
        elements.confirmPasswordInput.type = type;

        if (elements.eyeIcon) {
            elements.eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
        }
    }

    // Utility functions
    function showLoading(show) {
        if (elements.loadingIndicator) {
            elements.loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    function setSubmitLoading(loading) {
        elements.submitBtn.disabled = loading;
        elements.submitText.style.display = loading ? 'none' : 'inline';
        elements.submitSpinner.style.display = loading ? 'inline-block' : 'none';
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.style.animation = 'shake 0.3s';
    }

    function hideError(element) {
        element.style.display = 'none';
        element.textContent = '';
    }

    function showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.left = '50%';
        successDiv.style.transform = 'translateX(-50%)';
        successDiv.style.zIndex = '10000';
        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

