import { useContext } from "react";
import { PortalListContext } from "./PortalListProvider";

export const usePortalList = () => {
  const context = useContext(PortalListContext);
  if (!context) {
    throw new Error("useAppList must be used within PortalListProvider");
  }
  return context;
};
