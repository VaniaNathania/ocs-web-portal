import { FeatureOfferGroupMain } from "../FeatureOfferGroupMain";

interface props {
  payload: {
    offerId: number;
    subsPlanVerId: number;
    offerName?: string;
  };
}

const SubsPlanFeatureTabContent = ({ payload }: props) => {
  return <FeatureOfferGroupMain payload={payload} />;
};

export default SubsPlanFeatureTabContent;
