import { apiConfig } from "@/config/api.config";
import useRecurringAcmContext from "../hooks/useRecurringAcmContext";
import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRecurringPriceContext } from "../../../hooks";

type ListToolBarProps = {
  ratePlanId: number;
  priceAccumulation: RecurringPriceAcmDetail;
};

const API_URL = apiConfig.service_assets;

const ListToolBarAcm = ({
  ratePlanId,
  priceAccumulation,
}: ListToolBarProps) => {
  const { selectedMapping, fetchVersionsAccumulationForRatePlan } =
    useRecurringPriceContext();
  const {
    setSelectedPriceVersion,
    selectedPriceVersion,
    handlePriceDialog,
    showPriceDialog,
  } = useRecurringAcmContext();
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();

  const Reload = async () => {
    await fetchVersionsAccumulationForRatePlan(ratePlanId, selectedMapping);
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

            {/* <Button
              variant="outline"
              className="h-7.5 text-[0.8rem]"
              onClick={() => {
                handlePriceDialog(
                  true,
                  "create",
                  priceAccumulation!,
                  priceAccumulation.priceId
                );
                setSelectedPriceVersion(priceAccumulation ?? null);
              }}
            >
              Add Data
            </Button> */}

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

export default ListToolBarAcm;
