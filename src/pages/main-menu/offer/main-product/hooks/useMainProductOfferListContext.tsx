import { useContext } from "react";
import { MainProductOfferListContext } from "./MainProductOfferListContext";

const useMainProductOfferListContext = () => {
  const context = useContext(MainProductOfferListContext);
  if (!context) throw new Error("useMainProductOfferListContext must be used within AuthProvider");

  return context;
};

export { useMainProductOfferListContext };
