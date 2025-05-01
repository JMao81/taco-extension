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
<a href="https://www.youtube.com/watch?v=C7auCWgqu80" target="_blank">
  <img src="https://img.youtube.com/vi/C7auCWgqu80/hqdefault.jpg" alt="Watch on YouTube" width="640">
</a>
---

## Key Features
- 🌐 **MasterAgent**: Accepts natural language prompts and calls specialized agents accordingly.
- 🔼️ **htmlAgent**: Auto-generates header, footer, grid layouts.
- 🎨 **cssAgent**: Applies themes, colors, spacing, and style changes dynamically.
- ⚡ **jsAgent**: Adds dashboard interactivity, toggling visibility of dashboard parts.

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
> _"Give me 3 - 5 best practice advice on designing Tableau Dashboard."_
> _"What is a good font style and size for a KPI dashboard header."_
> _"Change header text to Hello World."_
> _"Add 20px padding all around the main area"_
> _"Show me a list of logos."_
> _"Add logo to the header and adjust it to width of 275px and align it to the right."_
> _"Apply Taco theme."_
> _"Add black border to the subheader and adjust the top and bottom left corner radius to 25px."_


---

## Tech Stack
- Azure OpenAI Service
- JavaScript (ES6+)
- Tableau Extensions API
- Azure Function (to retrieve API key)
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
