import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AddFeatureGroupMemDialog from "../blocks/AddFeatureGroupMemDialog";
import { boolean } from "yup";
import { constants } from "fs/promises";

interface FeatureGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureGroupMemData {
  attrName: string;
  attrId: number;
  operation: string;
}

type ModalMode = "detail" | "add";

const FeatureGroupDialog: React.FC<FeatureGroupDialogProps> = ({ isOpen, onClose }) => {
  const dataDummmy: FeatureGroupMemData[] = [];

  const [featureGroupMem, setFeatureGroupMem] = useState<FeatureGroupMemData[]>(dataDummmy);
  const [currentMode, setCurrentMode] = useState<ModalMode>("detail");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  // const offerId = rowData.offerId;
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedFeatureGroup, setSelectedFeatureGroup] = useState<FeatureGroupMemData | null>(null);
  const initialFormData = {
    featureGroupName: "",
    checkRule: "",
    comments: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleShowAddFeatureGroupMem = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
  }, []);

  const handleAddMode = () => {
    setIsAddMode(true);
  };

  useEffect(() => {
    if (isOpen) {
      setIsAddMode(false);
    }
  }, [isOpen]);

  const handleAddFeature = useCallback((selectedFeatures: any[]) => {
    // console.log("Selected features to add:", selectedFeatures);

    // Convert selected features dari AddFeatureDialog ke format FeatureData
    const newFeatures = selectedFeatures.map((feature, index) => ({
      id: `new_${Date.now()}_${index}`, // Generate unique ID
      featureName: feature.name,
      csrVisible: feature.code,
      instantiation: "Basic", // Default value
      defaultValue: feature.name, // atau bisa menggunakan feature.description jika ada
      operation: "Medium", // Default value
      status: "Active", // Default
    }));

    // Tambahkan features baru ke state
    // setFeatures((prevFeatures) => [...prevFeatures, ...newFeatures]);

    // Tutup dialog
    setIsAddDialogOpen(false);

    // Optional: Show success message
    // console.log(`Successfully added ${newFeatures.length} feature(s) via Add Dialog`);
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    // setSelectedItem(null);
    // setSearchTerm("");
    // setCurrentPage(1);
    if (onClose) onClose();
  };

  const handleSelectFeatureGroup = (row: FeatureGroupMemData) => {
    setSelectedFeatureGroup(row);
  };

  const Columns = useMemo<ColumnDef<FeatureGroupMemData>[]>(
    () => [
      {
        accessorFn: (row) => row.attrName,
        id: "attrName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Feature Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.attrId,
        id: "attrId",
        header: ({ column }) => <DataGridColumnHeader className="" title="Feature ID" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.operation,
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operations" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    []
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      let processedData: FeatureGroupMemData[] = [...featureGroupMem];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof FeatureGroupMemData];
          const bValue = b[id as keyof FeatureGroupMemData];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
          }

          if (aValue < bValue) return desc ? 1 : -1;
          if (aValue > bValue) return desc ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: processedData.slice((page - 1) * limit, page * limit),
        totalCount: processedData.length,
      };
    },
    [featureGroupMem]
  );

  const OfferStatusToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center p-4">
      <div className="flex gap-3">
        <DefaultTooltip title="Add Data" placement="top">
          <Button variant="outline" className="h-7.5" disabled={!isAddMode} onClick={() => handleShowAddFeatureGroupMem(true)}>
            <KeenIcon icon="plus" />
            Add
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="bg-gray-100 px-4 py-3 border-b flex-row justify-between items-center space-y-0">
            <DialogTitle className="flex items-center text-lg font-semibold text-gray-800">
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 pr-2">
                <KeenIcon icon="left" />
              </button>
              Feature Group
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 flex-1 min-h-0 p-4">
            {/* Left Panel - Feature List */}
            <div className="w-1/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0">
              {/* Header */}
              <div className="p-3 border-b">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-800">Feature Group</span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleAddMode} className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600" title="New">
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 text-center text-gray-500">No record to view</div>
            </div>

            {/* Right Panel - Feature Details/Form */}
            <div className="w-2/3 bg-white border border-gray-200 rounded shadow-sm flex flex-col min-h-0 overflow-auto">
              {/* Header info with close button */}
              <div className="bg-gray-50 p-4 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Feature Group Detail</h3>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Row 1 - Feature Group Name */}
                <div className="grid grid-cols-1 gap-8 p-3">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Feature Group Name:</span>
                    {isAddMode ? (
                      <textarea name="featureGroupName" value={formData.featureGroupName} onChange={handleInputChange} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-600">{formData.featureGroupName || "-"}</span>
                    )}
                  </div>
                </div>

                {/* Row 2 - Check Rule */}
                <div className="grid grid-cols-1 gap-8 p-3">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Check Rule:</span>
                    {isAddMode ? (
                      <textarea name="checkRule" value={formData.checkRule} onChange={handleInputChange} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-600">{formData.checkRule || "-"}</span>
                    )}
                  </div>
                </div>

                {/* Row 3 - Remarks */}
                <div className="grid grid-cols-1 gap-8 p-3">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Remarks:</span>
                    {isAddMode ? (
                      <textarea name="comments" value={formData.comments} onChange={handleInputChange} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-600">{formData.comments || "-"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Grid with card layout */}
              <div className="p-4">
                {/* Row 4 - Feature Group Member */}
                <div className="grid grid-cols-1 gap-8 p-2">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                    <span className="text-sm text-gray-800">Feature Group Member:</span>
                  </div>
                </div>
                <DataGridProvider
                  columns={Columns}
                  pagination={{ size: 10 }}
                  toolbar={<OfferStatusToolbar />}
                  layout={{ card: true }}
                  sorting={[{ id: "valueName", desc: false }]}
                  serverSide={true}
                  onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                    return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
                  }}
                ></DataGridProvider>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                {isAddMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        // submit logic
                        // console.log("Submit add feature group member");
                        setIsAddMode(false);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddMode(false)} // cancel balik ke detail mode
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      // onClick={() => console.log("Edit feature group", selectedFeatureGroup)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!selectedFeatureGroup} // aktif cuma kalau ada yang dipilih
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      // onClick={() => console.log("Delete feature group", selectedFeatureGroup)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={!selectedFeatureGroup} // delete juga aktif kalau ada yg dipilih
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddFeatureGroupMemDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddFeature} onSuccess={() => setReloadKey((prev) => prev + 1)} />
    </>
  );
};

export default FeatureGroupDialog;
