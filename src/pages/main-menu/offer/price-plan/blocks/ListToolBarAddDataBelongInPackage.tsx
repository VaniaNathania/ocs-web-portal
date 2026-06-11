import { useDataGrid } from "@/components";
import { usePricePlanListContext } from "../hooks";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
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

const ListToolBarAddDataBelongInPackage = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const {
    date,
    setDate,
    // doExportData,
    handleMainContentAddDialog,
    // selectedMenuPricePlan,
  } = usePricePlanListContext();

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
        {/* Left Section */}
        <div className="flex gap-3 items-center w-full">
          <div className="w-1/3">
            <label htmlFor="offerName" className="text-sm font-medium text-gray-700">
              Offer Name
            </label>
            <input
              id="offerName"
              type="text"
              placeholder="Offer Name"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="w-1/3">
            <label htmlFor="offerName" className="text-sm font-medium text-gray-700">
              Offer Status
            </label>
            <input
              id="offerName"
              type="text"
              placeholder="Offer Status"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="w-1/3">
            <label htmlFor="offerName" className="text-sm font-medium text-gray-700">
              Created Date
            </label>
            <input
              id="offerName"
              type="text"
              placeholder="Created Date"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolBarAddDataBelongInPackage };
