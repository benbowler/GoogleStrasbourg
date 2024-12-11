document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatInterface = document.getElementById('chat-interface');
    const submitBtn = document.getElementById('submit-btn');
    const sendBtn = document.getElementById('send-btn');
    const initialInput = document.getElementById('initial-input');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('messages');
    const titleElement = document.querySelector('h1');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiStatus = document.getElementById('api-status');

    // Check for saved API key
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        apiStatus.textContent = 'API Key loaded';
    }

    // Save API key to localStorage
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('gemini_api_key', apiKey);
            apiStatus.textContent = 'API Key saved';
            setTimeout(() => {
                apiStatus.textContent = '';
            }, 2000);
        }
    });

    async function getAIResponse(userMessage) {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            return 'Please enter a valid API key first.';
        }

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: userMessage
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || 'API Error');
            }

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Unexpected response structure from Gemini');
            }
        } catch (error) {
            console.error('Error:', error);
            return `Error: ${error.message || 'An error occurred while processing your message.'}`;
        }
    }

    function addMessage(text, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        messageElement.scrollIntoView({ behavior: 'smooth' });
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.textContent = 'AI is typing...';
        indicator.id = 'typing-indicator';
        messagesContainer.appendChild(indicator);
        indicator.scrollIntoView({ behavior: 'smooth' });
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async function handleMessage(message) {
        if (message.trim()) {
            addMessage(message, true);
            addTypingIndicator();
            const aiResponse = await getAIResponse(message);
            removeTypingIndicator();
            addMessage(aiResponse, false);
        }
    }

    submitBtn.addEventListener('click', async () => {
        const message = initialInput.value.trim();
        if (message) {
            welcomeScreen.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            titleElement.textContent = "Google Strasbourg Blogmaker";
            await handleMessage(message);
            initialInput.value = '';
        }
    });

    sendBtn.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        await handleMessage(message);
        chatInput.value = '';
    });

    initialInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
}); 