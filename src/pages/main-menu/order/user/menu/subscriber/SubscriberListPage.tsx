import { Container, DataGridInner } from "@/components";
import { SubscriberListContextProvider } from "./hooks";

export default function SubscriberListPage() {
  return (
    <>
      <SubscriberListContextProvider>
        <Container className="">
          {/* <div className="grid gap-5 lg:gap-7.5">
            <DataGridInner />
          </div>
          <ModifySubscriberDetailAddDialog /> */}
        </Container>
      </SubscriberListContextProvider>
    </>
  );
}
