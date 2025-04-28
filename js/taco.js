// taco.js
'use strict';

import * as htmlAgent from './agents/htmlAgent.js';
import * as cssAgent from './agents/cssAgent.js';
import * as jsAgent   from './agents/jsAgent.js';

$(document).ready(function () {

  //alert("Taco initialized!");

  function dispatchAllSaved() {
    const saved = tableau.extensions.settings.get('tacoConfig');
    if (!saved) return;
    let cmds;
    try { cmds = JSON.parse(saved); }
    catch (e) { return alert("Invalid tacoConfig JSON" + JSON.stringify(e)); }
    cmds.forEach(cmd => {
      const modules = { htmlAgent, cssAgent, jsAgent };
      const fn = modules[cmd.agent]?.[cmd.action];
      if (!fn) return console.warn("Unknown cmd", cmd);
      const args = Array.isArray(cmd.payload)
        ? cmd.payload
        : cmd.payload && typeof cmd.payload === 'object'
          ? Object.values(cmd.payload)
          : [cmd.payload];
      fn(...args);
    });
    alert(`Replayed ${cmds.length} commands`);
  }

  // Function to open the configuration dialog.
  function showConfig() {
    tableau.extensions.ui
      .displayDialogAsync('./config.html', "", { height: 780, width: 1420 })
      .then(closePayload => {
        if (closePayload === 'config_saved') {
          // after Save, immediately reapply
          dispatchAllSaved();
        }
      })
      .catch(e => console.error(e));
  }

  tableau.extensions.initializeAsync({ configure: showConfig })
    .then(function () {

      // const settings = tableau.extensions.settings.getAll();
      // if (settings.tacoConfig) {

      //   alert(JSON.stringify(settings.tacoConfig));

      //   // tacoConfig is a JSON string, so parse it
      //   try {
      //     const tacoConfig = JSON.parse(settings.tacoConfig);
      //     // tacoConfig.forEach(cmd => dispatchCommand(cmd));
      //     dispatchAllSaved();
      //   } catch (e) {
      //     console.error("Invalid tacoConfig JSON", e);
      //   }
      // }
    })
    .catch(err => {
      console.error("Initialization error:", err);
    });

});






