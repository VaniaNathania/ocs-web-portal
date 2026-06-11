import { useContext } from "react";
import { RecurringBenefitContext } from "./RecurringBenefitContext";

const useRecurringBenefitContext = () => {
  const context = useContext(RecurringBenefitContext);

  if (!context)
    throw new Error(
      "useRecurringBenefitContext must be used within RecurringBenefitContextProvider"
    );

  return context;
};

export default useRecurringBenefitContext;
