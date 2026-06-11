import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataGridColumnHeader, DataGridInner, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import FeatureValueModal from "../all-feature-content/blocks/FeatureValueModal";
import DeleteBatchDialog from "../all-feature-content/blocks/DeleteBatchDialog";

interface MultiChoiceFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditingMode: boolean;
  rowData: any;
  onSingleChoiceChange?: (data: FormDataSingleChoice[]) => void;
}

export interface MultiChoiceData {
  baseAttrId: number | null;
  attrValueId: number | null;
  valueMark: string | null;
  value: string | null;
  parentAttrValueId: number | null;
  parentAttrId: number | null;
  attrName: string | null;
  strAttrDriverList: string | null;
  strAttrValueLinkageList: string | null;
  spId: number;
  defaultValue: string | null;
}

export interface FormDataSingleChoice {
  baseAttrId: number | null;
  attrValueId: number | null;
  valueMark: string | null;
  value: string | null;
  parentAttrValueId: number | null;
  parentAttrId: number | null;
  spId: number;
  attrDriverList: {
    attrDriverId: number | null;
    orgAttrId: number | null;
    orgAttrValueId: number | null;
    objAttrId: number | null;
    objAttrName?: string;
    spId: number;
  }[];
  attrValueLinkageList: {
    id: {
      baseAttrId: number | null;
      attrValueId: number | null;
      parentAttrId: number | null;
      parentAttrValueId: number | null;
      attrName?: string;
    };
    spId: number;
    defaultFlag: string | null;
  }[];
  defaultValue: string | null;
  updateDefaultFlag: boolean;
}

const MultiChoiceFields: React.FC<MultiChoiceFieldsProps> = ({ formData, onChange, isEditingMode, rowData, onSingleChoiceChange }) => {
  const [singleChoiceFormData, setSingleChoiceFormData] = useState<FormDataSingleChoice[]>([]);
  const [editingRow, setEditingRow] = useState<FormDataSingleChoice | null>(null);
  const [singleChoice, setSingleChoice] = useState<MultiChoiceData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<MultiChoiceData | null>(null);
  const offerId = rowData?.offerId;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditClick = (row: MultiChoiceData) => {
    // Cari di singleChoiceFormData kalau ada
    let original = singleChoiceFormData.find((item) => item.attrValueId === row.attrValueId);

    // Kalau kosong, fallback bikin dari row
    if (!original) {
      original = {
        baseAttrId: row.baseAttrId,
        attrValueId: row.attrValueId,
        valueMark: row.valueMark,
        value: row.value,
        parentAttrValueId: row.parentAttrValueId,
        parentAttrId: row.parentAttrId,
        spId: 0,
        attrDriverList: [],
        attrValueLinkageList: [],
        defaultValue: row.defaultValue,
        updateDefaultFlag: false,
      };
    }

    setEditingRow(original);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (row: MultiChoiceData) => {
    setSelectedBatch(row);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    if (Array.isArray(formData) && formData.length > 0) {
      setSingleChoiceFormData(formData);

      // map ke versi grid sederhana
      const mapped: MultiChoiceData[] = formData.map((item) => ({
        baseAttrId: item.baseAttrId,
        attrValueId: item.attrValueId,
        valueMark: item.valueMark,
        value: item.value,
        parentAttrValueId: item.parentAttrValueId,
        parentAttrId: item.parentAttrId,
        attrName: item.attrValueLinkageList?.[0]?.id?.attrName ?? null,
        strAttrDriverList: null,
        strAttrValueLinkageList: null,
        spId: 0,
        defaultValue: item.defaultValue,
      }));

      setSingleChoice(mapped);
    }
  }, [formData]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
  };

  // Handler untuk menyimpan data dari modal
  const handleSaveModal = (modalData: FormDataSingleChoice) => {
    // console.log("MODAL DATA", modalData);

    let updatedFormData: FormDataSingleChoice[];
    if (editingRow) {
      // UPDATE
      updatedFormData = singleChoiceFormData.map((item) => (item.attrValueId === editingRow.attrValueId ? { ...modalData, attrValueId: editingRow.attrValueId } : item));
    } else {
      // ADD
      updatedFormData = [...singleChoiceFormData, { ...modalData }];
    }

    setSingleChoiceFormData(updatedFormData);

    const mappedUpdate: MultiChoiceData[] = updatedFormData.map((item) => ({
      baseAttrId: item.baseAttrId,
      attrValueId: item.attrValueId,
      valueMark: item.valueMark,
      value: item.value,
      parentAttrValueId: item.parentAttrValueId,
      parentAttrId: item.parentAttrId,
      attrName: item.attrValueLinkageList?.[0]?.id?.attrName ?? null,
      strAttrDriverList: null,
      strAttrValueLinkageList: null,
      spId: 0,
      defaultValue: item.defaultValue,
    }));

    setSingleChoice(mappedUpdate);

    // reset state editing
    setEditingRow(null);

    // pass ke parent
    onSingleChoiceChange?.(updatedFormData);
  };

  const handleDelete = () => {
    if (!selectedBatch) return;

    // buang item yang dihapus dari state lokal
    setSingleChoice((prev) => prev.filter((item) => item.attrValueId !== selectedBatch.attrValueId));
    setSingleChoiceFormData((prev) => prev.filter((item) => item.attrValueId !== selectedBatch.attrValueId));

    setSelectedBatch(null);
  };

  const Columns = useMemo<ColumnDef<MultiChoiceData>[]>(
    () => [
      {
        accessorFn: (row) => row.valueMark,
        id: "valueMark",
        header: ({ column }) => <DataGridColumnHeader className="" title="Value Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.value,
        id: "value",
        header: ({ column }) => <DataGridColumnHeader className="" title="Value" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.defaultValue,
        id: "defaultValue",
        header: ({ column }) => <DataGridColumnHeader className="" title="Is Default" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          return row.original.defaultValue === "Y" ? <KeenIcon icon="check-circle" /> : <KeenIcon icon="cross-circle" />;
        },
      },
      {
        accessorFn: (row) => row.strAttrDriverList,
        id: "strAttrDriverList",
        header: ({ column }) => <DataGridColumnHeader className="" title="Show Features" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.strAttrValueLinkageList,
        id: "strAttrValueLinkageList",
        header: ({ column }) => <DataGridColumnHeader className="" title="Filter Features" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Options" className="text-center" column={column} />,
        cell: ({ row }) => {
          return (
            isEditingMode && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    handleEditClick(row.original);
                  }}
                  title="Edit"
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
                <button type="button" className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleDeleteClick(row.original)} title="Delete">
                  <KeenIcon icon="trash" />
                </button>
              </div>
            )
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    []
  );

  const OfferStatusToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center p-4">
      <div className="flex gap-3">
        <DefaultTooltip title="Add Data" placement="top">
          <Button variant="outline" className="h-7.5" disabled={!isEditingMode} onClick={handleOpenModal}>
            <KeenIcon icon="plus" />
            Add
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header info with close button */}
        <div className="bg-gray-50 p-4 border-b rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Feature Value</h3>
            </div>
          </div>
        </div>

        {/* Data Grid with card layout */}
        <div className="p-4">
          <DataGridProvider key={refreshTrigger} columns={Columns} data={singleChoice} pagination={{ size: 10 }} toolbar={<OfferStatusToolbar />} layout={{ card: true }} sorting={[{ id: "valueMark", desc: false }]} serverSide={false} />
        </div>
      </div>

      {/* Row 13 - Remarks */}
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4 mt-10">
          <span className="text-sm text-gray-800">Remarks:</span>
          {isEditingMode ? (
            <textarea name="remarks" value={formData.comments || ""} onChange={onChange} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="" />
          ) : (
            <textarea
              name="remarks"
              value={formData.comments || ""}
              onChange={onChange}
              rows={1}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              disabled={!isEditingMode}
            />
          )}
        </div>
      </div>

      <FeatureValueModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        offerId={offerId}
        initialData={editingRow}
        mode={editingRow ? "edit" : "add"}
        baseAttrId={editingRow?.baseAttrId ?? singleChoice[0]?.baseAttrId}
      />

      <DeleteBatchDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onSuccess={handleDelete} selectedBatch={selectedBatch} />
    </>
  );
};

export default MultiChoiceFields;
