# 🌮 TACO: Tableau Automate Copilot

## Overview
**TACO** is an AI-powered, modular Tableau Extension that intelligently designs dashboards.  
It uses a Master Agent to orchestrate three specialized agents:
- `htmlAgent`: Builds dynamic dashboard layouts
- `cssAgent`: Applies branding themes and styling
- `jsAgent`: Manages interactivity, visibility, and component behavior

TACO saves time, standardizes design, and delivers clean, branded dashboards — fast.

---

## Demo Video
*(Link will be added here after recording.)*

---

## Key Features
- 🔼️ **htmlAgent**: Auto-generates header, footer, grid layouts.
- 🎨 **cssAgent**: Applies themes, colors, spacing, and style changes dynamically.
- ⚡ **jsAgent**: Adds dashboard interactivity, toggling visibility of dashboard parts.
- 🌐 **MasterAgent**: Accepts natural language prompts and calls specialized agents accordingly.

---

## Architecture
```plaintext
User Prompt
   ↓
Master Agent
 ├── htmlAgent (layout building)
 ├── cssAgent (theme styling)
 └── jsAgent (behavior and interactions)
```

---

## Folder Structure
```plaintext
/taco-extension
|-- /assets
|-- /css
|   |-- theme_as.css
|   |-- theme_ha.css
|-- /js
|   |-- masterAgent.js
|   |-- htmlAgent.js
|   |-- cssAgent.js
|   |-- jsAgent.js
|-- config.html
|-- index.html
|-- README.md
```

---

## Quick Start
1. Clone this repo.
2. Serve it locally or deploy it for Tableau Extensions.
3. Insert the TACO extension into a Tableau dashboard.
4. Launch Config Window to generate a dashboard based on a prompt.

Example:  
> _"Create a 2x2 layout for KPIs and Trends using Theme A."_

---

## Tech Stack
- JavaScript (ES6+)
- Tableau Extensions API
- Azure OpenAI Service
- HTML/CSS

---

## License
© 2025 Team TACO. All rights reserved.

---

## Team
- Allen Wang
- Junying Mao
- Mikio Nagasako

Built for the **Microsoft AI Agents Hackathon 2025** 🎯

---

> **TACO**: *Fresh dashboards. Smart layouts. Styled perfectly. 🌮*