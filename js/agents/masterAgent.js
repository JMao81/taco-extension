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

// ─────────────────────────────────────────────────────────────────────────────
//  1) Initialization of Azure OpenAI credentials
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
//  2) Low‐level LLM callers
// ─────────────────────────────────────────────────────────────────────────────
async function callTacoExpert(userPrompt) {

    await initOpenAIConfig();

    const url = `${azureOpenAIendpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview`;
    window.logMessage(`callTacoExpert: POST → ${url}`);
    window.logMessage(`callTacoExpert: userPrompt="${userPrompt}"`);

    const payload = {
        model: "gpt-4o",
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

                    htmlAgent: addHeader, updateHeader, hideHeader, showHeader, addSubheader, updateSubheader, hideSubheader, showSubheader, addFooter, updateFooter, hideFooter, showFooter, setSidebarContent, hideSidebar, showSidebar, listLogos, addLogo, moveLogo, removeLogo 
 
                    cssAgent: setSidebarColor, setBackgroundColor, setTextColor, applyThemeStyle, setFontSize, setFontStyle, setSpacing, setSize, setBorder, setBorderRadius, setSidebarLayout, setBorderColor, setBorderWidth, setBackgroundGradient, setTextGradient, setBackgroundImage, setLogoSize

                    jsAgent: addClickHandler, removeClickHandler, ...  

                    When the user command contains the word “header”, you MUST pick one of the header actions.  
                    When it contains “subheader”, you MUST pick one of the subheader actions.  
                    When it contains "sidebar" or "navigation", you MUST pick a sidebar actions.
                    When it contains “footer”, you MUST pick one of the footer actions, etc.  

                    When the user gives any natural‐language command, you must:

                    1. Normalize all synonyms (add, update, change, set, delete, remove, hide, show, insert …)  
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

                    When the user’s request contains multiple actionable instructions (e.g. “set header text to Hello and set font size to 36px”), output **ONLY** a JSON _array_ of command objects, each with the same schema:

                    [
                        {"agent":"<agentName>","action":"<actionIdentifier>","payload":<payload>},
                        {"agent":"<agentName>","action":"<actionIdentifier>","payload":<payload>},
                        …
                    ]

                    If there is only one instruction, you may output either a single object or a single‐element array. No extra text.

                    ###############
                    If user is asking about **Logo**, please follow the logo workflow:
                    1) If the user says “add a logo” (or similar) **and** does **not** specify which logo, you must output **only**:
                    {"agent":"htmlAgent","action":"listLogos","payload":""}
                    This will cause the client to call "htmlAgent.listLogos()" and show the user:
                        “I have 1) Company A, 2) Brand B, 3) Logo C. Which would you like?”
                    2) When the user replies with either a number or name, output:
                    {"agent":"htmlAgent","action":"addLogo","payload":{"choice":<that number or name>}}
                    e.g. {"agent":"htmlAgent","action":"addLogo","payload":{"choice":2}}
                    3) After a logo is present, the user may say “move it to the right” or “make it 80px tall.”  
                    In those cases output **only**:
                        {"agent":"htmlAgent","action":"moveLogo","payload":{"right":"8px","top":"8px"}}
                        or
                        {"agent":"cssAgent","action":"setLogoSize","payload":{"dimension":"height","value":"80px"}}
                    ###############

                    No explanations, just the JSON object.  
                `.trim()
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: 0.2,
        max_tokens: 300
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
        throw new Error(`OpenAI call failed (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();

    if (data.usage) {
        const { prompt_tokens, completion_tokens, total_tokens } = data.usage;
        window.logMessage(`callTacoExpert: Token usage - prompt=${prompt_tokens}, completion=${completion_tokens}, total=${total_tokens}`);
    }

    const modelReply = data.choices[0].message.content.trim();
    return modelReply;
}
async function fetchBestPracticeGuidance(userPrompt) {
    await initOpenAIConfig();
    const deployment = "gpt4-o";
    const url = `${azureOpenAIendpoint}/openai/deployments/${deployment}/chat/completions?api-version=2025-01-01-preview`;

    const payload = {
        model: deployment,
        messages: [
            {
                role: "system",
                content: `
                    You are TACO, a Tableau dashboard design expert.
                    The user asks for best practices, tips, or guidelines—answer in clear, concise natural language.`
            },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': azureOpenAIkey
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Guidance call failed (${response.status})`);
    }

    const data = await response.json();

    if (data.usage) {
        const { prompt_tokens, completion_tokens, total_tokens } = data.usage;
        window.logMessage(`callTacoExpert: Token usage - prompt=${prompt_tokens}, completion=${completion_tokens}, total=${total_tokens}`);
    }

    return data.choices[0].message.content.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
//  3) Dispatch helper
// ─────────────────────────────────────────────────────────────────────────────
function dispatchCommand(cmd) {
    const modules = { htmlAgent, cssAgent, jsAgent };
    const fn = modules[cmd.agent]?.[cmd.action];
    if (typeof fn !== 'function') {
        console.warn(`Unknown command: ${cmd.agent}.${cmd.action}`);
        return;
    }
    const args = Array.isArray(cmd.payload)
        ? cmd.payload
        : (cmd.payload && typeof cmd.payload === 'object')
            ? Object.values(cmd.payload)
            : [cmd.payload];
    fn(...args);
}

// ─────────────────────────────────────────────────────────────────────────────
//  4) Chat UI helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
//  5) Main entrypoint
// ─────────────────────────────────────────────────────────────────────────────
async function handleUserPrompt(userPrompt) {

    window.logMessage(`handleUserPrompt() called ➡️ "${userPrompt}"`);
    addMessageToChatHistory(userPrompt, 'user');
    document.getElementById('userPrompt').value = '';  // Clear input field

    // 0) Check for "clear" or "restart" commands
    if (/^\s*(clear|restart|reset)\b/i.test(userPrompt)) {
        clearChatHistory();
        return;
    }

    // 1) Greetings
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

    // 2) Best-practice guidance
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

    // 3) Malicious/off-topic filter
    const forbidden = ['rm -rf', 'eval(', 'DROP TABLE'];
    if (forbidden.some(tok => userPrompt.includes(tok))) {
        return addMessageToChatHistory("🚫 Sorry, I can’t help with that.", 'agent');
    }

    // Actionable commands
    showTacoTypingIndicator();

    let rawJson;
    try {
        rawJson = await callTacoExpert(userPrompt);
        hideTacoTypingIndicator();
        window.logMessage(`LLM raw output: ${rawJson}`);
    } catch (err) {
        hideTacoTypingIndicator();
        return addMessageToChatHistory(`❌ API Error: ${err.message}`, 'agent');
    }

    let parsed;
    try {
        parsed = JSON.parse(rawJson);
    } catch {
        return addMessageToChatHistory("❌ I couldn't parse commands.", 'agent');
    }

    const cmds = Array.isArray(parsed) ? parsed : [parsed];
    for (const cmd of cmds) {
        if (cmd.agent === 'none') {
            addMessageToChatHistory(cmd.payload, 'agent');
        } else {
            dispatchCommand(cmd);
            addMessageToChatHistory(`✅ Executed ${cmd.agent}.${cmd.action}`, 'agent');
        }
    }

    return cmds;

}

export { handleUserPrompt };
