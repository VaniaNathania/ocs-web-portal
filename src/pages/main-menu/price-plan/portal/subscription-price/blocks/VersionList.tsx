import { DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getColumns } from "../hooks/Columns";
import { ListToolBar } from "./ListToolBar";
import { Button } from "@/components/ui/button";
import { useSubscriptionPriceCreateContext } from "../hooks";
import AddPriceVersionDialog from "./rating/blocks/AddPriceVersionDialog";
import { ColumnAccumulations } from "./accumulation/hooks/Columns";
import { useAccumulationContext } from "./accumulation/hooks/useAccumulationContext";
import ListToolBarAcm from "./accumulation/blocks/ListToolBar";
import useBenefitContext from "./benefit/hooks/useBenefitContext";
import ListToolbarBenefit from "./benefit/blocks/ListToolbarBenefit";
import { ColumnsSubscriptionBenefit } from "./benefit/hooks/Columns";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;
export type PriorityUpdateType = "rating" | "benefit";

type VersionListProps = {
  versionList: PriceDetail[];
  accumulationList: AccumulationVersion[];
  benefitList: SubscriptionBenefitDetail[];
  ratePlanId: number;
  ratePlanType: string;
  // setDialogMode: (mode: string) => void;
};

type GroupedVersion = {
  priceVerId: number;
  effDate: string;
  expDate: string | null;
  prices: any[];
};

const VersionList = ({
  versionList,
  accumulationList,
  benefitList,
  ratePlanId,
  ratePlanType,
}: VersionListProps) => {
  const isRating = ratePlanType === "1" || ratePlanType === "5";
  const isAccumulation = ratePlanType === "4";
  const isBenefit = ratePlanType === "3";

  const { PostData, PutData } = useCallApi();

  const {
    handleEditPriceDialog,
    handleEditDateDialog,
    handleDeleteDialog,
    showPriceVersionDialog,
    setPriceVersionDate,
    setSelectedPriceVer,
    fetchVersionsRatingForRatePlan,
    fetchVersionsBenefitForRatePlan,
    selectedRatePlan,
    selectedMapping,
  } = useSubscriptionPriceCreateContext();
  const {
    handleEditDateDialog: handleAccumulationEditDateDialog,
    handlePriceDialog: handleAccumulationPriceDialog,
    setSelectedPriceVer: setSelectedAccumulationPriceVer,
    setPriceVersionDate: setAccumulationPriceVersionDate,
    handleDeleteDialog: handleAccumulationDeleteDialog,
  } = useAccumulationContext();
  const {
    handleEditDateDialog: handleBenefitEditDateDialog,
    handlePriceDialog: handleBenefitPriceDialog,
    setSelectedPriceVer: setSelectedBenefitPriceVer,
    setPriceVersionDate: setBenefitPriceVersionDate,
    handleDeleteDialog: handleBenefitDeleteDialog,
  } = useBenefitContext();
  const [openVersionIds, setOpenVersionIds] = useState<number[]>([]);

  const toggleVersion = (priceVersion: PriceDetail) => {
    // console.log(priceVersion);
    setOpenVersionIds((prev) =>
      prev.includes(priceVersion.priceVerId)
        ? prev.filter((x) => x !== priceVersion.priceVerId)
        : [...prev, priceVersion.priceVerId]
    );
    setSelectedPriceVer(priceVersion);
    setPriceVersionDate(priceVersion);
  };

  const toggleAccumulation = (priceVersion: AccumulationVersion) => {
    setOpenVersionIds((prev) =>
      prev.includes(priceVersion.priceVerId)
        ? prev.filter((x) => x !== priceVersion.priceVerId)
        : [...prev, priceVersion.priceVerId]
    );
    setSelectedAccumulationPriceVer(priceVersion);
    setAccumulationPriceVersionDate(priceVersion);
  };

  const toggleBenefit = (priceVersion: SubscriptionBenefitDetail) => {
    setOpenVersionIds((prev) =>
      prev.includes(priceVersion.priceVerId)
        ? prev.filter((x) => x !== priceVersion.priceVerId)
        : [...prev, priceVersion.priceVerId]
    );
    setSelectedBenefitPriceVer(priceVersion);
    setBenefitPriceVersionDate(priceVersion);
  };

  const groupVersionsByPriceVerId = (
    versionList: PriceDetail[] | null,
    benefitList: SubscriptionBenefitDetail[] | null
  ) => {
    if (versionList) {
      const grouped = versionList.reduce<Record<number, GroupedVersion>>(
        (acc, item) => {
          const { priceVerId } = item;

          if (!acc[priceVerId]) {
            acc[priceVerId] = {
              priceVerId,
              effDate: item.effDate,
              expDate: item.expDate,
              prices: [],
            };
          }

          acc[priceVerId].prices.push(item);
          return acc;
        },
        {}
      );

      // Sort each group’s prices by priority
      Object.values(grouped).forEach((group) => {
        group.prices.sort((a, b) => a.priority - b.priority);
      });

      return Object.values(grouped);
    } else if (benefitList) {
      const grouped = benefitList.reduce<Record<number, GroupedVersion>>(
        (acc, item) => {
          const { priceVerId } = item;

          if (!acc[priceVerId]) {
            acc[priceVerId] = {
              priceVerId,
              effDate: item.effectiveDate,
              expDate: item.expiryDate,
              prices: [],
            };
          }

          acc[priceVerId].prices.push(item);
          return acc;
        },
        {}
      );

      // Sort each group’s prices by priority
      Object.values(grouped).forEach((group) => {
        group.prices.sort((a, b) => a.priority - b.priority);
      });

      return Object.values(grouped);
    }
  };

  const changePriority = async (
    type: PriorityUpdateType,
    payload: {
      priceId: number;
      newPriority: number;
      oldPriority: number;
      priceVerId: number;
    }
  ) => {
    try {
      const endpoint =
        type === "rating"
          ? `${API_URL}/price/priority/update`
          : `${API_URL}/price/benefit/priority/update`;

      const response = await PutData(endpoint, payload);

      if (response?.status) {
        toast.success(
          `${type[0].toUpperCase() + type.slice(1)} priority updated successfully`
        );
        await fetchVersionsRatingForRatePlan(
          selectedRatePlan!,
          selectedMapping
        );
      } else {
        toast.error(response?.message || `Failed to update ${type} priority`);
      }
    } catch (error) {
      toast.error(`Something went wrong while updating ${type} priority`);
    } finally {
      await fetchVersionsRatingForRatePlan(selectedRatePlan!, selectedMapping);
      await fetchVersionsBenefitForRatePlan(selectedRatePlan!, selectedMapping);
    }
  };

  const renderRating = () => {
    const groupedVersions = groupVersionsByPriceVerId(versionList, null) || [];
    const sortedPrice = Object.values(versionList)
      .flat()
      .sort((a, b) => a.priority - b.priority);

    return groupedVersions.map((versionGroup, index) => {
      const isOpen = openVersionIds.includes(versionGroup.priceVerId);

      return (
        <div
          key={versionGroup.priceVerId}
          className="p-3 bg-gray-100 rounded text-sm text-gray-800 mb-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <h1 className="font-semibold">
                {versionGroup.effDate} - {versionGroup.expDate ?? ""}
              </h1>
            </div>

            <div className="flex gap-3 items-center">
              <DefaultTooltip title="Edit Date" placement="top">
                <Button
                  variant="ghost"
                  className="h-7.5 bg-gray-100 disabled:bg-gray-400 p-1"
                  onClick={() => {
                    handleEditDateDialog(true, versionGroup.prices[0]);
                    setSelectedPriceVer(versionGroup.prices[0]);
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </Button>
              </DefaultTooltip>

              <button
                onClick={() => toggleVersion(versionGroup.prices[0])}
                className="text-blue-500 text-xs hover:underline"
              >
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="mt-2 space-y-2">
              <DataGridProvider
                columns={getColumns(
                  handleEditPriceDialog,
                  handleDeleteDialog,
                  versionGroup.prices,
                  changePriority
                )}
                layout={{ card: true }}
                data={versionGroup.prices}
                toolbar={
                  <ListToolBar
                    ratePlanId={ratePlanId}
                    priceRating={versionGroup.prices[0]}
                  />
                }
              />
            </div>
          )}
        </div>
      );
    });
  };

  const renderAccumulation = () =>
    accumulationList.map((version) => {
      const isOpen = openVersionIds.includes(version.priceVerId);
      return (
        <div
          key={version.priceVerId}
          className="p-3 bg-gray-100 rounded text-sm text-gray-800 mb-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <h1 className="font-semibold">
                {version.effDate} - {version.expDate}
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              <DefaultTooltip title={"Edit Date"} placement={"top"}>
                <Button
                  variant="ghost"
                  className="h-7.5 bg-gray-100 disabled:bg-gray-400 p-1"
                  onClick={() => {
                    handleAccumulationEditDateDialog(true, {
                      effDate: version.effDate,
                      expDate: version.expDate,
                    });
                    setSelectedAccumulationPriceVer(version);
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </Button>
              </DefaultTooltip>
              <button
                onClick={() => toggleAccumulation(version)}
                className="text-blue-500 text-xs hover:underline"
              >
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>
          {isOpen && (
            <div className="mt-2 space-y-2">
              <DataGridProvider
                columns={ColumnAccumulations(
                  handleAccumulationPriceDialog,
                  handleAccumulationDeleteDialog
                )}
                layout={{ card: true }}
                data={[version]}
                toolbar={
                  <ListToolBarAcm
                    ratePlanId={ratePlanId}
                    priceAccumulation={version}
                  />
                }
              />
            </div>
          )}
        </div>
      );
    });

  const renderBenefit = () => {
    const groupedVersions = groupVersionsByPriceVerId(null, benefitList) || [];

    return groupedVersions.map((benefit, index) => {
      const isOpen = openVersionIds.includes(benefit.priceVerId);

      return (
        <div
          key={benefit.priceVerId}
          className="p-3 bg-gray-100 rounded text-sm text-gray-800 mb-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <h1 className="font-semibold">
                {benefit.effDate} - {benefit.expDate}
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              <DefaultTooltip title={"Edit Date"} placement={"top"}>
                <Button
                  variant="ghost"
                  className="h-7.5 bg-gray-100 disabled:bg-gray-400 p-1"
                  onClick={() => {
                    handleBenefitEditDateDialog(true, {
                      effectiveDate: benefit.effDate,
                      expiryDate: benefit.expDate,
                    });
                    setSelectedBenefitPriceVer(benefit.prices[0]);
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </Button>
              </DefaultTooltip>
              <button
                onClick={() => toggleBenefit(benefit.prices[0])}
                className="text-blue-500 text-xs hover:underline"
              >
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>
          {isOpen && (
            <div className="mt-2 space-y-2">
              <DataGridProvider
                columns={ColumnsSubscriptionBenefit(
                  handleBenefitPriceDialog,
                  handleBenefitDeleteDialog,
                  benefit.prices,
                  changePriority
                )}
                layout={{ card: true }}
                data={benefit.prices}
                toolbar={
                  <ListToolbarBenefit
                    ratePlanId={ratePlanId}
                    priceVersion={benefit.prices[0]}
                  />
                }
              />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {isRating && renderRating()}
      {isAccumulation && renderAccumulation()}
      {isBenefit && renderBenefit()}
    </>
  );
};

export { VersionList };
