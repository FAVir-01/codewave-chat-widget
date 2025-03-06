// Chat Widget Script
(function() {
    const config = window.ChatWidgetConfig || {};
    let currentSessionId = '';
    let baserowRowId = null;

    async function handleChatEvent(action, chatInput) {
        if (!config.baserow || !config.baserow.apiUrl || !config.baserow.token) return;
        const token = config.baserow.token;
        const data = { sessionId: currentSessionId, action, chatImput: chatInput };

        if (action === 'startConversation') {
            try {
                const response = await fetch(config.baserow.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                    body: JSON.stringify(data)
                });
                const responseData = await response.json();
                baserowRowId = responseData.id;
            } catch (e) {
                console.error('Erro ao criar a linha:', e);
            }
        } else if (action === 'sendMessage' && baserowRowId) {
            const url = `${config.baserow.apiUrl}/${baserowRowId}/?user_field_names=true`;
            try {
                await fetch(url, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                    body: JSON.stringify(data)
                });
            } catch (e) {
                console.error('Erro ao atualizar a linha:', e);
            }
        }
    }

    async function fetchBaserowResponse() {
        if (!config.baserow || !config.baserow.apiUrl || !config.baserow.token || !baserowRowId) return;
        const url = `${config.baserow.apiUrl}/${baserowRowId}/?user_field_names=true`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${config.baserow.token}` }
            });
            const data = await response.json();
            return data.output;
        } catch (e) {
            console.error('Erro ao buscar resposta do Baserow:', e);
        }
    }

    async function startNewConversation() {
        currentSessionId = crypto.randomUUID();
        await handleChatEvent('startConversation', '');
        setTimeout(async () => {
            const botResponse = await fetchBaserowResponse();
            if (botResponse) displayMessage(botResponse, 'bot');
        }, 1000);
    }

    async function sendMessage(message) {
        displayMessage(message, 'user');
        await handleChatEvent('sendMessage', message);
        setTimeout(async () => {
            const botResponse = await fetchBaserowResponse();
            if (botResponse) displayMessage(botResponse, 'bot');
        }, 1000);
    }

    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.textContent = text;
        document.querySelector('.chat-messages').appendChild(messageDiv);
    }

    document.querySelector('.new-chat-btn').addEventListener('click', startNewConversation);
    document.querySelector('button[type="submit"]').addEventListener('click', () => {
        const message = document.querySelector('textarea').value.trim();
        if (message) {
            sendMessage(message);
            document.querySelector('textarea').value = '';
        }
    });
})();
