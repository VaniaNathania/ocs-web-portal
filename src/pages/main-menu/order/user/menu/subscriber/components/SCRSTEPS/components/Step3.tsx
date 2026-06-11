import SuccessBlock from "../../../blocks/SuccessBlock";
import { useSubscriberListContext } from "../../../hooks";

const SCRStep3 = () => {
  const { selectedSubs } = useSubscriberListContext();
  // console.log(selectedSubs);

  return (
    <SuccessBlock
      custNbr={selectedSubs?.accNbr ?? 0}
      offerName={selectedSubs?.subsPlanName ?? ""}
    />
  );
};

export default SCRStep3;
