import { create } from "zustand";

interface AppState {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  filterCategory: string;
  setFilterCategory: (id: string) => void;
  filterCurrency: string;
  setFilterCurrency: (code: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedMonth: new Date(),
  setSelectedMonth: (date) => set({ selectedMonth: date }),
  filterCategory: "all",
  setFilterCategory: (id) => set({ filterCategory: id }),
  filterCurrency: "all",
  setFilterCurrency: (code) => set({ filterCurrency: code }),
}));
