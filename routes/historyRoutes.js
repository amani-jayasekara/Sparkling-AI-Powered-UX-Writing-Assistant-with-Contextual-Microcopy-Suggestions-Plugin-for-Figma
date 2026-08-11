const express = require("express");

const router = express.Router();

const historyController =
    require("../controllers/historyController");


// ============================================================
// FR-32 — Save Plugin Operation
// POST /history
// ============================================================

router.post(
    "/history",
    historyController.saveHistory
);


// ============================================================
// FR-32 — Get History for One Microcopy
// GET /history/:microcopy_id
// ============================================================

router.get(
    "/history/:microcopy_id",
    historyController.getHistory
);


// ============================================================
// FR-32 — Get All Plugin Operation History
// GET /history
// ============================================================

router.get(
    "/history",
    historyController.getAllHistory
);


module.exports = router;