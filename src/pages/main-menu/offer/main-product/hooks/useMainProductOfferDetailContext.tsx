import { useContext } from "react";
import { MainProductOfferDetailContext } from "./MainProductOfferDetailContext";

const useMainProductOfferDetailContext = () => {
  const context = useContext(MainProductOfferDetailContext);

  if (!context)
    throw new Error(
      "useMainProductOfferDetailContext must be used within AuthProvider"
    );

  return context;
};

export { useMainProductOfferDetailContext };
