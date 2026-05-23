const express = require("express");
const router = express.Router();
const { getPublicStudents } = require("../controllers/studentController");

router.get("/", getPublicStudents);

module.exports = router;