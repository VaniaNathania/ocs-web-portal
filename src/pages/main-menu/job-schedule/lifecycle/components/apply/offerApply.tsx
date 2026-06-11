import Main from "./blocks/main";
import AddOfferDialog from "./components/addOfferDialog";
import { OfferApplyProvider } from "./hooks/context";

const LifeCycleOfferApply = () => {
  return (
    <OfferApplyProvider>
      <AddOfferDialog />
      <Main />
    </OfferApplyProvider>
  );
};

export default LifeCycleOfferApply;
