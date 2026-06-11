import React, { useEffect, useState } from "react";
import { KeenIcon } from "@/components";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useSubscriptionPlanOfferListContext } from "../../hooks/useSubscriptionPlanOfferListContext";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { Button } from "@/components/ui/button";
import { apiConfigOffer } from "@/config/api.config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface VersionSubsPlanProps {
  offer: any;
  setSelectedOffers: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface offerVer {
  effDate: string;
  offerCode: string;
  offerId: number;
  offerName: string;
  offerVerId: number;
  expDate: number;
}

const API_URL_OFFER = apiConfigOffer.offer;

const VersionSubsPlan: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { selectedSubSubPlan, setSelectedVer, selectedVer, menuPrivAccess } = useOfferLayout();
  const { handleAddVersionDialogSubsPlan, handleEditVersionDialogSubsPlan, handleVersionClick, handleDeleteVersionDialogSubsPlan, versions } = useSubscriptionPlanOfferListContext();

  useEffect(() => {
    // console.log(selectedSubSubPlan);
    setSelectedVer(selectedSubSubPlan?.offerVer[0]);
  }, [selectedSubSubPlan]);

  useEffect(() => {
    if (versions && versions.length > 0 && selectedVer) {
      const updated = versions.find((v) => v.offerVerId === selectedVer.offerVerId);
      if (updated) {
        setSelectedVer(updated);
      } else {
        setSelectedVer(versions[0]);
      }
    }
  }, [versions]);

  useEffect(() => {
    // console.log("DATA VERSION: ", selectedVer);
  }, [selectedVer]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
          {selectedVer?.effDate} ~ {selectedVer?.expDate}
          <KeenIcon icon="down" className="ml-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-[250px] max-w-[400px] p-4 space-y-4 whitespace-nowrap overflow-x-auto">
        {versions && versions.length > 0 ? (
          versions?.map((item, index) => (
            <div className="border-b-2 p-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-left truncate"
                onClick={() => {
                  handleVersionClick(item);
                  setSelectedVer(item);
                  setOpen(false);
                }}
              >
                Version{index + 1}:({item.effDate}~{item.expDate})
              </Button>
            </div>
          ))
        ) : (
          <div className="flex p-2">
            <KeenIcon icon="information" className="text-lg text-red-700 mr-2" />
            <h3 className="text-red-700">Version Not Found</h3>
          </div>
        )}

        {/* Add Version */}
        <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
        <DropdownMenuItem onClick={() => handleAddVersionDialogSubsPlan(true)} className="cursor-pointer">
          Add Version
        </DropdownMenuItem>
        </AccessWrapper>

        {/* Edit Current Version */}
        <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
        <DropdownMenuItem onClick={() => handleEditVersionDialogSubsPlan(true)} className="cursor-pointer">
          Edit Current Version
        </DropdownMenuItem>
        </AccessWrapper>

        {/* Delete Current Version */}
        <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
        <DropdownMenuItem onClick={() => handleDeleteVersionDialogSubsPlan(true)} className="cursor-pointer">
          Delete Current Version
        </DropdownMenuItem>
        </AccessWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VersionSubsPlan;
