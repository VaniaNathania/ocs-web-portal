import { useContext } from "react";
import { InstallmentTypeContext } from "./InstallmentTypeContext";

const useInstallmentTypeContext = () => {
  const context = useContext(InstallmentTypeContext);

  if (!context) {
    throw new Error(
      "useInstallmentTypeContext must be used within a InstallmentTypeProvider"
    );
  }

  return context;
};

export default useInstallmentTypeContext;
