import { useContext } from "react";
import { TcelBalanceAdjustmentContext } from "./TcelBalanceAjustmentContext";
// import { TcelBalanceAdjustmentContext } from "./TcelBalanceAdjustmentContext";

const useTcelBalanceAdjustmentContext = () => {
  const context = useContext(TcelBalanceAdjustmentContext);

  if (!context) {
    throw new Error(
      "useAccountBalanceContext must be used within a AccountBalanceProvider"
    );
  }

  return context;
};

export default useTcelBalanceAdjustmentContext;
