// Rebate.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RebateSettingDialog, { RebateFormData } from "../../blocks/RebateSettingDialog";
import { Settings, Check, X } from "lucide-react";
import { DataGridProvider, DataGridColumnHeader, KeenIcon, Alert } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface RebateProps {
  offerid: number;
}

export interface RebateTableRow {
  id: number;
  rebateType: string;
  version: number;
  values: { [key: string]: string };
  remarks: { [key: string]: string };
  name?: string;
  offerVerId?: number;
  rebatecount?: number
  isEditing?: boolean; // untuk kontrol form terbuka
}

const API_URL_OFFER = apiConfigOffer.offer;

const Rebate: React.FC<RebateProps> = ({ offerid }) => {
  const {menuPrivAccess} = useOfferLayout()
  const { PostData, GetData } = useCallApi();
  const [isDialogSettingOpen, setIsDialogSettingOpen] = useState(false);
  const [rebateDataList, setRebateDataList] = useState<RebateTableRow[]>([]);
  const [rebateCount, setRebateCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [versionName, setVersionName] = useState<string | undefined>("");
  const [loading, setIsLoading] = useState(false);
  const [offerVerid, setOfferVerId] = useState<number | undefined>(0);
  const [rebateType, setRebateType] = useState<string | undefined>("");
  const [rebateCountDelete, setRebateCountDelete] = useState<number | undefined>(0);

  // ✅ Fetch existing data dari API
  const getDataRebate = async (offerid: number) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/rebate/qry-offer-rebate`,
        { offerId: offerid }
      );

      const result = response?.data ?? [];

      if (Array.isArray(result)) {
        // ✅ group by offerVerId + rebateType
        const grouped = result.reduce((acc: any, item: any) => {
          const key = `${item.offerId}-${item.offerVerId}-${item.rebateType}`;
          if (!acc[key]) {
            acc[key] = {
              id: item.offerRebateId,
              rebateType: item.rebateType,
              version: Number(item.offerVerId),
              name: item.name,
              rebatecount: item.rebateCount,
              offerVerId: item.offerVerId,
              values: {},
              remarks: {},
              isEditing: false,
            };
          }
          acc[key].values[`value${item.rebateSeq}`] = item.value?.toString() ?? "";
          acc[key].remarks[`remark${item.rebateSeq}`] = item.comments ?? "";
          return acc;
        }, {});

        const mapped: RebateTableRow[] = Object.values(grouped);

        setRebateDataList(mapped);
        if (mapped.length > 0) {
          setRebateCount(mapped[0].rebatecount ?? 0);
        }
      }
    } catch (error: any) {
      console.error("Error fetching rebate data:", error);
      toast.error("Error fetching rebate data");
    }
  };

  useEffect(() => {
    if (offerid) {
      getDataRebate(offerid);
    }
  }, [offerid, reloadKey]);

  // ✅ Submit rebate baru / buka row existing
  const handleSubmitRebate = (formData: RebateFormData) => {
    const values: { [key: string]: string } = {};
    const remarks: { [key: string]: string } = {};

    for (let i = 1; i <= formData.rebateCount; i++) {
      values[`value${i}`] = formData.defaultValue;
      remarks[`remark${i}`] = "";
    }

    // cek apakah row existing sudah ada untuk offerid & version
    const existingIndex = rebateDataList.findIndex(
      (row) => row.version === formData.version
    );

    if (existingIndex !== -1) {
      // ✅ update row existing dengan rebateType & count baru
      setRebateDataList((prev) =>
        prev.map((row, idx) =>
          idx === existingIndex
            ? {
              ...row,
              rebateType: formData.rebateType,   // update P -> F
              rebatecount: formData.rebateCount, // update count baru
              values,                            // reset values default baru
              remarks,                           // reset remarks default baru
              isEditing: true,
            }
            : row
        )
      );
      setRebateCount(formData.rebateCount);
      return;
    }

    // ✅ jika tidak ada, tambahkan baru di paling atas dengan form terbuka
    const newRebateData: RebateTableRow = {
      id: Date.now(),
      rebateType: formData.rebateType,
      version: formData.version,
      values,
      name: formData.name,
      remarks,
      isEditing: true,
    };

    setRebateDataList((prev) => [newRebateData, ...prev]);
    setRebateCount(formData.rebateCount);
  };

  const handleValueChange = useCallback(
    (rowId: number, valueKey: string, newValue: string) => {
      setRebateDataList((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? { ...row, values: { ...row.values, [valueKey]: newValue } }
            : row
        )
      );
    },
    []
  );

  const handleRemarkChange = useCallback(
    (rowId: number, remarkKey: string, newValue: string) => {
      setRebateDataList((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? { ...row, remarks: { ...row.remarks, [remarkKey]: newValue } }
            : row
        )
      );
    },
    []
  );

  const handleSaveRebate = async (row: RebateTableRow) => {
    if (!row) {
      toast.error("No rebate data to save");
      return;
    }

    const emptyValues = Object.values(row.values).filter(
      (val) => !val || val.trim() === ""
    );
    if (emptyValues.length > 0) {
      toast.error("Please fill all value fields before saving");
      return;
    }

    try {
      setIsSubmitting(true);

      const rebateValueList = Object.keys(row.values).map((key, idx) => ({
        rebateSeq: idx + 1,
        value: Number(row.values[key]) || 0,
        comments: row.remarks[`remark${idx + 1}`] || "",
      }));

      const payload = {
        offerId: offerid,
        offerVerId: row.version,
        rebateType: row.rebateType,
        rebateCount: rebateValueList.length,
        spId: 0,
        rebateValueList,
      };

      // console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      const response = await PostData(
        `${API_URL_OFFER}/offer/rebate/manage-offer-rebate`,
        payload
      );

      if (response?.status) {
        toast.success("Rebate data saved successfully");
        setRebateDataList((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, isEditing: false } : r
          )
        );
      } else {
        throw new Error(response?.message || "Failed to save rebate");
      }
      setReloadKey((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error saving rebate:", error);
      toast.error(error?.message || "Failed to save rebate data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRebate = (rowId: number) => {
    setRebateDataList((prev) =>
      prev.filter((row) => row.id !== rowId || !row.isEditing)
    );
    toast.info("Rebate row removed");
  };

  const handleDeleteClick = (versionname: string | undefined, offerverid: number | undefined, rebattype: string | undefined, rebatecount: number | undefined) => {
    setVersionName(versionname);
    setOfferVerId(offerverid);
    setRebateType(rebattype);
    setRebateCountDelete(rebatecount);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const payload = {
        offerId: offerid,
        offerVerId: offerVerid,
        rebateType: rebateType,
        rebateCountDelete: rebateCountDelete
      }

      const response = await PostData(
        `${API_URL_OFFER}/offer/rebate/manage-offer-rebate`,
        payload
      );

      if (response?.status) {
        toast.success("Rebate delete data successfully");
      } else {
        throw new Error(response?.message || "Failed to delete data rebate");
      }
      setReloadKey((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error saving rebate:", error);
      toast.error(error?.message || "Failed to save rebate data", error);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = useMemo<ColumnDef<RebateTableRow>[]>(() => {
    const baseColumns: ColumnDef<RebateTableRow>[] = [
      {
        id: "rebateType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Rebate Type" column={column} />
        ),
        cell: ({ row }) => {
          // console.log(row.original.rebateType);
          const type =
            row.original.rebateType === "P"
              ? "Rate"
              : row.original.rebateType === "F"
                ? "Amount"
                : row.original.rebateType;
          return <div className="text-sm">{type}</div>;
        },
      },
      {
        id: "version",
        header: ({ column }) => (
          <DataGridColumnHeader title="Version" column={column} />
        ),
        cell: ({ row }) => {
          return <div className="text-sm">{row.original.name}</div>;
        },
      },
    ];

    for (let i = 1; i <= rebateCount; i++) {
      baseColumns.push({
        id: `value${i}`,
        header: ({ column }) => (
          <DataGridColumnHeader title={`Value`} column={column} />
        ),
        cell: ({ row }) => {
          const isRate = row.original.rebateType === "P";
          if (!row.original.isEditing) {
            return (
              <div className="text-sm">
                {row.original.values[`value${i}`] || ""}
                {isRate ? "%" : ""}
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={row.original.values[`value${i}`] || ""}
                  onChange={(e) =>
                    handleValueChange(row.original.id, `value${i}`, e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={isSubmitting}
                />
                {isRate && <span className="text-sm">%</span>}
              </div>
            );
          }
        },
      });

      baseColumns.push({
        id: `remark${i}`,
        header: ({ column }) => (
          <DataGridColumnHeader title={`Remark`} column={column} />
        ),
        cell: ({ row }) => {
          if (!row.original.isEditing) {
            return (
              <div className="text-sm">
                {row.original.remarks[`remark${i}`] || ""}
              </div>
            );
          } else {
            return (
              <input
                type="text"
                value={row.original.remarks[`remark${i}`] || ""}
                onChange={(e) =>
                  handleRemarkChange(
                    row.original.id,
                    `remark${i}`,
                    e.target.value
                  )
                }
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Optional remarks..."
                disabled={isSubmitting}
              />
            );
          }
        },
      });
    }

    baseColumns.push({
      id: "action",
      header: ({ column }) => (
        <DataGridColumnHeader title="Actions" column={column} />
      ),

      cell: ({ row }) => {
        const versionname = row.original.name
        const offerverid = row.original.offerVerId
        const rebatetype = row.original.rebateType //->string
        const rebatecount = row.original.rebatecount

        if (!row.original.isEditing) {
          return (
            <div className="flex gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                title="View Details"
                onClick={() =>
                  setRebateDataList((prev) =>
                    prev.map((r) =>
                      r.id === row.original.id ? { ...r, isEditing: true } : r
                    )
                  )
                }
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                title="Delete"
                onClick={() => handleDeleteClick(versionname, offerverid, rebatetype, rebatecount)}
              >
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
            </div>
          );
        } else {
          return (
            <div className="flex gap-2 justify-center items-center">
              <button
                onClick={() => handleSaveRebate(row.original)}
                disabled={isSubmitting}
                className="p-1.5 rounded hover:bg-green-100 text-green-600 disabled:opacity-50"
                title="Save"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  if (row.original.isEditing && row.original.offerVerId) {
                    // ✅ case 1: row existing → tutup edit
                    setRebateDataList((prev) =>
                      prev.map((r) =>
                        r.id === row.original.id ? { ...r, isEditing: false } : r
                      )
                    );
                  } else {
                    // ✅ case 2: row baru (ga ada offerVerId) → hapus
                    handleCancelRebate(row.original.id);
                  }
                }}
                disabled={isSubmitting}
                className="p-1.5 rounded hover:bg-red-100 text-red-600 disabled:opacity-50"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
          );
        }
      },
    });

    return baseColumns;
  }, [rebateCount, handleValueChange, handleRemarkChange, isSubmitting]);

  return (
    <div className="h-full flex flex-col">
      <div style={{ marginTop: "1rem" }}>
        <RebateSettingDialog
          isOpen={isDialogSettingOpen}
          onClose={() => setIsDialogSettingOpen(false)}
          offerid={offerid}
          onSubmit={handleSubmitRebate}
        />

        <div className="min-h-screen bg-white p-4">
          <div className="border rounded shadow-sm">
            <div className="flex items-center justify-between p-4">
              <h1 className="mt-5 ml-5 text-2xl font-semibold">Rebate</h1>
            </div>

            <div className="w-full p-6">
              <div className="mb-4 flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  Rebate
                </label>
                <button
                  type="button"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => setIsDialogSettingOpen(true)}
                >
                  <Settings size={16} />
                  Setting
                </button>
              </div>

              {rebateDataList.length > 0 ? (
                <DataGridProvider
                  key={reloadKey}
                  columns={columns}
                  data={rebateDataList}
                  pagination={{ size: 10 }}
                  layout={{ card: false }}
                />
              ) : (
                <p className="text-gray-500 text-sm">No Record Found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogHeader className="p-0 border-0 block">
            <Alert variant="warning">
              <h3 className="text-lg">Are you sure?</h3>
              <span className="text-sm">You will delete the Rebate "{versionName}"</span>
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

export default Rebate;