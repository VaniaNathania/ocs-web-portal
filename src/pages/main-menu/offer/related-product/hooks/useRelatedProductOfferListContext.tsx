import { useContext } from "react";
import { RelatedProductOfferListContext } from "./RelatedProductOfferListContext";

const useRelatedProductOfferListContext = () => {
  const context = useContext(RelatedProductOfferListContext);
  if (!context)
    throw new Error(
      "useMainProductOfferListContext must be used within AuthProvider"
    );

  return context;
};

export { useRelatedProductOfferListContext };
