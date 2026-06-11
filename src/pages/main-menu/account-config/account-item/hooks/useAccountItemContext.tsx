import { useContext } from "react";
import { AccountItemContext } from "./AccountItemContext";

const useAccountItemContext = () => {
  const context = useContext(AccountItemContext);

  if (!context) {
    throw new Error(
      "useAccountItemContext must be used within a AccountItemProvider"
    );
  }

  return context;
};

export default useAccountItemContext;
