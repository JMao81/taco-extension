// /js/agents/masterAgent.js
'use strict';

import { tacoPrompt } from '../tacoPrompt.js';
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
                content: tacoPrompt
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
    const url = `${azureOpenAIendpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview`;

    let summary;
    try {
        summary = summarizeCurrentStyles();
    } catch (error) {
        window.logMessage(`Error summarizing current styles: ${error.message}`);
        summary = "Could not summarize current styles.";
    }

    const payload = {
        model: deployment,
        messages: [
            {
                role: "system",
                content: `
                    You are TACO 🌮, the most enthusiastic Tableau dashboard designer you’ve ever met.
                    Answer in clear, concise natural language, but keep it warm, playful, but professional taco with appropriate taco-related metaphors.
                    Your job is to help users improve their Tableau dashboards by providing best-practice design guidance. 
                    If the user’s dashboard is dark-themed, you might say “Let’s spice up that dark canvas like a salsa on a taco shell…”
                    Incorporate their current styles: ${summary} and refer to the current dashboard settings (theme, header text, colors) and respond in concise bullet points.

                    When giving guidance, include the following if relevant:
                    • A complementary gradient suggestion (as a valid CSS linear-gradient)
                    • Recommended font sizes for: header, subheader, main body text, navigation, and footer (follow the best practices)
                    • Any color-pairing tips (e.g. “your bright yellow header would pop with a deep navy subheader”) (follow the best practices)
                    • An overall best-practice checklist (spacing, contrast, hierarchy)

                `.trim()
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
        logMessage(`Unknown command: ${cmd.agent}.${cmd.action}`);
        return;
    }

    let args;
    if (Array.isArray(cmd.payload)) {
        args = cmd.payload;
    } else if (cmd.payload && typeof cmd.payload === 'object') {
        // pass the object verbatim
        args = [cmd.payload];
    } else {
        args = [cmd.payload];
    }

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
/**
 * 
 * @returns {string} A summary of the current styles applied to the dashboard
 */
function summarizeCurrentStyles() {
    const raw = tableau.extensions.settings.get('tacoConfig');
    if (!raw) return "No custom styling applied yet.";
    let cmds;
    try { cmds = JSON.parse(raw); }
    catch { return "Could not parse current styling."; }

    // Build a few simple sentences:
    const parts = [];
    for (const c of cmds) {
        switch (c.agent + '.' + c.action) {
            case 'cssAgent.applyThemeStyle':
                parts.push(`Theme: ${c.payload}`);
                break;
            case 'htmlAgent.updateHeader':
                parts.push(`Header text: "${c.payload}"`);
                break;
            case 'cssAgent.setFontSize':
                parts.push(`Font size for ${c.payload[0]} is ${c.payload[1]}`);
                break;
            case 'cssAgent.setTextColor':
                parts.push(`Text color for ${c.payload[0]} is ${c.payload[1]}`);
                break;
            case 'cssAgent.setBackgroundColor':
                parts.push(`Background color for ${c.payload[0]} is ${c.payload[1]}`);
                break;
        }
    }
    return parts.length
        ? "Current styles: " + parts.join('; ') + "."
        : "No custom styling applied yet.";
}

/**
 * Return true if this looks like a best-practice / design guidance question
 */
function isBestPracticeQuestion(text) {
    const lead = /^(what|how|why|give|can|could|would|should)\b/i;
    const key = /\b(best|practice|tip|guideline|advice|suggestion|tableau|design|style|font|color|background|border)\b/i;
    return lead.test(text) && key.test(text);
}


// ─────────────────────────────────────────────────────────────────────────────
//  5) Main entrypoint
// ─────────────────────────────────────────────────────────────────────────────

let pendingConfirmation = null;    // holds NL summary of last guidance or recommendations

async function handleUserPrompt(userPrompt) {

    window.logMessage(`handleUserPrompt() called ➡️ "${userPrompt}"`);
    addMessageToChatHistory(userPrompt, 'user');
    document.getElementById('userPrompt').value = '';  // Clear input field

    // If the user just said “yes” and we have something to confirm…
    if (/^yes\b/i.test(userPrompt) && pendingConfirmation) {
        addMessageToChatHistory(userPrompt, 'user');
        showTacoTypingIndicator();
        try {
            // fire off the real change request
            const raw = await callTacoExpert(pendingConfirmation);
            hideTacoTypingIndicator();
            pendingConfirmation = null;        // clear it
            await processTacoResponse(raw);    // parse & dispatch as usual
        } catch (e) {
            hideTacoTypingIndicator();
            addMessageToChatHistory(`❌ API Error: ${e.message}`, 'agent');
        }
        return;
    }

    // 0) Check for "clear" or "restart" commands
    if (/\b(?:clear(?: chat(?: history)?)?|reset(?: chat)?|restart(?: chat)?)\b/i.test(userPrompt)) {
        clearChatHistory();
        return;
    }

    // 1) Greetings — only match if the input is exactly “hi”, “hello”, etc. (with optional trailing punctuation/whitespace)
    if (/^\s*(hi|hello|hey|what's up|whats up|sup)[!.,?\s]*$/i.test(userPrompt)) {
        addMessageToChatHistory(
            "🌮 Hello! I’m TACO, your Dashboard Design Assistant. What would you like to do today?",
            'agent'
        );
        return;
    }

    // Positive shout-outs (“Nice!”, “Awesome!”, “Thank you!”, etc.)
    if (/^\s*(nice|awesome|great|cool|thanks?|thank you)[!.\s]*$/i.test(userPrompt)) {
        addMessageToChatHistory(
            "🎉 Woohoo, glad you liked it! Anything else you’d like to taco-bout? 🌮",
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
    if (/^(what|how|why|give|can|could|would|should)\b/i.test(userPrompt)
        && /\b(best|practice|tip|guideline|advice|suggestion|tableau|design|color|font|style|footer|header|title)\b/i.test(userPrompt)
    ) {
        window.logMessage("Matched best-practice question: " + userPrompt);
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

    if (isBestPracticeQuestion(userPrompt)) {
        addMessageToChatHistory(userPrompt, 'user');
        showTacoTypingIndicator();
        try {
            const advice = await fetchBestPracticeGuidance(userPrompt);
            hideTacoTypingIndicator();

            // store it as a human‐readable summary (you can massage this as needed)
            pendingConfirmation = `Apply these recommendations: ${advice}`;

            // show to user and ask for confirmation
            addMessageToChatHistory(
                advice + `\n\nShall I apply these changes for you? (yes/no)`,
                'agent'
            );
        } catch (e) {
            hideTacoTypingIndicator();
            addMessageToChatHistory(`❌ Sorry, couldn’t fetch guidance.`, 'agent');
        }
        return;
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

    let jsonText = rawJson.trim()
        // remove leading ```json or ```
        .replace(/^```(?:json)?\s*/, '')
        // remove trailing ```
        .replace(/\s*```$/, '');;

    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        return addMessageToChatHistory("❌ I couldn't parse commands.", 'agent');
    }

    const cmds = Array.isArray(parsed) ? parsed : [parsed];
    for (const cmd of cmds) {

        window.logMessage(`Dispatching to ${cmd.agent}.${cmd.action}`);

        try {
            if (parsed.agent === 'none' && parsed.action === 'refuse') {
                // show the refusal text in chat and bail
                addMessageToChatHistory(parsed.payload, 'agent');
                hideTacoTypingIndicator();
                return;
            }
            else {

                dispatchCommand(cmd);

                // special case: listing menu items
                if (cmd.agent === 'htmlAgent' && cmd.action === 'listMenuItems') {
                    // call the function directly to get its JS return value:
                    const items = htmlAgent.listMenuItems();
                    if (items.length === 0) {
                        addMessageToChatHistory("No menu items found.", 'agent');
                    } else {
                        const lines = items.map(i => `${i.index}. ${i.text} → ${i.url}`);
                        addMessageToChatHistory("🗂️ Current menu items:\n" + lines.join("\n"), 'agent');
                    }
                    return;  // don’t continue dispatching
                }

                addMessageToChatHistory(`✅ Executed ${cmd.agent}.${cmd.action}`, 'agent');
            }
        }
        catch (e) {
            addMessageToChatHistory(`❌ Dispatch error: ${e.message}`, 'agent');
        }

    }

    return cmds;

}

export { handleUserPrompt };
