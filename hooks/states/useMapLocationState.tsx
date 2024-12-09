import { create } from "zustand";

export const unSelectLocation = {
  id: 0,
  address: "Chưa chọn địa chỉ nào",
  latitude: 0.1,
  longitude: 0.1,
};
interface MapLocationState {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  setId: (id: number) => void;
  setLocation: (address: string, latitude: number, longitude: number) => void;
}

const useMapLocationState = create<MapLocationState>((set) => ({
  id: -1,
  address: "",
  latitude: 0.1,
  longitude: 0.1,
  setId: (id: number) => set({ id }),
  setLocation: (address, latitude, longitude) =>
    set({ address, latitude, longitude }),
}));

export default useMapLocationState;
