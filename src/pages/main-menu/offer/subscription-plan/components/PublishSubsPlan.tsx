import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface PublishSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
}

interface salesCategoryProps {
  effDate: string | null;
  expDate?: string | null;
  offerCatgClass: string;
  flag: number | null;
  offerCatgId: number;
  offerCatgType: string;
  seq: number;
  offerCatgName: string | null;
  level?: number;
  hasChildren?: boolean;
}

interface includeSalesCategoryProps {
  level?: number;
  offerCatgMemId: number;
  effDate: string | null;
  expDate?: string | null;
  offerCatgClass: string;
  offerCatgId: number;
  offerCatgType: string;
  offerCatgName: string | null;
  memEffDate: string | null;
  memExpDate: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const PublishSubsPlan: React.FC<PublishSubsPlanProps> = ({ isOpen, onClose }) => {
  const { GetData, PostData, DeleteData } = useCallApi();
  const { selectedSubSubPlan, menuPrivAccess } = useOfferLayout();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [salesCategoryData, setSalesCategoryData] = useState([]);
  const [includeSalesCategoryData, setIncludeSalesCategoryData] = useState<includeSalesCategoryProps[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingData, setEditingData] = useState<includeSalesCategoryProps | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<includeSalesCategoryProps[]>([]);
  const [modalMode, setModalMode] = useState<"add" | "delete">("add");

  useEffect(() => {
    if (isOpen) {
      const loadSalesCategoryData = async () => {
        try {
          const response = await GetData(`${API_URL_OFFER}/offer/category/qry-sales-catg-and-mem`, {
            offerCatgType: 2,
            offerCatgClass: "B",
            spId: 0,
          });
          if (response.data) {
            setSalesCategoryData(response.data);
          }
        } catch (error) {
          toast.error("Failed get sales category data");
        }
      };

      const loadIncludeSalesCategoryData = async () => {
        try {
          const response = await GetData(`${API_URL_OFFER}/offer/common/qry-offer-catg-by-offer-id`, {
            offerId: selectedSubSubPlan.offerId,
            offerCatgClass: "B",
            offerCatgType: 2,
            spId: 0,
          });
          if (response.data) {
            setIncludeSalesCategoryData(response.data);
          }
        } catch (error) {
          toast.error("Failed get include sales category data");
        }
      };
      loadSalesCategoryData();
      loadIncludeSalesCategoryData();
    }
  }, [isOpen]);

  useEffect(() => {
    // console.log("include data: ", includeSalesCategoryData);
  }, [includeSalesCategoryData]);

  const flattenedData = useMemo(() => {
    const flattenData = (list: any, level = 0) => {
      return list.flatMap((item: any) => {
        const isExpand = expandedRows.includes(item.offerCatgId);
        const children = isExpand ? flattenData(item.offerCatgMemList, level + 1) || [] : [];
        return [{ ...item, level, hasChildren: item.offerCatgMemList?.length > 0 }, ...children];
      });
    };
    return flattenData(salesCategoryData);
  }, [salesCategoryData, expandedRows]);

  const handleMoveToRight = (data: any) => {
    setIncludeSalesCategoryData((prev: any) => [...prev, data]);
  };

  const handleRemoveSelected = useCallback(
    (id: number) => {
      setIncludeSalesCategoryData((prev) => prev.filter((item) => item.offerCatgId !== id));
    },
    [includeSalesCategoryData]
  );

  const handleSelectAll = useCallback(
    (currentPageData: any[]) => {
      const notYetSelected = currentPageData.filter((data) => !includeSalesCategoryData.some((item: any) => item.offerCatgId === data.offerCatgId));

      if (notYetSelected.length === 0) {
        const idsToRemove = currentPageData.map((d) => d.offerCatgId);
        setIncludeSalesCategoryData((prev) => prev.filter((item: any) => !idsToRemove.includes(item.offerCatgId)));
      } else {
        setIncludeSalesCategoryData((prev) => [...prev, ...notYetSelected]);
      }
    },
    [includeSalesCategoryData]
  );

  const handleEditingChange = (field: "effDate" | "expDate", value: string) => {
    if (!editingData) return;
    setEditingData({ ...editingData, [field]: value });
  };

  const handleEdit = (data: includeSalesCategoryProps) => {
    setEditingRowId(data.offerCatgId);
    setEditingData({ ...data });
  };

  const normalizeDate = (date: string | null | undefined) => {
    if (!date) return null;
    return date.includes("T") ? date : `${date}T00:00:00`;
  };

  const handleOk = async (data: includeSalesCategoryProps) => {
    setIncludeSalesCategoryData((prev) =>
      prev.map((item) =>
        item.offerCatgId === data.offerCatgId
          ? {
              ...item,
              ...editingData,
            }
          : item
      )
    );

    setEditingRowId(null);
    setEditingData(null);
  };

  const handleOkDelete = async () => {
    if (!itemsToDelete || itemsToDelete.length === 0) return;
    setIsLoading(true);
    try {
      for (const item of itemsToDelete) {
        if (item.offerCatgMemId) {
          await handleDeleteData(item.offerCatgMemId);
        }
      }
    } catch (err) {
      toast.error("Failed Delete");
      console.error(err);
    } finally {
      setIsLoading(false);
      setModalMode("add");
      setItemsToDelete([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

  const handleAddData = async () => {
    setIsLoading(true);
    try {
      const payload = includeSalesCategoryData.map((item) => ({
        offerCatgMemId: item.offerCatgMemId || null,
        offerCatgId: item.offerCatgId || null,
        offerId: selectedSubSubPlan.offerId || null,
        spId: 0,
        effDate: normalizeDate(item.effDate),
        expDate: normalizeDate(item.expDate),
      }));

      // console.log("PAYLOAD: ", payload);

      const response = await PostData(`${API_URL_OFFER}/offer/category/catg-choose-offer`, payload);

      if (response?.status) {
        toast.success("Success Publish");
        onClose();
      } else {
        toast.error("Failed Publish");
      }
    } catch (error) {
      console.error("Failed to post data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async (offerCatgMemId: number) => {
    try {
      const response = await DeleteData(`${API_URL_OFFER}/offer/category/del-offer-catg-mem/${offerCatgMemId}`, offerCatgMemId);
      if (response?.status) {
        toast.success("Success Delete");
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setItemsToDelete([]);
    setEditingRowId(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setModalMode("add");
      setItemsToDelete([]);
    }
  }, [isOpen]);

  // const handleToggleEffType = (id: number, checked: boolean) => {
  //   setSpecialDayMap((prev) => ({
  //     ...prev,
  //     [id]: checked,
  //   }));
  // };

  const handleToggleExpand = (id: number) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const salesCategoryColumn = useMemo<ColumnDef<salesCategoryProps>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ column, table }) => {
          // Ambil data dari halaman saat ini
          const currentPageData = table.getRowModel().rows.map((row) => row.original);
          const allCurrentPageSelected = currentPageData.length > 0 && currentPageData.every((data) => includeSalesCategoryData.some((item: any) => item.offerCatgId === data.offerCatgId));

          return (
            <div className="flex items-center justify-center">
              <input type="checkbox" checked={allCurrentPageSelected} onChange={() => handleSelectAll(currentPageData)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
            </div>
          );
        },
        cell: ({ row }) => {
          const data = row.original;
          const isSelected = includeSalesCategoryData.some((item: any) => item.offerCatgId === data.offerCatgId);

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isSelected}
                onChange={() => {
                  if (!isSelected) {
                    handleMoveToRight(data);
                  }
                }}
                className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-500 ${isSelected ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.offerCatgName,
        id: "offerCatgName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Published Category" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const indent = (item.level || 0) * 20;
          return (
            <div
              className="flex items-center cursor-pointer"
              style={{ paddingLeft: indent }}
              onClick={() => {
                item.hasChildren && handleToggleExpand(item.offerCatgId);
              }}
            >
              {item.hasChildren && <KeenIcon icon={expandedRows.includes(item.offerCatgId) ? "down" : "right"} />}
              <span className="pl-2">{item.offerCatgName}</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const effDate = row.original.effDate;
          return <div className="text-gray-600">{effDate}</div>;
        },
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const expDate = row.original.expDate;
          return <div className="text-gray-600">{expDate}</div>;
        },
      },
      {
        id: "operation",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const data = row.original;
          const isSelected = includeSalesCategoryData.some((item: any) => item.offerCatgId === data.offerCatgId);

          return (
            <div className="flex items-center justify-center">
              <button
                disabled={isSelected}
                onClick={() => {
                  if (!isSelected) {
                    handleMoveToRight(data);
                    // console.log("data handle move", data);
                  }
                }}
                className={`w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-zinc-300 ${isSelected ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <KeenIcon icon="plus" />
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
    [expandedRows, handleToggleExpand]
  );

  const includeSalesCategoryColumn = useMemo<ColumnDef<includeSalesCategoryProps>[]>(
    () => [
      {
        accessorFn: (row) => row.offerCatgName,
        id: "offerCatgName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Published Category" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const offerCatgName = row.original.offerCatgName;
          return <div className="text-gray-600">{offerCatgName}</div>;
        },
      },
      {
        // accessorFn: (row) => row.offerCatgType,
        id: "offerCatgType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          // const isChecked = specialDayMap[data.offerCatgId] ?? false;
          const isEditing = editingRowId === data.offerCatgId;
          const isSpecialDay = isEditing ? editingData?.memEffDate !== null : data?.memEffDate !== null;

          if (isEditing) {
            return (
              <div className="flex items-center justify-start gap-2">
                <input
                  type="checkbox"
                  checked={isSpecialDay}
                  onChange={(e) => setEditingData((prev) => (prev ? { ...prev, memEffDate: e.target.checked ? new Date().toISOString() : null } : null))}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Special Day</span>
              </div>
            );
          }

          return <div>{isSpecialDay ? "Special Day" : "Immediately"}</div>;
        },
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          const isEditing = editingRowId === data.offerCatgId;
          const isSpecialDay = isEditing ? editingData?.memEffDate !== null : data?.memEffDate !== null;
          const effDate = row.original.effDate;

          if (isEditing) {
            return (
              <input
                type="date"
                name=""
                value={editingData?.effDate ? editingData.effDate?.split("T")[0] : ""}
                onChange={(e) => handleEditingChange("effDate", e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                placeholder=""
                disabled={!isSpecialDay}
              />
            );
          }

          return <div>{effDate}</div>;
        },
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          const expDate = row.original.expDate;

          if (editingRowId === data.offerCatgId) {
            return (
              <div>
                <input
                  type="date"
                  name=""
                  value={editingData?.expDate ? editingData.expDate?.split("T")[0] : ""}
                  onChange={(e) => handleEditingChange("expDate", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  placeholder=""
                />
              </div>
            );
          }
          return <div>{expDate}</div>;
        },
      },
      {
        id: "operation",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader className="" title="Operation" column={column} />,
        cell: ({ row }) => {
          const data = row.original;

          if (editingRowId === data.offerCatgId) {
            return (
              <div className="flex gap-2 justify-center">
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => handleOk(data)}>
                  <KeenIcon icon="check" />
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300" onClick={handleCancelEdit}>
                  <KeenIcon icon="cross" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                onClick={() => {
                  handleEdit(data);
                  // console.log(handleEdit);
                }}
                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-zinc-300"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                onClick={() => {
                  if (data.offerCatgMemId) {
                    setModalMode("delete");
                    setItemsToDelete((prev) => [...prev, data]);
                    handleRemoveSelected(data.offerCatgId);
                  } else {
                    handleRemoveSelected(data.offerCatgId);
                  }
                }}
                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-zinc-300"
              >
                <KeenIcon icon="minus" />
              </button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [editingRowId, editingData]
  );

  const PublishToolbar = useMemo(
    () => (
      <div className="p-2">
        <div className="flex justify-between">
          <label htmlFor="">Sales Category</label>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-1/2 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" placeholder="Search offer publication.." />
        </div>
      </div>
    ),
    [searchTerm]
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Offer Publication</DialogTitle>
        </DialogHeader>

        {/* Content Container */}
        <div className="flex-1 overflow-auto px-6">
          <div className="flex h-full gap-4">
            {/* Left Panel - Available Features */}
            <div className="flex-1 border-r flex flex-col min-h-0 pr-4">
              <div className="flex-1 overflow-auto min-h-0">
                {PublishToolbar}
                <DataGridProvider data={flattenedData} columns={salesCategoryColumn} pagination={{ size: 10 }} layout={{ card: false }} sorting={[{ id: "", desc: false }]} serverSide={false} />
              </div>
            </div>

            {/* Right Panel - Selected Features */}
            <div className="w-1/2 flex flex-col min-h-0 pl-4">
              <div className="flex-1 overflow-auto min-h-0">
                <p className="pt-3">Included Sales Category</p>
                <DataGridProvider
                  data={includeSalesCategoryData}
                  columns={includeSalesCategoryColumn}
                  pagination={{ size: 10 }}
                  toolbar={<div className="p-2"></div>}
                  layout={{ card: false }}
                  sorting={[{ id: "", desc: false }]}
                  serverSide={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t flex justify-end items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {modalMode === "add" ? (
              <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
              <Button onClick={handleAddData} className="disabled:bg-gray-300 disabled:cursor-not-allowed">
                {isLoading ? "Add..." : "Add"}
              </Button>
              </AccessWrapper>
            ) : (
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <Button onClick={handleOkDelete} className="disabled:bg-gray-300 disabled:cursor-not-allowed">
                {isLoading ? "Deleting.." : "Delete"}
              </Button>
              </AccessWrapper>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishSubsPlan;
