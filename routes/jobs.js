const express = require("express");
const router = express.Router();
const jobsController = require("./../controllers/jobControllers");
router.get("/search", jobsController.searchJobs);
router.get("/desc/:id", jobsController.getDesc);

router.post("/desc", jobsController.addData);

module.exports = router;
