
const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/budget`;

export interface Budget {
  _id: string;
  user: string;
  monthlyLimit: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BudgetResponse {
  success: boolean;
  budget: Budget | null;
  message?: string;
}

interface SaveBudgetResponse {
  success: boolean;
  budget: Budget;
  message?: string;
}

export async function getBudget(token: string): Promise<Budget | null> {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: BudgetResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to retrieve budget");
  }

  return data.budget;
}

export async function saveBudget(
  token: string,
  monthlyLimit: number
): Promise<Budget> {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ monthlyLimit }),
  });

  const data: SaveBudgetResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save budget");
  }

  return data.budget;
}
