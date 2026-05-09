// backend/routes/transactions.js

const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transactions by category (filter)
router.get("/category/:cat", async (req, res) => {
  try {
    const transactions = await Transaction.find({ category: req.params.cat });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - add a new transaction
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transaction = new Transaction({ title, amount, type, category });
    await transaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a transaction
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;