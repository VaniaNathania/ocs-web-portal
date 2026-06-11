import { useContext } from "react";
import { TimeSpanContext } from "./SpanTimeContext";

const useTimeSpanContext = () => {
  const context = useContext(TimeSpanContext);
  if (!context) throw new Error("useTimeSpanContext must be used within AuthProvider");

  return context;
};

export { useTimeSpanContext };
