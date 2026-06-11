import React, { useState, useMemo, useCallback } from "react";
import { Alert, DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import AddBelongOfferGroup from "../../blocks/AddBelongOfferGroup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface BelongOfferGroup {
  offerId: number;
  offerGroupId: number;
  offerGroupMemId: number;
  defaultFlag: string;
  offerGroupName: string;
  groupType: string;
  agreementPeriod: number;
  timeUnit: string;
}

interface BelongOfferGroupData {
  category: string;
  rowData: any;
  countBelongInOfferGroup: () => Promise<void>;
}

interface EditingRow {
  offerGroupMemId: number;
  agreementPeriod: number | null;
  timeUnit: string | null;
  defaultFlag: string | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const TIME_UNIT_OPTIONS = [
  { value: "Y", label: "Year" },
  { value: "M", label: "Month" },
  { value: "W", label: "Week" },
  { value: "D", label: "Day" },
  { value: "H", label: "Hour" },
  { value: "C", label: "Billing Cycle" },
];

const BelongOfferGroup: React.FC<BelongOfferGroupData> = ({ category, rowData, countBelongInOfferGroup }) => {
  const { GetData, PutData } = useCallApi();
  const {menuPrivAccess} = useOfferLayout()
  const [belongGroup, setBelongGroup] = useState<BelongOfferGroup[]>([]);
  const [showAddBelongInGroup, setShowBelongInGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRowToDelete, setSelectedRowToDelete] = useState<BelongOfferGroup | null>(null);

  const handleShowAddBelong = useCallback((open: boolean) => {
    setShowBelongInGroup(open);
  }, []);

  const handleReload = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  const handleEditRow = useCallback((row: BelongOfferGroup) => {
    setEditingRow({
      offerGroupMemId: row.offerGroupMemId,
      agreementPeriod: row.agreementPeriod,
      timeUnit: row.timeUnit,
      defaultFlag: row.defaultFlag,
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingRow) return;

    try {
      setLoading(true);
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-group-mem-by-offer-id`, {
        offerId: rowData.offerId || rowData.id,
      });

      const existingData = response?.data ?? [];

      const updatedData = existingData.map((item: BelongOfferGroup) => {
        if (item.offerGroupMemId === editingRow.offerGroupMemId) {
          return {
            ...item,
            agreementPeriod: editingRow.agreementPeriod,
            timeUnit: editingRow.timeUnit,
            defaultFlag: editingRow.defaultFlag,
          };
        }
        return item;
      });

      const payload = updatedData.map((item: BelongOfferGroup) => ({
        offerGroupId: item.offerGroupId,
        offerId: item.offerId,
        agreementPeriod: item.agreementPeriod,
        timeUnit: item.timeUnit,
        defaultFlag: item.defaultFlag,
        groupType: item.groupType || "c",
      }));

      const requestPayload = {
        offerId: Number(rowData.offerId || rowData.id),
        offerGroupMemRequest: payload,
        offerGroupType: 3,
      };

      await PutData(`${API_URL_OFFER}/offer/group/join-offer-group`, requestPayload);
      toast.success("Data berhasil diupdate");
      setEditingRow(null);
      handleReload();
    } catch (error) {
      console.error("❌ Error updating:", error);
      toast.error("Gagal mengupdate data");
    } finally {
      setLoading(false);
    }
  }, [editingRow, GetData, PutData, handleReload, rowData]);

  const handleDeleteRow = useCallback(async () => {
    if (!selectedRowToDelete) return;

    try {
      setLoading(true);

      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-group-mem-by-offer-id`, {
        offerId: rowData.offerId || rowData.id,
      });

      const existingData = response?.data ?? [];

      const filteredData = existingData.filter(
        (item: BelongOfferGroup) => item.offerGroupMemId !== selectedRowToDelete.offerGroupMemId
      );

      const payload = filteredData.map((item: BelongOfferGroup) => ({
        offerGroupId: item.offerGroupId,
        offerId: item.offerId,
        agreementPeriod: item.agreementPeriod,
        timeUnit: item.timeUnit,
        defaultFlag: item.defaultFlag,
        groupType: item.groupType || "c",
      }));

      const requestPayload = {
        offerId: Number(rowData.offerId || rowData.id),
        offerGroupMemRequest: payload,
        offerGroupType: 3,
      };

      await PutData(`${API_URL_OFFER}/offer/group/join-offer-group`, requestPayload);
      countBelongInOfferGroup()

      toast.success("Data berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedRowToDelete(null);
      handleReload();
    } catch (error) {
      console.error("❌ Error deleting:", error);
      toast.error("Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  }, [GetData, PutData, handleReload, rowData, selectedRowToDelete]);

  // Data Grid Columns dengan key yang stabil
  const columns = useMemo<ColumnDef<BelongOfferGroup>[]>(
    () => [
      {
        accessorFn: (row) => row.offerGroupName,
        id: "offerGroupName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Group Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.agreementPeriod,
        id: "agreementPeriod",
        header: ({ column }) => <DataGridColumnHeader className="" title="Agreement Period" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const belongGroupItem = row.original;
          const isEditing = editingRow?.offerGroupMemId === belongGroupItem.offerGroupMemId;

          if (isEditing) {
            return (
              <div key={`edit-${belongGroupItem.offerGroupMemId}`} className="flex gap-2 w-full max-w-[200px]">
                <div className="flex-1">
                  <input
                    type="number"
                    value={editingRow.agreementPeriod || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      setEditingRow((prev) => (prev ? { ...prev, agreementPeriod: value } : null));
                    }}
                    placeholder="Input Agreement Period"
                    className="w-full input"
                    autoFocus
                  />
                </div>

                <div className="flex-1">
                  <Select
                    /**
                     * Cell renderer for the Default Choice column.
                     * Conditionally renders a checkbox if the row is being edited,
                     * or a green checklist icon if the defaultChoice is true,
                     * or a dash if the defaultChoice is false.
                     */
                    value={editingRow.timeUnit || ""}
                    onValueChange={(value) => setEditingRow((prev) => (prev ? { ...prev, timeUnit: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          }

          const timeUnitLabel = TIME_UNIT_OPTIONS.find((opt) => opt.value === belongGroupItem.timeUnit)?.label;

          return (
            <div>
              {belongGroupItem.agreementPeriod && timeUnitLabel
                ? `${belongGroupItem.agreementPeriod} ${timeUnitLabel}`
                : "-"}
            </div>
          );
        },
      },

      {
        accessorFn: (row) => row.defaultFlag,
        id: "defaultFlag",
        header: ({ column }) => <DataGridColumnHeader className="" title="Default Choice" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const belongGroupItem = row.original;
          const isEditing = editingRow?.offerGroupMemId === belongGroupItem.offerGroupMemId;

          if (isEditing) {
            return (
              <div key={`flag-${belongGroupItem.offerGroupMemId}`} className="flex gap-2">
                <button
                  className={`px-3 py-1 text-sm border rounded ${editingRow.defaultFlag === "Y"
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-100 border-gray-300"
                    }`}
                  onClick={() => setEditingRow((prev) => (prev ? { ...prev, defaultFlag: "Y" } : null))}
                >
                  Yes
                </button>
                <button
                  className={`px-3 py-1 text-sm border rounded ${editingRow.defaultFlag === "N"
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-100 border-gray-300"
                    }`}
                  onClick={() => setEditingRow((prev) => (prev ? { ...prev, defaultFlag: "N" } : null))}
                >
                  No
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              {belongGroupItem.defaultFlag === "Y" ? (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <KeenIcon icon="check" className="text-white text-xs" />
                </div>
              ) : belongGroupItem.defaultFlag === "N" ? (
                <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                  <KeenIcon icon="cross" className="text-white text-xs" />
                </div>
              ) : (
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              )}
            </div>
          );
        },
      },
      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Options" className="text-center" column={column} />,
        cell: ({ row }) => {
          const belongGroupItem = row.original;
          const isEditing = editingRow?.offerGroupMemId === belongGroupItem.offerGroupMemId;

          if (isEditing) {
            return (
              <div className="flex items-center justify-center gap-2">
                <button
                  className="btn btn-sm btn-icon btn-success"
                  onClick={handleSaveEdit}
                  disabled={loading}
                  title="Save"
                >
                  <KeenIcon icon="check" />
                </button>
                <button
                  className="btn btn-sm btn-icon btn-danger"
                  onClick={() => setEditingRow(null)}
                  disabled={loading}
                  title="Cancel"
                >
                  <KeenIcon icon="cross" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleEditRow(belongGroupItem)}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setSelectedRowToDelete(belongGroupItem);
                  setIsDeleteModalOpen(true);
                }}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [editingRow, loading, handleSaveEdit, handleEditRow]
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      if (!rowData?.offerId && !rowData?.id) {
        console.warn("❗ No offerId or id provided in rowData");
        return { data: [], totalCount: 0 };
      }

      const offerId = rowData.offerId || rowData.id;

      try {
        const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-group-mem-by-offer-id`, {
          offerId: offerId,
        });

        const result = response?.data ?? [];
        setBelongGroup(result);

        let processedData = [...result];

        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof BelongOfferGroup];
            const bValue = b[id as keyof BelongOfferGroup];

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            }

            if (aValue < bValue) return desc ? 1 : -1;
            if (aValue > bValue) return desc ? -1 : 1;
            return 0;
          });
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = processedData.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          totalCount: processedData.length,
        };
      } catch (error) {
        toast.error("❌ Failed to fetch feature data");
        return { data: [], totalCount: 0 };
      }
    },
    [rowData, GetData]
  );

  const FeatureToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center p-4">
      <div className="flex gap-3">
        <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
          <Button variant="default" className="h-7.5" onClick={() => handleShowAddBelong(true)}>
            <KeenIcon icon="plus" />
            New
          </Button>
        </AccessWrapper>
       

        <DefaultTooltip title="Refresh" placement="top">
          <Button variant="outline" className="h-7.5" onClick={handleReload}>
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mt-4">
      <DataGridProvider
        key={reloadKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<FeatureToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "offerGroupName", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
        }}
      />

      <AddBelongOfferGroup
        isOpen={showAddBelongInGroup}
        onClose={() => setShowBelongInGroup(false)}
        rowData={rowData}
        onSuccess={handleReload}
        countBelongInOfferGroup={countBelongInOfferGroup}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogHeader className="p-0 border-0 block">
            <Alert variant="warning">
              <h3 className="text-lg">Are you sure?</h3>
              <span className="text-sm">You will delete the belong in offer group "{selectedRowToDelete?.offerGroupName}"</span>
            </Alert>
          </DialogHeader>
          <DialogFooter className="flex justify-end items-center gap-4 mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedRowToDelete(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRow} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BelongOfferGroup;