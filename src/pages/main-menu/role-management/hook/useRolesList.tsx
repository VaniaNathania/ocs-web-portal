import { useContext } from "react";
import { RoleListContext } from "./RoleListProvider";

export const useRoleList = () => {
  const context = useContext(RoleListContext);
  if (!context) {
    throw new Error("useAppList must be used within RoleListProvider");
  }
  return context;
};
