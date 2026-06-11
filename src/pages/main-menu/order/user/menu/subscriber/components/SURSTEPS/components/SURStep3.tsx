import { useSubscriberListContext } from "../../../hooks";
import SuccessBlock from "../../../blocks/SuccessBlock";
import { useSUR } from "../hooks/context";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const SURStep3 = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { isLoadingSUR } = useSUR();
  // console.log(selectedSubs);

  if (isLoadingSUR) return <Loading />;

  return <SuccessBlock custNbr={selectedSubs?.accNbr ?? 0} offerName={selectedSubs?.subsPlanName ?? ""} />;
};

export default SURStep3;
