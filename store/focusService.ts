import { create } from "zustand";

// 서비스 포커스 타입 정의
interface FocusServiceState {
  title: string;
  setTitle: (value:string) => void;
  reset: () => void;
}

// slider store 생성
export const useFocusServiceStore = create<FocusServiceState>((set) => ({
  title: "",
  setTitle: (value:string) => set({ title: value }),
  reset: () => set({ title: ""}),
}));