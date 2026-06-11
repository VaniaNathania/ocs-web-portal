import { Container, DataGridInner } from "@/components";
import { PricePlanDetailContextProvider } from "./hooks";
// import { Navbar } from "./blocks";
import { useLocation, useNavigate } from "react-router-dom";

export default function PricePlanDetailPage() {
  const { state } = useLocation();
  const { dataPricePlan } = state || {};

  return (
    <PricePlanDetailContextProvider>
      <Container className="!px-0">
        {/* <Navbar pricePlanDetail={dataPricePlan} /> */}
      </Container>
    </PricePlanDetailContextProvider>
  );
}
