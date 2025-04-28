'use strict';
/**
 * Taco Extension Configuration 
 * This configuration dialog allows users to create tableau branding template
 */

import { handleUserPrompt as originalHandle } from './agents/masterAgent.js'; // Import the function from masterAgent.js
import { brandingOptions } from './brandingOptions.js';
import * as htmlAgent from './agents/htmlAgent.js';
import * as cssAgent  from './agents/cssAgent.js';

const tacoConfig = [];

// Constants for the dashboard size
const dashboardWidth = 1540;
const dashboardHeight = 980;

// Key used to store button configuration in Tableau settings.
$(document).ready(function () {
    // Initialize the configuration dialog.
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {

        logMessage("Dialog opened with payload: " + JSON.stringify(openPayload));

        // // Retrieve and parse saved settings if available.
        const savedConfig = tableau.extensions.settings.get('tacoConfig');
        if (savedConfig) {
            try {
                const cmds = JSON.parse(savedConfig);
                cmds.forEach(c => dispatchCommand(c));
                tacoConfig.push(...cmds);  // prime our array so further saves include them
                logMessage(`Replayed ${cmds.length} saved commands`);
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

    });

});

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
    const firstLine = "Hi! 👋 I'm TACO, your Dashboard Design Assistant. Tell me how you'd like to build your dashboard!";
    await typeOutMessage(firstLine, chatHistory, 'agent', 30);

    // 2) Then build a nested UL for the rest
    const themes = Object.keys(brandingOptions).slice(0, 3); // pick first 3 as example
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

/**
 * Saves the configuration to the extension settings and closes the dialog.
 */
async function closeDialog() {

    try {
        await tableau.extensions.settings.set('tacoConfig', JSON.stringify(tacoConfig));
        await tableau.extensions.settings.saveAsync();
        tableau.extensions.ui.closeDialog('config_saved');
        logMessage(`Configuration saved (${tacoConfig.length} commands)`);
    } catch (e) {
        alert("Error saving configuration: " + e.message);
    }
}

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

    // 3. Pass the prompt off to your master agent
    handleUserPrompt(userPrompt);
}

async function handleUserPrompt(userPrompt) {

    const cmd = await originalHandle(userPrompt);
    if (cmd && cmd.agent && cmd.agent !== 'none') {
        tacoConfig.push(cmd);
        logMessage(`Recorded command: ${JSON.stringify(cmd)}`);
    }

    return; // everything else handled inside originalHandle
}

function dispatchCommand(cmd) {
    const modules = { htmlAgent, cssAgent /*, jsAgent */ };
    const fn = modules[cmd.agent]?.[cmd.action];
    if (!fn) {
        console.warn(`Unknown command ${cmd.agent}.${cmd.action}`);
        return;
    }
    // support array or object payloads
    const args = Array.isArray(cmd.payload)
        ? cmd.payload
        : cmd.payload && typeof cmd.payload === 'object'
            ? Object.values(cmd.payload)
            : [cmd.payload];
    fn(...args);
}

window.handleUserPrompt = handleUserPrompt;
window.submitPrompt = submitPrompt;
window.logMessage = logMessage;


