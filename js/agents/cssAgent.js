// js/agents/cssAgent.js
import { brandingOptions } from '../brandingOptions.js';

const ROOT_ID = 'taco-dashboard-container';

// ——————————————————————————————————————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————————————————————————————————————

/**
 * Normalize a raw selector string:
 *  • If it starts with '.', '#', '[', '*' or is a bare tagName → leave it
 *  • Otherwise prepend '.' to treat it as a class
 */
function normalizeSelector(raw) {
    raw = (raw || '').trim();
    // treat "*" or "" as the container itself
    if (raw === '*' || raw === '') {
        return `#${ROOT_ID}`;
    }
    // auto-prefix bare names
    if (!raw.match(/^[.#\[]/)) raw = `.${raw}`;
    return raw;
}


/** Get the dashboard container element */
function getContainer() {
    const c = document.getElementById(ROOT_ID);
    if (!c) window.logMessage(`cssAgent: container "#${ROOT_ID}" not found`);
    return c;
}

/** Run fn(el) for each el matching selector *inside* the container */
function forEachInContainer(selector, fn) {
    const c = getContainer();
    if (!c) return;
    c.querySelectorAll(selector).forEach(fn);
}

// ——————————————————————————————————————————————————————————————————————————
// Theme application
// ——————————————————————————————————————————————————————————————————————————

export function applyThemeStyle(themeName) {
    const theme = brandingOptions[themeName];
    if (!theme) {
        return window.logMessage(`cssAgent: theme '${themeName}' not found`);
    }
    const c = getContainer();
    if (!c) return;

    // helper to set/clear a prop
    const setStyle = (sel, prop, value) => {
        forEachInContainer(sel, el => {
            if (value != null && value !== '') el.style[prop] = value;
            else el.style.removeProperty(prop);
        });
    };

    // container background
    c.style.backgroundColor = theme.background;

    // header
    setStyle('.header', 'backgroundColor', theme.headerBg);
    setStyle('.header', 'borderBottom', theme.headerBorderBottom);
    setStyle('.header', 'boxShadow', theme.headerBoxShadow);
    setStyle('.header', 'color', theme.text);

    // subheader
    setStyle('.subheader', 'backgroundColor', theme.subheaderBg);
    setStyle('.subheader', 'boxShadow', theme.subheaderBoxShadow);
    setStyle('.subheader', 'color', theme.subtext);

    // sidebar
    forEachInContainer('.sidebar', el => {
        el.style.backgroundColor = theme.sidebarMenu;
        if (theme.sidebarMenuGradient) {
            const fallback = getComputedStyle(el).backgroundColor;
            el.style.background = `${theme.sidebarMenuGradient}, ${fallback}`;
        } else {
            el.style.removeProperty('background');
        }
        el.style.borderRight = theme.sidebarBorderRight || '';
        el.style.boxShadow = theme.sidebarBoxShadow || '';
    });
    setStyle('.sidebar a', 'color', theme.links);

    // main content
    setStyle('.main-content', 'backgroundColor', theme.mainBg || '');

    // footer
    setStyle('.footer', 'backgroundColor', theme.footerBg);
    setStyle('.footer', 'borderTop', theme.footerBorderTop);
    setStyle('.footer', 'boxShadow', theme.footerBoxShadow);
    setStyle('.footer', 'color', theme.text);

    // ensure default text color
    c.style.color = theme.text;

    window.logMessage(`cssAgent: theme '${themeName}' applied`);
}

// ——————————————————————————————————————————————————————————————————————————
// Customization APIs
// ——————————————————————————————————————————————————————————————————————————

export function setBackgroundColor(selector, color) {
    const sel = selector ? normalizeSelector(selector) : null;
    const c = getContainer();
    if (!c) return;

    if (!sel) {
        // target container
        c.style.removeProperty('background-image');
        c.style.backgroundColor = color;
    } else {
        forEachInContainer(sel, el => {
            el.style.removeProperty('background-image');
            el.style.backgroundColor = color;
        });
    }
    window.logMessage(`cssAgent: setBackgroundColor(${sel || '#' + ROOT_ID}, ${color})`);
}

export function setBackgroundGradient(selector, a, b) {
    const sel = normalizeSelector(selector);
    const gradientCss = b
        ? `linear-gradient(to bottom, ${a}, ${b})`
        : a;
    forEachInContainer(sel, el => {
        el.style.backgroundImage = gradientCss;
    });
    window.logMessage(`cssAgent: setBackgroundGradient(${sel}, ${gradientCss})`);
}

/**
 * Set text color inside #taco-dashboard-container only.
 * Clears any previous text-gradient so this is a pure color override.
 * @param {string} selector    — CSS selector or bare name
 * @param {string} color       — any valid CSS color
 */
/**
 * Change text color of any selector (and its dashboard-title/h1 children).
 */
export function setTextColor(selector, color) {
    const sel = normalizeSelector(selector);
    const c = document.getElementById(ROOT_ID);
    if (!c) return;

    const els = c.querySelectorAll(sel);
    if (!els.length) {
        return window.logMessage(`cssAgent.setTextColor: no elements match '${sel}'`);
    }

    els.forEach(el => {
        // clear any gradient
        el.style.removeProperty('background-image');
        el.style.removeProperty('background-clip');
        el.style.removeProperty('-webkit-background-clip');
        el.style.removeProperty('-webkit-text-fill-color');
        el.style.color = color;

        // cascade into header tags
        el.querySelectorAll('h1, .dashboard-title').forEach(child => {
            child.style.removeProperty('background-image');
            child.style.removeProperty('background-clip');
            child.style.removeProperty('-webkit-background-clip');
            child.style.removeProperty('-webkit-text-fill-color');
            child.style.color = color;
        });
    });

    window.logMessage(`cssAgent: setTextColor(${sel}, ${color})`);
}


export function setTextGradient(selector, gradient) {
    const sel = normalizeSelector(selector);
    forEachInContainer(sel, el => {
        el.style.backgroundImage = gradient;
        el.style.backgroundClip = 'text';
        el.style.webkitBackgroundClip = 'text';
        el.style.color = 'transparent';
        el.style.webkitTextFillColor = 'transparent';
    });
    window.logMessage(`cssAgent: setTextGradient(${sel}, ${gradient})`);
}

/**
 * Set font size (e.g. "16px") inside #taco-dashboard-container only.
 * @param {string} selector    — CSS selector or bare name (e.g. "header" or ".header h1")
 * @param {string} size        — any valid CSS size, e.g. "12px" or "1.25rem"
 */
export function setFontSize(selector, size) {
    const sel = normalizeSelector(selector);
    const container = document.getElementById(ROOT_ID);
    if (!container) return;

    const els = container.querySelectorAll(sel);
    if (!els.length) {
        return window.logMessage(`cssAgent.setFontSize: no elements match '${sel}'`);
    }

    els.forEach(el => {
        // apply to the element itself
        el.style.setProperty('font-size', size);

        // also cascade into any headings inside
        Array.from(el.querySelectorAll('h1, .dashboard-title')).forEach(child => {
            child.style.setProperty('font-size', size);
        });
    });

    window.logMessage(`cssAgent: setFontSize(${sel}, ${size})`);
}

export function setFontStyle(selector, style) {
    const sel = normalizeSelector(selector);

    forEachInContainer(sel, el => {
        let weight = '';
        let fontStyle = '';
        let family = '';

        if (/^[1-9]00$/.test(style)) {
            weight = style;
        } else if (style === 'bold') {
            weight = '700';
        } else if (style === 'bolder') {
            weight = '900';
        } else if (['italic', 'normal', 'oblique'].includes(style)) {
            fontStyle = style;
        } else {
            family = style;
        }

        if (weight) el.style.fontWeight = weight;
        if (fontStyle) el.style.fontStyle = fontStyle;
        if (family) el.style.fontFamily = family;

        // cascade into header tags
        el.querySelectorAll('h1, .dashboard-title').forEach(child => {
            if (weight) child.style.fontWeight = weight;
            if (fontStyle) child.style.fontStyle = fontStyle;
            if (family) child.style.fontFamily = family;
        });
    });

    window.logMessage(`cssAgent: setFontStyle(${sel}, ${style})`);
}


/**
 * Set horizontal text alignment on any selector (and its h1/dashboard-title children).
 */
export function setTextAlign(selector, alignment) {
    const sel = normalizeSelector(selector);
    const c = document.getElementById(ROOT_ID);
    if (!c) return;

    const els = c.querySelectorAll(sel);
    if (!els.length) {
        return window.logMessage(`cssAgent.setTextAlign: no elements match '${sel}'`);
    }

    els.forEach(el => {
        el.style.textAlign = alignment;
        el.querySelectorAll('h1, .dashboard-title').forEach(child => {
            child.style.textAlign = alignment;
        });
    });

    window.logMessage(`cssAgent: setTextAlign(${sel}, ${alignment})`);
}

export function setVerticalAlign(selector, alignment) {
    const sel = normalizeSelector(selector);
    const justifyMap = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
    const justify = justifyMap[alignment];
    if (!justify) {
        return window.logMessage(`cssAgent: bad vertical align '${alignment}'`);
    }

    forEachInContainer(sel, el => {
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.justifyContent = justify;

        // cascade into any nested header containers
        el.querySelectorAll('h1, .dashboard-title').forEach(child => {
            child.style.display = 'flex';
            child.style.flexDirection = 'column';
            child.style.justifyContent = justify;
        });
    });

    window.logMessage(`cssAgent: setVerticalAlign(${sel}, ${alignment})`);
}

export function setPadding(selectorOrPayload, spec) {
    let sel, padding;
    if (typeof selectorOrPayload === 'object') {
        sel = normalizeSelector(selectorOrPayload.selector);
        padding = { ...selectorOrPayload }; delete padding.selector;
    } else {
        sel = normalizeSelector(selectorOrPayload);
        padding = spec;
    }
    forEachInContainer(sel, el => {
        if (typeof padding === 'string') {
            el.style.padding = padding;
        } else {
            const sides = { top: 'padding-top', right: 'padding-right', bottom: 'padding-bottom', left: 'padding-left' };
            Object.entries(padding).forEach(([side, val]) => {
                if (sides[side]) el.style.setProperty(sides[side], val);
            });
        }
    });
    window.logMessage(`cssAgent: setPadding(${sel}, ${JSON.stringify(padding)})`);
}

export function setMargin(selectorOrPayload, spec) {
    let sel, margin;
    if (typeof selectorOrPayload === 'object') {
        sel = normalizeSelector(selectorOrPayload.selector);
        margin = { ...selectorOrPayload }; delete margin.selector;
    } else {
        sel = normalizeSelector(selectorOrPayload);
        margin = spec;
    }
    forEachInContainer(sel, el => {
        if (typeof margin === 'string') {
            el.style.margin = margin;
        } else {
            const sides = { top: 'margin-top', right: 'margin-right', bottom: 'margin-bottom', left: 'margin-left' };
            Object.entries(margin).forEach(([side, val]) => {
                if (sides[side]) el.style.setProperty(sides[side], val);
            });
        }
    });
    window.logMessage(`cssAgent: setMargin(${sel}, ${JSON.stringify(margin)})`);
}

export function setSize(payload) {
    const sel = normalizeSelector(payload.selector);
    const els = document.querySelectorAll(sel);
    if (!els.length) return window.logMessage(`cssAgent: setSize no match for '${sel}'`);
    els.forEach(el => {
        if (payload.width != null) el.style.width = payload.width;
        if (payload.height != null) el.style.height = payload.height;
    });
    window.logMessage(
        `cssAgent: setSize(${sel}` +
        (payload.width != null ? `, w=${payload.width}` : ``) +
        (payload.height != null ? `, h=${payload.height}` : ``) +
        `)`
    );
}

/**
 * Change border color on any selector, for all sides or per-edge.
 *
 * Usage:
 *   setBorderColor('.box', 'red')
 *   setBorderColor({ selector:'.box', top:'red', bottom:'blue' })
 */
export function setBorderColor(selectorOrPayload, colorOrSpec) {
    // normalize inputs
    let rawSel, spec;
    if (typeof selectorOrPayload === 'object') {
        rawSel = selectorOrPayload.selector;
        spec = { ...selectorOrPayload };
        delete spec.selector;
    } else {
        rawSel = selectorOrPayload;
        spec = colorOrSpec;
    }

    const sel = normalizeSelector(rawSel);
    forEachInContainer(sel, el => {
        // ensure border-style so color shows
        if (!el.style.borderStyle) el.style.borderStyle = 'solid';

        if (typeof spec === 'string') {
            // simple case: all four sides same color
            el.style.borderColor = spec;
        } else {
            // object case: only set the sides provided
            const map = {
                top: 'borderTopColor',
                right: 'borderRightColor',
                bottom: 'borderBottomColor',
                left: 'borderLeftColor'
            };
            Object.entries(spec).forEach(([side, col]) => {
                const prop = map[side];
                if (prop) el.style[prop] = col;
            });
        }
    });

    window.logMessage(`cssAgent: setBorderColor(${sel}, ${JSON.stringify(spec)})`);
}

export function setBorderWidth(selector, width) {
    const sel = normalizeSelector(selector);
    forEachInContainer(sel, el => {
        el.style.borderWidth = width;
        if (!el.style.borderStyle) el.style.borderStyle = 'solid';
    });
    window.logMessage(`cssAgent: setBorderWidth(${sel}, ${width})`);
}

/**
 * Set rounded corners on any selector.
 * • If payload.radius is given, use it for all corners.
 * • Otherwise merge individual corner keys.
 *
 * @param {{
*   selector: string,
*   radius?: string,
*   topLeft?: string,
*   topRight?: string,
*   bottomRight?: string,
*   bottomLeft?: string
* }} payload
*/
export function setBorderRadius(payload) {
    const { selector, radius, topLeft, topRight, bottomRight, bottomLeft } = payload;
    if (!selector) {
        return window.logMessage('cssAgent.setBorderRadius: missing selector');
    }
    // normalize selector
    let sel = selector.trim();
    if (!/^[.#\[]/.test(sel)) sel = `.${sel}`;

    const els = document.querySelectorAll(sel);
    if (!els.length) {
        return window.logMessage(`cssAgent.setBorderRadius: no elements match '${sel}'`);
    }

    els.forEach(el => {
        if (radius != null) {
            // Uniform radius for all corners
            el.style.borderRadius = radius;
            window.logMessage(`cssAgent: setBorderRadius(${sel}, all=${radius})`);
        } else {
            // Read computed to preserve unspecified corners
            const cs = getComputedStyle(el);
            const current = {
                topLeft: cs.borderTopLeftRadius,
                topRight: cs.borderTopRightRadius,
                bottomRight: cs.borderBottomRightRadius,
                bottomLeft: cs.borderBottomLeftRadius
            };
            const merged = {
                topLeft: topLeft ?? current.topLeft,
                topRight: topRight ?? current.topRight,
                bottomRight: bottomRight ?? current.bottomRight,
                bottomLeft: bottomLeft ?? current.bottomLeft
            };
            el.style.borderTopLeftRadius = merged.topLeft;
            el.style.borderTopRightRadius = merged.topRight;
            el.style.borderBottomRightRadius = merged.bottomRight;
            el.style.borderBottomLeftRadius = merged.bottomLeft;
            window.logMessage(
                `cssAgent: setBorderRadius(${sel}, ` +
                JSON.stringify(merged) + `)`
            );
        }
    });
}

export function setBoxShadow(selector, shadow) {
    const sel = normalizeSelector(selector);
    forEachInContainer(sel, el => el.style.boxShadow = shadow);
    window.logMessage(`cssAgent: setBoxShadow(${sel}, ${shadow})`);
}

export function setSidebarLayout(mode) {
    const c = getContainer();
    if (!c) return;
    const map = {
        left: `"header header" "subheader subheader" "sidebar main" "footer footer"`,
        right: `"header header" "subheader subheader" "main sidebar" "footer footer"`,
        'full-height': `"sidebar header" "sidebar subheader" "sidebar main" "sidebar footer"`
    };
    const areas = map[mode];
    if (!areas) return window.logMessage(`cssAgent: unknown layout '${mode}'`);
    c.style.display = 'grid';
    c.style.gridTemplateAreas = areas;
    c.style.gridTemplateRows = 'auto auto 1fr auto';
    c.style.gridTemplateColumns = (mode === 'full-height' ? '200px 1fr' : '250px 1fr');
    window.logMessage(`cssAgent: setSidebarLayout(${mode})`);
}


/**
 * Adjust the taco-logo’s width or height
 * @param {{ dimension: "width"|"height", value: string }} payload
 */
export function setLogoSize(payload) {
    const { dimension, value } = payload;
    const img = document.querySelector('.taco-logo');
    if (!img) {
        return window.logMessage('cssAgent.setLogoSize: no .taco-logo element found');
    }

    // enforce only width or height
    if (dimension !== 'width' && dimension !== 'height') {
        return window.logMessage(`cssAgent.setLogoSize: invalid dimension "${dimension}"`);
    }

    img.style[dimension] = value;
    window.logMessage(`cssAgent: setLogoSize(${dimension}=${value})`);
}
