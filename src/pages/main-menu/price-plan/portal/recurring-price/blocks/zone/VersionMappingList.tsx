import { useState } from "react";
import { useRecurringPriceContext } from "../../hooks";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import {
  FaArrowDown,
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { VersionList } from "../VersionList";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

type MappingListProps = {
  ratePlan: RatePlans;
  ratePlanId: number;
  ratePlanType: string;
  validateVersion: (ratePlan: RatePlans) => void;
};

const API_URL = apiConfig.service_price_plan;

const VersionMappingList = ({
  ratePlan: plan,
  ratePlanId,
  ratePlanType,
  validateVersion,
}: MappingListProps) => {
  const {
    mappingLists,
    ratingLists,
    accumulationLists,
    benefitLists,
    loadingRating,
    loadingAccumulation,
    loadingBenefit,
    loadingMappingLists,
    selectedMapping,
    fetchVersionsRatingForRatePlan,
    fetchVersionsAccumulationForRatePlan,
    fetchVersionsBenefitForRatePlan,
    fetchMapping,
    handleMappingDialog,
    handleDeleteDialog,
    setSelectedMapping,
  } = useRecurringPriceContext();
  const { PutData } = useCallApi();

  const [openVersionIds, setOpenVersionIds] = useState<number[]>([]);

  const toggleVersion = async (
    mappingId: number,
    ratePlanId: number,
    ratePlanType: string,
    ratePlanMapping: string
  ) => {
    setSelectedMapping(mappingId);
    setOpenVersionIds((prev) =>
      prev.includes(mappingId)
        ? prev.filter((x) => x !== mappingId)
        : [...prev, mappingId]
    );

    if (ratePlanMapping === "2") {
      if (
        (ratePlanType === "1" &&
          (!ratingLists[mappingId] || ratingLists[mappingId].length === 0)) ||
        ratePlanType === "5"
      ) {
        await fetchVersionsRatingForRatePlan(ratePlanId, mappingId);
      } else if (
        ratePlanType === "4" &&
        (!accumulationLists[mappingId] ||
          accumulationLists[mappingId].length === 0)
      ) {
        await fetchVersionsAccumulationForRatePlan(ratePlanId, mappingId);
      } else if (
        ratePlanType === "3" &&
        (!benefitLists[mappingId] || benefitLists[mappingId].length === 0)
      ) {
        await fetchVersionsBenefitForRatePlan(ratePlanId, mappingId);
      }
      // setSelectedMapping(mapping.mappingId);
    }
  };

  const changeMappingPriority = async (
    mappingId: number,
    newPriority: number,
    ratePlanId: number
  ) => {
    try {
      // const url = `${API_URL}/mapping/update/priority?mappingId=${mappingId}&newPriority=${newPriority}`;
      const response = await PutData(
        `${API_URL}/mapping/update/priority?mappingId=${mappingId}&newPriority=${newPriority}`,
        {}
      );

      if (response?.status) {
        toast.success("Mapping priority updated successfully");
        await fetchMapping(ratePlanId);
      } else {
        toast.error(response?.message || "Failed to update mapping priority");
      }
    } catch (err) {
      toast.error("Error while updating mapping priority");
    }
  };

  const sortedMappings = [...(mappingLists[plan.ratePlanId] || [])].sort(
    (a, b) => a.priority - b.priority
  );

  const renderMapping = () =>
    sortedMappings.map((mapping, idx) => {
      const isOpen = openVersionIds.includes(mapping.mappingId);

      const ratings = ratingLists[mapping.mappingId] || [];
      const isLoadingRating = loadingRating[mapping.mappingId] || false;

      const accumulations = accumulationLists[mapping.mappingId] || [];
      const isLoadingAccumulation =
        loadingAccumulation[mapping.mappingId] || false;

      const benefits = benefitLists[mapping.mappingId] || [];
      const isLoadingBenefit = loadingBenefit[mapping.mappingId] || false;

      const mappingRating = mappingLists[mapping.mappingId] || [];
      const isLoadingMappingRating =
        loadingMappingLists[mapping.mappingId] || false;

      // console.log(rating);
      return (
        <div
          key={mapping.mappingId}
          className="p-3 bg-gray-100 rounded text-sm text-gray-800"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <h1 className="font-semibold">{mapping.mappingName}</h1>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                Priority: {mapping.priority}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={idx === 0}
                onClick={() =>
                  changeMappingPriority(
                    mapping.mappingId,
                    sortedMappings[idx - 1].priority,
                    plan.ratePlanId
                  )
                }
                className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
              >
                {/* <KeenIcon icon="arrow-up" className="w-4 h-4" /> */}
                <FaArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={idx === sortedMappings.length - 1}
                onClick={() =>
                  changeMappingPriority(
                    mapping.mappingId,
                    sortedMappings[idx + 1].priority,
                    plan.ratePlanId
                  )
                }
                className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
              >
                {/* <KeenIcon icon="arrow-down" className="w-4 h-4" /> */}
                <FaArrowDown />
              </Button>
              <Button
                variant="ghost"
                className="h-7.5 disabled:bg-gray-400 p-1"
                onClick={() => {
                  setSelectedMapping(mapping.mappingId);
                  handleMappingDialog(true, "update");
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
              <Button
                variant="ghost"
                className="h-7.5 disabled:bg-gray-400 p-1 text-red-500 hover:text-red-700"
                onClick={() => {
                  handleDeleteDialog(true, mapping.mappingId, "mapping");
                }}
              >
                <KeenIcon icon="trash" />
              </Button>
              <button
                onClick={() => {
                  toggleVersion(
                    mapping.mappingId,
                    plan.ratePlanId,
                    ratePlanType,
                    plan.ratePlanMapping
                  );
                }}
                className="text-blue-500 text-xs hover:underline"
              >
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="mt-2 pl-7">
              <button
                className="py-2 px-3 bg-blue-500 text-white mt-2 text-sm rounded"
                onClick={() => {
                  setSelectedMapping(mapping.mappingId);
                  validateVersion(plan);
                  // console.log(mapping.mappingId);
                  // setDialogMode("version");
                }}
              >
                New Version
              </button>

              {/* {showPriceVersionDialog && dialogMode === "version" ? (
                <AddPriceVersionDialog mode="version" />
              ) : (
                <AddPriceVersionDialog mode="price" />
              )} */}

              <div className="mt-3 space-y-1">
                {isLoadingRating ||
                isLoadingAccumulation ||
                isLoadingBenefit ? (
                  <p className="text-center font-medium mt-5 text-gray-500 italic">
                    Loading...
                  </p>
                ) : ratings.length > 0 ||
                  accumulations.length > 0 ||
                  benefits.length > 0 ? (
                  <VersionList
                    ratingList={ratings}
                    accumulationList={accumulations}
                    benefitList={benefits}
                    ratePlanId={plan.ratePlanId}
                    ratePlanType={plan.ratePlanType}
                  />
                ) : (
                  <p className="text-center font-medium mt-5 text-gray-500 italic">
                    No price versions found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    });

  return <>{renderMapping()}</>;
};

export default VersionMappingList;
