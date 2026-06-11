import React, { useState, useMemo, useCallback } from "react";
import { X, Search, Plus } from "lucide-react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Feature {
  id: string;
  name: string;
  code: string;
  operation: string;
  selected: boolean;
}

interface CopyFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedFeatures: Feature[]) => void;
}

const CopyFeatureDialog: React.FC<CopyFeatureDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  // Sample data - replace with your actual data
  const dataDummy: Feature[] = useMemo(
    () => [
      {
        id: "1",
        name: "Voice Service",
        code: "Voice Service",
        operation: "+",
        selected: false,
      },
      {
        id: "2",
        name: "Incoming SMS",
        code: "SIMT",
        operation: "+",
        selected: false,
      },
      {
        id: "3",
        name: "Data Service",
        code: "Data Service",
        operation: "+",
        selected: false,
      },
      {
        id: "4",
        name: "Outgoing SMS",
        code: "SIMO",
        operation: "+",
        selected: false,
      },
      {
        id: "5",
        name: "Fellow Number",
        code: "Fellow Number",
        operation: "+",
        selected: false,
      },
      {
        id: "6",
        name: "Data Service Test",
        code: "Data Services Test",
        operation: "+",
        selected: false,
      },
    ],
    []
  );

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return dataDummy;

    const searchLower = searchTerm.toLowerCase();
    return dataDummy.filter(
      (feature) =>
        feature.name.toLowerCase().includes(searchLower) ||
        feature.code.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, dataDummy]);

  const handleFeatureToggle = useCallback(
    (featureId: string) => {
      const feature = dataDummy.find((f) => f.id === featureId);
      if (!feature) return;

      setSelectedFeatures((prev) => {
        const isSelected = prev.some((f) => f.id === featureId);
        if (isSelected) {
          return prev.filter((f) => f.id !== featureId);
        } else {
          return [...prev, { ...feature, selected: true }];
        }
      });
    },
    [dataDummy]
  );

  const handleAddFeatures = useCallback(() => {
    onAdd(selectedFeatures);
    onClose();
  }, [selectedFeatures, onAdd, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedFeatures([]);
    setSearchTerm("");
    onClose();
  }, [onClose]);

  // DataGrid Columns
  const columns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Offer Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;
          const isSelected = selectedFeatures.some((f) => f.id === feature.id);
          
          return (
            <div 
              className={`cursor-pointer p-2 rounded ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleFeatureToggle(feature.id)}
            >
              {feature.name}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.code,
        id: "code",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Product Code"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;
          const isSelected = selectedFeatures.some((f) => f.id === feature.id);
          
          return (
            <div 
              className={`cursor-pointer p-2 rounded ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => handleFeatureToggle(feature.id)}
            >
              {feature.code}
            </div>
          );
        },
      },
    ],
    [selectedFeatures, handleFeatureToggle]
  );

  // Function untuk handle data dengan client-side filtering
  const doGetData = useCallback(
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-800">
            Copy From Offer
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b bg-white flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Offer Name / Product Code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-3">
          <DataGridProvider
            key="features-grid"
            columns={columns}
            pagination={{ size: 10 }}
            toolbar={<div className="p-2"></div>}
            layout={{ card: false }}
            sorting={[{ id: "name", desc: false }]}
            serverSide={true}
            onFetchData={({
              pageIndex,
              pageSize,
              sorting,
              columnFilters,
            }) => {
              return doGetData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters
              );
            }}
          >
            {/* DataGrid content */}
          </DataGridProvider>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddFeatures}
            disabled={selectedFeatures.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyFeatureDialog;