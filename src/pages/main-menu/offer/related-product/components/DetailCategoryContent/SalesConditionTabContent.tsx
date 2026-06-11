import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown, Plus, Trash } from "lucide-react";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import AddSalesCondition from "../../blocks/AddSalesCondition";
import DeleteSalesCondition from "../../blocks/DeleteSalesCondition";
import AddSalesOrg from "../../blocks/AddSalesConditionOrg";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { Button } from "@/components/ui/button";

interface SalesConditionProps {
  offerId?: number;
  rowData?: any;
  category?: string;
}

interface SalesConditionArea {
  offerId: number;
  contactChannelId: number;
  spId: number;
  excludeFlag?: string | null;
  parentId?: number | null;
  areaName: string;
  conditionName: string;
  comments?: string | null;
  areaCode: string;
  areaId: number;
}

interface SalesConditionOrg {
  offerId: number;
  orgId: number;
  areaId: number;
  orgName: string;
  conditionName: string;
  orgType: string;
  stateDate: string;
  orgCode: string;
}

interface SalesConditionChannel {
  offerId: number;
  contactChannelId: number;
  channelType: string;
  contactChannelName: string;
  conditionName: string;
  comments: string;
}

interface SalesConditionCatg {
  offerId: number;
  areaId: number;
  catgDeffType: string;
  catgId: string;
  catgName: string;
  conditionName: string;
}

interface DeleteContext {
  offerId: number;
  areaIds: number[];
  type: "area" | "org" | "channel" | "catg";
}

const API_URL_OFFER = apiConfigOffer.offer;

const SalesConditionTabContent: React.FC<SalesConditionProps> = ({ offerId, rowData }) => {
  const {menuPrivAccess} = useOfferLayout()
  const { GetData } = useCallApi();
  const fetchedRef = useRef<number | null>(null);

  const [salesAreas, setSalesAreas] = useState<SalesConditionArea[]>([]);
  const [salesOrg, setSalesOrg] = useState<SalesConditionOrg[]>([]);
  const [salesChannel, setSalesChannel] = useState<SalesConditionChannel[]>([]);
  const [salesCatg, setSalesCatg] = useState<SalesConditionCatg[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // State untuk Add dialog (Area, Channel, Category)
  const [showAddSalesCondition, setShowAddSalesCondition] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);
  const [existingSelectedIds, setExistingSelectedIds] = useState<number[]>([]);
  const [submitType, setSubmitType] = useState<"area" | "channel" | "catg">("area");

  // ✅ TAMBAH: State untuk Add Sales Org dialog terpisah
  const [showAddSalesOrg, setShowAddSalesOrg] = useState(false);
  const [existingSalesOrgIds, setExistingSalesOrgIds] = useState<number[]>([]);

  // State untuk delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteContext, setDeleteContext] = useState<DeleteContext>({
    offerId: 0,
    areaIds: [],
    type: "area",
  });

  // State untuk selection
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({});
  const [selectedDropdowns, setSelectedDropdowns] = useState<Set<string>>(new Set());

  // ✅ UPDATE: Function untuk extract existing IDs (tanpa org karena sudah pisah)
  const getExistingIds = useCallback(
    (type: "area" | "channel" | "catg"): number[] => {
      switch (type) {
        case "area":
          return salesAreas.map((item) => item.areaId);
        case "channel":
          return salesChannel.map((item) => item.contactChannelId);
        case "catg":
          return salesCatg.map((item) => parseInt(item.catgId.toString()));
        default:
          return [];
      }
    },
    [salesAreas, salesChannel, salesCatg]
  );

  // ✅ TAMBAH: Function untuk extract existing Sales Org IDs
  const getExistingSalesOrgIds = useCallback((): number[] => {
    return salesOrg.map((item) => item.orgId);
  }, [salesOrg]);

  // Generic fetch function to reduce code duplication
  const fetchSalesData = async (endpoint: string, setter: Function, dataType: string) => {
    try {
      const targetOfferId = offerId || rowData?.offerId || rowData?.id;

      const response = await GetData(`${API_URL_OFFER}/offer/apply/${endpoint}`, {
        offerId: targetOfferId,
        spId: 0,
      });

      if (!response?.status && response?.status !== undefined) {
        throw new Error(response?.message || `Failed to fetch ${dataType} data`);
      }

      let responseData = [];
      if (response?.data) {
        responseData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        responseData = response;
      }

      // Different validation based on data type
      const validatedData = responseData.filter((item: any) => {
        if (dataType === "sales organization") {
          return item && typeof item.orgName === "string";
        } else if (dataType === "sales channel") {
          return item && typeof item.contactChannelName === "string";
        } else if (dataType === "sales category") {
          return item && typeof item.catgName === "string";
        } else {
          return item && typeof item.areaName === "string" && typeof item.areaCode === "string";
        }
      });

      setter(validatedData);
      // console.log(`✅ Successfully loaded ${validatedData.length} ${dataType} items`);
    } catch (error: any) {
      console.error(`❌ Error fetching ${dataType}:`, error);
      toast.error(`Error loading ${dataType}: ${error.message}`);
      setter([]);
    }
  };

  // Fetch all data in parallel
  const fetchAllSalesData = async (targetOfferId: number) => {
    if (fetchedRef.current === targetOfferId) {
      return;
    }

    try {
      setLoading(true);
      fetchedRef.current = targetOfferId;

      await Promise.all([
        fetchSalesData("qry-offer-apply-area", setSalesAreas, "sales area"),
        fetchSalesData("qry-offer-apply-org", setSalesOrg, "sales organization"),
        fetchSalesData("qry-offer-apply-channel", setSalesChannel, "sales channel"),
        fetchSalesData("qry-offer-apply-catg", setSalesCatg, "sales category"),
      ]);
    } catch (error) {
      console.error("❌ Error in fetchAllSalesData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const targetOfferId = offerId || rowData?.offerId || rowData?.id;
    fetchAllSalesData(targetOfferId);
  }, [offerId, rowData?.offerId, rowData?.id]);

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // ✅ UPDATE: Handle untuk non-org items
  const handleShowAddSalesCondition = useCallback(
    (open: boolean, type: "area" | "channel" | "catg" = "area", areaId?: number) => {
      if (open) {
        const existing = getExistingIds(type);
        setExistingSelectedIds(existing);
        setSubmitType(type);
        if (areaId) {
          setSelectedAreaId(areaId);
        }
      }
      setShowAddSalesCondition(open);
    },
    [getExistingIds]
  );

  // ✅ TAMBAH: Handle khusus untuk Sales Org
  const handleShowAddSalesOrg = useCallback(
    (open: boolean, areaId?: number) => {
      if (open) {
        const existing = getExistingSalesOrgIds();
        setExistingSalesOrgIds(existing);
        if (areaId) {
          setSelectedAreaId(areaId);
        }
      }
      setShowAddSalesOrg(open);
    },
    [getExistingSalesOrgIds]
  );

  const handleDeleteItems = useCallback(
    (dropdownKey: string, items: any[]) => {
      const targetOfferId = offerId || rowData?.offerId || rowData?.id;
      const selectedSet = selectedItems[dropdownKey] || new Set();

      if (selectedSet.size === 0) {
        toast.warning("Please select items to delete");
        return;
      }

      const selectedAreaIds: number[] = [];
      selectedSet.forEach((itemId) => {
        const index = parseInt(itemId.split("-")[2]);
        const item = items[index];
        if (item) {
          if (dropdownKey === "sales-area") {
            selectedAreaIds.push(item.areaId);
          } else if (dropdownKey === "sales-org") {
            selectedAreaIds.push(item.orgId);
          } else if (dropdownKey === "sales-channel") {
            selectedAreaIds.push(item.contactChannelId);
          } else if (dropdownKey === "sales-catg") {
            selectedAreaIds.push(item.catgId);
          }
        }
      });

      if (selectedAreaIds.length === 0) {
        toast.error("No valid items selected for deletion");
        return;
      }

      let deleteType: "area" | "org" | "channel" | "catg" = "area";
      if (dropdownKey === "sales-area") {
        deleteType = "area";
      } else if (dropdownKey === "sales-org") {
        deleteType = "org";
      } else if (dropdownKey === "sales-channel") {
        deleteType = "channel";
      } else if (dropdownKey === "sales-catg") {
        deleteType = "catg";
      }

      setDeleteContext({
        offerId: targetOfferId,
        areaIds: selectedAreaIds,
        type: deleteType,
      });
      setShowDeleteDialog(true);
    },
    [selectedItems, offerId, rowData]
  );

  const handleDeleteSuccess = useCallback(() => {
    // Clear selections
    setSelectedItems({});
    setSelectedDropdowns(new Set());

    // Refresh data
    refreshSalesData();
  }, []);

  const refreshSalesData = useCallback(() => {
    const targetOfferId = offerId || rowData?.offerId || rowData?.id;

    if (targetOfferId) {
      fetchedRef.current = null;
      fetchAllSalesData(targetOfferId);
    } else {
      console.warn("⚠️ No targetOfferId found for refresh");
    }
  }, [offerId, rowData]);

  const getItemId = (item: any, index: number, keyPrefix: string) => {
    return `${keyPrefix}-${index}-${item.areaId || item.orgId || item.contactChannelId || index}`;
  };

  const handleDropdownSelectAll = useCallback(
    (dropdownKey: string, items: any[]) => {
      const isAllSelected = selectedDropdowns.has(dropdownKey);

      setSelectedDropdowns((prev) => {
        const newSet = new Set(prev);
        if (isAllSelected) {
          newSet.delete(dropdownKey);
        } else {
          newSet.add(dropdownKey);
        }
        return newSet;
      });

      setSelectedItems((prev) => {
        const newState = { ...prev };
        if (isAllSelected) {
          newState[dropdownKey] = new Set();
        } else {
          const allItemIds = items.map((item, index) => getItemId(item, index, dropdownKey));
          newState[dropdownKey] = new Set(allItemIds);
        }
        return newState;
      });
    },
    [selectedDropdowns]
  );

  const handleItemSelect = useCallback((dropdownKey: string, itemId: string, items: any[]) => {
    setSelectedItems((prev) => {
      const newState = { ...prev };
      if (!newState[dropdownKey]) {
        newState[dropdownKey] = new Set();
      }

      const newSet = new Set(newState[dropdownKey]);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      newState[dropdownKey] = newSet;

      const allItemIds = items.map((item, index) => getItemId(item, index, dropdownKey));
      const allSelected = allItemIds.every((id) => newSet.has(id));

      setSelectedDropdowns((prev) => {
        const newDropdownSet = new Set(prev);
        if (allSelected && newSet.size > 0) {
          newDropdownSet.add(dropdownKey);
        } else {
          newDropdownSet.delete(dropdownKey);
        }
        return newDropdownSet;
      });

      return newState;
    });
  }, []);

  const isDropdownAllSelected = (dropdownKey: string, items: any[]) => {
    if (items.length === 0) return false;
    const selectedSet = selectedItems[dropdownKey] || new Set();
    const allItemIds = items.map((item, index) => getItemId(item, index, dropdownKey));
    return allItemIds.every((id) => selectedSet.has(id));
  };

  const renderDropdownItems = (items: any[], keyPrefix: string, nameField: string, codeField?: string) => (
    <div className="mt-2 ml-5 bg-white border border-gray-200 rounded-md shadow-lg">
      <div className="py-1 max-h-[240px] overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, index) => {
            const itemId = getItemId(item, index, keyPrefix);
            const isSelected = selectedItems[keyPrefix]?.has(itemId) || false;

            return (
              <div
                key={itemId}
                className="flex items-center justify-between group/item px-3 py-2 hover:bg-gray-50 transition-colors duration-200 min-h-[40px]"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleItemSelect(keyPrefix, itemId, items)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="w-2 h-2 flex-shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">{item[nameField]}</span>
                    {codeField && item[codeField] !== item[nameField] && (
                      <span className="text-xs text-gray-500">{item[codeField]}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-3 py-4 text-center text-gray-500 text-sm">No items available</div>
        )}
      </div>
    </div>
  );

  const SalesConditionCard = ({
    title,
    icon,
    items,
    dropdownKey,
    nameField,
    codeField,
    addType,
    onAddClick, 
  }: {
    title: string;
    icon: string;
    items: any[];
    dropdownKey: string;
    nameField: string;
    codeField?: string;
    addType: "area" | "org" | "channel" | "catg";
    onAddClick?: () => void; 
  }) => {
    const isAllSelected = isDropdownAllSelected(dropdownKey, items);
    const selectedCount = selectedItems[dropdownKey]?.size || 0;

    const handleAddClick = () => {
      if (onAddClick) {
        onAddClick(); // ✅ Use custom handler if provided
      } else {
        // ✅ Default handler untuk non-org items
        handleShowAddSalesCondition(true, addType as "area" | "channel" | "catg");
      }
    };

    return (
      <div className="bg-white border rounded-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs">{icon}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            {selectedCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{selectedCount} selected</span>
            )}
          </div>
        </div>
        <div className="p-4 bg-white flex-1 flex flex-col min-h-[200px]">
          <div className="flex-1">
            {loading ? (
              <div className="text-center text-gray-500 text-sm py-8">Loading...</div>
            ) : items.length > 0 ? (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => handleDropdownSelectAll(dropdownKey, items)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <button
                    onClick={() => toggleDropdown(dropdownKey)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    📁 <span>Include</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdowns.has(dropdownKey) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {openDropdowns.has(dropdownKey) && renderDropdownItems(items, dropdownKey, nameField, codeField)}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-8">No record to view</div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4 flex-shrink-0">
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus} className="flex-1">
            <Button
              className="flex-1 flex items-center justify-center gap-1 transition-colors duration-200 text-blue-600 hover:bg-blue-50 w-full border bg-gray-100 border-gray-400 p-1 rounded font-medium text-sm"
              size={"sm"}
              onClick={handleAddClick}
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
            </AccessWrapper>
            <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus} className="flex-1">
            <Button
              className="flex-1 flex w-full items-center cursor-pointer justify-center gap-1 transition-colors duration-200 text-red-600 hover:bg-red-50 border bg-gray-100 border-gray-400 p-1 rounded font-medium text-sm"
              size={"sm"}
              onClick={() => handleDeleteItems(dropdownKey, items)}
              disabled={selectedCount === 0}
            >
              <Trash className="w-3 h-3" />
              Delete
            </Button>
            </AccessWrapper>
          </div>
        </div>
      </div>
    );
  };

  const targetOfferId = offerId || rowData?.offerId || rowData?.id;

  useEffect(() => {console.log("Target offerId: ", targetOfferId)},[targetOfferId])

  return (
    <div className="space-y-6">
      {!targetOfferId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm text-yellow-800">
              No offerId provided. Make sure the component receives either an offerId prop or rowData with offerId.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <SalesConditionCard
          title="Sales Area"
          icon="🌍"
          items={salesAreas}
          dropdownKey="sales-area"
          nameField="areaName"
          codeField="areaCode"
          addType="area"
        />

        {/* ✅ UPDATE: Sales Organization menggunakan custom onAddClick */}
        <SalesConditionCard
          title="Sales Organization"
          icon="🏢"
          items={salesOrg}
          dropdownKey="sales-org"
          nameField="orgName"
          addType="org"
          onAddClick={() => handleShowAddSalesOrg(true, selectedAreaId)}
        />

        <SalesConditionCard
          title="Sales Channel"
          icon="📢"
          items={salesChannel}
          dropdownKey="sales-channel"
          nameField="contactChannelName"
          addType="channel"
        />

        <SalesConditionCard
          title="Sales Category"
          icon="📊"
          items={salesCatg}
          dropdownKey="sales-catg"
          nameField="catgName"
          addType="catg"
        />
      </div>

      {/* ✅ UPDATE: AddSalesCondition hanya untuk area, channel, catg */}
      <AddSalesCondition
        isOpen={showAddSalesCondition}
        onClose={() => setShowAddSalesCondition(false)}
        areaId={selectedAreaId}
        offerId={targetOfferId || 0}
        onSuccess={refreshSalesData}
        submitType={submitType}
        existingSelectedIds={existingSelectedIds}
      />

      {/* ✅ TAMBAH: AddSalesOrg terpisah untuk sales organization */}
      <AddSalesOrg
        isOpen={showAddSalesOrg}
        onClose={() => setShowAddSalesOrg(false)}
        areaId={selectedAreaId}
        offerId={targetOfferId || 0}
        onSuccess={refreshSalesData}
        existingSelectedIds={existingSalesOrgIds}
      />

      <DeleteSalesCondition
        offerId={deleteContext.offerId}
        areaId={deleteContext.areaIds.length === 1 ? deleteContext.areaIds[0] : deleteContext.areaIds}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDeleteSuccess={handleDeleteSuccess}
        type={deleteContext.type}
      />
    </div>
  );
};

export default SalesConditionTabContent;
