import { useSubscriberListContext } from "../../../hooks";
import SuccessBlock from "../../../blocks/SuccessBlock";
import { useModSubs } from "../hooks/context";

const ModSubsStep4 = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { allData } = useModSubs();
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

export default ModSubsStep4;
