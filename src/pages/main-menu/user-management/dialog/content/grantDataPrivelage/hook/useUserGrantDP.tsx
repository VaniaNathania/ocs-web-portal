import { useContext } from "react";
import { UserGrantDPContext } from "./UserGrantDPProvider";

// Optional: helper hook to use context
export const useUserGrantDP = () => {
  const context = useContext(UserGrantDPContext);
  if (!context) {
    throw new Error("useUserGrantDP must be used within a UserGrantDPProvider");
  }
  return context;
};
