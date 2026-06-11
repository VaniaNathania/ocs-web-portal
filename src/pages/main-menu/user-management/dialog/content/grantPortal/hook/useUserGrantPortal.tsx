import { useContext } from "react";
import { UserGrantPortalContext } from "./UserGrantPortalProvider";

// Optional: helper hook to use context
export const useUserGrantPortal = () => {
  const context = useContext(UserGrantPortalContext);
  if (!context) {
    throw new Error(
      "useUserGrantPortal must be used within a UserGrantPortalProvider"
    );
  }
  return context;
};
