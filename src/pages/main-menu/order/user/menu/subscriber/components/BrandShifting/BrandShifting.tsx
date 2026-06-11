import BrandShiftingForm from "./blocks/Form";
import BrandShiftingTable from "./blocks/table";
import OfferServiceDialog from "./components/OfferService";
import { BrandShiftingProvider } from "./hooks/brandShiftingContext";

const BrandShifting = () => {
  return (
    <BrandShiftingProvider>
      <BrandShiftingForm>
        <BrandShiftingTable />
      </BrandShiftingForm>
      {/* <OfferServiceDialog /> */}
    </BrandShiftingProvider>
  );
};

export default BrandShifting;
