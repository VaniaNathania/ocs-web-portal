import { Container, DataGridInner } from "@/components";
import {PricePlanOfferListContextProvider} from "./hooks";
import { AddDialog } from "./blocks/AddDialog";

export default function PricePlanListPage() {
  return (
    <>
      <PricePlanOfferListContextProvider>
        <Container>

          <div className="grid gap-5 lg:gap-7.5">
            <DataGridInner />
          </div>
          <AddDialog />
        </Container>
      </PricePlanOfferListContextProvider>
    </>
  );
}
