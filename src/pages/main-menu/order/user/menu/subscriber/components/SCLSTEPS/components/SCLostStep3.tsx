import { useSubscriberListContext } from "../../../hooks";
import SuccessBlock from "../../../blocks/SuccessBlock";

const SCLStep3 = () => {
  const { selectedSubs } = useSubscriberListContext();
  // console.log(selectedSubs);

  return (
    <SuccessBlock
      custNbr={selectedSubs?.accNbr ?? 0}
      offerName={selectedSubs?.subsPlanName ?? ""}
    />
  );
};

export default SCLStep3;
