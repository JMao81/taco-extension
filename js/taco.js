'use strict';

$(document).ready(function () {

  // Function to open the configuration dialog.
  function showConfig() {
    tableau.extensions.ui.displayDialogAsync('config.html', "", { height: 780, width: 1420 })
      .then((closePayload) => {
        if (closePayload === 'config_saved') {
          // Retrieve updated settings.
          const settings = tableau.extensions.settings.getAll();
        }
      })
      .catch((error) => {
        console.error("Config dialog error:", error.message);
      });
  }

  // Initialize the extension with a configure callback.
  tableau.extensions.initializeAsync({ 'configure': showConfig })
    .then(function () {
      const settings = tableau.extensions.settings.getAll();
    })
    .catch((error) => {
      console.error("Initialization error:", error.message);
    });


});
