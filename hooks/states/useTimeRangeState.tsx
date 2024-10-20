import { create } from "zustand";
interface TimeRangeState {
  startTime: number;
  endTime: number;
  isEditing: boolean;
  setStartTime: (startTime: number) => void;
  setEndTime: (endTime: number) => void;
  setIsEditing: (isEditing: boolean) => void;
}

const useTimeRangeState = create<TimeRangeState>((set) => ({
  startTime: 0,
  endTime: 2400,
  isEditing: false,
  setStartTime: (time: number) => set({ startTime: time }),
  setEndTime: (time: number) => set({ endTime: time }),
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
}));

export default useTimeRangeState;
