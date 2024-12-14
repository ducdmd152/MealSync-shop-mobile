import { create } from "zustand";
interface GlobalChattingState {
  channelId: number;
  setChannelId: (value: number) => void;
}

const useGlobalChattingState = create<GlobalChattingState>((set) => ({
  channelId: 0,
  setChannelId: (value: number) => set({ channelId: value }),
}));

export default useGlobalChattingState;
