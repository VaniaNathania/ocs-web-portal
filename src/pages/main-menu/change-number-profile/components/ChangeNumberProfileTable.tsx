import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { lazy, useCallback, useMemo, useState } from "react";
import ReservationModal from "../blocks/ReservationModal";
import { useChangeNumberProfileContext } from "../hooks/useChangeNumberProfileContext";
import { FileText } from "lucide-react";
import ServiceNumberHistoryModal from "./ServiceNumberHistoryModal";
import ExportFileFormatModal from "../blocks/ExportFormatFileModal";
import BatchMaintenanceModal from "../blocks/BatchMaintenanceModal";
import NumberProfileDetailSection from "./DetailSection";
import { selectedRowHighLight, nonSelectedRowHighLight } from "@/styles/style";
import { toast } from "sonner";
import { AccNbrDetailsProps } from "../hooks/ChangeNumberProfileContext";
import SimCardDetail from "./SimCardDetail";

const ReservationDetail = lazy(() => import("../blocks/ReservationDetail"));

const ChangeNumberProfileTable = () => {
  const {
    selectedItem,
    setSelectedItem,
    fetchAccNbrDetails,
    queryTrigger,
    setMode,
    isReset,
    refreshTrigger,
    setCurrentPage,
    setRefreshTrigger,
  } = useChangeNumberProfileContext();

  // State untuk checkbox selection
  const [selectedRows, setSelectedRows] = useState<
    Map<number, AccNbrDetailsProps>
  >(new Map());
  const [selectedServiceNumber, setSelectedServiceNumber] =
    useState<string>("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBatchMaintenanceModalOpen, setIsBatchMaintenanceModalOpen] =
    useState(false);
  const [isSimCardDetailOpen, setIsSimCardDetailOpen] =
    useState<boolean>(false);
  const [iccidData, setIccidData] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [isReservDetailOpen, setIsReservDetailOpen] = useState<boolean>(false);

  // Handle row click
  const handleRowClick = useCallback((rowData: AccNbrDetailsProps) => {
    setSelectedItem(rowData);
    setMode("view");
  }, []);

  const handleRowSelect = (
    id: number,
    checked: boolean,
    data: AccNbrDetailsProps,
  ) => {
    setSelectedRows((prev) => {
      const next = new Map(prev);

      checked ? next.set(id, data) : next.delete(id);

      return next;
    });
  };

  const handleSelectAll = (checked: boolean, data: AccNbrDetailsProps[]) => {
    setSelectedRows((prev) => {
      const next = new Map(prev);

      data.forEach((item) => {
        const id = item.accNbrId;
        if (id === undefined) return;

        checked ? next.set(id, item) : next.delete(id);
      });
      return next;
    });
  };

  const handleSimCardDetail = (iccid: string) => {
    setIccidData(iccid);
    setIsSimCardDetailOpen(true);
  };

  const handleReservation = () => {
    if (selectedRows.size === 0) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleDeReservation = () => {
    //  console.log("De-Reservation clicked");
  };

  const handleBatchMaintenanceByFile = () => {
    setIsBatchMaintenanceModalOpen(true);
  };

  const handleBatchMaintenanceSuccess = () => {
    toast.success("Batch maintenance completed successfully");
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleExportFormat = async (format: string) => {
    // setIsExporting(true);
    // try {
    //   const response = await fetchAccNbrDetails({
    //     page: 0,
    //     size: 100000,
    //     sortBy: "accNbrId",
    //     sortDirection: "DESC",
    //     prefix: "670",
    //     spId: 0,
    //     ...query,
    //   });
    //   switch (format) {
    //     case "xlsx":
    //       exportToXlsx(response.data, "NumberInformation");
    //       break;
    //     case "csv":
    //       exportToCsv(response.data, "NumberInformation");
    //       break;
    //     case "pdf":
    //       exportToPdf(response.data, "NumberInformation");
    //       break;
    //     case "html":
    //       exportToHtml(response.data, "NumberInformation");
    //       break;
    //   }
    // } catch (error) {
    //   toast.error(`Export failed: ${error}`);
    // } finally {
    //   setIsExporting(false);
    // }
  };

  const handleViewHistory = (item: AccNbrDetailsProps) => {
    setSelectedItem(item);
    const fullServiceNumber = `${item.prefix}-${item.accNbr}`;
    setSelectedServiceNumber(fullServiceNumber);
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistory = () => {
    setIsHistoryModalOpen(false);
    setSelectedServiceNumber("");
  };

  const handleReservationOnSuccess = () => {
    // handle refresh data after reservation success
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleReservationDetail = (item: AccNbrDetailsProps) => {
    //  console.log("Reservation Detail clicked for:", item);
    setSelectedItem(item);
    setIsReservDetailOpen(true);
  };

  const columns = useMemo<ColumnDef<AccNbrDetailsProps>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const currentPageData = table
            .getRowModel()
            .rows.map((row) => row.original);
          const selectAll =
            currentPageData.length > 0 &&
            currentPageData.every(
              (item) =>
                item.accNbrId !== undefined && selectedRows.has(item.accNbrId),
            );
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectAll(e.target.checked, currentPageData);
                }}
                className="w-4 h-4 border-gray-300 rounded cursor-pointer accent-gray-600"
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const accNbrId = row.original.accNbrId;
          const isChecked =
            accNbrId !== undefined && selectedRows.has(accNbrId);
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  e.stopPropagation();
                  if (accNbrId !== undefined) {
                    handleRowSelect(accNbrId, e.target.checked, row.original);
                  }
                }}
                className="w-4 h-4 border-gray-300 rounded cursor-pointer accent-gray-600"
              />
            </div>
          );
        },
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "serviceNumber",
        accessorFn: (row) => `${row.prefix}-${row.accNbr}`,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Service Number"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "accNbrClassName",
        accessorFn: (row) => row.accNbrClassName || "",
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Number Grade"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "accNbrTypeName",
        accessorFn: (row) => row.accNbrTypeName,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Number Type"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "accNbrStateName",
        accessorFn: (row) => row.accNbrStateName,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="State" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "isBinding",
        accessorFn: (row) => (row.isBindingFlag === "Y" ? "Yes" : "No"),
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className=""
            title="Is Binding"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "orgName",
        accessorFn: (row) => row.orgName,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Company" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "iccid",
        accessorFn: (row) => row.iccid || "",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="ICCID" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const iccid = row.original.iccid;
          if (!iccid) return;
          return (
            <Button
              variant="ghost"
              className="hover:text-white hover:bg-red-500"
              onClick={() => handleSimCardDetail(iccid)}
            >
              {iccid}
            </Button>
          );
        },
      },
      {
        id: "reservation",
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            className="text-center"
            title="Reservation"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;

          return (
            data.accNbrState === "R" && (
              <div
                className="flex text-center justify-center cursor-pointer text-blue-600 hover:text-blue-400"
                onClick={() => handleReservationDetail(data)}
              >
                Detail
              </div>
            )
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center"></div>,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewHistory(data);
                }}
                title="View History"
              >
                <FileText className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          );
        },
        size: 60,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [selectedRows, selectedItem, handleSelectAll, handleRowSelect],
  );

  return (
    <div className="flex-1 w-full px-2">
      <div className="relative border-[1px] shadow-md h-full pb-5 p-3">
        {/* Header with buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={`h-8 text-sm ${selectedRows.size === 0 ? "opacity-50 pointer-events-none" : ""}`}
              onClick={handleReservation}
              disabled={selectedRows.size === 0}
            >
              Reservation
            </Button>
            <Button
              variant="outline"
              className="h-8 text-sm"
              onClick={handleDeReservation}
              disabled
            >
              De-Reservation
            </Button>
            <Button
              variant="outline"
              className="h-8 text-sm"
              onClick={handleBatchMaintenanceByFile}
              disabled
            >
              Batch Maintenance by File
            </Button>
            <Button
              variant="outline"
              className="h-8 text-sm"
              onClick={handleExport}
              disabled
            >
              Export
            </Button>
          </div>
        </div>

        <DataGridProvider<AccNbrDetailsProps>
          columns={columns}
          key={`${queryTrigger}-${refreshTrigger}`}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          serverSide={true}
          sorting={[{ id: "accNbrId", desc: true }]}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            const page = pageIndex + 1;
            setCurrentPage(page);
            if (!queryTrigger || isReset) {
              return Promise.resolve({ data: [], totalCount: 0 });
            }
            return fetchAccNbrDetails({
              page,
              size: pageSize,
              sortBy: sorting?.[0].id,
              sortDirection: sorting?.[0].desc ? "DESC" : "ASC",
              prefix: "670",
              spId: 0,
            });
          }}
          getRowProps={(row) => ({
            className:
              row.original.accNbrId === selectedItem?.accNbrId
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleRowClick(row.original),
          })}
        />
      </div>

      {/* Detail Section */}
      <div className="mt-4 border-[1px] shadow-md p-4 bg-white">
        <h3 className="text-sm font-semibold mb-4 text-gray-700">Detail</h3>
        <NumberProfileDetailSection />
      </div>

      {/* Modals */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCount={selectedRows.size}
        selectedNumbers={Array.from(selectedRows.values())}
        onSuccess={handleReservationOnSuccess}
      />

      <ServiceNumberHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistory}
        serviceNumber={selectedServiceNumber}
      />

      <ExportFileFormatModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportFormat}
        isExporting={isExporting}
      />

      <BatchMaintenanceModal
        isOpen={isBatchMaintenanceModalOpen}
        onClose={() => setIsBatchMaintenanceModalOpen(false)}
        onSuccess={handleBatchMaintenanceSuccess}
      />

      <SimCardDetail
        isOpen={isSimCardDetailOpen}
        onClose={() => setIsSimCardDetailOpen(false)}
        iccid={iccidData}
      />

      <ReservationDetail
        isOpen={isReservDetailOpen}
        onClose={() => setIsReservDetailOpen(false)}
      />
    </div>
  );
};

export default ChangeNumberProfileTable;
