import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { FeatureOfferGroupMain } from "./FeatureOfferGroupMain";

interface props {
  isOpen: boolean;
  handleDialog: (open: boolean) => void;
  payload: {
    offerId: number;
    subsPlanVerId: number;
    offerName?: string;
  };
}

export const FeatureOfferGroupContent = ({
  isOpen,
  handleDialog,
  payload,
}: props) => {
  return (
    <DialogWrapper
      title="Feature"
      isOpen={isOpen}
      onClose={() => handleDialog(false)}
      handleDialog={handleDialog}
      size={{ width: "6xl", height: "fit" }}
    >
      <FeatureOfferGroupMain payload={payload} />
    </DialogWrapper>
  );
};
