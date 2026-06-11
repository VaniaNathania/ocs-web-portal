import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { setData, toAbsoluteUrl } from "@/utils";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

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
const API_URL_MASTER = apiConfig.service_master_data;

const ListToolBarFeature = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const {
    date,
    setDate,
    // doExportData,
    // handleMainContentAddDialog,
    // selectedMenuPricePlan,
  } = useSubscriptionPlanOfferListContext();

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
        {/* Search */}
          <div className="flex w-full gap-3 items-center">
            <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search Feature Name..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full"
              />
            </label>
          </div>

        {/* Left Section */}
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-[60%]">
          <div className="w-1/2">
            <Select
              value={selectedSerial || ""}
              onValueChange={(value: any) => {
                setSelectedSerial(value);
                setFilters(value);
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Contact Channel" />
              </SelectTrigger>
              <SelectContent>
                {datas.map((cd) => (
                  <SelectItem key={cd.id} value={cd.id}>
                    {cd.pricePlanTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/3">
            <Select
              value={selectedSerial || ""}
              onValueChange={(value: any) => {
                setSelectedSerial(value);
                setFilters(value);
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {datas.map((cd) => (
                  <SelectItem key={cd.id} value={cd.id}>
                    {cd.pricePlanTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </div>
    </div>
  );
};

export { ListToolBarFeature };
