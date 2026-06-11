import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBundleOfferContext } from "../../../hooks/useBundleOfferContext";
import { KeenIcon } from "@/components";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const SubsPlanVersionBund: React.FC = () => {
  const {
    showSubsPlanVersion,
    setShowSubsPlanVersion,
    versionSubsplan,
    setVersionSubsPlan,
  } = useBundleOfferContext();
  const { selectedSubSubPlan, setSelectedVer, selectedVer } = useOfferLayout();

  useEffect(() => {
    setSelectedVer(selectedSubSubPlan?.offerVer[0]);
  }, [selectedSubSubPlan]);

  useEffect(() => {
    if (versionSubsplan && versionSubsplan.length > 0 && selectedVer) {
        const updateVer = versionSubsplan.find((ver) => ver.offerId === selectedVer.offerId);
        if (updateVer) {
            setSelectedVer(updateVer);
        } else {
            setSelectedVer(versionSubsplan[0]);
        }
    }
  }, [versionSubsplan]);

  return (
    <DropdownMenu
      open={showSubsPlanVersion}
      onOpenChange={setShowSubsPlanVersion}
    >
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
          {selectedVer?.effDate} ~ {selectedVer?.expDate}
          <KeenIcon icon="down" className="ml-1" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-[250px] max-w-[400px] p-4 space-y-4 whitespace-nowrap overflow-x-auto">
        {versionSubsplan && versionSubsplan.length > 0 ? (
          versionSubsplan?.map((item, index) => (
            <div key={item.offerId || index} className="border-b-2 p-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-left truncate"
              >
                Version {index + 1}: ({item.effDate} ~ {item.expDate})
              </Button>
            </div>
          ))
        ) : (
          <div className="flex p-2">
            <KeenIcon
              icon="information"
              className="text-lg text-red-700 mr-2"
            />
            <h3 className="text-red-700">Version Not Found</h3>
          </div>
        )}
        <DropdownMenuItem className="cursor-pointer">
            Add Version
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
            Edit Current Version
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
            Delete Current Version
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubsPlanVersionBund;
