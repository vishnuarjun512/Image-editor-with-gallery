const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const port = 3000;

// Connect to MongoDB (Make sure MongoDB is running)
mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();
// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(403).json({ error: "User already Registered" });
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      // Save the user to the database
      await newUser.save();

      res.status(201).json({ message: "User created successfully!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("Login Successfull");
    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const postSchema = new mongoose.Schema({
  path: String,
  user_id: String,
});

const Post = mongoose.model("Post", postSchema);

app.post("/createPost", async (req, res) => {
  try {
    const path = req.body.path;
    const userId = req.body.user_id;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(403).json({ message: "Unauthorized" });
    }
    const newPost = new Post({
      path: path,
      user_id: userId,
    });
    await newPost.save();
    console.log("Created Post Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/getUserPosts", async (req, res) => {
  const userId = req.body.user_id;
  console.log("entered getUserposts");
  try {
    const posts = await Post.find({ user_id: userId });

    // Check if the array of posts is not empty
    if (posts.length > 0) {
      // Send the posts as a response
      res.status(200).json({ posts });
    } else {
      // If no posts are found, send a 404 status and message
      res.status(404).json({ message: "No posts found for the user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
