document.addEventListener("DOMContentLoaded", function() {
    // Chat Widget Script
    (function() {
        // Cria e injeta os estilos
        const styles = `
            .chat-widget {
                --chat--color-primary: var(--chat-widget-primary-color, #854fff);
                --chat--color-secondary: var(--chat-widget-secondary-color, #6b3fd4);
                --chat--color-background: var(--chat-widget-background-color, #ffffff);
                --chat--color-font: var(--chat-widget-font-color, #333333);
                font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            .chat-widget .chat-container {
                position: fixed;
                bottom: 200px;
                right: 20px;
                z-index: 1000;
                display: none;
                width: 380px;
                height: 600px;
                background: var(--chat--color-background);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(0, 0, 0, 0.1);
                overflow: hidden;
                font-family: inherit;
            }
            .chat-widget .chat-container.position-left {
                right: auto;
                left: 20px;
            }
            .chat-widget .chat-container.open {
                display: flex;
                flex-direction: column;
            }
            .chat-widget .brand-header {
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                position: relative;
            }
            .chat-widget .close-button {
                position: absolute;
                right: 16px;
                top: 16px;
                background: none;
                border: none;
                color: var(--chat--color-font);
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.2s;
                font-size: 24px;
                opacity: 0.5;
                line-height: 1;
            }
            .chat-widget .close-button:hover {
                opacity: 1;
            }
            .chat-widget .brand-header img {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                object-fit: cover;
            }
            .chat-widget .brand-header span {
                font-size: 16px;
                font-weight: 600;
                color: var(--chat--color-font);
            }
            .chat-widget .new-conversation {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 20px;
                text-align: center;
                width: 100%;
                max-width: 300px;
            }
            .chat-widget .welcome-text {
                font-size: 24px;
                font-weight: 600;
                color: var(--chat--color-font);
                margin-bottom: 24px;
                line-height: 1.3;
            }
            .chat-widget .new-chat-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 14px 24px;
                background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: transform 0.3s, box-shadow 0.3s;
                font-weight: 500;
                font-family: inherit;
                margin-bottom: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .chat-widget .new-chat-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
            }
            .chat-widget .message-icon {
                width: 20px;
                height: 20px;
            }
            .chat-widget .response-text {
                font-size: 14px;
                color: var(--chat--color-font);
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
                padding: 20px;
                background: var(--chat--color-background);
                display: flex;
                flex-direction: column;
            }
            .chat-widget .chat-message {
                padding: 12px 16px;
                margin: 8px 0;
                border-radius: 12px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.5;
            }
            .chat-widget .chat-message.user {
                background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
                color: white;
                align-self: flex-end;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border: none;
            }
            .chat-widget .chat-message.bot {
                background: var(--chat--color-background);
                border: 1px solid rgba(0, 0, 0, 0.1);
                color: var(--chat--color-font);
                align-self: flex-start;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .chat-widget .chat-input {
                padding: 16px;
                background: var(--chat--color-background);
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                display: flex;
                gap: 8px;
            }
            .chat-widget .chat-input textarea {
                flex: 1;
                padding: 12px;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                background: var(--chat--color-background);
                color: var(--chat--color-font);
                resize: none;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.5;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            }
            .chat-widget .chat-input textarea::placeholder {
                color: var(--chat--color-font);
                opacity: 0.6;
            }
            .chat-widget .chat-input textarea:focus {
                outline: none;
                border-color: var(--chat--color-primary);
                box-shadow: 0 0 0 2px rgba(133, 79, 255, 0.2);
            }
            .chat-widget .chat-input button {
                background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0 20px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                font-family: inherit;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .chat-widget .chat-input button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
            }
            .chat-widget .chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                z-index: 999;
                transition: transform 0.3s, box-shadow 0.3s;
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
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
            }
            .chat-widget .chat-toggle svg {
                width: 24px;
                height: 24px;
                fill: currentColor;
            }
            
            /* Estilização para scrollbar */
            .chat-widget .chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            .chat-widget .chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            .chat-widget .chat-messages::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 20px;
            }
        `;
        
        // Carrega a fonte Geist
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
        document.head.appendChild(fontLink);
        
        // Injeta os estilos
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // Configuração padrão (sem poweredBy)
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
        
        // Mescla a configuração do usuário com os valores padrão
        const config = window.ChatWidgetConfig ? 
            {
                webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
                branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
                style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
            } : defaultConfig;
        
        // Evita inicializações múltiplas
        if (window.ChatWidgetInitialized) return;
        window.ChatWidgetInitialized = true;
        
        let currentSessionId = '';
        
        // Cria o container do widget
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'chat-widget';
        
        // Define as variáveis CSS para cores
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
                    <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
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
                    <button type="submit">Send</button>
                </div>
            </div>
        `;
        
        chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;
        
        const toggleButton = document.createElement('button');
        toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
        toggleButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
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
            return crypto.randomUUID();
        }
        
        async function startNewConversation() {
            currentSessionId = generateUUID();
            const data = [{
                action: "loadPreviousSession",
                sessionId: currentSessionId,
                route: config.webhook.route,
                metadata: { userId: "" }
            }];
        
            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
        
                const responseData = await response.json();
                chatContainer.querySelector('.brand-header').style.display = 'flex';
                chatContainer.querySelector('.new-conversation').style.display = 'none';
                chatInterface.classList.add('active');
        
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
                messagesContainer.appendChild(botMessageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function sendMessage(message) {
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
        
            try {
                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messageData)
                });
                
                const data = await response.json();
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
                messagesContainer.appendChild(botMessageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        newChatBtn.addEventListener('click', startNewConversation);
        
        sendButton.addEventListener('click', () => {
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        });
        
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = textarea.value.trim();
                if (message) {
                    sendMessage(message);
                    textarea.value = '';
                }
            }
        });
        
        toggleButton.addEventListener('click', () => {
            chatContainer.classList.toggle('open');
        });
        
        // Manipuladores para os botões de fechar
        const closeButtons = chatContainer.querySelectorAll('.close-button');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                chatContainer.classList.remove('open');
            });
        });
    })();
});
