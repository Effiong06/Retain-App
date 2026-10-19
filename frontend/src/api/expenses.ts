
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes: string;
}

interface ExpensesResponse {
  success: boolean;
  count: number;
  expenses: Expense[];
  expense?: Expense;
  message?: string;
}

async function parseResponse(response: Response): Promise<ExpensesResponse> {
  const data: ExpensesResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Expense request failed.");
  }

  return data;
}

export async function getExpenses(token: string): Promise<Expense[]> {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse(response);
  return data.expenses;
}

export async function createExpense(
  token: string,
  expense: ExpenseInput,
): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  });

  const data = await parseResponse(response);

  if (!data.expense) {
    throw new Error("The server did not return the created expense.");
  }

  return data.expense;
}

export async function updateExpense(
  token: string,
  expenseId: string,
  expense: Partial<ExpenseInput>,
): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  });

  const data = await parseResponse(response);

  if (!data.expense) {
    throw new Error("The server did not return the updated expense.");
  }

  return data.expense;
}

export async function deleteExpense(
  token: string,
  expenseId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseResponse(response);
}
