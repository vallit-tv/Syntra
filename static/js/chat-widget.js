/**
 * Syntra AI Chat Widget
 * Embeddable chat widget with n8n/ChatGPT integration
 * 
 * Usage:
 * <script src="https://your-domain.com/widget/embed.js" 
 *   data-widget-id="your-widget-id"
 *   data-company-id="your-company-id"
 *   data-theme="glassmorphism"
 *   data-position="bottom-right">
 * </script>
 */

(function () {
    'use strict';

    // Prevent multiple initializations
    if (window.SyntraChatWidget) return;

    // =========================================================================
    // Configuration
    // =========================================================================

    const WIDGET_VERSION = '1.0.0';

    // Smart default: use the origin of this script (embed.js), not the host page
    // This ensures the widget connects to the Syntra backend even when embedded on other domains
    const getScriptOrigin = () => {
        try {
            // Try to get the current script element
            const currentScript = document.currentScript;
            if (currentScript && currentScript.src) {
                return new URL(currentScript.src).origin;
            }

            // Fallback: find script by checking for embed.js in src
            const scripts = document.querySelectorAll('script[src*="embed.js"]');
            if (scripts.length > 0) {
                const scriptSrc = scripts[0].getAttribute('src');
                if (scriptSrc) {
                    return new URL(scriptSrc, window.location.href).origin;
                }
            }
        } catch (e) {
            console.warn('Could not determine script origin, using window.location.origin as fallback');
        }
        // Ultimate fallback
        return window.location.origin;
    };

    const DEFAULT_API_URL = getScriptOrigin();

    // Default configuration
    const defaultConfig = {
        widgetId: 'default',
        companyId: null,  // Multi-tenant company identifier
        theme: 'glassmorphism',
        position: 'bottom-right',
        apiUrl: DEFAULT_API_URL,
        welcomeMessage: "Hi! 👋 I'm your AI assistant. How can I help you today?",
        placeholderText: 'Type your message...',
        primaryColor: '#6366f1',
        headerTitle: 'AI Assistant',
        showBranding: true,
        privacyPolicyUrl: null  // Optional privacy policy link
    };

    // =========================================================================
    // Utilities
    // =========================================================================

    function generateSessionId() {
        return 'syntra_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    function getStoredSessionId() {
        try {
            return localStorage.getItem('syntra_chat_session') || null;
        } catch (e) {
            return null;
        }
    }

    function storeSessionId(sessionId) {
        try {
            localStorage.setItem('syntra_chat_session', sessionId);
        } catch (e) {
            // Storage not available
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(date) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Simple markdown parsing (bold, italics, links, code)
    function parseMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .replace(/\n/g, '<br>');
    }

    // =========================================================================
    // Widget Class
    // =========================================================================

    class SyntraChatWidget {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };
            this.sessionId = getStoredSessionId() || generateSessionId();
            this.isOpen = false;
            this.isLoading = false;
            this.messages = [];

            storeSessionId(this.sessionId);
            this.init();
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.attachEventListeners();
            this.loadHistory();
        }

        // =====================================================================
        // DOM Creation
        // =====================================================================

        injectStyles() {
            // Check if styles already injected
            if (document.getElementById('syntra-widget-styles')) return;

            const link = document.createElement('link');
            link.id = 'syntra-widget-styles';
            link.rel = 'stylesheet';
            link.href = `${this.config.apiUrl}/widget/styles.css`;
            document.head.appendChild(link);
        }

        createWidget() {
            // Container
            this.container = document.createElement('div');
            this.container.id = 'syntra-chat-widget';
            this.container.className = `syntra-widget syntra-theme-${this.config.theme} syntra-position-${this.config.position}`;
            this.container.setAttribute('data-widget-id', this.config.widgetId);

            this.container.innerHTML = `
                <!-- Floating Button -->
                <button class="syntra-toggle-btn" aria-label="Open chat">
                    <svg class="syntra-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <svg class="syntra-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    <span class="syntra-notification-badge" style="display: none;">1</span>
                </button>

                <!-- Chat Window -->
                <div class="syntra-chat-window">
                    <!-- Header -->
                    <div class="syntra-header">
                        <div class="syntra-header-info">
                            <div class="syntra-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                            </div>
                            <div class="syntra-header-text">
                                <h4 class="syntra-title">${escapeHtml(this.config.headerTitle)}</h4>
                                <span class="syntra-status">
                                    <span class="syntra-status-dot"></span>
                                    Online
                                </span>
                            </div>
                        </div>

                        <div class="syntra-header-actions">
                            <button class="syntra-reset-btn" aria-label="New chat" title="Start new chat">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                    <path d="M3 3v5h5"></path>
                                </svg>
                            </button>
                            <button class="syntra-close-btn" aria-label="Close chat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div class="syntra-messages">
                        <div class="syntra-messages-container"></div>
                    </div>

                    <!-- Input Area -->
                    <div class="syntra-input-area">
                        <form class="syntra-input-form">
                            <textarea 
                                class="syntra-input" 
                                placeholder="${escapeHtml(this.config.placeholderText)}"
                                rows="1"
                                maxlength="2000"
                            ></textarea>
                            <button type="submit" class="syntra-send-btn" aria-label="Send message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </form>
                        ${this.config.showBranding || this.config.privacyPolicyUrl ? `
                        <div class="syntra-branding">
                            ${this.config.showBranding ? 'Powered by <a href="https://vallit.net" target="_blank" rel="noopener">Syntra</a>' : ''}
                            ${this.config.showBranding && this.config.privacyPolicyUrl ? ' • ' : ''}
                            ${this.config.privacyPolicyUrl ? '<a href="' + this.config.privacyPolicyUrl + '" target="_blank" rel="noopener">Privacy & Data Protection</a>' : ''}
                        </div>
                        ` : ''}
                    </div>

                    <!-- Overlays: Menu -->
                    <div class="syntra-overlay syntra-overlay-menu">
                        <div class="syntra-overlay-header">
                            <button class="syntra-back-btn" title="Back to Chat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <span>Menu</span>
                        </div>
                        <div class="syntra-menu-list">
                            <div class="syntra-menu-item" data-action="new-chat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                                Start New Chat
                            </div>
                            <!-- Future: View History Item -->
                            <div class="syntra-menu-item" data-action="view-history">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                History (Coming Soon)
                            </div>
                        </div>
                    </div>

                     <!-- Custom Modal Backdrop -->
                    <div class="syntra-modal-backdrop">
                        <div class="syntra-modal">
                            <div class="syntra-modal-title">Confirm</div>
                            <div class="syntra-modal-text">Are you sure?</div>
                            <div class="syntra-modal-actions">
                                <button class="syntra-btn syntra-btn-secondary" data-action="cancel">Cancel</button>
                                <button class="syntra-btn syntra-btn-primary" data-action="confirm">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(this.container);

            // Cache DOM references
            this.toggleBtn = this.container.querySelector('.syntra-toggle-btn');
            this.chatWindow = this.container.querySelector('.syntra-chat-window');
            this.messagesContainer = this.container.querySelector('.syntra-messages-container');
            this.inputForm = this.container.querySelector('.syntra-input-form');
            this.inputField = this.container.querySelector('.syntra-input');
            this.sendBtn = this.container.querySelector('.syntra-send-btn');
            this.closeBtn = this.container.querySelector('.syntra-close-btn');
            this.resetBtn = this.container.querySelector('.syntra-reset-btn');

            // Overlays
            this.menuOverlay = this.container.querySelector('.syntra-overlay-menu');
            this.modalBackdrop = this.container.querySelector('.syntra-modal-backdrop');
            this.modalTitle = this.container.querySelector('.syntra-modal-title');
            this.modalText = this.container.querySelector('.syntra-modal-text');
            this.modalConfirmBtn = this.container.querySelector('[data-action="confirm"]');
            this.modalCancelBtn = this.container.querySelector('[data-action="cancel"]');

            this.currentModalResolve = null;
        }

        // =====================================================================
        // Event Handlers
        // =====================================================================

        attachEventListeners() {
            // Toggle button
            this.toggleBtn.addEventListener('click', () => this.toggle());

            // Close button
            this.closeBtn.addEventListener('click', () => this.close());

            // Reset button (Now opens Menu or directly confirms)
            // Let's use it as a Menu trigger if we have a menu, or direct reset.
            // For now, let's make it direct "New Chat" confirmation to keep it simple as requested "view older chats" implies we might need a menu eventually.
            // But user asked for "option to view older chats". So let's wire the reset button to open the Menu?
            // Actually, the UI has a 'New Chat' icon. Let's keep it as is, but use the custom modal.
            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.confirmNewChat();
                });
            }

            // Menu Items
            const newChatBtn = this.container.querySelector('[data-action="new-chat"]');
            if (newChatBtn) {
                newChatBtn.addEventListener('click', () => {
                    this.closeMenu();
                    this.confirmNewChat();
                });
            }

            const historyBtn = this.container.querySelector('[data-action="view-history"]');
            if (historyBtn) {
                historyBtn.addEventListener('click', () => {
                    // Todo: Implement history view
                    alert('History feature coming soon!');
                });
            }

            // Back buttons
            this.container.querySelectorAll('.syntra-back-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeMenu();
                });
            });

            // Modal Actions
            this.modalConfirmBtn.addEventListener('click', () => {
                if (this.currentModalResolve) this.currentModalResolve(true);
                this.closeModal();
            });

            this.modalCancelBtn.addEventListener('click', () => {
                if (this.currentModalResolve) this.currentModalResolve(false);
                this.closeModal();
            });

            // Form submit
            this.inputForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });

            // Auto-resize textarea
            this.inputField.addEventListener('input', () => this.autoResizeInput());

            // Enter to send (Shift+Enter for new line)
            this.inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (this.isModalOpen) {
                        this.closeModal();
                    } else if (this.isOpen) {
                        this.close();
                    }
                }
            });
        }

        // ... autoResizeInput ...

        // =====================================================================
        // UI Controls (Modals, Overlays)
        // =====================================================================

        showModal(title, text) {
            return new Promise((resolve) => {
                this.modalTitle.textContent = title;
                this.modalText.textContent = text;
                this.modalBackdrop.classList.add('active');
                this.isModalOpen = true;
                this.currentModalResolve = resolve;
            });
        }

        closeModal() {
            this.modalBackdrop.classList.remove('active');
            this.isModalOpen = false;
            this.currentModalResolve = null;
        }

        openMenu() {
            this.menuOverlay.classList.add('active');
        }

        closeMenu() {
            this.menuOverlay.classList.remove('active');
        }

        // =====================================================================
        // Widget State
        // =====================================================================

        // ... toggle, open, close ...

        async confirmNewChat() {
            const confirmed = await this.showModal('Start New Chat?', 'This will clear your current conversation and start fresh.');
            if (confirmed) {
                this.resetChat();
            }
        }

        async resetChat() {
            try {
                this.messagesContainer.innerHTML = '';
                this.messages = [];
                // Add loading indicator? No, just clear.

                // Call API to reset/close old session
                const response = await fetch(`${this.config.apiUrl}/api/chat/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: this.sessionId })
                });

                const data = await response.json();

                if (data.status === 'success' && data.new_session_id) {
                    this.sessionId = data.new_session_id;
                    storeSessionId(this.sessionId);
                } else {
                    // Fallback generator
                    this.sessionId = generateSessionId();
                    storeSessionId(this.sessionId);
                }

                // Re-add welcome message
                if (this.config.welcomeMessage) {
                    this.addMessage('assistant', this.config.welcomeMessage, true);
                }

            } catch (e) {
                console.error('Error resetting chat:', e);
                // Fallback local reset
                this.clearHistory();
                if (this.config.welcomeMessage) {
                    this.addMessage('assistant', this.config.welcomeMessage, true);
                }
            }
        }

        // ... messages ...

        // ... loadHistory ...
        async loadHistory() {
            try {
                if (!this.sessionId) return;
                const response = await fetch(`${this.config.apiUrl}/api/chat/history/${this.sessionId}`);
                const data = await response.json();
                const msgs = data.history || data.messages;

                if (msgs && msgs.length > 0) {
                    msgs.forEach(msg => {
                        const role = msg.role || msg.sender;
                        const content = msg.content || msg.text;
                        const timestamp = msg.timestamp || new Date().toISOString();
                        const msgObj = {
                            id: Date.now() + Math.random(),
                            role: role,
                            content: content,
                            timestamp: timestamp
                        };
                        this.messages.push(msgObj);
                        this.renderMessage(msgObj, false);
                    });
                    this.scrollToBottom();
                }
            } catch (error) {
                console.log('No previous chat history or failed to load');
            }
        }

        // =====================================================================
        // Public API
        // =====================================================================

        setTheme(theme) {
            this.container.classList.remove(`syntra-theme-${this.config.theme}`);
            this.config.theme = theme;
            this.container.classList.add(`syntra-theme-${theme}`);
        }

        clearHistory() {
            this.messages = [];
            this.messagesContainer.innerHTML = '';
            this.sessionId = generateSessionId();
            storeSessionId(this.sessionId);
        }

        destroy() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }
    }

    // =========================================================================
    // Auto-initialization
    // =========================================================================

    function autoInit() {
        // Find script tag with data attributes
        const scripts = document.querySelectorAll('script[src*="embed.js"], script[data-widget-id]');

        scripts.forEach(script => {
            const config = {
                widgetId: script.getAttribute('data-widget-id'),
                companyId: script.getAttribute('data-company-id'),  // Multi-tenant
                theme: script.getAttribute('data-theme'),
                position: script.getAttribute('data-position'),
                apiUrl: script.getAttribute('data-api-url'),
                welcomeMessage: script.getAttribute('data-welcome-message'),
                placeholderText: script.getAttribute('data-placeholder'),
                headerTitle: script.getAttribute('data-title'),
                primaryColor: script.getAttribute('data-color'),
                showBranding: script.getAttribute('data-branding') !== 'false',
                privacyPolicyUrl: script.getAttribute('data-privacy-url')
            };

            // Remove undefined values
            Object.keys(config).forEach(key => {
                if (config[key] === null || config[key] === undefined) {
                    delete config[key];
                }
            });

            // Initialize widget
            window.syntraChat = new SyntraChatWidget(config);
        });
    }

    // Export to window
    window.SyntraChatWidget = SyntraChatWidget;

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

})();
