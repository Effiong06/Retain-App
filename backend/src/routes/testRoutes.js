
import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// This route requires a valid JWT
router.get("/private", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You accessed a protected route!",
    user: req.user,
  });
});

export default router;
