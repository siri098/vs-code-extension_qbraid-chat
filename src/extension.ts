import * as vscode from 'vscode';
import axios from 'axios';
import { getWebviewContent } from './webviewContent';
import { validateApiKey, fetchModels, sendChatMessage } from './api';

const API_URL = 'https://api.qbraid.com/api/chat';
let API_KEY: string | undefined;

export async function activate(context: vscode.ExtensionContext) {
    let controller: AbortController | null = null; // Store the controller for stopping requests

    while (!API_KEY) {
        API_KEY = await vscode.window.showInputBox({
            prompt: 'Enter your qBraid API Key',
            placeHolder: 'API Key',
            ignoreFocusOut: true,
            password: true
        });

        if (!API_KEY) {
            vscode.window.showErrorMessage('API Key is required to use the qBraid Chat extension.');
            return;
        }

        const isValidKey = await validateApiKey(API_KEY, API_URL);
        if (!isValidKey) {
            vscode.window.showErrorMessage('Invalid API Key. Please check your key and try again.');
            API_KEY = undefined;
            continue;
        }
    }

    const models = await fetchModels(API_KEY, API_URL);

    const disposable = vscode.commands.registerCommand('qbraid-chat.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'qbraidChat',
            'qBraid Chat',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent(models);

        panel.webview.onDidReceiveMessage(
            async (message: { type: string; payload?: any }) => {
                if (message.type === 'sendMessage') {
                    const { prompt, model } = message.payload;
                    if (controller) {
                        controller.abort(); // Cancel previous request if running
                    }
                    controller = new AbortController();
                    await sendChatMessage(prompt, model, panel, API_KEY!, API_URL, controller);
                } else if (message.type === 'clearChat') {
                    panel.webview.postMessage({ type: 'clearChat' });
                } else if (message.type === 'stopGeneration') {
                    if (controller) {
                        // First send UI update
                        panel.webview.postMessage({ 
                            type: 'response', 
                            payload: '<div class="status-message error">Message generation stopped by user.</div>' 
                        });
                        panel.webview.postMessage({ type: 'end' });
                        
                        // Then abort the controller
                        controller.abort();
                        controller = null;
                    }
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
