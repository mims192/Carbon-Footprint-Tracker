// backend/src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/Users.js"; // make sure your model default export name matches this

const router = express.Router();

// Signup - create user
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password required" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Use the model name you imported (User)
    const user = new User({
      username,
      email,
      passwordHash: hash,
      points: 0,
      level: 1
    });

    await user.save();

    // return minimal user data (no password)
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login - validate password and return user object
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // return minimal user object (no password)
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user profile by id (for frontend to fetch user details)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
