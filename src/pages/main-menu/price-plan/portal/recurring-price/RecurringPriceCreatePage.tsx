import { Container, DataGridInner } from "@/components";
import { RecurringPriceContextProvider } from "./hooks";
import CreateEventDialog from "./blocks/CreateEventDialog";

export default function RecurringPriceAddPage() {
  return (
    <RecurringPriceContextProvider>
      <CreateEventDialog />
    </RecurringPriceContextProvider>
  );
}
