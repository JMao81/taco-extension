// /js/agents/masterAgent.js
'use strict';

import * as htmlAgent from './htmlAgent.js';
import * as cssAgent from './cssAgent.js';
import * as jsAgent from './jsAgent.js';

// This URL points to the Azure Function that fetches the OpenAI settings
const proxyConfigUrl = "https://taco-openai-proxy.azurewebsites.net/api/proxyOpenAI";

// These will hold the Azure OpenAI settings once fetched from the proxy function
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

/**
 * Helper to call Azure OpenAI for *any* chat-completion.
 * This wraps the proxy function.
 */
async function fetchProxyCompletion(messages) {
    await initOpenAIConfig();
    const url = `${azureOpenAIendpoint}/openai/deployments/gpt-4/chat/completions?api-version=2025-01-01-preview`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': azureOpenAIkey
        },
        body: JSON.stringify({ model: "gpt-4-turbo", messages })
    });
    if (!res.ok) throw new Error(`OpenAI error (${res.status})`);
    return res.json();
}

/**
 * A quick helper that asks OpenAI for free-form design guidance.
 */
async function fetchBestPracticeGuidance(question) {
    const system = {
        role: 'system',
        content: `
        You are TACO, a Tableau dashboard design expert.  
        The user is asking for best practices, tips or guidelines—answer in clear, concise natural language.`
    };
    const user = { role: 'user', content: question };
    const data = await fetchProxyCompletion([system, user]);
    return data.choices[0].message.content.trim();
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

    // 0) Check for "clear" or "restart" commands
    if (/^\s*(clear|restart)\b/i.test(userPrompt)) {
        clearChatHistory();
        return;
    }

    // 1) GREETINGS
    if (/^\s*(hi|hello|hey|what's up|whats up|sup)\b/i.test(userPrompt)) {
        addMessageToChatHistory(
            "🌮 Hello! I’m TACO, your Dashboard Design Assistant. What would you like to do today?",
            'agent'
        );
        return;
    }

    // Handle "thank you" messages
    if (/^\s*(thank you|thanks|thx)\b/i.test(userPrompt)) {
        addMessageToChatHistory(
            "You're welcome! Let me know if there's anything else I can help with. 😊",
            'agent'
        );
        return;
    }

    // Handle "goodbye" messages
    if (/^\s*(goodbye|bye|see you|farewell|good bye)\b/i.test(userPrompt)) {
        addMessageToChatHistory(
            "Goodbye! Have a great day! 👋",
            'agent'
        );
        return;
    }

    // 2) GUIDANCE / BEST PRACTICE QUESTIONS
    if (/^(what|how|why|give|can|could|would|should)\b/i.test(userPrompt) && /\b(best|practice|tip|guideline|advice|suggestion|tableau|design)\b/i.test(userPrompt)) {
        window.logMessage("Matched best practice question: " + userPrompt);
        showTacoTypingIndicator();
        try {
            const guidance = await fetchBestPracticeGuidance(userPrompt);
            hideTacoTypingIndicator();
            return addMessageToChatHistory(guidance, 'agent');
        } catch (e) {
            hideTacoTypingIndicator();
            return addMessageToChatHistory(
                "❌ Sorry, I couldn't fetch guidance right now.",
                'agent'
            );
        }
    }

    // 3) MALICIOUS / OFF-TOPIC (optional pre-filter)
    const forbidden = ['rm -rf', 'eval(', 'DROP TABLE'];
    if (forbidden.some(tok => userPrompt.includes(tok))) {
        return addMessageToChatHistory("🚫 Sorry, I can’t help with that.", 'agent');
    }

    showTacoTypingIndicator();

    let rawJson;
    try {
        rawJson = await callTacoExpert(userPrompt);
        window.logMessage(`callTacoExpert response: ${rawJson}`);
        hideTacoTypingIndicator();
    } catch (err) {
        hideTacoTypingIndicator();
        return addMessageToChatHistory(`❌ API Error: ${err.message}`, 'agent');
    }

    let cmd;
    try {
        cmd = JSON.parse(rawJson);
        window.logMessage(`Parsed command: ${JSON.stringify(cmd)}`);
    } catch (err) {
        console.error("JSON.parse failed:", rawJson, err);
        return addMessageToChatHistory(
            "❌ I couldn't interpret that command.",
            'agent'
        );
    }

    if (cmd.agent === 'none' && cmd.action === 'refuse') {
        return addMessageToChatHistory(cmd.payload, 'agent');
    }

    // Dispatch to the sub-agents
    window.logMessage(`Dispatching to ${cmd.agent}.${cmd.action}("${cmd.payload}")`);
    try {
        const moduleMap = { htmlAgent, cssAgent, jsAgent };
        const fn = moduleMap[cmd.agent]?.[cmd.action];
        if (typeof fn !== 'function') {
            return addMessageToChatHistory(`❌ Unknown command ${cmd.agent}.${cmd.action}`, 'agent');
        }
        try {
            if (Array.isArray(cmd.payload)) {
                // e.g. ["selector","36px"]
                fn(...cmd.payload);
            }
            else if (cmd.payload !== null && typeof cmd.payload === 'object') {
                // { selector: ".header", size: "36px" }
                fn(...Object.values(cmd.payload));
            }
            else {
                // single argument
                fn(cmd.payload);
            }
            addMessageToChatHistory(`✅ Executed ${cmd.agent}.${cmd.action}`, 'agent');
            return cmd; 
        } catch (err) {
            addMessageToChatHistory(`❌ Dispatch error: ${err.message}`, 'agent');
        }
        // fn(cmd.payload);
        // return addMessageToChatHistory(`✅ Executed ${cmd.agent}.${cmd.action}`, 'agent');
    } catch (dispatchErr) {
        window.logMessage(`Dispatch error: ${dispatchErr.message}`);
        return addMessageToChatHistory(
            `❌ Dispatch error: ${dispatchErr.message}`,
            'agent'
        );
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
                    You are TACO, an expert in Tableau dashboard design and UI-orchestration.  

                    As an expert UI‐orchestration agent, you know these agent modules:
                    • htmlAgent  
                    • cssAgent  
                    • jsAgent  
                    • brandPolicyAgent  

                    Each module exposes these actions:

                    htmlAgent: addHeader, updateHeader, hideHeader, showHeader, addSubheader, updateSubheader, hideSubheader, showSubheader, addFooter, updateFooter, hideFooter, showFooter, setSidebarContent, hideSidebar, showSidebar
 
                    cssAgent: setSidebarColor, setBackground, setTextColor, applyThemeStyle, setFontSize, setFontStyle, setSpacing, setSize, setBorder, setBorderRadius, setSidebarLayout, setBorderColor, setBorderWidth, setBackgroundGradient, setTextGradient

                    jsAgent: addClickHandler, removeClickHandler, ...  

                    When the user command contains the word “header”, you MUST pick one of the header actions.  
                    When it contains “subheader”, you MUST pick one of the subheader actions.  
                    When it contains "sidebar" or "navigation", you MUST pick a sidebar actions.
                    When it contains “footer”, you MUST pick one of the footer actions, etc.  

                    When the user gives any natural‐language command, you must:

                    1. Normalize all synonyms (add, update, change, set, delete, remove, hide, show, insert…)  
                    2. Pick the correct 'agent' and 'action' name exactly as above  
                    3. Extract the 'payload' string (e.g. the text or color)  
                    4. Output **ONLY** this JSON (no extra text):

                    {"agent":"<agentName>","action":"<actionIdentifier>","payload":"<payloadObject-or-string>"}

                    Examples:

                    User: “Add a subheader reading ‘Monthly Sales’”  
                    → {"agent":"htmlAgent","action":"addSubheader","payload":"Monthly Sales"}

                    User: “Change header size to 36px”
                    → {"agent":"cssAgent","action":"setFontSize","payload":{"selector":".header","size":"36px"}}

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

    window.logMessage(`callTacoExpert: payload=${JSON.stringify(payload).slice(0, 200)}`);

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

function clearChatHistory() {
    const chatHistory = document.getElementById('chatHistory');
    if (chatHistory) {
        chatHistory.innerHTML = ''; // Clear all chat messages
        addMessageToChatHistory("Chat history cleared. 🌟", 'agent'); // Optional confirmation message
    }
}

export { handleUserPrompt };
