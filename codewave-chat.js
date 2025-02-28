document.addEventListener("DOMContentLoaded", function() {
    // Chat Widget Script
    (function() {
        // Create and inject styles
        const styles = `
            .chat-widget {
                --chat-primary: var(--chat-widget-primary-color, #fefffe);
                --chat-secondary: var(--chat-widget-secondary-color, #000000);
                --chat-background: var(--chat-widget-background-color, #ffffff);
                --chat-text: var(--chat-widget-font-color, #333333);
                --chat-border: rgba(0, 0, 0, 0.08);
                --chat-shadow: rgba(0, 0, 0, 0.1);
                --chat-radius: 12px;
                --chat-transition: all 0.3s ease;
                font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            
            .chat-widget * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            .chat-widget .chat-container {
                position: fixed;
                bottom: 90px;
                right: 20px;
                z-index: 1000;
                display: none;
                width: 380px;
                height: 600px;
                background: var(--chat-background);
                border-radius: var(--chat-radius);
                box-shadow: 0 10px 40px var(--chat-shadow);
                border: 1px solid var(--chat-border);
                overflow: hidden;
                transition: var(--chat-transition);
                font-family: inherit;
            }
            
            .chat-widget .chat-container.position-left {
                right: auto;
                left: 20px;
            }
            
            .chat-widget .chat-container.open {
                display: flex;
                flex-direction: column;
                animation: slideIn 0.3s forwards;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .chat-widget .brand-header {
                padding: 18px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                border-bottom: 1px solid var(--chat-border);
                background: var(--chat-background);
                position: relative;
            }
            
            .chat-widget .close-button {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--chat-text);
                cursor: pointer;
                padding: 8px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--chat-transition);
                font-size: 20px;
                opacity: 0.6;
                line-height: 1;
                border-radius: 50%;
            }
            
            .chat-widget .close-button:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.04);
            }
            
            .chat-widget .brand-header img {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                object-fit: cover;
            }
            
            .chat-widget .brand-header span {
                font-size: 16px;
                font-weight: 600;
                color: var(--chat-text);
            }
            
            .chat-widget .new-conversation {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 30px;
                text-align: center;
                width: 100%;
                max-width: 320px;
            }
            
            .chat-widget .welcome-text {
                font-size: 24px;
                font-weight: 600;
                color: var(--chat-text);
                margin-bottom: 28px;
                line-height: 1.3;
            }
            
            .chat-widget .new-chat-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                padding: 16px 24px;
                background: var(--chat-secondary);
                color: var(--chat-primary);
                border: none;
                border-radius: var(--chat-radius);
                cursor: pointer;
                font-size: 16px;
                transition: var(--chat-transition);
                font-weight: 500;
                font-family: inherit;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            
            .chat-widget .new-chat-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            }
            
            .chat-widget .message-icon {
                width: 20px;
                height: 20px;
            }
            
            .chat-widget .response-text {
                font-size: 14px;
                color: var(--chat-text);
                opacity: 0.7;
                margin: 0;
            }
            
            .chat-widget .chat-interface {
                display: none;
                flex-direction: column;
                height: 100%;
            }
            
            .chat-widget .chat-interface.active {
                display: flex;
            }
            
            .chat-widget .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
                background: var(--chat-background);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .chat-widget .chat-message {
                padding: 14px 18px;
                border-radius: 18px;
                max-width: 85%;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.5;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                transition: var(--chat-transition);
            }
            
            .chat-widget .chat-message.user {
                background: var(--chat-secondary);
                color: var(--chat-primary);
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }
            
            .chat-widget .chat-message.bot {
                background: #f5f5f7;
                color: var(--chat-text);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }
            
            .chat-widget .chat-input {
                padding: 16px 20px;
                background: var(--chat-background);
                border-top: 1px solid var(--chat-border);
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .chat-widget .chat-input textarea {
                flex: 1;
                padding: 14px 18px;
                border: 1px solid var(--chat-border);
                border-radius: var(--chat-radius);
                background: #f5f5f7;
                color: var(--chat-text);
                resize: none;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.5;
                min-height: 50px;
                max-height: 120px;
                overflow-y: auto;
                transition: var(--chat-transition);
            }
            
            .chat-widget .chat-input textarea::placeholder {
                color: var(--chat-text);
                opacity: 0.5;
            }
            
            .chat-widget .chat-input textarea:focus {
                outline: none;
                border-color: var(--chat-secondary);
                box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
            }
            
            .chat-widget .chat-input button {
                background: var(--chat-secondary);
                color: var(--chat-primary);
                border: none;
                border-radius: var(--chat-radius);
                padding: 0;
                width: 50px;
                height: 50px;
                cursor: pointer;
                transition: var(--chat-transition);
                font-family: inherit;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .chat-widget .chat-input button:hover {
                background: #111;
                transform: translateY(-2px);
            }
            
            .chat-widget .chat-input button svg {
                width: 20px;
                height: 20px;
            }
            
            .chat-widget .chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: var(--chat-secondary);
                color: var(--chat-primary);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 999;
                transition: var(--chat-transition);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chat-widget .chat-toggle.position-left {
                right: auto;
                left: 20px;
            }
            
            .chat-widget .chat-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
            }
            
            .chat-widget .chat-toggle svg {
                width: 24px;
                height: 24px;
                fill: currentColor;
            }
            
            /* Stylized scrollbar */
            .chat-widget .chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .chat-widget .chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .chat-widget .chat-messages::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.15);
                border-radius: 20px;
            }
            
            /* Auto-resize textarea */
            .chat-widget .chat-input textarea {
                overflow-y: hidden;
            }
            
            /* Loading indicator */
            .chat-widget .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 10px 16px;
                background: #f5f5f7;
                border-radius: 18px;
                max-width: 80px;
                align-self: flex-start;
                margin-top: 8px;
            }
            
            .chat-widget .typing-indicator span {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                display: inline-block;
                animation: typing 1.4s infinite ease-in-out both;
            }
            
            .chat-widget .typing-indicator span:nth-child(1) {
                animation-delay: 0s;
            }
            
            .chat-widget .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .chat-widget .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }
        `;
        
        // Load Geist font
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
        document.head.appendChild(fontLink);
        
        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // Default configuration
        const defaultConfig = {
            webhook: { url: '', route: '' },
            branding: {
                logo: '',
                name: '',
                welcomeText: '',
                responseTimeText: ''
            },
            style: {
                primaryColor: '',
                secondaryColor: '',
                position: 'right',
                backgroundColor: '#ffffff',
                fontColor: '#333333'
            }
        };
        
        // Merge user configuration with default values
        const config = window.ChatWidgetConfig ? 
            {
                webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
                branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
                style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
            } : defaultConfig;
        
        // Prevent multiple initializations
        if (window.ChatWidgetInitialized) return;
        window.ChatWidgetInitialized = true;
        
        let currentSessionId = '';
        let isWaitingForResponse = false;
        
        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'chat-widget';
        
        // Set CSS variables for colors
        widgetContainer.style.setProperty('--chat-widget-primary-color', config.style.primaryColor);
        widgetContainer.style.setProperty('--chat-widget-secondary-color', config.style.secondaryColor);
        widgetContainer.style.setProperty('--chat-widget-background-color', config.style.backgroundColor);
        widgetContainer.style.setProperty('--chat-widget-font-color', config.style.fontColor);
        
        const chatContainer = document.createElement('div');
        chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
        
        const newConversationHTML = `
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">&times;</button>
            </div>
            <div class="new-conversation">
                <h2 class="welcome-text">${config.branding.welcomeText}</h2>
                <button class="new-chat-btn">
                    <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Send us a message
                </button>
                <p class="response-text">${config.branding.responseTimeText}</p>
            </div>
        `;
        
        const chatInterfaceHTML = `
            <div class="chat-interface">
                <div class="brand-header">
                    <img src="${config.branding.logo}" alt="${config.branding.name}">
                    <span>${config.branding.name}</span>
                    <button class="close-button">&times;</button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <textarea placeholder="Type your message here..." rows="1"></textarea>
                    <button type="submit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;
        
        const toggleButton = document.createElement('button');
        toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>`;
        
        widgetContainer.appendChild(chatContainer);
        widgetContainer.appendChild(toggleButton);
        document.body.appendChild(widgetContainer);
        
        const newChatBtn = chatContainer.querySelector('.new-chat-btn');
        const chatInterface = chatContainer.querySelector('.chat-interface');
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        const textarea = chatContainer.querySelector('textarea');
        const sendButton = chatContainer.querySelector('button[type="submit"]');
        
        function generateUUID() {
            return crypto.randomUUID ? crypto.randomUUID() : 
                'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0, 
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
        }
        
        function showTypingIndicator() {
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return typingIndicator;
        }
        
        function removeTypingIndicator(indicator) {
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }
        
        // Auto-resize textarea as user types
        function autoResizeTextarea() {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 120);
            textarea.style.height = newHeight + 'px';
        }
        
        textarea.addEventListener('input', autoResizeTextarea);
        
        async function startNewConversation() {
            if (isWaitingForResponse) return;
            isWaitingForResponse = true;
            
            currentSessionId = generateUUID();
            const data = [{
                action: "loadPreviousSession",
                sessionId: currentSessionId,
                route: config.webhook.route,
                metadata: { userId: "" }
            }];
        
            try {
                chatContainer.querySelector('.brand-header').style.display = 'flex';
                chatContainer.querySelector('.new-conversation').style.display = 'none';
                chatInterface.classList.add('active');
                
                const typingIndicator = showTypingIndicator();
                
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
        
                const responseData = await response.json();
                removeTypingIndicator(typingIndicator);
                
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
                messagesContainer.appendChild(botMessageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } catch (error) {
                console.error('Error:', error);
                const errorMessage = document.createElement('div');
                errorMessage.className = 'chat-message bot';
                errorMessage.textContent = 'Sorry, we encountered an error. Please try again later.';
                messagesContainer.appendChild(errorMessage);
            } finally {
                isWaitingForResponse = false;
            }
        }
        
        async function sendMessage(message) {
            if (isWaitingForResponse || !message.trim()) return;
            isWaitingForResponse = true;
            
            const messageData = {
                action: "sendMessage",
                sessionId: currentSessionId,
                route: config.webhook.route,
                chatInput: message,
                metadata: { userId: "" }
            };
        
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'chat-message user';
            userMessageDiv.textContent = message;
            messagesContainer.appendChild(userMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Clear and reset textarea height
            textarea.value = '';
            textarea.style.height = '50px';
            
            const typingIndicator = showTypingIndicator();
        
            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messageData)
                });
                
                removeTypingIndicator(typingIndicator);
                
                const data = await response.json();
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
                messagesContainer.appendChild(botMessageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator(typingIndicator);
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'chat-message bot';
                errorMessage.textContent = 'Sorry, we encountered an error. Please try again later.';
                messagesContainer.appendChild(errorMessage);
            } finally {
                isWaitingForResponse = false;
            }
        }
        
        newChatBtn.addEventListener('click', startNewConversation);
        
        sendButton.addEventListener('click', () => {
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
            }
        });
        
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = textarea.value.trim();
                if (message) {
                    sendMessage(message);
                }
            }
        });
        
        toggleButton.addEventListener('click', () => {
            chatContainer.classList.toggle('open');
            if (chatContainer.classList.contains('open')) {
                textarea.focus();
            }
        });
        
        // Event handlers for close buttons
        const closeButtons = chatContainer.querySelectorAll('.close-button');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                chatContainer.classList.remove('open');
            });
        });
        
        // Initialize textarea height
        textarea.style.height = '50px';
    })();
});
