document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatInterface = document.getElementById('chat-interface');
    const submitBtn = document.getElementById('submit-btn');
    const initialInput = document.getElementById('initial-input');
    const messagesContainer = document.getElementById('messages');
    const titleElement = document.querySelector('h1');

    submitBtn.addEventListener('click', () => {
        const message = initialInput.value.trim();
        if (message) {
            // Hide welcome screen and show chat interface
            welcomeScreen.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            
            // Change the title
            titleElement.textContent = "Google Strasbourg Blogmaker";

            // Create and add the user message
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'user-message');
            messageElement.textContent = message;
            messagesContainer.appendChild(messageElement);
        }
    });

    // Allow Enter key to submit
    initialInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}); 