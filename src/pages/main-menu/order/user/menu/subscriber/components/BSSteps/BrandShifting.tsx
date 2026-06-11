import Main from "./blocks/main";
import { BrandShiftProvider } from "./hooks/context";

const BrandShiftForm = () => {
  return (
    <BrandShiftProvider>
      <Main />
    </BrandShiftProvider>
  );
};

export default BrandShiftForm;
