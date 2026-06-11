import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { Button } from "@/components/ui/button";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

interface AddBelongInPackageProps {
  isOpen?: boolean;
  onClose?: () => void;
  offerId: string | number;
  onSave?: (selectedBelong: BelongData[]) => void;
  onSuccess?: () => void;
  rowData?: any;
  countBelongInPackage: () => Promise<void>;
}

interface BelongData {
  offerId: number;
  offerName: string;
  pricePlanId: number;
  pricePlanType: string | number;
  defaultFlag: string;
  operFlag: string;
}

interface AddBelongPackage {
  networkType: string;
  dependProdPackage: {
    dependProdPackageId: number;
    memDependProdSpecId: number;
    spId: number;
    operFlag: string;
    defaultFlag: string;
    seq: number;
  }[];
}

const API_URL_OFFER = apiConfigOffer.offer;

const AddDataBelongInPackageDialog: React.FC<AddBelongInPackageProps> = ({
  isOpen,
  onClose = () => { },
  onSave,
  onSuccess,
  rowData,
  offerId,
  countBelongInPackage
}) => {
  const { GetData, PostData } = useCallApi();
  const [selectedBelong, setSelectedBelong] = useState<BelongData[]>([]);
  const [belongPackage, setBelongPackage] = useState<BelongData[]>([]);
  const [initialSelectedBelongPackage, setInitialSelectedBelongPackage] = useState<BelongData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredPackage, setFilteredPackage] = useState<BelongData[]>([]);
  const [existingBelongs, setExistingBelongs] = useState<BelongData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch available packages untuk ditambahkan
  const fetchingAddBelongList = useCallback(async () => {
    setLoading(true);
    try {
      // const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-prod-packages-by-network-type`, {
      //   networkType: "G",
      // });

      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-all-price-plan-packages`, {
        pricePlanId: offerId,
      });

      // console.log(response);

      const result = response?.data ?? [];

      // const mappedResult: BelongData[] = result.map((item: any) => ({
      //   pricePlanPackageId: item.pricePlanPackageId,
      //   offerId: item.dependProdSpecId,
      //   offerName: item.offerName,
      //   defaultFlag: "N",
      //   operFlag: "A",
      //   networkType: item.networkType,
      //   networkTypeName: item.networkTypeName,
      // }));

      const mappedResult: BelongData[] = result.map((item: any) => ({
        offerId: item.offerId,
        offerName: item.offerName,
        pricePlanId: item.pricePlanId,
        pricePlanType: item.pricePlanType,
      }));

      setBelongPackage(mappedResult);
    } catch (err) {
      console.error("Error fetching depend package:", err);
      setError("Failed to load depend package details");
      toast.error("Failed to load depend package details");
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  const closePopUp = () => {
    setSearchTerm("");
    setBelongPackage([]);
    setSelectedBelong([]);
    setInitialSelectedBelongPackage([]);
    setExistingBelongs([]);
    onClose();
  };

  const handleBelongPackageToggle = useCallback((BelongPackage: BelongData) => {
    setSelectedBelong((prev) => {
      const isSelected = prev.some((f) => f.offerId.toString() === BelongPackage.offerId.toString());

      if (isSelected) {
        return prev.filter((f) => f.offerId.toString() !== BelongPackage.offerId.toString());
      } else {
        return [...prev, { ...BelongPackage }];
      }
    });
  }, []);

  const handleSelectAll = useCallback(
    (currentPageData: BelongData[]) => {
      const allIds = currentPageData.map((f) => f.offerId.toString());
      const allSelected = allIds.every((id) => selectedBelong.some((f) => f.offerId.toString() === id));

      if (allSelected) {
        // Unselect all current page items
        setSelectedBelong((prev) => prev.filter((f) => !allIds.includes(f.offerId.toString())));
      } else {
        // Select all current page items that aren't already selected
        const newSelections = currentPageData.filter(
          (f) => !selectedBelong.some((sf) => sf.offerId.toString() === f.offerId.toString())
        );
        setSelectedBelong((prev) => [...prev, ...newSelections]);
      }
    },
    [selectedBelong]
  );

  // Load existing belongs yang sudah ada
  const loadExistingBelongs = useCallback(async () => {
    const currentOfferId = offerId || rowData?.offerId || rowData?.id;

    if (!currentOfferId) {
      console.warn("❗ No offerId provided, skipping existing belongs load");
      return;
    }

    try {
      // const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-plan-join-package`, {
      //   pricePlanId: currentOfferId,
      // });

      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-plan-join-package`, {
        pricePlanId: currentOfferId,
      });

      let existingData: any[] = [];

      if (Array.isArray(response)) {
        existingData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        existingData = response.data;
      }

      // console.log("📥 Existing belongs raw data:", existingData);

      const transformedExisting: BelongData[] = existingData.map((item) => ({
        offerId: item.offerId,
        offerName: item.offerName,
        pricePlanId: item.memPricePlanId, // Assuming memPricePlanId is the correct value for pricePlanId
        pricePlanType: item.pricePlanType ?? "", // Provide a fallback if pricePlanType is missing
        defaultFlag: item.defaultFlag ?? "N",
        operFlag: "M",
      }));

      // console.log("📥 Transformed existing belongs:", transformedExisting);

      setExistingBelongs(transformedExisting);
      setSelectedBelong(transformedExisting);
      setInitialSelectedBelongPackage(transformedExisting);
    } catch (err) {
      console.error("❌ Error loading existing belongs:", err);
      setExistingBelongs([]);
      setSelectedBelong([]);
      setInitialSelectedBelongPackage([]);
    }
  }, [GetData, offerId, rowData]);

  // Handle default flag change for selected items
  const handleDefaultFlagChange = useCallback((belongId: number, newDefaultFlag: string) => {
    setSelectedBelong((prev) =>
      prev.map((item) => (item.offerId === belongId ? { ...item, defaultFlag: newDefaultFlag } : item))
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    const currentOfferId = offerId || rowData?.offerId || rowData?.id; // Ini adalah 72 (package utama)

    if (!currentOfferId) {
      toast.error("No package id provided");
      return;
    }

    const added = selectedBelong.filter(
      (sel) => !initialSelectedBelongPackage.some((init) => init.pricePlanId === sel.pricePlanId)
    );
    const removed = initialSelectedBelongPackage.filter(
      (init) => !selectedBelong.some((sel) => sel.pricePlanId === init.pricePlanId)
    );
    const modified = selectedBelong.filter((sel) => {
      const initialItem = initialSelectedBelongPackage.find((init) => init.pricePlanId === sel.pricePlanId);
      return initialItem && initialItem.defaultFlag !== sel.defaultFlag;
    });

    if (added.length === 0 && removed.length === 0 && modified.length === 0) {
      toast.info("No changes detected");
      closePopUp();
      return;
    }

    try {
      setLoading(true);
      const payloadItems = [];

      // 1. New items → operFlag "A"
      if (added.length > 0) {
        payloadItems.push(
          ...added.map((item, index) => ({
            pricePlanPackageId: item.pricePlanId,
            memPricePlanId: Number(currentOfferId),
            seq: index + 1,
            spId: 0,
            operFlag: "A",
            defaultFlag: item.defaultFlag ?? "N"
          }))
        );
      }

      // 2. Modified items → operFlag "M"
      if (modified.length > 0) {
        payloadItems.push(
          ...modified.map((item, index) => ({
            pricePlanPackageId: item.pricePlanId,
            memPricePlanId: Number(currentOfferId),
            seq: added.length + index + 1,
            spId: 0,
            operFlag: "M",
            defaultFlag: item.defaultFlag ?? "N",
          }))
        );
      }

      // 3. Removed items → operFlag "D"
      if (removed.length > 0) {
        payloadItems.push(
          ...removed.map((item, index) => ({
            pricePlanPackageId: item.pricePlanId,
            memPricePlanId: Number(currentOfferId),
            seq: added.length + modified.length + index + 1,
            spId: 0,
            operFlag: "D",
            defaultFlag: item.defaultFlag ?? "N",
          }))
        );
      }

      // console.log("payload items ", payloadItems);

      // const payload = {
      //   // networkType: "G",
      //   dependProdPackage: payloadItems,
      // };

      // console.log("📤 CORRECTED Submit payload:", JSON.stringify(payload, null, 2));

      const response = await PostData(`${API_URL_OFFER}/offer/price-plan/join-price-plan-package`, payloadItems);
      // console.log("📥 Submit response:", response);

      toast.success("Belong Package updated successfully");
      onSave?.(selectedBelong);

      // setTimeout(() => {
      //   onSuccess?.();
      // }, 500);
      if (onSave) {
        onSave(selectedBelong);
      }

      // // ✅ CRITICAL FIX: Call onSuccess to trigger parent reload
      if (onSuccess) {
        onSuccess();
      }
      countBelongInPackage();

      closePopUp();
    } catch (err) {
      console.error("❌ Error updating belong package:", err);
      toast.error("Failed to update belong package memberships");
    } finally {
      setLoading(false);
    }
  }, [selectedBelong, initialSelectedBelongPackage, offerId, rowData, PostData, onSave, onSuccess]);

  // Columns for available packages (left panel)
  const column = useMemo<ColumnDef<BelongData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const currentPageData = table.getRowModel().rows.map((row) => row.original);
          const allIds = currentPageData.map((f) => f.offerId.toString());
          const allSelected =
            allIds.length > 0 && allIds.every((id) => selectedBelong.some((f) => f.offerId.toString() === id));

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
          const belongPackage = row.original;
          const isChecked = selectedBelong.some((item) => item.offerId === belongPackage.offerId);

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleBelongPackageToggle(belongPackage)}
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
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Name" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const belongPackage = row.original;
          const isExisting = existingBelongs.some((item) => item.offerId === belongPackage.offerId);

          return <div className={isExisting ? "text-gray-600 font-medium" : ""}>{belongPackage.offerName}</div>;
        },
      },
      {
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const belongPackage = row.original;
          const isSelected = selectedBelong.some((item) => item.offerId === belongPackage.offerId);

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleBelongPackageToggle(belongPackage)}
                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                title={isSelected ? "Remove from selection" : "Add to selection"}
              >
                <KeenIcon icon={isSelected ? "minus" : "plus"} className="text-sm" />
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
    [selectedBelong, existingBelongs, handleBelongPackageToggle, handleSelectAll]
  );

  // Columns for selected packages (right panel)
  const selectColumns = useMemo<ColumnDef<BelongData>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Name" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const belongPackage = row.original;
          const isExisting = existingBelongs.some((item) => item.offerId === belongPackage.offerId);

          return <div className={isExisting ? "text-gray-600 font-medium" : ""}>{belongPackage.offerName}</div>;
        },
      },
      {
        accessorFn: (row) => row.defaultFlag,
        id: "defaultFlag",
        header: ({ column }) => <DataGridColumnHeader className="" title="Default Value" column={column} />,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const belongPackage = row.original;

          return (
            <Select
              value={belongPackage.defaultFlag}
              onValueChange={(value) => handleDefaultFlagChange(belongPackage.offerId, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Yes</SelectItem>
                <SelectItem value="N">No</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const belongPackage = row.original;

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleBelongPackageToggle(belongPackage)}
                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                title="Remove from selection"
              >
                <KeenIcon icon="minus" className="text-sm" />
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
    [handleBelongPackageToggle, existingBelongs, handleDefaultFlagChange]
  );

  // Filter packages based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPackage(belongPackage);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredPackage(belongPackage.filter((item) => item.offerName?.toLowerCase().includes(lowerSearch)));
    }
  }, [belongPackage, searchTerm]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        await loadExistingBelongs();
        await fetchingAddBelongList();
      };

      loadData();
    } else {
      // Reset state when modal closes
      setSearchTerm("");
      setSelectedBelong([]);
      setInitialSelectedBelongPackage([]);
      setExistingBelongs([]);
      setBelongPackage([]);
      setFilteredPackage([]);
      setError(null);
    }
  }, [isOpen, loadExistingBelongs, fetchingAddBelongList]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closePopUp();
      }}
    >
      <DialogContent className="max-w-7xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium">Join Package</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 flex flex-col mb-5">
          <div className="flex flex-1 gap-4 min-h-0">
            {/* Left panel - Available offers */}
            <div className="flex-1 flex flex-col min-h-0 pr-4">
              <div className="flex w-full gap-3 items-center py-5">
                {/* <div className="text-sm font-medium">Available Offer</div>
                <label className="input input-sm flex-1 flex items-center">
                  <KeenIcon icon="magnifier" />
                  <input
                    type="text"
                    placeholder="Search offer name..."
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="text-sm text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  )}
                </label> */}
              </div>

              {loading && <Loading />}
              {error && <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded">{error}</div>}

              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider columns={column} pagination={{ size: 10 }} data={filteredPackage} />
              </div>
            </div>

            {/* Right panel - Selected packages */}
            <div className="flex-1 flex flex-col">
              <div className="text-sm font-medium py-6 mb-1 flex justify-between items-center">
                <span>Selected Package ({selectedBelong.length})</span>
                {selectedBelong.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBelong(initialSelectedBelongPackage);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                <DataGridProvider columns={selectColumns} data={selectedBelong} pagination={{ size: 10 }} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            {selectedBelong.length > 0 && <span>{selectedBelong.length} package(s) selected</span>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closePopUp} disabled={loading}>
              Cancel
            </Button>
            <Button variant="default" disabled={loading || selectedBelong.length === 0} onClick={handleSubmit}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataBelongInPackageDialog;