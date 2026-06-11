import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import useRecurringBenefitContext from "../hooks/useRecurringBenefitContext";
import { Button } from "@/components/ui/button";
import { useRecurringPriceContext } from "../../../hooks";

type ListToolBarProps = {
  idx: number;
  ratePlanId: number;
  priceVersion: RecurringBenefitDetail;
};

const ListToolbarBenefit = ({
  idx,
  ratePlanId,
  priceVersion,
}: ListToolBarProps) => {
  const { table, reload } = useDataGrid();
  const {
    fetchVersionsBenefitForRatePlan,
    selectedMapping,
    setSelectedRatePlan,
  } = useRecurringPriceContext();
  const { handlePriceDialog, setSelectedPriceVersion, selectedPriceVersion } =
    useRecurringBenefitContext();

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
                handlePriceDialog(true, "create", "price", priceVersion);
                setSelectedRatePlan(ratePlanId);
                // setSelectedPriceVersion(priceVersion ?? null);
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
