// AdviceMonitorTable.tsx
import {
  DataGridColumnHeader,
  DataGridProvider,
} from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import ListToolbar, { FilterState } from "../blocks/ListToolbar";
import { toast } from "sonner";
import MessageMonitoringDetailDialog from "../blocks/MessageMonitoringDetailDialog";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL_REF = apiConfigRef.ref;

const AdviceMonitorTable = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedAdviceIds, setSelectedAdviceIds] = useState<string[]>([]);


  const currentPageRowsRef = useRef<any[]>([]);
  const lastTotalCountRef = useRef<number>(0);

  const [filterState, setFilterState] = useState<FilterState>({
    prefix: "",
    serviceId: "",
    state: "",
    adviceChannel: "",
    adviceType: "",
    startTime: "",
    endTime: "",
    user: "",
    states: "delivered",
    descend: null,
  });

  const { GetData } = useCallApi();

  const handleFilterChange = (filters: FilterState) => {
    setSelectedAdviceIds([]);
    setFilterState(filters);
  };

  const getStateLabel = (stateCode: string): string => {
    const stateMap: Record<string, string> = {
      I: "Parameter Initial",
      A: "Ready",
      B: "Process",
      E: "Error",
      C: "Success",
      X: "Cancel",
      U: "User Receive Fail",
      W: "Waiting Feedback",
    };
    return stateMap[stateCode] || stateCode;
  };

  const formatDateTimeDisplay = (value?: string | null): string => {
    if (!value) return "";

    const asString = String(value).trim();
    const withoutMillis = asString.replace("T", " ").split(".")[0];
    return withoutMillis.replace(/Z$/, "");
  };

  /** DD-MM-YYYY HH:mm:ss for not-delivered view */
  const formatDateTimeDDMMYYYY = (value?: string | null): string => {
    if (!value) return "";
    const date = new Date(String(value).trim());
    if (Number.isNaN(date.getTime())) return formatDateTimeDisplay(value);
    const dd = String(date.getDate()).padStart(2, "0");
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dd}-${MM}-${yyyy} ${HH}:${mm}:${ss}`;
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        accessorFn: (row) => row.select,
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => {
                if (filterState.states === "delivered") return;
                table.toggleAllPageRowsSelected(!!value);
              }}
              aria-label="Select all"
              className="align-[inherit]"
              disabled={filterState.states === "delivered"}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                if (filterState.states === "delivered") return;
                row.toggleSelected(!!value);
              }}
              aria-label="Select row"
              className="align-[inherit]"
              disabled={filterState.states === "delivered"}
            />
          </div>
        ),
      },
      {
        id: "userName",
        accessorFn: (row) => row.userName,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="User Name" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
              setSelectedRowData(row.original);
            }}
            className="cursor-pointer hover:bg-gray-50 hover:underline"
          >
            {row.original.userName}
          </div>
        ),
      },
      {
        id: "smsIdentity",
        accessorFn: (row) => row.smsIdentity,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="SMS Identity" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
              setSelectedRowData(row.original);
            }}
            className="cursor-pointer hover:bg-gray-50 hover:underline"
          >
            {row.original.smsIdentity}
          </div>
        ),
      },
      {
        id: "serviceId",
        accessorFn: (row) => row.serviceId,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Service ID" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "channel",
        accessorFn: (row) => row.channel,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Advice Channel" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "template",
        accessorFn: (row) => row.template,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Message Template" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "message",
        accessorFn: (row) => row.message,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Message" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "receiveAddress",
        accessorFn: (row) => row.receiveAddress,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Receive Address" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "state",
        accessorFn: (row) => row.state,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="State" />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
              setSelectedRowData(row.original);
            }}
            className="cursor-pointer hover:bg-gray-50 hover:underline"
          >
            {getStateLabel(row.original.state || "")}
          </div>
        ),
      },
      {
        id: "createdTime",
        accessorFn: (row) => row.createdTime,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="Created Time" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "stateTime",
        accessorFn: (row) => row.stateTime,
        header: ({ column }) => (
          <DataGridColumnHeader column={column} className="" title="State Time" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [filterState.states]
  );

  const fetchAdvice = useCallback(
    async (pageIndex: number, pageSize: number) => {
      try {
        const prefixTrimmed = String(filterState.prefix || "").trim();
        const accNbrTrimmed = String(filterState.serviceId || "").trim();

        const startDate = filterState.startTime || "";
        const endDate = filterState.endTime || "";

        let startTimePayload: string | null = startDate || null;
        let endTimePayload: string | null = endDate || null;

        if (endDate) {
          const end = new Date(endDate);
          if (!Number.isNaN(end.getTime())) {
            end.setDate(end.getDate() + 1);
            const yyyy = end.getFullYear();
            const mm = String(end.getMonth() + 1).padStart(2, "0");
            const dd = String(end.getDate()).padStart(2, "0");
            endTimePayload = `${yyyy}-${mm}-${dd}`;
          }
        }

        const payload: any = {
          masterRoute: true,
          page: pageIndex + 1,
          size: pageSize,
          startTime: startTimePayload,
          endTime: endTimePayload,
        };

        if (prefixTrimmed) payload.prefix = prefixTrimmed;
        if (accNbrTrimmed) payload.accNbr = accNbrTrimmed;
        if (filterState.state) payload.state = filterState.state;
        if (filterState.adviceChannel) payload.adviceChannel = filterState.adviceChannel;
        if (filterState.adviceType) payload.adviceType = filterState.adviceType;
        if (filterState.user) payload.user = filterState.user;
        if (filterState.states) payload.states = filterState.states;

        // ✅ sort
        if (filterState.descend === null) {
          payload.sortBy = "ADVICE_ID";
          payload.sortDirection = "desc";
        } else {
          payload.sortBy = "CREATED_DATE";
          payload.sortDirection = filterState.descend ? "desc" : "asc";
        }

        const apiUrl =
          filterState.states === "not-delivered"
            ? `${API_URL_REF}/api/advice-monitor/qry-advice-no-history`
            : `${API_URL_REF}/api/advice-monitor/qry-advice-has-history`;

        if (filterState.states !== "not-delivered") {
          payload.adviceHis = "Y";
        }

        const response = await GetData(apiUrl, payload);

        if (!response || response.status === false) {
          toast.error(response?.message || "Failed to load data");
          return { data: [], totalCount: lastTotalCountRef.current || 0 };
        }

        const isNotDelivered = filterState.states === "not-delivered";
        const formatDate = isNotDelivered ? formatDateTimeDDMMYYYY : formatDateTimeDisplay;

        const tableData = (response.data || []).map((item: any) => ({
          userName: item.userName || "",
          smsIdentity: String(item.adviceId || ""),
          serviceId: item.accNbr || "",
          channel: item.adviceChannelName || "",
          template: item.adviceTypeName || "",
          message: item.msg || "",
          receiveAddress: item.accNbr || "",
          state: item.state || "",
          createdTime: formatDate(item.createdDate),
          stateTime: formatDate(item.stateDate),
          ...item,
        }));

        const totalCount =
          (response as any).totalRows != null ? Number((response as any).totalRows) : tableData.length;

        currentPageRowsRef.current = tableData;
        lastTotalCountRef.current = totalCount;

        return { data: tableData, totalCount };
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error");
        return { data: [], totalCount: lastTotalCountRef.current || 0 };
      }
    },
    [GetData, filterState]
  );

  const filterKey = useMemo(() => JSON.stringify(filterState), [filterState]);

  const canDelete = filterState.states === "not-delivered";

  return (
    <div className="flex-1 border-[1px] shadow-md h-full p-3 overflow-y-auto relative">
      <DataGridProvider
        key={filterKey}
        columns={columns}
        data={[]}
        serverSide={true}
        rowSelection={true}
        pagination={{ size: 10 }}
        toolbar={
          <ListToolbar
            onFilterChange={handleFilterChange}
            filterValues={filterState}
            selectedAdviceIds={selectedAdviceIds}
            canDelete={canDelete}
          />
        }
        onRowSelectionChange={(value: any) => {
          const ids: string[] = [];

          Object.keys(value || {}).forEach((k) => {
            if (value[k]) {
              const index = Number(k);
              const row = currentPageRowsRef.current?.[index];
              const id = row?.adviceId;
              if (id !== null && id !== undefined && id !== "") ids.push(String(id));
            }
          });

          setSelectedAdviceIds(ids);
        }}
        onFetchData={({ pageIndex, pageSize }) => fetchAdvice(pageIndex, pageSize)}
      />

      <MessageMonitoringDetailDialog
        isOpen={isDialogOpen}
        handleDialog={setIsDialogOpen}
        rowData={selectedRowData}
        useDateFormatDDMMYYYY={filterState.states === "not-delivered"}
      />
    </div>
  );
};

export default AdviceMonitorTable;
