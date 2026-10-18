import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/admin";

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentExpense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface AdminStats {
  registeredUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  expensesByCategory: {
    _id: string;
    count: number;
    totalAmount: number;
  }[];
  mostUsedCategories: {
    _id: string;
    count: number;
  }[];
  leastUsedCategories: {
    _id: string;
    count: number;
  }[];
  recentExpenses: RecentExpense[];
  recentUsers: RecentUser[];
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);

  const requestHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [statsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers: requestHeaders }),
        fetch(`${API_URL}/categories`, { headers: requestHeaders }),
      ]);

      const statsData = await statsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!statsResponse.ok) {
        throw new Error(statsData.message || "Could not load platform statistics.");
      }

      if (!categoriesResponse.ok) {
        throw new Error(categoriesData.message || "Could not load categories.");
      }

      setStats(statsData.stats);
      setCategories(categoriesData.categories);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load the admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!categoryName.trim()) {
      setError("Please enter a category name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create the category.");
      }

      setCategoryName("");
      setCategoryDescription("");
      setMessage("Category created successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Delete the category "${category.name}"? Existing expenses will not be deleted.`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/categories/${category._id}`, {
        method: "DELETE",
        headers: requestHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the category.");
      }

      setMessage(`"${category.name}" was deleted.`);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the category.");
    }
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <h1 className="admin-logo">retain<span>.</span></h1>
        <p className="admin-nav-heading">ADMINISTRATION</p>
        <a className="admin-nav-link active" href="#admin-overview">Overview</a>
        <a className="admin-nav-link" href="#admin-categories">Categories</a>
        <a className="admin-nav-link" href="#admin-users">Users</a>
        <a className="admin-nav-link" href="#admin-expenses">Expenses</a>

        <div className="admin-sidebar-bottom">
          <div className="admin-avatar">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user?.name}</strong>
            <p>Administrator</p>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">RETAIN PLATFORM MANAGEMENT</p>
            <h2>Admin Dashboard</h2>
          </div>
          <button className="admin-logout" onClick={logout}>Log out</button>
        </header>

        <section className="admin-welcome" id="admin-overview">
          <p className="admin-eyebrow">PLATFORM OVERVIEW</p>
          <h2>Welcome, {user?.name}.</h2>
          <p>Monitor platform activity and manage expense categories.</p>
        </section>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        {loading ? (
          <p className="admin-loading">Loading platform statistics...</p>
        ) : stats ? (
          <>
            <section className="admin-stats-grid">
              <article className="admin-stat-card">
                <p>Registered users</p>
                <h3>{stats.registeredUsers}</h3>
              </article>
              <article className="admin-stat-card">
                <p>Total expenses</p>
                <h3>{stats.totalExpenses}</h3>
              </article>
              <article className="admin-stat-card">
                <p>Total expense value</p>
                <h3>{formatCurrency(stats.totalExpenseValue)}</h3>
              </article>
              <article className="admin-stat-card">
                <p>Expenses this month</p>
                <h3>{stats.expensesThisMonth}</h3>
              </article>
            </section>

            <section className="admin-panel">
              <h3>Spending by category</h3>
              {stats.expensesByCategory.length === 0 ? (
                <p>No expenses recorded yet.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Category</th><th>Transactions</th><th>Total value</th></tr>
                    </thead>
                    <tbody>
                      {stats.expensesByCategory.map((item) => (
                        <tr key={item._id}>
                          <td>{item._id}</td>
                          <td>{item.count}</td>
                          <td>{formatCurrency(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-two-column">
              <div className="admin-panel">
                <h3>Most-used categories</h3>
                {stats.mostUsedCategories.length === 0 ? <p>No data yet.</p> :
                  stats.mostUsedCategories.map((item) => (
                    <div className="admin-list-row" key={item._id}>
                      <span>{item._id}</span><strong>{item.count} expenses</strong>
                    </div>
                  ))}
              </div>
              <div className="admin-panel">
                <h3>Least-used categories</h3>
                {stats.leastUsedCategories.length === 0 ? <p>No data yet.</p> :
                  stats.leastUsedCategories.map((item) => (
                    <div className="admin-list-row" key={item._id}>
                      <span>{item._id}</span><strong>{item.count} expenses</strong>
                    </div>
                  ))}
              </div>
            </section>

            <section className="admin-panel" id="admin-categories">
              <h3>Category management</h3>
              <p className="admin-muted">Create and remove platform expense categories.</p>

              <form className="admin-category-form" onSubmit={handleCreateCategory}>
                <label>
                  Category name
                  <input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="e.g. Personal Care"
                    maxLength={50}
                    required
                  />
                </label>
                <label>
                  Description
                  <input
                    value={categoryDescription}
                    onChange={(event) => setCategoryDescription(event.target.value)}
                    placeholder="Optional description"
                    maxLength={200}
                  />
                </label>
                <button type="submit" disabled={saving}>
                  {saving ? "Adding..." : "Add category"}
                </button>
              </form>

              {categories.length === 0 ? <p>No categories created yet.</p> : (
                <div className="admin-category-list">
                  {categories.map((category) => (
                    <div className="admin-category-item" key={category._id}>
                      <div>
                        <strong>{category.name}</strong>
                        <p>{category.description || "No description"}</p>
                      </div>
                      <button
                        className="admin-delete-button"
                        onClick={() => void handleDeleteCategory(category)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-panel" id="admin-users">
              <h3>Recently registered users</h3>
              {stats.recentUsers.length === 0 ? <p>No users found.</p> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((recentUser) => (
                        <tr key={recentUser._id}>
                          <td>{recentUser.name}</td>
                          <td>{recentUser.email}</td>
                          <td><span className="admin-role">{recentUser.role}</span></td>
                          <td>{new Date(recentUser.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-panel" id="admin-expenses">
              <h3>Recent platform expenses</h3>
              {stats.recentExpenses.length === 0 ? <p>No expenses found.</p> : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Expense</th><th>Category</th><th>Amount</th><th>User</th><th>Added</th></tr>
                    </thead>
                    <tbody>
                      {stats.recentExpenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>{expense.title}</td>
                          <td>{expense.category}</td>
                          <td>{formatCurrency(expense.amount)}</td>
                          <td>{expense.user?.name || "Unknown"}</td>
                          <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <p className="admin-loading">No statistics are available.</p>
        )}
      </main>
    </div>
  );
}
