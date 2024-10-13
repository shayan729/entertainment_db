const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const router = express.Router();

const userSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email_id: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  Password: { type: String, required: true },
});
const likedMovieSchema = new mongoose.Schema({
  movie_id: { type: Number, required: true, unique: true },
});

const LikedMovie = mongoose.model("LikedMovie", likedMovieSchema);

// Like Movie Route
router.post("/like", async (req, res) => {
  const { movie_id } = req.body;

  try {
    const existingMovie = await LikedMovie.findOne({ movie_id });

    if (existingMovie) {
      return res.status(400).json({ error: "Movie is already in Favourites" });
    }
    
    const likedMovie = new LikedMovie({ movie_id });
    await likedMovie.save();

    res.status(201).json({ message: "Movie liked successfully!" });
  } catch (error) {
    console.error("Error liking movie:", error);
    res.status(500).json({ error: "Failed to like the movie" });
  }
});

// Get all liked movies Route
router.get("/likedMovies", async (req, res) => {
  try {
    const likedMovies = await LikedMovie.find();
    res.status(200).json(likedMovies);
  } catch (error) {
    console.error("Error fetching liked movies:", error);
    res.status(500).json({ error: "Failed to fetch liked movies" });
  }
});


// Create a User model
const User = mongoose.model("User", userSchema);

// User Registration Route
router.post("/register", async (req, res) => {
  const { Name, Email_id, number, Password } = req.body;

  try {
    const existingUser = await User.findOne({ Email_id });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(Password.trim(), 10);

    const newUser = new User({
      Name,
      Email_id,
      number,
      Password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// User Login Route
router.post("/login", async (req, res) => {
  const { Email_id, Password } = req.body;

  try {
    const user = await User.findOne({ Email_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(Password.trim(), user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get User Data Route
router.post('/user', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ Email_id: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { Name, profilePhoto, bio } = user;
    res.json({ Name, profilePhoto, bio });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
