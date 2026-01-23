/**
 * Syntra Cookie Consent
 * GDPR-compliant cookie consent management
 */

(function () {
    'use strict';

    const CONSENT_KEY = 'syntra_cookie_consent';
    const CONSENT_VERSION = '1.0';

    // Cookie categories
    const CATEGORIES = {
        necessary: {
            name: 'Notwendig',
            description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich.',
            required: true
        },
        analytics: {
            name: 'Analyse',
            description: 'Helfen uns zu verstehen, wie Besucher mit der Website interagieren.',
            required: false
        },
        marketing: {
            name: 'Marketing',
            description: 'Werden verwendet, um Besuchern relevante Werbung anzuzeigen.',
            required: false
        }
    };

    // Check if consent has been given
    function hasConsent() {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) return false;
        try {
            const parsed = JSON.parse(consent);
            return parsed.version === CONSENT_VERSION;
        } catch {
            return false;
        }
    }

    // Get current consent preferences
    function getConsent() {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);
            return consent ? JSON.parse(consent) : null;
        } catch {
            return null;
        }
    }

    // Save consent preferences
    function saveConsent(preferences) {
        const consent = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        hideBanner();
        applyConsent(preferences);
    }

    // Accept all cookies
    function acceptAll() {
        const preferences = {};
        Object.keys(CATEGORIES).forEach(key => {
            preferences[key] = true;
        });
        saveConsent(preferences);
    }

    // Accept only necessary cookies
    function acceptNecessary() {
        const preferences = {};
        Object.keys(CATEGORIES).forEach(key => {
            preferences[key] = CATEGORIES[key].required;
        });
        saveConsent(preferences);
    }

    // Apply consent (enable/disable tracking based on preferences)
    function applyConsent(preferences) {
        // Enable analytics if consented
        if (preferences.analytics) {
            // Placeholder for analytics initialization
            console.log('Analytics cookies enabled');
        }

        // Enable marketing if consented
        if (preferences.marketing) {
            // Placeholder for marketing cookies
            console.log('Marketing cookies enabled');
        }
    }

    // Show the cookie banner
    function showBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('visible');
            document.body.style.paddingBottom = banner.offsetHeight + 'px';
        }
    }

    // Hide the cookie banner
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('visible');
            document.body.style.paddingBottom = '';
        }
    }

    // Toggle settings panel
    function toggleSettings() {
        const settings = document.getElementById('cookie-settings-panel');
        if (settings) {
            settings.classList.toggle('visible');
        }
    }

    // Save custom preferences from settings
    function saveCustomPreferences() {
        const preferences = { necessary: true };

        const analyticsCheckbox = document.getElementById('cookie-analytics');
        const marketingCheckbox = document.getElementById('cookie-marketing');

        if (analyticsCheckbox) preferences.analytics = analyticsCheckbox.checked;
        if (marketingCheckbox) preferences.marketing = marketingCheckbox.checked;

        saveConsent(preferences);
    }

    // Initialize
    function init() {
        // Bind event handlers
        const acceptAllBtn = document.getElementById('cookie-accept-all');
        const acceptNecessaryBtn = document.getElementById('cookie-accept-necessary');
        const settingsBtn = document.getElementById('cookie-settings-btn');
        const saveSettingsBtn = document.getElementById('cookie-save-settings');
        const closeSettingsBtn = document.getElementById('cookie-close-settings');

        if (acceptAllBtn) acceptAllBtn.addEventListener('click', acceptAll);
        if (acceptNecessaryBtn) acceptNecessaryBtn.addEventListener('click', acceptNecessary);
        if (settingsBtn) settingsBtn.addEventListener('click', toggleSettings);
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveCustomPreferences);
        if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', toggleSettings);

        // Check if consent already given
        if (!hasConsent()) {
            // Small delay to let page render first
            setTimeout(showBanner, 500);
        } else {
            // Apply existing consent
            const consent = getConsent();
            if (consent && consent.preferences) {
                applyConsent(consent.preferences);
            }
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external access
    window.SyntraCookieConsent = {
        acceptAll,
        acceptNecessary,
        toggleSettings,
        getConsent,
        hasConsent
    };
})();
