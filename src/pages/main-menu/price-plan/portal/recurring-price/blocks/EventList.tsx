import { useEffect, useState } from "react";
// import { UsagePriceCreateContext, useUsagePriceCreateContext } from "../hooks";
import {
  FaArrowDown,
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
  FaFile,
  FaPlus,
} from "react-icons/fa";
import { DeleteRecurringTypeKey, useRecurringPriceContext } from "../hooks";
import { KeenIcon } from "@/components";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import DeleteDialog from "./DeleteDialog";
import RatePlanDialog from "./RatePlanDialog";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import useRecurrringRatingContext from "./rating/hooks/useRecurringRatingContext";
import PriceDialog from "./rating/blocks/PriceDialog";
import { VersionList } from "./VersionList";
import useRecurringAcmContext from "./accumulation/hooks/useRecurringAcmContext";
import PriceAcmDialog from "./accumulation/blocks/PriceAcmDialog";
import PriceBenefitDialog from "./benefit/blocks/PriceBenefitDialog";
import useRecurringBenefitContext from "./benefit/hooks/useRecurringBenefitContext";
import VersionMappingList from "./zone/VersionMappingList";
import MappingDialog from "./zone/MappingDialog";

const API_URL = apiConfig.service_price_plan;

const EventList = () => {
  const {
    events,
    ratePlans,
    doGetListRatePlan,
    loadingRating,
    ratingLists,
    loadingAccumulation,
    accumulationLists,
    benefitLists,
    loadingBenefit,
    mappingLists,
    loadingMappingLists,
    selectedEvent,
    setSelectedEvent,
    selectedRatePlan,
    selectedMapping,
    setSelectedMapping,
    setSelectedRatePlan,
    setSelectedDelete,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteDialog,
    onConfirmDelete,
    showCreateEventDialog,
    handleCreateEventDialog,
    handleRatePlanDialog,
    handleMappingDialog,
    fetchVersionsAccumulationForRatePlan,
    fetchVersionsRatingForRatePlan,
    fetchVersionsBenefitForRatePlan,
    fetchMapping,
  } = useRecurringPriceContext();
  const {
    showPriceDialog,
    handlePriceDialog,
    selectedPriceVersion: selectedRatingPriceVersion,
    setSelectedPriceVersion: setSelectedRatingPriceVersion,
  } = useRecurrringRatingContext();
  const {
    showPriceDialog: showPriceAcmDialog,
    handlePriceDialog: handlePriceAcmDialog,
    selectedPriceVersion: selectedAcmPriceVersion,
    setSelectedPriceVersion: setSelectedAcmPriceVersion,
  } = useRecurringAcmContext();
  const {
    showPriceDialog: showPriceBenefitDialog,
    handlePriceDialog: handlePriceBenefitDialog,
    selectedPriceVersion: selectedBenefitPriceVersion,
    setSelectedPriceVersion: setSelectedBenefitPriceVersion,
    selectedPrice: selectedBenefitPrice,
  } = useRecurringBenefitContext();
  const { GetData, PutData } = useCallApi();
  const {  selectedOfferVerId  } = usePortalData();

  const sortedRatePlans = [...ratePlans].sort(
    (a, b) => a.priority - b.priority
  );

  const changePriority = async (
    movingRatePlanId: number,
    targetPriority: number
  ) => {
    try {
      const response = await PutData(
        `${API_URL}/rate-plan/priority?ratePlanId=${movingRatePlanId}&priority=${targetPriority}`,
        {}
      );

      if (response?.status) {
        toast.success("Priority updated successfully");
        if (selectedEvent) {
          await doGetListRatePlan(selectedEvent);
        }
      } else {
        toast.error(response?.message || "Failed to update priority");
      }
    } catch (error) {
      toast.error("Error while updating priority");
    }
  };

  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleCollapse = async (
    idx: number,
    ratePlanId: number,
    ratePlanType: string,
    ratePlanMapping: string
  ) => {
    const isCurrentlyOpen = openIndexes.includes(idx);

    if (isCurrentlyOpen) {
      setOpenIndexes((prev) => prev.filter((i) => i !== idx));
    } else {
      setSelectedRatePlan(ratePlanId);
      setOpenIndexes((prev) => [...prev, idx]);

      if (ratePlanMapping === "1") {
        if (
          (ratePlanType === "1" &&
            (!ratingLists[ratePlanId] ||
              ratingLists[ratePlanId].length === 0)) ||
          ratePlanType === "5"
        ) {
          await fetchVersionsRatingForRatePlan(ratePlanId, selectedMapping);
        } else if (
          ratePlanType === "4" &&
          (!accumulationLists[ratePlanId] ||
            accumulationLists[ratePlanId].length === 0)
        ) {
          await fetchVersionsAccumulationForRatePlan(
            ratePlanId,
            selectedMapping
          );
        } else if (
          ratePlanType === "3" &&
          (!benefitLists[ratePlanId] || benefitLists[ratePlanId].length === 0)
        ) {
          await fetchVersionsBenefitForRatePlan(ratePlanId, selectedMapping);
        }
      } else if (ratePlanMapping === "2") {
        await fetchMapping(ratePlanId);
      }
    }
  };

  const handleSelectEvent = (event: RecurringEvents) => {
    setSelectedEvent(event.reId);
    doGetListRatePlan(event.reId);
    setOpenIndexes([]);
  };

  const handleDeleteEvent = (offerVerId: number, eventId: number) => {
    setSelectedDelete(eventId);
    handleDeleteDialog(true, eventId, "event");
  };

  const handleDeleteRatePlan = (ratePlanId: number) => {
    setSelectedDelete(ratePlanId);
    handleDeleteDialog(true, ratePlanId, "ratePlan");
  };

  const confirmDelete = (deleteType: DeleteRecurringTypeKey) => {
    if (deleteType === "event") {
      const offerVerId = selectedOfferVerId || 0;
      const eventId = selectedEvent;
      onConfirmDelete(deleteType, offerVerId, eventId || 0);
    } else if (deleteType === "priceRating") {
      const offerVerId = selectedOfferVerId || 0;
      const priceVerId = selectedRatingPriceVersion?.priceVerId;
      const eventId = selectedEvent;
      onConfirmDelete(deleteType, offerVerId, eventId || 0, priceVerId || 0);
    } else if (deleteType === "priceAccumulation") {
      const offerVerId = selectedOfferVerId || 0;
      const eventId = selectedEvent;
      const priceVerId = selectedAcmPriceVersion?.priceVerId;
      onConfirmDelete(deleteType, offerVerId, eventId || 0, priceVerId || 0);
    } else if (deleteType === "priceBenefit") {
      const offerVerId = selectedOfferVerId || 0;
      const eventId = selectedEvent;
      const priceVerId = selectedBenefitPriceVersion?.priceVerId;
      const subBalTypeId = selectedBenefitPrice?.subBalTypeId;
      onConfirmDelete(
        deleteType,
        offerVerId,
        eventId || 0,
        priceVerId || 0,
        subBalTypeId || 0
      );
    } else {
      onConfirmDelete(deleteType);
    }
  };

  const validateVersion = async (ratePlan: RatePlans) => {
    // setSelectedMapping(null);
    try {
      const response = await GetData(
        `${API_URL}/validator/price-version/${ratePlan.ratePlanId}`,
        {}
      );

      if (response?.status) {
        if (ratePlan.ratePlanType === "1" || ratePlan.ratePlanType === "5") {
          handlePriceDialog(true, "create", "version", response.data, null);
          // setSelectedRatingPriceVersion(response.data);
        } else if (ratePlan.ratePlanType === "4") {
          handlePriceAcmDialog(true, "create", null, null);
          setSelectedAcmPriceVersion(response.data);
        } else if (ratePlan.ratePlanType === "3") {
          handlePriceBenefitDialog(true, "create", "version", response.data);
          // setSelectedBenefitPriceVersion(response.data);
        }
      } else {
        toast.warning(response?.message);
      }
    } catch (error) {
      console.error("Error validating version:", error);
      toast.error("Failed to validate version");
    }
  };

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      handleSelectEvent(events[0]);
    }
  }, [events]);

  return (
    <>
      <RatePlanDialog />
      <MappingDialog />
      <DeleteDialog
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onConfirmDelete={confirmDelete}
      />
      {showPriceDialog && <PriceDialog />}
      {showPriceAcmDialog && <PriceAcmDialog />}
      {showPriceBenefitDialog && <PriceBenefitDialog />}
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex border border-gray-200 rounded shadow-sm min-h-screen">
          {/* Left Sidebar */}
          <div className="w-1/4 border-r border-gray-200 p-3 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold mb-3">Recurring Event</h2>
              <button
                className="text-blue-500 font-bold text-lg hover:text-blue-700 transition-colors"
                onClick={() => handleCreateEventDialog(true)}
                title="Add New Event"
              >
                +
              </button>
            </div>
            <ul>
              {events && events.length > 0 ? (
                events.map((event: any, idx: any) => {
                  const isActive = selectedEvent === event.reId;

                  return (
                    <li
                      key={event.reId}
                      onClick={() => handleSelectEvent(event)}
                      className={`py-2 px-3 mb-1 rounded cursor-pointer transition group relative overflow-hidden ${
                        isActive
                          ? "bg-blue-100 text-blue-600 font-semibold"
                          : "hover:bg-gray-100"
                      } flex justify-between items-center`}
                    >
                      <span className="flex-1 pr-2">{event.reName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(selectedOfferVerId || 0, event.reId);
                        }}
                        className="text-red-500 hover:text-red-700 transform translate-x-full group-hover:translate-x-0 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="py-2 px-3 mb-1 text-gray-500">
                  No events available
                </li>
              )}
            </ul>
          </div>

          {/* Right Content - Rate Plans */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl font-semibold text-slate-800">
                  Rate Plans
                </h1>
                <button
                  aria-label="Create new rate plan"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm"
                  onClick={() => handleRatePlanDialog(true, "create")}
                >
                  <FaPlus className="w-4 h-4" />
                  <span>New Rate Plan</span>
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap mt-2">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="font-medium text-sm text-slate-500">
                    Basic Rate Plan
                  </h3>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <h3 className="font-medium text-sm text-slate-500">
                    Rate Plan Zone
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {ratePlans && ratePlans.length > 0 ? (
                sortedRatePlans.map((plan, idx) => {
                  const isOpen = openIndexes.includes(idx);
                  const versions = ratingLists[plan.ratePlanId] || [];
                  const isLoadingThisPlan =
                    loadingRating[plan.ratePlanId] || false;

                  const accumulations =
                    accumulationLists[plan.ratePlanId] || [];
                  const isLoadingAccumulation =
                    loadingAccumulation[plan.ratePlanId] || false;

                  const benefits = benefitLists[plan.ratePlanId] || [];
                  const isLoadingBenefit =
                    loadingBenefit[plan.ratePlanId] || false;

                  const mappings = mappingLists[plan.ratePlanId] || [];
                  const isLoadingMappings =
                    loadingMappingLists[plan.ratePlanId] || false;

                  return (
                    <div
                      key={plan.ratePlanId}
                      className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                plan.ratePlanMapping === "1"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <h3 className="font-medium text-slate-800">
                              {plan.ratePlanName}
                            </h3>
                          </div>

                          <div className="flex items-center">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md mr-2">
                              ID: {plan.ratePlanId}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={idx === 0}
                              onClick={() =>
                                changePriority(
                                  plan.ratePlanId,
                                  ratePlans[idx - 1].priority
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                              title="Move Up"
                            >
                              <FaArrowUp />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={idx === ratePlans.length - 1}
                              onClick={() =>
                                changePriority(
                                  plan.ratePlanId,
                                  ratePlans[idx + 1].priority
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                              title="Move Down"
                            >
                              <FaArrowDown />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleRatePlanDialog(true, "update");
                                setSelectedRatePlan(plan.ratePlanId);
                              }}
                              className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-600"
                            >
                              <KeenIcon
                                icon="notepad-edit"
                                className="w-4 h-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleDeleteRatePlan(plan.ratePlanId);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-500"
                            >
                              <KeenIcon icon="trash" className="w-4 h-4" />
                            </Button>
                            <button
                              onClick={() =>
                                toggleCollapse(
                                  idx,
                                  plan.ratePlanId,
                                  plan.ratePlanType,
                                  plan.ratePlanMapping
                                )
                              }
                              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-all duration-200"
                              title={isOpen ? "Collapse" : "Expand"}
                              tabIndex={0}
                              role="button"
                            >
                              {isOpen ? (
                                <FaChevronUp className="w-4 h-4" />
                              ) : (
                                <FaChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            {plan.ratePlanMapping === "1" ? (
                              <>
                                <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                  onClick={() => {
                                    validateVersion(plan);
                                  }}
                                >
                                  New Version
                                </button>

                                <div className="mt-4">
                                  {isLoadingThisPlan ||
                                  isLoadingAccumulation ||
                                  isLoadingBenefit ? (
                                    <div className="flex items-center justify-center py-8">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                      <span className="ml-3 text-slate-600">
                                        Loading...
                                      </span>
                                    </div>
                                  ) : versions.length > 0 ||
                                    accumulations.length > 0 ||
                                    benefits.length > 0 ? (
                                    <VersionList
                                      ratingList={versions}
                                      accumulationList={accumulations}
                                      benefitList={benefits}
                                      ratePlanId={plan.ratePlanId}
                                      ratePlanType={plan.ratePlanType}
                                    />
                                  ) : (
                                    <div className="text-center py-8 text-slate-500">
                                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <KeenIcon
                                          icon="file-empty"
                                          className="w-6 h-6 text-slate-400"
                                        />
                                      </div>
                                      <p>No price versions found</p>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : plan.ratePlanMapping === "2" ? (
                              <>
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                  onClick={() => {
                                    handleMappingDialog(true, "create");
                                    setSelectedRatePlan(plan.ratePlanId);
                                  }}
                                >
                                  New Mapping
                                </button>

                                <div className="mt-4">
                                  {isLoadingMappings ? (
                                    <div className="flex items-center justify-center py-8">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                      <span className="ml-3 text-slate-600">
                                        Loading...
                                      </span>
                                    </div>
                                  ) : mappings.length > 0 ? (
                                    <VersionMappingList
                                      ratePlan={plan}
                                      ratePlanId={plan.ratePlanId}
                                      ratePlanType={plan.ratePlanType}
                                      validateVersion={validateVersion}
                                    />
                                  ) : (
                                    <div className="text-center py-8 text-slate-500">
                                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <KeenIcon
                                          icon="file-empty"
                                          className="w-6 h-6 text-slate-400"
                                        />
                                      </div>
                                      <p>No mapping found</p>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                                <KeenIcon
                                  icon="warning"
                                  className="w-6 h-6 mx-auto mb-2"
                                />
                                <p>Unknown mapping type</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFile className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No rate plans available
                  </h3>
                  <p className="text-sm">
                    Create your first rate plan to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventList;
