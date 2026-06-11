import { useContext } from "react";
import { RecurringRatingContext } from "./RecurringRatingContext";

const useRecurrringRatingContext = () => {
  const context = useContext(RecurringRatingContext);

  if (!context)
    throw new Error(
      "useRecurrringRatingContext must be used within RecurringRatingContextProvider"
    );

  return context;
};

export default useRecurrringRatingContext;
