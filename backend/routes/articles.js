const express = require("express");
const router = express.Router();

const Article = require("../models/Article");
const auth = require("../middleware/authMiddleware");
const teacher = require("../middleware/teacher");

/* CREATE ARTICLE */
router.post("/", auth, teacher, async (req, res) => {
  try {
    const article = await Article.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET ALL ARTICLES */
router.get("/", auth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET SINGLE ARTICLE */
router.get("/:id", auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE ARTICLE */
router.put("/:id", auth, teacher, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE ARTICLE */
router.delete("/:id", auth, teacher, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);

    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;