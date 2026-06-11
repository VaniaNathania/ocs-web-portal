import { useContext } from "react";
import { UserGrantHistoryDataContext } from "./UserGrantHistoryDataProvider";

// Optional: helper hook to use context
export const useUserGrantHistoryData = () => {
  const context = useContext(UserGrantHistoryDataContext);
  if (!context) {
    throw new Error(
      "useUserGrantHistoryData must be used within a UserGrantHistoryDataProvider"
    );
  }
  return context;
};
