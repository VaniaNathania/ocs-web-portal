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
  useDataGrid,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { Input } from "@/components/ui/input";

interface OrganizationSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  organizationData: (data: OrgData) => void;
}

export interface OrgData {
  orgId: number;
  parentOrgId: number;
  orgName: string;
  orgType: string;
  areaId: number;
  state: string;
  orgCode: string;
  spId: number;
}

const API_URL_OFFER = apiConfigOffer.offer;

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  isOpen,
  onClose,
  organizationData,
}) => {
  const { GetData } = useCallApi();

  const [filterBy, setFilterBy] = useState<string>("orgName");
  const [selectedItem, setSelectedItem] = useState<OrgData | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [handleIds, setHandleIds] = useState<number[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [row, setRow] = useState<OrgData[]>([]);

  const handleOk = async (data: OrgData) => {
    organizationData(data);
    onClose?.();
    setSelectedItem(null);
  };

  const handleOkShowInfo = () => {
    if (currentId !== null) {
      setHandleIds((prev) => [...prev, currentId]);
      setCurrentId(null);
    }
    setShowInfo(false);
  };

  const handleCancel = () => {
    onClose?.();
    setSelectedItem(null);
  };

  const handleItemClick = (item: OrgData) => {
    setSelectedItem(item);
  };

  const handleOperationClick = (id: number) => {
    setCurrentId(id);
    setShowInfo(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setHandleIds([]);
    }
    fetchRow();
  }, [isOpen]);

  const fetchRow = async () => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-org-list`,
        {
          parentId: null,
          areaId: 1,
          orgName: null,
          orgCode: null,
          orgType: null,
          state: "A",
          spId: 0,
        },
      );

      if (response?.data && Array.isArray(response.data)) {
        return setRow(response.data);
      } else {
        console.warn("⚠️ No available data or invalid data format:", response);
        return setRow([]);
      }
    } catch (error) {
      console.error("❌ Available Features API Error:", error);
      toast.error("Error loading available feature data");
      return setRow([]);
    }
  };

  // Available Features DataGrid Columns
  const Column = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.orgName,
        id: "orgName",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Org Name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const name = row.original.orgName;
          // const isSelected = selectedItem?.orgId === row.original.orgId;
          return (
            <div
            // className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"}`}
            // onClick={() => handleItemClick(row.original)}
            >
              {name}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.orgCode,
        id: "orgCode",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Org Code" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const code = row.original.orgCode;
          // const isSelected = selectedItem?.orgId === row.original.orgId;
          return (
            <div
            // className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"}`}
            // onClick={() => handleItemClick(row.original)}
            >
              {code}
            </div>
          );
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
          const data = row.original;
          const isHandled = handleIds.includes(data.orgId);

          return (
            <div className="flex items-center justify-center">
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={() => handleOperationClick(data.orgId)}
              >
                {!isHandled ? (
                  <KeenIcon
                    icon="data"
                    className="text-blue-400 p-1 border border-gray-300 rounded hover:bg-zinc-300"
                  />
                ) : null}
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
    [selectedItem, handleIds],
  );

  const ListToolBarOrganizationSelector = () => {
    const { table } = useDataGrid();
    const filterOption = [
      { value: "orgName", label: "Organization Name" },
      { value: "orgCode", label: "Organization Code" },
    ];
    const [searchValue, setSearchValue] = useState<string>("");

    const selectLabel =
      filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

    useEffect(() => {
      table.setColumnFilters([{ id: filterBy, value: searchValue }]);
    }, [filterBy, searchValue]);
    return (
      <div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2 mt-5">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-32 px-2 py-1 text-xs h-8">
              <SelectValue placeholder={`Search ${selectLabel}..`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orgName">Organization Name</SelectItem>
              <SelectItem value="orgCode">Organization Code</SelectItem>
            </SelectContent>
          </Select>

          <label className="input input-sm flex items-center gap-2">
            <Input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full border-0 p-0"
              placeholder={`Search ${selectLabel}..`}
            />
            <KeenIcon icon="magnifier" />
          </label>
        </div>
        <h1 className="text-gray-500 p-2">Root</h1>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl h-fit flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Organization Selector</DialogTitle>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-auto px-6">
          <div className="flex h-full gap-4">
            {/* Left Panel - Available Features */}
            <div className="flex-1 border-r flex flex-col min-h-0 pr-4">
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider
                  //   key={refreshTrigger}
                  data={row}
                  columns={Column}
                  pagination={{ size: 10 }}
                  toolbar={<ListToolBarOrganizationSelector />}
                  layout={{ card: false }}
                  sorting={[{ id: "attrName", desc: false }]}
                  serverSide={false}
                  getRowProps={(row) => ({
                    className:
                      row.original.orgId === selectedItem?.orgId
                        ? selectedRowHighLight
                        : nonSelectedRowHighLight,
                    onClick: () => setSelectedItem(row.original),
                    // ADD THIS REF CALLBACK:
                  })}
                  // onFetchData={({
                  //   pageIndex,
                  //   pageSize,
                  //   sorting,
                  //   columnFilters,
                  // }) => {
                  //   return doGetOrgList(
                  //     pageIndex + 1,
                  //     pageSize,
                  //     sorting,
                  //     columnFilters,
                  //   );
                  // }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedItem) {
                  handleOk(selectedItem);
                }
              }}
              className="disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {showInfo && (
        <Dialog open={showInfo} onOpenChange={() => setShowInfo(false)}>
          <DialogContent className="max-w-[400px] h-fit flex flex-col p-0 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b justify-start gap-1">
              <KeenIcon icon="information" className="text-lg text-blue-700" />
              <DialogTitle>Information</DialogTitle>
            </DialogHeader>

            <div className="flex text-center py-6 ">
              <span>
                There are no sub organizations under this organization.
              </span>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t flex justify-end items-center">
              <Button
                onClick={handleOkShowInfo}
                className="disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default OrganizationSelector;
