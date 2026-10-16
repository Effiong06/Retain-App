
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import "./App.css";
import Register from "./pages/Register";

function App() {
  const { user, logout } = useAuth();

  if (!user) {
    if (window.location.pathname === "/register") {
      return <Register />;
    }

    return <Login />;
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">retain<span>.</span></h1>
        <p className="nav-heading">WORKSPACE</p>

        <nav>
          <a href="#" className="nav-link active">▦ Dashboard</a>
          <a href="#" className="nav-link">↔ Transactions</a>
          <a href="#" className="nav-link">▤ Budgets</a>
          <a href="#" className="nav-link">▥ Reports</a>
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
          <button className="profile-button" onClick={logout}>
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
            <h3>RWF 0</h3>
            <span className="stat-note">Your spending this month</span>
          </article>
          <article className="stat-card">
            <p>Monthly budget</p>
            <h3>RWF 0</h3>
            <span className="stat-note">Your planned spending limit</span>
          </article>
          <article className="stat-card">
            <p>Budget remaining</p>
            <h3>RWF 0</h3>
            <span className="stat-note">Available for this month</span>
          </article>
          <article className="stat-card">
            <p>Highest expense</p>
            <h3>RWF 0</h3>
            <span className="stat-note">Your largest single expense</span>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel spending-panel">
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

        <section className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent transactions</h3>
              <p>Your latest expenses will appear here.</p>
            </div>
            <button className="secondary-button">View all</button>
          </div>
          <div className="empty-transactions">
            <p>No transactions to display yet.</p>
          </div>
        </section>

        <footer>Retain © 2026 · Make your money matter.</footer>
      </main>
    </div>
  );
}

export default App;
