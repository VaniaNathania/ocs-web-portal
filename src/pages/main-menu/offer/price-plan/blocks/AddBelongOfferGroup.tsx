import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState, useEffect } from "react";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AddBelongOfferGroupProps {
  isOpen?: boolean;
  onClose?: () => void;
  rowData?: any;
  onSave?: (selectedGroups: AddBelongGroupData[]) => void;
  onSuccess?: () => void; // Add callback for reload
  countBelongInOfferGroup: () => Promise<void>;
}

interface AddBelongGroupData {
  offerGroupId: number;
  offerGroupName: string;
  offerGroupType: string;
  groupType?: string;
  shareFlag?: string;
  parentOfferGroupId?: number | null;
}

interface OfferGroupMember {
  offerGroupMemId?: number;
  offerGroupId: number;
  offerId: number;
  childOfferGroupId?: number;
  agreementPeriod?: number;
  timeUnit?: string;
  seq?: number;
  spId?: number;
  defaultFlag?: string;
  hideFlag?: string;
  agreementEffType?: string;
  upperLimit?: number;
  lowerLimit?: number;
  defaultNum?: number;
  groupType: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const AddBelongOfferGroup: React.FC<AddBelongOfferGroupProps> = ({
  isOpen,
  onClose = () => { },
  rowData,
  onSave,
  onSuccess, // This callback will trigger parent reload
  countBelongInOfferGroup
}) => {
  const { GetData, PutData } = useCallApi();
  const [selectedBelongGroup, setSelectedBelongGroup] = useState<AddBelongGroupData[]>([]);
  const [initialSelectedBelongGroup, setInitialSelectedBelongGroup] = useState<AddBelongGroupData[]>([]);
  const [availableGroups, setAvailableGroups] = useState<AddBelongGroupData[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<AddBelongGroupData[]>([]);
  const [existingBelongs, setExistingBelongs] = useState<AddBelongGroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const closePopUp = () => {
    setSearchTerm("");
    setSelectedBelongGroup([]);
    setInitialSelectedBelongGroup([]);
    onClose();
  };

  const handleBelongGroupToggle = useCallback((BelongGroup: AddBelongGroupData) => {
    setSelectedBelongGroup((prev) => {
      const isSelected = prev.some((f) => f.offerGroupId.toString() === BelongGroup.offerGroupId.toString());
      // console.log("✅ Is Selected Before Click:", isSelected);

      if (isSelected) {
        // console.log("❌ Removing BelongGroup:", BelongGroup.offerGroupId);
        const updated = prev.filter((f) => f.offerGroupId.toString() !== BelongGroup.offerGroupId.toString());
        // console.log("➡️ After Removal - Selected Features:", updated);
        return updated;
      } else {
        // console.log("➕ Adding BelongGroup:", BelongGroup.offerGroupId);
        const updated = [...prev, { ...BelongGroup }];
        // console.log("➡️ After Addition - Selected Features:", updated);
        return updated;
      }
    });
  }, []);

  const handleSelectAll = useCallback(
    (currentPageData: AddBelongGroupData[]) => {
      const allIds = currentPageData.map((f) => f.offerGroupId.toString());
      const allSelected = allIds.every((id) => selectedBelongGroup.some((f) => f.offerGroupId.toString() === id));

      if (allSelected) {
        setSelectedBelongGroup((prev) =>
          prev.filter(
            (f) =>
              !allIds.includes(f.offerGroupId.toString()) ||
              initialSelectedBelongGroup.some(
                (initial) => initial.offerGroupId.toString() === f.offerGroupId.toString()
              )
          )
        );
      } else {
        const newSelections = currentPageData.filter(
          (f) => !selectedBelongGroup.some((sf) => sf.offerGroupId.toString() === f.offerGroupId.toString())
        );
        setSelectedBelongGroup((prev) => [...prev, ...newSelections]);
      }
    },
    [selectedBelongGroup, initialSelectedBelongGroup]
  );

  const loadExistingBelongs = useCallback(async () => {
    if (!rowData?.offerId && !rowData?.id) {
      console.warn("❗ No offerId provided, skipping existing belongs load");
      return;
    }

    const offerId = rowData.offerId || rowData.id;

    try {
      // console.log("🔄 Loading existing belongs for offerId:", offerId);

      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-group-mem-by-offer-id`, {
        offerId: offerId,
      });

      // console.log("📡 Existing Belongs Response:", response);

      let existingData: AddBelongGroupData[] = [];

      if (Array.isArray(response)) {
        existingData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        existingData = response.data;
      }

      const transformedExisting = existingData.map((item) => ({
        offerGroupId: item.offerGroupId,
        offerGroupName: item.offerGroupName,
        offerGroupType: item.offerGroupType || "3",
        groupType: item.groupType || "c",
      }));

      // console.log("✅ Transformed Existing Belongs:", transformedExisting);

      setExistingBelongs(transformedExisting);
      setSelectedBelongGroup(transformedExisting);
      setInitialSelectedBelongGroup(transformedExisting);
    } catch (error) {
      console.error("❌ Error loading existing belongs:", error);
      setExistingBelongs([]);
      setSelectedBelongGroup([]);
      setInitialSelectedBelongGroup([]);
    }
  }, [GetData, rowData]);

  const doGetListData = useCallback(async () => {
    setLoading(true);
    try {
      // console.log("🚀 Starting API call...");

      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-group-with-parent`, {
        offerGroupType: 4,
        networkType: "G",
        spId: 0,
      });

      // console.log("📡 Raw API Response:", response);

      let data: AddBelongGroupData[] = [];

      if (Array.isArray(response)) {
        data = response;
        // console.log("✅ Direct array response");
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
        // console.log("✅ Response.data array");
      }

      // console.log("✅ Parsed Data for Grid:", data);
      setAvailableGroups(data);

      return {
        data,
        totalCount: data.length,
      };
    } catch (error) {
      console.error("❌ Available Features API Error:", error);
      toast.error("Error loading available feature data");
      setAvailableGroups([]);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  useEffect(() => {
    let filtered = availableGroups;

    if (searchTerm.trim()) {
      filtered = filtered.filter((group) => group.offerGroupName.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredGroups(filtered);
  }, [availableGroups, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      // console.log("🔄 Dialog opened, loading data...");

      const loadData = async () => {
        await loadExistingBelongs();
        await doGetListData();
      };

      loadData();
    } else {
      // Reset state when dialog closes
      setSearchTerm("");
      setSelectedBelongGroup([]);
      setInitialSelectedBelongGroup([]);
      setExistingBelongs([]);
      setAvailableGroups([]);
      setFilteredGroups([]);
    }
  }, [isOpen, loadExistingBelongs, doGetListData]);

  // Fixed submit handler with proper callback
  const handleSubmit = useCallback(async () => {
    if (!rowData?.offerId && !rowData?.id) {
      toast.error("No offer ID provided");
      return;
    }

    const offerId = rowData.offerId || rowData.id;

    // Check if there are any changes
    const hasChanges =
      selectedBelongGroup.length !== initialSelectedBelongGroup.length ||
      selectedBelongGroup.some(
        (selected) => !initialSelectedBelongGroup.some((initial) => initial.offerGroupId === selected.offerGroupId)
      );

    if (!hasChanges) {
      toast.info("No changes detected");
      closePopUp();
      return;
    }

    try {
      setLoading(true);

      const offerGroupMemRequest: OfferGroupMember[] = selectedBelongGroup.map((group, index) => ({
        offerGroupId: group.offerGroupId,
        offerId: Number(offerId),
        groupType: group.groupType || "c",
        // Add default values for required fields
        defaultFlag: "N",
        seq: index + 1,
      }));

      const payload = {
        offerId: Number(offerId),
        offerGroupMemRequest: offerGroupMemRequest,
        offerGroupType: 3,
      };

      // console.log("🚀 Sending payload to unified API:", payload);

      const response = await PutData(`${API_URL_OFFER}/offer/group/join-offer-group`, payload);

      // console.log("✅ API Response:", response);

      toast.success("Offer group memberships updated successfully");

      // Call parent callbacks to trigger reload
      if (onSave) {
        onSave(selectedBelongGroup);
      }

      // ✅ CRITICAL FIX: Call onSuccess to trigger parent reload
      if (onSuccess) {
        onSuccess();
      }

      countBelongInOfferGroup();

      closePopUp();
    } catch (error) {
      console.error("❌ Error updating offer group memberships:", error);
      toast.error("Failed to update offer group memberships");
    } finally {
      setLoading(false);
    }
  }, [selectedBelongGroup, initialSelectedBelongGroup, rowData, PutData, onSave, onSuccess]);

  const column = useMemo<ColumnDef<AddBelongGroupData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const currentPageData = table.getRowModel().rows.map((row) => row.original);
          const allIds = currentPageData.map((f) => f.offerGroupId.toString());
          const allSelected =
            allIds.length > 0 &&
            allIds.every((id) => selectedBelongGroup.some((f) => f.offerGroupId.toString() === id));

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                checked={allSelected}
                onChange={() => handleSelectAll(currentPageData)}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const belongGroup = row.original;
          const isChecked = selectedBelongGroup.some((item) => item.offerGroupId === belongGroup.offerGroupId);

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleBelongGroupToggle(belongGroup)}
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[80px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.offerGroupName,
        id: "offerGroupName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Group Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const belongGroup = row.original;
          const isExisting = existingBelongs.some((item) => item.offerGroupId === belongGroup.offerGroupId);

          return <div className={isExisting ? "text-gray-600 font-medium" : ""}>{belongGroup.offerGroupName}</div>;
        },
      },
      {
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const BelongGroup = row.original;
          const isSelected = selectedBelongGroup.some((item) => item.offerGroupId === BelongGroup.offerGroupId);

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleBelongGroupToggle(BelongGroup)}
                className={`w-6 h-6 flex items-center justify-center border border-gray-300 rounded`}
                title={isSelected ? "Remove from selection" : "Add to selection"}
              >
                <KeenIcon icon={isSelected ? "minus" : "plus"} />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[80px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [selectedBelongGroup, existingBelongs, handleBelongGroupToggle, handleSelectAll]
  );

  const selectedColumns = useMemo<ColumnDef<AddBelongGroupData>[]>(
    () => [
      {
        accessorFn: (row) => row.offerGroupName,
        id: "offerGroupName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Group Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const belongGroup = row.original;
          const isExisting = existingBelongs.some((item) => item.offerGroupId === belongGroup.offerGroupId);

          return <div className={isExisting ? "text-gray-600 font-medium" : ""}>{belongGroup.offerGroupName}</div>;
        },
      },
      {
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const BelongGroup = row.original;
          const isExisting = existingBelongs.some((item) => item.offerGroupId === BelongGroup.offerGroupId);

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleBelongGroupToggle(BelongGroup)}
                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded cursor-pointer"
              // disabled={isExisting}
              // title={isExisting ? "Cannot remove existing group" : "Remove from selection"}
              >
                <KeenIcon icon="minus" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[80px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleBelongGroupToggle, existingBelongs]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closePopUp();
      }}
    >
      <DialogContent className="max-w-7xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium">Join Offer Group</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 flex flex-col mb-5">
          <div className="flex flex-1 gap-4 min-h-0">
            {/* Left Panel */}
            <div className="flex-1 border-r flex flex-col min-h-0 pr-4">
              <div className="flex w-full gap-3 items-center py-5">
                <div className="text-sm">Group Name</div>
                <label className="input input-sm flex-1 flex items-center">
                  <KeenIcon icon="magnifier" />
                  <input
                    type="text"
                    placeholder="Search Group Name..."
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="text-sm text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  )}
                </label>
              </div>

              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider columns={column} pagination={{ size: 10 }} data={filteredGroups} />
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="text-sm font-medium py-6 mb-1 flex justify-between items-center">
                <span>Selected Groups ({selectedBelongGroup.length})</span>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider columns={selectedColumns} data={selectedBelongGroup} pagination={{ size: 10 }} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex justify-between items-center">
          <div className="flex justify-end w-full gap-2">
            <Button variant="outline" onClick={closePopUp} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBelongOfferGroup;
