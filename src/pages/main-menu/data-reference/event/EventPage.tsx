import { Container, DataGridInner } from "@/components";
import { EventMainContextListProvider } from "./hooks/EventContext";

export default function EventPageMain() {
  return (
    <EventMainContextListProvider>
      <Container className="p-0">
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
      </Container>
    </EventMainContextListProvider>
  );
}
