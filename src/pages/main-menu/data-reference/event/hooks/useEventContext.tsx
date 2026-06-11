import { useContext } from "react";
import { EventMainListContext } from "./EventContext";

const useEventListContext = () => {
  const context = useContext(EventMainListContext);
  if (!context) throw new Error("useZoneListContext must be used within AuthProvider");
  return context;
};

export { useEventListContext };
