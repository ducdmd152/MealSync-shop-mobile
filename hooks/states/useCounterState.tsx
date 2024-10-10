import { create } from "zustand";
interface CounterState {
  counter: number;
  max: number;
  increment: () => void;
  reset: () => void;
  changeMax: (value: number) => void;
}

const useCounterState = create<CounterState>((set) => ({
  counter: 0,
  max: 5,
  increment: () => set((state) => ({ ...state, counter: state.counter + 1 })),
  changeMax: (value: number) => set((state) => ({ ...state, max: value })),
  reset: () => set(() => ({ counter: 0 })),
}));

export default useCounterState;
