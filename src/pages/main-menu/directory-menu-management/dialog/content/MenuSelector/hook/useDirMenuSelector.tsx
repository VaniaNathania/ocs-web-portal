import { useContext } from "react";
import { DirMenuSelectorContext } from "./DirMenuSelectoProvider";

// Optional: helper hook to use context
export const useDirMenuSelector = () => {
  const context = useContext(DirMenuSelectorContext);
  if (!context) {
    throw new Error(
      "useDirMenuSelector must be used within a DirMenuSelectorProvider"
    );
  }
  return context;
};
