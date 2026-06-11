import { Container, DataGridInner } from "@/components";
import { SubscriberNotesMainContextListProvider } from "./hooks/SubscriberNotesContext";

export default function SubscriberNotesMain() {
  return (
    <SubscriberNotesMainContextListProvider>
      <Container className="p-0">
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
      </Container>
    </SubscriberNotesMainContextListProvider>
  );
}
