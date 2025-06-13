import express from "express";
import passport from "passport";
import { Signup, login, getUserBookings } from "../controller/user.controller.js";

const router = express.Router();

// Manual signup and login routes
router.post("/signup", Signup);
router.post("/login", login);

// Google OAuth routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (req.user) {
      console.log("Authenticated user:", req.user);

      req.session.user = {
        _id: req.user._id.toString(),
        fullname: req.user.fullname,
        email: req.user.email,
        role: req.user.role,
      }; 
      const userData = {
        _id: req.user._id,
        fullname: req.user.fullname,
        email: req.user.email,
        picture: req.user.picture, // Include profile picture if available
      };
      const query = new URLSearchParams({ user: encodeURIComponent(JSON.stringify(userData)) }).toString();
      res.redirect(`http://localhost:5173/?${query}`); // Redirect to home page
    } else {
      res.redirect("/login");
    }
  }
);

// Get current user
router.get('/me', (req, res) => {
  console.log('Session in /user/me:', req.session);
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(200).json(req.session.user);
});

// Fetch user bookings
router.get("/bookings/:userId", getUserBookings);

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
});

export default router;