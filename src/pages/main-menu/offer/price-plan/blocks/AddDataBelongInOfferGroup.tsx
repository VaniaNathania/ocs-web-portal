import React, { useState, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import {
  DataGridColumnHeader,
  DataGridProvider,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import { ListToolBarFeature } from './ListToolBarFeature';
import { ListToolBarBelongInOfferGroup } from './ListToolBarBelongInOfferGroup';

export interface Feature {
  id: string;
  name: string;
  code: string;
  operation: string;
  selected: boolean;
}

interface AddDataBelongInOfferGroup {
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (selectedFeatures: Feature[]) => void;
}

const AddDataBelongInOfferGroup: React.FC<AddDataBelongInOfferGroup> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  // Sample data - replace with your actual data
  const allFeatures: Feature[] = useMemo(() => [
    { id: '1', name: '1502', code: 'EXP_PAYMENT_TIMES', operation: '+', selected: false },
    { id: '2', name: 'BADINAS', code: 'EXP_BA_SERVICE_BRAND', operation: '+', selected: false },
    { id: '3', name: 'BO Local Quota', code: 'EXP_STATIC_IP', operation: '+', selected: false },
    { id: '4', name: 'DPP 126 Group', code: 'EXP_BA_SERVICE_BRAND_2', operation: '+', selected: false },
    { id: '5', name: 'DPP Group 1206', code: 'EXP_BA_DATA_SERV', operation: '+', selected: false },
  ], []);

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return allFeatures;
    
    const searchLower = searchTerm.toLowerCase();
    return allFeatures.filter(feature =>
      feature.name.toLowerCase().includes(searchLower) ||
      feature.code.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allFeatures]);

  const handleFeatureToggle = useCallback((featureId: string) => {
    const feature = allFeatures.find(f => f.id === featureId);
    if (!feature) return;

    setSelectedFeatures(prev => {
      const isSelected = prev.some(f => f.id === featureId);
      if (isSelected) {
        return prev.filter(f => f.id !== featureId);
      } else {
        return [...prev, { ...feature, selected: true }];
      }
    });
  }, [allFeatures]);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredFeatures.map(f => f.id);
    const allSelected = allIds.every(id => selectedFeatures.some(f => f.id === id));
    
    if (allSelected) {
      setSelectedFeatures(prev => prev.filter(f => !allIds.includes(f.id)));
    } else {
      const newSelections = filteredFeatures.filter(f => !selectedFeatures.some(sf => sf.id === f.id));
      setSelectedFeatures(prev => [...prev, ...newSelections.map(f => ({ ...f, selected: true }))]);
    }
  }, [filteredFeatures, selectedFeatures]);

  const handleRemoveSelected = useCallback((featureId: string) => {
    setSelectedFeatures(prev => prev.filter(f => f.id !== featureId));
  }, []);

  const handleAddData = useCallback(() => {
    // onAdd(selectedFeatures);
    onClose();
  }, [selectedFeatures, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedFeatures([]);
    setSearchTerm('');
    onClose();
  }, [onClose]);

  // Check if all filtered features are selected
  const allFilteredSelected = useMemo(() => {
    return filteredFeatures.length > 0 && filteredFeatures.every(f => selectedFeatures.some(sf => sf.id === f.id));
  }, [filteredFeatures, selectedFeatures]);

  // Available Features DataGrid Columns
  const availableColumns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        ),
        cell: ({ row }) => {
          const feature = row.original;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedFeatures.some(f => f.id === feature.id)}
                onChange={() => handleFeatureToggle(feature.id)}
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
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Group Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedFeatures, allFilteredSelected, handleFeatureToggle, handleSelectAll]
  );

  // Selected Features DataGrid Columns
  const selectedColumns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Group Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      // {
      //   accessorFn: (row) => "-",
      //   id: "defaultValue",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //       className=""
      //       title="Default Value"
      //       column={column}
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      //   cell: () => {
      //     return (
      //       <div className="text-gray-600">
      //         -
      //       </div>
      //     );
      //   },
      // },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Actions"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const feature = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveSelected(feature.id);
                }}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Remove feature"
                type="button"
              >
                <KeenIcon icon='trash'/>
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
    [handleRemoveSelected]
  );

  // Function untuk handle data dengan client-side filtering untuk available features
  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      let processedData = [...filteredFeatures];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof Feature];
          const bValue = b[id as keyof Feature];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
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
        data: paginatedData,
        totalCount: processedData.length,
      };
    },
    [filteredFeatures]
  );

  // Function untuk handle data selected features
  const doGetSelectedData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      let processedData = [...selectedFeatures];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof Feature];
          const bValue = b[id as keyof Feature];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
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
        data: paginatedData,
        totalCount: processedData.length,
      };
    },
    [selectedFeatures]
  );

  // Selected features toolbar with count
  const SelectedFeatureToolbar = useMemo(() => (
    <div className="p-4 bg-gray-50 border-b">
      <div className="text-sm text-gray-600">
        {selectedFeatures.length} feature(s) selected
      </div>
    </div>
  ), [selectedFeatures.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[93vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Join Offer Grup</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-auto">
          <div className="flex min-h-full">
            {/* Left Panel - Available Features */}
            <div className="flex-1 border-r flex flex-col min-h-0">
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider
                  key="available-features-grid"
                  columns={availableColumns}
                  pagination={{ size: 10 }}
                  toolbar={<ListToolBarBelongInOfferGroup />}
                  layout={{ card: false }}
                  sorting={[{ id: "name", desc: false }]}
                  serverSide={true}
                  onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                    return doGetAvailableData(pageIndex + 1, pageSize, sorting, columnFilters);
                  }}
                >
                  {/* Available Features DataGrid content */}
                </DataGridProvider>
              </div>
            </div>

            {/* Right Panel - Selected Features */}
            <div className="w-1/3 flex flex-col min-h-0">
              <div className="bg-gray-50 px-4 py-2 border-b flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-700">Selected Group</h3>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                {selectedFeatures.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No record to view
                  </div>
                ) : (
                  <>
                    {SelectedFeatureToolbar}
                    <DataGridProvider
                      key={`selected-${selectedFeatures.length}`}
                      columns={selectedColumns}
                      pagination={{ size: 10 }}
                      toolbar={<div className="p-2"></div>}
                      layout={{ card: false }}
                      sorting={[{ id: "name", desc: false }]}
                      serverSide={true}
                      onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                        return doGetSelectedData(pageIndex + 1, pageSize, sorting, columnFilters);
                      }}
                    >
                      {/* Selected Features DataGrid content */}
                    </DataGridProvider>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedFeatures.length} group selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddData}
              disabled={selectedFeatures.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add ({selectedFeatures.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDataBelongInOfferGroup;