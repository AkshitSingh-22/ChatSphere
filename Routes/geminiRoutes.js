const express = require("express");
const { geminiReply } = require("../Controllers/geminiController");

const router = express.Router();

router.post("/ask", geminiReply);

module.exports = router;
