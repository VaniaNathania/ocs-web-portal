import {
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { usePricePlanListContext } from "../hooks";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { AddDialogSub } from "../blocks/AddDialogSub"
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

interface MainProductOfferList {
  id: string;
  code: string;
}

interface CategoryList {
  id: string;
  code: string;
  name: string;
}
interface DepartmentList {
  uuid: string;
  _idx: string;
  deptname: string;
  nikspv: string;
  nikmgr: string;
  idxdivisi: number;
  isdeleted: number;
  remarkdeleted: string;
  iby: string;
  idt: string;
  uby: string;
  udt: string;
  dby: string;
  ddt: string;
  nikgm: string;
}

interface PricePlanList {
  id: string;
  pricePlanTypeName: string;
}

const API_URL = apiConfig.service_price_plan;

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const {
    date,
    setDate,
    doExportData,
    handleAddDialogsub,
    selectedMenuPricePlan,
    showAddDialogSub,
    addDialogCatgId
  } = usePricePlanListContext();

  const {menuPrivAccess} = useOfferLayout()

  const [filters, setFilters] = useState<string>("");
  const [filteredDate, setFilteredDate] = useState<DateRange | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);

  const [code, setCode] = useState<MainProductOfferList[]>([]);
  const [department, setDepartment] = useState<DepartmentList[]>([]);
  const [branch, setBranch] = useState<CategoryList[]>([]);
  const [datas, setDatas] = useState<PricePlanList[]>([]);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedSerial, setSelectedSerial] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [filter, setFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
    code?: string;
    type?: string;
    department?: string;
    supplier?: string;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
    code: "",
    type: "",
    department: "",
    supplier: "",
  });

  const resetFilter = () => {
    setSearchValue("");
    setSelectedSerial(null);
    setFilters("");
  };

  const getPricePlanList = async () => {
    try {
      const response = await GetData(`${API_URL}/priceplan/menu/list`, {});

      if (response?.status) {
        if (selectedMenuPricePlan === "S") {
          setDatas(response?.data?.[0]?.list?.[0] || []);
        } else {
          setDatas(response?.data?.[1]?.list?.[0] || []);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error get menu price plan");
    }
  };

  const handleExport = () => {
    const sorting = table.getState().sorting;
    doExportData(sorting, table.getState().columnFilters);
  };

  const handleFilterData = useCallback(() => {
    try {
      setIsLoading(true);
      setLoadingButton("filter");
      const filters = [];

      if (selectedCode) {
        filters.push({
          id: "AssetInventory.code",
          value: selectedCode,
        });
      }

      if (selectedSerial) {
        filters.push({
          id: "AssetInventory.serial",
          value: selectedSerial,
        });
      }

      if (selectedDepartment) {
        filters.push({
          id: "AssetInventory.department_id",
          value: selectedDepartment,
        });
      }

      if (selectedBranch) {
        filters.push({
          id: "AssetInventory.branch_id",
          value: selectedBranch,
        });
      }

      // if (date?.from) {
      //   const fromDate = moment(date.from).format("YYYY-MM-DD");
      //   const toDate = date.to
      //     ? moment(date.to).format("YYYY-MM-DD")
      //     : fromDate;

      //   filters.push({
      //     id: "request_at_from",
      //     value: `${fromDate} 00:00:00`,
      //   });
      //   filters.push({
      //     id: "request_at_to",
      //     value: `${toDate} 23:59:59`,
      //   });
      // }

      table.setColumnFilters(filters);
    } catch (error) {
      toast.error("Error filtering data");
    } finally {
      setLoadingButton(null);
      setIsLoading(false);
    }
  }, [
    date,
    selectedCode,
    selectedSerial,
    selectedDepartment,
    selectedBranch,
    table,
  ]);

  const handleResetData = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 31);

    setDate({ from: oneMonthAgo, to: today });
    setFilter({
      from: oneMonthAgo,
      to: today,
      type: "",
    });

    setSelectedSerial(null);
    setSelectedCode(null);
    setSelectedDepartment(null);
    setSelectedBranch(null);
    table.setColumnFilters([]);
    reload();
  };

  useEffect(() => {
    getPricePlanList();
    resetFilter();
  }, [selectedMenuPricePlan]);

  useEffect(() => {
    table.setColumnFilters([
      {
        id: "pricePlanTypeId",
        value: filters,
      },
    ]);
  }, [filters]);

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
        {/* Right Section */}
        <div className="flex gap-3">
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="New Data">
            <Button
              variant="outline"
              className="h-7.5"
              type="button"
              onClick={() => handleAddDialogsub(true, addDialogCatgId ?? 0)}
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
      {/* AddDialogSub */}
      {showAddDialogSub && <AddDialogSub />}
    </div>
  );
};

export { ListToolBar };
