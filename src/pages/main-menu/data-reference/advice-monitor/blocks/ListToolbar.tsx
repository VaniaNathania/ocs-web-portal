// ListToolbar.tsx
import {
  KeenIcon,
  DefaultTooltip,
  useDataGrid,
  ContentLoader,
} from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import SelectUserDialog from "./SelectUserDialog";
import AdviceDeleteDialog from "./AdviceDeleteDialog";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { useAdviceMonitorContext } from "../hooks/useAdviceMonitorContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

type AdviceChannelOption = {
  adviceChannelName: string;
  adviceChannel: string;
};

type AdviceTypeOption = {
  adviceType: string;
  adviceTypeName: string;
};

export interface FilterState {
  prefix: string;
  serviceId: string;
  state: string;
  adviceChannel: string;
  adviceType: string;
  startTime: string;
  endTime: string;
  user: string;
  states: string; // delivered | not-delivered
  descend: boolean | null; // null = Default (ADVICE_ID DESC)
}

interface ListToolbarProps {
  onFilterChange?: (filters: FilterState) => void;
  filterValues?: FilterState;
  selectedAdviceIds?: string[];
  canDelete?: boolean;
}

type LoadingButton =
  | "filter"
  | "reset"
  | "refresh"
  | "delete"
  | "redirect"
  | null;

const ListToolbar = ({
  onFilterChange,
  filterValues,
  selectedAdviceIds,
  canDelete,
}: ListToolbarProps) => {
  const { menuPrivAccess } = useAdviceMonitorContext();
  const [prefix, setPrefix] = useState(filterValues?.prefix ?? "");
  const [serviceId, setServiceId] = useState(filterValues?.serviceId ?? "");
  const [state, setState] = useState(filterValues?.state ?? "");
  const [startTime, setStartTime] = useState(filterValues?.startTime ?? "");
  const [endTime, setEndTime] = useState(filterValues?.endTime ?? "");
  const [user, setUser] = useState(filterValues?.user ?? "");
  const [states, setStates] = useState(filterValues?.states ?? "delivered");
  const [descend, setDescend] = useState<boolean | null>(
    filterValues?.descend ?? null,
  );

  const [showSelectUserDialog, setShowSelectUserDialog] = useState(false);

  const [adviceChannel, setAdviceChannel] = useState(
    filterValues?.adviceChannel ?? "",
  );
  const [adviceChannelOption, setAdviceChannelOption] = useState<
    AdviceChannelOption[]
  >([]);
  const [loadingAdviceChannel, setLoadingAdviceChannel] = useState(false);

  const [adviceType, setAdviceType] = useState(filterValues?.adviceType ?? "");
  const [adviceTypeOption, setAdviceTypeOption] = useState<AdviceTypeOption[]>(
    [],
  );
  const [loadingAdviceType, setLoadingAdviceType] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { GetData, PutData } = useCallApi();
  const { table, reload, loading: isGridLoading } = useDataGrid() as any;

  // UI helpers
  const labelCls = "text-[11px] text-gray-500 leading-none";
  const inputCls = "h-8";
  const selectTriggerCls = "h-8 px-2 text-sm";
  const fieldCls = "flex flex-col gap-1";

  const emptyFilters: FilterState = useMemo(
    () => ({
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
    }),
    [],
  );

  const isAlreadyEmpty = useMemo(() => {
    if (!filterValues) return false;
    return JSON.stringify(filterValues) === JSON.stringify(emptyFilters);
  }, [filterValues, emptyFilters]);

  const fetchAdviceChannel = useCallback(async () => {
    try {
      setLoadingAdviceChannel(true);
      const response = await GetData(
        `${API_URL_REF}/api/advice-monitor/qry-advice-channel`,
        {},
      );
      setAdviceChannelOption((response.data ?? []) as AdviceChannelOption[]);
    } catch (error) {
      console.error("Failed to fetch advice channels", error);
      setAdviceChannelOption([]);
    } finally {
      setLoadingAdviceChannel(false);
    }
  }, [GetData]);

  useEffect(() => {
    fetchAdviceChannel();
  }, [fetchAdviceChannel]);

  const fetchAdviceType = useCallback(async () => {
    try {
      setLoadingAdviceType(true);
      const response = await GetData(
        `${API_URL_REF}/api/advice-monitor/qry-advice-type`,
        {
          page: 1,
          size: 1000,
          sortBy: "adviceType",
          sortDirection: "ASC",
        },
      );

      if (!response.status || !response.data) {
        setAdviceTypeOption([]);
        return;
      }

      const list: AdviceTypeOption[] = (response.data ?? []).map(
        (item: any) => ({
          adviceType: String(item.adviceType),
          adviceTypeName: String(item.adviceTypeName),
        }),
      );

      setAdviceTypeOption(list);
    } catch (error) {
      console.error("Failed to fetch advice types", error);
      setAdviceTypeOption([]);
    } finally {
      setLoadingAdviceType(false);
    }
  }, [GetData]);

  useEffect(() => {
    fetchAdviceType();
  }, [fetchAdviceType]);

  useEffect(() => {
    if (filterValues) {
      setPrefix(filterValues.prefix ?? "");
      setServiceId(filterValues.serviceId ?? "");
      setState(filterValues.state ?? "");
      setAdviceChannel(filterValues.adviceChannel ?? "");
      setAdviceType(filterValues.adviceType ?? "");
      setStartTime(filterValues.startTime ?? "");
      setEndTime(filterValues.endTime ?? "");
      setUser(filterValues.user ?? "");
      setStates(filterValues.states ?? "delivered");
      setDescend(filterValues.descend ?? null);
    }
  }, [filterValues]);

  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (isGridLoading) {
      wasLoadingRef.current = true;
    } else if (wasLoadingRef.current) {
      setLoadingButton(null);
      wasLoadingRef.current = false;
    }
  }, [isGridLoading]);

  const handleReset = () => {
    setPrefix("");
    setServiceId("");
    setState("");
    setAdviceChannel("");
    setAdviceType("");
    setStartTime("");
    setEndTime("");
    setUser("");
    setStates(emptyFilters.states);
    setDescend(null);

    if (onFilterChange) {
      onFilterChange({ ...emptyFilters });
      if (isAlreadyEmpty) reload();
    }
  };

  const handleFilter = () => {
    try {
      setIsLoading(true);
      setLoadingButton("filter");

      if (onFilterChange) {
        onFilterChange({
          prefix: prefix.trim(),
          serviceId: serviceId.trim(),
          state,
          adviceChannel,
          adviceType,
          startTime,
          endTime,
          user,
          states,
          descend,
        });
      } else {
        toast.error("Filter is not available");
      }
    } catch (error) {
      console.error("❌ Error Filtering data", error);
      toast.error("Failed to apply filter. Please try again.");
    } finally {
      setLoadingButton(null);
      setIsLoading(false);
    }
  };

  const handleRedirect = useCallback(async () => {
    if (!selectedAdviceIds?.length) {
      toast.error("Select at least one row to redirect");
      return;
    }

    const adviceMonitorIds = (selectedAdviceIds ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    if (!adviceMonitorIds.length) {
      toast.error("Selected IDs are invalid");
      return;
    }

    setLoadingButton("redirect");
    try {
      const payload = {
        adviceMonitorIds,
        masterRoute: true,
      };

      const resp = await PutData(
        `${API_URL_REF}/api/advice-monitor/reset-advice-monitor-state-batch`,
        payload,
      );

      if (!resp || resp.status === false) {
        toast.error(resp?.message || "Redirect failed");
        return;
      }

      toast.success("Redirect request submitted");
      table?.resetRowSelection?.();
      reload();
    } catch (e: any) {
      toast.error(e?.message || "Redirect failed. Please try again.");
    } finally {
      setLoadingButton(null);
    }
  }, [PutData, reload, selectedAdviceIds, table]);

  const handleRefresh = () => {
    setLoadingButton("refresh");
    reload();
  };

  const redirectTooltip = !canDelete
    ? "Redirect is only allowed for Not-Delivered"
    : !selectedAdviceIds?.length
      ? "Select at least one row to redirect"
      : "Redirect selected rows";

  const deleteTooltip = !canDelete
    ? "Delete is only allowed for Not-Delivered"
    : !selectedAdviceIds?.length
      ? "Select at least one row to delete"
      : "Delete selected rows";

  return (
    <div className="card-header flex-col gap-5 border-b-0 px-6 py-6">
      <div className="w-full rounded-xl border border-gray-200 bg-gray-50/40 p-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className={fieldCls}>
            <Label className={labelCls}>Service ID</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Prefix"
                className={`${inputCls} w-24 bg-white`}
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <Input
                placeholder="Service ID"
                className={`${inputCls} flex-1 bg-white`}
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              />
            </div>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className={`${selectTriggerCls} bg-white`}>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">Parameter Initial</SelectItem>
                <SelectItem value="A">Ready</SelectItem>
                <SelectItem value="B">Process</SelectItem>
                <SelectItem value="E">Error</SelectItem>
                <SelectItem value="C">Success</SelectItem>
                <SelectItem value="X">Cancel</SelectItem>
                <SelectItem value="U">User Receive Fail</SelectItem>
                <SelectItem value="W">Waiting Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>Advice Channel</Label>
            <Select value={adviceChannel} onValueChange={setAdviceChannel}>
              <SelectTrigger className={`${selectTriggerCls} bg-white`}>
                <SelectValue
                  placeholder={
                    loadingAdviceChannel
                      ? "Loading..."
                      : adviceChannelOption.length === 0
                        ? "No data"
                        : "Select Channel"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {adviceChannelOption.map((item) => (
                  <SelectItem
                    key={item.adviceChannel}
                    value={item.adviceChannel}
                  >
                    {item.adviceChannelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>User</Label>
            <div className="relative">
              <Input
                className={`${inputCls} pr-9 bg-white`}
                placeholder="Select User"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
              <DefaultTooltip title="Select user" placement="top">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={() => setShowSelectUserDialog(true)}
                >
                  <KeenIcon icon="notepad-edit" className="text-sm" />
                </Button>
              </DefaultTooltip>
            </div>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                className={`${inputCls} bg-white`}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                type="date"
                className={`${inputCls} bg-white`}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>Template</Label>
            <Select value={adviceType} onValueChange={setAdviceType}>
              <SelectTrigger className={`${selectTriggerCls} bg-white`}>
                <SelectValue
                  placeholder={
                    loadingAdviceType
                      ? "Loading..."
                      : adviceTypeOption.length === 0
                        ? "No data"
                        : "Select Template"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {adviceTypeOption.map((item) => (
                  <SelectItem key={item.adviceType} value={item.adviceType}>
                    {item.adviceTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>Status</Label>
            <div className="flex h-8 items-center gap-4 rounded-md border border-gray-200 bg-white px-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="radio"
                  name="states"
                  value="delivered"
                  checked={states === "delivered"}
                  onChange={(e) => setStates(e.target.value)}
                  className="h-3.5 w-3.5 border-gray-300 text-primary focus:ring-primary"
                />
                Delivered
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="radio"
                  name="states"
                  value="not-delivered"
                  checked={states === "not-delivered"}
                  onChange={(e) => setStates(e.target.value)}
                  className="h-3.5 w-3.5 border-gray-300 text-primary focus:ring-primary"
                />
                Not-Delivered
              </label>
            </div>
          </div>

          <div className={fieldCls}>
            <Label className={labelCls}>Order By</Label>
            <Select
              value={descend === null ? "default" : descend ? "desc" : "asc"}
              onValueChange={(value) => {
                if (value === "default") setDescend(null);
                else setDescend(value === "desc");
              }}
            >
              <SelectTrigger className={`${selectTriggerCls} bg-white`}>
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Advice ID</SelectItem>
                <SelectItem value="desc">Created Time (Newest)</SelectItem>
                <SelectItem value="asc">Created Time (Oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            className="h-9 border-gray-300 px-4 text-xs text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            onClick={handleReset}
            disabled={isLoading}
          >
            <KeenIcon icon="arrow-circle-left" className="mr-1.5 text-sm" />{" "}
            Reset
          </Button>
          <Button
            variant="outline"
            className="h-9 border-gray-300 px-4 text-xs text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            disabled={isLoading}
            onClick={handleRefresh}
          >
            {loadingButton === "refresh" ? (
              <ContentLoader />
            ) : (
              <>
                <KeenIcon icon="arrows-circle" className="mr-1.5 text-sm" />{" "}
                Refresh
              </>
            )}
          </Button>
          <Button
            variant="default"
            className="h-9 px-6 text-xs font-semibold shadow-sm"
            disabled={isLoading}
            onClick={handleFilter}
          >
            {loadingButton === "filter" ? (
              <ContentLoader />
            ) : (
              <>
                <KeenIcon icon="filter" className="mr-1.5 text-sm" /> Apply
                Filter
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {/* <DefaultTooltip title={redirectTooltip} placement="top"> */}
        <AccessWrapper
          hasAccess={menuPrivAccess.editStatus}
          enabledText={redirectTooltip}
        >
          <Button
            variant="outline"
            className="h-9 border-dashed text-xs"
            disabled={
              isLoading ||
              !canDelete ||
              !selectedAdviceIds?.length ||
              loadingButton === "redirect"
            }
            onClick={handleRedirect}
          >
            {loadingButton === "redirect" ? (
              <ContentLoader />
            ) : (
              <>
                <KeenIcon icon="arrow-circle-left" className="mr-2" />
                Redirect Selected
              </>
            )}
          </Button>
        </AccessWrapper>
        {/* </DefaultTooltip> */}

        {/* <DefaultTooltip title={deleteTooltip} placement="top"> */}
        <AccessWrapper
          hasAccess={menuPrivAccess.deleteStatus}
          enabledText={deleteTooltip}
        >
          <Button
            variant="outline"
            onClick={() => setOpenDeleteDialog(true)}
            disabled={isLoading || !canDelete || !selectedAdviceIds?.length}
            className="h-9 border-red-200 bg-red-50 text-xs text-red-600 hover:border-red-300 hover:bg-red-100"
          >
            <KeenIcon icon="trash" className="mr-2 text-red-500" />
            Delete Selected
          </Button>
        </AccessWrapper>
        {/* </DefaultTooltip> */}
      </div>

      <SelectUserDialog
        isOpen={showSelectUserDialog}
        handleDialog={setShowSelectUserDialog}
        onUserSelect={(selected) => {
          // Use user code for filtering
          setUser(selected.code);
        }}
      />

      <AdviceDeleteDialog
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        selectedAdviceIds={selectedAdviceIds ?? []}
        canDelete={!!canDelete}
        states={states}
        onDeleteSuccess={() => {
          table?.resetRowSelection?.();
          reload();
        }}
      />
    </div>
  );
};

export default ListToolbar;
