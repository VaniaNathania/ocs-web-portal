import { useContext } from "react";
import { ChangeNumberProfileListContext } from "./ChangeNumberProfileContext";

const useChangeNumberProfileContext = () => {
  const context = useContext(ChangeNumberProfileListContext);
  if (!context) throw new Error("useChangeNumberProfileContext must be used within AuthProvider");
  return context;
};

export { useChangeNumberProfileContext };
