
import type { RootState } from "./store";

export const selectFilteredExpenses = (state: RootState) => {
  const {
    expenses,
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
  } = state.expenses;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      normalizedSearch === "" ||
      expense.title.toLowerCase().includes(normalizedSearch) ||
      expense.description.toLowerCase().includes(normalizedSearch) ||
      expense.category.toLowerCase().includes(normalizedSearch) ||
      expense.notes.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      categoryFilter === "All" ||
      expense.category === categoryFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "All" ||
      expense.paymentMethod === paymentMethodFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPaymentMethod
    );
  });

  return [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
        );

      case "highest":
        return b.amount - a.amount;

      case "lowest":
        return a.amount - b.amount;

      case "newest":
      default:
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
    }
  });
};
