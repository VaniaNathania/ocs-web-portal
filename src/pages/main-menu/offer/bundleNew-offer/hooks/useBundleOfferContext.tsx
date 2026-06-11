import { useContext } from "react";
import { BundleOfferContext } from "./BundleOfferContext";

const useBundleOfferContext = () => {
  const context = useContext(BundleOfferContext);

  if (!context) {
    throw new Error("useBundleOfferContext must be used within AuthProvider");
  };
  return context;
};

export { useBundleOfferContext };
