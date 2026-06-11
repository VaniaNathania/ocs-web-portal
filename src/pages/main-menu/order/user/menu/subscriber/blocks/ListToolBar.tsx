import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { useSubscriberListContext } from "../hooks";
import { setData, toAbsoluteUrl } from "@/utils";
// import { DateRangePicker } from "./DateRangePicker";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
// import { DatePicker } from "./DatePicker";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { SearchSelect } from "./SearchSelect";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Input } from "@/components/ui/input";
// import { AddDialogSub } from "../blocks/AddDialogSub"

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

const ListToolBar = () => {
  const { table, totalRows } = useDataGrid();
  const { GetData } = useCallApi();
  const { result, filter, setFilter, state, setState } =
    useSubscriberListContext();
  const [filterBy, setFilterBy] = useState<string>("subsPlanName");

  const resetFilter = () => {
    setFilter("");
  };

  useEffect(() => {
    table.setColumnFilters([
      {
        id: filterBy,
        value: filter,
      },
    ]);
  }, [filter, filterBy]);

  useEffect(() => {
    // console.log("ini total rows", totalRows);
  }, [totalRows]);

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
        {/* Right Section */}
        <div className="flex gap-3 items-center">
          {/* <DefaultTooltip title="New Data" placement="top"> */}

          {/* === Combined Select + Input + Select === */}
          <div className="flex items-center gap-3">
            {/* === Select + Input === */}
            <div className="flex items-center border rounded-md overflow-hidden w-[320px] bg-white shadow-sm">
              <Select
                value={filterBy}
                onValueChange={(val) => setFilterBy(val)}
              >
                <SelectTrigger className="w-[130px] border-0 focus:ring-0 focus:outline-none text-sm">
                  <SelectValue placeholder="Offer Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="subsPlanName" value="subsPlanName">
                    Offer Name
                  </SelectItem>
                  <SelectItem key="accNbr" value="accNbr">
                    Service Number
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center flex-1 px-2">
                <Input
                  className="border-0 focus:ring-0 focus:outline-none text-sm"
                  type="text"
                  placeholder="Search..."
                  value={filter}
                  onChange={({ target }) => setFilter(target.value)}
                />
                <KeenIcon
                  icon="magnifier"
                  className="text-gray-400 w-4 h-4 mr-1"
                />
              </div>
            </div>

            {/* === Second Select === */}
            <div className="flex items-center border rounded-md overflow-hidden w-[220px] bg-white shadow-sm">
              <Select value={state} onValueChange={(id) => setState(id)}>
                <SelectTrigger className="w-full border-0 focus:ring-0 focus:outline-none text-sm">
                  <SelectValue placeholder="All Subscriber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="G,A,D,E,C,H" value="G,A,D,E,C,H">
                    All Subscriber
                  </SelectItem>
                  <SelectItem key="G,A,D,E,C" value="G,A,D,E,C">
                    Available Subscriber
                  </SelectItem>
                  <SelectItem key="B" value="B">
                    Historical Subscriber
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => result.refetch()}
            >
              <KeenIcon icon="arrows-circle" />
            </Button>
          </div>
          {/* === End Combined Field === */}

          {/* </DefaultTooltip> */}

          {/* <DefaultTooltip title="Refresh" placement="top">
        <Button
          variant="outline"
          className="h-7.5"
          onClick={() => reload()}
        >
          <KeenIcon icon="arrows-circle" />
        </Button>
      </DefaultTooltip> */}
        </div>
      </div>
    </div>
  );
};

export { ListToolBar };
