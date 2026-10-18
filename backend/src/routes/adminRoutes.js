import express from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// All routes in this file require login and admin privileges.
router.use(protect, adminOnly);

// GET /api/admin/categories
// Get all categories.
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve categories.",
    });
  }
});

// POST /api/admin/categories
// Create a category.
router.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot exceed 50 characters.",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be text.",
      });
    }

    if (description && description.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 200 characters.",
      });
    }

    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "This category already exists.",
      });
    }

    const category = await Category.create({
      name: trimmedName,
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This category already exists.",
      });
    }

    console.error("Create category error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create category.",
    });
  }
});

// PUT /api/admin/categories/:id
// Update a category.
router.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    if (
      name === undefined &&
      description === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a category name or description to update.",
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty.",
        });
      }

      if (name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot exceed 50 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be text.",
        });
      }

      if (description.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 200 characters.",
        });
      }

      updates.description = description.trim();
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    console.error("Update category error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update category.",
    });
  }
});

// DELETE /api/admin/categories/:id
// Delete a category.
router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Delete category error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete category.",
    });
  }
});

// GET /api/admin/stats
// Return platform-wide statistics for the admin dashboard.
router.get("/stats", async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const Expense = (await import("../models/Expense.js")).default;

    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [
      registeredUsers,
      totalExpenses,
      totalExpenseValue,
      expensesThisMonth,
      expensesByCategory,
      mostUsedCategories,
      leastUsedCategories,
      recentExpenses,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),

      Expense.countDocuments(),

      Expense.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      Expense.countDocuments({
        date: { $gte: monthStart },
      }),

      Expense.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),

      Expense.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 5 },
      ]),

      Expense.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: 1, _id: 1 } },
        { $limit: 5 },
      ]),

      Expense.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email"),

      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        registeredUsers,
        totalExpenses,
        totalExpenseValue: totalExpenseValue[0]?.total || 0,
        expensesThisMonth,
        expensesByCategory,
        mostUsedCategories,
        leastUsedCategories,
        recentExpenses,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin statistics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve admin statistics.",
    });
  }
});

export default router;