/**
 * Syntra Dashboard V2 Controller
 * Handles UI interactions for the new dashboard design.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initDropdowns();

    // Re-init icons if needed dynamically
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

function initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.createElement('div');

    // Create overlay for mobile
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 45;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            toggleOverlay(sidebar.classList.contains('open'));
        });

        // Close when clicking overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            toggleOverlay(false);
        });
    }

    function toggleOverlay(show) {
        if (show) {
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        } else {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        }
    }
}

function initDropdowns() {
    // User Menu
    const userBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userMenuDropdown');

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = userDropdown.classList.contains('hidden');
            closeAllDropdowns(); // Close others first
            if (isHidden) {
                userDropdown.classList.remove('hidden');
            }
        });
    }

    // Close on click outside
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(el => el.classList.add('hidden'));
}

// Utility to create icons dynamically
window.refreshIcons = function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};
