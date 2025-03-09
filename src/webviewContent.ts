/**
 * Generates the HTML content for the webview.
 * @param models An array of models to populate the dropdown.
 * @returns The HTML content as a string.
 */
interface Model {
    model: string;
    description: string;
}
export function getWebviewContent(models: Model[]): string {
    // Update model options to remove extra space
    const modelOptions = models
        .map((model) => `<option value="${model.model}" title="${model.description}">${model.model}</option>`)
        .join('');

    return `
        <!DOCTYPE html>
        <html lang="en" data-theme="dark">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>qBraid AI Chat</title>
            <style>
                :root[data-theme="light"] {
                    --bg-color: #ffffff;
                    --text-color: #333333;
                    --header-bg: #f5f5f5;
                    --chat-bg: #f0f0f0;
                    --bubble-ai-bg: #e9e9e9;
                    --bubble-user-bg: #007acc;
                    --input-bg: #ffffff;
                    --input-border: #cccccc;
                    --button-bg: #007acc;
                    --button-hover: #005999;
                    --button-disabled: #cccccc;
                    --code-bg: #f5f5f5;
                    --code-border: #ddd;
                    --select-bg: #ffffff;
                    --code-text: #333333;
                    --code-header-text: #333333;
                    --code-comment: #406040;
                    --code-string: #a31515;
                    --code-number: #098658;
                    --code-keyword: #0000ff;
                    --code-function: #795e26;
                    --code-property: #001080;
                    --code-operator: #000000;
                    --placeholder-text: #666666;
                }

                :root[data-theme="dark"] {
                    --bg-color: #1e1e1e;
                    --text-color: #e1e1e1;
                    --header-bg: #252526;
                    --chat-bg: #1e1e1e;
                    --bubble-ai-bg: #333;
                    --bubble-user-bg: #0078d4;
                    --input-bg: #333;
                    --input-border: #333;
                    --button-bg: #0078d4;
                    --button-hover: #005bb5;
                    --button-disabled: #444;
                    --code-bg: #1e1e1e;
                    --code-border: #333;
                    --select-bg: #333;
                    --code-text: #d4d4d4;
                    --code-header-text: #abb2bf;
                    --code-comment: #608b4e;
                    --code-string: #ce9178;
                    --code-number: #b5cea8;
                    --code-keyword: #569cd6;
                    --code-function: #dcdcaa;
                    --code-property: #9cdcfe;
                    --code-operator: #d4d4d4;
                    --placeholder-text: #888888;
                }

                body {
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    font-family: 'Inter', sans-serif;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }

                .header {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: var(--header-bg);
                    color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text-color);
                }

                .header select {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: none;
                    font-size: 1rem;
                    background: var(--select-bg);
                    color: var(--text-color);
                    cursor: pointer;
                    min-width: 200px;
                }

                .header select option {
                    padding: 8px 12px;
                    background: var(--select-bg);
                }

                .container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-box {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    background: var(--chat-bg);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: relative;
                }

                .placeholder {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: var(--placeholder-text);
                    font-size: 1.5rem;
                    font-weight: 600;
                    animation: fadeIn 1s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .message {
                    display: flex;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        transform: translateY(10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .message.user {
                    justify-content: flex-end;
                }

                .message.user .bubble {
                    background: var(--bubble-user-bg);
                    color: white;
                }

                .message.ai .bubble {
                    background: var(--bubble-ai-bg);
                    color: var(--text-color);
                }

                .bubble {
                    padding: 12px 16px;
                    border-radius: 12px;
                    max-width: 70%;
                    word-wrap: break-word;
                    word-break: break-word;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .footer {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: var(--header-bg);
                    border-top: 1px solid var(--input-border);
                }

                .footer textarea {
                    flex: 1;
                    border-radius: 8px;
                    padding: 0.8rem;
                    border: 1px solid var(--input-border);
                    resize: none;
                    font-size: 1rem;
                    background: var(--input-bg);
                    color: var(--text-color);
                    outline: none;
                }

                .footer textarea::placeholder {
                    color: #888;
                }

                .footer button {
                    margin-left: 1rem;
                    padding: 0.8rem 1.2rem;
                    border: none;
                    border-radius: 8px;
                    background: var(--button-bg);
                    color: white;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .footer button:hover {
                    background: var(--button-hover);
                }

                .footer button:disabled {
                    background: var(--button-disabled);
                    color: #888;
                    cursor: not-allowed;
                    position: relative;
                }

                .footer button:disabled::after {
                    content: attr(data-hover);
                    position: absolute;
                    top: -2.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    max-width: 200px;
                    padding: 0.5rem;
                    background: var(--header-bg);
                    color: var(--text-color);
                    font-size: 0.85rem;
                    text-align: center;
                    white-space: normal;
                    border-radius: 4px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease-in-out;
                }

                .footer button:disabled:hover::after {
                    opacity: 1;
                }

                .stop-button {
                    display: none;
                    background: #d13438 !important;
                    color: white;
                    margin-left: 1rem;
                }

                .stop-button:hover {
                    background: #a72a2e !important;
                }

                .loading {
                    display: inline-block; /* Changed from none */
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid #ffffff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                .clear-button {
                    background: #ff4d4d;
                    margin-left: 1rem;
                }

                .clear-button:hover {
                    background: #cc0000;
                }

                /* Inline code style */
                code {
                    font-family: monospace;
                    background: rgba(255, 255, 255, 0.1); /* Slight contrast */
                    color: var(--code-text);
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-size: 0.95em;
                    border: 1px solid rgba(255, 255, 255, 0.2); /* Subtle border */
                }

                /* Enhanced Code Block Styles */
                .code-block {
                    position: relative;
                    background: var(--code-bg);
                    border-radius: 8px;
                    margin: 1rem 0;
                    overflow: hidden;
                    border: 1px solid var(--code-border);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    font-size: 0.9em;
                    color: var(--code-text);
                }

                .code-block-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--header-bg);
                    border-bottom: 1px solid var(--code-border);
                }

                .language-label {
                    color: var(--code-header-text);
                    font-size: 0.85em;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .code-block .copy-button {
                    background: transparent;
                    border: 1px solid #4d4d4d;
                    color: var(--code-header-text);
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .code-block .copy-button:hover {
                    background: #333;
                    border-color: #666;
                    color: #fff;
                }

                .code-block .copy-button::before {
                    content: "Copy";
                }

                .code-block .copy-button.copied::before {
                    content: "Copied!";
                }

                .code-block pre {
                    margin: 0;
                    padding: 16px;
                    overflow-x: auto;
                    background: var(--code-bg);
                    scrollbar-width: thin;
                    scrollbar-color: #444 #1e1e1e;
                }

                .code-block pre::-webkit-scrollbar {
                    height: 8px;
                }

                .code-block pre::-webkit-scrollbar-track {
                    background: var(--code-bg);
                }

                .code-block pre::-webkit-scrollbar-thumb {
                    background: #444;
                    border-radius: 4px;
                }

                .code-block pre::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                .code-block code {
                    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
                    color: var(--code-text);
                    line-height: 1.5;
                    tab-size: 4;
                    background: transparent;
                    border: none;
                    padding: 0;
                }

                /* Syntax highlighting classes */
                .token.comment { color: var(--code-comment); }
                .token.string { color: var(--code-string); }
                .token.number { color: var(--code-number); }
                .token.keyword { color: var(--code-keyword); }
                .token.function { color: var(--code-function); }
                .token.property { color: var(--code-property); }
                .token.operator { color: var(--code-operator); }

                /* Markdown content styles */
                .bubble h1, .bubble h2, .bubble h3 {
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                    font-weight: 600;
                }

                .bubble ul, .bubble ol {
                    margin: 0.5em 0;
                    padding-left: 2em;
                }

                .bubble li {
                    margin: 0.25em 0;
                }

                .bubble p {
                    margin: 0.75em 0;
                    line-height: 1.5;
                }

                /* LaTeX equation styles */
                .latex-block {
                    overflow-x: auto;
                    padding: 1rem;
                    margin: 1rem 0;
                    background: var(--header-bg);
                    border-radius: 8px;
                    border: 1px solid var(--code-border);
                }

                .MathJax {
                    color: var(--text-color) !important;
                }

                /* Add before the @keyframes spin definition */
                .status-message {
                    padding: 8px 12px;
                    margin-top: 8px;
                    border-radius: 4px;
                    font-size: 0.9em;
                    animation: fadeIn 0.3s ease-out;
                }
                .status-message.error {
                    background: rgba(209, 52, 56, 0.1);
                    color: #ff6b6b;
                    border: 1px solid rgba(209, 52, 56, 0.2);
                }

                /* Theme toggle button styles */
                .theme-toggle {
                    background: transparent;
                    border: 2px solid var(--text-color);
                    color: var(--text-color);
                    padding: 6px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-left: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .theme-toggle:hover {
                    opacity: 0.8;
                }

                .theme-icon {
                    font-size: 16px;
                }
            </style>
            <!-- Add MathJax -->
            <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
            <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            <script>
                window.MathJax = {
                    tex: {
                        inlineMath: [['\\\\(', '\\\\)']],
                        displayMath: [['\\\\[', '\\\\]']],
                        processEscapes: true
                    },
                    options: {
                        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
                    }
                };
            </script>
        </head>
        <body>
            <div class="header">
                <h3>qBraid AI Chat</h3>
                <div style="display: flex; align-items: center;">
                    <select id="model">
                        <option value="" disabled selected>Select a model...</option>
                        ${modelOptions}
                    </select>
                    <button id="themeToggle" class="theme-toggle">
                        <span class="theme-icon">🌙</span>
                        <span class="theme-text">Dark</span>
                    </button>
                </div>
            </div>
            <div class="container">
                <div id="chatBox" class="chat-box">
                    <div id="placeholder" class="placeholder">What can I help with?</div>
                </div>
            </div>
            <div class="footer">
                <textarea id="input" placeholder="Type a message..."></textarea>
                <button id="send" disabled data-hover="Please select a model or type a message">Send</button>
                <button id="stop" class="stop-button">Stop</button>
                <button id="clear" class="clear-button">Clear</button>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const modelDropdown = document.getElementById('model');
                const sendButton = document.getElementById('send');
                const stopButton = document.getElementById('stop');
                const inputBox = document.getElementById('input');
                const chatBox = document.getElementById('chatBox');
                const clearButton = document.getElementById('clear');

                // Store the selected model globally
                let selectedModel = "";

                // Function to copy code to clipboard
                function copyCode(button) {
                    const codeBlock = button.closest('.code-block');
                    const code = codeBlock.querySelector('pre code').textContent;

                    navigator.clipboard.writeText(code).then(() => {
                        button.classList.add('copied');
                        setTimeout(() => {
                            button.classList.remove('copied');
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy code:', err);
                    });
                }

                function updateSendButtonState() {
                    const modelSelected = modelDropdown.value !== "";
                    const messageEntered = inputBox.value.trim() !== "";
                    
                    if (!modelSelected) {
                        sendButton.setAttribute("data-hover", "Please select a model");
                    } else if (!messageEntered) {
                        sendButton.setAttribute("data-hover", "Please type a message before sending");
                    } else {
                        sendButton.setAttribute("data-hover", "");
                    }

                    sendButton.disabled = !(modelSelected && messageEntered);
                }

                // Add event listener for Enter key in input box
                inputBox.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault(); // Prevent new line
                        sendButton.click();
                    }
                });

                modelDropdown.addEventListener('change', updateSendButtonState);
                inputBox.addEventListener('input', updateSendButtonState);

                sendButton.onclick = () => {
                    const message = inputBox.value.trim();
                    const model = modelDropdown.value;

                    if (!message || !model) return; // Prevent sending if conditions are not met

                    vscode.postMessage({ type: 'sendMessage', payload: { prompt: message, model } });

                    const userMessage = document.createElement('div');
                    userMessage.className = 'message user';
                    userMessage.innerHTML = \`<div class="bubble">\${message}</div>\`;
                    chatBox.appendChild(userMessage);

                    const placeholder = document.getElementById('placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }

                    inputBox.value = '';
                    updateSendButtonState();
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // Disable send button and show loading state
                    sendButton.disabled = true;
                    sendButton.innerHTML = '<div class="loading"></div>';
                    stopButton.style.display = 'inline-block';
                };

                stopButton.onclick = () => {
                    // Immediately hide stop button and update UI
                    stopButton.style.display = 'none';
                    sendButton.disabled = false;
                    sendButton.innerHTML = 'Send';

                    // Then notify extension to stop generation
                    vscode.postMessage({ type: 'stopGeneration' });
                    
                    // Reset send button state
                    updateSendButtonState();
                };

                clearButton.onclick = () => {
                    vscode.postMessage({ type: 'clearChat' });
                    chatBox.innerHTML = '<div id="placeholder" class="placeholder">What can I help with?</div>';
                    stopButton.style.display = 'none';
                };

                window.addEventListener('message', (event) => {
                    const { type, payload } = event.data;

                    if (type === 'response') {
                        let responseElement = document.getElementById('currentResponse');
                        if (!responseElement) {
                            responseElement = document.createElement('div');
                            responseElement.className = 'message ai';
                            responseElement.id = 'currentResponse';
                            responseElement.innerHTML = '<div class="bubble"></div>';
                            chatBox.appendChild(responseElement);
                        }
                        const bubble = responseElement.querySelector('.bubble');
                        
                        // Check if payload includes error message
                        if (payload.includes('status-message error')) {
                            // For error messages, append them to existing content
                            bubble.insertAdjacentHTML('beforeend', payload);
                        } else {
                            // For normal messages, replace content
                            bubble.innerHTML = payload;
                        }
                        
                        chatBox.scrollTop = chatBox.scrollHeight;

                        const placeholder = document.getElementById('placeholder');
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }

                        // Rerender math after content update
                        if (window.MathJax) {
                            window.MathJax.typesetPromise?.();
                        }
                    }

                    if (type === 'end') {
                        const responseElement = document.getElementById('currentResponse');
                        if (responseElement) responseElement.removeAttribute('id');

                        // Reset all loading states
                        sendButton.disabled = false;
                        sendButton.innerHTML = 'Send';
                        stopButton.style.display = 'none';
                        updateSendButtonState();
                    }

                    if (type === 'clearChat') {
                        chatBox.innerHTML = '<div id="placeholder" class="placeholder">What can I help with?</div>';
                        stopButton.style.display = 'none';
                    }
                });

                // Add this after the modelDropdown constant
                function updateModelDropdownOptions() {
                    const selectedValue = modelDropdown.value;

                    // Store original text values without ticks
                    const originalTexts = new Map();
                    Array.from(modelDropdown.options).forEach(option => {
                        if (option.value) {
                            originalTexts.set(option.value, option.value);
                        }
                    });

                    // Add tick marks when dropdown is opened
                    modelDropdown.addEventListener('mousedown', function() {
                        Array.from(modelDropdown.options).forEach(option => {
                            if (option.value) {
                                const isSelected = option.value === selectedValue;
                                option.textContent = originalTexts.get(option.value) + (isSelected ? ' ✔' : '');
                            }
                        });
                    });

                    // Remove tick marks when an option is selected
                    modelDropdown.addEventListener('change', function() {
                        Array.from(modelDropdown.options).forEach(option => {
                            if (option.value) {
                                option.textContent = originalTexts.get(option.value); // Reset all text
                            }
                        });
                    });

                    // Ensure the selected display area has no tick
                    if (selectedValue) {
                        modelDropdown.options[modelDropdown.selectedIndex].textContent = originalTexts.get(selectedValue);
                    }
                }

                // Update the model dropdown change event
                modelDropdown.addEventListener('change', () => {
                    updateSendButtonState();
                    setTimeout(updateModelDropdownOptions, 0);
                });

                // Initialize dropdown state
                updateModelDropdownOptions();

                // Theme switching functionality
                const themeToggle = document.getElementById('themeToggle');
                const root = document.documentElement;
                
                // Load saved theme
                const savedTheme = localStorage.getItem('theme') || 'dark';
                root.setAttribute('data-theme', savedTheme);
                updateThemeButton(savedTheme);

                themeToggle.addEventListener('click', () => {
                    const currentTheme = root.getAttribute('data-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    
                    root.setAttribute('data-theme', newTheme);
                    localStorage.setItem('theme', newTheme);
                    updateThemeButton(newTheme);
                });

                function updateThemeButton(theme) {
                    const icon = theme === 'dark' ? '🌙' : '☀️';
                    const text = theme === 'dark' ? 'Dark' : 'Light';
                    themeToggle.innerHTML = \`<span class="theme-icon">\${icon}</span><span class="theme-text">\${text}</span>\`;
                }
            </script>
        </body>
        </html>
    `;
}
