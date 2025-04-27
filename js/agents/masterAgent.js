// /js/agents/masterAgent.js
'use strict';

import * as htmlAgent from './htmlAgent.js';
import * as cssAgent  from './cssAgent.js';
import * as jsAgent   from './jsAgent.js';

// const azureOpenAiEndpoint = "https://taco-azure-openai-instance.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2025-01-01-preview";
// const azureOpenAiKey = "01JBcCjvxorZyGFShs7BfT8kgV82uFWI7hj8SMILCV1I5dCbnCjWJQQJ99BDAC4f1cMXJ3w3AAABACOGLPR7";

const proxyConfigUrl = "https://taco-openai-proxy.azurewebsites.net/api/proxyOpenAI";

// These will hold your OpenAI settings once fetched
let azureOpenAIendpoint = "";
let azureOpenAIkey = "";

async function initOpenAIConfig() {
    if (azureOpenAIendpoint && azureOpenAIkey) {
        window.logMessage("initOpenAIConfig: using cached endpoint/key");
        return;
    }

    const res = await fetch(proxyConfigUrl, { method: 'GET' });
    if (!res.ok) {
        throw new Error(`Could not load OpenAI config (${res.status}): ${await res.text()}`);
    }
    const { endpoint, apiKey } = await res.json();
    if (!endpoint || !apiKey) {
        throw new Error(`Invalid config response: ${JSON.stringify({ endpoint, apiKey })}`);
    }

    azureOpenAIendpoint = endpoint;
    azureOpenAIkey = apiKey;

    window.logMessage(`initOpenAIConfig: endpoint set to ${azureOpenAIendpoint}`);

}

async function handleUserPrompt(userPrompt) {

    window.logMessage(`handleUserPrompt() called ➡️ "${userPrompt}"`);

    try {
        await initOpenAIConfig();
    } catch (err) {
        window.logMessage("⚠️ handleUserPrompt: initOpenAIConfig failed: " + err.message);
        return;
    }

    addMessageToChatHistory(userPrompt, 'user');
    document.getElementById('userPrompt').value = '';  // Clear input field
    showTacoTypingIndicator();  // Start animation

    let json;

    try {
        const tacoResponse = await callTacoExpert(userPrompt);
        hideTacoTypingIndicator();  // Stop animation

        json = JSON.parse(tacoResponse);
        
        // addMessageToChatHistory(tacoResponse, 'agent');

    } catch (error) {
        hideTacoTypingIndicator();
        addMessageToChatHistory(`❌ Failed to parse agent command: ${error.message}`, 'agent');
        return;
    }

    const { agent, action, payload } = json;
    window.logMessage(`Dispatching to ${agent}.${action}("${payload}")`);
  
    // Dispatch agent dynamically
    try {
      const agentModule = { htmlAgent, cssAgent, jsAgent }[agent];
      if (!agentModule) throw new Error(`Unknown agent "${agent}"`);
  
      const fn = agentModule[action];
      if (typeof fn !== 'function') throw new Error(`Unknown action "${action}" on ${agent}`);
  
      fn(payload);
      addMessageToChatHistory(`✅ Executed ${agent}.${action}`, 'agent');

    } catch (dispatchErr) {
      addMessageToChatHistory(`❌ Dispatch error: ${dispatchErr.message}`, 'agent');
    }

}

// Talk to Azure OpenAI with TACO prompt
async function callTacoExpert(userPrompt) {

    await initOpenAIConfig();

    const url = `${azureOpenAIendpoint}/openai/deployments/gpt-4/chat/completions?api-version=2025-01-01-preview`;
    window.logMessage(`callTacoExpert: POST → ${url}`);
    window.logMessage(`callTacoExpert: userPrompt="${userPrompt}"`);

    const payload = {
        model: "gpt-4-turbo",
        messages: [
            {
                role: "system",
                content: `
                    You are TACO, an expert in Tableau Dashboard Design, UX Best Practices, and Dashboard Layout Styling.
                    You are also an expert UI‐orchestration agent. You know these agent modules:
                    • htmlAgent  
                    • cssAgent  
                    • jsAgent  

                    Each module exposes these actions:

                    htmlAgent: addHeader, showHeader, addSubheader, deleteHeader, deleteSubheader, updateFooter, hideFooter, showFooter, ...  
                    cssAgent: setSidebarColor, setBackground, setTextColor, applyThemeStyle, ...  
                    jsAgent: addClickHandler, removeClickHandler, ...  

                    When the user command contains the word “header”, you MUST pick one of the header actions.  
                    When it contains “footer”, you MUST pick one of the footer actions.  
                    When it contains “subheader”, you MUST pick a subheader action, etc.

                    When the user gives any natural‐language command, you must:

                    1. Normalize all synonyms (add, update, change, set, delete, remove, hide, show, insert…)  
                    2. Pick the correct 'agent' and 'action' name exactly as above  
                    3. Extract the 'payload' string (e.g. the text or color)  
                    4. Output **ONLY** this JSON (no extra text):

                    {"agent":"<agentName>","action":"<actionIdentifier>","payload":"<payloadString>"}

                    Examples:

                    User: “Add a subheader reading ‘Monthly Sales’”  
                    → {"agent":"htmlAgent","action":"addSubheader","payload":"Monthly Sales"}

                    User: “Change the sidebar background to #FF6600”  
                    → {"agent":"cssAgent","action":"setSidebarColor","payload":"#FF6600"}

                    User: “Hide the footer area”  
                    → {"agent":"htmlAgent","action":"hideFooter","payload":""}

                    User: “Attach a click listener to the chart”  
                    → {"agent":"jsAgent","action":"addClickHandler","payload":"chart"}

                    No explanations, just the JSON object.
                `.trim()
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: 0.2,
        max_tokens: 200
    };

    window.logMessage(`callTacoExpert: payload=${JSON.stringify(payload).slice(0,200)}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': azureOpenAIkey
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`OpenAI call failed (${res.status}): ${await res.text()}`);
    }

    const data = await response.json();
    const modelReply = data.choices[0].message.content.trim();
    return modelReply;
}

// Chat helper
function addMessageToChatHistory(text, who = 'agent') {
    const chatHistory = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${who}`;
    msgDiv.innerText = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

let typingInterval;

function showTacoTypingIndicator() {
    const chatHistory = document.getElementById('chatHistory');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message typing';
    typingDiv.id = 'taco-typing';
    typingDiv.innerText = "🤖 TACO is thinking...";
    chatHistory.appendChild(typingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    let dots = 0;
    typingInterval = setInterval(() => {
        dots = (dots + 1) % 4; // Cycle through 0,1,2,3 dots
        typingDiv.innerText = "🤖 TACO is thinking" + '.'.repeat(dots);
    }, 500);
}

function hideTacoTypingIndicator() {
    clearInterval(typingInterval);
    const typingDiv = document.getElementById('taco-typing');
    if (typingDiv) typingDiv.remove();
}


export { handleUserPrompt };
