import { useContext } from "react";
import { SubscriptionPlanOfferListContext } from "./SubscriptionPlanOfferListContext";

const useSubscriptionPlanOfferListContext = () => {
  const context = useContext(SubscriptionPlanOfferListContext);
  if (!context) throw new Error("useSubscriptionPlanOfferListContext must be used within AuthProvider");

  return context;
};

export { useSubscriptionPlanOfferListContext };
