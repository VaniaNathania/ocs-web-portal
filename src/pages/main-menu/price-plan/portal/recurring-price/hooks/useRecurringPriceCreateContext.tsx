import { useContext } from "react";
import { RecurringPriceContext } from "./RecurringPriceContext";

const useRecurringPriceContext = () => {
  const context = useContext(RecurringPriceContext);

  if (!context)
    throw new Error(
      "useRecurringPriceContext must be used within ReceiverProvider"
    );

  return context;
};

export { useRecurringPriceContext };
