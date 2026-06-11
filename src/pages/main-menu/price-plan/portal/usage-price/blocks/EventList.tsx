import { useEffect, useState } from "react";
import { useUsagePriceCreateContext } from "../hooks";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import VersionTable from "./VersionTable";
import DeleteEvent from "./DeleteEvent";
import DeleteRatePlan from "./DeleteRatePlan";
import UpdateDateDialog from "./UpdateDateDialog";
import EditRatePlanDialog from "./EditRatePlanDialog";
import CreatePriceVersionDialog from "./CreatePriceVersionDialog";
import CreateAccumulationPriceVersionDialog from "./accumulation-usage-price/CreateAccumulationPriceVersionDialog";
import CreateBenefitDialog from "./benefit-usage-price/CreateBenefitDialog";
import CreateMappingDialog from "./CreateMappingDialog";
import DeleteMapping from "./DeleteMapping";
import UpdateMappingDialog from "./UpdateMappingDialog";
import { createDropdownMenuScope } from "@radix-ui/react-dropdown-menu";
import { Validate } from "react-hook-form";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { Code } from "lucide-react";
import ExpressionPriceDialog from "./rate-plan/ExpressionPrice";

const API_URL = apiConfig.service_price_plan;

const EventList = () => {
  const {
    eventList,
    getRatePlans,
    selectedEvent,
    setSelectedEvent,
    ratePlans,
    handleAddDialog,
    handleAddEventDialog,
    selectedRatePlan,
    setSelectedRatePlan,
    priceVersionsMap,
    getPriceVersion,
    getEventList,
    getAccumulationList,
    accumulationMap,
    benefitMap,
    selectedMapping,
    setSelectedMapping,
    getBenefitList,
    getMappingZone,
    mappingZonesMap,
    handleReservationRulesDialog,
    showReservationRules,
    setShowReservationRules,
  } = useUsagePriceCreateContext();
  const {  selectedOfferVerId  } = usePortalData();
  const { GetData, PutData } = useCallApi();
  const [showExpressionPriceDialog, setShowExpressionPriceDialog] =
    useState(false);

  // const handleSaveExpressionPrice = (data: ExpressionPrice) => {
  //   setExpressionPriceData(data);
  //   toast.success("Expression price saved successfully");
  // };
  const [versionType, setVersionType] = useState<"price" | "tax" | null>(null);
  const [latestExpDate, setLatestExpDate] = useState<string | null>(null);
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [showPriceVersionDialog, setShowPriceVersionDialog] = useState(false);
  const [expandedPriceVersions, setExpandedPriceVersions] = useState<
    Record<string, boolean>
  >({});
  const [isValidating, setIsValidating] = useState<Record<number, boolean>>({});
  const [showDeleteEventDialog, setShowDeleteEventDialog] = useState(false);
  const [showDeleteMappingDialog, setShowDeleteMappingDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{
    offerVerId: number | null;
    eventId: number | null;
  }>({ offerVerId: null, eventId: null });
  const [editingMapping, setEditingMapping] = useState<{
    mappingId: number | null;
    ratePlanId: number | null;
  } | null>(null);
  const [showDeleteRatePlanDialog, setShowDeleteRatePlanDialog] =
    useState(false);
  const [autoExpandedKeys, setAutoExpandedKeys] = useState<
    Record<string, boolean>
  >({});
  const handleExpressionPriceSaveSuccess = () => {
    // Refresh event list setelah save berhasil
    getEventList();
  };

  const [mappingsToDelete, setMappingsToDelete] = useState<number | null>(null);
  const [ratePlanToDelete, setRatePlanToDelete] = useState<number | null>(null);
  const [showUpdateDateDialog, setShowUpdateDateDialog] = useState(false);
  const [showEditMappingDialog, setShowEditMappingDialog] = useState(false);

  const [priceVersionToUpdate, setPriceVersionToUpdate] = useState<any>(null);
  const [ratePlanIdForUpdate, setRatePlanIdForUpdate] = useState<number | null>(
    null,
  );
  const [showCreateBenefitDialog, setShowCreateBenefitDialog] = useState(false);
  const [expandedMappings, setExpandedMappings] = useState<
    Record<number, number[]>
  >({});

  const [showEditRatePlanDialog, setShowEditRatePlanDialog] = useState(false);
  const [ratePlanToEdit, setRatePlanToEdit] = useState<number | null>(null);
  const [
    showAccumulationPriceVersionDialog,
    setShowAccumulationPriceVersionDialog,
  ] = useState(false);
  const [isMappingCreatedMap, setIsMappingCreatedMap] = useState<
    Record<number, boolean>
  >({});
  const [showCreateMappingDialogFor, setShowCreateMappingDialogFor] = useState<
    number | null
  >(null);

  const sortedRatePlans = [...ratePlans].sort(
    (a, b) => a.priority - b.priority,
  );
  const [isMappingCreated, setIsMappingCreated] = useState<number | null>(null);
  const changePriority = async (
    movingRatePlanId: number,
    targetPriority: number,
  ) => {
    try {
      const response = await PutData(
        `${API_URL}/rate-plan/priority?ratePlanId=${movingRatePlanId}&priority=${targetPriority}`,
        {},
      );

      if (response?.status) {
        toast.success("Priority updated successfully");
        if (selectedEvent) {
          await getRatePlans(selectedEvent);
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
    ratePlanMapping: string,
    ratePlanType: string,
  ) => {
    const isCurrentlyOpen = openIndexes.includes(idx);

    setOpenIndexes((prev) =>
      isCurrentlyOpen ? prev.filter((i) => i !== idx) : [...prev, idx],
    );

    if (!isCurrentlyOpen) {
      setSelectedRatePlan(ratePlanId);

      const mappingIdToUse = ratePlanMapping === "1" ? null : selectedMapping;
      if (ratePlanMapping === "1") {
        setSelectedMapping(null);
      }

      // Handle different rate plan types
      if (ratePlanType === "4" && !accumulationMap[ratePlanId]) {
        await getAccumulationList(ratePlanId, mappingIdToUse);
      } else if (ratePlanType === "3" && !benefitMap[ratePlanId]) {
        await getBenefitList(ratePlanId, mappingIdToUse);
      } else if (
        (ratePlanType === "1" || ratePlanType === "5") &&
        !priceVersionsMap[ratePlanId]
      ) {
        // For price (1) and tax (5) types, use the same price version endpoint
        await getPriceVersion(ratePlanId, mappingIdToUse);
      }

      if (ratePlanMapping === "2") {
        await getMappingZone(ratePlanId);
      }
    } else {
      setSelectedRatePlan(null);
    }
  };

  const toggleMappingCollapse = async (
    ratePlanId: number,
    mappingId: number,
  ) => {
    const currentExpanded = expandedMappings[ratePlanId] || [];
    const isExpanded = currentExpanded.includes(mappingId);
    setSelectedMapping(mappingId);
    setExpandedMappings((prev) => ({
      ...prev,
      [ratePlanId]: isExpanded
        ? currentExpanded.filter((id) => id !== mappingId)
        : [...currentExpanded, mappingId],
    }));

    if (!isExpanded) {
      const currentRatePlan = ratePlans.find(
        (plan) => plan.ratePlanId === ratePlanId,
      );

      if (currentRatePlan) {
        const { ratePlanType } = currentRatePlan;

        if (ratePlanType === "4" && !accumulationMap[mappingId]) {
          await getAccumulationList(ratePlanId, mappingId);
        } else if (ratePlanType === "3" && !benefitMap[mappingId]) {
          await getBenefitList(ratePlanId, mappingId);
        } else if (
          (ratePlanType === "1" ||
            ratePlanType === "2" ||
            ratePlanType === "5") &&
          !priceVersionsMap[mappingId]
        ) {
          // For price and tax types, use the same price version endpoint
          await getPriceVersion(ratePlanId, mappingId);
        }
      }
    }
  };

  const toggleVersionTable = (ratePlanId: number, priceVersionId: number) => {
    const key = `${ratePlanId}-${priceVersionId}`;
    setExpandedPriceVersions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectEvent = (event: Events) => {
    setSelectedEvent(event.reId);
    getRatePlans(event.reId);
    setOpenIndexes([]);
    setSelectedRatePlan(null);
    setExpandedPriceVersions({});
  };

  const handleCreateVersion = (expDate: string | null) => {
    setLatestExpDate(expDate); // tambahkan ini
  };

  const [responseValidate, setResponseValidate] = useState<ValidateVersionType>(
    {
      effDate: "",
      expDate: "",
    },
  );

  const handleDeleteEvent = (eventId: number) => {
    const offerVerId = selectedOfferVerId;
    if (!offerVerId) {
      toast.error("Offer version ID not found");
      return;
    }
    setEventToDelete({ offerVerId, eventId });
    setShowDeleteEventDialog(true);
  };
  const handleDeleteMapping = (mappingId: number) => {
    setMappingsToDelete(mappingId);
    setShowDeleteMappingDialog(true);
  };
  const handleEditMapping = (mappingId: number, ratePlanId: number) => {
    setEditingMapping({ mappingId, ratePlanId });
    setShowEditMappingDialog(true);
  };

  const handleDeleteRatePlan = (ratePlanId: number) => {
    setRatePlanToDelete(ratePlanId);
    setShowDeleteRatePlanDialog(true);
  };

  const handleEditRatePlan = (ratePlanId: number) => {
    setRatePlanToEdit(ratePlanId);
    setShowEditRatePlanDialog(true);
  };

  const handleCreateBenefit = (ratePlanId: number) => {
    setSelectedRatePlan(ratePlanId);
    setShowCreateBenefitDialog(true);
  };

  const validateVersion = async (ratePlan: RatePlans, mappingId?: number) => {
    const ratePlanId = ratePlan.ratePlanId;
    const ratePlanType = ratePlan.ratePlanType;
    const validatingKey = mappingId
      ? `${ratePlanId}-${mappingId}`
      : `${ratePlanId}`;

    setIsValidating((prev) => ({ ...prev, [validatingKey]: true }));

    try {
      let priceVersions = mappingId
        ? priceVersionsMap[mappingId]
        : priceVersionsMap[ratePlanId];

      const response = await GetData(
        `${API_URL}/validator/price-version/${ratePlanId}`,
        {},
      );
      setResponseValidate(response.data);
      if (response?.status) {
        if (ratePlanType === "4") {
          handleCreateAccumulationPriceVersion(ratePlanId);
        } else if (ratePlanType === "3") {
          handleCreateBenefit(ratePlanId);
        } else if (ratePlanType === "1" || ratePlanType === "5") {
          setSelectedRatePlan(ratePlanId);
          setVersionType(ratePlanType === "5" ? "tax" : "price");
          setShowPriceVersionDialog(true);
        }
      } else {
        toast.warning(response?.message);
      }
    } catch (error) {
      toast.error("Failed to validate version");
    } finally {
      setIsValidating((prev) => ({ ...prev, [validatingKey]: false }));
    }
  };

  const changeMappingPriority = async (
    mappingId: number,
    newPriority: number,
    ratePlanId: number,
  ) => {
    try {
      const url = `${API_URL}/mapping/update/priority?mappingId=${mappingId}&newPriority=${newPriority}`;
      const response = await PutData(url, {});

      if (response?.status) {
        toast.success("Mapping priority updated successfully");
        await getMappingZone(ratePlanId);
      } else {
        toast.error(response?.message || "Failed to update mapping priority");
      }
    } catch (err) {
      toast.error("Error while updating mapping priority");
    }
  };

  const handleCreateAccumulationPriceVersion = (ratePlanId: number) => {
    setSelectedRatePlan(ratePlanId);
    setShowAccumulationPriceVersionDialog(true);
  };

  const renderPriceVersions = (ratePlanId: number, mappingId?: number) => {
    const currentRatePlan = ratePlans.find(
      (plan) => plan.ratePlanId === ratePlanId,
    );
    if (!currentRatePlan) return null;

    const dataKey = mappingId || ratePlanId;
    const isBenefit = currentRatePlan.ratePlanType === "3";
    const isAccumulation = currentRatePlan.ratePlanType === "4";
    const isTax = currentRatePlan.ratePlanType === "5";
    const isPrice = currentRatePlan.ratePlanType === "1";

    if (isBenefit) {
      const benefits = benefitMap[dataKey] || [];

      const grouped = benefits.reduce(
        (acc: Record<number, Benefit[]>, item) => {
          if (!acc[item.priceVerId]) acc[item.priceVerId] = [];
          acc[item.priceVerId].push(item);
          return acc;
        },
        {},
      );

      return Object.entries(grouped).map(([verId, items]) => {
        const versionId = parseInt(verId);
        const key = `${ratePlanId}-${versionId}`;

        if (!expandedPriceVersions[key] && !autoExpandedKeys[key]) {
          setExpandedPriceVersions((prev) => ({ ...prev, [key]: true }));
          setAutoExpandedKeys((prev) => ({ ...prev, [key]: true }));
        }

        return (
          <VersionTable
            key={versionId}
            ratePlanId={ratePlanId}
            ratePlanType="3"
            priceVersion={{
              priceVerId: versionId,
              effDate: items[0]?.effectiveDate || null,
              expDate: items[0]?.expiryDate || null,
              price: [],
            }}
            benefitData={items}
            isExpanded={expandedPriceVersions[key] || false}
            onToggle={() => toggleVersionTable(ratePlanId, versionId)}
            onRefresh={() => getBenefitList(ratePlanId, mappingId ?? null)}
            isMappingCreated={
              mappingId ? true : !!isMappingCreatedMap[ratePlanId]
            } // ✅ Perbaikan
          />
        );
      });
    }

    if (isAccumulation) {
      const accumulationData = accumulationMap[dataKey] || [];

      if (accumulationData.length === 0) {
        return (
          <p className="py-3 italic text-center text-gray-500">
            No accumulation data found.
          </p>
        );
      }

      const groupedByPriceVerId = accumulationData.reduce(
        (acc, item) => {
          if (!acc[item.priceVerId]) {
            acc[item.priceVerId] = [];
          }
          acc[item.priceVerId].push(item);
          return acc;
        },
        {} as Record<number, typeof accumulationData>,
      );

      return Object.entries(groupedByPriceVerId).map(([priceVerId, data]) => {
        const versionId = parseInt(priceVerId);
        const key = `${ratePlanId}-${versionId}`;

        if (!expandedPriceVersions[key] && !autoExpandedKeys[key]) {
          setExpandedPriceVersions((prev) => ({ ...prev, [key]: true }));
          setAutoExpandedKeys((prev) => ({ ...prev, [key]: true }));
        }

        return (
          <VersionTable
            key={versionId}
            ratePlanId={ratePlanId}
            ratePlanType="4"
            isExpanded={expandedPriceVersions[key] || false}
            onToggle={() => toggleVersionTable(ratePlanId, versionId)}
            onRefresh={() => getAccumulationList(ratePlanId, mappingId ?? null)}
            accumulationData={data}
            isMappingCreated={!!isMappingCreatedMap[ratePlanId]}
          />
        );
      });
    }

    // Handle both Price (1,2) and Tax (5) types - they use the same structure
    const versions = priceVersionsMap[dataKey] || [];
    const grouped = versions.reduce(
      (acc: Record<number, Price[]>, item: Price) => {
        if (!acc[item.priceVerId]) acc[item.priceVerId] = [];
        acc[item.priceVerId].push(item);
        return acc;
      },
      {},
    );

    return Object.entries(grouped).map(([verId, items]) => {
      const versionId = parseInt(verId);
      const key = `${ratePlanId}-${versionId}`;
      const sample = items[0];

      if (!expandedPriceVersions[key] && !autoExpandedKeys[key]) {
        setExpandedPriceVersions((prev) => ({ ...prev, [key]: true }));
        setAutoExpandedKeys((prev) => ({ ...prev, [key]: true }));
      }

      return (
        <VersionTable
          key={versionId}
          ratePlanId={ratePlanId}
          ratePlanType={currentRatePlan.ratePlanType}
          isExpanded={expandedPriceVersions[key] || false}
          onToggle={() => toggleVersionTable(ratePlanId, versionId)}
          onRefresh={() => getPriceVersion(ratePlanId, mappingId ?? null)}
          priceVersion={{
            priceVerId: versionId,
            effDate: sample.effDate,
            expDate: sample.expDate,
            price: items,
          }}
          taxData={
            isTax
              ? {
                  priceVerId: versionId,
                  effDate: sample.effDate,
                  expDate: sample.expDate,
                  price: items,
                }
              : undefined
          }
        />
      );
    });
  };

  useEffect(() => {
    if (eventList.length > 0 && !selectedEvent) {
      handleSelectEvent(eventList[0]);
    }
  }, [eventList]);

  return (
    <>
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="flex min-h-screen border border-gray-200 rounded shadow-sm">
          {/* Left Sidebar */}
          <div className="w-1/4 p-3 bg-white border-r border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="mb-3 text-sm font-semibold">Usage Price Event</h2>
              <button
                onClick={() => handleAddEventDialog(true)}
                className="text-lg font-bold text-blue-500"
                title="Add Event"
              >
                +
              </button>
            </div>
            <ul>
              {eventList && eventList.length > 0 ? (
                eventList.map((event) => {
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
                          handleDeleteEvent(event.reId);
                        }}
                        className="text-red-500 transition-all duration-300 ease-in-out transform translate-x-full opacity-0 hover:text-red-700 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2 mb-1 text-gray-500">
                  No events available
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col flex-1">
            <div className="p-6 bg-white border-b border-slate-200">
              <div className="flex items-center justify-between w-full mb-4">
                <h1 className="text-xl font-semibold text-slate-800">
                  Rate Plans
                </h1>

                <div className="flex gap-2">
                  <button
                    aria-label="Open Expression Price"
                    className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 bg-red-600 rounded-lg shadow-sm hover:bg-red-700"
                    onClick={() => setShowReservationRules(true)}
                  >
                    <Code className="w-4 h-4" />
                    <span>Reservation Rules</span>
                  </button>

                  <button
                    aria-label="Create new rate plan"
                    className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600"
                    onClick={() => handleAddDialog(true)}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>New Rate Plan</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <h3 className="text-sm font-medium text-slate-500">
                    Basic Rate Plan
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <h3 className="text-sm font-medium text-slate-500">
                    Rate Plan Zone
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {sortedRatePlans && sortedRatePlans.length > 0 ? (
                sortedRatePlans.map((plan, idx) => {
                  const isOpen = openIndexes.includes(idx);
                  const isLoading = isValidating[plan.ratePlanId] || false;
                  const isMapping2 = plan.ratePlanMapping === "2";
                  const sortedMappings = [
                    ...(mappingZonesMap[plan.ratePlanId] || []),
                  ].sort((a, b) => a.priority - b.priority);

                  return (
                    <div
                      key={plan.ratePlanId}
                      className="transition-all duration-200 bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md"
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
                              {plan.ratePlanName} - {plan.ratePlanId}
                            </h3>
                          </div>

                          <div className="flex items-center">
                            <span className="px-2 py-1 text-xs rounded-md text-slate-500 bg-slate-100">
                              Priority: {plan.priority}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={idx === 0}
                              onClick={() =>
                                changePriority(
                                  plan.ratePlanId,
                                  ratePlans[idx - 1].priority,
                                )
                              }
                              className="w-8 h-8 p-0 hover:bg-slate-100 disabled:opacity-50"
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
                                  ratePlans[idx + 1].priority,
                                )
                              }
                              className="w-8 h-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                              title="Move Down"
                            >
                              <FaArrowDown />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleEditRatePlan(plan.ratePlanId)
                              }
                              className="w-8 h-8 p-0 hover:bg-slate-100 text-slate-600"
                              title="Edit"
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
                              className="w-8 h-8 p-0 text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <KeenIcon icon="trash" className="w-4 h-4" />
                            </Button>
                            <button
                              onClick={() =>
                                toggleCollapse(
                                  idx,
                                  plan.ratePlanId,
                                  plan.ratePlanMapping,
                                  plan.ratePlanType,
                                )
                              }
                              className="flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-md hover:bg-slate-100 text-slate-600"
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
                          <div className="pt-4 mt-4 border-t border-slate-200">
                            {isMapping2 ? (
                              <>
                                <button
                                  className="px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-orange-500 rounded-lg hover:bg-orange-600"
                                  onClick={() =>
                                    setShowCreateMappingDialogFor(
                                      plan.ratePlanId,
                                    )
                                  }
                                >
                                  Create Mapping
                                </button>

                                <div className="mt-4">
                                  {sortedMappings.length > 0 ? (
                                    sortedMappings.map((mapping, idx) => {
                                      const isMappingOpen =
                                        expandedMappings[
                                          plan.ratePlanId
                                        ]?.includes(mapping.mappingId) || false;

                                      return (
                                        <div
                                          key={mapping.mappingId}
                                          className="p-4 mt-2 border rounded-lg shadow-sm border-slate-200 bg-slate-50"
                                        >
                                          {/* Header Section */}
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-slate-800">
                                              {mapping.mappingName}
                                            </h4>

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-8 h-8 p-0 text-red-500 transition-colors hover:bg-red-50"
                                                title="Delete Mapping"
                                                onClick={() =>
                                                  handleDeleteMapping(
                                                    mapping.mappingId,
                                                  )
                                                }
                                              >
                                                <KeenIcon
                                                  icon="trash"
                                                  className="w-4 h-4"
                                                />
                                              </Button>

                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-8 h-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                                                disabled={idx === 0}
                                                onClick={() =>
                                                  changeMappingPriority(
                                                    mapping.mappingId,
                                                    (mappingZonesMap[
                                                      plan.ratePlanId
                                                    ] || [])[idx - 1].priority,
                                                    plan.ratePlanId,
                                                  )
                                                }
                                                title="Move Up"
                                              >
                                                <FaArrowUp className="w-4 h-4" />
                                              </Button>

                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-8 h-8 p-0 hover:bg-slate-100 disabled:opacity-50"
                                                disabled={
                                                  idx ===
                                                  (
                                                    mappingZonesMap[
                                                      plan.ratePlanId
                                                    ] || []
                                                  ).length -
                                                    1
                                                }
                                                onClick={() =>
                                                  changeMappingPriority(
                                                    mapping.mappingId,
                                                    (mappingZonesMap[
                                                      plan.ratePlanId
                                                    ] || [])[idx + 1].priority,
                                                    plan.ratePlanId,
                                                  )
                                                }
                                                title="Move Down"
                                              >
                                                <FaArrowDown className="w-4 h-4" />
                                              </Button>

                                              <button
                                                className="flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-md hover:bg-slate-100 text-slate-600"
                                                title={
                                                  isMappingOpen
                                                    ? "Collapse"
                                                    : "Expand"
                                                }
                                                onClick={() =>
                                                  toggleMappingCollapse(
                                                    plan.ratePlanId,
                                                    mapping.mappingId,
                                                  )
                                                }
                                              >
                                                {isMappingOpen ? (
                                                  <FaChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <FaChevronDown className="w-4 h-4" />
                                                )}
                                              </button>
                                            </div>
                                          </div>

                                          {/* Expandable Content */}
                                          {isMappingOpen && (
                                            <div className="pt-3 mt-3 border-t border-slate-200">
                                              <button
                                                className="px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                                                onClick={() =>
                                                  validateVersion(plan)
                                                }
                                              >
                                                New Version
                                              </button>

                                              {/* Price Versions Section */}
                                              <div className="mt-4">
                                                {renderPriceVersions(
                                                  plan.ratePlanId,
                                                  mapping.mappingId,
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="py-8 text-center text-slate-500">
                                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100">
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
                              <>
                                <button
                                  className="px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                                  onClick={() => validateVersion(plan)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Validating..." : "New Version"}
                                </button>

                                <div className="mt-4">
                                  {renderPriceVersions(plan.ratePlanId)}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-slate-500">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100">
                    <FaFile className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">
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

      {/* Dialogs */}
      <DeleteEvent
        show={showDeleteEventDialog}
        onClose={() => setShowDeleteEventDialog(false)}
        eventToDelete={eventToDelete}
        onDeleteSuccess={getEventList}
      />
      {showCreateBenefitDialog && (
        <CreateBenefitDialog
          onClose={() => {
            setShowCreateBenefitDialog(false);
            getBenefitList(selectedRatePlan, selectedMapping);
          }}
          expDate={responseValidate?.expDate}
        />
      )}
      <DeleteRatePlan
        show={showDeleteRatePlanDialog}
        onClose={() => setShowDeleteRatePlanDialog(false)}
        ratePlanId={ratePlanToDelete}
        onDeleteSuccess={() => {
          if (selectedEvent) {
            getRatePlans(selectedEvent);
          }
        }}
      />
      <DeleteMapping
        show={showDeleteMappingDialog}
        onClose={() => setShowDeleteMappingDialog(false)}
        mappingId={mappingsToDelete}
        onDeleteSuccess={() => {
          if (selectedRatePlan) {
            getMappingZone(selectedRatePlan);
          }
        }}
      />
      {showEditMappingDialog && editingMapping !== null && (
        <UpdateMappingDialog
          key={`${editingMapping.mappingId}-${editingMapping.ratePlanId}`}
          show={showEditMappingDialog}
          mappingId={editingMapping.mappingId}
          ratePlanId={editingMapping.ratePlanId}
          onClose={() => {
            setShowEditMappingDialog(false);
            setEditingMapping(null);
          }}
          onUpdateSuccess={() => {
            if (editingMapping.ratePlanId) {
              getMappingZone(editingMapping.ratePlanId);
            }
          }}
        />
      )}

      <UpdateDateDialog
        show={showUpdateDateDialog}
        onClose={() => setShowUpdateDateDialog(false)}
        ratePlanId={ratePlanIdForUpdate!}
        priceVersion={priceVersionToUpdate}
        onUpdateSuccess={() =>
          getPriceVersion(ratePlanIdForUpdate!, selectedMapping)
        }
        mappingId={selectedMapping}
      />
      <EditRatePlanDialog
        show={showEditRatePlanDialog}
        ratePlanId={ratePlanToEdit}
        onClose={() => setShowEditRatePlanDialog(false)}
      />
      {showPriceVersionDialog && (
        <CreatePriceVersionDialog
          onClose={() => {
            setShowPriceVersionDialog(false);
          }}
          mappingId={selectedMapping}
          expDate={responseValidate?.expDate}
          versionType={versionType}
          showDialog={showPriceVersionDialog}
        />
      )}
      {showAccumulationPriceVersionDialog && (
        <CreateAccumulationPriceVersionDialog
          onClose={() => {
            setShowAccumulationPriceVersionDialog(false);
            getAccumulationList(selectedRatePlan ?? 0, selectedMapping);
          }}
          mappingId={selectedMapping}
          expDate={responseValidate?.expDate}
        />
      )}
      {showCreateMappingDialogFor !== null && (
        <CreateMappingDialog
          ratePlanId={showCreateMappingDialogFor}
          onClose={() => setShowCreateMappingDialogFor(null)}
          onCreateSuccess={() => {
            setIsMappingCreatedMap((prev) => ({
              ...prev,
              [showCreateMappingDialogFor]: true,
            }));
            setShowCreateMappingDialogFor(null);
            if (selectedRatePlan) {
              getMappingZone(selectedRatePlan);
            }
          }}
        />
      )}
      <ExpressionPriceDialog
        show={showReservationRules}
        onClose={() => setShowReservationRules(false)}
        onSaveSuccess={handleExpressionPriceSaveSuccess}
        reId={selectedEvent || 0}
        offerVerId={selectedOfferVerId || 0}
      />
    </>
  );
};

export default EventList;
