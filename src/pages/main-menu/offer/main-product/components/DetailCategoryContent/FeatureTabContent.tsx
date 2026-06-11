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
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AddFeatureDialog from "../../blocks/AddFeatureDialog";
import CopyFromFeatureDialog from "../../blocks/CopyFromFeatureDialog";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert } from "@/components";
import AllFeatureTabContent from "../all-feature-content/AllFeatureTabContent";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface attrValList {
  attrValueId: number;
  baseAttrId: number;
  valueMark: string;
  value: string;
  attrValue?: string;
  defaultValue?: string;
  defaultFlag?: string;
}

export interface FeatureData {
  offerId: number;
  attrId: number;
  csrVisible: string;
  dispOrder: number;
  spId: number;
  inputType: string;
  nullable: string;
  attrName: string;
  instantiatable: string;
  defaultValue: string | null;
  attrCode: string;
  attrValueList: attrValList[];
  selectedValues?: string[];
  defaultFlag?: string | null;
}

interface FeatureTabContentProps {
  category: string;
  rowData: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const FeatureTabContent: React.FC<FeatureTabContentProps> = ({
  category,
  rowData,
}) => {
  const [features, setFeatures] = useState<FeatureData[]>([]);
  const { GetData, PutData } = useCallApi();
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const offerId = rowData.offerId;
  //  console.log(offerId);
  const [isAllFeatureOpen, setIsAllFeatureOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [tempValues, setTempValues] = useState<Record<number, string>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleReload = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (rowData?.offerId) {
      handleReload();
    }
  }, [rowData?.offerId, handleReload]);

  useEffect(() => {
    //  console.log("rowData", rowData);
  }, [rowData]);

  const handleEditClick = (feature: FeatureData) => {
    setEditingRowId(Number(feature.attrId));
    setTempValues({
      [feature.attrId]: feature.defaultValue ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setTempValues({});
  };

  const handleSaveEdit = async (feature: FeatureData) => {
    const newValues = tempValues[feature.attrId] ?? "";
    try {
      await PutData(`${API_URL_OFFER}/offer/attr/mod-offer-attr-value`, {
        offerId: feature.offerId,
        attrId: feature.attrId,
        dispOrder: feature.dispOrder,
        spId: 0,
        defaultValue: newValues,
        attrCode: feature.attrCode,
        operationTypes: "M",
      });

      toast.success("Default value updated successfully");
      setEditingRowId(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      toast.error("❌ Failed to update default value");
    }
  };

  const handleUpdateCopyForm = async (merged: FeatureData[]) => {
    try {
      const payload = merged.map((f) => ({
        offerId: offerId,
        attrId: f.attrId,
        dispOrder: f.dispOrder,
        spId: f.spId,
        defaultValue: String(f.defaultValue ?? ""),
        attrCode: f.attrCode,
        operationTypes: "A",
      }));
      //  console.log("payload", payload);

      const newData = await PutData(
        `${API_URL_OFFER}/offer/attr/mod-offer-attr-batch/${offerId}`,
        payload,
      );

      //  console.log("newData", newData?.data);

      toast.success("Features Update Successfully");
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to Update Features");
    }
  };

  const handleDeleteFeature = async (offerId: number, attrId: number) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/attr/qry-offer-attr-by-offer-id`,
        {
          offerIds: offerId,
        },
      );
      const oldFeatures = (response.data || []) as FeatureData[];

      const toDelete = oldFeatures.filter((f) => f.attrId !== attrId);

      const payLoad = toDelete.map((f) => ({
        offerId: f.offerId,
        attrId: f.attrId,
        dispOrder: f.dispOrder,
        spId: f.spId,
        defaultValue: String(f.defaultValue ?? ""),
        attrCode: f.attrCode,
        operationTypes: "A",
      }));

      await PutData(
        `${API_URL_OFFER}/offer/attr/mod-offer-attr-batch/${offerId}`,
        payLoad,
      );

      toast.success("Feature deleted successfully");
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to delete feature");
    }
  };

  const handleOpenOperationModal = (attrId: number) => {
    setSelectedAttrId(attrId);
    setIsOperationModalOpen(true);
  };

  const handleDeleteDialog = (offerId: number, attrId: number) => {
    setSelectedAttrId(attrId);
    setIsDeleteModalOpen(true);
  };

  const handleShowAddDialog = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
  }, []);

  const handleShowAllFeature = useCallback((open: boolean) => {
    setIsAllFeatureOpen(open);
  }, []);

  const handleShowCopyDialog = useCallback((open: boolean) => {
    setIsCopyDialogOpen(open);
  }, []);

  const handleInputChange = useCallback((attrId: number, value: string) => {
    setTempValues((prev) => ({ ...prev, [attrId]: value }));

    setTimeout(() => {
      const input = inputRefs.current[attrId];
      if (input && document.activeElement !== input) {
        input.focus();
        const length = value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  }, []);

  useEffect(() => {
    //  console.log("data features", features);
  }, [features]);

  const { menuPrivAccess } = useOfferLayout();

  // Data Grid Columns
  const columns = useMemo<ColumnDef<FeatureData>[]>(
    () => [
      {
        accessorFn: (row) => row.attrName,
        id: "attrName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Feature Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.csrVisible,
        id: "csrVisible",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="CSR Visible"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.csrVisible === "Y" ? <KeenIcon icon="eye" /> : null,
      },
      {
        accessorFn: (row) => row.instantiatable,
        id: "instantiatable",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Instantiatable"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.instantiatable === "N" ? (
            <KeenIcon icon="cross" />
          ) : null,
      },
      {
        accessorFn: (row) => row.defaultValue,
        id: "defaultValue",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Default Value"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;
          const attrId = Number(feature.attrId);
          const isEditing = editingRowId === attrId;
          const currentValue = tempValues[attrId] ?? feature.defaultValue ?? "";

          // Show select
          if (isEditing) {
            if (feature?.attrValueList && feature?.attrValueList.length > 0) {
              return (
                <select
                  className="border rounded px-2 py-1"
                  value={currentValue ?? ""}
                  onChange={(e) => handleInputChange(attrId, e.target.value)}
                >
                  {feature.attrValueList.map((item) => (
                    <option key={item.attrValueId} value={item.value}>
                      {item.valueMark} ({item.value})
                    </option>
                  ))}
                </select>
              );
            } else {
              return (
                <input
                  type="text"
                  ref={(el) => (inputRefs.current[attrId] = el)}
                  className="border rounded px-2 py-1 w-full"
                  value={currentValue ?? ""}
                  onChange={(e) => handleInputChange(attrId, e.target.value)}
                  placeholder="Enter value"
                />
              );
            }
          }
          const matched = feature.attrValueList?.find(
            (item) =>
              String(item?.value ?? "") === String(feature?.defaultValue ?? ""),
          );

          return matched
            ? `${matched.valueMark} (${matched.value})`
            : feature.defaultValue;
        },
      },
      {
        accessorFn: (row) => row.attrId,
        id: "operation",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Operation"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const attrId = row.original.attrId;
          return (
            <button
              className="font-medium text-left"
              onClick={() => handleOpenOperationModal(attrId)}
              title="Conditions"
              disabled
            >
              <span>Conditions</span>
            </button>
          );
        },
      },
      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Options"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const feature = row.original;

          if (editingRowId === feature.attrId) {
            return (
              <div className="flex gap-2 justify-center">
                <button
                  className="btn btn-sm btn-success bg-blue-500 hover:bg-blue-400"
                  onClick={() => handleSaveEdit(feature)}
                >
                  Save
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper
                hasAccess={menuPrivAccess?.editStatus}
                enabledText="Edit"
              >
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    handleEditClick(row.original);
                  }}
                  // title="Edit"
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              </AccessWrapper>
              <AccessWrapper
                hasAccess={menuPrivAccess?.deleteStatus}
                enabledText="Delete"
              >
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() =>
                    handleDeleteDialog(feature.offerId, feature.attrId)
                  }
                  // title="Delete"
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
    [editingRowId, tempValues, handleInputChange],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      if (!rowData?.offerId && !rowData?.id) {
        console.warn("❗ No offerId or id provided in rowData");
        return { data: [], totalCount: 0 };
      }

      const offerId = rowData.offerId || rowData.id;

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/attr/qry-offer-attr-by-offer-id`,
          {
            offerIds: offerId,
          },
        );

        const result = response?.data ?? [];
        setFeatures(result); // optionally store to state if still needed elsewhere

        // Apply client-side filtering and sorting
        let processedData = [...result];

        // Optional: Apply sorting
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof FeatureData];
            const bValue = b[id as keyof FeatureData];

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
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

        //  console.log("paginatedData", paginatedData);

        return {
          data: paginatedData,
          totalCount: processedData.length,
        };
      } catch (error) {
        toast.error("❌ Failed to fetch feature data");
        return { data: [], totalCount: 0 };
      }
    },
    [rowData, GetData],
  );

  // Custom toolbar component
  const FeatureToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-start item-center p-4">
      <div className="flex gap-3">
        <AccessWrapper
          enabledText="New Data"
          hasAccess={menuPrivAccess?.addStatus}
        >
          <Button
            variant="default"
            className="h-7.5"
            onClick={() => handleShowAddDialog(true)}
          >
            Add Data
          </Button>
        </AccessWrapper>

        <AccessWrapper
          enabledText="Copy Data"
          hasAccess={menuPrivAccess?.addStatus}
        >
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowCopyDialog(true)}
          >
            <KeenIcon icon="copy" />
            Copy From
          </Button>
        </AccessWrapper>

        <DefaultTooltip title="All Features" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowAllFeature(true)}
          >
            <KeenIcon icon="plus" />
            All Features
          </Button>
        </DefaultTooltip>

        <DefaultTooltip title="Refresh" placement="top">
          <Button variant="outline" className="h-7.5" onClick={handleReload}>
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DataGridProvider
        key={`${reloadKey}`}
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<FeatureToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "featureName", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
        }}
      ></DataGridProvider>

      {/* AddFeatureDialog */}
      <AddFeatureDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        offerId={offerId}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />

      {/* CopyFeatureDialog */}
      <CopyFromFeatureDialog
        isOpen={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        oldFeatures={features ?? []}
        onCopy={(merged) => {
          // setFeatures(merged);
          handleUpdateCopyForm(merged);
        }}
        offerType={rowData?.offerType}
      />

      <AllFeatureTabContent
        isOpen={isAllFeatureOpen}
        onClose={() => setIsAllFeatureOpen(false)}
        rowData={rowData}
      />

      {isOperationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md w-[400px]">
            <h2 className="text-lg font-semibold mb-2">
              Conditions for attrId: {selectedAttrId}
            </h2>
            {/* Konten popup bisa diganti sesuai kebutuhan */}
            <button
              className="mt-4 btn btn-primary"
              onClick={() => setIsOperationModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => setIsDeleteModalOpen(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            {/* <DialogTitle>Delete Feature</DialogTitle> */}
            {/* <DialogDescription className="text-red-600">Are you sure you want to delete this feature? This action cannot be undone.</DialogDescription> */}
            <Alert variant="warning">
              <h3 className="text-lg">Are you sure?</h3>
              <span className="text-sm">
                You will delete This feature! This action cannot be undone.
              </span>
            </Alert>
          </DialogHeader>

          <DialogFooter className="flex justify-end items-center gap-4 mt-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedAttrId !== null) {
                  handleDeleteFeature(offerId, selectedAttrId);
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureTabContent;
