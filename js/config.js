'use strict';
/**
 * Taco Extension Configuration 
 * This configuration dialog allows users to create tableau branding template
 */

import { handleUserPrompt as originalHandle } from './agents/masterAgent.js'; // Import the function from masterAgent.js
import * as htmlAgent from './agents/htmlAgent.js';
import * as cssAgent from './agents/cssAgent.js';
// import * as jsAgent from './agents/jsAgent.js';
import { brandingOptions } from './brandingOptions.js';

const tacoConfig = [];

// Constants for the dashboard size
const dashboardWidth = 1540;
const dashboardHeight = 980;

// Key used to store button configuration in Tableau settings.
$(document).ready(function () {
    // Initialize the configuration dialog.
    tableau.extensions.initializeDialogAsync().then(function () {

        // // Retrieve and parse saved settings if available.
        const savedConfig = tableau.extensions.settings.get('tacoConfig');
        logMessage("Saved config: " + savedConfig);

        if (savedConfig) {
            try {
                const cmds = JSON.parse(savedConfig);
                try {
                    cmds.forEach(cmd => {
                        // Validate the command structure
                        if (cmd.agent && cmd.action) {
                            if (
                                cmd.agent === 'htmlAgent' &&
                                cmd.action === 'listLogos'
                            ) {
                                logMessage("Skip Listing logos...");
                            }
                            else {
                                dispatchCommand(cmd); // replay into preview
                            }
                        } else {
                            logMessage(`Invalid command structure: ${JSON.stringify(cmd)}`);
                        }
                    });
                }
                catch (e) {
                    logMessage(`Error replaying command: ${e.message}`);
                }

            } catch (e) {
                console.error("Failed to replay saved config:", e);
            }
        }

        // Show welcome message
        showWelcomeMessage();

        // Scale preview on load
        rescalePreview();

        // Whenever the window resizes, re-scale
        window.addEventListener('resize', rescalePreview);

        // Attach event listener for the Save button.
        $('#save-button').on('click', closeDialog);
        $('#cancel-button').on('click', function () {
            tableau.extensions.ui.closeDialog('cancel');
        });

        const inputEl = document.getElementById('userPrompt');
        inputEl.addEventListener('keydown', function (e) {
            // If Enter is pressed **without** Shift (so you can still do multi-line with Shift+Enter)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitPrompt();
            }
        });

    });

});

// ─────────────────────────────────────────────────────────────────────────────
// Dispatch a single {agent,action,payload} to the right module
// ─────────────────────────────────────────────────────────────────────────────
function dispatchCommand(cmd) {
    const modules = { htmlAgent, cssAgent /*, jsAgent*/ };
    const fn = modules[cmd.agent]?.[cmd.action];
    if (typeof fn !== 'function') {
        return logMessage(`Unknown command: ${cmd.agent}.${cmd.action}`);
    }

    // figure out args...
    const args = Array.isArray(cmd.payload)
        ? cmd.payload
        : [cmd.payload];

    // call it and capture any returned payload
    const result = fn(...args);

    // if the agent helper returned a new payload object, use that
    if (result && typeof result === 'object') {
        cmd = { ...cmd, payload: result };
    }

    // now push the updated cmd
    tacoConfig.push(cmd);
    logMessage(`Recorded command: ${JSON.stringify(cmd)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Persist and close
// ─────────────────────────────────────────────────────────────────────────────
async function closeDialog() {

    try {
        const toSave = pruneCommands(tacoConfig);
        // alert(`Saving tabConfig`+ JSON.stringify(toSave));
        await tableau.extensions.settings.set('tacoConfig', JSON.stringify(toSave));
        await tableau.extensions.settings.saveAsync();
        tableau.extensions.ui.closeDialog('config_saved');
        // alert(`Configuration saved (${tacoConfig.length} commands)`);
    } catch (e) {
        alert("Error saving configuration: " + e.message);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat & Preview Helpers
// ─────────────────────────────────────────────────────────────────────────────
function logMessage(message) {
    const logEl = document.getElementById('debugLog');
    if (logEl) {
        const titleHTML = "Debug Log:<br>"; // Your constant title.
        const timestamp = new Date().toLocaleTimeString();
        const newMsg = `<div>[${timestamp}] ${message}</div>`;
        // Remove the title from the existing content (if it exists) and then re-prepend it.
        let currentLogs = logEl.innerHTML.replace(titleHTML, "");
        logEl.innerHTML = titleHTML + newMsg + currentLogs;
    }
}

function submitPrompt() {
    const inputEl = document.getElementById('userPrompt');
    const userPrompt = inputEl.value.trim();
    if (!userPrompt) return;

    inputEl.value = '';
    inputEl.focus();
    handleUserPrompt(userPrompt);
}

async function handleUserPrompt(userPrompt) {
    // pass to your master agent, get back the parsed cmd(s)
    const cmds = await originalHandle(userPrompt);
    if (!cmds) return;

    // normalize to array
    const list = Array.isArray(cmds) ? cmds : [cmds];
    for (const cmd of list) {
        if (cmd.agent !== 'none' && cmd.action !== 'listLogos') {
            tacoConfig.push(cmd);
        }
    }
}

function rescalePreview() {
    logMessage("Rescaling preview...");
    const container = document.getElementById('previewContainer');

    //Compute uniform scale factor
    const scale = 0.6;
    //const scale = Math.min(availW / DASHBOARD_W, availH / DASHBOARD_H);

    //Apply it
    container.style.width = `${dashboardWidth}px`;
    container.style.height = `${dashboardHeight}px`;
    container.style.transformOrigin = '0 0';
    container.style.transform = `scale(${scale})`;
}

async function showWelcomeMessage() {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) return;

    // 1) First line with typing animation
    const firstLine = "👋 Hi! I'm TACO, your Dashboard Design Assistant. Tell me how you'd like to build your dashboard!";
    await typeOutMessage(firstLine, chatHistory, 'agent', 30);

    // 2) Then build a nested UL for the rest
    const themes = Object.keys(brandingOptions).slice(0, 5); // pick first 3 as example
    const themeItems = themes
        .map(t => `<li>Apply ${t} theme</li>`)
        .join('');

    const html = `
      <span>You can ask me to: </span>
      <ul style="margin-top:8px;">
        <li>
          Apply a theme to the dashboard:
          <ul>
            ${themeItems}
          </ul>
        </li>
        <li>Move the navigation bar to the right</li>
        <li>Add a dashboard title to the header</li>
        <li>Hide the footer</li>
        <li>Ask me to recommend a text color or font face</li>
      </ul>
      <p style="margin-top:8px;font-size:12px;color:#666;">
        (Feel free to swap in any of our ${Object.keys(brandingOptions).length} themes,
        tweak layout, or hide/show elements.)
      </p>
    `.trim();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'message agent';
    msgDiv.innerHTML = html;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    logMessage("Welcome message typing animation started.");
}

function typeOutMessage(text, container, who = 'agent', speed = 50) {
    return new Promise(resolve => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${who}`;
        container.appendChild(msgDiv);

        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        msgDiv.appendChild(cursor);

        let i = 0;
        const interval = setInterval(() => {
            msgDiv.textContent = text.slice(0, i + 1);
            msgDiv.appendChild(cursor);
            i++;
            container.scrollTop = container.scrollHeight;

            if (i === text.length) {
                clearInterval(interval);
                cursor.remove();
                resolve();            // <-- Resolve the Promise here
            }
        }, speed);
    });
}

const agentModules = { htmlAgent, cssAgent /*, jsAgent*/ };

/**
 * Deduplicate + clean up the tacoConfig command array.
 * • Logos: only the very last addLogo (drops any earlier once removeLogo is seen).
 * • MenuItems: only the very last addMenuItem per normalized name;
 *   removeMenuItem(name) will purge any prior addMenuItem for that same normalized name.
 * • All other agent.action(+selector) combos: keep only the last one.
 */
export function pruneCommands(commands) {
    const seen = new Map();
    let sawRemoveLogo = false;

    // helper to normalize menu-item names into a consistent key
    const normalizeName = name =>
        String(name || '')
            .trim()
            .toLowerCase();

    // walk from newest → oldest
    for (let i = commands.length - 1; i >= 0; --i) {
        const { agent, action, payload } = commands[i];

        // —— removeLogo clears all earlier addLogo
        if (agent === 'htmlAgent' && action === 'removeLogo') {
            sawRemoveLogo = true;
            for (let key of seen.keys()) {
                if (key.startsWith('htmlAgent::addLogo::')) seen.delete(key);
            }
            // keep the removeLogo itself
        }

        // —— removeMenuItem clears earlier adds for that name
        if (
            agent === 'htmlAgent' &&
            action === 'removeMenuItem' &&
            payload?.name
        ) {
            const nm = normalizeName(payload.name);
            for (let key of seen.keys()) {
                if (key === `htmlAgent::addMenuItem::${nm}`) {
                    seen.delete(key);
                }
            }
            // keep this removeMenuItem so you could re-add later
        }

        // build dedupe key
        let key = `${agent}::${action}`;

        // —— unify all addLogo under one key (unless a removeLogo came later)
        if (agent === 'htmlAgent' && action === 'addLogo') {
            if (sawRemoveLogo) {
                continue; // drop any addLogo older than a removeLogo
            }
            key = 'htmlAgent::addLogo';
        }

        // —— dedupe addMenuItem by normalized name
        if (
            agent === 'htmlAgent' &&
            action === 'addMenuItem' &&
            payload?.name
        ) {
            const nm = normalizeName(payload.name);
            key = `htmlAgent::addMenuItem::${nm}`;
        }

        // —— everything else, include selector or first payload element
        if (
            payload != null &&
            typeof payload === 'object' &&
            !['addLogo', 'removeLogo', 'addMenuItem', 'removeMenuItem'].includes(action)
        ) {
            if ('selector' in payload) {
                key += `::${payload.selector}`;
            } else if (
                Array.isArray(payload) &&
                typeof payload[0] === 'string'
            ) {
                key += `::${payload[0]}`;
            }
        }

        // if we haven't yet kept one under this key, keep it
        if (!seen.has(key)) {
            seen.set(key, commands[i]);
        }
    }

    // return in original (oldest→newest) order
    return Array.from(seen.values()).reverse();
}


// expose to HTML
window.handleUserPrompt = handleUserPrompt;
window.submitPrompt = submitPrompt;
window.logMessage = logMessage;


