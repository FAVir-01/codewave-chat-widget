let currentSessionId = null;
let baserowRowId = null;

// Função para gerar um UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Função para obter os dados atualizados da fileira via GET
async function getRowData() {
    if (!baserowRowId) {
        console.error('Nenhuma linha para recuperar. Inicie a conversa primeiro.');
        return;
    }
    // Monta a URL para acessar a linha específica
    const url = config.baserow.apiUrl.replace(/\/\?user_field_names=true$/, `/${baserowRowId}/?user_field_names=true`);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${config.baserow.token}`
            }
        });
        const data = await response.json();
        // Retorna o campo output preenchido pelo n8n (se existir)
        return { output: data.output };
    } catch (e) {
        console.error('Erro ao buscar os dados da linha:', e);
    }
}

// Função para lidar com eventos de chat e atualizar o Baserow
async function handleChatEvent(action, chatInput) {
    if (!config.baserow) {
        console.error('Configuração do Baserow não encontrada.');
        return;
    }
    const payload = {
        sessionId: currentSessionId,
        action: action,
        chatImput: chatInput
    };
    try {
        if (!baserowRowId) {
            // Se não há uma linha existente, cria uma nova (POST)
            const response = await fetch(config.baserow.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${config.baserow.token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            baserowRowId = data.id; // Armazena o ID da nova linha criada
        } else {
            // Se já há uma linha, atualiza-a (PATCH)
            const url = config.baserow.apiUrl.replace(/\/\?user_field_names=true$/, `/${baserowRowId}/?user_field_names=true`);
            await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${config.baserow.token}`
                },
                body: JSON.stringify(payload)
            });
        }
    } catch (e) {
        console.error('Erro ao enviar dados para o Baserow:', e);
    }
}

// Função para enviar mensagens
async function sendMessage(message) {
    if (!currentSessionId) {
        currentSessionId = generateUUID();
    }
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.textContent = message;
    messagesContainer.appendChild(userMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Registrar envio da mensagem no Baserow
    if (config.baserow) {
        await handleChatEvent('sendMessage', message);
        // Obter os dados atualizados da fileira e extrair o output
        const updatedRow = await getRowData();
        if (updatedRow && updatedRow.output) {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = updatedRow.output;
            messagesContainer.appendChild(botMessageDiv);
        }
    }

    // Lógica para o webhook, se configurado
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
        console.error('Erro ao enviar mensagem:', error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'chat-message bot';
        errorMessageDiv.textContent = "Desculpe, tivemos um problema ao enviar sua mensagem. Por favor, tente novamente.";
        messagesContainer.appendChild(errorMessageDiv);
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
