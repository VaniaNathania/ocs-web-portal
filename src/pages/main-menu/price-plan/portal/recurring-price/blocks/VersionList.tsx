import { apiConfig } from "@/config/api.config";
import { useRecurringPriceContext } from "../hooks";
import useRecurrringRatingContext from "./rating/hooks/useRecurringRatingContext";
import { useAccumulationContext } from "../../subscription-price/blocks/accumulation/hooks/useAccumulationContext";
import { useState } from "react";
import { DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ListToolbarRating from "./rating/blocks/ListToolbarRating";
import { getColumns } from "./rating/hooks/Columns";
import { ColumnAccumulations } from "../../subscription-price/blocks/accumulation/hooks/Columns";
import { ColumnRecurringAcm } from "./accumulation/hooks/Columns";
import useRecurringAcmContext from "./accumulation/hooks/useRecurringAcmContext";
import ListToolBarAcm from "./accumulation/blocks/ListToolBarAcm";
import useRecurringBenefitContext from "./benefit/hooks/useRecurringBenefitContext";
import ListToolbarBenefit from "./benefit/blocks/ListToolbarBenefit";
import { ColumnsRecurringBenefit } from "./benefit/hooks/Columns";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

type GroupedVersion = {
  priceVerId: number;
  effDate: string;
  expDate: string | null;
  prices: any[];
};

const API_URL = apiConfig.service_price_plan;
export type PriorityUpdateType = "rating" | "benefit";

type VersionListProps = {
  ratingList: PriceDetail[];
  accumulationList: RecurringPriceAcmDetail[];
  benefitList: RecurringBenefitDetail[];
  ratePlanId: number;
  ratePlanType: string;
  // setDialogMode: React.Dispatch<React.SetStateAction<"version" | "price">>;
  // dialogMode: string;
};

const VersionList = ({
  ratingList,
  accumulationList,
  benefitList,
  ratePlanId,
  ratePlanType,
  // dialogMode,
  // setDialogMode,
}: VersionListProps) => {
  const isRating = ratePlanType === "1" || ratePlanType === "5";
  const isAccumulation = ratePlanType === "4";
  const isBenefit = ratePlanType === "3";

  const { PutData } = useCallApi();

  const {
    selectedRatePlan,
    selectedMapping,
    handleDeleteDialog,
    fetchVersionsRatingForRatePlan,
    fetchVersionsBenefitForRatePlan,
  } = useRecurringPriceContext();
  const {
    handlePriceDialog,
    handleEditDateDialog,
    showPriceDialog,
    setPriceVersionDate,
    setSelectedPriceVersion,
  } = useRecurrringRatingContext();
  const {
    handleEditDateDialog: handleAcmEditDateDialog,
    handlePriceDialog: handleAcmPriceDialog,
    setSelectedPriceVersion: setSelectedAcmPriceVersion,
    setPriceVersionDate: setAcmPriceVersionDate,
  } = useRecurringAcmContext();
  const {
    handleEditDateDialog: handleBenefitEditDateDialog,
    handlePriceDialog: handleBenefitPriceDialog,
    setSelectedPriceVersion: setSelectedBenefitPriceVersion,
    setPriceVersionDate: setBenefitPriceVersionDate,
  } = useRecurringBenefitContext();

  const [openVersionIds, setOpenVersionIds] = useState<number[]>([]);

  const toggleVersion = (priceVersion: PriceDetail) => {
    setOpenVersionIds((prev) =>
      prev.includes(priceVersion.priceVerId)
        ? prev.filter((x) => x !== priceVersion.priceVerId)
        : [...prev, priceVersion.priceVerId]
    );
    setSelectedPriceVersion(priceVersion);
    setPriceVersionDate(priceVersion);
  };

  const toggleAccumulation = (priceVersion: RecurringPriceAcmDetail) => {
    setOpenVersionIds((prev) =>
      prev.includes(priceVersion.priceVerId)
        ? prev.filter((x) => x !== priceVersion.priceVerId)
        : [...prev, priceVersion.priceVerId]
    );
    setSelectedAcmPriceVersion(priceVersion);
    setAcmPriceVersionDate(priceVersion);
  };

  const toggleBenefit = (priceVersion: RecurringBenefitDetail) => {
    setOpenVersionIds((prev) =>
      prev.includes(priceVersion.priceVerId)
        ? prev.filter((x) => x !== priceVersion.priceVerId)
        : [...prev, priceVersion.priceVerId]
    );
    setSelectedBenefitPriceVersion(priceVersion);
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
    const groupedVersions = groupVersionsByPriceVerId(ratingList, null) || [];
    console.info("ratingList", groupedVersions);
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
                {versionGroup.effDate} - {versionGroup.expDate}
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              <DefaultTooltip title={"Edit Date"} placement={"top"}>
                <Button
                  variant="ghost"
                  className="h-7.5 bg-gray-100 disabled:bg-gray-400 p-1"
                  onClick={() => {
                    handleEditDateDialog(true, versionGroup);
                    setSelectedPriceVersion(versionGroup.prices[0]);
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
                  handlePriceDialog,
                  handleDeleteDialog,
                  versionGroup.prices,
                  changePriority
                )}
                layout={{ card: true }}
                data={versionGroup.prices}
                toolbar={
                  <ListToolbarRating
                    ratePlanId={ratePlanId}
                    priceVersion={versionGroup.prices[0]}
                    // setDialogMode={setDialogMode}
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
                    handleAcmEditDateDialog(true, {
                      effDate: version.effDate,
                      expDate: version.expDate,
                    });
                    setSelectedAcmPriceVersion(version);
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
                columns={ColumnRecurringAcm(
                  handleAcmPriceDialog,
                  handleDeleteDialog
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

    return groupedVersions.map((benefit, idx) => {
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
                    setSelectedBenefitPriceVersion(benefit.prices[0]);
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
                columns={ColumnsRecurringBenefit(
                  handleBenefitPriceDialog,
                  handleDeleteDialog,
                  benefit.prices,
                  changePriority
                )}
                layout={{ card: true }}
                data={benefit.prices}
                toolbar={
                  <ListToolbarBenefit
                    idx={idx}
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
