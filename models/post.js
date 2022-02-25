const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // String will actually work, but of course that should be required: true
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("post", postSchema);
