// js/agents/htmlAgent.js
'use strict';

import { logoLibrary } from '../brandingOptions.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Generic Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a list of logos (with images) in the chat and returns the raw list.
 */
export function listLogos() {
  const chatHistory = document.getElementById('chatHistory');
  if (!chatHistory) {
    return console.error('listLogos: chatHistory element not found');
  }

  // Build an <li> for each logo with an <img> thumbnail
  const itemsHtml = logoLibrary
    .map((logo, i) => {
      return `
        <li style="display:flex; align-items:center; margin:4px 0;">
          <img src="${logo.url}"
               alt="${logo.name}"
               style="width:24px; height:24px; object-fit:contain; margin-right:8px; border:1px solid #ccc; border-radius:4px;" />
          <strong>${i + 1}.</strong>&nbsp;${logo.name}
        </li>`;
    })
    .join('');

  // Create and append the message
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message agent';
  msgDiv.innerHTML = `
    <p>I have the following logos available:</p>
    <ul style="padding-left:20px; margin:0;">
      ${itemsHtml}
    </ul>
    <p>Which one would you like?</p>
  `;
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Also return the raw list in case the caller needs it
  return logoLibrary.map((l, i) => ({ index: i + 1, name: l.name }));
}

/**
 * Add a logo to the specified region (header or sidebar).
 * @param {{ choice: number|string, region?: "header"|"sidebar" }} options
 */
export function addLogo({ choice, region }) {
  const lib = logoLibrary[choice - 1];
  if (!lib) {
    return window.logMessage(`addLogo: no logo #${choice}`);
  }

  // Create the <img> element
  const img = document.createElement('img');
  img.src = lib.url;
  img.className = 'taco-logo';

  // Determine the parent container based on the region
  let parent;
  if (region === 'header') {
    parent = document.querySelector('.header');
  } else if (region === 'sidebar') {
    parent = document.querySelector('.sidebar');
  } else {
    // Default behavior: choose header if visible, else sidebar
    parent = document.querySelector('.header') || document.querySelector('.sidebar');
  }

  if (!parent) {
    return window.logMessage(`addLogo: no container found for region "${region || 'default'}"`);
  }

  // Append the logo to the determined parent container
  parent.appendChild(img);
  window.logMessage(`htmlAgent: addLogo("${lib.name}") into ${parent.tagName} (${region || 'default'})`);
}


/**
 * Move the logo within the header
 * @param {{ top?:string, left?:string, right?:string, bottom?:string }} opts
 */
export function moveLogo(spec = {}) {
  const wrapper = document.querySelector('.taco-logo');
  if (!wrapper) {
    return window.logMessage('htmlAgent.moveLogo: no logo to move');
  }
  // ensure wrapper is absolute inside its parent
  wrapper.style.position = 'absolute';
  Object.entries(spec).forEach(([k, v]) => {
    // only accept top/right/bottom/left
    if (['top', 'right', 'bottom', 'left'].includes(k)) {
      wrapper.style[k] = v;
    }
  });
  window.logMessage(`htmlAgent: moved logo to ${JSON.stringify(spec)}`);
}

/**
 * Remove the logo
 */
export function removeLogo() {
  const logo = document.querySelector('.taco-logo');
  if (logo) {
    logo.remove();
    window.logMessage('htmlAgent: Logo removed successfully.');
  } else {
    window.logMessage('htmlAgent: No logo found to remove.');
  }
}

/**
 * Set the textContent of the first matching selector, preserving all styles.
 */
function setSectionText(selector, text) {
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = text;
  } else {
    window.logMessage(`htmlAgent: setSectionText – ${selector} not found`);
  }
}

/**
 * Toggle an element’s visibility by setting style.display, preserving styles.
 */
function toggleVisibility(selector, shouldShow) {
  const el = document.querySelector(selector);
  if (el) {
    el.style.display = shouldShow ? '' : 'none';
  } else {
    window.logMessage(`htmlAgent: toggleVisibility – ${selector} not found`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Header
// ─────────────────────────────────────────────────────────────────────────────

/** Add or replace header text */
export function updateHeader(text) {
  const headerEl = document.querySelector('.header');
  if (!headerEl) {
    return window.logMessage('updateHeader: .header not found');
  }

  // 1) Remove any existing titles or paragraph placeholders
  headerEl.querySelectorAll('h1, p').forEach(el => el.remove());

  // 2) Create one dashboard-title
  const titleEl = document.createElement('h1');
  titleEl.className = 'dashboard-title';
  titleEl.textContent = text;

  // 3) If you have a logo-wrapper, insert title after it; otherwise prepend
  const logoWrapper = headerEl.querySelector('.taco-logo-wrapper');
  if (logoWrapper) {
    logoWrapper.insertAdjacentElement('afterend', titleEl);
  } else {
    headerEl.prepend(titleEl);
  }

  window.logMessage(`htmlAgent: updateHeader("${text}")`);
}


/**
 * Alias for updateHeader
 */
export function addHeader(text) {
  updateHeader(text);
}

/** Hide the header (does not remove it, preserves all styles) */
export function hideHeader() {
  toggleVisibility('.header', false);
}

/** Show the header again */
export function showHeader() {
  toggleVisibility('.header', true);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Subheader
// ─────────────────────────────────────────────────────────────────────────────

/** Add or replace subheader text; creates one if missing */
export function addSubheader(text) {
  let el = document.querySelector('.subheader');
  if (!el) {
    // create but do not apply any inline styles
    el = document.createElement('div');
    el.className = 'subheader';
    const header = document.querySelector('.header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(el, header.nextSibling);
    } else {
      document.querySelector('#previewContainer')?.prepend(el);
    }
  }
  el.textContent = text;
}

/** Alias for addSubheader */
export function updateSubheader(text) {
  addSubheader(text);
}

/** Hide the subheader */
export function hideSubheader() {
  toggleVisibility('.subheader', false);
}

/** Show the subheader */
export function showSubheader() {
  toggleVisibility('.subheader', true);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Footer
// ─────────────────────────────────────────────────────────────────────────────

/** Add or replace footer text; creates one if missing */
export function addFooter(text) {
  let el = document.querySelector('.footer');
  if (!el) {
    el = document.createElement('div');
    el.className = 'footer';
    document.querySelector('#previewContainer')?.appendChild(el);
  }
  el.textContent = text;
}

/** Alias for addFooter */
export function updateFooter(text) {
  addFooter(text);
}

/** Hide the footer */
export function hideFooter() {
  toggleVisibility('.footer', false);
}

/** Show the footer */
export function showFooter() {
  toggleVisibility('.footer', true);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sidebar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replace the entire sidebar inner HTML
 * @param {string} html
 */
/**
 * Update only the first top‐level <p> inside the sidebar.
 * If none exists, it will create one just above .nav-top.
 * @param {string} html — string of HTML (or plain text) to set inside that <p>
 */
export function setSidebarText(html) {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    return window.logMessage('htmlAgent.setSidebarText: .sidebar not found');
  }

  // select only a <p> that is a direct child of .sidebar
  let p = sidebar.querySelector(':scope > p');
  if (!p) {
    // no top‐level <p>—create it
    p = document.createElement('p');
    p.className = 'sidebar-text';  // optional, for your own styling
    // insert it immediately before the nav‐top container
    const navTop = sidebar.querySelector('.nav-top');
    if (navTop) sidebar.insertBefore(p, navTop);
    else sidebar.prepend(p);
  }

  p.innerHTML = html;
  window.logMessage(`htmlAgent: setSidebarText("${html}")`);
}

/** Hide the sidebar */
export function hideSidebar() {
  toggleVisibility('.sidebar', false);
}

/** Show the sidebar */
export function showSidebar() {
  toggleVisibility('.sidebar', true);
}

/**
 * Replace the entire main-content inner HTML
 * @param {string} html
 */
export function setMainContent(html) {
  const main = document.querySelector('.main-content');
  if (!main) return window.logMessage('setMainContent: .main not found');
  main.innerHTML = html;
  window.logMessage('htmlAgent: setMainContent(...)');
}

/**
 * List current sidebar menu items.
 * @returns {Array<{ index:number, name:string, url:string, icon:string, tooltip:string }>}
 */
export function listMenuItems() {
  const container = document.querySelector('.sidebar .nav-top');
  if (!container) return [];
  return Array.from(container.querySelectorAll('.menu-item a'))
    .map((a, i) => ({ index: i + 1, text: a.textContent.trim(), url: a.href }));
}

export function addMenuItem({ name, url = '#', tooltip = '', icon = '' }) {
  const container = document.querySelector('.sidebar .nav-top');
  if (!container) {
    console.warn('addMenuItem: .nav-top not found');
    return;
  }

  // create wrapper div instead of <li>
  const item = document.createElement('div');
  item.className = 'menu-item';

  const link = document.createElement('a');
  link.href = url;
  if (tooltip) link.title = tooltip;
  link.innerHTML = icon
    ? `<i class="${icon}"></i> ${name}`
    : name;

  item.appendChild(link);
  container.appendChild(item);
  window.logMessage(`htmlAgent: addMenuItem("${name}")`);
}

/**
 * Remove a menu‐item by name or by 1-based index.
 * @param {{ name?: string, index?: number }} opts
 */
export function removeMenuItem(opts) {
  // look up the container and its items
  const container = document.querySelector('.sidebar .nav-top');
  if (!container) {
    return window.logMessage('htmlAgent.removeMenuItem: .nav-top not found');
  }
  const items = Array.from(container.children);
  let nameToRemove;
  if (opts.name) {
    nameToRemove = opts.name;
  } else if (typeof opts.index === 'number') {
    const idx = opts.index - 1;
    if (idx < 0 || idx >= items.length) {
      return window.logMessage(`htmlAgent.removeMenuItem: invalid index ${opts.index}`);
    }
    // assume <a> textContent is the name
    nameToRemove = items[idx].textContent.trim();
  } else {
    return window.logMessage('htmlAgent.removeMenuItem: must supply name or index');
  }

  // actually find and remove the item whose text matches
  for (let el of items) {
    if (el.textContent.trim().startsWith(nameToRemove)) {
      container.removeChild(el);
      window.logMessage(`htmlAgent: removeMenuItem("${nameToRemove}")`);
      return;
    }
  }
  window.logMessage(`htmlAgent.removeMenuItem: "${nameToRemove}" not found`);
}