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

        const promptPrefix = "You are tasked with helping a user choose a WordPress theme for their blog. Please ask only one question at a time. The user has sent the following message: ";
        const fullPrompt = promptPrefix + userMessage;

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
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

    async function extractThemes(text) {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKeyInput.value.trim(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Extract 2-3 key themes or facts about the user from this conversation. Return only bullet points, each on a new line, starting with "•". If no clear themes are present, extract potential preferences or interests. Here's the conversation:\n\n${text}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            }
            return null;
        } catch (error) {
            console.error('Error extracting themes:', error);
            return null;
        }
    }

    function addThemesToSidebar(themesText) {
        if (!themesText) return;
        
        const themesList = document.getElementById('themes-list');
        const themes = themesText.split('\n').filter(theme => theme.trim().startsWith('•'));
        
        // Log for debugging
        console.log('Extracted themes:', themes);
        
        themes.forEach(theme => {
            const themeItem = document.createElement('li');
            themeItem.className = 'theme-item';
            themeItem.textContent = theme.trim();
            themesList.appendChild(themeItem);
        });
    }

    async function handleMessage(message) {
        if (message.trim()) {
            // If we're in the welcome screen, we need to copy the initial AI message
            if (!welcomeScreen.classList.contains('hidden')) {
                const initialAIMessage = document.querySelector('#welcome-screen .ai-message').textContent;
                addMessage(initialAIMessage, false);
            }

            addMessage(message, true);
            addTypingIndicator();
            const aiResponse = await getAIResponse(message);
            removeTypingIndicator();
            addMessage(aiResponse, false);

            // Extract and add themes from both the user's message and AI's response
            const combinedText = `User: ${message}\nAI: ${aiResponse}`;
            const themes = await extractThemes(combinedText);
            addThemesToSidebar(themes);
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