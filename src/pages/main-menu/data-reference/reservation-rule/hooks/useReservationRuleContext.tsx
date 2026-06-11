import { useContext } from "react";
import { ReservationMainListContext } from "./ReservationRuleContext";

export const useReservationListContext = () => {
  const context = useContext(ReservationMainListContext);

  if (!context) {
    throw new Error(
      "useReservationListContext must be used within ReservationMainContextListProvider"
    );
  }

  return context;
};
