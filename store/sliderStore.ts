import { create } from "zustand";

// slider 상태 타입 정의
interface SliderState {
  main: string;
  sub: string;
  tertiary: string;
  setMain: (value:string) => void;
  setSub: (v: string) => void;
  reset: () => void;
}

// slider store 생성
export const useSliderStore = create<SliderState>((set) => ({
  main: "",
  sub: "",
  tertiary: "",
  setMain: (value) => set({ main: value }),
  setSub: (v) => set({ sub: v }),                  // ✅ 새 객체로 설정
  reset: () => set({ main: "", sub: "" ,tertiary: ""}),
}));