const express = require("express");

const router = express.Router();

const feedbackController = require("../controllers/feedbackController");


router.post(
    "/feedback",
    feedbackController.saveFeedback
);


router.get(
    "/feedback/:microcopy_id",
    feedbackController.getFeedback
);


module.exports = router;