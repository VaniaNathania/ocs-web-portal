import { useContext } from "react";
import { RecurringAcmContext } from "./RecurringAcmContext";

const useRecurringAcmContext = () => {
  const context = useContext(RecurringAcmContext);

  if (!context)
    throw new Error(
      "useRecurringAcmContext must be used within RecurringAcmContextProvider"
    );

  return context;
};

export default useRecurringAcmContext;
