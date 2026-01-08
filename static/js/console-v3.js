/* ============================================================================
   VALLIT CONSOLE V3 - JavaScript Utilities
   Theme Toggle, Toast System, Modal System, Command Palette
   ============================================================================ */

(function () {
    'use strict';

    // ========================================================================
    // THEME MANAGER
    // ========================================================================
    const ThemeManager = {
        STORAGE_KEY: 'vallit-theme',

        init() {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (prefersDark ? 'dark' : 'light');
            this.setTheme(theme, false);

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.STORAGE_KEY)) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        },

        setTheme(theme, save = true) {
            document.documentElement.setAttribute('data-theme', theme);
            if (save) {
                localStorage.setItem(this.STORAGE_KEY, theme);
            }
            this.updateToggleIcon(theme);
        },

        toggle() {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            this.setTheme(next);
            return next;
        },

        updateToggleIcon(theme) {
            const toggle = document.querySelector('.theme-toggle');
            if (!toggle) return;

            const icon = toggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        },

        getTheme() {
            return document.documentElement.getAttribute('data-theme') || 'light';
        }
    };

    // ========================================================================
    // TOAST SYSTEM
    // ========================================================================
    const Toast = {
        container: null,

        init() {
            if (!document.querySelector('.toast-container')) {
                this.container = document.createElement('div');
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            } else {
                this.container = document.querySelector('.toast-container');
            }
        },

        show(message, type = 'info', duration = 4000) {
            if (!this.container) this.init();

            const icons = {
                success: 'check-circle',
                error: 'x-circle',
                warning: 'alert-triangle',
                info: 'info'
            };

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <i data-lucide="${icons[type] || 'info'}" class="toast-icon"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close">
                    <i data-lucide="x" width="14" height="14"></i>
                </button>
            `;

            this.container.appendChild(toast);

            // Initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ icons: [icons[type] || 'info', 'x'] });
            }

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.dismiss(toast);
            });

            // Auto dismiss
            if (duration > 0) {
                setTimeout(() => this.dismiss(toast), duration);
            }

            return toast;
        },

        dismiss(toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },

        success(message, duration) {
            return this.show(message, 'success', duration);
        },

        error(message, duration) {
            return this.show(message, 'error', duration);
        },

        warning(message, duration) {
            return this.show(message, 'warning', duration);
        },

        info(message, duration) {
            return this.show(message, 'info', duration);
        }
    };

    // ========================================================================
    // MODAL SYSTEM
    // ========================================================================
    const Modal = {
        activeModal: null,

        open(modalId) {
            const backdrop = document.getElementById(modalId);
            if (!backdrop) return;

            backdrop.classList.add('open');
            this.activeModal = backdrop;
            document.body.style.overflow = 'hidden';

            // Focus first input
            const firstInput = backdrop.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }

            // Close on backdrop click
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.close();
                }
            });
        },

        close() {
            if (this.activeModal) {
                this.activeModal.classList.remove('open');
                document.body.style.overflow = '';
                this.activeModal = null;
            }
        },

        confirm(options) {
            const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' } = options;

            return new Promise((resolve) => {
                // Create modal
                const modalId = 'confirm-modal-' + Date.now();
                const backdrop = document.createElement('div');
                backdrop.id = modalId;
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `
                    <div class="modal" style="max-width: 400px;">
                        <div class="modal-header">
                            <h3 class="modal-title">${title}</h3>
                            <button class="modal-close" aria-label="Close">
                                <i data-lucide="x" width="18" height="18"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p style="color: var(--text-secondary);">${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary cancel-btn">${cancelText}</button>
                            <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'} confirm-btn">${confirmText}</button>
                        </div>
                    </div>
                `;

                document.body.appendChild(backdrop);

                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }

                // Open modal
                requestAnimationFrame(() => {
                    backdrop.classList.add('open');
                    document.body.style.overflow = 'hidden';
                });

                const cleanup = (result) => {
                    backdrop.classList.remove('open');
                    document.body.style.overflow = '';
                    setTimeout(() => {
                        backdrop.remove();
                    }, 300);
                    resolve(result);
                };

                backdrop.querySelector('.cancel-btn').addEventListener('click', () => cleanup(false));
                backdrop.querySelector('.confirm-btn').addEventListener('click', () => cleanup(true));
                backdrop.querySelector('.modal-close').addEventListener('click', () => cleanup(false));
                backdrop.addEventListener('click', (e) => {
                    if (e.target === backdrop) cleanup(false);
                });
            });
        }
    };

    // ========================================================================
    // COMMAND PALETTE
    // ========================================================================
    const CommandPalette = {
        isOpen: false,
        selectedIndex: 0,
        items: [],

        init() {
            // Create command palette if it doesn't exist
            if (!document.getElementById('cmd-palette')) {
                const backdrop = document.createElement('div');
                backdrop.id = 'cmd-palette';
                backdrop.className = 'cmd-palette-backdrop';
                backdrop.innerHTML = `
                    <div class="cmd-palette">
                        <div class="cmd-palette-input-wrapper">
                            <i data-lucide="search" width="18" height="18"></i>
                            <input type="text" class="cmd-palette-input" placeholder="Search or jump to...">
                            <span class="cmd-kbd">ESC</span>
                        </div>
                        <div class="cmd-palette-results"></div>
                    </div>
                `;
                document.body.appendChild(backdrop);
            }

            this.backdrop = document.getElementById('cmd-palette');
            this.input = this.backdrop.querySelector('.cmd-palette-input');
            this.results = this.backdrop.querySelector('.cmd-palette-results');

            // Event listeners
            this.input.addEventListener('input', () => this.search(this.input.value));
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) this.close();
            });

            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectNext();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectPrev();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSelected();
                }
            });

            // Default items
            this.items = [
                { title: 'Home', description: 'Go to overview', icon: 'layout-grid', action: () => window.location.href = '/dashboard/overview', keywords: 'home dashboard overview' },
                { title: 'Agents', description: 'Manage chat agents', icon: 'bot', action: () => window.location.href = '/admin/widgets', keywords: 'agents widgets bots' },
                { title: 'API Keys', description: 'Manage API keys', icon: 'key', action: () => window.location.href = '/dashboard/api-keys', keywords: 'api keys openai' },
                { title: 'Integrations', description: 'Connect services', icon: 'plug', action: () => window.location.href = '/dashboard/integrations', keywords: 'integrations connect' },
                { title: 'Settings', description: 'Account settings', icon: 'settings', action: () => window.location.href = '/dashboard/settings', keywords: 'settings account profile' },
                { title: 'Toggle Theme', description: 'Switch light/dark mode', icon: 'moon', action: () => { ThemeManager.toggle(); this.close(); }, keywords: 'theme dark light mode' },
            ];
        },

        open() {
            if (!this.backdrop) this.init();

            this.backdrop.classList.add('open');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';

            this.input.value = '';
            this.search('');

            setTimeout(() => this.input.focus(), 100);

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        },

        close() {
            this.backdrop.classList.remove('open');
            this.isOpen = false;
            document.body.style.overflow = '';
            this.selectedIndex = 0;
        },

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        search(query) {
            const q = query.toLowerCase().trim();
            let filtered = this.items;

            if (q) {
                filtered = this.items.filter(item => {
                    const searchText = `${item.title} ${item.description} ${item.keywords || ''}`.toLowerCase();
                    return searchText.includes(q);
                });
            }

            this.renderResults(filtered);
        },

        renderResults(items) {
            if (items.length === 0) {
                this.results.innerHTML = `
                    <div class="cmd-palette-group">
                        <div style="padding: var(--space-4); text-align: center; color: var(--text-muted);">
                            No results found
                        </div>
                    </div>
                `;
                return;
            }

            this.results.innerHTML = `
                <div class="cmd-palette-group">
                    <div class="cmd-palette-group-title">Navigation</div>
                    ${items.map((item, i) => `
                        <div class="cmd-palette-item ${i === this.selectedIndex ? 'active' : ''}" data-index="${i}">
                            <div class="cmd-palette-item-icon">
                                <i data-lucide="${item.icon}" width="16" height="16"></i>
                            </div>
                            <div class="cmd-palette-item-content">
                                <div class="cmd-palette-item-title">${item.title}</div>
                                <div class="cmd-palette-item-description">${item.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Click handlers
            this.results.querySelectorAll('.cmd-palette-item').forEach((el, i) => {
                el.addEventListener('click', () => {
                    this.selectedIndex = i;
                    this.executeSelected();
                });
                el.addEventListener('mouseenter', () => {
                    this.selectedIndex = i;
                    this.updateSelection();
                });
            });

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            this.filteredItems = items;
        },

        selectNext() {
            const items = this.filteredItems || this.items;
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateSelection();
        },

        selectPrev() {
            const items = this.filteredItems || this.items;
            this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
            this.updateSelection();
        },

        updateSelection() {
            this.results.querySelectorAll('.cmd-palette-item').forEach((el, i) => {
                el.classList.toggle('active', i === this.selectedIndex);
            });
        },

        executeSelected() {
            const items = this.filteredItems || this.items;
            const item = items[this.selectedIndex];
            if (item && item.action) {
                item.action();
                this.close();
            }
        }
    };

    // ========================================================================
    // KEYBOARD SHORTCUTS
    // ========================================================================
    document.addEventListener('keydown', (e) => {
        // Command Palette: Cmd/Ctrl + K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            CommandPalette.toggle();
        }

        // Escape to close modals/command palette
        if (e.key === 'Escape') {
            if (CommandPalette.isOpen) {
                CommandPalette.close();
            } else if (Modal.activeModal) {
                Modal.close();
            }
        }
    });

    // ========================================================================
    // DROPDOWN HANDLER
    // ========================================================================
    document.addEventListener('click', (e) => {
        // Close all dropdowns when clicking outside
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });

    // ========================================================================
    // COPY TO CLIPBOARD UTILITY
    // ========================================================================
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Toast.success('Copied to clipboard');
            return true;
        } catch (err) {
            Toast.error('Failed to copy');
            return false;
        }
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        Toast.init();
        CommandPalette.init();

        // Theme toggle button
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => ThemeManager.toggle());
        });

        // Command bar trigger
        document.querySelectorAll('.cmd-trigger').forEach(btn => {
            btn.addEventListener('click', () => CommandPalette.open());
        });

        // Dropdown toggles
        document.querySelectorAll('[data-dropdown-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = btn.closest('.dropdown');
                dropdown.classList.toggle('open');
            });
        });

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // ========================================================================
    // EXPOSE TO GLOBAL SCOPE
    // ========================================================================
    window.Vallit = {
        Theme: ThemeManager,
        Toast,
        Modal,
        CommandPalette,
        copyToClipboard
    };

})();
