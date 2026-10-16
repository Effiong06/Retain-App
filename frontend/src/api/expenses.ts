
const API_URL = "http://localhost:5000/api";

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

interface ExpensesResponse {
  success: boolean;
  count: number;
  expenses: Expense[];
}

export async function getExpenses(token: string): Promise<Expense[]> {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: ExpensesResponse & { message?: string } =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch expenses.");
  }

  return data.expenses;
}
