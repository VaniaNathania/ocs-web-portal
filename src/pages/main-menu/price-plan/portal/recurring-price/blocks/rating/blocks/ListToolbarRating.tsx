import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import useRecurrringRatingContext from "../hooks/useRecurringRatingContext";
import { useRecurringPriceContext } from "../../../hooks";

type ListToolBarProps = {
  ratePlanId: number;
  priceVersion: PriceDetail;
};

const ListToolbarRating = ({ ratePlanId, priceVersion }: ListToolBarProps) => {
  const { table, reload } = useDataGrid();
  const {
    fetchVersionsRatingForRatePlan,
    selectedMapping,
    setSelectedMapping,
  } = useRecurringPriceContext();
  const { handlePriceDialog, setSelectedPriceVersion, selectedPriceVersion } =
    useRecurrringRatingContext();

  const Reload = async () => {
    await fetchVersionsRatingForRatePlan(ratePlanId, selectedMapping);
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
                handlePriceDialog(true, "create", "price", priceVersion, null);
                setSelectedPriceVersion(priceVersion ?? null);
                setSelectedMapping(priceVersion.mappingId);
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

export default ListToolbarRating;
