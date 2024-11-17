import { FrameDateTime } from "@/types/models/TimeModel";
import { create } from "zustand";
interface State {
  isNotiPageFocusing: boolean;
  setIsNotiPageFocusing: (value: boolean) => void;
  isChattingFocusing: boolean;
  setIsChattingFocusing: (value: boolean) => void;
}

const useGlobalHeaderPage = create<State>((set) => ({
  isNotiPageFocusing: false,
  setIsNotiPageFocusing: (value: boolean) => set({ isNotiPageFocusing: value }),
  isChattingFocusing: false,
  setIsChattingFocusing: (value: boolean) => set({ isChattingFocusing: value }),
}));

export default useGlobalHeaderPage;
