"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const webviewContent_1 = require("./webviewContent");
const api_1 = require("./api");
const API_URL = 'https://api.qbraid.com/api/chat';
let API_KEY;
async function activate(context) {
    let controller = null; // Store the controller for stopping requests
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
        const isValidKey = await (0, api_1.validateApiKey)(API_KEY, API_URL);
        if (!isValidKey) {
            vscode.window.showErrorMessage('Invalid API Key. Please check your key and try again.');
            API_KEY = undefined;
            continue;
        }
    }
    const models = await (0, api_1.fetchModels)(API_KEY, API_URL);
    const disposable = vscode.commands.registerCommand('qbraid-chat.start', () => {
        const panel = vscode.window.createWebviewPanel('qbraidChat', 'qBraid Chat', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = (0, webviewContent_1.getWebviewContent)(models);
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'sendMessage') {
                const { prompt, model } = message.payload;
                if (controller) {
                    controller.abort(); // Cancel previous request if running
                }
                controller = new AbortController();
                await (0, api_1.sendChatMessage)(prompt, model, panel, API_KEY, API_URL, controller);
            }
            else if (message.type === 'clearChat') {
                panel.webview.postMessage({ type: 'clearChat' });
            }
            else if (message.type === 'stopGeneration') {
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
        }, undefined, context.subscriptions);
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map