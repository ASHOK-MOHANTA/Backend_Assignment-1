const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

// Create a blog (logged-in users)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const blog = new Blog({ title, content, tags, createdBy: req.user.id });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error creating blog", error: err.message });
  }
});

// Get all blogs created by logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs", error: err.message });
  }
});

// Update a blog (only if owner)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).json({ message: "Invalid blog id" });

    const blog = await Blog.findOne({ _id: blogId, createdBy: req.user.id });
    if (!blog) return res.status(404).json({ message: "Blog not found or not authorized" });

    blog.title = req.body.title ?? blog.title;
    blog.content = req.body.content ?? blog.content;
    if (req.body.tags) blog.tags = req.body.tags;

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error updating blog", error: err.message });
  }
});

// Delete a blog (only if owner)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).json({ message: "Invalid blog id" });

    const blog = await Blog.findOneAndDelete({ _id: blogId, createdBy: req.user.id });
    if (!blog) return res.status(404).json({ message: "Blog not found or not authorized" });

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting blog", error: err.message });
  }
});

/*
 Aggregation route: GET /blogs/stats
 Returns:
  - totalBlogs: number
  - blogsPerUser: [{ userId, name, email, count }]
  - topTags: [{ tag, count }] - top 10 tags
*/
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const BlogModel = Blog.collection; // raw collection for aggregation

    // 1) Total number of blogs
    const totalBlogsPromise = Blog.countDocuments();

    // 2) Blog count per user (with user info)
    const blogsPerUserPromise = Blog.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 3) Most common tags
    const topTagsPromise = Blog.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const [totalBlogs, blogsPerUser, topTags] = await Promise.all([
      totalBlogsPromise,
      blogsPerUserPromise,
      topTagsPromise
    ]);

    res.json({ totalBlogs, blogsPerUser, topTags });
  } catch (err) {
    res.status(500).json({ message: "Aggregation error", error: err.message });
  }
});

module.exports = router;
