import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { toAbsoluteUrl } from "@/utils";
import { DateRangePicker } from "./DateRangePicker";
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
import { SearchSelect } from "@/components/common/SearchSelect";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

interface PurchaseReceiptList {
  id: string;
  purchase_code: string;
}

interface CategoryList {
  id: string;
  code: string;
  name: string;
}

const API_URL = apiConfig.service_assets;

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const [filteredDate, setFilteredDate] = useState<DateRange | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);

  const [code, setCode] = useState<PurchaseReceiptList[]>([]);
  const [category, setCategory] = useState<CategoryList[]>([]);

  const [selectedCode, setSelectedCode] = useState<PurchaseReceiptList | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryList | null>(
    null
  );

  const [filter, setFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
    code?: string;
    type?: string;
    department?: string;
    category?: string;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
    code: "",
    type: "",
    department: "",
    category: "",
  });

  const handleFilterData = useCallback(() => {
    try {
      setIsLoading(true);
      setLoadingButton("filter");
      const filters = [];

      if (selectedCode) {
        filters.push({
          id: "AssetPurchase.code",
          value: selectedCode,
        });
      }

      table.setColumnFilters(filters);
    } catch (error) {
      toast.error("Error filtering data");
    } finally {
      setLoadingButton(null);
      setIsLoading(false);
    }
  }, [selectedCode, selectedType, selectedCategory, table]);

  const handleResetData = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 31);

    setFilter({
      from: oneMonthAgo,
      to: today,
      type: "",
    });

    setSelectedCode(null);
    table.setColumnFilters([]);
    reload();
  };

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await GetData(
          `${API_URL}/purchase/receipt-good/list`,
          {
            limit: 1000,
            page: 1,
            with_deleted: false,
            order_field: "created_at",
            order_direction: "ASC",
            filter: "{}",
          }
        );

        if (response && response.data) {
          setCode(response.data.list);
        }
      } catch (error) {
        toast.error("Error Fetching Data.Please Check Your Connection!");
      }
    };

    fetchCode();
  }, []);

  return (
    <div className="flex-wrap gap-2 px-5 border-b-0 card-header">
      <div className="flex flex-wrap w-full gap-2 lg:gap-5">
        <div className="flex items-center justify-between w-full">
          <div className="w-[80%] flex gap-3 items-center">
            <div className="w-1/3">
              <Select
                value={selectedCode?.purchase_code}
                onValueChange={(value: any) => {
                  setSelectedCode(value);
                }}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Kode..." />
                </SelectTrigger>
                <SearchSelect>
                  {code.map((cd) => (
                    <SelectItem key={cd.purchase_code} value={cd.purchase_code}>
                      {cd.purchase_code}
                    </SelectItem>
                  ))}
                </SearchSelect>
              </Select>
            </div>

            <DefaultTooltip title={"Filter"} placement={"top"}>
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                disabled={isLoading}
                onClick={handleFilterData}
              >
                {loadingButton === "filter" ? (
                  <ContentLoader />
                ) : (
                  <KeenIcon icon="filter" />
                )}
              </Button>
            </DefaultTooltip>
            <DefaultTooltip title={"Reset Filter"} placement={"top"}>
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                onClick={handleResetData}
                disabled={isLoading}
              >
                <KeenIcon icon="arrow-circle-left" />
              </Button>
            </DefaultTooltip>
          </div>
          <div className="flex gap-3">
            <DefaultTooltip title={"Refresh"} placement={"top"}>
              <Button
                variant={"outline"}
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
  );
};

export { ListToolBar };
