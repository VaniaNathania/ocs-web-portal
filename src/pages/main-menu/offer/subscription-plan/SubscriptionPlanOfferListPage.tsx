import { Container, DataGridInner } from "@/components";
import { SubscriptionPlanOfferListContextProvider } from "./hooks/SubscriptionPlanOfferListContext";
import AddDialog from "./blocks/AddDialog";
import DeleteDialog from "./blocks/DeleteDialog";

export default function SubscriptionPlanOfferListPage() {
  return (
    <>
      <SubscriptionPlanOfferListContextProvider>
        <Container>
          <div className="grid gap-5 lg:gap-7.5">
            <DataGridInner />
          </div>
          <AddDialog />
          <DeleteDialog />
        </Container>
      </SubscriptionPlanOfferListContextProvider>
    </>
  );
}
