import { create } from "zustand";

export const unSelectLocation = {
  id: 0,
  address: "Chưa chọn địa chỉ nào",
  latitude: 0.1,
  longitude: 0.1,
};
interface MapLocationState {
  id: 0;
  address: string;
  latitude: number;
  longitude: number;
  setLocation: (address: string, latitude: number, longitude: number) => void;
}

const useMapLocationState = create<MapLocationState>((set) => ({
  id: 0,
  address: "12/10 Nguyễn Văn A",
  latitude: 0.1,
  longitude: 0.1,
  setLocation: (address, latitude, longitude) =>
    set({ address, latitude, longitude }),
}));

export default useMapLocationState;
