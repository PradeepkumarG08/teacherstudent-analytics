const router = require("express").Router();
const Tracking = require("../models/Tracking");

// =============================
// CREATE TRACKING
// =============================
router.post("/", async (req, res) => {

  try {

    const { articleId, studentId, timeSpent } = req.body;

    if (!articleId || !studentId) {
      return res.status(400).json({
        message: "articleId and studentId required"
      });
    }

    const tracking = await Tracking.create({
      articleId,
      studentId,
      timeSpent: timeSpent || 0
    });

    res.json(tracking);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: error.message });

  }

});


// =============================
// GET TRACKING
// =============================
router.get("/", async (req, res) => {
  try {

    const data = await Tracking.find()
      .populate("articleId", "title category")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: error.message });

  }
});

module.exports = router;