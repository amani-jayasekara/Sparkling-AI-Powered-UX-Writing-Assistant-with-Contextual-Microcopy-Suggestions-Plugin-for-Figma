/* global figma, __html__ */

// ============================================================
// AI-POWERED UX WRITING ASSISTANT
// Figma Plugin - Main Code
//
// Amani's implementation:
// FR-01 Launch Plugin
// FR-02 Detect Open Figma File
// FR-03 Validate Plugin Compatibility
// FR-04 Maintain Plugin Session
// FR-05 Terminate Plugin Session
//
// Connection points:
// FR-06 Detect UI Element Selection
// FR-07 Validate Editable UI Element
// FR-08 Validate Single Selection
// FR-09 Link Element to Session
// FR-10 Enable Microcopy Request
// FR-11 Display Configuration Dialog
// ============================================================


// ============================================================
// 1. PLUGIN STARTUP
// FR-01 Launch Plugin
// ============================================================

figma.showUI(__html__, {
  width: 420,
  height: 650,
  themeColors: true
});


// ============================================================
// 2. SESSION STATE
// FR-04 Maintain Plugin Session
// ============================================================

let sessionActive = true;
let selectedElementId = null;
let originalText = null;


// ============================================================
// 3. FR-02 Detect Open Figma File
// ============================================================

function detectOpenFigmaFile() {
  try {
    if (!figma.root) {
      return false;
    }

    return true;

  } catch (error) {
    console.error(
      "[AI UX Writing Assistant] File detection error:",
      error
    );

    return false;
  }
}


// ============================================================
// 4. FR-03 Validate Plugin Compatibility
// ============================================================

function validatePluginCompatibility() {
  try {

    if (!figma.root) {
      return {
        compatible: false,
        message: "No Figma file is currently open."
      };
    }

    if (!figma.currentPage) {
      return {
        compatible: false,
        message: "No editable Figma page is available."
      };
    }

    return {
      compatible: true,
      message: "Figma file is compatible."
    };

  } catch (error) {

    console.error(
      "[AI UX Writing Assistant] Compatibility error:",
      error
    );

    return {
      compatible: false,
      message: "Unable to validate the Figma file."
    };
  }
}


// ============================================================
// 5. FR-04 Maintain Plugin Session
// ============================================================

function maintainPluginSession() {

  if (!sessionActive) {
    return false;
  }

  return true;
}


// ============================================================
// 6. FR-06 Detect UI Element Selection
// FR-07 Validate Editable UI Element
// FR-08 Validate Single Selection
// ============================================================

function validateCurrentSelection() {

  const selection = figma.currentPage.selection;


  // ----------------------------------------------------------
  // No element selected
  // ----------------------------------------------------------

  if (selection.length === 0) {

    return {
      success: false,
      reason: "NO_SELECTION",
      message: "Please select a UI element in Figma."
    };
  }


  // ----------------------------------------------------------
  // More than one element selected
  // FR-08
  // ----------------------------------------------------------

  if (selection.length > 1) {

    return {
      success: false,
      reason: "MULTIPLE_SELECTION",
      message: "Please select only one UI element."
    };
  }


  const element = selection[0];


  // ----------------------------------------------------------
  // Editable element validation
  // FR-07
  // ----------------------------------------------------------

  const supportedTypes = [
    "TEXT",
    "FRAME",
    "COMPONENT",
    "INSTANCE",
    "GROUP"
  ];


  if (!supportedTypes.includes(element.type)) {

    return {
      success: false,
      reason: "UNSUPPORTED_ELEMENT",
      message: "This type of Figma element is not supported."
    };
  }


  // ----------------------------------------------------------
  // Valid selection
  // ----------------------------------------------------------

  return {
    success: true,
    element: element
  };
}


// ============================================================
// 7. FR-09 Link Element to Session
// ============================================================

function linkElementToSession(element) {

  selectedElementId = element.id;

  return true;
}


// ============================================================
// 8. FR-10 Enable Microcopy Request
// ============================================================

function notifyValidSelection(element) {

  figma.ui.postMessage({

    type: "ELEMENT_SELECTED",

    success: true,

    elementId: element.id,

    elementName: element.name,

    elementType: element.type
  });
}


// ============================================================
// 9. FR-11 Display Configuration Dialog
// ============================================================

function openConfigurationForElement(element) {

  figma.ui.postMessage({

    type: "OPEN_CONFIGURATION",

    success: true,

    elementId: element.id,

    elementName: element.name,

    elementType: element.type
  });
}


// ============================================================
// 10. SELECTION CHANGE LISTENER
// FR-06 → FR-10
// ============================================================

figma.on("selectionchange", () => {

  // Make sure session is active
  if (!maintainPluginSession()) {
    return;
  }


  const result = validateCurrentSelection();


  // ----------------------------------------------------------
  // Invalid selection
  // ----------------------------------------------------------

  if (!result.success) {

    figma.ui.postMessage({

      type: "SELECTION_INVALID",

      reason: result.reason,

      message: result.message
    });

    return;
  }


  // ----------------------------------------------------------
  // Valid selection
  // ----------------------------------------------------------

  const element = result.element;


  // FR-09
  linkElementToSession(element);


  // FR-10
  notifyValidSelection(element);


  console.log(
    `[AI UX Writing Assistant] Selected: ${element.name} (${element.type})`
  );
});


// ============================================================
// 11. INITIAL PLUGIN VALIDATION
// FR-01
// FR-02
// FR-03
// FR-04
// ============================================================

const fileAvailable = detectOpenFigmaFile();

const compatibility = validatePluginCompatibility();

const sessionReady = maintainPluginSession();


figma.ui.postMessage({

  type: "PLUGIN_READY",

  fileAvailable: fileAvailable,

  compatible: compatibility.compatible,

  sessionActive: sessionReady,

  message: compatibility.message
});


// ============================================================
// 12. UI → PLUGIN MESSAGE HANDLER
// ============================================================

figma.ui.onmessage = async (msg) => {

  // Ignore empty messages
  if (!msg || !msg.type) {
    return;
  }


  // ==========================================================
  // CHECK PLUGIN STATUS
  // ==========================================================

  if (msg.type === "CHECK_PLUGIN_STATUS") {

    const fileAvailableNow = detectOpenFigmaFile();

    const compatibilityNow =
      validatePluginCompatibility();

    const sessionReadyNow =
      maintainPluginSession();


    figma.ui.postMessage({

      type: "PLUGIN_STATUS",

      fileAvailable: fileAvailableNow,

      compatible: compatibilityNow.compatible,

      sessionActive: sessionReadyNow,

      message: compatibilityNow.message
    });

    return;
  }


  // ==========================================================
  // GET CURRENT SELECTION
  // FR-06
  // FR-07
  // FR-08
  // FR-09
  // ==========================================================

  if (msg.type === "GET_SELECTION") {

    const result = validateCurrentSelection();


    if (!result.success) {

      figma.ui.postMessage({

        type: "SELECTION_INVALID",

        reason: result.reason,

        message: result.message
      });

      return;
    }


    const element = result.element;


    linkElementToSession(element);

    notifyValidSelection(element);

    return;
  }


  // ==========================================================
  // REQUEST MICROCOPY
  // FR-10
  // FR-11
  // ==========================================================

  if (msg.type === "REQUEST_MICROCOPY") {

    const result = validateCurrentSelection();


    if (!result.success) {

      figma.ui.postMessage({

        type: "ERROR",

        message: result.message
      });

      return;
    }


    const element = result.element;


    linkElementToSession(element);

    openConfigurationForElement(element);

    return;
  }


  // ==========================================================
  // PREVIEW MICROCOPY
  // FR-24
  // ==========================================================

  if (msg.type === "PREVIEW_MICROCOPY") {

    await previewMicrocopy(msg.text);

    return;
  }


  // ==========================================================
  // CONFIRM PREVIEW
  // FR-25
  // ==========================================================

  if (msg.type === "CONFIRM_PREVIEW") {

    confirmPreview();

    return;
  }


  // ==========================================================
  // DISCARD PREVIEW
  // FR-26
  // ==========================================================

  if (msg.type === "DISCARD_PREVIEW") {

    await discardPreview();

    return;
  }


  // ==========================================================
  // EXPORT / APPLY MICROCOPY
  // FR-27
  // ==========================================================

  if (msg.type === "EXPORT_MICROCOPY") {

    await exportMicrocopy(msg.text);

    return;
  }


  // ==========================================================
  // MANUAL EDIT
  // FR-28
  // ==========================================================

  if (msg.type === "EDIT_MICROCOPY") {

    await exportMicrocopy(msg.text);

    return;
  }


  // ==========================================================
  // RETRY
  // FR-30
  // ==========================================================

  if (msg.type === "RETRY") {

    figma.ui.postMessage({

      type: "RETRY_READY",

      message: "You can retry the operation."
    });

    return;
  }


  // ==========================================================
  // CLOSE PLUGIN
  // FR-05
  // ==========================================================

  if (msg.type === "CLOSE_PLUGIN") {

    terminatePluginSession();

    return;
  }

};


// ============================================================
// 13. FR-24 Preview Microcopy
// ============================================================

async function previewMicrocopy(text) {

  if (!selectedElementId) {

    figma.ui.postMessage({

      type: "ERROR",

      message: "No UI element is selected."
    });

    return;
  }


  if (!text || text.trim() === "") {

    figma.ui.postMessage({

      type: "ERROR",

      message: "Preview text cannot be empty."
    });

    return;
  }


  const element =
    await figma.getNodeByIdAsync(selectedElementId);


  if (!element) {

    figma.ui.postMessage({

      type: "ERROR",

      message: "The selected UI element no longer exists."
    });

    return;
  }


  // Preview currently works with TEXT nodes
  if (element.type !== "TEXT") {

    figma.ui.postMessage({

      type: "ERROR",

      message:
        "Preview is currently supported for text elements."
    });

    return;
  }


  // Save original text only once
  if (originalText === null) {

    originalText = element.characters;
  }


  // Load font before editing
  await figma.loadFontAsync(element.fontName);


  // Temporarily replace text
  element.characters = text;


  figma.ui.postMessage({

    type: "PREVIEW_SUCCESS",

    text: text
  });
}


// ============================================================
// 14. FR-25 Confirm Preview
// ============================================================

function confirmPreview() {

  originalText = null;


  figma.ui.postMessage({

    type: "PREVIEW_CONFIRMED",

    message: "Microcopy confirmed."
  });
}


// ============================================================
// 15. FR-26 Discard Preview
// ============================================================

async function discardPreview() {

  if (!selectedElementId) {

    originalText = null;


    figma.ui.postMessage({

      type: "PREVIEW_DISCARDED"
    });

    return;
  }


  if (originalText === null) {

    figma.ui.postMessage({

      type: "PREVIEW_DISCARDED"
    });

    return;
  }


  const element =
    await figma.getNodeByIdAsync(selectedElementId);


  if (element && element.type === "TEXT") {

    await figma.loadFontAsync(element.fontName);

    element.characters = originalText;
  }


  originalText = null;


  figma.ui.postMessage({

    type: "PREVIEW_DISCARDED",

    message: "Original text restored."
  });
}


// ============================================================
// 16. FR-27 Export Microcopy
// ============================================================

async function exportMicrocopy(text) {

  if (!selectedElementId) {

    figma.ui.postMessage({

      type: "ERROR",

      message: "No UI element is selected."
    });

    return;
  }


  if (!text || text.trim() === "") {

    figma.ui.postMessage({

      type: "ERROR",

      message: "Microcopy cannot be empty."
    });

    return;
  }


  const element =
    await figma.getNodeByIdAsync(selectedElementId);


  if (!element) {

    figma.ui.postMessage({

      type: "ERROR",

      message: "The selected element no longer exists."
    });

    return;
  }


  if (element.type !== "TEXT") {

    figma.ui.postMessage({

      type: "ERROR",

      message:
        "Microcopy can currently be inserted into text elements only."
    });

    return;
  }


  await figma.loadFontAsync(element.fontName);


  element.characters = text;


  originalText = null;


  figma.ui.postMessage({

    type: "EXPORT_SUCCESS",

    text: text,

    message: "Microcopy applied successfully."
  });
}


// ============================================================
// 17. FR-05 Terminate Plugin Session
// ============================================================

function terminatePluginSession() {

  // End session
  sessionActive = false;


  // Clear session data
  selectedElementId = null;

  originalText = null;


  console.log(
    "[AI UX Writing Assistant] Plugin session terminated."
  );


  // Close plugin
  figma.closePlugin();
}