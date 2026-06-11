import { useContext } from "react";
import { JobListContext } from "./JobProvider";

// Optional: helper hook to use context
export const useJobList = () => {
  const context = useContext(JobListContext);
  if (!context) {
    throw new Error("useUserList must be used within a UserListProvider");
  }
  return context;
};
