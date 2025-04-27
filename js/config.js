'use strict';
/**
 * Taco Extension Configuration 
 * This configuration dialog allows users to create tableau branding template
 */

// import { updateExtensionUI } from './uiUpdate.js';
// import { PreviewManager } from './modules/previewManager.js';
// import { GeneralSettingManager } from './modules/generalSettingManager.js';
// import { LogoSettingManager } from './modules/logoSettingManager.js';
// import { EditingManager } from './modules/editingManger.js';
// import themeManager from './modules/themeManager.js';
// import SidebarMenuEditor from './modules/SidebarMenuEditor.js';

import { handleUserPrompt } from './agents/masterAgent.js'; // Import the function from masterAgent.js

// Key used to store button configuration in Tableau settings.
$(document).ready(function () {
    // Initialize the configuration dialog.
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {

        logMessage("Dialog opened with payload: " + JSON.stringify(openPayload));
        // Show welcome message
        showWelcomeMessage();

        // Attach event listener for the Save button.
        $('#save-button').on('click', closeDialog);

        $('#cancel-button').on('click', function () {
            tableau.extensions.ui.closeDialog('cancel');
        });

        // // Retrieve and parse saved settings if available.
        const savedConfig = tableau.extensions.settings.get('tacoConfig');
        if (savedConfig) {

            const config = JSON.parse(savedConfig);
        }

    });

});

function showWelcomeMessage() {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) {
        console.error("chatHistory not found");
        return;
    }

    const welcomeText = "Hi! I'm TACO, your Dashboard Design Assistant. Tell me how you'd like to build your dashboard!";
    typeOutMessage(welcomeText, chatHistory, 'agent', 30);

    logMessage("Welcome message typing animation started.");
}

function typeOutMessage(text, container, who = 'agent', speed = 50) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${who}`;
    container.appendChild(msgDiv);

    // Create a cursor span
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    msgDiv.appendChild(cursor);

    let i = 0;
    const interval = setInterval(() => {
        // On first char, replace cursor with text+cursor
        msgDiv.textContent = text.slice(0, i + 1);
        msgDiv.appendChild(cursor);
        i++;
        container.scrollTop = 0; // keep newest visible

        if (i === text.length) {
            clearInterval(interval);
            cursor.remove(); // remove blinking cursor
        }
    }, speed);
}

/**
 * Saves the configuration to the extension settings and closes the dialog.
 */
function closeDialog() {

    let config = {};

    // Save the configuration as a JSON string.
    tableau.extensions.settings.set('tacoConfig', JSON.stringify(config));
    tableau.extensions.settings.saveAsync().then(() => {
        // Close the dialog and pass back a payload indicating success.
        tableau.extensions.ui.closeDialog('config_saved');
        logMessage("Configuration saved: " + JSON.stringify(config));

    }).catch((error) => {
        alert("Error saving configuration: " + error.message);
    });
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


window.submitPrompt = submitPrompt;
window.logMessage = logMessage;  


