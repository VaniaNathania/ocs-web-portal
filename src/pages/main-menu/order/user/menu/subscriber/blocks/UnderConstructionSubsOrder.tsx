import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../hooks";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import UnderConstruction from "@/components/common/UnderConstruction";
import SubsListFormHeader from "../components/header";

const UnderConstructSubsOrder = () => {
  const { showDialog, selectedSubs, setSelectedOperation, selectedOperation } =
    useSubscriberListContext();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-white gap-5">
      <SubsListFormHeader />
      <div className="flex-1 w-full p-5">
        <UnderConstruction />
      </div>
    </div>
  );
};

export default UnderConstructSubsOrder;
