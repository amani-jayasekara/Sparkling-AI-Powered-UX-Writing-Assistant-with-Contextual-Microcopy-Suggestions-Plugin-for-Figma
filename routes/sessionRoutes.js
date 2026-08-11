const express = require("express");

const router = express.Router();

const sessionController =
    require("../controllers/sessionController");


// ============================================================
// FR-01 — Create Plugin Session
// POST /session
// ============================================================

router.post(
    "/session",
    sessionController.createSession
);


// ============================================================
// FR-02 — Check Figma Login Status
// GET /session/:figmaSessionId/login-status
// ============================================================

router.get(
    "/session/:figmaSessionId/login-status",
    sessionController.checkLoginStatus
);


// ============================================================
// FR-03 — Authenticate Plugin User
// POST /session/:figmaSessionId/authenticate
// ============================================================

router.post(
    "/session/:figmaSessionId/authenticate",
    sessionController.authenticatePluginUser
);


// ============================================================
// FR-04 — Maintain Plugin Session
// PUT /session/:figmaSessionId
// ============================================================

router.put(
    "/session/:figmaSessionId",
    sessionController.updateSession
);


// ============================================================
// FR-05 — Terminate Plugin Session
// DELETE /session/:figmaSessionId
// ============================================================

router.delete(
    "/session/:figmaSessionId",
    sessionController.terminateSession
);


// ============================================================
// FR-06 / FR-07 / FR-08
// Validate UI Element Selection
// POST /session/:figmaSessionId/selection
// ============================================================

router.post(
    "/session/:figmaSessionId/selection",
    sessionController.validateSelection
);


// ============================================================
// FR-09 — Link UI Element to Session
// PUT /session/:figmaSessionId/element
// ============================================================

router.put(
    "/session/:figmaSessionId/element",
    sessionController.linkElementToSession
);


// ============================================================
// FR-10 — Enable Microcopy Request
// POST /session/:figmaSessionId/microcopy
// ============================================================

router.post(
    "/session/:figmaSessionId/microcopy",
    sessionController.enableMicrocopyRequest
);


// ============================================================
// FR-11 — Display Configuration Dialog
// GET /session/:figmaSessionId/configuration
// ============================================================

router.get(
    "/session/:figmaSessionId/configuration",
    sessionController.getConfiguration
);


module.exports = router;