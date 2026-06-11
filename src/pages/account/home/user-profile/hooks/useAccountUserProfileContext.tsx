import { useContext } from "react";
import { AccountUserProfileContext } from "./AccountUserProfileContext";

const useAccountUserProfileContext = () => {
  const context = useContext(AccountUserProfileContext);

  if (!context)
    throw new Error(
      "useAccountUserProfileContext must be used within AccountUserProviderContext",
    );

  return context;
};

export { useAccountUserProfileContext };
