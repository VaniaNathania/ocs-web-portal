import { useSubscriberListContext } from "../../../hooks";
import SuccessBlock from "../../../blocks/SuccessBlock";
import { useBrandShift } from "../hooks/context";

const BrandShiftStep4 = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { allData } = useBrandShift();
  // console.log(selectedSubs);

  return (
    <SuccessBlock
      custNbr={selectedSubs?.accNbr ?? 0}
      offerName={selectedSubs?.subsPlanName ?? ""}
      custOrderId={allData?.custOrderId}
      orderId={allData?.orderItemList[0].orderId}
    />
  );
};

export default BrandShiftStep4;
