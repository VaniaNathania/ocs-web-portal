import { useContext } from "react";
import { TriggerCreateContext } from "./TriggerCreateContext";

const useTriggerCreateContext = () => {
  const context = useContext(TriggerCreateContext);

  if (!context)
    throw new Error(
      "useTriggerCreateContext must be used within ReceiverProvider"
    );

  return context;
};

export { useTriggerCreateContext };
