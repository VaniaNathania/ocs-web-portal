import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { Button } from "@/components/ui/button";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface CategoryList {
  id: string;
  code: string;
  name: string;
}

interface PricePlaneList {
  id: string;
  pricePlanTypeName: string;
}

const ListToolbarSubsPlan = () => {
  const {menuPrivAccess} = useOfferLayout()
  const { refreshSubsPlanSection } = useSubscriptionPlanOfferListContext();
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();

  const [filters, setFilters] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    selectedDetailSideBar, // Data yang sedang dipilih
    selectedIndepProdSpecId,
    openAddDialogSubsPlan,
  } = useSubscriptionPlanOfferListContext();

  const [data, setData] = useState<PricePlaneList[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>();
  // (table.getColumn("offerName")?.getFilterValue() as string) ?? ""

  const [filter, setFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });

  const handleNewClick = () => {
    // Ambil indepProdSpecId dari data yang sedang dipilih
    const indepProdSpecId = selectedDetailSideBar?.indepProdSpecId || selectedDetailSideBar?.offerId || 43; // Fallback value jika perlu

    if (indepProdSpecId) {
      openAddDialogSubsPlan(indepProdSpecId);
    } else {
      console.error("No indepProdSpecId available for new subscription plan");
      toast.error("Please select a main product first");
    }
  };

  const handleRefreshClick = () => {
    refreshSubsPlanSection();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-start item-center p-4">
        {/* <div className="flex w-1/5 gap-3 items-center">
            <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full"
              />
            </label>
          </div> */}

        <div className="flex gap-3">
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="New Data">
            <Button variant="outline" className="h-7.5" onClick={handleNewClick}>
              <KeenIcon icon="plus" />
              New
            </Button>
          </AccessWrapper>
        

          <DefaultTooltip title="Refresh" placement="top">
            <Button variant="outline" className="h-7.5" onClick={handleRefreshClick}>
              <KeenIcon icon="arrows-circle" />
            </Button>
          </DefaultTooltip>
        </div>
      </div>
    </>
  );
};

export { ListToolbarSubsPlan };
