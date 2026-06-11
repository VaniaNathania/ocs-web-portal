import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { FeatureData } from "../../DetailCategoryContent/FeatureTabContent";
import { ListToolBarFeatureGroup } from "./ListToolBarFeatureGroup";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface AddFilterFeatureDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onAdd: (selectedFeatures: FeatureData[]) => void;
  data: any;
  offerId?: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const AddFilterFeatureDialog: React.FC<AddFilterFeatureDialogProps> = ({
  isOpen: externalIsOpen,
  onClose,
  onOpenChange: externalOnOpenChange,
  onAdd,
  offerId,
  data,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureData[]>([]);
  const [initialSelectedFeatures, setInitialSelectedFeatures] = useState<
    FeatureData[]
  >([]);
  const { GetData } = useCallApi();
  const [isSelectedDataLoaded, setIsSelectedDataLoaded] = useState(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{
    selectedValues: string[];
    defaultValue: string | null;
  }>({ selectedValues: [], defaultValue: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine if we're using external or internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }

    if (!open && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFeatures([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      //  console.log("data add filter feature", data);
    }
    //  console.log("DATA ADD FILTER FEATURE : ", selectedFeatures);
  }, [selectedFeatures]);

  const handleFeatureToggle = useCallback(
    (feature: FeatureData) => {
      setSelectedFeatures((prev) => {
        const isSelected = prev.some(
          (f) => f.attrId.toString() === feature.attrId.toString(),
        );

        if (isSelected) {
          const updated = prev.filter(
            (f) => f.attrId.toString() !== feature.attrId.toString(),
          );
          return updated;
        } else {
          const updated = [...prev, { ...feature, selected: true }];
          return updated;
        }
      });
    },
    [initialSelectedFeatures],
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    } else {
      setIsSelectedDataLoaded(false);
      setSelectedFeatures([]);
      setInitialSelectedFeatures([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [searchTerm]);

  const handleSelectAll = useCallback(
    (currentPageData: FeatureData[]) => {
      const allIds = currentPageData.map((f) => f.attrId.toString());
      const allSelected = allIds.every((id) =>
        selectedFeatures.some((f) => f.attrId.toString() === id),
      );

      if (allSelected) {
        // Remove only the ones from current page
        setSelectedFeatures((prev) =>
          prev.filter(
            (f) =>
              !allIds.includes(f.attrId.toString()) ||
              initialSelectedFeatures.some(
                (initial) => initial.attrId.toString() === f.attrId.toString(),
              ),
          ),
        );
      } else {
        const newSelections = currentPageData.filter(
          (f) =>
            !selectedFeatures.some(
              (sf) => sf.attrId.toString() === f.attrId.toString(),
            ),
        );
        setSelectedFeatures((prev) => [
          ...prev,
          ...newSelections.map((f) => ({ ...f, selected: true })),
        ]);
      }
    },
    [selectedFeatures, initialSelectedFeatures],
  );

  const handleRemoveSelected = useCallback(
    (featureId: string) => {
      const isInitiallySelected = initialSelectedFeatures.some(
        (f) => f.attrId.toString() === featureId,
      );

      if (isInitiallySelected) {
        toast.info("Removing initially selected feature");
      }

      setSelectedFeatures((prev) =>
        prev.filter((f) => f.attrId.toString() !== featureId),
      );
    },
    [initialSelectedFeatures],
  );

  const handleAddData = useCallback(async () => {
    if (selectedFeatures.length === 0) {
      toast.info("No features selected");
      return;
    }

    const incompleteFeatures = selectedFeatures.filter(
      (f) =>
        (f.selectedValues?.length ?? 0) === 0 
    );

    if (incompleteFeatures.length > 0) {
      toast.error(
        `Please select the feature value for: ${incompleteFeatures.map((f) => f.attrName).join(", ")}`,
      );
      return;
    }

    onAdd(selectedFeatures);
    setSelectedFeatures([]);
    setIsOpen(false);
  }, [selectedFeatures, onAdd, setIsOpen]);

  const handleCancel = useCallback(() => {
    setSelectedFeatures(initialSelectedFeatures);
    setSearchTerm("");
    setIsOpen(false);
  }, [initialSelectedFeatures, setIsOpen]);

  const handleEditClick = (feature: FeatureData) => {
    setEditingRowId(Number(feature.attrId));

    const selectedVals =
      feature.selectedValues && feature.selectedValues.length > 0
        ? feature.selectedValues
        : feature.defaultValue
          ? [feature.defaultValue.toString()]
          : [];
    // console.log("SelectedVals data: ", selectedVals);

    setEditingValues({
      selectedValues: selectedVals,
      defaultValue: feature.defaultValue
        ? feature.defaultValue.toString()
        : null,
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingValues({ selectedValues: [], defaultValue: null });
    setIsDropdownOpen(false);
  };

  const handleOk = async (feature: FeatureData) => {
    if (editingValues.selectedValues.length === 0) {
      toast.error("Please select at least one feature value");
      return;
    }

    setSelectedFeatures((prev) => {
      const updated = prev.map((f) =>
        f.attrId === feature.attrId
          ? {
              ...f,
              defaultValue: editingValues.defaultValue ?? null,
              selectedValues: [...(editingValues.selectedValues || [])],
            }
          : f,
      );
      return updated;
    });

    setEditingRowId(null);
    setEditingValues({ selectedValues: [], defaultValue: null });
    setIsDropdownOpen(false);
    setReloadKey((prev) => prev + 1);
  };

  // Get count of newly added features
  const newlyAddedCount = useMemo(() => {
    return selectedFeatures.filter(
      (selected) =>
        !initialSelectedFeatures.some(
          (initial) => initial.attrId.toString() === selected.attrId.toString(),
        ),
    ).length;
  }, [selectedFeatures, initialSelectedFeatures]);

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        let sortBy = "ATTR_NAME";
        let sortDirection = "asc";

        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          switch (id) {
            case "attrName":
              sortBy = "ATTR_NAME";
              break;
            case "attrCode":
              sortBy = "ATTR_CODE";
              break;
            default:
              sortBy = "ATTR_NAME";
          }
          sortDirection = desc ? "desc" : "asc";
        }

        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-attr-list-by-catg`,
          {
            attrCatg: 1,
            search: searchTerm || "",
            page: page,
            size: limit,
            sortBy: sortBy,
            sortDirection: sortDirection,
          },
        );

        if (response?.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            totalCount: response.totalRows || 0,
          };
        } else {
          console.warn("⚠️ No available data or invalid data format");
          return {
            data: [],
            totalCount: 0,
          };
        }
      } catch (error) {
        console.error("❌ Available Features API Error:", error);
        toast.error("Error loading available feature data");
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [searchTerm],
  );

  const doGetSelectedData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      let processedData = [...selectedFeatures];

      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof FeatureData];
          const bValue = b[id as keyof FeatureData];

          const aVal = aValue ?? "";
          const bVal = bValue ?? "";

          if (typeof aVal === "string" && typeof bVal === "string") {
            return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
          }

          if (typeof aVal === "number" && typeof bVal === "number") {
            return desc ? bVal - aVal : aVal - bVal;
          }

          return 0;
        });
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: processedData.length,
      };
    },
    [selectedFeatures],
  );

  // Available Features DataGrid Columns
  const availableColumns = useMemo<ColumnDef<FeatureData>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ column, table }) => {
          // Ambil data dari halaman saat ini
          const currentPageData = table
            .getRowModel()
            .rows.map((row) => row.original);
          const allCurrentPageSelected =
            currentPageData.length > 0 &&
            currentPageData.every((f) =>
              selectedFeatures.some(
                (sf) => sf.attrId.toString() === f.attrId.toString(),
              ),
            );

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allCurrentPageSelected}
                onChange={() => handleSelectAll(currentPageData)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const feature = row.original;
          const isSelected = selectedFeatures.some(
            (f) => f.attrId.toString() === feature.attrId.toString(),
          );

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleFeatureToggle(feature)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.attrName,
        id: "attrName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Feature Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="max-w-[200px] break-words whitespace-normal text-gray-700">
            {row.original.attrName}
          </div>
        ),
        meta: {
          headerClassName: "max-w-[100px] whitespace-normal break-words",
          cellClassName: "max-w-[100px] whitespace-normal break-words",
        },
      },
      {
        accessorFn: (row) => row.attrCode,
        id: "attrCode",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Code" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.attrCode;
          return (
            <div className="max-w-[200px] break-words whitespace-normal text-gray-700">
              {code}
            </div>
          );
        },
        meta: {
          headerClassName: "max-w-[100px] whitespace-normal break-words",
          cellClassName: "max-w-[100px] whitespace-normal break-words",
        },
      },
      {
        id: "operation",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Operation"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const feature = row.original;

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleFeatureToggle(feature)}
                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-zinc-300"
              >
                <KeenIcon icon="plus" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [selectedFeatures, handleFeatureToggle, handleSelectAll],
  );

  // Selected Features DataGrid Columns
  const selectedColumns = useMemo<ColumnDef<FeatureData>[]>(
    () => [
      {
        accessorFn: (row) => row.attrName,
        id: "attrName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Feature Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;

          return (
            <div className="flex items-center">
              <span>{feature.attrName}</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.defaultValue,
        id: "defaultValue",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Show Value"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;

          // Show multi-select dropdown when editing
          if (editingRowId === feature.attrId) {
            return (
              <MultiSelectDropdown
                feature={feature}
                selectedValues={editingValues.selectedValues}
                defaultValue={editingValues.defaultValue}
                onValuesChange={(values) =>
                  setEditingValues((prev) => ({
                    ...prev,
                    selectedValues: values,
                  }))
                }
                onDefaultValueChange={(value) =>
                  setEditingValues((prev) => ({ ...prev, defaultValue: value }))
                }
                isOpen={isDropdownOpen}
                setIsOpen={setIsDropdownOpen}
              />
            );
          }

          // Display selected values with default highlighted
          const selectedVals =
            feature.selectedValues ||
            (feature.defaultValue ? [feature.defaultValue.toString()] : []);
          const defaultVal = feature.defaultValue?.toString();

          // console.log("SELECT VALUES", selectedVals);
          // console.log("SELECT Devault VALUES", defaultVal);

          const displayItems = feature.attrValueList
            ?.filter((item) => selectedVals.includes(String(item.value)))
            .map((item) => {
              const isDefault = String(item.value) === defaultVal;
              return (
                <span
                  key={item.attrValueId}
                  className={`inline-flex items-center px-2 py-1 mr-1 mb-1 text-xs rounded ${isDefault ? "bg-blue-500 text-white font-semibold" : "bg-gray-200 text-gray-700"}`}
                >
                  {item.valueMark}
                </span>
              );
            });

          return <div className="flex flex-row">{displayItems}</div>;
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Actions" column={column} />
        ),
        cell: ({ row }) => {
          const feature = row.original;
          const isInitiallySelected = initialSelectedFeatures.some(
            (f) => f.attrId.toString() === feature.attrId.toString(),
          );

          if (editingRowId === feature.attrId) {
            return (
              <div className="flex gap-2 justify-center">
                <button
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleOk(feature)}
                >
                  Ok
                </button>
                <button
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <button
                className="p-1 rounded hover:bg-gray-200"
                onClick={() => {
                  handleEditClick(row.original);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveSelected(feature.attrId.toString());
                }}
                className="p-1 rounded hover:text-red-500 hover:bg-gray-200"
                title={
                  isInitiallySelected
                    ? "Remove existing feature"
                    : "Remove feature"
                }
                type="button"
              >
                <KeenIcon icon="trash" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[120px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [
      editingRowId,
      editingValues,
      handleOk,
      handleCancelEdit,
      handleEditClick,
      handleRemoveSelected,
      initialSelectedFeatures,
    ],
  );

  // Selected features toolbar with count
  const SelectedFeatureToolbar = useMemo(
    () => (
      <div className="p-4">
        <div className="text-sm text-gray-600">
          {selectedFeatures.length} feature(s) selected
          {newlyAddedCount > 0 && (
            <span className="text-blue-600 ml-2">({newlyAddedCount} new)</span>
          )}
        </div>
      </div>
    ),
    [selectedFeatures.length, newlyAddedCount],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Select Feature</DialogTitle>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-auto px-6">
          <div className="flex h-full gap-4">
            {/* Left Panel - Available Features */}
            <div className="flex-1 border-r flex flex-col min-h-0 pr-4">
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider
                  key={refreshTrigger}
                  columns={availableColumns}
                  pagination={{ size: 10 }}
                  toolbar={<ListToolBarFeatureGroup />}
                  layout={{ card: false }}
                  sorting={[{ id: "attrName", desc: false }]}
                  serverSide={true}
                  onFetchData={({
                    pageIndex,
                    pageSize,
                    sorting,
                    columnFilters,
                  }) => {
                    return doGetAvailableData(
                      pageIndex + 1,
                      pageSize,
                      sorting,
                      columnFilters,
                    );
                  }}
                />
              </div>
            </div>

            {/* Right Panel - Selected Features */}
            <div className="w-1/2 flex flex-col min-h-0 pl-4">
              <div className="flex-1 overflow-auto min-h-0">
                {selectedFeatures.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {offerId && !isSelectedDataLoaded} No record to view
                  </div>
                ) : (
                  <>
                    {SelectedFeatureToolbar}
                    <DataGridProvider
                      key={`selected-${selectedFeatures.length}-${reloadKey}`}
                      columns={selectedColumns}
                      pagination={{ size: 10 }}
                      toolbar={<div className="p-2"></div>}
                      layout={{ card: false }}
                      sorting={[{ id: "attrName", desc: false }]}
                      serverSide={true}
                      onFetchData={({
                        pageIndex,
                        pageSize,
                        sorting,
                        columnFilters,
                      }) => {
                        return doGetSelectedData(
                          pageIndex + 1,
                          pageSize,
                          sorting,
                          columnFilters,
                        );
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedFeatures.length} feature(s) selected
            {newlyAddedCount > 0 && (
              <span className="text-blue-600">({newlyAddedCount} new)</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleAddData}
              className="disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFilterFeatureDialog;
