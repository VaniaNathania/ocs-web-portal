import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Inbox } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridProvider, DataGridColumnHeader } from "@/components";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface StatusHistoryItem {
  actionType: string;
  createdDate: string;
  staffName: string;
}

interface valueMark {
  offerName: string;
  createdDate: string;
  offerStatus: string;
}

interface OfferStatusManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const OfferStatusManageModal: React.FC<OfferStatusManageModalProps> = ({
  isOpen,
  onClose,
  rowData,
}) => {
  const [valueMark, setValueMark] = useState<valueMark | null>(null);
  const [loading, setLoading] = useState(false);
  const { GetData } = useCallApi();

  useEffect(() => {
    if (isOpen && rowData) {
      fetchValueMark();
    }
  }, [isOpen, rowData]);

  const fetchValueMark = async () => {
    setLoading(true);
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-value-mark-by-offer-id`,
        {
          offerId: rowData.offerId,
          spId: rowData.spId || 0,
        },
      );

      if (response?.status && response.data) {
        //  console.log("valueMark data : ", response.data);
        setValueMark(response.data?.[0]);
      }
    } catch (error) {
      console.error("Error fetching status history:", error);
      setValueMark(null);
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = useMemo<ColumnDef<StatusHistoryItem>[]>(
    () => [
      {
        accessorFn: (row) => row.actionType,
        id: "actionType",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="text-gray-800"
            title="Action Type"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "offerStatus",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="text-gray-800"
            title="Create Date"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.staffName,
        id: "staffName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="text-gray-800"
            title="Staff Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // try {
      //   let sortBy = "ATTR_NAME";
      //   let sortDirection = "asc";
      //   if (sorting && sorting.length > 0) {
      //     const { id, desc } = sorting[0];
      //     switch (id) {
      //       case "attrName":
      //         sortBy = "ATTR_NAME";
      //         break;
      //       case "attrCode":
      //         sortBy = "ATTR_CODE";
      //         break;
      //       default:
      //         sortBy = "ATTR_NAME";
      //     }
      //     sortDirection = desc ? "desc" : "asc";
      //   }
      //   const response = await GetData(`${API_URL_OFFER}/`, {
      //     attrCatg: 1,
      //     search: "",
      //     page: page,
      //     size: limit,
      //     sortBy: sortBy,
      //     sortDirection: sortDirection,
      //   });
      // //  console.log("✅ Available features API response with pagination:", response);
      //   if (response?.data && Array.isArray(response.data)) {
      //     return {
      //       data: response.data,
      //       totalCount: response.totalRows || 0,
      //     };
      //   } else {
      //     console.warn("⚠️ No available data or invalid data format:", response);
      //     return {
      //       data: [],
      //       totalCount: 0,
      //     };
      //   }
      // } catch (error) {
      //   console.error("❌ Available Features API Error:", error);
      //   toast.error("Error loading available feature data");
      //   return {
      //     data: [],
      //     totalCount: 0,
      //   };
      // }
    },
    [],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Offer Status Manage
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Form Fields Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Offer Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Offer Name
              </label>
              <input
                type="text"
                value={valueMark?.offerName}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
              />
            </div>

            {/* Offer Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Offer Status
              </label>
              <input
                type="text"
                value={"Published"}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
              />
            </div>

            {/* Created Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Created Date
              </label>
              <input
                type="text"
                value={valueMark?.createdDate}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div>
            <DataGridProvider
              // key={reloadKey}
              columns={columns}
              pagination={{ size: 10 }}
              // toolbar={<FeatureToolbar />}
              layout={{ card: true }}
              sorting={[{ id: "actionType", desc: false }]}
              serverSide={true}
              onFetchData={({
                pageIndex,
                pageSize,
                sorting,
                columnFilters,
              }) => {
                return doGetListData(
                  pageIndex + 1,
                  pageSize,
                  sorting,
                  columnFilters,
                );
              }}
            ></DataGridProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferStatusManageModal;
