const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({

  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  views: {
    type: Number,
    default: 1
  },

  duration: {
    type: Number, // seconds
    default: 0
  },

  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Analytics", analyticsSchema);