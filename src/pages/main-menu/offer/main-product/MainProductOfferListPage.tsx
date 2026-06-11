import { Container, DataGridInner } from "@/components";
import { MainProductOfferListContextProvider } from "./hooks";
import AddSideBar from "./blocks/AddSideBar";
import DeleteSideBar from "./blocks/DeleteSidebarDialog";
import EditSideBar from "./blocks/EditSideBar";
import AddDialog from "./blocks/AddDialog";
import DeleteDialog from "./blocks/DeleteDialog";

export default function MainProductOfferListPage() {
  return (
    <>
      <MainProductOfferListContextProvider>
        <Container>
          <div className="grid gap-5 lg:gap-7.5">
            <DataGridInner />
          </div>
          <AddDialog />
          <AddSideBar />
          <DeleteSideBar />
          <EditSideBar />
          <DeleteDialog />
        </Container>
      </MainProductOfferListContextProvider>
    </>
  );
}
