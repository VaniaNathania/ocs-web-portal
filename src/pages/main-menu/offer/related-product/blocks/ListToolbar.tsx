import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
// import { RelatedProductDialog } from "./AddDialog";

interface RelatedProductOfferList {
  id: string;
  code: string;
}

interface CategoryList {
  id: string;
  code: string;
  name: string;
}

interface PricePlaneList {
  id: string;
  pricePlanTypeName: string;
}

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const { handleAddDialog } = useRelatedProductOfferListContext();

  const [filters, setFilters] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [data, setData] = useState<PricePlaneList[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  const [filter, setFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });

  const resetFilter = () => {
    setSearchValue("");
    setFilters("");
  };

  const handleDialogSubmit = (formData: any) => {
    // console.log("Form submitted:", formData);
    // Handle form submission logic here
    toast.success("Related product added successfully!");
    setIsDialogOpen(false);
    reload(); // Refresh the data grid
  };

  const { menuPrivAccess } = useOfferLayout();

  return (
    <>
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center">
          <div className="flex w-1/5 gap-3 items-center">
            {/* <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full"
              />
            </label> */}

            <div className="flex gap-3">
              <AccessWrapper
                hasAccess={menuPrivAccess?.addStatus}
                enabledText="New Data"
              >
                <Button
                  variant="outline"
                  className="h-7.5"
                  onClick={() => handleAddDialog(true)}
                >
                  <KeenIcon icon="plus" />
                  New
                </Button>
              </AccessWrapper>

              <DefaultTooltip title="Refresh" placement="top">
                <Button
                  variant="outline"
                  className="h-7.5"
                  onClick={() => reload()}
                >
                  <KeenIcon icon="arrows-circle" />
                </Button>
              </DefaultTooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { ListToolBar };
