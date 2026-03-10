const express = require("express");
const router = express.Router();

const Highlight = require("../models/Highlight");

// =============================
// GET HIGHLIGHTS
// =============================
router.get("/", async (req, res) => {
  try {

    const highlights = await Highlight.find()
      .populate("studentId", "name")
      .populate("articleId", "title category")
      .sort({ createdAt: -1 });

    res.json(highlights);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server Error" });

  }
});

// =============================
// SAVE HIGHLIGHT OR COMMENT
// =============================
router.post("/", async (req, res) => {

  try {

    const { studentId, articleId, text, note } = req.body;

    if (!studentId || !articleId) {
      return res.status(400).json({
        message: "studentId and articleId required"
      });
    }

    const highlight = new Highlight({
      studentId,
      articleId,
      text: text || "",
      note: note || ""
    });

    await highlight.save();

    const saved = await Highlight.findById(highlight._id)
      .populate("studentId", "name")
      .populate("articleId", "title");

    res.json(saved);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server Error" });

  }

});

module.exports = router;