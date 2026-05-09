// frontend/src/App.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/transactions";

const CATEGORIES: string[] = ["Food", "Rent", "Salary", "Transport", "Shopping", "Other"];

// TypeScript type for a transaction object
interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<string>("Food");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [error, setError] = useState<string>("");

  // Fetch all transactions from backend
  const fetchTransactions = async (): Promise<void> => {
    try {
      const res = await axios.get<Transaction[]>(API);
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  // Load transactions when the page opens
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add a new transaction
  const handleAdd = async (): Promise<void> => {
    if (!title || !amount) {
      setError("Please fill in title and amount.");
      return;
    }
    setError("");

    try {
      await axios.post(API, {
        title,
        amount: parseFloat(amount),
        type,
        category,
      });
      setTitle("");
      setAmount("");
      fetchTransactions();
    } catch (err) {
      setError("Failed to add transaction.");
    }
  };

  // Delete a transaction
  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchTransactions();
    } catch (err) {
      if (err instanceof Error) {
        console.error("Delete failed:", err.message);
      }
    }
  };

  // Calculate summary totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Filter transactions by category
  const filtered =
    filterCategory === "All"
      ? transactions
      : transactions.filter((t) => t.category === filterCategory);

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      {/* Dashboard Summary */}
      <div className="dashboard">
        <div className="card balance">
          <h3>Balance</h3>
          <p>Rs. {balance.toFixed(2)}</p>
        </div>
        <div className="card income">
          <h3>Total Income</h3>
          <p>Rs. {totalIncome.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>Total Expenses</h3>
          <p>Rs. {totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="form-box">
        <h2>Add Transaction</h2>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Title (e.g. Grocery)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount (e.g. 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button onClick={handleAdd}>Add Transaction</button>
      </div>

      {/* Category Filter */}
      <div className="filter-box">
        <h2>Transaction History</h2>
        <label>Filter by Category: </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div className="transaction-list">
        {filtered.length === 0 && <p>No transactions found.</p>}
        {filtered.map((t) => (
          <div
            key={t._id}
            className={`transaction-item ${t.type === "income" ? "income-item" : "expense-item"}`}
          >
            <div className="transaction-info">
              <span className="transaction-title">{t.title}</span>
              <span className="transaction-category">{t.category}</span>
            </div>
            <div className="transaction-right">
              <span className="transaction-amount">
                {t.type === "income" ? "+" : "-"} Rs. {t.amount}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(t._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;