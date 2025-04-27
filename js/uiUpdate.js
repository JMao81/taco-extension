'use strict';

/**
 * Updates the extension UI based on the given configuration.
 * Applies data attributes and styles to update header, subheader, footer, logo, and menu items.
 *
 * @param {Object} config - The configuration object.
 * @param {string} [containerSelector='#dashboard-container'] - The selector for the target container.
 */
export function updateExtensionUI(config, containerSelector = '#dashboard-container') {
  const $container = $(containerSelector);

  // Use defaults if keys are undefined.
  const showHeader = (config.showHeader === undefined) ? true : config.showHeader;
  const showSubHeader = (config.showSubHeader === undefined) ? true : config.showSubHeader;
  const showNavbar = (config.showNavbar === undefined) ? true : config.showNavbar;
  const showLogo = (config.showLogo === undefined) ? true : config.showLogo;
  const showTopNavMenu = (config.showTopNavMenu === undefined) ? true : config.showTopNavMenu;
  const showBottomNavMenu = (config.showBottomNavMenu === undefined) ? true : config.showBottomNavMenu;
  const showVizGrid = (config.showVizGrid === undefined) ? true : config.showVizGrid;
  const showFooter = (config.showFooter === undefined) ? true : config.showFooter;

  // Set data attributes on the container for display settings.
  $container.attr('data-show-header', showHeader ? "true" : "false");
  $container.attr('data-show-subheader', showSubHeader ? "true" : "false");
  $container.attr('data-show-navbar', showNavbar ? "true" : "false");
  $container.attr('data-show-logo', showLogo ? "true" : "false");
  $container.attr('data-show-top-menu', showTopNavMenu ? "true" : "false");
  $container.attr('data-show-bottom-menu', showBottomNavMenu ? "true" : "false");
  $container.attr('data-show-vizgrid', showVizGrid ? "true" : "false");
  $container.attr('data-show-footer', showFooter ? "true" : "false");

  // Update logo position and menu items.
  updateLogoPosition(config, $container);
  updateMenuItems(config, $container);
  updateExportIcons(config, $container);

  // Update logo image.
  if (config.logoType === 'url' && config.logoURL) {
    $container.find('.logo-img').attr('src', config.logoURL).show();
  } else if (config.logoType === 'select' && config.selectedLogo) {
    $container.find('.logo-img').attr('src', './img/logo/' + config.selectedLogo).show();
  }

  // Update logo size once the image is loaded.
  const $logoImg = $container.find('.logo-img');
  if ($logoImg.length > 0) {
    $logoImg.one('load', function () {
      updateLogoSize(config, $container);
    });
    if ($logoImg[0].complete) {
      updateLogoSize(config, $container);
    }
  }

  // Update header, subheader, and footer content and styles.
  $container.find('.header-text')
    .html(config.header.html ? config.header.html : config.header.text)
    .css({
      'text-align': config.header.textAlign,
      'font-family': config.header.fontFamily,
      'font-size': config.header.fontSize,
      'font-weight': config.header.fontWeight,
      'font-style': config.header.fontStyle,
      'color': config.header.color,
      'text-decoration-line': config.header.textDecorationLine
    });

  $container.find('.subheader-text')
    .html(config.subheader.html ? config.subheader.html : config.subheader.text)
    .css({
      'text-align': config.subheader.textAlign,
      'font-family': config.subheader.fontFamily,
      'font-size': config.subheader.fontSize,
      'font-weight': config.subheader.fontWeight,
      'font-style': config.subheader.fontStyle,
      'color': config.subheader.color,
      'text-decoration-line': config.subheader.textDecorationLine
    });

  $container.find('.footer')
    .html(config.footer.html ? config.footer.html : config.footer.text)
    .css({
      'text-align': config.footer.textAlign,
      'font-family': config.footer.fontFamily,
      'font-size': config.footer.fontSize,
      'font-weight': config.footer.fontWeight,
      'font-style': config.footer.fontStyle,
      'color': config.footer.color,
      'text-decoration-line': config.footer.textDecorationLine
    });

  logMessage("UI Update: Extension UI updated with config: " + JSON.stringify(config));
}

function updateLogoPosition(config, $container) {
  const $logoElement = $container.find('.logo');
  $logoElement.detach();

  let targetSelector;
  switch (config.logoPosition) {
    case 'nav-top':
      targetSelector = '#logo-in-sidebar';
      updateElementOrder($container, '.logo-container', 0);
      break;
    case 'header-top-left':
      targetSelector = '#logo-in-header';
      updateElementOrder($container, '.logo-container', 1);
      updateElementOrder($container, '.header-text', 2);
      updateElementOrder($container, '.header-spacer', 3);
      break;
    case 'header-top-right':
      targetSelector = '#logo-in-header';
      updateElementOrder($container, '.logo-container', 3);
      updateElementOrder($container, '.header-spacer', 2);
      updateElementOrder($container, '.header-text', 1);
      break;
    case 'subheader-top-left':
      targetSelector = '#logo-in-subheader';
      updateElementOrder($container, '.logo-container', 1);
      updateElementOrder($container, '.subheader-text', 2);
      updateElementOrder($container, '.subheader-spacer', 3);
      break;
    case 'subheader-top-right':
      targetSelector = '#logo-in-subheader';
      updateElementOrder($container, '.logo-container', 3);
      updateElementOrder($container, '.subheader-spacer', 2);
      updateElementOrder($container, '.subheader-text', 1);
      break;
    default:
      targetSelector = '#logo-in-sidebar';
  }

  const $target = $container.find(targetSelector);
  if ($target.length) {
    $target.empty().append($logoElement);
    logMessage("Logo appended to " + targetSelector + ", count: " + $target.find('.logo').length);
  } else {
    $container.append($logoElement);
    logMessage("Target container '" + targetSelector + "' not found. Using fallback container.");
  }
}

function updateElementOrder($container, selector, orderValue) {
  $container.find(selector).css("order", orderValue);
}

function updateLogoSize(config, $container) {
  const $logoImg = $container.find('.logo-img');
  const $logoContainer = $container.find('#logo-in-header .logo, #logo-in-subheader .logo, #logo-in-sidebar .logo');

  let desiredHeight = config.logoSize || DEFAULT_LOGO_HEIGHT;

  if ($logoImg.length > 0 && $logoImg[0].naturalHeight > 0) {
    const naturalWidth = $logoImg[0].naturalWidth;
    const naturalHeight = $logoImg[0].naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;
    let desiredWidth = desiredHeight * aspectRatio;

    $logoContainer.css({
      width: desiredWidth + 'px',
      height: desiredHeight + 'px'
    });
    $logoImg.css({
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    });

    logMessage(`Dashboard update: desiredHeight=${desiredHeight}, aspectRatio=${aspectRatio.toFixed(2)}, desiredWidth=${desiredWidth.toFixed(0)}`);
  } else {
    $logoContainer.css({
      width: desiredHeight + 'px',
      height: desiredHeight + 'px'
    });
    $logoImg.css({
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    });
    logMessage("Dashboard update fallback: using square dimensions.");
  }
}

function updateMenuItems(config, $container) {
  // Check if menuItems is defined and is an array.
  if (!config.menuItems || !Array.isArray(config.menuItems)) {
    console.warn("No menuItems found in config.");
    return;
  }
  // Iterate over each menu item <li> in the top menu and sidebar bottom menu.
  $container.find('.nav-menu li, .sidebar-bottom-menu li').each(function (index) {
    const $li = $(this);
    const $link = $li.find('a').first();
    if (config.menuItems[index]) {
      const menuItem = config.menuItems[index];

      // Build HTML: if there's an icon, include it.
      let itemHTML = "";
      if (menuItem.showIcon && menuItem.icon) {
        itemHTML += `<i class="${menuItem.icon}"></i> `;
      }
      itemHTML += menuItem.text || "";
      $link.html(itemHTML);

      // Apply styles with fallback defaults.
      $link.css({
        'font-size': menuItem.fontSize || '',
        'font-family': menuItem.fontFamily || '',
        'font-weight': menuItem.fontWeight || '',
        'font-style': menuItem.fontStyle || '',
        'color': menuItem.color || ''
      });

      // Update URL and target if available.
      if (menuItem.url) {
        $link.attr('href', menuItem.url);
        $link.attr('target', menuItem.target || '_self');
      } else {
        $link.removeAttr('href');
        $link.removeAttr('target');
      }

      // Update visibility on the <li> element.
      $li.css('display', menuItem.visible === false ? 'none' : '');

      // Set active state.
      if (menuItem.active) {
        $link.addClass('active');
      } else {
        $link.removeClass('active');
      }
    }
  });
}

function updateExportIcons(config, $container) {
  if (config.enablePdfExport) {
    $container.find('.export-pdf').show();
  } else {
    $container.find('.export-pdf').hide();
  }
  if (config.enableImageExport) {
    $container.find('.export-image').show();
  } else {
    $container.find('.export-image').hide();
  }
}

function logMessage(message) {
  const logEl = document.getElementById('debug-log');
  if (logEl) {
    const titleHTML = "Debug Log:<br>";
    const timestamp = new Date().toLocaleTimeString();
    const newMsg = `<div>[${timestamp}] ${message}</div>`;
    let currentLogs = logEl.innerHTML.replace(titleHTML, "");
    logEl.innerHTML = titleHTML + newMsg + currentLogs;
  }
}
