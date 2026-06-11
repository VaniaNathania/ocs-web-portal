import { useContext } from "react";
import { SubscriberNotesMainListContext } from "./SubscriberNotesContext";

const useSubscriberNotesMainListContext = () => {
  const context = useContext(SubscriberNotesMainListContext);
  if (!context) throw new Error("useSubriberListContext must be used within AuthProvider");
  return context;
};

export { useSubscriberNotesMainListContext };
