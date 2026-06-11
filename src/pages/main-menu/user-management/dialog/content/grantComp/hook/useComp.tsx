import { useContext } from "react";
import { CompListContext } from "./CompProvider";

// Optional: helper hook to use context
export const useCompList = () => {
  const context = useContext(CompListContext);
  if (!context) {
    throw new Error("useCompList must be used within a CompListProvider");
  }
  return context;
};
