<!-- Exemplo de uso em um arquivo HTML -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Chat Widget Example</title>
</head>
<body>
  <!-- Container principal do widget é criado dinamicamente via JavaScript -->

  <!-- Exemplo de configuração global do widget -->
  <script>
    window.ChatWidgetConfig = {
      webhook: {
        url: '',        // URL do seu back-end (ex.: https://api.meusite.com/chat)
        route: ''       // Rota ou identificador adicional, se necessário
      },
      branding: {
        logo: 'https://via.placeholder.com/64',  // URL do logo
        name: 'Rebecca',                         // Nome do contato ou do "bot"
        welcomeText: 'Olá, seja bem-vindo(a)!',  // Texto de boas-vindas
        responseTimeText: 'Responderemos em breve.',
        poweredBy: {
          text: 'Powered by CodeWave.ia',
          link: 'https://www.instagram.com/codewave.ia'
        }
      },
      style: {
        primaryColor: '#854fff',
        secondaryColor: '#6b3fd4',
        backgroundColor: '#ffffff',
        fontColor: '#333333',
        position: 'right' // ou 'left' se quiser o widget no lado esquerdo
      }
    };
  </script>

  <!-- Script principal do Chat Widget -->
  <script>
  (function() {
      // --- ESTILOS PRINCIPAIS DO CHAT ---
      const styles = `
        .chat-widget {
            --chat--color-primary: var(--chat-primary-color, #854fff);
            --chat--color-secondary: var(--chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--chat-background-color, #ffffff);
            --chat--color-font: var(--chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        /* Container fixo do chat */
        .chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }

        /* Permite colocar o chat no lado esquerdo, se configurado */
        .chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }

        .chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }

        /* Cabeçalho com logo, nome e botão de fechar */
        .chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
            min-height: 80px;
        }

        /* Botão de fechar no canto superior direito */
        .chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 16px;
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 24px;
            opacity: 0.6;
            z-index: 10;
            width: 32px;
            height: 32px;
            border-radius: 50%;
        }

        .chat-widget .close-button:hover {
            opacity: 1;
            background-color: rgba(133, 79, 255, 0.1);
        }

        .chat-widget .brand-header img {
            width: 64px;
            height: 64px;
        }

        .chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Tela inicial (antes de iniciar conversa) */
        .chat-widget .new-conversation {
            position: relative;
            padding: 20px;
            text-align: center;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
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
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }

        .chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
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

        /* Interface de chat após clicar em "Send us a message" */
        .chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
            width: 100%;
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

        /* Bolhas de mensagem */
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
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }

        .chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Área de input do chat */
        .chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }

        .chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }

        .chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }

        .chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }

        /* Botão flutuante que abre/fecha o chat */
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
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
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
        }

        .chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        /* Rodapé do chat (Powered by...) */
        .chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }

        .chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .chat-widget .chat-footer a:hover {
            opacity: 1;
        }

        /* Responsividade simples para telas muito pequenas */
        @media (max-width: 480px) {
          .chat-widget .chat-container {
              width: 100%;
              height: 100%;
              bottom: 0;
              right: 0;
              left: 0;
              border-radius: 0;
          }
          .chat-widget .chat-toggle {
              bottom: 80px; /* para não ficar por cima do chat aberto */
          }
        }
      `;

      // --- CARREGAR FONTE (opcional) ---
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
      document.head.appendChild(fontLink);

      // --- INJETAR ESTILOS ---
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);

      // --- CONFIGURAÇÃO PADRÃO E MERGE COM CONFIG GLOBAL ---
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
                  text: 'Powered by CodeWave.ia',
                  link: 'https://www.instagram.com/codewave.ia'
              }
          },
          style: {
              primaryColor: '',
              secondaryColor: '',
              position: 'right',
              backgroundColor: '#ffffff',
              fontColor: '#333333'
          }
      };

      const config = window.ChatWidgetConfig
        ? {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
          }
        : defaultConfig;

      // Evita inicializar mais de uma vez
      if (window.ChatWidgetInitialized) {
          console.warn('Chat widget já foi inicializado.');
          return;
      }
      window.ChatWidgetInitialized = true;

      // --- VARIÁVEIS GLOBAIS DE ESTADO ---
      let currentSessionId = '';
      let chatOpened = false;

      // Armazena sessões/contatos únicos: { sessionId -> { name, avatar } }
      const activeContacts = new Map();

      // --- CRIAR ELEMENTOS PRINCIPAIS DO WIDGET ---
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'chat-widget';

      // Aplicar cores configuradas como variáveis CSS
      widgetContainer.style.setProperty('--chat-primary-color', config.style.primaryColor);
      widgetContainer.style.setProperty('--chat-secondary-color', config.style.secondaryColor);
      widgetContainer.style.setProperty('--chat-background-color', config.style.backgroundColor);
      widgetContainer.style.setProperty('--chat-font-color', config.style.fontColor);

      const chatContainer = document.createElement('div');
      chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

      // HTML da tela inicial (antes de iniciar conversa)
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

      // HTML da interface de chat (após iniciar conversa)
      const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages">
                <div class="empty-state" style="text-align: center; padding: 20px; color: var(--chat--color-font); opacity: 0.7;">
                    Nenhuma mensagem ainda. Inicie uma conversa!
                </div>
            </div>
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

      // Botão flutuante para abrir/fechar o chat
      const toggleButton = document.createElement('button');
      toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
      `;

      widgetContainer.appendChild(chatContainer);
      widgetContainer.appendChild(toggleButton);
      document.body.appendChild(widgetContainer);

      // --- REFERÊNCIAS A ELEMENTOS IMPORTANTES ---
      const newChatBtn = chatContainer.querySelector('.new-chat-btn');
      const chatInterface = chatContainer.querySelector('.chat-interface');
      const messagesContainer = chatContainer.querySelector('.chat-messages');
      const emptyState = messagesContainer.querySelector('.empty-state');
      const textarea = chatContainer.querySelector('textarea');
      const sendButton = chatContainer.querySelector('button[type="submit"]');

      // Inicialmente, a interface de chat fica oculta
      chatInterface.style.display = 'none';

      // Função para gerar ID único (UUID)
      function generateUUID() {
          return crypto.randomUUID
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
      }

      // Verifica se já existe sessão para determinado contato
      function getExistingSession(contactName) {
          for (const [sessionId, contact] of activeContacts.entries()) {
              if (contact.name === contactName) {
                  return sessionId;
              }
          }
          return null;
      }

      // Inicia uma nova conversa (ou retoma se já existir)
      async function startNewConversation() {
          try {
              const contactName = config.branding.name;
              const existingSessionId = getExistingSession(contactName);

              if (existingSessionId) {
                  // Se já existe, usa a sessão existente
                  currentSessionId = existingSessionId;
                  console.log(`Usando sessão existente para ${contactName}: ${currentSessionId}`);
              } else {
                  // Cria nova sessão
                  currentSessionId = generateUUID();
                  activeContacts.set(currentSessionId, {
                      name: contactName,
                      avatar: config.branding.logo
                  });
                  console.log(`Nova sessão criada para ${contactName}: ${currentSessionId}`);
              }

              // Oculta tela inicial e mostra interface de chat
              const welcomeSection = chatContainer.querySelector('.new-conversation');
              if (welcomeSection) {
                  welcomeSection.style.display = 'none';
              }
              chatInterface.style.display = 'flex';
              chatInterface.classList.add('active');

              // Verifica se já existem mensagens
              const hasMessages = messagesContainer.querySelectorAll('.chat-message').length > 0;
              if (hasMessages) {
                  // Se houver, esconde o estado vazio
                  if (emptyState) emptyState.style.display = 'none';
              } else {
                  // Se não houver mensagens, mostra placeholder
                  if (emptyState) emptyState.style.display = 'block';

                  // (Opcional) Carregar mensagens anteriores do webhook
                  if (config.webhook && config.webhook.url) {
                      const data = [{
                          action: "loadPreviousSession",
                          sessionId: currentSessionId,
                          route: config.webhook.route,
                          metadata: {
                              userId: ""
                          }
                      }];

                      const response = await fetch(config.webhook.url, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(data)
                      });
                      const responseData = await response.json();

                      // Oculta placeholder se houver retorno
                      if (emptyState) emptyState.style.display = 'none';

                      const botMessageDiv = document.createElement('div');
                      botMessageDiv.className = 'chat-message bot';
                      botMessageDiv.textContent = Array.isArray(responseData)
                        ? responseData[0].output
                        : responseData.output;
                      messagesContainer.appendChild(botMessageDiv);
                  } else {
                      // Caso não use webhook, mostra mensagem padrão
                      if (emptyState) emptyState.style.display = 'none';

                      const botMessageDiv = document.createElement('div');
                      botMessageDiv.className = 'chat-message bot';
                      botMessageDiv.textContent = "Olá! Como posso ajudar você hoje?";
                      messagesContainer.appendChild(botMessageDiv);
                  }
              }

              messagesContainer.scrollTop = messagesContainer.scrollHeight;
          } catch (error) {
              console.error('Erro ao iniciar conversa:', error);

              // Em caso de erro, exibe chat e mensagem de falha
              chatInterface.style.display = 'flex';
              chatInterface.classList.add('active');

              if (emptyState) emptyState.style.display = 'none';

              const errorMessageDiv = document.createElement('div');
              errorMessageDiv.className = 'chat-message bot';
              errorMessageDiv.textContent = "Desculpe, tivemos um problema ao iniciar a conversa. Tente novamente mais tarde.";
              messagesContainer.appendChild(errorMessageDiv);
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
      }

      // Envia mensagem do usuário e recebe resposta do webhook (ou simulada)
      async function sendMessage(message) {
          if (!currentSessionId) {
              // Se não houver sessão, cria uma nova
              currentSessionId = generateUUID();
              if (!activeContacts.has(currentSessionId)) {
                  activeContacts.set(currentSessionId, {
                      name: config.branding.name,
                      avatar: config.branding.logo
                  });
              }
          }

          // Oculta placeholder se estiver visível
          if (emptyState) emptyState.style.display = 'none';

          // Cria bolha de mensagem do usuário
          const userMessageDiv = document.createElement('div');
          userMessageDiv.className = 'chat-message user';
          userMessageDiv.textContent = message;
          messagesContainer.appendChild(userMessageDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;

          // Tenta enviar para o webhook, se configurado
          try {
              if (config.webhook && config.webhook.url) {
                  const messageData = {
                      action: "sendMessage",
                      sessionId: currentSessionId,
                      route: config.webhook.route,
                      chatInput: message,
                      metadata: {
                          userId: ""
                      }
                  };

                  const response = await fetch(config.webhook.url, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(messageData)
                  });
                  const data = await response.json();

                  const botMessageDiv = document.createElement('div');
                  botMessageDiv.className = 'chat-message bot';
                  botMessageDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
                  messagesContainer.appendChild(botMessageDiv);

              } else {
                  // Se não há webhook, simula resposta do "bot"
                  setTimeout(() => {
                      const botMessageDiv = document.createElement('div');
                      botMessageDiv.className = 'chat-message bot';
                      botMessageDiv.textContent = "Recebemos sua mensagem! Um agente entrará em contato em breve.";
                      messagesContainer.appendChild(botMessageDiv);
                      messagesContainer.scrollTop = messagesContainer.scrollHeight;
                  }, 500);
              }
          } catch (error) {
              console.error('Erro ao enviar mensagem:', error);

              const errorMessageDiv = document.createElement('div');
              errorMessageDiv.className = 'chat-message bot';
              errorMessageDiv.textContent = "Desculpe, tivemos um problema ao enviar sua mensagem. Por favor, tente novamente.";
              messagesContainer.appendChild(errorMessageDiv);
          }

          messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      // Reseta o chat (se quiser começar conversa do zero)
      function resetChat() {
          const messages = messagesContainer.querySelectorAll('.chat-message');
          messages.forEach(msg => msg.remove());
          if (emptyState) emptyState.style.display = 'block';
          if (textarea) textarea.value = '';
      }

      // --- EVENTOS DO BOTÃO FLUTUANTE (toggle) ---
      toggleButton.addEventListener('click', () => {
          if (!chatOpened) {
              chatOpened = true;
          }
          if (chatContainer.classList.contains('open')) {
              chatContainer.classList.remove('open');
          } else {
              chatContainer.classList.add('open');
              // Se já houver mensagens, oculta placeholder
              const hasMessages = messagesContainer.querySelectorAll('.chat-message').length > 0;
              if (hasMessages && emptyState) {
                  emptyState.style.display = 'none';
              }
          }
      });

      // Botão "Send us a message"
      newChatBtn.addEventListener('click', () => {
          // Se já existe sessão ativa, opcionalmente podemos limpar
          // resetChat(); // se quiser zerar sempre que clicar
          startNewConversation();
      });

      // Botão de enviar (no input do chat)
      sendButton.addEventListener('click', () => {
          const message = textarea.value.trim();
          if (message) {
              sendMessage(message);
              textarea.value = '';
              textarea.style.height = 'auto';
          }
      });

      // Enviar com Enter (sem Shift)
      textarea.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const message = textarea.value.trim();
              if (message) {
                  sendMessage(message);
                  textarea.value = '';
                  textarea.style.height = 'auto';
              }
          }
      });

      // Botões de fechar (tanto na tela inicial quanto na interface de chat)
      const closeButtons = chatContainer.querySelectorAll('.close-button');
      closeButtons.forEach(button => {
          button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              chatContainer.classList.remove('open');
          });
      });

      // Ajuste de altura do textarea conforme digita
      textarea.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = (this.scrollHeight < 120) ? this.scrollHeight + 'px' : '120px';
      });
  })();
  </script>
</body>
</html>
