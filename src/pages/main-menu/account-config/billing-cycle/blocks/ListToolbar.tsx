import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useBillingCycleTypeContext from "../hooks/useBillingCycleTypeContext";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
// import useAccountBalanceContext from "../hooks/useAccountBalanceContext";

const ListToolbar = () => {
  const { menuPrivAccess } = useAccountConfigLayout();
  const { reload, table } = useDataGrid();
  const { handleShowDialog } = useBillingCycleTypeContext();

  const [searchType, setSearchType] = useState<
    "acctResId" | "billingCycleTypeName" | "both"
  >("billingCycleTypeName");
  const [acctResIdValue, setAcctResIdValue] = useState<string>("");
  const [billingCycleTypeNameValue, setAcctResNameValue] = useState<string>("");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchType === "acctResId") {
        table.getColumn("acctResId")?.setFilterValue(acctResIdValue);
        table.getColumn("billingCycleTypeName")?.setFilterValue("");
      } else if (searchType === "billingCycleTypeName") {
        table
          .getColumn("billingCycleTypeName")
          ?.setFilterValue(billingCycleTypeNameValue);
        table.getColumn("acctResId")?.setFilterValue("");
      } else if (searchType === "both") {
        table.getColumn("acctResId")?.setFilterValue(acctResIdValue);
        table
          .getColumn("billingCycleTypeName")
          ?.setFilterValue(billingCycleTypeNameValue);
      }
      table.setPageIndex(0);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [acctResIdValue, billingCycleTypeNameValue, searchType, table]);

  const handleSearchTypeChange = (
    type: "acctResId" | "billingCycleTypeName" | "both",
  ) => {
    setSearchType(type);
    // Reset values when changing search type
    if (type !== "acctResId" && type !== "both") {
      setAcctResIdValue("");
    }
    if (type !== "billingCycleTypeName" && type !== "both") {
      setAcctResNameValue("");
    }
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-end w-full items-end">
          <div className="flex items-end gap-3 flex-shrink-0">
            <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
              <Button
                onClick={() => handleShowDialog(true, "create", null)}
                className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
                size="sm"
              >
                <KeenIcon icon="plus" className="mr-2" />
                Add Data
              </Button>
            </AccessWrapper>

            <DefaultTooltip title="Refresh" placement="top">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                className="p-2"
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListToolbar;
