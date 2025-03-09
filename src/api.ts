// functions for API communication between your VS Code extension and the qBraid API.

import axios from 'axios';
import * as vscode from 'vscode';

/**
 * Validates the API key by making a request to the models endpoint.
 * @param apiKey The API key to validate.
 * @param apiUrl The base URL of the API.
 * @returns A boolean indicating whether the API key is valid.
 */
export async function validateApiKey(apiKey: string, apiUrl: string): Promise<boolean> {
    try {
        const response = await axios.get(`${apiUrl}/models`, {
            headers: { 'api-key': apiKey },
        });
        return response.status === 200; // Assuming a 200 status means the key is valid
    } catch (error: any) {
        return false; // If there's an error, the key is invalid
    }
}

/**
 * Fetches the list of available models from the API.
 * @param apiKey The API key to use for the request.
 * @param apiUrl The base URL of the API.
 * @returns An array of models.
 */
export async function fetchModels(apiKey: string, apiUrl: string): Promise<any[]> {
    try {
        const response = await axios.get(`${apiUrl}/models`, {
            headers: { 'api-key': apiKey },
        });
        return response.data;
    } catch (error: any) {
        vscode.window.showErrorMessage('Failed to fetch models. Please check your API key and connection.');
        return [];
    }
}

/**
 * Sends a chat message to the API and streams the response back to the webview.
 * @param prompt The user's input prompt.
 * @param model The model to use for the response.
 * @param panel The webview panel to post messages to.
 * @param apiKey The API key to use for the request.
 * @param apiUrl The base URL of the API.
 */
export async function sendChatMessage(
    prompt: string,
    model: string,
    panel: vscode.WebviewPanel,
    apiKey: string,
    apiUrl: string,
    controller: AbortController
): Promise<void> {
    let response: any;
    try {
        response = await axios({
            method: 'post',
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            data: { prompt, model, stream: true },
            responseType: 'stream',
            signal: controller.signal,
        });

        let accumulatedResponse = '';
        let isAborted = false;

        const cleanup = () => {
            if (response && response.data) {
                response.data.destroy();
            }
            isAborted = true;
        };

        controller.signal.addEventListener('abort', cleanup);

        response.data.on('data', (chunk: Buffer) => {
            if (isAborted || controller.signal.aborted) {
                cleanup();
                return;
            }

            const decodedChunk = chunk.toString('utf8');
            accumulatedResponse += decodedChunk;

            if (!isAborted) {
                panel.webview.postMessage({
                    type: 'response',
                    payload: formatText(accumulatedResponse),
                });
            }
        });

        response.data.on('end', () => {
            if (!isAborted && !controller.signal.aborted) {
                panel.webview.postMessage({ type: 'end' });
            }
        });

    } catch (error: any) {
        if (error.name === 'AbortError' || controller.signal.aborted) {
            return;
        }
        panel.webview.postMessage({
            type: 'response',
            payload: '<div class="status-message error">Error: Failed to generate response. Please try again.</div>'
        });
        panel.webview.postMessage({ type: 'end' });
    }
}

/**
 * Escapes HTML special characters to prevent rendering issues in code blocks.
 * @param str The string to escape.
 * @returns The escaped string.
 */
function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
/**
 * Formats the text response from the API for display in the webview.
 * @param text The text to format.
 * @returns The formatted text.
 */
function formatText(text: string): string {
    // Save code blocks and inline LaTeX
    const codeBlocks: string[] = [];
    const latexBlocks: string[] = [];

    // Remove and save code blocks first
    let processedText = text.replace(/```(\w+)?\n([\s\S]+?)```/g, (match) => {
        codeBlocks.push(match);
        return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    // Remove and save inline LaTeX
    processedText = processedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, equation) => {
        latexBlocks.push(equation);
        return `___LATEX_BLOCK_${latexBlocks.length - 1}___`;
    });
    
    processedText = processedText.replace(/\$([\s\S]+?)\$/g, (match, equation) => {
        latexBlocks.push(equation);
        return `___LATEX_INLINE_${latexBlocks.length - 1}___`;
    });

    // Process regular markdown
    const textWithoutCode = processedText.replace(/```(\w+)?\n([\s\S]+?)```/g, (match) => {
        codeBlocks.push(match);
        return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    // Process the text (excluding code blocks)
    let formattedText = textWithoutCode
        // Handle headers (now safe to process since code blocks are removed)
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Handle inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Handle emphasis
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Handle lists
        .replace(/^\s*[-+*]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
        .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
        .replace(/(<li>[\s\S]+?<\/li>)/g, '<ol>$1</ol>')
        // Clean up list nesting
        .replace(/<\/ul><ul>/g, '')
        .replace(/<\/ol><ol>/g, '')
        // Handle paragraphs and line breaks
        .split(/\n\n+/)
        .map(block => block.trim())
        .filter(block => block.length > 0)
        .map(block => block.startsWith('<') ? block : `<p>${block}</p>`)
        .join('\n')
        .replace(/\n(?!<)/g, '<br>');

    // Restore LaTeX blocks with proper formatting
    formattedText = formattedText.replace(/___LATEX_BLOCK_(\d+)___/g, (match, index) => {
        const equation = latexBlocks[parseInt(index)];
        return `<div class="latex-block">\\[${equation}\\]</div>`;
    });

    formattedText = formattedText.replace(/___LATEX_INLINE_(\d+)___/g, (match, index) => {
        const equation = latexBlocks[parseInt(index)];
        return `\\(${equation}\\)`;
    });

    // Restore code blocks last
    formattedText = formattedText.replace(/___CODE_BLOCK_(\d+)___/g, (match, index) => {
        const block = codeBlocks[parseInt(index)];
        return block.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
            const languageClass = lang ? ` language-${lang}` : '';
            const languageLabel = lang ? lang.toLowerCase() : 'text';
            const escapedCode = escapeHtml(code.trim());
            return `
                <div class="code-block">
                    <div class="code-block-header">
                        <span class="language-label">${languageLabel}</span>
                        <button class="copy-button" onclick="copyCode(this)"></button>
                    </div>
                    <pre><code class="${languageClass}">${escapedCode}</code></pre>
                </div>`;
        });
    });

    // Handle other markdown elements
    return formattedText;
}