// js/agents/htmlAgent.js
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  Generic Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
  addHeader(text);
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
