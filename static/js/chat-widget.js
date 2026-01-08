/**
 * Vallit AI Chat Widget
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
    if (window.VallitChatWidget) return;

    // =========================================================================
    // Configuration
    // =========================================================================

    const WIDGET_VERSION = '1.0.0';

    // Smart default: use the origin of this script (embed.js), not the host page
    // This ensures the widget connects to the Vallit backend even when embedded on other domains
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
        welcomeMessage: "Hi! I'm Kian, your AI Agent. How can I help you today?",
        placeholderText: 'Type your message...',
        primaryColor: '#6366f1',
        headerTitle: 'Kian',
        showBranding: true,
        privacyPolicyUrl: 'https://vallit.net/datenschutz'  // Privacy policy link
    };

    // =========================================================================
    // Utilities
    // =========================================================================

    function generateSessionId() {
        return 'vallit_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    function getStoredSessionId() {
        try {
            return localStorage.getItem('vallit_chat_session') || null;
        } catch (e) {
            return null;
        }
    }

    function storeSessionId(sessionId) {
        try {
            localStorage.setItem('vallit_chat_session', sessionId);
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

    class VallitChatWidget {
        constructor(config = {}) {
            this.config = { ...defaultConfig, ...config };

            // Sanitize API URL
            if (this.config.apiUrl) {
                this.config.apiUrl = this.config.apiUrl.trim().replace(/\/+$/, '');
            }

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
            this.loadRemoteConfig(); // Fetch server-side settings
        }

        async loadRemoteConfig() {
            try {
                // Only fetch if we have an API URL
                if (!this.config.apiUrl) return;

                const response = await fetch(`${this.config.apiUrl}/api/chat/config?widget_id=${this.config.widgetId}`);
                if (!response.ok) return;

                const remoteConfig = await response.json();

                // Merge config, preferring remote for editable fields
                // Update Welcome Message
                if (remoteConfig.welcome_message) {
                    this.config.welcomeMessage = remoteConfig.welcome_message;
                    // If we haven't started chatting yet (messages empty or just 1 welcome msg), update it
                    if (this.messages.length <= 1) {
                        // Check if we already have a welcome message
                        const hasWelcome = this.messages.some(m => m.role === 'assistant');
                        if (!hasWelcome || this.messages.length === 0) {
                            // Just set it for next usage
                        } else if (this.messages.length === 1 && this.messages[0].role === 'assistant') {
                            // Replace the existing welcome message
                            this.messages[0].content = this.config.welcomeMessage;
                            // Re-render if open
                            if (this.isOpen) {
                                this.messagesContainer.innerHTML = '';
                                this.renderMessage(this.messages[0], false);
                            }
                        }
                    }
                }

                // Update Header Title & Avatar
                if (remoteConfig.name) {
                    this.config.headerTitle = remoteConfig.name;
                    // Update DOM elements
                    const titleEl = this.container.querySelector('.syntra-header-title');
                    if (titleEl) titleEl.textContent = this.config.headerTitle;

                    const avatarEl = this.container.querySelector('.syntra-avatar');
                    if (avatarEl) avatarEl.textContent = this.config.headerTitle.charAt(0);
                }

                // Update other settings if provided (e.g. theme, title)
                /*
                if (remoteConfig.theme && remoteConfig.theme !== this.config.theme) {
                    this.container.classList.replace(`syntra-theme-${this.config.theme}`, `syntra-theme-${remoteConfig.theme}`);
                    this.config.theme = remoteConfig.theme;
                }
                */

                // Store standard session ID if backend rotates it? No, keep local logic.

            } catch (e) {
                console.warn('Failed to load remote config:', e);
            }
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

        // ... (previous code)

        createWidget() {
            // Create container
            this.container = document.createElement('div');
            this.container.className = `syntra-widget syntra-theme-${this.config.theme} syntra-position-${this.config.position}`;

            // Generate HTML
            this.container.innerHTML = `
                <!-- Toggle Button -->
                <button class="syntra-toggle-btn">
                    <div class="syntra-icon-chat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div class="syntra-icon-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </button>

                <!-- Chat Window -->
                <div class="syntra-chat-window">
                    <!-- Header -->
                    <div class="syntra-header">
                        <div class="syntra-header-info">
                            <div class="syntra-avatar">
                                ${this.config.headerTitle.charAt(0)}
                            </div>
                            <div class="syntra-header-text">
                                <div class="syntra-header-title">${this.config.headerTitle}</div>
                                <div class="syntra-header-status">
                                    <span class="syntra-status-dot"></span> Online
                                </div>
                            </div>
                        </div>
                        <div class="syntra-header-actions">
                            <button class="syntra-reset-btn" title="New Chat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                            </button>
                            <button class="syntra-close-btn" title="Close">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div class="syntra-messages-container"></div>

                    <!-- Input Area -->
                    <div class="syntra-input-area">
                        <form class="syntra-input-form">
                            <textarea class="syntra-input" placeholder="${this.config.placeholderText}" rows="1"></textarea>
                            <button type="submit" class="syntra-send-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </form>
                        <div class="syntra-footer">
                            <div class="syntra-privacy-text" style="font-size: 10px; color: #999; text-align: center; margin-bottom: 4px;">
                                By using this assistant, you agree to our <a href="${this.config.privacyPolicyUrl}" target="_blank">Privacy Policy</a>
                            </div>
                            ${this.config.showBranding ? `
                            <div class="vallit-branding" style="font-size: 10px; color: #999; text-align: center; opacity: 0.7;">
                                Powered by <a href="https://vallit.net" target="_blank" rel="noopener" style="text-decoration: none; font-weight: 500; color: #999;">Vallit</a>
                            </div>
                            ` : ''}
                        </div>
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
                            <div class="syntra-menu-item" data-action="view-history">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                History
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

            // ... (rest of function)

            this.toggleBtn = this.container.querySelector('.syntra-toggle-btn');
            this.chatWindow = this.container.querySelector('.syntra-chat-window');
            this.messagesContainer = this.container.querySelector('.syntra-messages-container');
            this.inputForm = this.container.querySelector('.syntra-input-form');
            this.inputField = this.container.querySelector('.syntra-input');
            this.sendBtn = this.container.querySelector('.syntra-send-btn');
            this.closeBtn = this.container.querySelector('.syntra-close-btn');
            this.resetBtn = this.container.querySelector('.syntra-reset-btn');

            this.menuOverlay = this.container.querySelector('.syntra-overlay-menu');
            this.modalBackdrop = this.container.querySelector('.syntra-modal-backdrop');
            this.modalTitle = this.container.querySelector('.syntra-modal-title');
            this.modalText = this.container.querySelector('.syntra-modal-text');
            this.modalConfirmBtn = this.container.querySelector('[data-action="confirm"]');
            this.modalCancelBtn = this.container.querySelector('[data-action="cancel"]');

            // History elements
            this.historyView = this.container.querySelector('.syntra-history-view');
            this.historyList = this.container.querySelector('.syntra-history-list');
            this.closeHistoryBtn = this.container.querySelector('.syntra-close-history-btn');

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
                    this.closeMenu();
                    this.toggleHistory(true);
                });
            }

            if (this.closeHistoryBtn) {
                this.closeHistoryBtn.addEventListener('click', () => {
                    this.toggleHistory(false);
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

        autoResizeInput() {
            const input = this.inputField;
            input.style.height = 'auto';
            const newHeight = Math.min(input.scrollHeight, 120);
            input.style.height = newHeight + 'px';
        }

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

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            this.isOpen = true;
            this.container.classList.add('syntra-open');
            this.toggleBtn.classList.add('syntra-toggled');

            // Show welcome message if no messages
            if (this.messages.length === 0 && this.config.welcomeMessage) {
                this.addMessage('assistant', this.config.welcomeMessage, false);
            }

            // Focus input
            setTimeout(() => {
                this.inputField.focus();
            }, 300);

            // Scroll to bottom
            this.scrollToBottom();
        }

        close() {
            this.isOpen = false;
            this.container.classList.remove('syntra-open');
            this.toggleBtn.classList.remove('syntra-toggled');
        }

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

                // Save current session to history before reset
                this.saveHistory();

                // Call API to reset/close old sessoion
                const response = await fetch(`${this.config.apiUrl}/api/chat/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: this.sessionId })
                });

                const data = await response.json();

                // Clear current messages
                this.messagesContainer.innerHTML = '';
                this.messages = [];

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

                // Save first
                this.saveHistory();

                this.clearHistory(); // This clears current session not storage
                if (this.config.welcomeMessage) {
                    this.addMessage('assistant', this.config.welcomeMessage, true);
                }
            }
        }

        // ... messages ...

        async sendMessage() {
            const message = this.inputField.value.trim();
            if (!message || this.isLoading) return;

            // Clear input
            this.inputField.value = '';
            this.inputField.style.height = 'auto';

            // Add user message
            this.addMessage('user', message);
            this.isLoading = true;
            this.showTypingIndicator();

            try {
                const response = await fetch(`${this.config.apiUrl}/api/chat/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        widget_id: this.config.widgetId,
                        session_id: this.sessionId,
                        message: message,
                        company_id: this.config.companyId
                    })
                });

                const data = await response.json();

                if (data.status === 'success') {
                    this.removeTypingIndicator();
                    this.addMessage('assistant', data.response);
                    this.isLoading = false;
                } else if (data.status === 'pending') {
                    // n8n processing
                    this.pollForResponse();
                } else {
                    throw new Error(data.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Send error:', error);
                this.removeTypingIndicator();
                this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.', false);
                this.isLoading = false;
            }
        }

        async pollForResponse() {
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds

            const poll = async () => {
                if (attempts >= maxAttempts) {
                    this.removeTypingIndicator();
                    this.addMessage('assistant', 'Sorry, the server is taking a while to respond.', false);
                    this.isLoading = false;
                    return;
                }

                try {
                    const response = await fetch(`${this.config.apiUrl} /api/chat / history / ${this.sessionId} `);
                    const data = await response.json();
                    const history = data.history || data.messages || [];

                    // Check if we have a NEW message from assistant
                    const lastMsg = history[history.length - 1];
                    if (lastMsg && (lastMsg.sender === 'assistant' || lastMsg.role === 'assistant')) {
                        this.removeTypingIndicator();
                        this.addMessage('assistant', lastMsg.text || lastMsg.content);
                        this.isLoading = false;
                        return;
                    }

                    attempts++;
                    setTimeout(poll, 1000);

                } catch (e) {
                    console.error('Poll error', e);
                    attempts++;
                    setTimeout(poll, 1000);
                }
            };

            poll();
        }

        addMessage(role, content, animate = true) {
            const message = {
                id: Date.now(),
                role: role,
                content: content,
                timestamp: new Date().toISOString()
            };

            this.messages.push(message);
            this.renderMessage(message, animate);

            // Auto-save history on message
            this.saveHistory();
        }

        renderMessage(message, animate = true) {
            const messageEl = document.createElement('div');
            messageEl.className = `syntra-message syntra-message-${message.role} ${animate ? '' : 'no-animate'}`;

            // Format time
            const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Parse markdown for assistant
            const contentHtml = message.role === 'assistant' ? parseMarkdown(message.content) : escapeHtml(message.content);

            messageEl.innerHTML = `
                <div class="syntra-message-content">
                    ${contentHtml}
                </div>
                <div class="syntra-message-time">${time}</div>
            `;

            this.messagesContainer.appendChild(messageEl);
            this.scrollToBottom();
        }

        showTypingIndicator() {
            if (this.typingIndicator) return; // Already showing
            const indicator = document.createElement('div');
            indicator.className = 'syntra-typing-indicator';
            indicator.innerHTML = `
                <div class="syntra-typing-dots">
                    <span></span><span></span><span></span>
                </div>
                `;
            this.messagesContainer.appendChild(indicator);
            this.scrollToBottom();
            this.typingIndicator = indicator;
        }

        removeTypingIndicator() {
            if (this.typingIndicator && this.typingIndicator.parentNode) {
                this.typingIndicator.parentNode.removeChild(this.typingIndicator);
                this.typingIndicator = null;
            }
        }

        scrollToBottom() {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        // ... loadHistory ...
        async loadHistory() {
            try {
                if (!this.sessionId) return;
                const response = await fetch(`${this.config.apiUrl} /api/chat / history / ${this.sessionId} `);
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
        // History Management
        // =====================================================================

        saveHistory() {
            if (this.messages.length === 0) return;

            const history = this.getHistory();
            const existingIndex = history.findIndex(h => h.id === this.sessionId);

            // Get last message preview
            const lastMsg = this.messages[this.messages.length - 1];
            let preview = 'No messages';
            if (lastMsg) {
                preview = lastMsg.content.substring(0, 60) + (lastMsg.content.length > 60 ? '...' : '');
            }

            const sessionData = {
                id: this.sessionId,
                timestamp: new Date().toISOString(),
                preview: preview,
                messages: this.messages,
                widgetId: this.config.widgetId
            };

            if (existingIndex >= 0) {
                history[existingIndex] = sessionData;
            } else {
                history.unshift(sessionData); // Add to top
            }

            // Limit history size (e.g., 20 sessions)
            if (history.length > 20) {
                history.pop();
            }

            try {
                localStorage.setItem('vallit_chat_history', JSON.stringify(history));
            } catch (e) {
                console.warn('Failed to save history to localStorage', e);
            }
        }

        getHistory() {
            try {
                const stored = localStorage.getItem('vallit_chat_history');
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                return [];
            }
        }

        renderHistory() {
            const history = this.getHistory();
            this.historyList.innerHTML = '';

            if (history.length === 0) {
                this.container.querySelector('.syntra-empty-history').style.display = 'block';
                return;
            }

            this.container.querySelector('.syntra-empty-history').style.display = 'none';

            history.forEach(session => {
                const item = document.createElement('div');
                item.className = 'syntra-history-item';

                // Check if active
                if (session.id === this.sessionId) {
                    item.style.borderColor = 'var(--syntra-primary)';
                    item.style.background = 'var(--syntra-bg)';
                }

                const date = new Date(session.timestamp).toLocaleDateString() + ' ' +
                    new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                item.innerHTML = `
                < div class="syntra-history-meta" >
                    <span>${date}</span>
                    </div >
                <div class="syntra-history-preview">
                    ${escapeHtml(session.preview)}
                </div>
            `;

                item.addEventListener('click', () => {
                    this.loadSession(session);
                });

                this.historyList.appendChild(item);
            });
        }

        loadSession(session) {
            // Save current before switching if it's different and has messages
            if (this.sessionId !== session.id && this.messages.length > 0) {
                this.saveHistory();
            }

            this.sessionId = session.id;
            storeSessionId(this.sessionId);

            // Clear current view
            this.messagesContainer.innerHTML = '';
            this.messages = []; // Will refill from session.messages

            // Restore messages
            if (session.messages && session.messages.length > 0) {
                session.messages.forEach(msg => {
                    this.messages.push(msg);
                    this.renderMessage(msg, false);
                });
                this.scrollToBottom();
            }

            // Go back to chat view
            this.toggleHistory(false);
        }

        toggleHistory(show) {
            if (show) {
                this.renderHistory();
                this.historyView.style.display = 'flex';
                this.historyView.style.flexDirection = 'column'; // Ensure flex
                this.historyView.style.height = '100%';

                // Hide other areas
                this.messagesContainer.parentElement.style.display = 'none';
                this.inputForm.parentElement.style.display = 'none';
            } else {
                this.historyView.style.display = 'none';

                // Show chat areas
                this.messagesContainer.parentElement.style.display = 'block';
                this.inputForm.parentElement.style.display = 'block';
                this.scrollToBottom();
            }
        }

        // =====================================================================
        // Public API
        // =====================================================================

        /**
         * Set the language for the chat
         * @param {string} lang - Language code (e.g., 'en', 'de', 'es')
         */
        setLanguage(lang) {
            this.config.language = lang;
            console.log(`Language set to: ${lang} `);
            // Logic to update UI strings would go here
            // implementing a simple mapping for common UI elements could be next
        }

        /**
         * Toggle Database Transparency View
         */
        toggleDbView() {
            const modalId = 'syntra-db-view-modal';
            let modal = document.getElementById(modalId);

            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                Object.assign(modal.style, {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    zIndex: '20',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                });

                modal.innerHTML = `
                < div style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" >
                        <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Data Transparency</h3>
                        <button id="${modalId}-close" style="background: none; border: none; cursor: pointer; padding: 4px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div >
                    
                    <div style="flex: 1; overflow-y: auto;">
                        <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                            <h4 style="font-size: 13px; font-weight: 600; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Session Metadata</h4>
                            <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 14px;">
                                <span style="color: #666;">Session ID:</span>
                                <span style="font-family: monospace;">${this.sessionId}</span>
                                
                                <span style="color: #666;">Created:</span>
                                <span>${new Date().toLocaleDateString()}</span>
                                
                                <span style="color: #666;">Language:</span>
                                <span>${this.config.language || 'en'}</span>
                            </div>
                        </div>

                        <div style="background: #f4f4f5; padding: 16px; border-radius: 12px;">
                            <h4 style="font-size: 13px; font-weight: 600; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Storage & Privacy</h4>
                             <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 14px;">
                                <span style="color: #666;">Storage:</span>
                                <span>Encrypted Postgres (EU West)</span>
                                
                                <span style="color: #666;">Retention:</span>
                                <span>30 Days Rolling</span>
                                
                                <span style="color: #666;">Model:</span>
                                <span>GPT-4o (OpenAI)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #888;">
                        Data processing adheres to GDPR standards.
                    </div>
            `;

                this.elements.chatWindow.appendChild(modal);

                document.getElementById(`${modalId} -close`).onclick = () => {
                    modal.remove();
                };
            } else {
                modal.remove();
            }
        }

        setTheme(theme) {
            this.container.classList.remove(`syntra - theme - ${this.config.theme} `);
            this.config.theme = theme;
            this.container.classList.add(`syntra - theme - ${theme} `);
        }

        clearHistory() {
            this.messages = [];
            this.messagesContainer.innerHTML = '';
            this.sessionId = generateSessionId();
            storeSessionId(this.sessionId);
        }

        /**
         * Set the language for the chat
         * @param {string} lang - Language code (e.g., 'en', 'de', 'es')
         */
        setLanguage(lang) {
            this.config.language = lang;
            console.log(`Language set to: ${lang} `);
            const privacyText = this.container.querySelector('.syntra-privacy-text');
            if (privacyText) {
                // Example translation logic
                if (lang === 'de') {
                    privacyText.innerHTML = 'Durch die Nutzung dieses Assistenten stimmen Sie der Verarbeitung Ihrer Daten gemäß unserer <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> zu.';
                } else if (lang === 'es') {
                    privacyText.innerHTML = 'Al usar este asistente, acepta que sus datos sean procesados según nuestra <a href="/privacy" target="_blank">Política de Privacidad</a>.';
                } else {
                    privacyText.innerHTML = 'By using this virtual assistant, you agree to your data being processed by third parties as described in our <a href="/privacy" target="_blank">Privacy Policy</a>.';
                }
            }
        }

        /**
         * Toggle Database Transparency View
         */
        toggleDbView() {
            const modalId = 'syntra-db-view-modal';
            let modal = document.getElementById(modalId);

            if (!modal) {
                // Create modal container
                modal = document.createElement('div');
                modal.id = modalId;
                Object.assign(modal.style, {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    zIndex: '20',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                });

                // Content
                modal.innerHTML = `
                < div style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" >
                        <h3 style="font-size: 18px; font-weight: 600; margin: 0; color: #000;">Data Transparency</h3>
                        <button id="${modalId}-close" type="button" style="background: none; border: none; cursor: pointer; padding: 4px; color: #000;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div >
                    
                    <div style="flex: 1; overflow-y: auto;">
                        <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                            <h4 style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Session Metadata</h4>
                            <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
                                <span style="color: #666;">Session ID:</span>
                                <span style="font-family: monospace; color: #000;">${this.sessionId.substring(0, 12)}...</span>
                                
                                <span style="color: #666;">Date:</span>
                                <span style="color: #000;">${new Date().toLocaleDateString()}</span>
                                
                                <span style="color: #666;">Language:</span>
                                <span style="color: #000;">${this.config.language || 'en'}</span>
                            </div>
                        </div>

                        <div style="background: #f4f4f5; padding: 16px; border-radius: 12px;">
                            <h4 style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Storage & Privacy</h4>
                             <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
                                <span style="color: #666;">Storage:</span>
                                <span style="color: #000;">Encrypted Postgres</span>
                                
                                <span style="color: #666;">Region:</span>
                                <span style="color: #000;">EU West (Frankfurt)</span>
                                
                                <span style="color: #666;">Model:</span>
                                <span style="color: #000;">GPT-4o</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #999;">
                        We prioritize your data privacy.
                        <br>Processed in accordance with GDPR.
                    </div>
            `;

                this.elements.chatWindow.appendChild(modal);

                const closeBtn = document.getElementById(`${modalId} -close`);
                if (closeBtn) {
                    closeBtn.onclick = (e) => {
                        e.stopPropagation(); // prevent closing chat window if event bubbles
                        modal.remove();
                    };
                }
            } else {
                modal.remove();
            }
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
                companyId: script.getAttribute('data-company-id'),
                theme: script.getAttribute('data-theme'),
                position: script.getAttribute('data-position'),
                apiUrl: script.getAttribute('data-api-url') ? script.getAttribute('data-api-url').trim() : null,
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
            window.vallitChat = new VallitChatWidget(config);
            // Backward compatibility
            window.syntraChat = window.vallitChat;
        });
    }

    // Export to window
    window.VallitChatWidget = VallitChatWidget;
    // Backward compatibility alias
    window.SyntraChatWidget = VallitChatWidget;

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

})();
