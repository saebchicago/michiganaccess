import { create } from "zustand";

export type Lens = "standard" | "equity" | "economic" | "family";

interface LensState {
  activeLens: Lens;
  setLens: (lens: Lens) => void;
}

export const useLens = create<LensState>((set) => ({
  activeLens: "standard",
  setLens: (lens) => set({ activeLens: lens }),
}));
