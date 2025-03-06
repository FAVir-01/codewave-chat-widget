// Chat Widget Script
(function() {
    // Create and inject styles
    const styles = `
        .chat-widget {
            --chat--color-primary: var(--chat-primary-color, #854fff);
            --chat--color-secondary: var(--chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--chat-background-color, #ffffff);
            --chat--color-font: var(--chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        /* (restante dos estilos idênticos ao seu código original) */
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

    // Default configuration, incluindo a nova chave "baserow"
    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: '',
            poweredBy: {
                text: 'Powered by ChatWidget',
                link: '#'
            }
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        },
        baserow: null
    };

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
            baserow: window.ChatWidgetConfig.baserow || null
        } : defaultConfig;

    // Prevent multiple initializations
    if (window.ChatWidgetInitialized) return;
    window.ChatWidgetInitialized = true;

    let currentSessionId = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'chat-widget';
    
    // Set CSS variables for colors
    widgetContainer.style.setProperty('--chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--chat-font-color', config.style.fontColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
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
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
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
        return crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    // NOVO: Função para registrar eventos no Baserow via HTTP POST
    async function logChatEvent(action, chatInput) {
       if (!config.baserow) return;
       const url = config.baserow.apiUrl;
       const token = config.baserow.token;
       const data = {
          sessionId: currentSessionId,
          action: action,
          chatImput: chatInput
       };
       try {
          const response = await fetch(url, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
             },
             body: JSON.stringify(data)
          });
          return await response.json();
       } catch(e) {
          console.error('Error logging chat event:', e);
       }
    }

    async function startNewConversation() {
        try {
            currentSessionId = generateUUID();
            
            // Esconde a interface inicial
            const welcomeHeader = chatContainer.querySelector('.brand-header');
            const welcomeConversation = chatContainer.querySelector('.new-conversation');
            
            if (welcomeHeader) welcomeHeader.style.display = 'none';
            if (welcomeConversation) welcomeConversation.style.display = 'none';
            
            chatInterface.classList.add('active');
            
            // Registra o início da conversa na tabela do Baserow (se configurado)
            if (config.baserow) {
                await logChatEvent('startConversation', '');
            }
            
            // Se um webhook estiver configurado, envia a solicitação
            if (config.webhook && config.webhook.url) {
                const data = [{
                    action: "loadPreviousSession",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    metadata: { userId: "" }
                }];

                const response = await fetch(config.webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const responseData = await response.json();

                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = Array.isArray(responseData) ? responseData[0].output : responseData.output;
                messagesContainer.appendChild(botMessageDiv);
            } else {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = "Olá! Como posso ajudar você hoje?";
                messagesContainer.appendChild(botMessageDiv);
            }
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error starting conversation:', error);
            chatInterface.classList.add('active');
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'chat-message bot';
            errorMessageDiv.textContent = "Desculpe, tivemos um problema ao iniciar a conversa. Por favor, tente novamente mais tarde.";
            messagesContainer.appendChild(errorMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async function sendMessage(message) {
        if (!currentSessionId) {
            currentSessionId = generateUUID();
        }

        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-message user';
        userMessageDiv.textContent = message;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Registra o envio da mensagem na tabela do Baserow (se configurado)
        if (config.baserow) {
            await logChatEvent('sendMessage', message);
        }

        try {
            if (config.webhook && config.webhook.url) {
                const messageData = {
                    action: "sendMessage",
                    sessionId: currentSessionId,
                    route: config.webhook.route,
                    chatInput: message,
                    metadata: { userId: "" }
                };
                
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
            } else {
                setTimeout(() => {
                    const botMessageDiv = document.createElement('div');
                    botMessageDiv.className = 'chat-message bot';
                    botMessageDiv.textContent = "Recebemos sua mensagem! Um agente entrará em contato em breve.";
                    messagesContainer.appendChild(botMessageDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 500);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'chat-message bot';
            errorMessageDiv.textContent = "Desculpe, tivemos um problema ao enviar sua mensagem. Por favor, tente novamente.";
            messagesContainer.appendChild(errorMessageDiv);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Abrir chat quando o botão de toggle for clicado
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    // Iniciar nova conversa quando o botão "Send us a message" for clicado
    newChatBtn.addEventListener('click', startNewConversation);
    
    // Enviar mensagem quando o botão de envio for clicado
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });
    
    // Enviar mensagem quando Enter for pressionado (sem Shift)
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

    // Fechar chat quando o botão de fechar for clicado
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });
})();
