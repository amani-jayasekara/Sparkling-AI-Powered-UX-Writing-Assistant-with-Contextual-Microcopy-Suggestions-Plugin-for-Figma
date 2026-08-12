/* global figma, __html__ */

// ============================================================
// AI-POWERED UX WRITING ASSISTANT
// Clean integration version
//
// Amani:
// FR-01 Launch Plugin
// FR-02 Detect Open Figma File
// FR-03 Validate Plugin Compatibility
// FR-04 Maintain Plugin Session
// FR-05 Terminate Plugin Session
//
// Chanika:
// FR-06 Detect UI Element Selection
// FR-07 Validate Editable UI Element
// FR-08 Validate Single Selection
// FR-09 Link Element to Session
//
// Shofnam:
// FR-24 Preview Microcopy
// FR-25 Confirm Preview
// FR-26 Discard Preview
// FR-27 Apply/Export Microcopy
// FR-28 Manual Edit
// FR-30 Retry
// ============================================================


// ============================================================
// 1. PLUGIN STARTUP
// ============================================================

figma.showUI(__html__, {
  width: 420,
  height: 720,
  themeColors: true
});


// ============================================================
// 2. SESSION STATE
// ============================================================

let sessionActive = true;
let selectedElementId = null;
let originalText = null;
let selectedContext = null;


// ============================================================
// 3. FILE DETECTION
// FR-02
// ============================================================

function detectOpenFigmaFile() {
  try {
    return !!figma.root;
  } catch (error) {
    console.error(
      "[AI UX Writing Assistant] File detection error:",
      error
    );

    return false;
  }
}


// ============================================================
// 4. COMPATIBILITY
// FR-03
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
// 5. SESSION
// FR-04
// ============================================================

function maintainPluginSession() {
  return sessionActive;
}


// ============================================================
// 6. SELECTION VALIDATION
// Chanika integration
// FR-06 / FR-07 / FR-08
// ============================================================

function validateCurrentSelection() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return {
      success: false,
      reason: "NO_SELECTION",
      message: "Please select a UI element in Figma."
    };
  }

  if (selection.length > 1) {
    return {
      success: false,
      reason: "MULTIPLE_SELECTION",
      message: "Please select only one UI element."
    };
  }

  const element = selection[0];

  const supportedTypes = [
    "TEXT",
    "FRAME",
    "COMPONENT",
    "INSTANCE",
    "GROUP",
    "RECTANGLE",
    "ELLIPSE",
    "COMPONENT_SET"
  ];

  if (!supportedTypes.includes(element.type)) {
    return {
      success: false,
      reason: "UNSUPPORTED_ELEMENT",
      message: "This type of Figma element is not supported."
    };
  }

  return {
    success: true,
    element
  };
}


// ============================================================
// 7. CONTEXT EXTRACTION
// Chanika integration
// ============================================================

function extractElementContext(element) {
  let text = "";

  if (element.type === "TEXT") {
    text = element.characters || "";
  }

  const parentName =
    element.parent && element.parent.name
      ? element.parent.name
      : "";

  let nearbyElements = [];

  if (figma.currentPage && figma.currentPage.children) {
    nearbyElements = figma.currentPage.children
      .filter((node) => node.id !== element.id)
      .slice(0, 5)
      .map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type
      }));
  }

  return {
    elementId: element.id,
    elementName: element.name,
    elementType: element.type,
    text,
    parent: parentName,
    nearbyElements
  };
}


// ============================================================
// 8. LINK ELEMENT TO SESSION
// FR-09
// ============================================================

function linkElementToSession(element) {
  selectedElementId = element.id;

  selectedContext = extractElementContext(element);

  return true;
}


// ============================================================
// 9. SEND SELECTION TO UI
// ============================================================

function sendSelectionToUI(element) {
  const context = extractElementContext(element);

  selectedContext = context;

  figma.ui.postMessage({
    type: "ELEMENT_SELECTED",
    success: true,
    elementId: element.id,
    elementName: element.name,
    elementType: element.type,
    text: context.text,
    parent: context.parent,
    context
  });
}


// ============================================================
// 10. INVALID SELECTION
// ============================================================

function sendSelectionError(result) {
  figma.ui.postMessage({
    type: "SELECTION_INVALID",
    success: false,
    reason: result.reason,
    message: result.message
  });
}


// ============================================================
// 11. HANDLE CURRENT SELECTION
// ============================================================

function handleCurrentSelection() {
  if (!maintainPluginSession()) {
    return;
  }

  const result = validateCurrentSelection();

  if (!result.success) {
    sendSelectionError(result);
    return;
  }

  const element = result.element;

  linkElementToSession(element);

  sendSelectionToUI(element);

  console.log(
    `[AI UX Writing Assistant] Selected: ${element.name} (${element.type})`
  );
}


// ============================================================
// 12. SELECTION CHANGE LISTENER
// Chanika → Amani connection
// ============================================================

figma.on("selectionchange", () => {
  handleCurrentSelection();
});


// ============================================================
// 13. INITIAL PLUGIN STATUS
// ============================================================

const fileAvailable = detectOpenFigmaFile();
const compatibility = validatePluginCompatibility();
const sessionReady = maintainPluginSession();

figma.ui.postMessage({
  type: "PLUGIN_READY",
  fileAvailable,
  compatible: compatibility.compatible,
  sessionActive: sessionReady,
  message: compatibility.message
});


// ============================================================
// 14. UI MESSAGE HANDLER
// ============================================================

figma.ui.onmessage = async (msg) => {
  if (!msg || !msg.type) {
    return;
  }


  // ==========================================================
  // CHECK STATUS
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
  // GET SELECTION
  // ==========================================================

  if (msg.type === "GET_SELECTION") {
    handleCurrentSelection();
    return;
  }


  // ==========================================================
  // REQUEST MICROCOPY
  // ==========================================================

  if (msg.type === "REQUEST_MICROCOPY") {
    const result = validateCurrentSelection();

    if (!result.success) {
      sendSelectionError(result);
      return;
    }

    const element = result.element;

    linkElementToSession(element);

    figma.ui.postMessage({
      type: "OPEN_CONFIGURATION",
      success: true,
      elementId: element.id,
      elementName: element.name,
      elementType: element.type,
      context: selectedContext
    });

    return;
  }


  // ==========================================================
  // PREVIEW
  // Shofnam
  // ==========================================================

  if (msg.type === "PREVIEW_MICROCOPY") {
    await previewMicrocopy(msg.text);
    return;
  }


  // ==========================================================
  // CONFIRM PREVIEW
  // ==========================================================

  if (msg.type === "CONFIRM_PREVIEW") {
    confirmPreview();
    return;
  }


  // ==========================================================
  // DISCARD PREVIEW
  // ==========================================================

  if (msg.type === "DISCARD_PREVIEW") {
    await discardPreview();
    return;
  }


  // ==========================================================
  // APPLY MICROCOPY
  // ==========================================================

  if (msg.type === "EXPORT_MICROCOPY") {
    await exportMicrocopy(msg.text);
    return;
  }


  // ==========================================================
  // MANUAL EDIT
  // ==========================================================

  if (msg.type === "EDIT_MICROCOPY") {
    await exportMicrocopy(msg.text);
    return;
  }


  // ==========================================================
  // RETRY
  // ==========================================================

  if (msg.type === "RETRY") {
    handleCurrentSelection();

    figma.ui.postMessage({
      type: "RETRY_READY",
      message: "Selection checked. You can try again."
    });

    return;
  }


  // ==========================================================
  // CLOSE PLUGIN
  // ==========================================================

  if (msg.type === "CLOSE_PLUGIN") {
    terminatePluginSession();
    return;
  }
};


// ============================================================
// 15. PREVIEW MICROCOPY
// FR-24
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

  if (element.type !== "TEXT") {
    figma.ui.postMessage({
      type: "ERROR",
      message: "Preview is currently supported for text elements."
    });

    return;
  }

  if (originalText === null) {
    originalText = element.characters;
  }

  await figma.loadFontAsync(element.fontName);

  element.characters = text;

  figma.ui.postMessage({
    type: "PREVIEW_SUCCESS",
    text
  });
}


// ============================================================
// 16. CONFIRM PREVIEW
// FR-25
// ============================================================

function confirmPreview() {
  originalText = null;

  figma.ui.postMessage({
    type: "PREVIEW_CONFIRMED",
    message: "Microcopy confirmed."
  });
}


// ============================================================
// 17. DISCARD PREVIEW
// FR-26
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
// 18. APPLY MICROCOPY
// FR-27
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
    text,
    message: "Microcopy applied successfully."
  });
}


// ============================================================
// 19. TERMINATE SESSION
// FR-05
// ============================================================

function terminatePluginSession() {
  sessionActive = false;

  selectedElementId = null;
  originalText = null;
  selectedContext = null;

  console.log(
    "[AI UX Writing Assistant] Plugin session terminated."
  );

  figma.closePlugin();
}