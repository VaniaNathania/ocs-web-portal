import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { X, Search, Plus } from "lucide-react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListToolBarFeature } from "./ListToolBarFeature";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { FeatureData } from "../components/DetailCategoryContent/FeatureTabContent";

interface AddFeatureDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  // onAdd: (selectedFeatures: FeatureData[]) => void;
  offerId?: string;
  onSuccess?: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

// Utility function untuk konsistensi tipe data
const toStr = (v: any) => (v === undefined || v === null ? "" : String(v));

const AddFeatureDialog: React.FC<AddFeatureDialogProps> = ({ trigger, isOpen: externalIsOpen, onClose, onOpenChange: externalOnOpenChange, offerId, onSuccess }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureData[]>([]);
  const [initialSelectedFeatures, setInitialSelectedFeatures] = useState<FeatureData[]>([]);
  const { GetData, PutData } = useCallApi();
  const [isSelectedDataLoaded, setIsSelectedDataLoaded] = useState(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [debounceSearch, setDebounceSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  // Dual state system: untuk select dan text input
  const [newDefaultValues, setNewDefaultValues] = useState<Record<string, string>>({});
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});

  const [reloadKey, setReloadKey] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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

  // Load selected features when dialog opens
  useEffect(() => {
    if (isOpen && !isSelectedDataLoaded && offerId) {
      loadDataSelectedFeature(offerId);
    }
  }, [isOpen, isSelectedDataLoaded, offerId]);

  const loadDataSelectedFeature = async (offerId: string) => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/attr/qry-offer-attr-by-offer-id`, {
        offerIds: offerId,
      });

      if (response?.data && Array.isArray(response.data)) {
        const selectedData = response.data.map((item) => ({
          ...item,
          selected: true,
          defaultValue: item.defaultValue !== undefined && item.defaultValue !== null ? String(item.defaultValue) : "",
        }));
        setSelectedFeatures(selectedData);
        setInitialSelectedFeatures(selectedData);
        setIsSelectedDataLoaded(true);
      } else {
        console.warn("⚠️ No selected data or invalid data format");
        setSelectedFeatures([]);
        setInitialSelectedFeatures([]);
      }
    } catch (error) {
      console.error("❌ Selected Features API Error:", error);
      toast.error("Error loading selected feature data");
      setSelectedFeatures([]);
      setInitialSelectedFeatures([]);
    }
  };

  const handleFeatureToggle = useCallback(
    (feature: FeatureData) => {
      setSelectedFeatures((prev) => {
        const isSelected = prev.some((f) => toStr(f.attrId) === toStr(feature.attrId));

        if (isSelected) {
          const updated = prev.filter((f) => toStr(f.attrId) !== toStr(feature.attrId));
          return updated;
        } else {
          const toAdd = {
            ...feature,
            selected: true,
            defaultValue: feature.defaultValue !== undefined && feature.defaultValue !== null ? String(feature.defaultValue) : "",
          };
          const updated = [...prev, toAdd];
          return updated;
        }
      });
    },
    [initialSelectedFeatures]
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    } else {
      setIsSelectedDataLoaded(false);
      setSelectedFeatures([]);
      setInitialSelectedFeatures([]);
      // Reset semua state editing saat dialog ditutup
      setNewDefaultValues({});
      setTempValues({});
      setEditingRowId(null);
      inputRefs.current = {};
    }
  }, [isOpen]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [searchTerm]);

  const handleSelectAll = useCallback(
    (currentPageData: FeatureData[]) => {
      const allIds = currentPageData.map((f) => toStr(f.attrId));
      const allSelected = allIds.every((id) => selectedFeatures.some((f) => toStr(f.attrId) === id));

      if (allSelected) {
        setSelectedFeatures((prev) => prev.filter((f) => !allIds.includes(toStr(f.attrId)) || initialSelectedFeatures.some((initial) => toStr(initial.attrId) === toStr(f.attrId))));
      } else {
        const newSelections = currentPageData.filter((f) => !selectedFeatures.some((sf) => toStr(sf.attrId) === toStr(f.attrId)));
        setSelectedFeatures((prev) => [...prev, ...newSelections.map((f) => ({ ...f, selected: true, defaultValue: f.defaultValue !== undefined && f.defaultValue !== null ? String(f.defaultValue) : "" }))]);
      }
    },
    [selectedFeatures, initialSelectedFeatures]
  );

  const handleRemoveSelected = useCallback(
    (featureId: string) => {
      const isInitiallySelected = initialSelectedFeatures.some((f) => toStr(f.attrId) === toStr(featureId));

      if (isInitiallySelected) {
        toast.info("Removing initially selected feature");
      }

      setSelectedFeatures((prev) => prev.filter((f) => toStr(f.attrId) !== toStr(featureId)));
    },
    [initialSelectedFeatures]
  );

  const handleAddData = useCallback(async () => {
    if (selectedFeatures.length === 0) {
      toast.info("No features selected");
      return;
    }

    const finalFeatures = selectedFeatures.map((f) => {
      const attrKey = toStr(f.attrId);
      const finalValue = tempValues[attrKey] ?? newDefaultValues[attrKey] ?? f.defaultValue ?? "";
      return { ...f, defaultValue: finalValue };
    });

    const invalid = finalFeatures.find((f) => f.defaultValue === undefined || f.defaultValue === null || String(f.defaultValue).trim() === "");

    if (invalid) {
      toast.error(`Default Value is required for ${invalid.attrName}`);
      return;
    }

    try {
      const payload = finalFeatures.map((f, idx) => ({
        attrId: f.attrId,
        defaultValue: f.defaultValue ?? "",
        offerId: Number(offerId),
        spid: 0,
        dispOrder: idx + 1,
      }));

      // console.log("Sending full payload : ", payload);

      const response = await PutData(`${API_URL_OFFER}/offer/attr/mod-offer-attr-batch/${offerId}`, payload);

      // console.log("Put response : ", response);
      toast.success("Feature Save Successfully");

      // onAdd(finalFeatures);
      if (onSuccess) onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed To Save Feature");
    }
  }, [selectedFeatures, tempValues, newDefaultValues, initialSelectedFeatures, setIsOpen, PutData]);

  const handleCancel = useCallback(() => {
    setSelectedFeatures(initialSelectedFeatures);
    setSearchTerm("");
    setNewDefaultValues({});
    setTempValues({});
    setEditingRowId(null);
    inputRefs.current = {};
    setIsOpen(false);
  }, [initialSelectedFeatures, setIsOpen]);

  const handleEditClick = (feature: FeatureData) => {
    const attrKey = toStr(feature.attrId);

    // Save current editing value sebelum switch ke edit baru
    if (editingRowId !== null && editingRowId !== Number(feature.attrId)) {
      const currentEditKey = toStr(editingRowId);
      const currentFeature = selectedFeatures.find((f) => toStr(f.attrId) === currentEditKey);
      const hasOptions = currentFeature?.attrValueList && currentFeature.attrValueList.length > 0;

      const currentValue = hasOptions ? newDefaultValues[currentEditKey] : tempValues[currentEditKey];

      if (currentValue !== undefined) {
        setSelectedFeatures((prev) => prev.map((f) => (toStr(f.attrId) === currentEditKey ? { ...f, defaultValue: currentValue } : f)));
      }
    }

    setEditingRowId(Number(feature.attrId));

    const hasOptions = feature.attrValueList && feature.attrValueList.length > 0;
    const initialValue = feature.defaultValue !== undefined && feature.defaultValue !== null ? String(feature.defaultValue) : "";

    if (hasOptions) {
      // select dropdown
      setNewDefaultValues((prev) => ({
        ...prev,
        [attrKey]: initialValue,
      }));
    } else {
      // text input
      setTempValues((prev) => ({
        ...prev,
        [attrKey]: initialValue,
      }));
    }
  };

  const handleCancelEdit = () => {
    const id = editingRowId;
    setEditingRowId(null);

    setTempValues((prev) => {
      const clone = { ...prev };
      if (id !== null) delete clone[toStr(id)];
      return clone;
    });

    setNewDefaultValues((prev) => {
      const clone = { ...prev };
      if (id !== null) delete clone[toStr(id)];
      return clone;
    });
  };

  const handleOk = (feature: FeatureData) => {
    const attrKey = toStr(feature.attrId);

    const updatedValue = tempValues[attrKey] ?? newDefaultValues[attrKey] ?? (feature.defaultValue !== undefined && feature.defaultValue !== null ? String(feature.defaultValue) : "");

    setSelectedFeatures((prev) => prev.map((f) => (toStr(f.attrId) === attrKey ? { ...f, defaultValue: updatedValue } : f)));

    setReloadKey((prev) => prev + 1);
    setEditingRowId(null);

    setTempValues((prev) => {
      const clone = { ...prev };
      delete clone[attrKey];
      return clone;
    });
    setNewDefaultValues((prev) => {
      const clone = { ...prev };
      delete clone[attrKey];
      return clone;
    });
  };

  const handleInputChange = useCallback((attrKey: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [attrKey]: value }));

    setTimeout(() => {
      const input = inputRefs.current[attrKey];
      if (input && document.activeElement !== input) {
        input.focus();
        const length = value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // console.log("search value: ", searchValue);
      setDebounceSearch(searchValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [debounceSearch]);

  const handleClearSearch = () => {
    setSearchValue("");
    setDebounceSearch("");
  };

  const handleFeatureSelect = () => {};

  // Get count of newly added features
  const newlyAddedCount = useMemo(() => {
    return selectedFeatures.filter((selected) => !initialSelectedFeatures.some((initial) => toStr(initial.attrId) === toStr(selected.attrId))).length;
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

        const response = await GetData(`${API_URL_OFFER}/offer/attr/qry-attr-list-by-catg`, {
          attrCatg: 1,
          search: debounceSearch || "",
          page: page,
          size: limit,
          sortBy: sortBy,
          sortDirection: sortDirection,
        });

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
    [debounceSearch, searchTerm, GetData]
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
    [selectedFeatures]
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
          const currentPageData = table.getRowModel().rows.map((row) => row.original);
          const allCurrentPageSelected = currentPageData.length > 0 && currentPageData.every((f) => selectedFeatures.some((sf) => toStr(sf.attrId) === toStr(f.attrId)));

          return (
            <div className="flex items-center justify-center">
              <input type="checkbox" checked={allCurrentPageSelected} onChange={() => handleSelectAll(currentPageData)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            </div>
          );
        },
        cell: ({ row }) => {
          const feature = row.original;
          const isSelected = selectedFeatures.some((f) => toStr(f.attrId) === toStr(feature.attrId));

          return (
            <div className="flex items-center justify-center">
              <input type="checkbox" checked={isSelected} onChange={() => handleFeatureToggle(feature)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
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
        header: ({ column }) => <DataGridColumnHeader className="" title="Feature Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.attrCode,
        id: "attrCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Code" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.attrCode;
          return <div className="text-gray-600">{code}</div>;
        },
      },
      {
        id: "operation",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const feature = row.original;

          return (
            <div className="flex items-center justify-center">
              <button onClick={() => handleFeatureToggle(feature)} className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-zinc-300">
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
    [selectedFeatures, handleFeatureToggle, handleSelectAll]
  );

  // Selected Features DataGrid Columns - INI YANG UTAMA BERUBAH
  const selectedColumns = useMemo<ColumnDef<FeatureData>[]>(
    () => [
      {
        accessorFn: (row) => row.attrName,
        id: "attrName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Feature Name" column={column} />,
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
        header: ({ column }) => <DataGridColumnHeader className="" title="Default Value" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;
          const attrKey = toStr(feature.attrId);
          const options = feature.attrValueList ?? [];
          const firstOption = options.length > 0 ? toStr(options[0].value ?? "") : "";

          if (editingRowId === Number(feature.attrId)) {
            // Jika ada option list pakai select dropdown
            if (options.length > 0) {
              if (!newDefaultValues[attrKey] && !feature.defaultValue && firstOption !== "") {
                setNewDefaultValues((prev) => ({
                  ...prev,
                  [attrKey]: firstOption,
                }));
              }

              return (
                <select
                  className="border rounded px-2 py-1"
                  value={newDefaultValues[attrKey] ?? toStr(feature.defaultValue) ?? firstOption}
                  onChange={(e) => {
                    const v = toStr(e.target.value);
                    setNewDefaultValues((prev) => ({ ...prev, [attrKey]: v }));
                  }}
                >
                  {options.map((item: any) => (
                    <option key={item.attrValueId} value={toStr(item.value ?? "")}>
                      {item.valueMark} ({toStr(item.value ?? "")})
                    </option>
                  ))}
                </select>
              );
            }

            // if default value ga ada
            return (
              <input
                ref={(el) => {
                  inputRefs.current[attrKey] = el;
                }}
                type="text"
                className="border rounded px-2 py-1 w-full"
                value={tempValues[attrKey] ?? feature.defaultValue ?? ""}
                onChange={(e) => handleInputChange(attrKey, e.target.value)}
                onFocus={(e) => {
                  const length = e.target.value.length;
                  e.target.setSelectionRange(length, length);
                }}
                autoFocus={editingRowId === Number(feature.attrId)}
                placeholder="Enter default value"
              />
            );
          }

          const current =
            options.length > 0
              ? (newDefaultValues[attrKey] ?? selectedFeatures.find((f) => toStr(f.attrId) === attrKey)?.defaultValue ?? toStr(feature.defaultValue) ?? firstOption)
              : (tempValues[attrKey] ?? selectedFeatures.find((f) => toStr(f.attrId) === attrKey)?.defaultValue ?? toStr(feature.defaultValue) ?? "");

          const matched = options.find((item: any) => toStr(item.value ?? "") === toStr(current));

          return matched ? `${matched.valueMark} (${matched.value})` : current || "-";
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader className="" title="Actions" column={column} />,
        cell: ({ row }) => {
          const feature = row.original;
          const isInitiallySelected = initialSelectedFeatures.some((f) => toStr(f.attrId) === toStr(feature.attrId));

          if (editingRowId === Number(feature.attrId)) {
            return (
              <div className="flex gap-2 justify-center">
                <button className="btn btn-sm btn-success bg-blue-500 hover:bg-blue-400" onClick={() => handleOk(feature)}>
                  Ok
                </button>
                <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
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
                  handleRemoveSelected(toStr(feature.attrId));
                }}
                className="p-1 rounded hover:bg-zinc-300"
                title={isInitiallySelected ? "Remove existing feature" : "Remove feature"}
                type="button"
              >
                <KeenIcon icon="trash" />
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
    [editingRowId, newDefaultValues, tempValues, handleOk, handleCancelEdit, handleEditClick, handleRemoveSelected, initialSelectedFeatures, selectedFeatures, handleInputChange]
  );

  // Selected features toolbar with count
  const SelectedFeatureToolbar = useMemo(
    () => (
      <div className="p-4">
        <div className="text-sm text-gray-600">
          {selectedFeatures.length} feature(s) selected
          {newlyAddedCount > 0 && <span className="text-blue-600 ml-2">({newlyAddedCount} new)</span>}
        </div>
      </div>
    ),
    [selectedFeatures.length, newlyAddedCount]
  );

  // Key
  const selectedKey = `selected-${selectedFeatures.map((f) => `${toStr(f.attrId)}:${toStr(f.defaultValue)}`).join("|")}-${Object.keys(tempValues).length}-${editingRowId}-${reloadKey}`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Select Feature</DialogTitle>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-auto px-6">
          <div className="flex h-full gap-4">
            {/* Left Panel - Available Features */}
            <div className="flex-1 border-r flex flex-col min-h-0 pr-4">
              <div className="py-2 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-700">All Features</h3>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider
                  key={refreshTrigger}
                  columns={availableColumns}
                  pagination={{ size: 10 }}
                  toolbar={<ListToolBarFeature searchValue={searchValue} onSearchChange={setSearchValue} clearSearch={handleClearSearch} />}
                  layout={{ card: false }}
                  sorting={[{ id: "attrName", desc: false }]}
                  serverSide={true}
                  onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                    return doGetAvailableData(pageIndex + 1, pageSize, sorting, columnFilters);
                  }}
                />
              </div>
            </div>

            {/* Right Panel - Selected Features */}
            <div className="w-1/3 flex flex-col min-h-0 pl-4">
              <div className="flex-1 overflow-auto min-h-0">
                {selectedFeatures.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">{offerId && !isSelectedDataLoaded ? "Loading selected features..." : "No record to view"}</div>
                ) : (
                  <>
                    {SelectedFeatureToolbar}
                    <DataGridProvider
                      key={selectedKey}
                      columns={selectedColumns}
                      pagination={{ size: 10 }}
                      toolbar={<div className="p-2"></div>}
                      layout={{ card: false }}
                      sorting={[{ id: "attrName", desc: false }]}
                      serverSide={true}
                      onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                        return doGetSelectedData(pageIndex + 1, pageSize, sorting, columnFilters);
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
            {newlyAddedCount > 0 && <span className="text-blue-600">({newlyAddedCount} new)</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddData} className="disabled:bg-gray-300 disabled:cursor-not-allowed">
              Add
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeatureDialog;
