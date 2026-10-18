
import type { RootState } from "./store";

export const selectFilteredExpenses = (state: RootState) => {
  const {
    expenses,
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = state.expenses;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const minimum = minAmount === "" ? null : Number(minAmount);
  const maximum = maxAmount === "" ? null : Number(maxAmount);

  const filteredExpenses = expenses.filter((expense) => {
    const normalizedDescription = (expense.description || "").toLowerCase();
    const normalizedNotes = (expense.notes || "").toLowerCase();

    const matchesSearch =
      normalizedSearch === "" ||
      expense.title.toLowerCase().includes(normalizedSearch) ||
      normalizedDescription.includes(normalizedSearch) ||
      expense.category.toLowerCase().includes(normalizedSearch) ||
      normalizedNotes.includes(normalizedSearch);

    const matchesCategory =
      categoryFilter === "All" ||
      expense.category === categoryFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "All" ||
      expense.paymentMethod === paymentMethodFilter;

    const expenseDate = expense.date.slice(0, 10);

    const matchesStartDate =
      startDate === "" || expenseDate >= startDate;

    const matchesEndDate =
      endDate === "" || expenseDate <= endDate;

    const matchesMinAmount =
      minimum === null || expense.amount >= minimum;

    const matchesMaxAmount =
      maximum === null || expense.amount <= maximum;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPaymentMethod &&
      matchesStartDate &&
      matchesEndDate &&
      matchesMinAmount &&
      matchesMaxAmount
    );
  });

  return [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();

      case "highest":
        return b.amount - a.amount;

      case "lowest":
        return a.amount - b.amount;

      case "newest":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
};
