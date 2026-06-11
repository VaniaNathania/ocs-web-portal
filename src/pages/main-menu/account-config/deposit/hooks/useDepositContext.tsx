import { useContext } from "react";
import { DepositContext } from "./DepositContext";

const useDepositContext = () => {
  const context = useContext(DepositContext);

  if (!context) {
    throw new Error(
      "useDepositContext must be used within a DepositContextProvider"
    );
  }

  return context;
};

export default useDepositContext;
