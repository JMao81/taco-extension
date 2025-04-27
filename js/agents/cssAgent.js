// js/agents/cssAgent.js
// Module for applying CSS-based styling/themes to the dashboard preview

import { brandingOptions } from '../brandingOptions.js';

/**
 * Apply a predefined theme style by name.
 * @param {string} themeName - key of the theme in brandingOptions
 */
export function applyThemeStyle(themeName) {
  const theme = brandingOptions[themeName];
  if (!theme) {
    window.logMessage(`applyThemeStyle: theme '${themeName}' not found`);
    return;
  }

  // Body background
  document.body.style.backgroundColor = theme.background;

  // Header
  const header = document.querySelector('.header');
  if (header) {
    header.style.backgroundColor = theme.headerBg || '';
    if (theme.headerGradient) {
      header.style.backgroundImage = theme.headerGradient;
    } else {
      header.style.backgroundImage = '';
    }
  }

  // Subheader
  const subheader = document.querySelector('.subheader');
  if (subheader) {
    subheader.style.backgroundColor = theme.subheaderBg || '';
    if (theme.subheaderGradient) {
      subheader.style.backgroundImage = theme.subheaderGradient;
    } else {
      subheader.style.backgroundImage = '';
    }
    subheader.style.borderTop = theme.subheaderBorderTopBottom || '';
    subheader.style.borderBottom = theme.subheaderBorderTopBottom || '';
    subheader.style.boxShadow = theme.subheaderBorderBoxShadow || '';
  }

  // Sidebar
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.style.backgroundColor = theme.sidebarMenu || '';
    if (theme.sidebarMenuGradient) {
      sidebar.style.backgroundImage = theme.sidebarMenuGradient;
    } else {
      sidebar.style.backgroundImage = '';
    }
  }

  // Footer
  const footer = document.querySelector('.footer');
  if (footer) {
    footer.style.backgroundColor = theme.footerBg || '';
    footer.style.boxShadow = theme.footerBorderBoxShadow || '';
  }

  // Global text colors
  document.body.style.color = theme.text || '';
  const allText = document.querySelectorAll('.text, .message');
  allText.forEach(el => {
    el.style.color = theme.text || '';
  });

  // Links and menu items
  const links = document.querySelectorAll('.sidebar a');
  links.forEach(a => {
    a.style.color = theme.links || '';
  });

  window.logMessage(`Theme '${themeName}' applied.`);
}
