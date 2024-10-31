import { FrameDateTime } from "@/types/models/TimeModel";
import { create } from "zustand";
interface GPKGState {
  query: FrameDateTime;
  setQuery: (query: FrameDateTime) => void;
}

const useGPKGState = create<GPKGState>((set) => ({
  query: {} as FrameDateTime,
  setQuery: (query: FrameDateTime) => set({ query: query }),
}));

export default useGPKGState;
