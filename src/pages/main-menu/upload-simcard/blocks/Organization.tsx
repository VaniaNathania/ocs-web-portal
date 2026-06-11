import React, { useState, useMemo, useCallback, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { UseFormSetValue } from "react-hook-form";
import { UploadSimCardForm } from "../schema/UploadSimCardTypeSchema";
import ListToolbarOrganization from "./ListToolbarOrganization";

interface OrganizationProps {
  isOpen?: boolean;
  onClose?: () => void;
  organizationData: (data: OrgData) => void;
  setValue?: UseFormSetValue<UploadSimCardForm>;
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

const Organization: React.FC<OrganizationProps> = ({ isOpen, onClose, organizationData, setValue }) => {
  const { GetData } = useCallApi();
  const [selectedItem, setSelectedItem] = useState<OrgData | null>(null);
  const [orgList, setOrgList] = useState<OrgData[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleOk = async (data: OrgData) => {
    organizationData(data);
    onClose?.();
    setSelectedItem(null);
  };

  const handleCancel = () => {
    onClose?.();
    setSelectedItem(null);
  };

  const handleItemClick = (item: OrgData) => {
    setSelectedItem(item);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
    }
  }, [isOpen]);

  const doGetOrgList = useCallback(async (page: number, limit: number, sorting: any, filter: any) => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-org-list`, {
        parentId: null,
        areaId: 1,
        orgName: null,
        orgCode: null,
        orgType: null,
        spId: 0,
      });

      if (response?.data && Array.isArray(response.data)) {
        setOrgList(response.data);
        setSelectedItem(response.data[0]);

        return {
          data: response.data || [],
          totalCount: response.data.length || 0,
        };
      }
    } catch (error) {
      console.error(error);
      toast.error("Error Get data");
      return {
        data: [],
        totalCount: 0,
      };
    }
  }, []);

  // Available Features DataGrid Columns
  const Column = useMemo<ColumnDef<OrgData>[]>(
    () => [
      {
        accessorFn: (row) => row.orgName,
        id: "OrgName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Org Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.orgCode,
        id: "orgCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Org Code" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedItem]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Organization Selector</DialogTitle>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-auto px-6">
          <div className="flex h-full gap-4">
            {/* Left Panel - Available Features */}
            <div className="flex-1 border-r flex flex-col min-h-0 pr-4">
              <ListToolbarOrganization orgList={orgList} handleItemClick={handleItemClick} />
              <div className="flex-1 overflow-auto min-h-0">
                <DataGridProvider<OrgData>
                  columns={Column}
                  pagination={{ size: 10 }}
                  layout={{ card: false }}
                  sorting={[{ id: "orgName", desc: false }]}
                  getRowProps={(row) => ({
                    className: row.original.orgId === selectedItem?.orgId ? selectedRowHighLight : nonSelectedRowHighLight,
                    onClick: () => handleItemClick(row.original),
                  })}
                  serverSide={true}
                  onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                    return doGetOrgList(pageIndex + 1, pageSize, sorting, columnFilters);
                  }}
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
    </Dialog>
  );
};

export default Organization;
