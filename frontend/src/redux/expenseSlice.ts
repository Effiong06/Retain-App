
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Expense } from "../api/expenses";

interface ExpenseState {
  expenses: Expense[];
  searchTerm: string;
  categoryFilter: string;
  paymentMethodFilter: string;
  sortBy: "newest" | "oldest" | "highest" | "lowest";
}

const initialState: ExpenseState = {
  expenses: [],
  searchTerm: "",
  categoryFilter: "All",
  paymentMethodFilter: "All",
  sortBy: "newest",
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setExpenses(state, action: PayloadAction<Expense[]>) {
      state.expenses = action.payload;
    },

    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },

    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload;
    },

    setPaymentMethodFilter(
      state,
      action: PayloadAction<string>
    ) {
      state.paymentMethodFilter = action.payload;
    },

    setSortBy(
      state,
      action: PayloadAction<ExpenseState["sortBy"]>
    ) {
      state.sortBy = action.payload;
    },

    clearFilters(state) {
      state.searchTerm = "";
      state.categoryFilter = "All";
      state.paymentMethodFilter = "All";
      state.sortBy = "newest";
    },
  },
});

export const {
  setExpenses,
  setSearchTerm,
  setCategoryFilter,
  setPaymentMethodFilter,
  setSortBy,
  clearFilters,
} = expenseSlice.actions;

export default expenseSlice.reducer;
