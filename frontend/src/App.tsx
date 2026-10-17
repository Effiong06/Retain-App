
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./redux/store";
import {
  setExpenses,
  setSearchTerm,
  setCategoryFilter,
  setPaymentMethodFilter,
  setSortBy,
  clearFilters,
} from "./redux/expenseSlice";
import { selectFilteredExpenses } from "./redux/expenseSelectors";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getExpenses } from "./api/expenses";
import "./App.css";

function App() {
  const { user, token, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );
  const filteredExpenses = useSelector(selectFilteredExpenses);
  const { searchTerm, categoryFilter, paymentMethodFilter, sortBy } =
    useSelector((state: RootState) => state.expenses);

  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState("");

  useEffect(() => {
    if (!token) {
      dispatch(setExpenses([]));
      setExpensesLoading(false);
      return;
    }

    let cancelled = false;

    async function loadExpenses() {
      try {
        setExpensesLoading(true);
        setExpensesError("");

        const data = await getExpenses(token);

        if (!cancelled) {
          dispatch(setExpenses(data));
        }
      } catch (error) {
        if (!cancelled) {
          setExpensesError(
            error instanceof Error
              ? error.message
              : "Failed to load expenses."
          );
        }
      } finally {
        if (!cancelled) {
          setExpensesLoading(false);
        }
      }
    }

    void loadExpenses();

    return () => {
      cancelled = true;
    };
  }, [token, dispatch]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const monthlySpending = monthlyExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const highestExpense = expenses.reduce(
    (highest, expense) => Math.max(highest, expense.amount),
    0
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);

  if (!user) {
    if (window.location.pathname === "/register") {
      return <Register />;
    }

    return <Login />;
  }

  const categories = [
    ...new Set(expenses.map((expense) => expense.category)),
  ].sort();

  const paymentMethods = [
    ...new Set(expenses.map((expense) => expense.paymentMethod)),
  ].sort();

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">
          retain<span>.</span>
        </h1>

        <p className="nav-heading">WORKSPACE</p>

        <nav>
          <a href="/" className="nav-link active">
            Dashboard
          </a>
          <a href="#transactions" className="nav-link">
            Transactions
          </a>
          <a href="#budgets" className="nav-link">
            Budgets
          </a>
          <a href="#reports" className="nav-link">
            Reports
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user.name}</strong>
            <p>{user.email}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR FINANCES, IN CONTROL</p>
            <h2>Dashboard</h2>
          </div>

          <button
            className="profile-button"
            onClick={logout}
            title="Log out"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR FINANCIAL OVERVIEW</p>
            <h2>Take control of your money.</h2>
            <p>
              Understand your spending and make every amount count.
            </p>
          </div>

          <div className="welcome-icon">↗</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <p>Monthly spending</p>
            <h3>{formatCurrency(monthlySpending)}</h3>
            <span className="stat-note">
              Your spending this month
            </span>
          </article>

          <article className="stat-card">
            <p>Monthly budget</p>
            <h3>RWF 0</h3>
            <span className="stat-note">
              Your planned spending limit
            </span>
          </article>

          <article className="stat-card">
            <p>Budget remaining</p>
            <h3>RWF 0</h3>
            <span className="stat-note">
              Available for this month
            </span>
          </article>

          <article className="stat-card">
            <p>Highest expense</p>
            <h3>{formatCurrency(highestExpense)}</h3>
            <span className="stat-note">
              Your largest single expense
            </span>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel spending-panel" id="reports">
            <div className="panel-heading">
              <div>
                <h3>Spending overview</h3>
                <p>Your monthly spending at a glance</p>
              </div>

              <span className="period-label">This month</span>
            </div>

            <div className="empty-chart">
              <div className="chart-icon">▥</div>
              <h4>Your spending story starts here</h4>
              <p>Add expenses to see your financial activity.</p>
            </div>
          </article>

          <article className="panel category-panel">
            <div className="panel-heading">
              <div>
                <h3>Spending by category</h3>
                <p>Where your money goes</p>
              </div>
            </div>

            <div className="empty-category">
              <div className="category-ring">0%</div>
              <p>No spending data yet.</p>
            </div>
          </article>
        </section>

        <section className="panel transactions-panel" id="transactions">
          <div className="panel-heading">
            <div>
              <h3>Transactions</h3>
              <p>Search, filter, and sort your expenses.</p>
            </div>
          </div>

          <div className="expense-filters">
            <input
              type="search"
              placeholder="Search expenses..."
              aria-label="Search expenses"
              value={searchTerm}
              onChange={(event) =>
                dispatch(setSearchTerm(event.target.value))
              }
            />

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(event) =>
                dispatch(setCategoryFilter(event.target.value))
              }
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by payment method"
              value={paymentMethodFilter}
              onChange={(event) =>
                dispatch(setPaymentMethodFilter(event.target.value))
              }
            >
              <option value="All">All payment methods</option>
              {paymentMethods.map((method) => (
                <option value={method} key={method}>
                  {method}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort expenses"
              value={sortBy}
              onChange={(event) =>
                dispatch(
                  setSortBy(
                    event.target.value as
                      | "newest"
                      | "oldest"
                      | "highest"
                      | "lowest"
                  )
                )
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>

            <button
              type="button"
              className="secondary-button"
              onClick={() => dispatch(clearFilters())}
            >
              Clear filters
            </button>
          </div>

          <div className="empty-transactions">
            {expensesLoading ? (
              <p>Loading your expenses...</p>
            ) : expensesError ? (
              <p>{expensesError}</p>
            ) : filteredExpenses.length === 0 ? (
              <p>No expenses match your search or filters.</p>
            ) : (
              <div className="expense-list">
                {filteredExpenses.map((expense) => (
                  <article className="expense-row" key={expense._id}>
                    <div className="expense-details">
                      <strong>{expense.title}</strong>
                      <p>
                        {expense.category} · {expense.paymentMethod}
                      </p>
                      <span>
                        {new Date(expense.date).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                    </div>

                    <strong className="expense-amount">
                      {formatCurrency(expense.amount)}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </div>

          {!expensesLoading && !expensesError && expenses.length > 0 && (
            <p className="stat-note">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          )}
        </section>

        <section className="panel" id="budgets">
          <div className="panel-heading">
            <div>
              <h3>Budgets</h3>
              <p>Monthly budget management is coming next.</p>
            </div>
          </div>
        </section>

        <footer>Retain © 2026 · Make your money matter.</footer>
      </main>
    </div>
  );
}

export default App;
