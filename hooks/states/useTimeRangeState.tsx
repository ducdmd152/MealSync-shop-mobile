import { create } from "zustand";
interface TimeRangeState {
  startTime: number;
  endTime: number;
  setStartTime: (startTime: number) => void;
  setEndTime: (endTime: number) => void;
}

const useTimeRangeState = create<TimeRangeState>((set) => ({
  startTime: 0,
  endTime: 2400,
  setStartTime: (time: number) => set({ startTime: time }),
  setEndTime: (time: number) => set({ endTime: time }),
}));

export default useTimeRangeState;
