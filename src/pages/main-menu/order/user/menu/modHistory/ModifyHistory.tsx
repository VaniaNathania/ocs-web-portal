import { Container, DataGridInner } from "@/components";
import { ModifyHistoryContextListProvider } from "./hooks/ModifyHistoryContext";
import SelectAccComp from "../../../component/SelectAccComp";

export default function ModifyHistoryMain() {
  return (
    <>
      <ModifyHistoryContextListProvider>
        <Container className="p-0">
          <SelectAccComp />

          <div className="grid gap-5 lg:gap-7.5">
            <DataGridInner />
          </div>
        </Container>
      </ModifyHistoryContextListProvider>
    </>
  );
}
