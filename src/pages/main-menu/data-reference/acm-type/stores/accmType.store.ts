import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { create } from "zustand";
const { checkMenusPriv } = useRoleCheck();

interface AccmTypeUIState {
  showDialog: { show: boolean; mode: "create" | "update" };
  selectedAccmType: IAccmTypeList | null;
  isSubmitting: boolean;
  reloadKey: number;
  searchValue: string;
  searchDatas: IAccmTypeList[];

  openDialog: (mode: "create" | "update", data?: IAccmTypeList) => void;
  closeDialog: () => void;
  setSelectedAccmType: (data: IAccmTypeList | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  triggerReload: () => void;
  setSearchValue: (value: string) => void;
  setSearchDatas: (value: IAccmTypeList[]) => void;
  menuPrivAccess: menuAccess;
}

export const useAccmTypeStore = create<AccmTypeUIState>((set) => ({
  showDialog: { show: false, mode: "create" },
  selectedAccmType: null,
  isSubmitting: false,
  reloadKey: 0,
  searchValue: "",
  searchDatas: [],

  triggerReload: () => set((state) => ({ reloadKey: state.reloadKey + 1 })),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSelectedAccmType: (data) => set({ selectedAccmType: data }),
  setSearchDatas: (value) => set({ searchDatas: value }),
  setSearchValue: (value) => set({ searchValue: value }),

  openDialog: (mode, data) =>
    set({
      showDialog: { show: true, mode },
      selectedAccmType: data ?? null,
    }),

  closeDialog: () =>
    set({
      showDialog: { show: false, mode: "create" },
      selectedAccmType: null,
    }),
  menuPrivAccess: {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/acm-type/AccmType",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/acm-type/AccmType",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/acm-type/AccmType",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/acm-type/AccmType",
      "deleteStatus",
    ),
  },
}));
