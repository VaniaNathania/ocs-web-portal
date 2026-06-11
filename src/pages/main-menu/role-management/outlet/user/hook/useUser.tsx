import { useContext } from "react";
import { UserListContext } from "./UserProvider";

// Optional: helper hook to use context
export const useUserList = () => {
  const context = useContext(UserListContext);
  if (!context) {
    throw new Error("useUserList must be used within a UserListProvider");
  }
  return context;
};
