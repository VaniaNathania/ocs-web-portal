import { useContext } from "react";
import { DirMenuBindPortalContext } from "./DirMenuBindPortalProvider";

// Optional: helper hook to use context
export const useDirMenuBindPortal = () => {
  const context = useContext(DirMenuBindPortalContext);
  if (!context) {
    throw new Error(
      "useDirMenuBindPortal must be used within a DirMenuBindPortalProvider"
    );
  }
  return context;
};
