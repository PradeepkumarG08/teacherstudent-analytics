const router = require("express").Router();

const Analytics = require("../models/Analytics");
const Tracking = require("../models/Tracking");
const Article = require("../models/Article");
const Highlight = require("../models/Highlight");



/*
========================================
ARTICLE VIEWS ANALYTICS
========================================
Returns total views per article
Used for bar charts
*/
router.get("/views", async (req, res) => {

  try {

    const data = await Analytics.aggregate([

      {
        $group: {
          _id: "$articleId",
          views: { $sum: "$views" }
        }
      },

      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "_id",
          as: "article"
        }
      },

      { $unwind: "$article" },

      {
        $project: {
          title: "$article.title",
          views: 1
        }
      }

    ]);

    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});



/*
========================================
ARTICLE DURATION ANALYTICS
========================================
Total reading time per article
Used for pie chart / engagement chart
*/
router.get("/duration", async (req, res) => {

  try {

    const data = await Analytics.aggregate([

      {
        $group: {
          _id: "$articleId",
          totalDuration: { $sum: "$duration" }
        }
      },

      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "_id",
          as: "article"
        }
      },

      { $unwind: "$article" },

      {
        $project: {
          title: "$article.title",
          totalDuration: 1
        }
      }

    ]);

    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});



/*
========================================
DAILY ANALYTICS
========================================
Views grouped by date
Used for line charts
*/
router.get("/daily", async (req, res) => {

  try {

    const data = await Analytics.aggregate([

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date"
            }
          },
          views: { $sum: "$views" }
        }
      },

      { $sort: { "_id": 1 } }

    ]);

    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});



/*
========================================
TOP STUDENTS
========================================
Students who read the most articles
*/
router.get("/top-students", async (req, res) => {

  try {

    const data = await Analytics.aggregate([

      {
        $group: {
          _id: "$studentId",
          reads: { $sum: "$views" }
        }
      },

      { $sort: { reads: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },

      { $unwind: "$student" },

      {
        $project: {
          name: "$student.name",
          reads: 1
        }
      }

    ]);

    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});



/*
========================================
STUDENT DASHBOARD ANALYTICS
========================================
Shows reading time, categories, highlights
*/
router.get("/", async (req, res) => {

  try {

    const tracking = await Tracking
      .find()
      .populate("articleId");

    const highlights = await Highlight
      .find()
      .populate("articleId");

    let categoryTime = {};
    let articles = [];



    tracking.forEach(t => {

      const article = t.articleId;

      if (!article) return;

      const category = article.category || "Other";



      if (!categoryTime[category]) {

        categoryTime[category] = 0;

      }



      categoryTime[category] += t.timeSpent || 0;



      const articleHighlights = highlights
        .filter(h =>
          h.articleId._id.toString() === article._id.toString()
        )
        .map(h => ({
          text: h.text,
          note: h.note
        }));



      articles.push({

        title: article.title,
        category: article.category,
        timeSpent: t.timeSpent,
        highlights: articleHighlights

      });

    });



    const totalArticles = articles.length;



    res.json({

      totalArticles,
      categoryTime,
      articles

    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});



module.exports = router;