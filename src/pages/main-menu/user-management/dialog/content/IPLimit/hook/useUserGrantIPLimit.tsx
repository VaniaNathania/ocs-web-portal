import { useContext } from "react";
import { UserGrantIPLimitContext } from "./UserGrantIPLimitProvider";

// Optional: helper hook to use context
export const useUserGrantIPLimit = () => {
  const context = useContext(UserGrantIPLimitContext);
  if (!context) {
    throw new Error(
      "useUserGrantIPLimit must be used within a UserGrantIPLimitProvider"
    );
  }
  return context;
};
