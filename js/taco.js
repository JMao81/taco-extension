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
      // console.log('Extension initialized, loading dashboard');
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
  if (typeof fn !== 'function') {
    console.warn(`Unknown command: ${cmd.agent}.${cmd.action}`);
    return;
  }

  let args;
  if (Array.isArray(cmd.payload)) {
    // positional array → spread
    args = cmd.payload;
  } else if (
    cmd.payload !== null &&
    typeof cmd.payload === 'object'
  ) {
    // single‐object payload → pass it as one argument
    args = [cmd.payload];
  } else {
    // primitive → wrap
    args = [cmd.payload];
  }

  fn(...args);
}

/**
 * Load & replay all saved commands
 */
/**
 * Load & replay all saved commands
 */
function dispatchAllSaved() {
  const saved = tableau.extensions.settings.get(CONFIG_KEY);
  if (!saved) {
    console.warn('No saved config to replay');
    return;
  }

  let raw;
  try {
    raw = JSON.parse(saved);
  } catch (e) {
    console.error('Invalid tacoConfig JSON', e);
    return;
  }

  // 1) prune duplicates / removals
  const cleaned = pruneCommands(raw);

  // 2) clear out dynamic containers so we don’t double-up
  //    (sidebar menu items, logos, etc.)
  const navTop = document.querySelector('.sidebar .nav-top');
  if (navTop) navTop.innerHTML = '';

  const header = document.querySelector('.header');
  if (header) {
    // remove any previously injected logos
    header.querySelectorAll('.taco-logo, .taco-logo-wrapper').forEach(el => el.remove());
  }

  // 3) replay the *cleaned* list
  cleaned.forEach((cmd, i) => {
    try {
      dispatchCommand(cmd);
    } catch (err) {
      console.error(`Failed dispatching command #${i + 1}`, cmd, err);
    }
  });
}

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

