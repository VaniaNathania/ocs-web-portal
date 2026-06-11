import React, { useState, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import {
  DataGridColumnHeader,
  DataGridProvider,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { ListToolBarFeatureOfferStatusManageDialog } from './ListToolBarFeatureOfferStatusManageDialog';

export interface Feature {
  id: string;
  actiontype: string;
  staffname: string;
  selected: boolean;
  createddate: string
}

interface OfferStatusManageDialog {
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (selectedFeatures: Feature[]) => void;
}

const OfferStatusManageDialog: React.FC<OfferStatusManageDialog> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);

  // Sample data - replace with your actual data
  const allFeatures: Feature[] = useMemo(() => [
    { id: '1', actiontype: 'PAYMENT TIMES', createddate: '2023-08-01', staffname: 'TCEL', selected: false },
    { id: '2', actiontype: 'BA Service Brand', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '3', actiontype: 'BA Static IP Add', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '4', actiontype: 'BA Service Brand', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '5', actiontype: 'BA DATA PACKAGE', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '6', actiontype: 'ABN Classification', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '7', actiontype: 'ABN Roaming Flag', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '8', actiontype: 'ACCOUNT STATE', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '9', actiontype: 'ADSL ACCOUNT', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '10', actiontype: 'ADSL ACCOUNT STATE', createddate: '2023-08-01', staffname: 'TCEL', selected: false },
    { id: '11', actiontype: 'Customer Type', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '12', actiontype: 'Service Level', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '13', actiontype: 'Plan Category', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '14', actiontype: 'Device Type', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
    { id: '15', actiontype: 'Usage Pattern', createddate: '2023-08-01',  staffname: 'TCEL', selected: false },
  ], []);

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return allFeatures;

    const searchLower = searchTerm.toLowerCase();
    return allFeatures.filter(feature =>
      feature.actiontype.toLowerCase().includes(searchLower) ||
      feature.staffname.toLowerCase().includes(searchLower)
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

  // const handleAddData = useCallback(() => {
  //   onAdd(selectedFeatures);
  //   onClose();
  // }, [selectedFeatures, onAdd, onClose]);

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
        accessorFn: (row) => row.actiontype,
        id: "actiontype",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Action Type"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.createddate,
        id: "createddate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Created Date"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.createddate;
          return (
            <div className="text-gray-600">
              {code}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.staffname,
        id: "staffname",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Staff Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.staffname;
          return (
            <div className="text-gray-600">
              {code}
            </div>
          );
        },
      },
    ],
    [selectedFeatures, allFilteredSelected, handleFeatureToggle, handleSelectAll]
  );

  // Selected Features DataGrid Columns
  const selectedColumns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        accessorFn: (row) => row.actiontype,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Feature Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => "-",
        id: "defaultValue",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Default Value"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: () => {
          return (
            <div className="text-gray-600">
              -
            </div>
          );
        },
      },
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
                <KeenIcon icon='trash' />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[93vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Offer Status Manage</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten Utama Modal - Sekarang DataGridProvider akan mengisi ruang yang tersedia dalam max-w-6xl */}
        {/* Anda bisa menambahkan padding horizontal di sini jika Anda ingin ruang di sisi kiri/kanan konten grid */}
        <div className="flex-1 overflow-auto p-4"> {/* Menambahkan p-4 untuk padding di sekitar konten grid */}
          <div className="flex min-h-full">
            <div className="flex-1 border-r flex flex-col min-h-0">
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider
                  key="available-features-grid"
                  columns={availableColumns}
                  pagination={{ size: 10 }}
                  toolbar={<ListToolBarFeatureOfferStatusManageDialog />}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferStatusManageDialog;