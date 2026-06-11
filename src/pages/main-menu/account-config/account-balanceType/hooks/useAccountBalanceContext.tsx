import { useContext } from "react";
import { AccountBalanceContext } from "./AccountBalanceContext";

const useAccountBalanceContext = () => {
  const context = useContext(AccountBalanceContext);

  if (!context) {
    throw new Error(
      "useAccountBalanceContext must be used within a AccountBalanceProvider"
    );
  }

  return context;
};

export default useAccountBalanceContext;
