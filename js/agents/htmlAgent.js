// js/agents/htmlAgent.js
// Helper functions for modifying HTML elements in the dashboard preview

/**
 * Add or replace the header text
 * @param {string} text
 */
export function addHeader(text) {
    const headerEl = document.querySelector('.header');
    if (headerEl) {
      headerEl.textContent = text;
      headerEl.style.display = '';
    } else {
      window.logMessage('addHeader: .header element not found');
    }
  }
  
  /**
   * Update header text (alias for addHeader)
   * @param {string} text
   */
  export function updateHeader(text) {
    addHeader(text);
  }
  
  /**
   * Remove or hide the header element
   */
  export function deleteHeader() {
    const headerEl = document.querySelector('.header');
    if (headerEl) {
      headerEl.remove();
    } else {
      console.warn('deleteHeader: .header element not found');
    }
  }
  
  /**
   * Show the header area (if hidden)
   */
  export function showHeader() {
    let headerEl = document.querySelector('.header');
    if (!headerEl) {
      headerEl = document.createElement('div');
      headerEl.className = 'header';
      headerEl.textContent = 'Header Area';     // or store your default text elsewhere
      document.querySelector('.preview-dashboard')
        .prepend(headerEl);
    }
    headerEl.style.display = '';
  }
  
  /**
   * Add or replace the subheader text
   * @param {string} text
   */
  export function addSubheader(text) {
    let subheaderEl = document.querySelector('.subheader');
    if (!subheaderEl) {
      subheaderEl = document.createElement('div');
      subheaderEl.className = 'subheader';
      // Insert subheader after header
      const headerEl = document.querySelector('.header');
      if (headerEl && headerEl.parentNode) {
        headerEl.parentNode.insertBefore(subheaderEl, headerEl.nextSibling);
      } else {
        document.body.prepend(subheaderEl);
      }
    }
    subheaderEl.textContent = text;
    subheaderEl.style.display = '';
  }
  
  /**
   * Update subheader text (alias for addSubheader)
   * @param {string} text
   */
  export function updateSubheader(text) {
    addSubheader(text);
  }
  
  /**
   * Remove or hide the subheader element
   */
  export function deleteSubheader() {
    const subheaderEl = document.querySelector('.subheader');
    if (subheaderEl) {
      subheaderEl.remove();
    } else {
      console.warn('deleteSubheader: .subheader element not found');
    }
  }
  
  /**
   * Show the subheader area (if hidden)
   */
  export function showSubheader() {
    const subheaderEl = document.querySelector('.subheader');
    if (subheaderEl) {
      subheaderEl.style.display = '';
    } else {
      console.warn('showSubheader: .subheader element not found');
    }
  }
  
  /**
   * Hide the footer area
   */
  export function hideFooter() {
    const footerEl = document.querySelector('.footer');
    if (footerEl) {
      footerEl.style.display = 'none';
    } else {
      console.warn('hideFooter: .footer element not found');
    }
  }
  
  /**
   * Show the footer area
   */
  export function showFooter() {
    const footerEl = document.querySelector('.footer');
    if (footerEl) {
      footerEl.style.display = '';
    } else {
      console.warn('showFooter: .footer element not found');
    }
  }
  
  /**
   * Replace sidebar content (HTML string)
   * @param {string} html
   */
  export function setSidebarContent(html) {
    const sidebarEl = document.querySelector('.sidebar');
    if (sidebarEl) {
      sidebarEl.innerHTML = html;
    } else {
      console.warn('setSidebarContent: .sidebar element not found');
    }
  }
  
  /**
   * Hide the sidebar
   */
  export function hideSidebar() {
    const sidebarEl = document.querySelector('.sidebar');
    if (sidebarEl) {
      sidebarEl.style.display = 'none';
    } else {
      console.warn('hideSidebar: .sidebar element not found');
    }
  }
  
  /**
   * Show the sidebar
   */
  export function showSidebar() {
    const sidebarEl = document.querySelector('.sidebar');
    if (sidebarEl) {
      sidebarEl.style.display = '';
    } else {
      console.warn('showSidebar: .sidebar element not found');
    }
  }