// js/agents/cssAgent.js
import { brandingOptions } from '../brandingOptions.js';


// ─────────────────────────────────────────────────────────────────────────────
//  Theme application (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a predefined theme style by name.
 * @param {string} themeName
 */
export function applyThemeStyle(themeName) {
    const theme = brandingOptions[themeName];
    if (!theme) {
        return window.logMessage(`cssAgent: applyThemeStyle – theme '${themeName}' not found`);
    }

    const container = document.getElementById('taco-dashboard-container');
    if (!container) {
        return window.logMessage('cssAgent: applyThemeStyle – container not found');
    }

    // Helper to set or clear a style on a given selector *inside* the container
    const setStyle = (selector, prop, value) => {
        container.querySelectorAll(selector).forEach(el => {
            if (value != null && value !== '') el.style[prop] = value;
            else el.style.removeProperty(prop);
        });
    };

    // Container background
    container.style.backgroundColor = theme.background;

    // Header
    setStyle('.header', 'backgroundColor', theme.headerBg);
    setStyle('.header', 'backgroundImage', theme.headerGradient || '');
    setStyle('.header', 'color', theme.text);

    // Subheader
    setStyle('.subheader', 'backgroundColor', theme.subheaderBg);
    setStyle('.subheader', 'backgroundImage', theme.subheaderGradient || '');
    setStyle('.subheader', 'borderTop', theme.subheaderBorderTopBottom);
    setStyle('.subheader', 'borderBottom', theme.subheaderBorderTopBottom);
    setStyle('.subheader', 'boxShadow', theme.subheaderBorderBoxShadow);
    setStyle('.subheader', 'color', theme.subtext);

    // Sidebar
    setStyle('.sidebar', 'backgroundColor', theme.sidebarMenu);
    setStyle('.sidebar', 'backgroundImage', theme.sidebarMenuGradient || '');
    setStyle('.sidebar a', 'color', theme.links);

    // Main content
    setStyle('.main-content', 'backgroundColor', theme.mainBg || '');

    // Footer
    setStyle('.footer', 'backgroundColor', theme.footerBg);
    setStyle('.footer', 'boxShadow', theme.footerBorderBoxShadow);
    setStyle('.footer', 'color', theme.text);

    // Global text inside container
    setStyle('#taco-dashboard-container', 'color', theme.text);

    window.logMessage(`cssAgent: theme '${themeName}' applied to dashboard container`);
}


// ─────────────────────────────────────────────────────────────────────────────
//  Customization APIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set the logo’s width or height
 * @param {{ dimension: "width"|"height", value:string }} opts
 */
export function setLogoSize(opts) {
    const img = document.querySelector('.header .taco-logo');
    if (!img) {
        console.warn("cssAgent.setLogoSize: no logo present");
        return;
    }
    img.style[opts.dimension] = opts.value;
    window.logMessage(`cssAgent: setLogoSize(${opts.dimension}=${opts.value})`);
}

/** Change the sidebar background color */
export function setSidebarColor(color) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll('.sidebar').forEach(el => el.style.backgroundColor = color);
    window.logMessage(`cssAgent: setSidebarColor(${color})`);
}

/** Change the overall container background */
// export function setBackground(color) {
//     const c = document.getElementById('taco-dashboard-container');
//     if (c) c.style.backgroundColor = color;
//     window.logMessage(`cssAgent: setBackground(${color})`);
// }


export function setBackgroundColor(selector, color) {
    document.querySelectorAll(selector)
        .forEach(el => el.style.backgroundColor = color);
    window.logMessage(`cssAgent: setBackgroundColor(${selector}, ${color})`);
}


/** Change text color of any selector */
export function setTextColor(selector, color) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll(selector).forEach(el => el.style.color = color);
    window.logMessage(`cssAgent: setTextColor(${selector}, ${color})`);
}

/** Apply a gradient to text via CSS `background-clip` */
export function setTextGradient(selector, gradient) {
    document.querySelectorAll(selector).forEach(el => {
        el.style.backgroundImage = gradient;
        el.style.webkitBackgroundClip = 'text';
        el.style.webkitTextFillColor = 'transparent';
    });
    window.logMessage(`cssAgent: setTextGradient(${selector}, ${gradient})`);
}

/** Set font size (e.g. "16px") */
export function setFontSize(selector, size) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll(selector).forEach(el => el.style.fontSize = size);
    window.logMessage(`cssAgent: setFontSize(${selector}, ${size})`);
}

/** Set font style or weight: "italic", "bold", or a font-family */
export function setFontStyle(selector, style) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll(selector).forEach(el => {
        if (style === 'bold') el.style.fontWeight = 'bold';
        else if (['italic', 'normal', 'oblique'].includes(style)) el.style.fontStyle = style;
        else el.style.fontFamily = style;
    });
    window.logMessage(`cssAgent: setFontStyle(${selector}, ${style})`);
}

/** Adjust margin/padding: prop = "marginTop","padding","margin", etc. */
export function setSpacing(selector, prop, value) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll(selector).forEach(el => el.style[prop] = value);
    window.logMessage(`cssAgent: setSpacing(${selector}, ${prop}, ${value})`);
}

/** Set explicit width/height */
export function setSize(selector, width, height) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll(selector).forEach(el => {
        if (width) el.style.width = width;
        if (height) el.style.height = height;
    });
    window.logMessage(`cssAgent: setSize(${selector}, w=${width}, h=${height})`);
}

/** Set a border color */
export function setBorderColor(selector, color) {
    document.querySelectorAll(selector)
        .forEach(el => el.style.borderColor = color);
    window.logMessage(`cssAgent: setBorderColor(${selector}, ${color})`);
}

/** Set the full CSS border spec or just width */
export function setBorderWidth(selector, width) {
    document.querySelectorAll(selector)
        .forEach(el => el.style.borderWidth = width);
    window.logMessage(`cssAgent: setBorderWidth(${selector}, ${width})`);
}

/** Set rounded corners (e.g. "8px") */
export function setBorderRadius(selector, radius) {
    const c = document.getElementById('taco-dashboard-container');
    c?.querySelectorAll(selector).forEach(el => el.style.borderRadius = radius);
    window.logMessage(`cssAgent: setBorderRadius(${selector}, ${radius})`);
}

export function setBackgroundGradient(selector, gradient) {
    document.querySelectorAll(selector)
        .forEach(el => el.style.backgroundImage = gradient);
    window.logMessage(`cssAgent: setBackgroundGradient(${selector}, ${gradient})`);
}

/**
 * Fluid sidebar layout modes:
 * "left" | "right" | "full-height"
 */
export function setSidebarLayout(mode) {
    const c = document.getElementById('taco-dashboard-container');
    if (!c) return;
    const map = {
        left: `"header header" "subheader subheader" "sidebar main" "footer footer"`,
        right: `"header header" "subheader subheader" "main sidebar" "footer footer"`,
        'full-height': `"sidebar header" "sidebar subheader" "sidebar main" "sidebar footer"`
    };
    const areas = map[mode];
    if (!areas) return window.logMessage(`cssAgent: unknown layout ${mode}`);
    c.style.display = 'grid';
    c.style.gridTemplateAreas = areas;
    c.style.gridTemplateRows = 'auto auto 1fr auto';
    c.style.gridTemplateColumns = (mode === 'full-height' ? '200px 1fr' : '250px 1fr');
    window.logMessage(`cssAgent: setSidebarLayout(${mode})`);
}