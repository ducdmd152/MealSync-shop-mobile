import { create } from "zustand";
interface TimeRangeState {
  minTime: number;
  maxTime: number;
  startTime: number;
  endTime: number;
  isEditing: boolean;
  date: Date;
  setDate: (date: Date) => void;
  setMinTime: (minTime: number) => void;
  setMaxTime: (maxTime: number) => void;
  setStartTime: (startTime: number) => void;
  setEndTime: (endTime: number) => void;
  setIsEditing: (isEditing: boolean) => void;
}

const useTimeRangeState = create<TimeRangeState>((set) => ({
  minTime: 0,
  maxTime: 2400,
  startTime: 0,
  endTime: 2400,
  date: new Date(),
  isEditing: false,
  setDate: (date: Date) =>
    set({
      date: date,
    }),
  setMinTime: (time: number) => set({ minTime: time, startTime: time }),
  setMaxTime: (time: number) => set({ maxTime: time, endTime: time }),
  setStartTime: (time: number) => set({ startTime: time }),
  setEndTime: (time: number) => set({ endTime: time }),
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
}));

export default useTimeRangeState;
