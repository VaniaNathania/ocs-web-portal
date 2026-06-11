import { useContext } from "react";
import { BankContext } from "./BankContext";

const useBankContext = () => {
  const context = useContext(BankContext);

  if (!context) {
    throw new Error("useBankContext must be used within a BankContextProvider");
  }

  return context;
};

export default useBankContext;
