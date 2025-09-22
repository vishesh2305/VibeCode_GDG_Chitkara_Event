// public/script.js
document.addEventListener('DOMContentLoaded',async () => {

    await loadComponent('header.html', 'main-header');
    await loadComponent('footer.html', 'main-footer');


    loadGameState();
    updateGamificationDisplay();


    // --- Helper function for API calls ---
    async function getApiResponse(endpoint, body) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
            return { error: error.message };
        }
    }


    async function loadComponent(url, elementId) {
    const response = await fetch(url);
    const text = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = text;
    }
}



function showLoading(element, message = 'NexusAI is thinking...') {
    element.innerHTML = `
        <div class="flex justify-center items-center flex-col text-slate-400">
            <svg class="animate-spin h-8 w-8 text-sky-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>${message}</span>
        </div>`;
}

    // --- 1. DocuChat ---
    const docUpload = document.getElementById('document-upload');
    const uploadStatus = document.getElementById('upload-status');
    const chatContainer = document.getElementById('chat-container');
    const chatQuestion = document.getElementById('chat-question');
    const askButton = document.getElementById('ask-button');
    const chatResponse = document.getElementById('chat-response');

    docUpload.addEventListener('change', async () => {
        const file = docUpload.files[0];
        if (!file) return;

        uploadStatus.textContent = 'Uploading and processing...';
        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();

            if (response.ok) {
                uploadStatus.textContent = result.message;
                uploadStatus.classList.add('text-emerald-400');
                chatContainer.classList.remove('hidden');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            uploadStatus.textContent = `Error: ${error.message}`;
            uploadStatus.classList.add('text-rose-400');
        }
    });

    askButton.addEventListener('click', async () => {
        const question = chatQuestion.value;
        if (!question) return;

        showLoading(chatResponse);
        const result = await getApiResponse('/api/chat', { question });
        chatResponse.textContent = result.response || `Error: ${result.error}`;
    });


    // --- 2. Code Guardian ---
    const scanCodeButton = document.getElementById('scan-code-button');
    const codeInput = document.getElementById('code-input');
    const codeResponse = document.getElementById('code-response');
    
    scanCodeButton.addEventListener('click', async () => {
        const code = codeInput.value;
        if (!code) return;

        showLoading(codeResponse);
        // We craft a specific prompt for the backend
        const prompt = `You are a senior cybersecurity expert. Analyze the following code for vulnerabilities. Provide a detailed explanation of each vulnerability, its potential impact, and a corrected, secure version of the code. Structure your response clearly with sections for "Vulnerabilities Found" and "Corrected Code".
        
        --- Code to Analyze ---
        ${code}
        --- End of Code ---`;

        const result = await getApiResponse('/api/generate', { prompt });
        codeResponse.textContent = result.response || `Error: ${result.error}`;
    });

    // --- 3. Prompt Forge ---
    const refinePromptButton = document.getElementById('refine-prompt-button');
    const promptInput = document.getElementById('prompt-input');
    const promptResponse = document.getElementById('prompt-response');

    refinePromptButton.addEventListener('click', async () => {
        const userPrompt = promptInput.value;
        if (!userPrompt) return;

        showLoading(promptResponse);
        const prompt = `You are an expert prompt engineer. Refine the following user prompt to be more clear, specific, and effective for a large language model. Explain the key changes you made and why they are better. Provide the refined prompt in a copyable block.
        
        --- User Prompt ---
        ${userPrompt}
        --- End of Prompt ---`;

        const result = await getApiResponse('/api/generate', { prompt });
        promptResponse.textContent = result.response || `Error: ${result.error}`;
    });

    // --- 4. Sentiment Scope ---
    const sentimentButton = document.getElementById('sentiment-button');
    const sentimentInput = document.getElementById('sentiment-input');
    const sentimentResponse = document.getElementById('sentiment-response');

    sentimentButton.addEventListener('click', async () => {
        const text = sentimentInput.value;
        if(!text) return;
        
        showLoading(sentimentResponse);
        const prompt = `Analyze the sentiment of the following text. Respond with only one word: Positive, Negative, or Neutral.
        
        --- Text ---
        ${text}
        --- End of Text ---`;

        const result = await getApiResponse('/api/generate', { prompt });
        sentimentResponse.textContent = result.response || `Error: ${result.error}`;
    });
});