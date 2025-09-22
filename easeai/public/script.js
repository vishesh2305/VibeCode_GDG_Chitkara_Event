document.addEventListener('DOMContentLoaded', async () => {
    // --- MASTER INITIALIZATION ---
    await loadComponent('header.html', 'main-header');
    await loadComponent('footer.html', 'main-footer');
    initializeTheme();
    initializeParticles();
    initializeMobileMenu();
    loadGameState();
    updateGamificationDisplay();
    
    if (document.getElementById('docuchat')) initializeDocuChat();
    if (document.getElementById('codeguardian')) initializeCodeGuardian();
    if (document.getElementById('promptforge')) initializePromptForge();
    if (document.getElementById('sentimentscope')) initializeSentimentScope();
    if (document.getElementById('code-editor')) initializeCompiler();
    if (document.getElementById('carousel-container')) initializeCarousel();
});

// --- CORE & SHARED FUNCTIONS ---

async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = text;
    } catch (error) { console.error(`Failed to load component: ${url}`, error); }
}

function initializeMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => { mobileMenu.classList.toggle('hidden'); });
    }
}

async function initializeParticles() {
    if (typeof tsParticles === 'undefined') return;
    await tsParticles.load({
        id: "tsparticles",
        options: {
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onClick: { enable: true, mode: "push" },
                    onHover: { enable: true, mode: "repulse" },
                },
                modes: {
                    push: { quantity: 4 },
                    repulse: { distance: 150, duration: 0.4 },
                },
            },
            particles: {
                color: { value: "#475569" },
                links: { color: "#475569", distance: 150, enable: true, opacity: 0.2, width: 1 },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: { default: "bounce" },
                    random: false,
                    speed: 2,
                    straight: false,
                },
                number: { density: { enable: true }, value: 80 },
                opacity: { value: 0.3 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 5 } },
            },
            detectRetina: true,
        },
    });
}

// --- THEME TOGGLE (UPDATED) ---
const sunIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
const moonIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
let codeMirrorEditor = null; // Global reference to the editor instance

function initializeTheme() {
    const toggleButton = document.getElementById('theme-toggle');
    const mobileToggleButton = document.getElementById('theme-toggle-mobile');
    
    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        if(toggleButton) toggleButton.innerHTML = isDark ? sunIcon : moonIcon;
        if(mobileToggleButton) mobileToggleButton.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        
        // **NEW**: Update CodeMirror theme if it exists
        if (codeMirrorEditor) {
            codeMirrorEditor.setOption("theme", isDark ? "dracula" : "default");
        }
    };

    const toggleTheme = () => {
        const isDark = !document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    };

    if (toggleButton) toggleButton.addEventListener('click', toggleTheme);
    if (mobileToggleButton) mobileToggleButton.addEventListener('click', toggleTheme);
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
}


// --- GAMIFICATION ---
let gameState = { xp: 0, badges: [] };

function loadGameState() {
    const savedState = localStorage.getItem('easeaiGameState');
    if (savedState) gameState = JSON.parse(savedState);
}

function saveGameState() {
    localStorage.setItem('easeaiGameState', JSON.stringify(gameState));
}

function addXP(amount) {
    gameState.xp += amount;
    updateGamificationDisplay();
    saveGameState();
}

function updateGamificationDisplay() {
    const display = document.getElementById('gamification-display');
    const mobileDisplay = document.getElementById('gamification-display-mobile');
    const content = `<span>XP: ${gameState.xp}</span>`;
    if (display) display.innerHTML = content;
    if (mobileDisplay) mobileDisplay.innerHTML = content;
}

// --- API & UI HELPERS ---
async function getApiResponse(endpoint, body) {
    // ... same as your old script.js
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

function showLoading(element, message = 'easeai is thinking...') {
    // ... same as your old script.js but with new name
     element.innerHTML = `<div class="text-center text-slate-400">${message}</div>`;
}

function addCopyToClipboard(element, textToCopy) {
    // ... logic from previous response
}

// --- INITIALIZER FOR DOCUCHAT PAGE ---
function initializeDocuChat() {
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
                addXP(20);
            } else { throw new Error(result.error); }
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
        addXP(5);
    });
}

// --- INITIALIZER FOR CODE GUARDIAN PAGE ---
function initializeCodeGuardian() {
    const scanCodeButton = document.getElementById('scan-code-button');
    const codeInput = document.getElementById('code-input');
    const codeResponse = document.getElementById('code-response');
    
    scanCodeButton.addEventListener('click', async () => {
        const code = codeInput.value;
        if (!code) return;
        showLoading(codeResponse);
        const prompt = `You are a senior cybersecurity expert...`; // Your prompt
        const result = await getApiResponse('/api/generate', { prompt });
        codeResponse.textContent = result.response || `Error: ${result.error}`;
        addXP(10);
    });
}

// --- INITIALIZER FOR PROMPT FORGE PAGE ---
function initializePromptForge() {
    const refinePromptButton = document.getElementById('refine-prompt-button');
    const promptInput = document.getElementById('prompt-input');
    const promptResponse = document.getElementById('prompt-response');

    refinePromptButton.addEventListener('click', async () => {
        const userPrompt = promptInput.value;
        if (!userPrompt) return;
        showLoading(promptResponse);
        const prompt = `You are an expert prompt engineer...`; // Your prompt
        const result = await getApiResponse('/api/generate', { prompt });
        promptResponse.textContent = result.response || `Error: ${result.error}`;
        addXP(10);
    });
}

// --- INITIALIZER FOR SENTIMENT SCOPE PAGE ---
function initializeSentimentScope() {
    const sentimentButton = document.getElementById('sentiment-button');
    const sentimentInput = document.getElementById('sentiment-input');
    const sentimentResponse = document.getElementById('sentiment-response');

    sentimentButton.addEventListener('click', async () => {
        const text = sentimentInput.value;
        if(!text) return;
        showLoading(sentimentResponse);
        const prompt = `Analyze the sentiment of the following text...`; // Your prompt
        const result = await getApiResponse('/api/generate', { prompt });
        sentimentResponse.textContent = result.response || `Error: ${result.error}`;
        addXP(5);
    });
}

function initializeCarousel() {
    const container = document.getElementById('carousel-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (!container || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const slides = container.children;
    const totalSlides = slides.length;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        container.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
}



function initializeTheme() {
    const toggleButton = document.getElementById('theme-toggle');
    const mobileToggleButton = document.getElementById('theme-toggle-mobile');
    
    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        if(toggleButton) toggleButton.innerHTML = isDark ? sunIcon : moonIcon;
        if(mobileToggleButton) mobileToggleButton.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        
        // **NEW**: Update CodeMirror theme if it exists
        if (codeMirrorEditor) {
            codeMirrorEditor.setOption("theme", isDark ? "dracula" : "default");
        }
    };

    const toggleTheme = () => {
        const isDark = !document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    };

    if (toggleButton) toggleButton.addEventListener('click', toggleTheme);
    if (mobileToggleButton) mobileToggleButton.addEventListener('click', toggleTheme);
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
}




function initializeCompiler() {
    if (typeof CodeMirror === 'undefined') return;

    // Use the global reference
    codeMirrorEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        lineNumbers: true, 
        mode: 'javascript', 
        theme: document.documentElement.classList.contains('dark') ? "dracula" : "default", // Set initial theme
        autoCloseBrackets: true,
    });
    
    const runBtn = document.getElementById('run-code-btn');
    const suggestBtn = document.getElementById('get-suggestions-btn');
    const outputContainer = document.getElementById('output-container');

    // **FIXED COMPILER LOGIC**
    runBtn.addEventListener('click', () => {
        const code = codeMirrorEditor.getValue();
        outputContainer.className = "bg-slate-100 dark:bg-slate-800 p-4 rounded-lg h-[400px] font-mono whitespace-pre-wrap overflow-y-auto border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"; // Reset styles
        outputContainer.innerHTML = '<span class="text-slate-500">Executing...</span>';
        
        const output = [];
        const oldLog = console.log;
        console.log = (...args) => {
            output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' '));
        };

        try {
            eval(code);
            outputContainer.textContent = output.join('\n') || 'Execution finished with no output.';
        } catch (e) {
            outputContainer.className += " text-red-500"; // Add error color
            outputContainer.textContent = `Error: ${e.message}`;
        } finally {
            console.log = oldLog; // IMPORTANT: Restore original console.log
        }
    });

    suggestBtn.addEventListener('click', async () => {
        const code = codeMirrorEditor.getValue();
        if (!code) return;
        
        showLoading(outputContainer, 'Getting AI suggestions...');
        const prompt = `You are an expert code reviewer. Analyze the following JavaScript code. Provide suggestions for improvement, optimization, or best practices. Format your response clearly in Markdown.
        --- Code ---
        ${code}
        --- End Code ---`;

        const result = await getApiResponse('/api/generate', { prompt });
        outputContainer.textContent = result.response || 'Failed to get suggestions.';
        addXP(15);
    });
}