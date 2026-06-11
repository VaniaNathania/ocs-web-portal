import { useContext } from "react";
import { UserManagementContext } from "./UserManagementProvider";

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error("useAppList must be used within UserManagementProvider");
  }
  return context;
};
