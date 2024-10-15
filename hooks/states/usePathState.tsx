import { Href } from "expo-router";
import { create } from "zustand";

interface PathState {
  categoryId: number;
  setCategoryId: (categoryId: number) => void;
  notFoundInfo: { message: string; link: Href<string>; linkDesc: string };
  setNotFound: (message: string, link: Href<string>, linkDesc: string) => void;
}

const usePathState = create<PathState>((set) => ({
  categoryId: 0,
  notFoundInfo: {
    message: "Không tìm thấy trang tương ứng!",
    link: "/",
    linkDesc: "Trở về trang chủ!",
  },

  setCategoryId: (categoryId: number) => set({ categoryId }),

  setNotFound: (message, link, linkDesc) =>
    set({
      notFoundInfo: { message, link, linkDesc },
    }),
}));

export default usePathState;
