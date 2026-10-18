import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "./context/AuthContext";
import type { AppDispatch, RootState } from "./redux/store";
import {
  clearFilters,
  setCategoryFilter,
  setEndDate,
  setExpenses,
  setMaxAmount,
  setMinAmount,
  setPaymentMethodFilter,
  setSearchTerm,
  setSortBy,
  setStartDate,
} from "./redux/expenseSlice";
import { selectFilteredExpenses } from "./redux/expenseSelectors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "./api/expenses";
import type { Expense, ExpenseInput } from "./api/expenses";
import { getBudget, saveBudget } from "./api/budget";
import type { Budget } from "./api/budget";
import "./App.css";

const emptyExpenseForm: ExpenseInput = {
  title: "",
  description: "",
  amount: 0,
  category: "Food",
  date: new Date().toLocaleDateString("en-CA"),
  paymentMethod: "Mobile Money",
  notes: "",
};

const defaultCategories = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Healthcare",
  "Education",
  "Entertainment",
  "Shopping",
  "Other",
];

const paymentMethodOptions = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Mobile Money",
  "Bank Transfer",
  "Other",
];

function App() {
  const { user, token, logout } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses,
  );
  const filteredExpenses = useSelector(selectFilteredExpenses);

  const {
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = useSelector((state: RootState) => state.expenses);

  // Pagination: display five filtered expenses per page.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Return to the first page when the active filters or sorting change.
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ]);

  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState("");

  const [budget, setBudget] = useState<Budget | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(
    null,
  );
  const [expenseForm, setExpenseForm] =
    useState<ExpenseInput>(emptyExpenseForm);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseDeletingId, setExpenseDeletingId] = useState<string | null>(
    null,
  );
  const [expenseFormError, setExpenseFormError] = useState("");
  const [expenseMessage, setExpenseMessage] = useState("");

  // Load the logged-in user's expenses.
  useEffect(() => {
    if (!token) {
      dispatch(setExpenses([]));
      setExpensesLoading(false);
      setExpensesError("");
      return;
    }

    let cancelled = false;

    async function loadExpenses() {
      try {
        setExpensesLoading(true);
        setExpensesError("");
        const data = await getExpenses(token!);

        if (!cancelled) {
          dispatch(setExpenses(data));
        }
      } catch (error) {
        if (!cancelled) {
          setExpensesError(
            error instanceof Error
              ? error.message
              : "Failed to load expenses.",
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

  // Load the logged-in user's budget.
  useEffect(() => {
    if (!token) {
      setBudget(null);
      setBudgetInput("");
      setBudgetLoading(false);
      setBudgetError("");
      setBudgetMessage("");
      return;
    }

    let cancelled = false;

    async function loadBudget() {
      try {
        setBudgetLoading(true);
        setBudgetError("");
        const savedBudget = await getBudget(token!);

        if (!cancelled) {
          setBudget(savedBudget);
          setBudgetInput(
            savedBudget ? String(savedBudget.monthlyLimit) : "",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setBudgetError(
            error instanceof Error
              ? error.message
              : "Failed to load your budget.",
          );
        }
      } finally {
        if (!cancelled) {
          setBudgetLoading(false);
        }
      }
    }

    void loadBudget();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const monthlySpending = monthlyExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const highestExpense = expenses.reduce(
    (highest, expense) => Math.max(highest, expense.amount),
    0,
  );

  const remainingBudget =
    budget !== null ? budget.monthlyLimit - monthlySpending : null;

  const spendingByCategory = monthlyExpenses.reduce<
    Record<string, number>
  >((totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});

  const categoryTotals = Object.entries(spendingByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);

  async function refreshExpenses() {
    if (!token) return;
    const data = await getExpenses(token);
    dispatch(setExpenses(data));
  }

  function resetExpenseForm() {
    setExpenseForm({ ...emptyExpenseForm });
    setEditingExpenseId(null);
    setShowExpenseForm(false);
    setExpenseFormError("");
  }

  function startCreateExpense() {
    setExpenseForm({ ...emptyExpenseForm });
    setEditingExpenseId(null);
    setExpenseFormError("");
    setExpenseMessage("");
    setShowExpenseForm(true);
  }

  function startEditExpense(expense: Expense) {
    setExpenseForm({
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount,
      category: expense.category,
      date: expense.date.slice(0, 10),
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    });
    setEditingExpenseId(expense._id);
    setExpenseFormError("");
    setExpenseMessage("");
    setShowExpenseForm(true);

    document.getElementById("expense-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleSaveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setExpenseFormError("Please log in to manage your expenses.");
      return;
    }

    if (!expenseForm.title.trim()) {
      setExpenseFormError("Please enter an expense title.");
      return;
    }

    if (
      !Number.isFinite(Number(expenseForm.amount)) ||
      Number(expenseForm.amount) <= 0
    ) {
      setExpenseFormError("Enter an amount greater than zero.");
      return;
    }

    try {
      setExpenseSaving(true);
      setExpenseFormError("");
      setExpenseMessage("");

      const payload: ExpenseInput = {
        ...expenseForm,
        title: expenseForm.title.trim(),
        description: expenseForm.description.trim(),
        notes: expenseForm.notes.trim(),
        amount: Number(expenseForm.amount),
      };

      if (editingExpenseId) {
        await updateExpense(token, editingExpenseId, payload);
      } else {
        await createExpense(token, payload);
      }

      await refreshExpenses();
      resetExpenseForm();
      setExpenseMessage(
        editingExpenseId
          ? "Expense updated successfully."
          : "Expense added successfully.",
      );
    } catch (error) {
      setExpenseFormError(
        error instanceof Error
          ? error.message
          : "Failed to save the expense.",
      );
    } finally {
      setExpenseSaving(false);
    }
  }

  async function handleDeleteExpense(expense: Expense) {
    if (!token) {
      setExpensesError("Please log in to manage your expenses.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setExpenseDeletingId(expense._id);
      setExpensesError("");
      setExpenseMessage("");
      await deleteExpense(token, expense._id);
      await refreshExpenses();

      if (editingExpenseId === expense._id) {
        resetExpenseForm();
      }

      setExpenseMessage("Expense deleted successfully.");
    } catch (error) {
      setExpensesError(
        error instanceof Error
          ? error.message
          : "Failed to delete the expense.",
      );
    } finally {
      setExpenseDeletingId(null);
    }
  }

  async function handleSaveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setBudgetError("Please log in to manage your budget.");
      return;
    }

    if (budgetInput.trim() === "") {
      setBudgetError("Please enter a monthly budget.");
      return;
    }

    const monthlyLimit = Number(budgetInput);
    if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
      setBudgetError("Enter a valid, non-negative budget amount.");
      return;
    }

    try {
      setBudgetSaving(true);
      setBudgetError("");
      setBudgetMessage("");
      const savedBudget = await saveBudget(token, monthlyLimit);
      setBudget(savedBudget);
      setBudgetInput(String(savedBudget.monthlyLimit));
      setBudgetMessage("Your monthly budget was saved successfully.");
    } catch (error) {
      setBudgetError(
        error instanceof Error
          ? error.message
          : "Failed to save your budget.",
      );
    } finally {
      setBudgetSaving(false);
    }
  }

  if (!user) {
    if (window.location.pathname === "/register") {
      return <Register />;
    }
    return <Login />;
  }

  const categories = [
    ...new Set([
      ...defaultCategories,
      ...expenses.map((expense) => expense.category),
    ]),
  ].sort();

  const paymentMethods = [
    ...new Set([
      ...paymentMethodOptions,
      ...expenses.map((expense) => expense.paymentMethod),
    ]),
  ].sort();

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">
          retain<span>.</span>
        </h1>

        <p className="nav-heading">WORKSPACE</p>
        <nav>
          <a href="/" className="nav-link active">Dashboard</a>
          <a href="#transactions" className="nav-link">Transactions</a>
          <a href="#budgets" className="nav-link">Budgets</a>
          <a href="#reports" className="nav-link">Reports</a>
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
            <p>Understand your spending and make every amount count.</p>
          </div>
          <div className="welcome-icon">↗</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <p>Monthly spending</p>
            <h3>{formatCurrency(monthlySpending)}</h3>
            <span className="stat-note">Your spending this month</span>
          </article>
          <article className="stat-card">
            <p>Monthly budget</p>
            <h3>
              {budgetLoading
                ? "Loading..."
                : budget
                  ? formatCurrency(budget.monthlyLimit)
                  : "Not set"}
            </h3>
            <span className="stat-note">Your planned spending limit</span>
          </article>
          <article className="stat-card">
            <p>Budget remaining</p>
            <h3>
              {budgetLoading
                ? "Loading..."
                : remainingBudget !== null
                  ? formatCurrency(remainingBudget)
                  : "—"}
            </h3>
            <span className="stat-note">
              {remainingBudget !== null && remainingBudget < 0
                ? "You have exceeded your monthly budget"
                : "Available for this month"}
            </span>
          </article>
          <article className="stat-card">
            <p>Highest expense</p>
            <h3>{formatCurrency(highestExpense)}</h3>
            <span className="stat-note">Your largest single expense</span>
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

            {categoryTotals.length === 0 ? (
              <div className="empty-chart">
                <div className="chart-icon">◴</div>
                <h4>Your spending story starts here</h4>
                <p>Add expenses to see your financial activity.</p>
              </div>
            ) : (
              <div className="category-breakdown">
                {categoryTotals.map(([category, amount]) => (
                  <div className="category-item" key={category}>
                    <div className="panel-heading">
                      <strong>{category}</strong>
                      <strong>{formatCurrency(amount)}</strong>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${
                            monthlySpending > 0
                              ? (amount / monthlySpending) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel category-panel">
            <div className="panel-heading">
              <div>
                <h3>Spending by category</h3>
                <p>Where your money goes this month</p>
              </div>
            </div>

            {categoryTotals.length === 0 ? (
              <div className="empty-category">
                <div className="category-ring">0%</div>
                <p>No spending data yet.</p>
              </div>
            ) : (
              <div className="category-breakdown">
                {categoryTotals.map(([category, amount]) => (
                  <div className="category-item" key={category}>
                    <div className="panel-heading">
                      <span>{category}</span>
                      <strong>
                        {monthlySpending > 0
                          ? `${Math.round(
                              (amount / monthlySpending) * 100,
                            )}%`
                          : "0%"}
                      </strong>
                    </div>
                    <span className="stat-note">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="panel transactions-panel" id="transactions">
          <div className="panel-heading">
            <div>
              <h3>Transactions</h3>
              <p>Search, filter, sort, and manage your expenses.</p>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={startCreateExpense}
            >
              + Add expense
            </button>
          </div>

          {showExpenseForm && (
            <form
              id="expense-form"
              className="expense-form"
              onSubmit={handleSaveExpense}
            >
              <h3>{editingExpenseId ? "Edit expense" : "Add an expense"}</h3>

              <div className="expense-form-grid">
                <label>
                  Title *
                  <input
                    type="text"
                    value={expenseForm.title}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        title: event.target.value,
                      })
                    }
                    placeholder="e.g. Groceries"
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Amount (RWF) *
                  <input
                    type="number"
                    value={expenseForm.amount || ""}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: Number(event.target.value),
                      })
                    }
                    min="0"
                    step="1"
                    required
                  />
                </label>

                <label>
                  Category *
                  <select
                    value={expenseForm.category}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: event.target.value,
                      })
                    }
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Date *
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        date: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Payment method *
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        paymentMethod: event.target.value,
                      })
                    }
                    required
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Description
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="What was this expense for?"
                    maxLength={300}
                  />
                </label>

                <label className="expense-notes-field">
                  Notes
                  <textarea
                    value={expenseForm.notes}
                    onChange={(event) =>
                      setExpenseForm({
                        ...expenseForm,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Optional notes"
                    rows={3}
                    maxLength={1000}
                  />
                </label>
              </div>

              {expenseFormError && (
                <p className="form-error" role="alert">
                  {expenseFormError}
                </p>
              )}

              <div className="expense-form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={expenseSaving}
                >
                  {expenseSaving
                    ? "Saving..."
                    : editingExpenseId
                      ? "Save changes"
                      : "Add expense"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetExpenseForm}
                  disabled={expenseSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {expenseMessage && (
            <p className="form-success" role="status">
              {expenseMessage}
            </p>
          )}

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

            <input
              type="date"
              aria-label="Start date"
              title="Start date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => dispatch(setStartDate(event.target.value))}
            />

            <input
              type="date"
              aria-label="End date"
              title="End date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => dispatch(setEndDate(event.target.value))}
            />

            <input
              type="number"
              aria-label="Minimum amount"
              title="Minimum amount (RWF)"
              placeholder="Min amount"
              min="0"
              step="1"
              value={minAmount}
              onChange={(event) => dispatch(setMinAmount(event.target.value))}
            />

            <input
              type="number"
              aria-label="Maximum amount"
              title="Maximum amount (RWF)"
              placeholder="Max amount"
              min="0"
              step="1"
              value={maxAmount}
              onChange={(event) => dispatch(setMaxAmount(event.target.value))}
            />

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
                      | "lowest",
                  ),
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
              <p role="alert">{expensesError}</p>
            ) : filteredExpenses.length === 0 ? (
              <p>No expenses match your search or filters.</p>
            ) : (
              <div className="expense-list">
                {paginatedExpenses.map((expense) => (
                  <article className="expense-row" key={expense._id}>
                    <div className="expense-details">
                      <strong>{expense.title}</strong>
                      <p>
                        {expense.category} · {expense.paymentMethod}
                      </p>
                      {expense.description && <p>{expense.description}</p>}
                      <span>
                        {new Date(expense.date).toLocaleDateString("en-GB")}
                      </span>
                      {expense.notes && (
                        <p className="stat-note">Notes: {expense.notes}</p>
                      )}
                    </div>

                    <div className="expense-row-actions">
                      <strong className="expense-amount">
                        {formatCurrency(expense.amount)}
                      </strong>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEditExpense(expense)}
                        disabled={expenseDeletingId === expense._id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void handleDeleteExpense(expense)}
                        disabled={expenseDeletingId === expense._id}
                      >
                        {expenseDeletingId === expense._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {!expensesLoading && !expensesError && expenses.length > 0 && (
            <>
              <p className="stat-note">
                Showing{" "}
                {filteredExpenses.length === 0 ? 0 : startIndex + 1}
                {"–"}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredExpenses.length,
                )}
                {" of "}
                {filteredExpenses.length} filtered expenses
                {" ("}
                {expenses.length} total
                {")"}
              </p>

              {filteredExpenses.length > itemsPerPage && (
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="stat-note">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="panel" id="budgets">
          <div className="panel-heading">
            <div>
              <h3>Monthly budget</h3>
              <p>Set a spending limit for the current month.</p>
            </div>
          </div>

          {budgetLoading ? (
            <p>Loading your budget...</p>
          ) : (
            <form onSubmit={handleSaveBudget} className="budget-form">
              <label htmlFor="monthlyLimit">Monthly budget (RWF)</label>
              <input
                id="monthlyLimit"
                type="number"
                min="0"
                step="1"
                value={budgetInput}
                onChange={(event) => {
                  setBudgetInput(event.target.value);
                  setBudgetError("");
                  setBudgetMessage("");
                }}
                placeholder="Enter your monthly budget"
                required
              />
              <button
                type="submit"
                className="primary-button"
                disabled={budgetSaving}
              >
                {budgetSaving
                  ? "Saving..."
                  : budget
                    ? "Update budget"
                    : "Set budget"}
              </button>
            </form>
          )}

          {budgetError && (
            <p role="alert" className="form-error">
              {budgetError}
            </p>
          )}
          {budgetMessage && (
            <p role="status" className="form-success">
              {budgetMessage}
            </p>
          )}
          {!budgetLoading && budget && (
            <p className="stat-note">
              Current monthly limit: {formatCurrency(budget.monthlyLimit)}
            </p>
          )}
        </section>

        <footer>Retain © 2026 · Make your money matter.</footer>
      </main>
    </div>
  );
}

export default App;