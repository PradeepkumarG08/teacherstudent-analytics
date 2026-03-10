const mongoose = require("mongoose");

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image", "video", "3d"],
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    contentBlocks: [contentBlockSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);