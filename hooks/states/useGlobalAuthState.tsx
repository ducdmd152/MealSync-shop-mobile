import { create } from "zustand";
interface GlobalAuthState {
  token: string;
  roleId: number;
  setToken: (token: string) => void;
  setRoleId: (roleId: number) => void;
}

const useGlobalAuthState = create<GlobalAuthState>((set) => ({
  token: "",
  roleId: 0,
  setToken: (token: string) => set({ token: token }),
  setRoleId: (roleId: number) => set({ roleId: roleId }),
}));

export default useGlobalAuthState;
