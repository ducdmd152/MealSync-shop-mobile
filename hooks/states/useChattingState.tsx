import { create } from "zustand";
interface GlobalChattingState {
  channelId: number;
  setChannelId: (value: number) => void;
  isChatBoxShow: boolean;
  setIsChatBoxShow: (value: boolean) => void;
}

const useGlobalChattingState = create<GlobalChattingState>((set) => ({
  channelId: 0,
  setChannelId: (value: number) => set({ channelId: value }),
  isChatBoxShow: false,
  setIsChatBoxShow: (value: boolean) => set({ isChatBoxShow: value }),
}));

export default useGlobalChattingState;
