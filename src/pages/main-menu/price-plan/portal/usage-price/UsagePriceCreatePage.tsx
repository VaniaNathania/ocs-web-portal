import { Container, DataGridInner } from "@/components";
import { UsagePriceCreateContextProvider } from "./hooks";

export default function UsagePriceAddPage() {
  return (
    <UsagePriceCreateContextProvider>
      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
      </Container>
    </UsagePriceCreateContextProvider>
  );
}
