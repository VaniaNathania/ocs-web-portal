import { useContext } from "react";
import { UserRoleGrantContext } from "./UserRoleGrantProvider";

// Optional: helper hook to use context
export const useUserRoleGrant = () => {
  const context = useContext(UserRoleGrantContext);
  if (!context) {
    throw new Error(
      "useUserRoleGrant must be used within a UserRoleGrantProvider"
    );
  }
  return context;
};
