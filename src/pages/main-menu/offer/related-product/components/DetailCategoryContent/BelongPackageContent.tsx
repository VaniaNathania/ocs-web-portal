import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Check, X } from "lucide-react";
import { Alert, DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddBelongInPackage from "../../blocks/AddBelongInPackage";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface BelongPackageData {
  dependProdSpecId: number;
  offerName: string;
  defaultFlag: string;
  networkType: string;
  networkTypeName: string;
  seq: number;
  dependProdPackageId: number; // ✅ Pastikan ini ada dan bertipe number (bukan optional)
}

interface BelongPackageProps {
  category: string;
  rowData: any;
}

interface EditingRow {
  dependProdSpecId: number;
  dependProdPackageId: number; // <– tambahkan ini
  offerName: string;
  defaultFlag: string;
  seq: number;
}

const API_URL_OFFER = apiConfigOffer.offer;

const BelongPackageTabContent: React.FC<BelongPackageProps> = ({ category, rowData }) => {
  const { GetData, PostData } = useCallApi();
  const {menuPrivAccess} = useOfferLayout()
  const [belongPackage, setBelongPackage] = useState<BelongPackageData[]>([]);
  const [showAddBelongInPackage, setShowAddBelongInPackage] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowToDelete, setSelectedRowToDelete] = useState<BelongPackageData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleShowAddBelong = useCallback((open: boolean) => {
    setShowAddBelongInPackage(open);
  }, []);

  const handleReload = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (rowData?.offerId || rowData?.id) {
      handleReload();
    }
  }, [rowData?.offerId, rowData?.id, handleReload]);

  const handleEditRow = (row: BelongPackageData) => {
    // console.log("📝 row from table:", row);

    if (!row.dependProdSpecId) {
      console.error("❌ dependProdPackageId is missing from row data");
      toast.error("Cannot edit: Missing package ID");
      return;
    }

    setEditingRow({
      dependProdSpecId: row.dependProdSpecId,
      dependProdPackageId: row.dependProdSpecId, // ✅ Ini sekarang pasti ada
      offerName: row.offerName,
      defaultFlag: row.defaultFlag,
      seq: row.seq,
    });
  };

  const handleCancelEdit = useCallback(() => {
    setEditingRow(null);
  }, []);

  const handleDeleteClick = useCallback((row: BelongPackageData) => {
    setSelectedRowToDelete(row);
    setIsDeleteModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingRow) return;

    if (!editingRow.dependProdPackageId) {
      console.error("❌ dependProdPackageId is missing from editingRow");
      toast.error("Cannot save: Missing package ID");
      return;
    }
    // console.log("rowData.seq:", rowData.seq);
    // console.log("editingRow.seq:", editingRow.seq);

    try {
      setLoading(true);

      const payload = {
        networkType: "G",
        dependProdPackage: [
          {
            dependProdPackageId: editingRow.dependProdPackageId, // ✅ Sekarang pasti tidak null
            memDependProdSpecId: rowData.offerId || rowData.id,
            spId: 0,
            operFlag: "M",
            defaultFlag: editingRow.defaultFlag,
            seq: editingRow.seq,
          },
        ],
      };

      // console.log("📤 Final Edit payload:", JSON.stringify(payload, null, 2));
      // console.log("🔍 editingRow:", editingRow);

      const response = await PostData(`${API_URL_OFFER}/offer/depend/join-depend-prod-package`, payload);
      // console.log("📥 Edit response:", response);

      if (response?.status === true) {
        toast.success("Data berhasil diupdate");
        setEditingRow(null);
        handleReload();
      } else {
        throw new Error(response?.message || "Update failed");
      }
    } catch (err) {
      console.error("❌ Error updating:", err);
      toast.error("Gagal mengupdate data");
    } finally {
      setLoading(false);
    }
  }, [editingRow, PostData, handleReload, rowData]);

  // 3. PERBAIKAN BelongPackageTabContent.tsx - handleDelete
  const handleDelete = useCallback(async () => {
    if (!selectedRowToDelete) return;

    try {
      setLoading(true);

      const payload = {
        networkType: "G",
        dependProdPackage: [
          {
            dependProdPackageId: selectedRowToDelete.dependProdSpecId, // ✅ ID package member yang dihapus
            memDependProdSpecId: rowData.offerId || rowData.id, // ✅ ID package utama
            spId: 0,
            operFlag: "D",
            defaultFlag: selectedRowToDelete.defaultFlag,
            // seq: 1,
          },
        ],
      };

      // console.log("📤 CORRECTED Delete payload:", JSON.stringify(payload, null, 2));

      const response = await PostData(`${API_URL_OFFER}/offer/depend/join-depend-prod-package`, payload);
      // console.log("📥 Delete response:", response);

      if (response?.status === true) {
        toast.success("Data berhasil dihapus");
        setIsDeleteModalOpen(false);
        setSelectedRowToDelete(null);

        handleReload();
      } else {
        throw new Error(response?.message || "Delete failed");
      }
    } catch (error) {
      console.error("❌ Error deleting:", error);
      toast.error("Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  }, [PostData, handleReload, rowData, selectedRowToDelete]);

  // Update edit field values
  const handleEditFieldChange = useCallback(
    (field: keyof EditingRow, value: string) => {
      if (!editingRow) return;
      setEditingRow((prev) => (prev ? { ...prev, [field]: value } : null));
    },
    [editingRow]
  );

  // Data Grid Columns
  const columns = useMemo<ColumnDef<BelongPackageData>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Package Member" column={column} />,
        enableSorting: true,
        enableHiding: false,
        // cell: ({ row }) => {
        //   const isEditing = editingRow?.dependProdSpecId === row.original.dependProdSpecId;

        //   if (isEditing) {
        //     return (
        //       <Input
        //         value={editingRow.offerName}
        //         onChange={(e) => handleEditFieldChange("offerName", e.target.value)}
        //         className="h-8"
        //       />
        //     );
        //   }

        //   return <span>{row.original.offerName}</span>;
        // },
      },
      {
        accessorFn: (row) => row.defaultFlag,
        id: "defaultFlag",
        header: ({ column }) => <DataGridColumnHeader className="" title="Default Choice" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const belongPackageItem = row.original;
          const isEditing = editingRow?.dependProdSpecId === row.original.dependProdSpecId;

          if (isEditing) {
            return (
              <Select
                value={editingRow.defaultFlag}
                onValueChange={(value) => handleEditFieldChange("defaultFlag", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            );
          }

          // return <span>{row.original.defaultFlag === "Y" ? "Yes" : "No"}</span>;
          return (
            <div className="flex items-center gap-2">
              {belongPackageItem.defaultFlag === "Y" ? (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <KeenIcon icon="check" className="text-white text-xs" />
                </div>
              ) : belongPackageItem.defaultFlag === "N" ? (
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
          const feature = row.original;
          const isEditing = editingRow?.dependProdSpecId === feature.dependProdSpecId;

          if (isEditing) {
            return (
              <div className="flex items-center justify-center gap-2">
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={handleSaveEdit}
                  disabled={loading}
                  title="Save"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </button>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  title="Cancel"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleEditRow(feature)}
                title="Edit"
                disabled={loading}
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleDeleteClick(feature)}
                title="Delete"
                disabled={loading}
              >
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[150px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [editingRow, handleEditRow, handleDeleteClick, handleSaveEdit, handleCancelEdit, handleEditFieldChange, loading]
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      if (!rowData?.offerId && !rowData?.id) {
        console.warn("❗ No offerId or id provided in rowData");
        return { data: [], totalCount: 0 };
      }

      const offerId = rowData.offerId || rowData.id;

      try {
        const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-prod-join-package`, {
          dependProdSpecId: offerId,
        });

        const result = response?.data ?? [];

        // ✅ CRITICAL FIX: Map response data dengan benar
        const mappedResult = result.map((item: any, index: number) => ({
          dependProdSpecId: item.dependProdSpecId,
          offerName: item.offerName,
          defaultFlag: item.defaultFlag,
          networkType: item.networkType,
          networkTypeName: item.networkTypeName,
          seq: index + 1,
        }));

        setBelongPackage(mappedResult);

        let processedData = [...mappedResult]; // Gunakan mapped result

        // Apply sorting
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof BelongPackageData];
            const bValue = b[id as keyof BelongPackageData];

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
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
      } catch (error) {
        toast.error("❌ Failed to fetch belong package data");
        return { data: [], totalCount: 0 };
      }
    },
    [rowData, GetData, reloadKey]
  );

  // Custom toolbar component
  const BelongInPackageToolbar = () => (
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

  // Success handler for AddBelongInPackage
  const handleAddSuccess = useCallback(() => {
    handleReload();
  }, [handleReload]);

  return (
    <div className="space-y-6">
      <DataGridProvider
        key={reloadKey}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<BelongInPackageToolbar />}
        layout={{ card: true }}
        // sorting={[{ id: "offerName", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
        }}
      />

      <AddBelongInPackage
        isOpen={showAddBelongInPackage}
        onClose={() => setShowAddBelongInPackage(false)}
        offerId={rowData.offerId || rowData.id}
        onSuccess={handleAddSuccess}
        rowData={rowData}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogHeader className="p-0 border-0 block">
            <Alert variant="warning">
              <h3 className="text-lg">Are you sure?</h3>
              <span className="text-sm">You will delete the Belong in Package"{selectedRowToDelete?.offerName}"</span>
            </Alert>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BelongPackageTabContent;
