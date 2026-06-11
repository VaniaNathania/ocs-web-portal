import { useContext } from "react";
import { MultiTabContext } from "./multiTabContext";


const useMultiTab = () => {
  const context = useContext(MultiTabContext);
  if (context === undefined) {
    throw new Error("useMultiTab must be used within an MultiTabProvider");
  }
  return context;
};

export default useMultiTab;
