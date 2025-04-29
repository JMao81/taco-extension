// js/agents/htmlAgent.js
'use strict';

import { logoLibrary } from '../brandingOptions.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Generic Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List available logos (returns array of {index, name})
 */
export function listLogos() {
  return logoLibrary.map((l, i) => ({ index: i + 1, name: l.name }));
}

/**
 * Add or replace the logo in the header
 * @param {{ choice: number|string }} opts
 *    choice: either the 1-based index, or the exact name
 */
export function addLogo(opts) {
  // resolve URL
  let entry;
  if (typeof opts.choice === 'number') {
    entry = logoLibrary[opts.choice - 1];
  } else {
    entry = logoLibrary.find(l => l.name.toLowerCase() === opts.choice.toLowerCase());
  }
  if (!entry) {
    console.warn("htmlAgent.addLogo: unknown choice", opts.choice);
    return;
  }

  // find or create img
  let img = document.querySelector('.header .taco-logo');
  if (!img) {
    img = document.createElement('img');
    img.className = 'taco-logo';
    // default to top-left
    img.style.position = 'absolute';
    img.style.top = '8px';
    img.style.left = '8px';
    img.style.height = '40px';
    document.querySelector('.header').appendChild(img);
  }
  img.src = entry.url;
  window.logMessage(`htmlAgent: addLogo("${entry.name}")`);
}

/**
 * Move the logo within the header
 * @param {{ top?:string, left?:string, right?:string, bottom?:string }} pos
 */
export function moveLogo(pos) {
  const img = document.querySelector('.header .taco-logo');
  if (!img) {
    console.warn("htmlAgent.moveLogo: no logo present");
    return;
  }
  Object.assign(img.style, pos);
  window.logMessage(`htmlAgent: moveLogo(${JSON.stringify(pos)})`);
}

/**
 * Remove the logo
 */
export function removeLogo() {
  const img = document.querySelector('.header .taco-logo');
  if (img) {
    img.remove();
    window.logMessage("htmlAgent: removeLogo()");
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
export function addHeader(text) {
  setSectionText('.header', text);
}

/** Alias for addHeader */
export function updateHeader(text) {
  // Try both your preview container and real-dashboard container
  const headerEl =
    document.querySelector('#real-dashboard .header') ||
    document.querySelector('.header');

  // alert('htmlAgent.updateHeader:', { text, found: !!headerEl, headerEl });

  if (headerEl) {
    headerEl.textContent = text;
  }
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
export function setSidebarContent(html) {
  const el = document.querySelector('.sidebar');
  if (el) {
    el.innerHTML = html;
  } else {
    window.logMessage('htmlAgent: setSidebarContent – .sidebar not found');
  }
}

/** Hide the sidebar */
export function hideSidebar() {
  toggleVisibility('.sidebar', false);
}

/** Show the sidebar */
export function showSidebar() {
  toggleVisibility('.sidebar', true);
}
