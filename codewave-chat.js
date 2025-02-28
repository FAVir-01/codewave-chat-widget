
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
