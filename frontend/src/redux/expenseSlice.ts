
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Expense } from "../api/expenses";

interface ExpenseState {
  expenses: Expense[];
  searchTerm: string;
  categoryFilter: string;
  paymentMethodFilter: string;
  sortBy: "newest" | "oldest" | "highest" | "lowest";
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

const initialState: ExpenseState = {
  expenses: [],
  searchTerm: "",
  categoryFilter: "All",
  paymentMethodFilter: "All",
  sortBy: "newest",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
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

    setStartDate(state, action: PayloadAction<string>) {
      state.startDate = action.payload;
    },

    setEndDate(state, action: PayloadAction<string>) {
      state.endDate = action.payload;
    },

    setMinAmount(state, action: PayloadAction<string>) {
      state.minAmount = action.payload;
    },

    setMaxAmount(state, action: PayloadAction<string>) {
      state.maxAmount = action.payload;
    },

    clearFilters(state) {
      state.searchTerm = "";
      state.categoryFilter = "All";
      state.paymentMethodFilter = "All";
      state.sortBy = "newest";
      state.startDate = "";
      state.endDate = "";
      state.minAmount = "";
      state.maxAmount = "";
    },
  },
});

export const {
  setExpenses,
  setSearchTerm,
  setCategoryFilter,
  setPaymentMethodFilter,
  setSortBy,
  setStartDate,
  setEndDate,
  setMinAmount,
  setMaxAmount,
  clearFilters,
} = expenseSlice.actions;

export default expenseSlice.reducer;
