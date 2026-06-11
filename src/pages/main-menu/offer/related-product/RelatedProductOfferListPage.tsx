import { Container, DataGridInner } from "@/components";
import { RelatedProductOfferListContextProvider } from "./hooks/RelatedProductOfferListContext";
import AddSideBar from "./blocks/AddSideBar";
import DeleteSideBar from "./blocks/DeleteSideBar";
import AddDialog from "./blocks/AddDialog";
import DeleteDialog from "./blocks/DeleteDialog";
import EditDialog from "./blocks/EditDialog";
import EditSideBar from "./blocks/EditSideBar";
import CategoryDetail from "./components/DetailSubCategorySideBar";

export default function RelatedProductOfferListPage() {
  return (
    <RelatedProductOfferListContextProvider>
      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <DataGridInner />
        </div>
        <AddDialog />
        <DeleteDialog />
        <EditDialog />
        <AddSideBar />
        <DeleteSideBar />
        <EditSideBar />
      </Container>
    </RelatedProductOfferListContextProvider>
  );
}
