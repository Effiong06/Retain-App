
import express from "express";
import Budget from "../models/Budget.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get the logged-in user's budget
router.get("/", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findOne({ user: req.user.id });

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve budget",
    });
  }
});

// Create or update the logged-in user's budget
router.put("/", authMiddleware, async (req, res) => {
  try {
    const monthlyLimit = Number(req.body.monthlyLimit);

    if (
      req.body.monthlyLimit === undefined ||
      req.body.monthlyLimit === null ||
      req.body.monthlyLimit === "" ||
      !Number.isFinite(monthlyLimit) ||
      monthlyLimit < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid, non-negative monthly budget",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id },
      { $set: { monthlyLimit } },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Budget saved successfully",
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save budget",
    });
  }
});

export default router;
