import { Href } from "expo-router";
import { create } from "zustand";

interface PathState {
  menuSessionIndex: number;
  setMenuSessionIndex: (index: number) => void;
  categoryId: number;
  setCategoryId: (categoryId: number) => void;
  notFoundInfo: { message: string; link: Href<string>; linkDesc: string };
  setNotFoundInfo: (
    message: string,
    link: Href<string>,
    linkDesc: string
  ) => void;
}

const usePathState = create<PathState>((set) => ({
  menuSessionIndex: 0,
  setMenuSessionIndex: (index: number) => set({ menuSessionIndex: index }),
  categoryId: 0,
  notFoundInfo: {
    message: "Không tìm thấy trang tương ứng!",
    link: "/home",
    linkDesc: "Trở về trang trước",
  },

  setCategoryId: (categoryId: number) => set({ categoryId }),

  setNotFoundInfo: (message, link, linkDesc) =>
    set({
      notFoundInfo: { message, link, linkDesc },
    }),
}));

export default usePathState;
