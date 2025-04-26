class CssAgent {
    constructor() {
        this.themes = {
            themeA: 'theme_as.css',
            themeHA: 'theme_ha.css'
        };
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (theme) {
            this.loadTheme(theme);
        } else {
            console.error(`Theme ${themeName} not found.`);
        }
    }

    loadTheme(themeFile) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/${themeFile}`;
        document.head.appendChild(link);
    }
}

export default CssAgent;