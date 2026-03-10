const mongoose = require("mongoose");

const HighlightSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true
  },

  text: {
    type: String,
    default: ""
  },

  note: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Highlight", HighlightSchema);