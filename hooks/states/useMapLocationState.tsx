import { create } from "zustand";

interface MapLocationState {
  address: string;
  latitude: number;
  longitude: number;
  setLocation: (address: string, latitude: number, longitude: number) => void;
}

const useMapLocationState = create<MapLocationState>((set) => ({
  address: "12/10 Nguyễn Văn A",
  latitude: 0,
  longitude: 0,
  setLocation: (address, latitude, longitude) =>
    set({ address, latitude, longitude }),
}));

export default useMapLocationState;
