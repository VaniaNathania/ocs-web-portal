import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { toAbsoluteUrl } from "@/utils";
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
import useBenefitContext from "../hooks/useBenefitContext";
import { useSubscriptionPriceCreateContext } from "../../../hooks";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

type ListToolBarProps = {
  ratePlanId: number;
  priceVersion: SubscriptionBenefitDetail;
};

const API_URL = apiConfig.service_assets;

const ListToolbarBenefit = ({ ratePlanId, priceVersion }: ListToolBarProps) => {
  const { handlePriceDialog, setSelectedPriceVer, selectedPriceVer } =
    useBenefitContext();
  const { fetchVersionsBenefitForRatePlan, selectedMapping } =
    useSubscriptionPriceCreateContext();
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const [filteredDate, setFilteredDate] = useState<DateRange | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
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

  const Reload = async () => {
    await fetchVersionsBenefitForRatePlan(ratePlanId, selectedMapping);
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="w-[80%] flex gap-3 items-center">
            {/* <div className="w-1/3">
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
            </div> */}

            <Button
              variant="outline"
              className="h-7.5 text-[0.8rem]"
              onClick={() => {
                handlePriceDialog(true, "create", "price", null);
                setSelectedPriceVer(priceVersion);
              }}
            >
              Add Data
            </Button>

            {/* <DefaultTooltip title={"Filter"} placement={"top"}>
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
            </DefaultTooltip> */}
          </div>
          <div className="flex gap-3">
            <DefaultTooltip title={"Refresh"} placement={"top"}>
              <Button
                variant={"outline"}
                className="h-7.5"
                onClick={() => Reload()}
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

export default ListToolbarBenefit;
