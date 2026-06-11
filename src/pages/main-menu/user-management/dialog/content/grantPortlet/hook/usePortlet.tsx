import { useContext } from "react";
import { PortletListContext } from "./PortletsProvider";

// Optional: helper hook to use context
export const usePortletList = () => {
  const context = useContext(PortletListContext);
  if (!context) {
    throw new Error("usePortletList must be used within a PortletListProvider");
  }
  return context;
};
