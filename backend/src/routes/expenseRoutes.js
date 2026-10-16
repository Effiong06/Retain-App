
import express from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


 // GET /api/expenses
 // Retrieve expenses belonging to the authenticated user
router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve expenses.",
    });
  }
});


// POST /api/expenses
// Create an expense for the authenticated user
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      category,
      date,
      paymentMethod,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      amount === undefined ||
      !category?.trim() ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, category, and payment method are required.",
      });
    }

    // Create the expense and associate it with the logged-in user
    const expense = await Expense.create({
      title,
      description,
      amount,
      category,
      date,
      paymentMethod,
      notes,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create expense error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create expense.",
    });
  }
});


 // PUT /api/expenses/:id
 // Update an expense owned by the authenticated user
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "amount",
      "category",
      "date",
      "paymentMethod",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      expense,
    });
  } catch (error) {
    if (
      error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update expense error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update expense.",
    });
  }
});


 // DELETE /api/expenses/:id
// Delete an expense owned by the authenticated user
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID.",
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error("Delete expense error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete expense.",
    });
  }
});




export default router;
