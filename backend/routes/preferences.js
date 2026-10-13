const express = require("express");
const router = express.Router();

const preferenceController = require("../controllers/preferenceController");

router.post(
    "/",
    preferenceController.savePreference
);

router.get(
    "/",
    preferenceController.getLatestPreference
);

module.exports = router;