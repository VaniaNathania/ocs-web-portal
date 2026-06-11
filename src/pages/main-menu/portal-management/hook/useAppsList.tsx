import { useContext } from "react";
import { AppListContext } from "./AppListProvider";

export const useAppList = () => {
  const context = useContext(AppListContext);
  if (!context) {
    throw new Error("useAppList must be used within AppListProvider");
  }
  return context;
};
