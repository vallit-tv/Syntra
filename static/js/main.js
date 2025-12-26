// Common JavaScript functions

// Form handling
function handleFormSubmit(formId, endpoint, onSuccess, onError) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok && onSuccess) {
                onSuccess(result);
            } else {
                const errorMsg = result.error || 'Error occurred';
                if (onError) {
                    onError(errorMsg);
                } else {
                    alert(errorMsg);
                }
            }
        } catch (error) {
            const errorMsg = 'Network error: ' + error.message;
            if (onError) {
                onError(errorMsg);
            } else {
                alert(errorMsg);
            }
        }
    });
}

// Show/hide messages
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
}

(function () {
    const syntra = window.syntra || (window.syntra = {});

    syntra.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    };

    syntra.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    };

    syntra.setButtonLoading = function (button, loadingText) {
        if (!button) return () => { };
        const original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = loadingText;
        return function reset() {
            button.disabled = false;
            button.innerHTML = original;
        };
    };

    document.addEventListener('click', function (event) {
        if (event.target.classList && event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // ================================
    // FIX #85: TOAST NOTIFICATION SYSTEM
    // ================================
    syntra.toast = (function () {
        let container = null;

        const createContainer = () => {
            if (container) return container;
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('role', 'alert');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
            return container;
        };

        const show = (options) => {
            const {
                title = '',
                message = '',
                type = 'info', // success, error, warning, info
                duration = 5000
            } = options;

            createContainer();

            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${icons[type]}</span>
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    ${message ? `<div class="toast-message">${message}</div>` : ''}
                </div>
                <button class="toast-close" aria-label="Close">&times;</button>
            `;

            container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('visible');
            });

            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                dismiss(toast);
            });

            // Auto dismiss
            if (duration > 0) {
                setTimeout(() => dismiss(toast), duration);
            }

            return toast;
        };

        const dismiss = (toast) => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.remove();
            }, 300);
        };

        const success = (message, title = 'Success') => show({ type: 'success', title, message });
        const error = (message, title = 'Error') => show({ type: 'error', title, message });
        const warning = (message, title = 'Warning') => show({ type: 'warning', title, message });
        const info = (message, title = 'Info') => show({ type: 'info', title, message });

        return { show, success, error, warning, info, dismiss };
    })();

    // ================================
    // FIX #53: BUTTON LOADING UTILITY
    // ================================
    syntra.setButtonLoading = function (button, loadingText) {
        if (!button) return () => { };
        const original = button.innerHTML;
        const originalDisabled = button.disabled;

        button.disabled = true;
        button.classList.add('loading');
        if (loadingText) {
            button.setAttribute('data-original-text', button.textContent);
        }

        return function reset() {
            button.disabled = originalDisabled;
            button.classList.remove('loading');
            button.innerHTML = original;
        };
    };

    // ================================
    // FIX #93: ERROR LOGGING
    // ================================
    syntra.logError = function (error, context = '') {
        const errorData = {
            message: error.message || String(error),
            stack: error.stack,
            context,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        console.error('[Syntra Error]', errorData);

        // Could send to error tracking service here
        // if (window.errorTracker) { window.errorTracker.capture(errorData); }
    };

    // Global error handler
    window.addEventListener('error', (event) => {
        syntra.logError(event.error, 'Global error handler');
    });

    window.addEventListener('unhandledrejection', (event) => {
        syntra.logError(event.reason, 'Unhandled promise rejection');
    });

})();
