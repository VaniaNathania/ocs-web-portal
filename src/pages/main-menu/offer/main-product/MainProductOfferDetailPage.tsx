import { Container, DataGridInner } from "@/components";
import { MainProductOfferDetailContextProvider } from "./hooks";
import { Navbar } from "./blocks";
import { useLocation, useNavigate } from "react-router-dom";
// import MenuList from "./blocks/MenuList";

export default function MainProductOfferDetailPage() {
  const { state } = useLocation();
  const { dataPricePlan } = state || {};

  return (
    <MainProductOfferDetailContextProvider>
      <Container className="!px-0">
        <div className="mt-7">
            {/* <MenuList /> */}
          </div>
        <Navbar pricePlanDetail={dataPricePlan} />
      </Container>
    </MainProductOfferDetailContextProvider>
  );
}
