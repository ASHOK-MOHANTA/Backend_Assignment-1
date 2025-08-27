import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  _id: String,
  title: String,
  genre: String,
  releaseYear: Number,
  durationMins: Number,
});

export default mongoose.model("Movie", movieSchema);
