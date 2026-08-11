const express = require("express");

const router = express.Router();

const microcopyController =
    require("../controllers/microcopyController");


// ============================================
// Generate Microcopy
// POST /generate
// ============================================

router.post(
    "/",
    microcopyController.generateMicrocopy
);


// ============================================
// Get Microcopy History
// GET /generate/history
// ============================================

router.get(
    "/history",
    microcopyController.getAllMicrocopy
);


// ============================================
// FR-21 — Select Microcopy Option
// POST /generate/microcopy/:id/select
// ============================================

router.post(
    "/microcopy/:id/select",
    microcopyController.selectMicrocopyOption
);


// ============================================
// FR-22 — Regenerate Microcopy
// POST /generate/:id/regenerate
// ============================================

router.post(
    "/:id/regenerate",
    microcopyController.regenerateMicrocopy
);


// ============================================
// FR-23 — Replace Microcopy Options
// PUT /generate/:id/replace
// ============================================

router.put(
    "/:id/replace",
    microcopyController.replaceMicrocopyOptions
);

// ============================================
// FR-27 — Export Microcopy
// GET /generate/:id/export
// ============================================

router.get(
    "/:id/export",
    microcopyController.exportMicrocopy
);

// ============================================
// FR-24 — Preview Microcopy
// POST /generate/:id/preview
// ============================================

router.post(
    "/:id/preview",
    microcopyController.previewMicrocopy
);

// ============================================
// FR-30 — Allow Retry After Failure
// POST /generate/:id/retry
// ============================================

router.post(
    "/:id/retry",
    microcopyController.retryMicrocopy
);

// ============================================
// FR-25 — Confirm Preview
// POST /generate/:id/preview/:previewId/confirm
// ============================================

router.post(
    "/:id/preview/:previewId/confirm",
    microcopyController.confirmPreview
);


// ============================================
// FR-26 — Discard Preview
// DELETE /generate/:id/preview/:previewId
// ============================================

router.delete(
    "/:id/preview/:previewId",
    microcopyController.discardPreview
);

// ============================================
// FR-28 — Edit Microcopy Manually
// PUT /generate/:id/edit
// ============================================

router.put(
    "/:id/edit",
    microcopyController.editMicrocopy
);


module.exports = router;