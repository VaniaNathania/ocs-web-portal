import { Container, DataGridInner } from "@/components";
import { ReservationMainContextListProvider } from "./hooks/ReservationRuleContext";

export default function ReservationPageMain() {
  return (
    <ReservationMainContextListProvider>
      <Container className="p-0">
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
      </Container>
    </ReservationMainContextListProvider>
  );
}
