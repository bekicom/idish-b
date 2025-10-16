const Expense = require("../models/Expense");

const addExpense = async (req, res) => {
  const { amount, date, category, description, paidTo, storeId } = req.body;

  if (!amount || !date || !category) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newExpense = new Expense({
      amount,
      date,
      category,
      description,
      paidTo,
      userId: req.user._id,
      storeId
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, date, category, description, paidTo } = req.body;

  try {
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    // if (expense.userId.toString() !== req.user._id.toString()) {
    //   return res.status(401).json({ message: "Not authorized." });
    // }

    expense.amount = amount || expense.amount;
    expense.date = date || expense.date;
    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.paidTo = paidTo || expense.paidTo;

    await expense.save();
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    // if (expense.userId.toString() !== req.user._id.toString()) {
    //   return res.status(400).json({ message: "Not authorized." });
    // }

    await expense.remove();
    res.status(200).json({ message: "Expense removed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
