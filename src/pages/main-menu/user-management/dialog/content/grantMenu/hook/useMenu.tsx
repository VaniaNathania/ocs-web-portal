import { useContext } from "react";
import { MenuListContext } from "./MenuProvider";

// Optional: helper hook to use context
export const useMenuList = () => {
  const context = useContext(MenuListContext);
  if (!context) {
    throw new Error("useMenuList must be used within a MenuListProvider");
  }
  return context;
};
