import { useContext } from "react";
import { MainProductOfferAddContext } from "./MainProductOfferAddContext";

const useMainProductOfferAddContext = () => {
  const context = useContext(MainProductOfferAddContext);

  if (!context)
    throw new Error(
      "useMainProductOfferAddContext must be used within AuthProvider"
    );

  return context;
};

export { useMainProductOfferAddContext };
