import { Container, DataGridInner } from "@/components";
import { DiscountPriceContextProvider } from "./hooks";

export default function DiscountPriceAddPage() {
  return (
    <DiscountPriceContextProvider>
      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
      </Container>
    </DiscountPriceContextProvider>
  );
}
