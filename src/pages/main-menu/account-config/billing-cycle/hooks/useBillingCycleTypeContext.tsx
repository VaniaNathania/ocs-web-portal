import { useContext } from "react";
import { BillingCycleTypeContext } from "./BillingCycleTypeContext";

const useBillingCycleTypeContext = () => {
  const context = useContext(BillingCycleTypeContext);

  if (!context) {
    throw new Error(
      "useAccountBalanceContext must be used within a AccountBalanceProvider"
    );
  }

  return context;
};

export default useBillingCycleTypeContext;
