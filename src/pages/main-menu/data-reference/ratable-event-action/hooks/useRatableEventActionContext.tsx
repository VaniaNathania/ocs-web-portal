import { useContext } from "react";
import { RatableEventActionContext } from "./RatableEventActionContext";

const useRatableEventActionContext = () => {
  const context = useContext(RatableEventActionContext);
  if (!context) throw new Error("useTimeSpanContext must be used within AuthProvider");

  return context;
};

export { useRatableEventActionContext };
