import { useContext } from "react";
import { ZoneMainListContext } from "./ZoneContext";

const useZoneMainListContext = () => {
  const context = useContext(ZoneMainListContext);
  if (!context) throw new Error("useZoneListContext must be used within AuthProvider");
  return context;
};

export { useZoneMainListContext };
