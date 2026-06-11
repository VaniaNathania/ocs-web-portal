import { useEffect, useRef, useState } from "react";
import {
  DeleteSubscriptionTypeKey,
  useSubscriptionPriceCreateContext,
} from "../hooks";
import {
  FaArrowDown,
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
  FaFile,
  FaPlus,
} from "react-icons/fa";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { VersionList } from "./VersionList";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { Button } from "@/components/ui/button";
import RatePlanDialog from "./RatePlanDialog";
import DeleteDialog from "./DeleteDialog";
import AddPriceDialog from "./accumulation/blocks/AddPriceDialog";
import AddPriceVersionDialog from "./rating/blocks/AddPriceVersionDialog";
import { useAccumulationContext } from "./accumulation/hooks/useAccumulationContext";
import PriceAcmDialog from "./accumulation/blocks/PriceAcmDialog";
import PriceBenefitDialog from "./benefit/blocks/PriceBenefitDialog";
import useBenefitContext from "./benefit/hooks/useBenefitContext";
import MappingDialog from "./zone/MappingDialog";
import VersionMappingList from "./zone/VersionMappingList";

const API_URL = apiConfig.service_price_plan;

const EventList = () => {
  const {
    events,
    ratePlans,
    ratingLists,
    loadingVersions,
    accumulationLists,
    loadingAccumulation,
    benefitLists,
    loadingBenefit,
    loadingMappingRating,
    mappingRatingLists,
    doGetListEvent,
    doGetListRatePlan,
    fetchVersionsRatingForRatePlan,
    fetchVersionsAccumulationForRatePlan,
    fetchVersionsBenefitForRatePlan,
    fetchMappingRatingForRatePlan,
    handleRatePlanDialog,
    showRatePlanDialog,
    showMappingDialog,
    handleMappingDialog,
    handleCreateEventDialog,
    showCreateEventDialog,
    setCreateDialogPosition,
    showPriceVersionDialog,
    handlePriceVersionDialog,
    selectedPriceVer,
    setSelectedPriceVer,
    selectedRatePlan,
    setSelectedRatePlan,
    selectedEvent,
    setSelectedEvent,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteDialog,
    onConfirmDelete,
    setSelectedDelete,
  } = useSubscriptionPriceCreateContext();
  const {
    handlePriceDialog,
    selectedPriceVer: selectedPriceVerAcm,
    setSelectedPriceVer: setSelectedPriceVerAcm,
  } = useAccumulationContext();
  const {
    handlePriceDialog: handlePriceBenefitDialog,
    selectedPriceVer: selectedPriceVerBenefit,
    selectedPrice: selectedPriceBenefit,
    setSelectedPriceVer: setSelectedPriceVerBenefit,
  } = useBenefitContext();

  const { GetData, PutData } = useCallApi();
  const {  selectedOfferVerId  } = usePortalData();

  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const [dialogPosition, setDialogPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [dialogMode, setDialogMode] = useState<"version" | "price">("price");

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
          await fetchVersionsRatingForRatePlan(ratePlanId, null);
        } else if (
          ratePlanType === "4" &&
          (!accumulationLists[ratePlanId] ||
            accumulationLists[ratePlanId].length === 0)
        ) {
          await fetchVersionsAccumulationForRatePlan(ratePlanId, null);
        } else if (
          ratePlanType === "3" &&
          (!benefitLists[ratePlanId] || benefitLists[ratePlanId].length === 0)
        ) {
          await fetchVersionsBenefitForRatePlan(ratePlanId, null);
        }
      } else if (ratePlanMapping === "2") {
        await fetchMappingRatingForRatePlan(ratePlanId);
      }
    }
  };

  const handleSelectEvent = (event: Events) => {
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

  const confirmDelete = (deleteType: DeleteSubscriptionTypeKey) => {
    if (deleteType === "event") {
      const offerVerId = selectedOfferVerId;
      const eventId = selectedEvent;
      onConfirmDelete(deleteType, offerVerId || 0, eventId || 0);
    } else if (deleteType === "priceAccumulation") {
      const offerVerId = selectedOfferVerId;
      const eventId = selectedEvent;
      const priceVerId = selectedPriceVerAcm?.priceVerId;
      onConfirmDelete(deleteType, offerVerId || 0, eventId || 0, priceVerId || 0);
    } else if (deleteType === "priceBenefit") {
      const offerVerId = selectedOfferVerId;
      const eventId = selectedEvent;
      const priceVerId = selectedPriceVerBenefit?.priceVerId;
      const subBalTypeId = selectedPriceBenefit?.subBalTypeId;
      onConfirmDelete(
        deleteType,
        offerVerId || 0,
        eventId || 0,
        priceVerId || 0,
        subBalTypeId || 0
      );
    } else {
      onConfirmDelete(deleteType);
    }
  };

  const validateVersion = async (ratePlan: RatePlans) => {
    try {
      const response = await GetData(
        `${API_URL}/validator/price-version/${ratePlan.ratePlanId}`,
        {}
      );

      if (response?.status) {
        if (ratePlan.ratePlanType === "1" || ratePlan.ratePlanType === "5") {
          handlePriceVersionDialog(true, "version", "create", response.data);
          setSelectedPriceVer(response.data);
        } else if (ratePlan.ratePlanType === "4") {
          // handleCreateAccumulationDialog(true, null); // NANTI DIPERBAIKI ARGS 2
          handlePriceDialog(true, "create", null, null);
          setSelectedPriceVerAcm(response.data);
        } else if (ratePlan.ratePlanType === "3") {
          handlePriceBenefitDialog(true, "create", "version", null);
          setSelectedPriceVerBenefit(response.data);
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
      <PriceAcmDialog />
      <PriceBenefitDialog />
      <DeleteDialog
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onConfirmDelete={confirmDelete}
      />
      {showPriceVersionDialog.show &&
      showPriceVersionDialog.mode === "version" ? (
        <AddPriceVersionDialog />
      ) : (
        <AddPriceVersionDialog />
      )}
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex border border-gray-200 rounded shadow-sm min-h-screen">
          {/* Left Sidebar */}
          <div className="w-1/4 border-r border-gray-200 p-3 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold mb-3">Subscription Event</h2>
              <button
                ref={plusButtonRef}
                className="text-blue-500 font-bold text-lg"
                onClick={() => {
                  if (plusButtonRef.current) {
                    const rect = plusButtonRef.current.getBoundingClientRect();
                    setCreateDialogPosition({
                      top: rect.bottom,
                      left: rect.left,
                    });
                  }
                  handleCreateEventDialog(!showCreateEventDialog);
                }}
              >
                +
              </button>
            </div>
            <ul>
              {events && events.length > 0 ? (
                events.map((event, idx) => {
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
                          handleDeleteEvent(selectedOfferVerId!, event.reId);
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
                    loadingVersions[plan.ratePlanId] || false;
                  const accumulations =
                    accumulationLists[plan.ratePlanId] || [];
                  const isLoadingAccumulation =
                    loadingAccumulation[plan.ratePlanId] || false;
                  const benefits = benefitLists[plan.ratePlanId] || [];
                  const isLoadingBenefit =
                    loadingBenefit[plan.ratePlanId] || false;
                  const mappingRating =
                    mappingRatingLists[plan.ratePlanId] || [];
                  const isLoadingMappingRating =
                    loadingMappingRating[plan.ratePlanId] || false;

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
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                              Priority: {plan.priority}
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
                            >
                              {/* <KeenIcon icon="arrow-up" className="w-4 h-4" /> */}
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
                            >
                              {/* <KeenIcon icon="arrow-down" className="w-4 h-4" /> */}
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
                              onClick={() =>
                                handleDeleteRatePlan(plan.ratePlanId)
                              }
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
                                    setDialogMode("version");
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
                                      versionList={versions}
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
                                  {isLoadingMappingRating ? (
                                    <div className="flex items-center justify-center py-8">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                      <span className="ml-3 text-slate-600">
                                        Loading...
                                      </span>
                                    </div>
                                  ) : mappingRating.length > 0 ? (
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
