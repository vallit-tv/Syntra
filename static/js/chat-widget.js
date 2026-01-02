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
        }

        // =====================================================================
        // Event Handlers
        // =====================================================================

        attachEventListeners() {
            // Toggle button
            this.toggleBtn.addEventListener('click', () => this.toggle());

            // Close button
            this.closeBtn.addEventListener('click', () => this.close());

            // Reset button
            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetChat();
                });
            }

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
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
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

        async resetChat() {
            if (!confirm('Start a new chat? This will clear your current conversation.')) {
                return;
            }

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

        // =====================================================================
        // Messages
        // =====================================================================

        addMessage(role, content, animate = true) {
            const message = {
                id: Date.now(),
                role: role,
                content: content,
                timestamp: new Date().toISOString()
            };

            this.messages.push(message);
            this.renderMessage(message, animate);
            this.scrollToBottom();
        }

        renderMessage(message, animate = true) {
            const messageEl = document.createElement('div');
            messageEl.className = `syntra-message syntra-message-${message.role}`;
            if (animate) {
                messageEl.classList.add('syntra-message-enter');
            }

            const parsedContent = message.role === 'assistant'
                ? parseMarkdown(message.content)
                : escapeHtml(message.content).replace(/\n/g, '<br>');

            messageEl.innerHTML = `
                <div class="syntra-message-content">
                    ${parsedContent}
                </div>
                <div class="syntra-message-time">${formatTime(message.timestamp)}</div>
            `;

            this.messagesContainer.appendChild(messageEl);

            // Trigger animation
            if (animate) {
                requestAnimationFrame(() => {
                    messageEl.classList.remove('syntra-message-enter');
                });
            }
        }

        renderTypingIndicator() {
            // Remove existing
            this.removeTypingIndicator();

            const typingEl = document.createElement('div');
            typingEl.className = 'syntra-typing-indicator';
            typingEl.innerHTML = `
                <div class="syntra-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;

            this.messagesContainer.appendChild(typingEl);
            this.scrollToBottom();
        }

        removeTypingIndicator() {
            const existing = this.messagesContainer.querySelector('.syntra-typing-indicator');
            if (existing) {
                existing.remove();
            }
        }

        scrollToBottom() {
            const messagesArea = this.container.querySelector('.syntra-messages');
            if (messagesArea) {
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }
        }

        // =====================================================================
        // API Communication
        // =====================================================================

        async sendMessage() {
            const content = this.inputField.value.trim();
            if (!content || this.isLoading) return;

            // Clear input
            this.inputField.value = '';
            this.autoResizeInput();

            // Add user message
            this.addMessage('user', content);

            // Show loading
            this.isLoading = true;
            this.sendBtn.disabled = true;
            this.renderTypingIndicator();

            try {
                const response = await fetch(`${this.config.apiUrl}/api/chat/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: content,
                        session_id: this.sessionId,
                        widget_id: this.config.widgetId,
                        company_id: this.config.companyId,  // Multi-tenant context
                        context: {
                            page_url: window.location.href,
                            page_title: document.title,
                            referrer: document.referrer
                        }
                    })
                });

                const data = await response.json();

                this.removeTypingIndicator();

                if (data.status === 'success' && data.response) {
                    this.addMessage('assistant', data.response);
                } else if (data.status === 'pending') {
                    // n8n processing - poll for response
                    this.pollForResponse(data.session_id);
                } else if (data.response) {
                    // Error but with fallback message
                    this.addMessage('assistant', data.response);
                } else {
                    this.addMessage('assistant', "I'm sorry, something went wrong. Please try again.");
                }

                // Update session ID if provided
                if (data.session_id) {
                    this.sessionId = data.session_id;
                    storeSessionId(this.sessionId);
                }

            } catch (error) {
                console.error('Syntra Chat Error:', error);
                this.removeTypingIndicator();
                this.addMessage('assistant', "I'm having trouble connecting. Please check your internet connection and try again.");
            } finally {
                this.isLoading = false;
                this.sendBtn.disabled = false;
                this.inputField.focus();
            }
        }

        async pollForResponse(sessionId, attempts = 0) {
            if (attempts >= 30) { // 30 seconds max
                this.removeTypingIndicator();
                this.addMessage('assistant', "The response is taking longer than expected. Please try again.");
                return;
            }

            try {
                const response = await fetch(`${this.config.apiUrl}/api/chat/history/${sessionId}?limit=1`);
                const data = await response.json();

                // Check mapped history or old format?
                // The new endpoint returns {history: [...]}
                const msgs = data.history || data.messages;

                if (msgs && msgs.length > 0) {
                    const lastMessage = msgs[msgs.length - 1];
                    const role = lastMessage.role || lastMessage.sender;
                    const content = lastMessage.content || lastMessage.text;

                    if (role === 'assistant') {
                        this.removeTypingIndicator();
                        this.addMessage('assistant', content);
                        return;
                    }
                }

                // Continue polling
                setTimeout(() => this.pollForResponse(sessionId, attempts + 1), 1000);

            } catch (error) {
                console.error('Polling error:', error);
                // Continue polling despite error
                setTimeout(() => this.pollForResponse(sessionId, attempts + 1), 1000);
            }
        }

        async loadHistory() {
            try {
                // If sessionId is very new (just gen) and no request made, maybe skip?
                // But we want to persist across reload
                if (!this.sessionId) return;

                // Use query param session_id if endpoint supports it, OR path param if using old route
                // backend route: /api/chat/history/<session_key>

                const response = await fetch(`${this.config.apiUrl}/api/chat/history/${this.sessionId}`);
                const data = await response.json();

                // Support both new "history" key and legacy "messages" key
                const msgs = data.history || data.messages;

                if (msgs && msgs.length > 0) {
                    msgs.forEach(msg => {
                        // Map fields if needed: sender->role, text->content
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
                // Silently fail - new session will be created
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
