import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import { UserMData } from "../hook/LogManagementProvider";
import { Loading } from "../../../role-management/block/loadingBlock";
import { ConfirmDialogUser } from "./confirmationDialog";
import { useLogManagement } from "../hook/useLogManagement";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { apiConfigLog } from "@/config/api.config";

const API_URL = apiConfigLog;

export const LogManagementTable = () => {
  const {
    selectedRow,
    setSelectedRow,
    query,
    user,
    setQuery,
    total,
    loading,
    showConfirm,
    setShowConfirm,
    onConfirm,
    desc,
  } = useLogManagement();

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!query?.eventType) {
      toast.error("Please select Event Type filter first");
      return;
    }

    const eventType = query.eventType.toLowerCase();
    //  console.log("🚀 Export started for:", eventType);

    setIsExporting(true);

    try {
      const endpoint =
        eventType === "login"
          ? `${API_URL}/api/log-management/export-log/login`
          : `${API_URL}/api/log-management/export-log/logout`;

      // console.log("📡 Calling:", endpoint);

      const params: Record<string, string> = {};
      // if (query?.eventCode) params.eventCode = query.eventCode;
      // if (query?.comments) params.comments = query.comments;
      // if (query?.startTime) params.startTime = query.startTime;
      // if (query?.endTime) params.endTime = query.endTime;

      // console.log("📋 Params:", params);

      // ✅ GET REQUEST
      const response = await axios.get(endpoint, {
        params: params,
        responseType: "blob",
        timeout: 30000,
      });

      // console.log("✅ Response received, size:", response.data.size);

      if (response.data.size === 0) {
        toast.error("No data available to export");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      let filename =
        eventType === "login"
          ? `logManagement_Login_${today}.xlsx`
          : `logManagement_Logout_${today}.xlsx`;

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      if (disposition && typeof disposition === "string") {
        const match = disposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match?.[1]) {
          filename = match[1].replace(/['"]/g, "");
        }
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // console.log("✅ Export success:", filename);
      toast.success(
        `${eventType === "login" ? "Login" : "Logout"} log exported successfully`,
      );
    } catch (error: any) {
      console.error("❌ Export error:", error);

      let message = "Failed to export data";

      if (error.response) {
        if (error.response.status === 403) {
          message = "Access denied. Please check your permissions.";
        } else if (error.response.status === 404) {
          message = "Export endpoint not found";
        } else if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const data = JSON.parse(text);
            message = data.message || data.error || message;
          } catch {
            message = `Server error: ${error.response.status}`;
          }
        } else {
          message =
            error.response.data?.message || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        message = "No response from server. Please check your connection.";
      } else {
        message = error.message || message;
      }

      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const [tableKey, setTableKey] = useState(0);
  const prevQueryRef = useRef<typeof query>();

  useEffect(() => {
    const prev = prevQueryRef.current;
    if (prev) {
      const isFilterChange =
        prev.logId !== query?.logId ||
        prev.eventType !== query?.eventType ||
        prev.eventCode !== query?.eventCode ||
        prev.srcIp !== query?.srcIp ||
        prev.startTime !== query?.startTime ||
        prev.endTime !== query?.endTime ||
        prev.comments !== query?.comments;

      const isResetToPageOne = query?.page === 1 && prev.page !== 1;
      if (isFilterChange || isResetToPageOne) {
        setTableKey((prev) => prev + 1);
      }
    }

    prevQueryRef.current = query;
  }, [query]);

  const handleSelectRow = (row: UserMData) => {
    if (row.logId !== selectedRow?.logId) setSelectedRow(row);
  };

  const availableColumns = useMemo<ColumnDef<UserMData>[]>(
    () => [
      {
        accessorFn: (row) => row.logId,
        id: "logId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Log ID" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.logId}</div>,
        // enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.userName,
        id: "userName",
        header: ({ column }) => (
          <DataGridColumnHeader title="User Name" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.userName || "-"}</div>,
        // enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.eventType,
        id: "eventType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Event Type" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.eventType || "-"}</div>,
        // enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.eventCode,
        id: "eventCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Event Code" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.eventCode || "-"}</div>,
        // enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.logDate,
        id: "logDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Log Date" column={column} />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.logDate;
          if (dateStr && dateStr !== "-") {
            try {
              return <div>{new Date(dateStr).toLocaleString()}</div>;
            } catch {
              return <div>{dateStr}</div>;
            }
          }
          return <div>-</div>;
        },
        // enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remarks" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.comments || "-"}</div>,
        meta: {
          cellClassName: "max-w-[200px]",
        },
        // enableSorting: false,
        enableHiding: false,
      },
    ],
    [user],
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        const updates: any = {};
        let shouldUpdate = false;

        if (limit !== query?.size) {
          updates.size = limit;
          shouldUpdate = true;
        }

        if (page !== query?.page) {
          updates.page = page;
          shouldUpdate = true;
        }

        if (sorting.length > 0) {
          const sortBy = sorting[0].id;
          const sortDirection = sorting[0].desc ? "desc" : "asc";

          if (
            query?.sortBy !== sortBy ||
            query?.sortDirection !== sortDirection
          ) {
            updates.sortBy = sortBy;
            updates.sortDirection = sortDirection;
            shouldUpdate = true;
          }
        }

        if (shouldUpdate) {
          setQuery((prev) => ({ ...prev, ...updates }));
        }

        return {
          data: user,
          pageCount: Math.ceil(total / limit),
          totalCount: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        };
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        return {
          data: [],
          pageCount: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
    },
    [query, user, total, setQuery],
  );

  return (
    <div className="relative shadow-md h-full px-5">
      <ConfirmDialogUser
        isOpen={showConfirm}
        handleDialog={setShowConfirm}
        onConfirm={onConfirm}
        desc={desc}
      />

      <div className="bg-white rounded-md shadow-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 text-sm"
              onClick={handleExport}
              disabled={isExporting || loading}
            >
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            {/* {query?.eventType ? (
              <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                Will export: <strong>{query.eventType}</strong>
              </span>
            ) : (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ Select Event Type first
              </span>
            )} */}
          </div>
        </div>

        <div className="relative">
          {loading && <Loading />}
          <DataGridProvider
            key={`login-log-table-${tableKey}`}
            columns={availableColumns}
            pagination={{
              size: query?.size || 10,
            }}
            layout={{ card: false }}
            sorting={[
              {
                id: query?.sortBy || "logDate",
                desc: query?.sortDirection === "desc",
              },
            ]}
            serverSide={true}
            rowSelection={false}
            data={user}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
              doGetAvailableData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              )
            }
          />
        </div>
      </div>
    </div>
  );
};
