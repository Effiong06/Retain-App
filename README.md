# Retain --- Personal Expense & Budget Manager

Retain is a full-stack web application designed to help users manage
personal expenses, create monthly budgets, and understand their spending
habits. It also includes an administrator dashboard for monitoring
platform activity and managing expense categories.

The project was developed using React, TypeScript, Redux Toolkit,
Node.js, Express, and MongoDB.

## Live Demo

-   **Application:** https://retain-api-phi.vercel.app
-   **Backend API:** https://retain-api-n3yw.onrender.com
-   **API Health Check:**
    https://retain-api-n3yw.onrender.com/api/health

The frontend is deployed on Vercel, the backend API is deployed on
Render, and MongoDB Atlas provides cloud database storage.

## Table of Contents

-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Authentication and
    Authorization](#authentication-and-authorization)
-   [API Endpoints](#api-endpoints)
-   [Challenges Encountered and
    Solutions](#challenges-encountered-and-solutions)
-   [Lessons Learned](#lessons-learned)
-   [Future Improvements](#future-improvements)
-   [Conclusion](#conclusion)
-   [Repository](#repository)

## Features

### 1. User Authentication

-   User registration and login.
-   Password hashing using bcryptjs.
-   JSON Web Token (JWT) authentication.
-   Persistent login sessions using browser local storage.
-   Role-based access for ordinary users and administrators.
-   Protected backend endpoints.

### 2. Expense Management

Users can create, view, update, and delete their personal expenses.

Each expense supports the following fields:

-   Title
-   Description
-   Amount
-   Category
-   Date
-   Payment method
-   Notes

Supported payment methods include cash, credit card, debit card, mobile
money, bank transfer, and other.

### 3. Expense Search, Filtering, Sorting, and Pagination

-   Search expenses using relevant text fields.
-   Filter expenses by category.
-   Filter expenses by payment method.
-   Filter expenses by date range.
-   Filter expenses by minimum and maximum amount.
-   Sort expenses by date and amount.
-   Navigate through paginated expense results.

Redux Toolkit manages expense state and filtering preferences in the
frontend.

### 4. Monthly Budget Management

-   Set a monthly spending budget.
-   Update the monthly budget.
-   View monthly spending against the budget.
-   Calculate the remaining budget.
-   Review spending summaries to better understand financial activity.

### 5. User Dashboard

The user dashboard provides an overview of personal financial activity,
including:

-   Monthly spending.
-   Monthly budget.
-   Remaining budget.
-   Highest individual expense.
-   Spending by category.
-   Recent expenses.
-   Expense management and filtering controls.

### 6. Administrator Dashboard

The administrator dashboard provides platform-wide information and
management functionality.

**Platform statistics**

-   Total registered users.
-   Total recorded expenses.
-   Total value of recorded expenses.
-   Number of expenses recorded during the current month.
-   Expense totals and transaction counts by category.

**Category insights**

-   Most-used expense categories.
-   Least-used expense categories.

**Platform management**

-   View recently registered users.
-   View recent platform expenses.
-   View existing expense categories.
-   Create expense categories.
-   Update expense categories.
-   Delete expense categories.

Administrator endpoints are protected by authentication and
administrator-role middleware on the backend.

## Technologies Used

### Frontend

-   **React** --- component-based user interface.
-   **TypeScript** --- static typing and improved maintainability.
-   **Vite** --- frontend development server and production build
    tooling.
-   **Redux Toolkit** --- expense state management.
-   **React Redux** --- connecting React components to Redux.
-   **CSS** --- styling and responsive layouts.
-   **Fetch API** --- communication with the backend.

### Backend

-   **Node.js** --- JavaScript runtime.
-   **Express** --- REST API and routing.
-   **MongoDB** --- database.
-   **Mongoose** --- database models and queries.
-   **JSON Web Token (`jsonwebtoken`)** --- authentication tokens.
-   **`bcryptjs`** --- password hashing.
-   **`dotenv`** --- environment variable configuration.
-   **CORS** --- cross-origin request configuration.

### Development and Deployment Tools

-   Visual Studio Code.
-   Git and GitHub.
-   Postman for API testing.
-   MongoDB Atlas for cloud database hosting.
-   PowerShell for development commands.
-   Vercel for frontend hosting.
-   Render for backend hosting.

## Project Structure

``` text
Retain-App/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── adminMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Expense.js
│   │   │   ├── Budget.js
│   │   │   └── Category.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── testRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── server.js
│   ├── package.json
│   └── .env                 # Local environment file; do not commit
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Before running the application locally, install or prepare:

-   Node.js and npm.
-   Git.
-   A MongoDB Atlas database or another compatible MongoDB instance.
-   A code editor such as Visual Studio Code.

### 1. Clone the repository

``` bash
git clone https://github.com/Effiong06/Retain-App.git
cd Retain-App
```

### 2. Configure the backend

From the project root, run:

``` bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory. See [Environment
Variables](#environment-variables) for the required values.

### 3. Start the backend

From the `backend` directory, run:

``` bash
npm run dev
```

The backend runs on port `5000` by default.

The local health endpoint is:

http://localhost:5000/api/health

A successful response confirms that the API server is running. The
backend terminal should also indicate whether the MongoDB connection
succeeded.

### 4. Configure the frontend

Open a second terminal at the project root and run:

``` bash
cd frontend
npm install
```

For local development, the frontend API requests default to
`http://localhost:5000/api`. For deployment, configure the
`VITE_API_URL` environment variable as described below.

### 5. Start the frontend

From the `frontend` directory, run:

``` bash
npm run dev
```

Open the local URL displayed by Vite in your browser. The port may be
`5173` or another available port, such as `5174`.

### 6. Create an account and test the application

Register an account and log in to access the user dashboard.

To test administrator functionality, use an administrator account whose
role has been assigned securely by the application owner. Public
registration must not allow users to grant themselves administrator
privileges.

### 7. Build the frontend for production

From the `frontend` directory, run:

``` bash
npm run build
```

This runs the production build checks and creates the optimized frontend
in the `dist` directory.

## Environment Variables

### Backend

Create `backend/.env` for local development with the following
structure:

``` dotenv
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
FRONTEND_URL=http://localhost:5173
```

Replace the example values with your own configuration. If Vite runs on
port `5174`, ensure the backend's local CORS configuration permits that
origin too.

-   `PORT` specifies the backend port locally. The hosting provider
    supplies the port in production.
-   `MONGODB_URI` contains the MongoDB connection string.
-   `JWT_SECRET` is used to sign authentication tokens.
-   `FRONTEND_URL` specifies the frontend origin allowed to make
    cross-origin requests.

For the deployed backend on Render, configure the required variables in
the Render service's environment settings. The production `FRONTEND_URL`
should be the exact deployed frontend origin.

### Frontend

The frontend supports this environment variable:

``` dotenv
VITE_API_URL=http://localhost:5000/api
```

For the deployed Vercel frontend, `VITE_API_URL` should point to the
deployed backend API base URL:

``` text
https://retain-api-n3yw.onrender.com/api
```

Frontend environment variables with the `VITE_` prefix are exposed to
browser code. Only put public configuration values, such as the API URL,
in them. Never put database credentials, JWT signing secrets, or other
private values in frontend environment variables.

### Security notes

-   Never commit `.env` files, database credentials, or JWT secrets to
    GitHub.
-   Keep `.env` in `.gitignore`.
-   Use strong, unique secrets in production.
-   Configure MongoDB Atlas network access appropriately and restrict
    access where practical.
-   Do not expose database credentials or administrative privileges in
    frontend code.

## Authentication and Authorization

Retain uses JWT-based authentication.

After successful registration or login, the backend returns an
authentication token and user information. The frontend stores the
session and sends the token with protected API requests using the
`Authorization` header.

Example:

``` http
Authorization: Bearer YOUR_JWT_TOKEN
```

The backend authentication middleware validates the token and identifies
the authenticated user.

The administrator middleware checks the authenticated user's role before
allowing access to administrator endpoints.

Ordinary users can manage their own expenses and budgets. Administrator
endpoints provide authorized access to platform-wide statistics and
category management.

Role checks on the frontend control which dashboard is displayed, while
backend middleware enforces access restrictions independently.

## API Endpoints

### Base URLs

-   **Local development:** `http://localhost:5000/api`
-   **Deployed backend:** `https://retain-api-n3yw.onrender.com/api`

The deployed frontend uses the deployed backend URL through the
`VITE_API_URL` environment variable.

All protected endpoints require a valid bearer token. Administrator
endpoints additionally require the administrator role.

### Health and Authentication

  Method   Endpoint           Purpose
  -------- ------------------ ---------------------
  GET      `/health`          Check API health
  POST     `/auth/register`   Register a user
  POST     `/auth/login`      Authenticate a user

### Expenses

  Method   Endpoint          Purpose
  -------- ----------------- --------------------------------------------
  GET      `/expenses`       Retrieve the authenticated user's expenses
  POST     `/expenses`       Create an expense
  PUT      `/expenses/:id`   Update an expense
  DELETE   `/expenses/:id`   Delete an expense

### Monthly Budget

  Method   Endpoint    Purpose
  -------- ----------- ------------------------------------------
  GET      `/budget`   Retrieve the authenticated user's budget
  PUT      `/budget`   Create or update the monthly budget

### Administrator

  Method   Endpoint                  Purpose
  -------- ------------------------- -----------------------------------
  GET      `/admin/stats`            Retrieve platform-wide statistics
  GET      `/admin/categories`       Retrieve expense categories
  POST     `/admin/categories`       Create an expense category
  PUT      `/admin/categories/:id`   Update an expense category
  DELETE   `/admin/categories/:id`   Delete an expense category

The expense and budget endpoints are protected and scoped to the
authenticated user. Administrator endpoints are protected by both
authentication and role-based authorization.

## Challenges Encountered and Solutions

Developing Retain involved troubleshooting issues across the frontend,
backend, database, and authentication systems. Working through these
challenges helped improve the application's reliability and strengthened
my understanding of full-stack development.

### 1. MongoDB Atlas DNS Connection Issues

**Challenge:** The backend initially failed to connect to MongoDB Atlas
with a `querySrv ECONNREFUSED` error. The application could not resolve
the database cluster's SRV records correctly through Node.js.

**Solution:** The Node.js DNS configuration was adjusted to use Google's
public DNS resolver. After applying this workaround, the backend
successfully connected to MongoDB Atlas.

**Lesson learned:** Database connectivity problems can originate from
DNS resolution and the local environment, rather than incorrect database
credentials or application logic.

### 2. Verifying API Availability

**Challenge:** A `Cannot GET` response when opening an API URL in the
browser caused uncertainty about whether the backend was working.

**Solution:** The health endpoint and individual API routes were tested
separately. This helped distinguish a missing route from a backend or
database connection problem.

**Lesson learned:** An API is not necessarily broken because its base
URL does not display a webpage. Each endpoint must be tested using the
appropriate HTTP method and request data.

### 3. Expense Amount Input Validation

**Challenge:** The expense form initially rejected certain whole-number
amounts, including values such as `5000`, because the number input's
minimum and step attributes were too restrictive.

**Solution:** The input attributes were adjusted to allow the intended
values, including whole-number amounts.

**Lesson learned:** Frontend validation settings must match the
application's data-entry requirements. Small HTML input constraints can
prevent users from entering otherwise valid data.

### 4. Mongoose Deprecation Warning

**Challenge:** Mongoose displayed a warning that the `new` option used
with `findOneAndUpdate()` was deprecated.

**Solution:** The update operation was changed to use
`returnDocument: "after"` to return the updated document.

**Lesson learned:** Keeping database operations aligned with current
library APIs helps reduce warnings and maintain compatibility.

### 5. Dependency and Development Tool Issues

**Challenge:** Installing development dependencies introduced audit
warnings involving transitive packages.

**Solution:** Nodemon was removed, and Node.js's built-in watch mode was
used for backend development instead. The dependency audit subsequently
reported zero vulnerabilities at that point in development.

**Lesson learned:** Additional development tools are not always
necessary. Built-in runtime functionality can simplify configuration and
reduce dependency overhead.

### 6. TypeScript Errors During Dashboard Integration

**Challenge:** While integrating the administrator dashboard, the
production build identified an undefined `isRegistering` variable and an
unused `Register` import.

**Solution:** The authentication checks were corrected to match the
existing application structure, and the unused import was removed. The
production build then completed successfully.

**Lesson learned:** TypeScript's compiler helps identify incorrect
references and unused imports before deployment.

### 7. Integrating Role-Based Administration

**Challenge:** The application needed separate dashboards for ordinary
users and administrators without disrupting existing expense and budget
functionality.

**Solution:** A separate administrator dashboard was created,
administrator middleware was added to the backend, and protected
administrator routes were implemented. The dashboard is selected using
the authenticated user's role.

**Lesson learned:** Hiding administrator features in the frontend is not
sufficient. Authorization must also be enforced by the backend.

### 8. Testing Different User Roles

**Challenge:** It was necessary to verify that ordinary users could not
access administrator endpoints while authorized administrators could.

**Solution:** The admin API was tested using accounts with different
roles. Requests made by an ordinary user were denied, while
administrator requests were accepted.

**Lesson learned:** Role-based authorization must be tested at the API
level, not only by checking which interface is displayed in the browser.

### 9. Preserving Existing Functionality

**Challenge:** Introducing new dashboard functionality risked
interfering with existing React hooks and the expense dashboard.

**Solution:** The administrator dashboard was separated into its own
component, and the existing user dashboard was preserved. The frontend
production build and administrator dashboard were tested after
integration.

**Lesson learned:** Separating functionality into focused components
makes an application easier to maintain and reduces the risk of breaking
existing features.

### 10. Incremental Testing and Version Control

**Challenge:** As features were added across the frontend and backend,
it was important to identify problems early and preserve completed work.

**Solution:** Changes were tested incrementally, production builds were
run after significant frontend modifications, and completed milestones
were committed and pushed to GitHub.

**Lesson learned:** Incremental testing and meaningful Git commits make
debugging easier, preserve working versions, and provide a clearer
development history.

### 11. Deployment and Production Configuration

**Challenge:** Deploying the application required configuring the
frontend and backend separately, connecting the deployed API to the
frontend, and allowing the backend to connect to MongoDB Atlas.

**Solution:** The frontend was deployed to Vercel, the backend was
deployed to Render, and the backend's MongoDB connection and health
endpoint were verified. Environment variables were used to configure the
deployed API URL and frontend origin.

**Lesson learned:** A successful build alone does not guarantee a
working deployment. Hosting configuration, database connectivity,
environment variables, and cross-origin requests must also be verified.

## Lessons Learned

Developing Retain provided practical experience in:

-   Building a full-stack application with React, TypeScript, Express,
    and MongoDB.
-   Designing REST API endpoints and database models.
-   Implementing authentication and role-based authorization.
-   Managing frontend state using Redux Toolkit.
-   Connecting frontend forms to backend APIs.
-   Implementing expense filtering, searching, sorting, and pagination.
-   Managing environment variables and database connections.
-   Debugging TypeScript errors, input validation problems, and API
    failures.
-   Testing APIs with Postman.
-   Using Git and GitHub to track and preserve project progress.
-   Deploying a frontend and backend separately and configuring their
    communication.

## Future Improvements

Potential improvements include:

-   Adding automated frontend and backend tests.
-   Improving error reporting and application logging.
-   Adding more detailed spending reports and visualizations.
-   Supporting expense export and downloadable financial summaries.
-   Improving accessibility and responsive design.
-   Adding further security measures and production monitoring.
-   Restricting database network access more tightly for production.

## Conclusion

Retain combines personal expense tracking, monthly budgeting, financial
summaries, and role-based administration in a full-stack web
application.

The development process involved implementing core functionality as well
as resolving practical challenges involving database connectivity, input
validation, library warnings, TypeScript, authorization, and deployment.

These experiences strengthened my understanding of full-stack
application development, debugging, API integration, version control,
and deployment.

## Repository

GitHub: https://github.com/Effiong06/Retain-App
