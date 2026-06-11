import { useContext } from "react";
import { NavbarMenuContext } from "./NavbarContext";

const useNavbarMenuContext = () => {
  const context = useContext(NavbarMenuContext);

  if (!context) {
    throw new Error(
      "useNavbarMenuContext must be used within NavbarMenuContextProvider"
    );
  }

  return context;
};

export { useNavbarMenuContext };