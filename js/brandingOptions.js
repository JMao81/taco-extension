// brandingOptions.js

export const logoLibrary = [
  { name: "Microsoft", url: "./img/logo/logo_1.png" },
  { name: "Copilot", url: "./img/logo/logo_2.png" },
  { name: "Taco", url: "./img/logo/logo_3.png" },
];

export const brandingOptions = {
  light: {
    background: "#ffffff",
    headerBg: "#ffffff",
    headerBorderBottom: "1px solid #dadada",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    subheaderBg: "#f8f9fa",

    sidebarMenu: "#ffffff",
    sidebarMenuGradient: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
    sidebarBorderRight: "1px solid #dadada",
    sidebarBoxShadow: "2px 0 5px rgba(0,0,0,0.05)",

    footerBg: "#ffffff",
    footerBorderTop: "1px solid #dadada",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.05)",

    text: "#333333",
    subtext: "#666666",
    links: "#333333",
    hover: "#e9ecef",
    hoverText: "#007acc",
    activeLink: "#e9ecef",

    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#CFD8DC",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }
  },

  dark: {
    background: "linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 50%, #141414 100%)",
    headerBg: "#1f1f1f",
    headerBorderBottom: "1px solid #333333",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.7)",

    subheaderBg: "transparent",

    sidebarMenu: "#1f1f1f",
    sidebarMenuGradient: "linear-gradient(180deg, #1f1f1f 0%, #121212 100%)",
    sidebarBorderRight: "1px solid #333333",
    sidebarBoxShadow: "2px 0 5px rgba(0,0,0,0.5)",

    footerBg: "#1f1f1f",
    footerBorderTop: "1px solid #333333",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.7)",

    text: "#e0e0e0",
    subtext: "#aaaaaa",
    links: "#ffffff",
    hover: "#333333",
    hoverText: "#ffffff",
    activeLink: "#333333",

    gridItem: {
      background: "#1f1f1f",
      borderRadius: "5px",
      gridBorderColor: "#333333",
      boxShadow: "0 2px 5px rgba(255,255,255,0.05)"
    }
  },

  modern: {
    background: "#f9fafb",
    headerBg: "#ffffff",
    headerBorderBottom: "1px solid #e0e0e0",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    subheaderBg: "transparent",

    sidebarMenu: "#1d2c7f",
    sidebarMenuGradient: "linear-gradient(to bottom, #1d2c7f 0%, #3c49a3 30%, #8029a3 100%)",
    sidebarBorderRight: "1px solid #3c49a3",
    sidebarBoxShadow: "2px 0 6px rgba(60,73,163,0.3)",

    footerBg: "#ffffff",
    footerBorderTop: "1px solid #e0e0e0",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.05)",

    text: "#333333",
    subtext: "#666666",
    links: "#ffffff",
    hover: "rgba(255,255,255,0.15)",
    hoverText: "#ffffff",
    activeLink: "rgba(255,255,255,0.2)",

    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#948fd5",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }
  },

  aag: {
    background: "#f9fafb",
    headerBg: "#ffffff",
    headerBorderBottom: "1px solid #e0e0e0",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    subheaderBg: "transparent",
    // subheaderBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    sidebarMenu: "#126388",
    sidebarMenuGradient: "linear-gradient(to bottom, #126388 0%, #1e86c8 50%, #126388 100%)",
    sidebarBorderRight: "1px solid #1e86c8",
    sidebarBoxShadow: "2px 0 6px rgba(30,134,200,0.3)",

    footerBg: "#ffffff",
    footerBorderTop: "1px solid #e0e0e0",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.05)",

    text: "#333333",
    subtext: "#666666",
    links: "#FFFFFF",
    hover: "rgba(255,255,255,0.2)",
    hoverText: "#FFFFFF",
    activeLink: "rgba(255,255,255,0.3)",

    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#6fafcc",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }
  },

  ha: {
    background: "#f9fafb",
    headerBg: "#ffffff",
    headerBorderBottom: "1px solid #e0e0e0",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    subheaderBg: "transparent",

    sidebarMenu: "#5c52bb",
    sidebarMenuGradient: "linear-gradient(to bottom, #5c52bb 0%, #6d66c3 50%, #5c52bb 100%)",
    sidebarBorderRight: "1px solid #6d66c3",
    sidebarBoxShadow: "2px 0 6px rgba(109,102,195,0.3)",

    footerBg: "#ffffff",
    footerBorderTop: "1px solid #e0e0e0",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.05)",

    text: "#333333",
    subtext: "#666666",
    links: "#ffffff",
    hover: "rgba(255,255,255,0.15)",
    hoverText: "#ffffff",
    activeLink: "rgba(255,255,255,0.2)",

    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#948fd5",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }
  },

  executive: {
    background: "#f4f5f7",
    headerBg: "#ffffff",
    headerBorderBottom: "1px solid #d9d9d9",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    subheaderBg: "transparent",

    sidebarMenu: "#003366",
    sidebarMenuGradient: "linear-gradient(to bottom, #003366 0%, #004080 50%, #003366 100%)",
    sidebarBorderRight: "1px solid #004080",
    sidebarBoxShadow: "2px 0 6px rgba(0,64,128,0.3)",

    footerBg: "#ffffff",
    footerBorderTop: "1px solid #d9d9d9",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.05)",

    text: "#222222",
    subtext: "#555555",
    links: "#ffffff",
    hover: "rgba(255,255,255,0.15)",
    hoverText: "#ffffff",
    activeLink: "rgba(255,255,255,0.2)",

    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#5b8db8",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }
  },

  basicAnalyst: {
    background: "#ffffff",
    headerBg: "#f8f9fa",
    headerBorderBottom: "1px solid #e0e0e0",
    headerBoxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    subheaderBg: "transparent",

    sidebarMenu: "#f1f3f5",
    sidebarMenuGradient: "linear-gradient(to bottom, #f1f3f5 0%, #e9ecef 100%)",
    sidebarBorderRight: "1px solid #d9e2ec",
    sidebarBoxShadow: "2px 0 6px rgba(0,0,0,0.05)",

    footerBg: "#f8f9fa",
    footerBorderTop: "1px solid #e0e0e0",
    footerBoxShadow: "0 -2px 4px rgba(0,0,0,0.05)",

    text: "#333333",
    subtext: "#666666",
    links: "#007acc",
    hover: "#e9ecef",
    hoverText: "#005f99",
    activeLink: "#d0ebff",

    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#d9e2ec",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }
  },

  taco: {
    // A soft tortilla‐cream backdrop
    background: "#fff8e0",

    // Salsa‐orange header with a taco‐crunch border & light shadow
    headerBg: "#f4a261",
    headerBorderBottom: "1px solid #e76f51",
    headerBoxShadow: "0 2px 4px rgba(231,111,81,0.3)",

    // Keep subheader light and airy
    subheaderBg: "transparent",

    // Guacamole‐green sidebar with cheese‐yellow gradient
    sidebarMenu: "#2a9d8f",
    sidebarMenuGradient: "linear-gradient(to bottom, #2a9d8f 0%, #e9c46a 100%)",
    sidebarBorderRight: "1px solid #e9c46a",
    sidebarBoxShadow: "2px 0 6px rgba(0,0,0,0.1)",

    // Tortilla‐cream footer with taco‐spice border on top
    footerBg: "#fff8e0",
    footerBorderTop: "1px solid #e0a158",
    footerBoxShadow: "0 -2px 4px rgba(231,111,81,0.3)",

    // Text in taco-shell brown, subtext in lighter tortilla
    text: "#5d4037",
    subtext: "#8d6e63",

    // Link colors: spicy red, with light‐cream hover
    links: "#e76f51",
    hover: "#f4a261",
    hoverText: "#ffffff",
    activeLink: "#ffe8cc",

    // Card/grid items stay white with a mild taco-dust border
    gridItem: {
      background: "#ffffff",
      borderRadius: "5px",
      gridBorderColor: "#e0a158",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }
  }
};