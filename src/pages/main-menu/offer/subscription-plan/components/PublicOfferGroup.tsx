import React, { useState, useCallback, useEffect, useMemo } from "react";
import { KeenIcon } from "@/components";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import SubscriptionPlanSection from "./SubscriptionPlanSection";

interface PublicOfferGroupProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: any;
}

interface AllFeatureData {
  attrName: string;
  attrCode: string;
  inputType: string;
  attrId: string;
  attrType: string;
  objAttrId: string | null;
  csrVisible: string;
  instantiatable: string;
  configVisible: string;
  editable: string | null;
}

interface FeatureDetailData {
  baseAttrId: string;
  inputType: string;
  nullable: string;
  comments: string;
  defaultValue: string | null;
  valueScript: string | null;
  textAttrId: string;
  dataType: string;
  mask: string | null;
  ruleScript: string | null;
  editable: string;
  exceptionMessage: string;
  minValue: string | null;
  maxValue: string | null;
}

interface OfferGroupItem {
  id: string;
  name: string;
  code: string;
  count: number;
  offers: {
    id: string;
    name: string;
    code: string;
    type: string;
  }[];
}

// Define mode types
type ModalMode = "detail" | "edit" | "add";

const API_URL_OFFER = apiConfigOffer.offer;

const PublicOfferGroup: React.FC<PublicOfferGroupProps> = ({
  isOpen,
  onClose,
  rowData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMode, setCurrentMode] = useState<ModalMode>("detail");
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  const [detailData, setDetailData] = useState<FeatureDetailData | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<AllFeatureData | null>(
    null,
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { GetData } = useCallApi();

  const isEditingMode = currentMode === "edit" || currentMode === "add";
  const isDetailMode = currentMode === "detail";
  const [selectedContactChannel, setSelectedContactChannel] =
    useState<string>("");
  const [selectedProjectVisible, setSelectedProjectVisible] =
    useState<string>("");
  const [selectedMainProduct, setSelectedMainProduct] = useState<string>("");
  const [selectedInstantiation, setSelectedInstantiation] =
    useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  const [filterBy, setFilterBy] = useState<string>("1");
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Dummy data for offer groups
  const dummyOfferGroups: OfferGroupItem[] = [
    {
      id: "1",
      name: "Telkomcel Globe Related Product Group",
      code: "REL_PROD",
      count: 15,
      offers: [
        {
          id: "1-1",
          name: "Basic Internet Package",
          code: "BIP001",
          type: "Internet",
        },
        {
          id: "1-2",
          name: "Premium Internet Package",
          code: "PIP001",
          type: "Internet",
        },
        { id: "1-3", name: "Mobile Data Plan", code: "MDP001", type: "Data" },
        {
          id: "1-4",
          name: "Voice Call Package",
          code: "VCP001",
          type: "Voice",
        },
        { id: "1-5", name: "SMS Bundle", code: "SMS001", type: "SMS" },
      ],
    },
    {
      id: "2",
      name: "Price Plan",
      code: "PRC_PLAN",
      count: 8,
      offers: [
        {
          id: "2-1",
          name: "Basic Price Plan",
          code: "BPP001",
          type: "Pricing",
        },
        {
          id: "2-2",
          name: "Premium Price Plan",
          code: "PPP001",
          type: "Pricing",
        },
        {
          id: "2-3",
          name: "Enterprise Price Plan",
          code: "EPP001",
          type: "Pricing",
        },
      ],
    },
    {
      id: "3",
      name: "Goods Product",
      code: "GDS_PROD",
      count: 22,
      offers: [
        { id: "3-1", name: "Router Device", code: "RTR001", type: "Hardware" },
        { id: "3-2", name: "Modem Device", code: "MDM001", type: "Hardware" },
        { id: "3-3", name: "Set Top Box", code: "STB001", type: "Hardware" },
        { id: "3-4", name: "Cable Package", code: "CBL001", type: "Hardware" },
      ],
    },
    {
      id: "4",
      name: "Default Price Plan",
      code: "DEF_PRC",
      count: 5,
      offers: [
        {
          id: "4-1",
          name: "Standard Default Plan",
          code: "SDP001",
          type: "Default",
        },
        {
          id: "4-2",
          name: "Premium Default Plan",
          code: "PDP001",
          type: "Default",
        },
      ],
    },
  ];

  const filterOption = [
    { value: "1", label: "Related Product" },
    { value: "2", label: "Price Plan" },
    { value: "3", label: "Goods Product" },
    { value: "4", label: "Default Price Plan" },
  ];

  const selectLabel =
    filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  // Filter offer groups based on filterBy
  const filteredOfferGroups = useMemo(() => {
    return dummyOfferGroups.filter((group) => group.id === filterBy);
  }, [filterBy]);

  // Initial form data - combining both API structures
  const initialFormData = {
    groupMode: "Multi-Select",
    groupCode: "-",
    lowerLimit: "-",
    upperLimit: "-",
    effectiveDate: "2023/07/01 00:00:00",
    expiryDate: "-",
    remarks: "-",
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadDetailData = async (feature: AllFeatureData) => {
    try {
      //  console.log("📡 Fetching feature detail data from API...");
      const response = await GetData(`${API_URL_OFFER}/offer/qry-attr-detail`, {
        baseAttrId: feature.attrId,
      });

      //  console.log("✅ Detail API response", response);

      if (response?.data) {
        //  console.log("✅ Setting detail data:", response.data);
        setDetailData(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("❌ Detail API Error:", error);
      toast.error("Error GET Feature Detail data");
      return null;
    }
  };

  // Load feature details when a feature is selected - combining both APIs
  const loadFeatureDetails = async (feature: AllFeatureData) => {
    // Load detail data from second API
    const detailApiData = await loadDetailData(feature);

    // Combine data from both APIs
    const combinedFormData = {
      ...initialFormData,
      // From first API (basic feature info)
      attrType: feature.attrType || "1",
      attrCode: feature.attrCode || "",
      attrName: feature.attrName || "",
      csrVisible: feature.csrVisible || "Y",
      configVisible: feature.configVisible || "Y",
      instantiatable: feature.instantiatable || "N",
      editable: feature.editable || "Y",

      // From second API (detailed configuration)
      ...(detailApiData && {
        inputType: detailApiData.inputType,
        nullable: detailApiData.nullable || "N",
        promptMsg: detailApiData.promptMsg || "",
        defaultValue: detailApiData.defaultValue || "",
        valueScript: detailApiData.valueScript || "",
        mask: detailApiData.mask || "",
        ruleScript: detailApiData.ruleScript || "",
        exceptionMessage: detailApiData.exceptionMessage || "",
        minValue: detailApiData.minValue || "",
        maxValue: detailApiData.maxValue || "",
        valueNullable: detailApiData.nullable || "-",
        textEditable: detailApiData.editable || "-",
        errorMessage: detailApiData.exceptionMessage || "",
        comments: detailApiData.comments || "-",
      }),
    };

    //  console.log("🔄 Combined form data:", combinedFormData);
    setFormData(combinedFormData);
  };

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactChannelChange = (value: string) => {
    setSelectedContactChannel(value);
  };

  const handleInstantiationChange = (value: string) => {
    setSelectedInstantiation(value);
  };

  const handleProjectVisibleChange = (value: string) => {
    setSelectedProjectVisible(value);
  };

  const handleMainProductChange = (value: string) => {
    setSelectedMainProduct(value);
  };

  // Mode handlers
  const handleEditMode = () => {
    setCurrentMode("edit");
  };

  const handleAddMode = () => {
    setCurrentMode("add");
    setFormData(initialFormData);
    setSelectedFeature(null);
    setDetailData(null);
  };

  const handleDetailMode = () => {
    setCurrentMode("detail");
  };

  const handleSubmit = () => {
    //  console.log("Form data:", formData);

    if (currentMode === "add") {
      toast.success("Feature added successfully");
      setRefreshTrigger((prev) => prev + 1);
      setCurrentMode("detail");
    } else if (currentMode === "edit") {
      toast.success("Feature updated successfully");
      setRefreshTrigger((prev) => prev + 1);
      setCurrentMode("detail");
    }
  };

  const handleCancel = () => {
    setCurrentMode("detail");
    if (selectedFeature) {
      loadFeatureDetails(selectedFeature);
    }
  };

  const handleDelete = () => {
    if (selectedFeature) {
      //  console.log("Deleting feature:", selectedFeature);
      toast.success("Feature deleted successfully");
      setRefreshTrigger((prev) => prev + 1);
      setSelectedFeature(null);
      setDetailData(null);
      setFormData(initialFormData);
    }
  };

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setCurrentMode("detail");
    setSelectedFeature(null);
    setDetailData(null);
    setFormData(initialFormData);
    onClose();
  }, [onClose]);

  // Handle feature row click
  const handleFeatureSelect = async (feature: AllFeatureData) => {
    setSelectedFeature(feature);
    await loadFeatureDetails(feature);
    setCurrentMode("detail");
  };

  // Handle group menu toggle
  const handleGroupMenuToggle = (groupId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId);
    handleGroupMenuToggle(groupId);
  };

  // Handle offer item selection
  // const handleOfferSelect = (offer: any) => {
  //   // Create a mock AllFeatureData from the offer
  //   const mockFeature: AllFeatureData = {
  //     attrId: offer.id,
  //     attrName: offer.name,
  //     attrCode: offer.code,
  //     inputType: "4", // Default to Text
  //     attrType: "1", // Basic Feature
  //     objAttrId: null,
  //     csrVisible: "Y",
  //     instantiatable: "N",
  //     configVisible: "Y",
  //     editable: "Y",
  //   };

  //   setSelectedFeature(mockFeature);
  //   // Load dummy form data
  //   setFormData({
  //     ...initialFormData,
  //     attrType: "1",
  //     attrCode: offer.code,
  //     attrName: offer.name,
  //     csrVisible: "Y",
  //     configVisible: "Y",
  //     instantiatable: "N",
  //     editable: "Y",
  //     inputType: "4",
  //     featureCategory: "Main Product",
  //   });
  //   setCurrentMode("detail");
  // };

  // Get filtered offers based on search
  const getFilteredOffers = (offers: any[]) => {
    if (!searchValue) return offers;
    return offers.filter(
      (offer) =>
        offer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        offer.code.toLowerCase().includes(searchValue.toLowerCase()),
    );
  };

  // Get mode title
  const getModeTitle = () => {
    switch (currentMode) {
      case "add":
        return "Feature Name";
      case "edit":
        return `${selectedFeature?.attrName || "Feature Name"}`;
      default:
        return selectedFeature?.attrName || "Details";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="bg-gray-100 px-4 py-3 border-b flex-row justify-between items-center space-y-0">
          <DialogTitle className="flex items-center text-lg font-semibold text-gray-800">
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 pr-2"
            >
              <KeenIcon icon="left" />
            </button>
            Public Offer Group
          </DialogTitle>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          ></button>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0 p-4">
          {/* Left Panel - Offer Group List */}
          <div className="w-1/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0">
            {/* Header */}
            <div className="p-3 border-b">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-800">Offer Group</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddMode}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    title="New"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="input input-sm flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full"
                    placeholder={`Search ${selectLabel}..`}
                  />
                  <KeenIcon icon="magnifier" />
                </label>
              </div>

              <div className="flex items-center gap-3 w-full py-3">
                <Select
                  value={filterBy}
                  onValueChange={(val) => setFilterBy(val)}
                >
                  <SelectTrigger className="w-32 px-2 py-1 text-xs h-8">
                    <SelectValue placeholder={`Search ${selectLabel}..`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Related Product</SelectItem>
                    <SelectItem value="2">Price Plan</SelectItem>
                    <SelectItem value="3">Goods Product</SelectItem>
                    <SelectItem value="4">Default Price Plan</SelectItem>
                  </SelectContent>
                </Select>

                <label className="input input-sm flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="w-full"
                    placeholder={`Search ${selectLabel}..`}
                  />
                  <KeenIcon icon="magnifier" />
                </label>
              </div>
            </div>

            {/* Groups and Offers List */}
            <div className="flex-1 overflow-auto px-1">
              <ul className="mt-2 text-sm px-2">
                {filteredOfferGroups.map((group) => {
                  const isOpen = openMenus[group.id] || false;
                  const isSelected = selectedGroupId === group.id;
                  const filteredOffers = getFilteredOffers(group.offers);

                  return (
                    <li key={group.id}>
                      <button
                        onClick={() => handleGroupSelect(group.id, group.name)}
                        className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200`}
                      >
                        <button>
                          <KeenIcon icon="right" className="mr-2" />
                        </button>
                        <div className="flex-1 min-w-0 text-left">
                          <span
                            className={`block font-medium text-xs whitespace-normal break-words ${isSelected ? "text-blue-700 font-semibold" : ""}`}
                          >
                            {group.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <KeenIcon icon="trash" />
                        </div>
                      </button>

                      {/* Render offer sub-items */}
                      {isOpen && (
                        <ul className="ml-4 font-light text-xs mt-1">
                          {filteredOffers.length > 0 ? (
                            filteredOffers.map((offer) => (
                              <li key={offer.id}>
                                <button
                                  // onClick={() => handleOfferSelect(offer)}
                                  className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:shadow-sm ${
                                    selectedFeature?.attrCode === offer.code
                                      ? "bg-blue-100 border-2 border-blue-400 shadow-sm"
                                      : "hover:bg-gray-100"
                                  }`}
                                  title={`${offer.name} (${offer.code})`}
                                >
                                  <KeenIcon
                                    icon="element-11"
                                    className={`w-4 h-4 mr-2 transition-colors duration-200 ${selectedFeature?.attrCode === offer.code ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className={`block truncate transition-colors duration-200 ${selectedFeature?.attrCode === offer.code ? "font-semibold text-blue-800" : "hover:text-gray-900"}`}
                                    >
                                      {offer.name}
                                    </span>
                                    <span className="block text-gray-400 text-xs truncate">
                                      {offer.code}
                                    </span>
                                  </div>
                                </button>
                              </li>
                            ))
                          ) : (
                            <li className="px-2 py-1.5 text-gray-500 italic">
                              {searchValue
                                ? "No matching offers found"
                                : "No offers available"}
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right Panel - Feature Details */}
          <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-auto">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {getModeTitle()}
              </h3>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Row 1 - Feature Type & Feature Code */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Group Mode:</span>
                    {isEditingMode ? (
                      <div className="flex gap-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="attrType"
                            value="1"
                            checked={formData.groupMode === "1"}
                            onChange={handleInputChange}
                            className="mr-1"
                          />
                          Basic Feature
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="attrType"
                            value="2"
                            checked={formData.groupMode === "2"}
                            onChange={handleInputChange}
                            className="mr-1"
                          />
                          Object Feature
                        </label>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {formData.groupMode}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Group Code:</span>
                    {isEditingMode ? (
                      <input
                        type="text"
                        name="groupCode"
                        value={formData.groupCode}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter feature code"
                        required
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {formData.groupCode || "-"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2 - Feature Name & Feature Category*/}
                <div className="grid grid-cols-2 gap-8">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800"> Lower Limit:</span>
                    {isEditingMode ? (
                      <input
                        type="text"
                        name="attrName"
                        value={formData.lowerLimit}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter feature name"
                        required
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {formData.lowerLimit || "-"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Upper Limit:</span>
                    {isEditingMode ? (
                      <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 flex items-center">
                        <span className="px-2 py-0.5 border border-gray-400 rounded bg-blue-50 text-gray-700">
                          {formData.upperLimit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {formData.upperLimit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 3 - Contact Channel & CSR Visible*/}
                <div className="grid grid-cols-2 gap-8">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">
                      Effective Date:
                    </span>
                    {isEditingMode ? (
                      <select
                        name="contactChannel"
                        value={formData.effectiveDate}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                        required
                      ></select>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {formData.effectiveDate}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Expiry Date:</span>
                    {isEditingMode ? (
                      <div className="flex gap-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="csrVisible"
                            value="Y"
                            checked={formData.effectiveDate === "Y"}
                            onChange={handleInputChange}
                            className="mr-1"
                          />
                          Yes
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="csrVisible"
                            value="N"
                            checked={formData.effectiveDate === "N"}
                            onChange={handleInputChange}
                            className="mr-1"
                          />
                          No
                        </label>
                      </div>
                    ) : (
                      <div>{formData.expiryDate}</div>
                    )}
                  </div>
                </div>

                {/* Row 4 - Project Visible & Instantiation */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Remarks:</span>
                    {isEditingMode ? (
                      <div className="flex gap-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="configVisible"
                            value="Y"
                            checked={formData.remarks === "Y"}
                            onChange={handleInputChange}
                            className="mr-1"
                          />
                          Yes
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="radio"
                            name="configVisible"
                            value="N"
                            checked={formData.remarks === "N"}
                            onChange={handleInputChange}
                            className="mr-1"
                          />
                          No
                        </label>
                      </div>
                    ) : (
                      <div>{formData.remarks}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                {isEditingMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currentMode === "add" ? "Add" : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleEditMode}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!selectedFeature}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="px-6">
              <SubscriptionPlanSection rowData={rowData} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublicOfferGroup;
