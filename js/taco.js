// taco.js
'use strict';

import * as htmlAgent from './agents/htmlAgent.js'
import * as cssAgent from './agents/cssAgent.js';
// import * as jsAgent   from './agents/jsAgent.js';

const CONFIG_KEY = 'tacoConfig';
const DASHBOARD_HTML = 'dashboardContainer.html'; // adjust path if needed

$(document).ready(function () {

  tableau.extensions
    .initializeAsync({ configure: showConfig })
    .then(() => {
      console.log('Extension initialized, loading dashboard');
      loadDashboardThenReplay();
    })
    .catch(err => console.error('Initialization error', err));
});

/**
 * Dispatch a single command {agent,action,payload} to the right module
 */
function dispatchCommand(cmd) {
  const modules = { htmlAgent, cssAgent /*, jsAgent */ };
  const fn = modules[cmd.agent]?.[cmd.action];
  // alert(`Dispatching ${cmd.agent}.${cmd.action}(${JSON.stringify(cmd.payload)})`);
  if (typeof fn !== 'function') {
    alert(`Unknown command: ${cmd.agent}.${cmd.action}`);
    return;
  }
  const args = Array.isArray(cmd.payload)
    ? cmd.payload
    : (cmd.payload && typeof cmd.payload === 'object')
      ? Object.values(cmd.payload)
      : [cmd.payload];
  fn(...args);
}

/**
 * Load & replay all saved commands
 */
function dispatchAllSaved() {
  const saved = tableau.extensions.settings.get(CONFIG_KEY);
  // alert("Retrieved tacoConfig:"+ JSON.stringify(saved));
  if (!saved) {
    console.warn('No saved config to replay');
    return;
  }
  let cmds;
  try {
    cmds = JSON.parse(saved);
    // alert("Parsed tacoConfig:"+ JSON.stringify(cmds));
  } catch (e) {
    return console.error('Invalid tacoConfig JSON', e);
  }

  cmds.forEach((cmd, i) => {
    try {
      // dispatch
      dispatchCommand(cmd);
      // log or alert each one
      // alert(`✅ [${i+1}/${cmds.length}] ${cmd.agent}.${cmd.action} → ${JSON.stringify(cmd.payload)}`);
    } catch (err) {
      console.error(`Failed dispatching command #${i+1}`, cmd, err);
    }
  });
  
}

/**
 * Fetch the dashboard HTML, inject it, then replay commands
 */
function loadDashboardThenReplay() {
  fetch(DASHBOARD_HTML)
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load ${DASHBOARD_HTML}`);
      return r.text();
    })
    .then(html => {
      document.getElementById('real-dashboard').innerHTML = html;
      dispatchAllSaved();
    })
    .catch(err => console.error(err));
}

/**
 * Open the config dialog; on save, replay again
 */
function showConfig() {
  tableau.extensions.ui
    .displayDialogAsync('./config.html', '', { width: 1420, height: 780 })
    .then(closePayload => {
      if (closePayload === 'config_saved') {
        // user saved new settings → reapply
        dispatchAllSaved();
      }
    })
    .catch(err => console.error('Config dialog error', err));
}

