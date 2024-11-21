import { create } from "zustand";
interface GlobalNotiState {
  toggleChangingFlag: boolean;
  setToggleChangingFlag: (token: boolean) => void;
}

const useGlobalNotiState = create<GlobalNotiState>((set) => ({
  toggleChangingFlag: false,
  setToggleChangingFlag: (param: boolean) => set({ toggleChangingFlag: param }),
}));

export default useGlobalNotiState;
