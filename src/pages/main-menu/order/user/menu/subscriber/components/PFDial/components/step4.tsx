import { useSubscriberListContext } from "../../../hooks";
import SuccessBlock from "../../../blocks/SuccessBlock";
import { usePFDial } from "../hooks/context";

const Step4 = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { allData } = usePFDial();
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

export default Step4;
