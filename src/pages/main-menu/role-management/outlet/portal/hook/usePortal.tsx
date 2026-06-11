import { useContext } from "react";
import { PortalListContext } from "./PortalProvider";

// Optional: helper hook to use context
export const usePortalList = () => {
  const context = useContext(PortalListContext);
  if (!context) {
    throw new Error("usePortalList must be used within a PortalListProvider");
  }
  return context;
};
