import { FrameDateTime } from "@/types/models/TimeModel";
import { create } from "zustand";
interface State {
  isNotiPageFocusing: boolean;
  setIsNotiPageFocusing: (value: boolean) => void;
  isChattingFocusing: boolean;
  setIsChattingFocusing: (value: boolean) => void;
  numberOfMsg: number;
  setNumberOfMsg: (value: number) => void;
}

const useGlobalHeaderPage = create<State>((set) => ({
  isNotiPageFocusing: false,
  setIsNotiPageFocusing: (value: boolean) => set({ isNotiPageFocusing: value }),
  isChattingFocusing: false,
  setIsChattingFocusing: (value: boolean) => set({ isChattingFocusing: value }),
  numberOfMsg: 0,
  setNumberOfMsg: (value: number) => set({ numberOfMsg: value }),
}));

export default useGlobalHeaderPage;
