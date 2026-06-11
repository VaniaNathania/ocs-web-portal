import React, { useState, useMemo, useCallback } from "react";
import { FaArrowDown, FaArrowUp, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import CreatePriceDialog from "./CreatePriceDialog";
// import EditPriceDialog from "./EditPriceDialog";
import DeletePriceDialog from "./DeletePriceDialog";
import UpdateDateDialog from "./UpdateDateDialog";
import { Button } from "@/components/ui/button";
import DeleteAccumulationDialog from "./accumulation-usage-price/DeleteAccumulationDialog";
import UpdateAccumulationPriceDialog from "./accumulation-usage-price/UpdateAccumulationPriceDialog";
import DeleteBenefitDialog from "./benefit-usage-price/DeleteBenefitDialog";
import CreateBenefiPricetDialog from "./benefit-usage-price/CreatePriceBenefitDialog";
import UpdateBenefiPricetDialog from "./benefit-usage-price/UpdateBenefitDialog";
import EditPriceDialog from "./UpdatePriceDialog";
import { useUsagePriceCreateContext } from "../hooks";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

// ----- Interface -----
const API_URL = apiConfig.service_price_plan;
interface Price {
  reType: string;
  priceId: number;
  priceName: string;
  valueString: string;
  rum: number;
  calculateUnit: string;
  acctItemTypeName: string | null;
  reAttrName: string;
  priceVerId: number;
  priority: number;
  value: number;
}

interface PriceVersion {
  priceVerId: number;
  effDate: string | null;
  expDate: string | null;
  price: Price[];
}

interface AccumulationData {
  value: number;
  mappingId: number;
  priceId: number;
  resourceId: number;
  resourceName: string;
  reAttr: number;
  reAttrName: string;
  offerVerId: number;
  shareFlag: string;
  comments: string;
  effDate: string;
  expDate: string;
  scPriceId: number;
  ratePlanType: number;
  acmName: string;
  priceVerId: number;
  ratePlanId: number;
  rum: number;
  refValueId: number;
  accumulation: string;
}

interface MappingZone {
  mappingId: number;
  mappingName: string;
  priority: number;
}

interface VersionTableProps {
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: (priceId: number) => void;
  onDelete?: (priceId: number) => void;
  onRefresh?: () => void;
  children?: React.ReactNode;
  ratePlanId: number;
  ratePlanType?: string;
  priceVersion?: PriceVersion;
  accumulationData?: AccumulationData[];
  benefitData?: Benefit[];
  isMappingCreated?: boolean;
  taxData?: PriceVersion;
}

const VersionTable: React.FC<VersionTableProps> = ({ priceVersion, accumulationData, isExpanded, onToggle, onEdit, onDelete, onRefresh, ratePlanId, ratePlanType, children, benefitData, isMappingCreated, taxData }) => {
  const [versionType, setVersionType] = useState<"price" | "tax" | null>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [selectedPriceVerId, setSelectedPriceVerId] = useState<number | null>(null);
  const [showUpdateDateDialog, setShowUpdateDateDialog] = useState(false);
  const [showDeletePriceDialog, setShowDeletePriceDialog] = useState(false);
  const [showCreateBenefitDialog, setShowCreateBenefitDialog] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<{
    priceId: number;
    priceVersionId: number;
    reType: string;
  } | null>(null);
  const { PutData } = useCallApi();
  const [showDeleteAccumDialog, setShowDeleteAccumDialog] = useState(false);
  const [accumToDelete, setAccumToDelete] = useState<{
    priceId: number;
    priceVerId: number;
  } | null>(null);
  const [showDeleteBenefitDialog, setShowDeleteBenefitDialog] = useState(false);
  const [benefitDelete, setBenefitDelete] = useState<{
    priceId: number;
    priceVerId: number;
    subBalTypeId: number;
  } | null>(null);

  const [showUpdateAccumDialog, setShowUpdateAccumDialog] = useState(false);
  const [accumToEdit, setAccumToEdit] = useState<{
    priceId: number;
    priceVerId: number;
  } | null>(null);

  const [showUpdateBenefitDialog, setShowUpdateBenefitDialog] = useState(false);
  const [benefitToEdit, setBenefitToEdit] = useState<{
    priceId: number;
    priceVerId: number;
  } | null>(null);

  const changeBenefitPriority = async (priceId: number, newPriority: number, oldPriority: number, priceVerId: number) => {
    const response = await PutData(`${API_URL}/price/benefit/priority/update`, {
      priceId: priceId,
      newPriority: newPriority,
      oldPriority: oldPriority,
      priceVerId: priceVerId,
    });

    if (response?.status) {
      toast.success("Benefit priority updated successfully");
      onRefresh?.();
    } else {
      toast.error(response?.message || "Failed to update benefit priority");
      await getPriceVersion(selectedRatePlan, selectedMapping);
    }
  };

  const changePricePriority = async (priceId: number, newPriority: number, oldPriority: number, priceVerId: number) => {
    const response = await PutData(`${API_URL}/price/priority/update`, {
      priceId: priceId,
      newPriority: newPriority,
      oldPriority: oldPriority,
      priceVerId: priceVerId,
    });

    if (response?.status) {
      toast.success("Price priority updated successfully");
      onRefresh?.();
    } else {
      toast.error(response?.message || "Failed to update price priority");
      await getPriceVersion(selectedRatePlan, selectedMapping);
    }
  };

  // Tax priority change (menggunakan endpoint yang sama dengan price)
  const changeTaxPriority = async (priceId: number, newPriority: number, oldPriority: number, priceVerId: number) => {
    const response = await PutData(`${API_URL}/price/priority/update`, {
      priceId: priceId,
      newPriority: newPriority,
      oldPriority: oldPriority,
      priceVerId: priceVerId,
    });

    if (response?.status) {
      toast.success("Tax priority updated successfully");
      onRefresh?.();
    } else {
      toast.error(response?.message || "Failed to update tax priority");
      await getPriceVersion(selectedRatePlan, selectedMapping);
    }
  };

  const { getAccumulationList, getPriceVersion, selectedRatePlan, selectedMapping } = useUsagePriceCreateContext();

  const handleEditBenefit = useCallback((priceId: number, priceVerId: number, subBalTypeId: number) => {
    setBenefitToEdit({ priceId, priceVerId });
    setShowUpdateBenefitDialog(true);
    getPriceVersion(selectedRatePlan, selectedMapping);
  }, []);

  const isBenefit = ratePlanType === "3";
  const isAccumulation = ratePlanType === "4";
  const isTax = ratePlanType === "5";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-CA");
    } catch {
      return dateString;
    }
  };

  const handleEditPrice = useCallback(
    (priceId: number, priceVerId: number) => {
      setSelectedPriceId(priceId.toString());
      setSelectedPriceVerId(priceVerId);
      setShowEditDialog(true);
      if (onEdit) onEdit(priceId);
    },
    [onEdit],
  );

  const handleEditDialog = (show: boolean, id: string | null) => {
    setShowEditDialog(show);
    getPriceVersion(selectedRatePlan, selectedMapping);
    if (!show) setSelectedPriceId(null);
  };

  const handleDeletePrice = useCallback(
    (priceId: number) => {
      let priceItem;
      let priceVersionId;

      if (isTax) {
        priceItem = taxData?.price.find((p) => p.priceId === priceId);
        priceVersionId = taxData?.priceVerId;
      } else {
        priceItem = priceVersion?.price.find((p) => p.priceId === priceId);
        priceVersionId = priceVersion?.priceVerId;
      }

      if (priceItem && priceVersionId) {
        setPriceToDelete({
          priceId,
          priceVersionId: priceVersionId,
          reType: priceItem.reType,
        });
        setShowDeletePriceDialog(true);
      }
    },
    [priceVersion, taxData, isTax],
  );

  const handleCreatePriceSuccess = () => {
    onRefresh?.();
    getPriceVersion(selectedRatePlan, selectedMapping);
    setShowCreateDialog(false);
  };

  const handleDeletePriceSuccess = () => {
    onRefresh?.();
    getPriceVersion(selectedRatePlan, selectedMapping);
    setShowDeletePriceDialog(false);
    setPriceToDelete(null);
  };

  const handleAddAccumulation = () => {
    toast.error("Each price version can have only one accumulation.");
  };

  const handleEditAccumulation = useCallback((priceId: number, priceVerId: number) => {
    setAccumToEdit({ priceId, priceVerId });
    setShowUpdateAccumDialog(true);
  }, []);

  const handleDeleteAccumulation = useCallback((priceId: number, priceVerId: number) => {
    setAccumToDelete({
      priceId,
      priceVerId,
    });
    setShowDeleteAccumDialog(true);
  }, []);

  const handleDeleteBenefit = useCallback((priceId: number, priceVerId: number, subBalTypeId: number) => {
    setBenefitDelete({
      priceId,
      priceVerId,
      subBalTypeId,
    });
    setShowDeleteBenefitDialog(true);
  }, []);

  const handleDeleteAccumSuccess = useCallback(() => {
    onRefresh?.();
    setShowDeleteAccumDialog(false);
    setAccumToDelete(null);
  }, [onRefresh]);

  const handleCloseDeleteAccumDialog = useCallback(() => {
    setShowDeleteAccumDialog(false);
    setAccumToDelete(null);
  }, []);

  const handleEditDate = () => {
    setShowUpdateDateDialog(true);
  };

  const handleUpdateDateSuccess = () => {
    onRefresh?.();
    setShowUpdateDateDialog(false);
  };

  const tableData = isAccumulation
    ? (accumulationData ?? [])
    : isBenefit
      ? [...(benefitData ?? [])].sort((a, b) => a.priority - b.priority)
      : isTax
        ? [...(taxData?.price ?? [])].sort((a, b) => a.priority - b.priority)
        : [...(priceVersion?.price ?? [])].sort((a, b) => a.priority - b.priority);

  const benefitColumns = useMemo<ColumnDef<Benefit>[]>(
    () => [
      {
        accessorKey: "priceName",
        header: ({ column }) => <DataGridColumnHeader title="Benefit Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "acctResName",
        header: ({ column }) => <DataGridColumnHeader title="Result Account Item Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "calculateUnit",
        header: ({ column }) => <DataGridColumnHeader title="Calculate Unit" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          console.log("Rendering calculateUnit cell for item:", item);
          return `${item.value} ${item.acctResName} / ${item.rum}${item.reAttrName}`;
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "actions",
        header: ({ column }) => <DataGridColumnHeader title="Actions" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const benefitTableData = [...(benefitData ?? [])].sort((a, b) => a.priority - b.priority);
          const index = benefitTableData.findIndex((b) => b.priceId === item.priceId);

          return (
            <div className="flex items-center justify-center gap-2">
              {/* Edit Button */}
              <Button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleEditBenefit(row.original.priceId, priceVersion?.priceVerId || 0, row.original.subBalTypeId)}>
                <KeenIcon icon="notepad-edit" />
              </Button>

              {/* Delete Button */}
              <Button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleDeleteBenefit(row.original.priceId, priceVersion?.priceVerId || 0, row.original.subBalTypeId)}>
                <KeenIcon icon="trash" />
              </Button>

              {/* Move Up Button */}
              <Button
                disabled={index === 0}
                onClick={() => changeBenefitPriority(item.priceId, benefitTableData[index - 1].priority, item.priority, item.priceVerId)}
                title="Move Up"
                className="btn btn-sm btn-icon btn-clear btn-light text-gray-600"
              >
                <FaArrowUp />
              </Button>

              {/* Move Down Button */}
              <Button
                disabled={index === benefitTableData.length - 1}
                onClick={() => changeBenefitPriority(item.priceId, benefitTableData[index + 1].priority, item.priority, item.priceVerId)}
                title="Move Down"
                className="btn btn-sm btn-icon btn-clear btn-light text-gray-600"
              >
                <FaArrowDown />
              </Button>
            </div>
          );
        },
      },
    ],
    [priceVersion?.priceVerId, benefitData, changeBenefitPriority],
  );

  const accumulationColumns = useMemo<ColumnDef<AccumulationData>[]>(
    () => [
      {
        accessorKey: "resourceName",
        header: ({ column }) => <DataGridColumnHeader title="Accumulation Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
        meta: { headerClassName: "w-[200px]" },
      },
      {
        id: "calculateUnit",
        header: ({ column }) => <DataGridColumnHeader title="Calculate Unit" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return `${item.accumulation} ${item.resourceName} / ${item.rum} ${item.reAttrName}`;
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "actions",
        header: ({ column }) => <DataGridColumnHeader title="Actions" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAccumulation(item.priceId, item.priceVerId);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAccumulation(item.priceId, item.priceVerId);
                }}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </Button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleDeleteAccumulation],
  );

  const priceColumns = useMemo<ColumnDef<Price>[]>(() => {
    const priceTableData = tableData as Price[];

    return [
      {
        accessorKey: "priceName",
        header: ({ column }) => <DataGridColumnHeader title="Price Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
        meta: { headerClassName: "w-[200px]" },
      },
      {
        accessorKey: "acctItemTypeName",
        header: ({ column }) => <DataGridColumnHeader title="Result Account Item Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const value = row.getValue("acctItemTypeName") as string | null;
          return value || "";
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "calculateUnit",
        header: ({ column }) => <DataGridColumnHeader title="Calculate Unit" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const items = row.original;
          return `${items.value} ${items.acctItemTypeName || "-"} / ${items.rum}${items.reAttrName}`;
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "actions",
        header: ({ column }) => <DataGridColumnHeader title="Actions" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const index = priceTableData.findIndex((p) => p.priceId === item.priceId);

          return (
            <div className="flex items-center space-x-2">
              {/* ✏️ Edit */}
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPrice(item.priceId, item.priceVerId);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </Button>

              {/* 🗑️ Delete */}
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePrice(item.priceId);
                }}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </Button>

              {/* ⬆️ Move Up */}
              <Button
                disabled={index === 0}
                onClick={() => changePricePriority(item.priceId, priceTableData[index - 1].priority, item.priority, item.priceVerId)}
                title="Move Up"
                className="btn btn-sm btn-icon btn-clear btn-light text-gray-600"
              >
                <FaArrowUp />
              </Button>

              {/* ⬇️ Move Down */}
              <Button
                disabled={index === priceTableData.length - 1}
                onClick={() => changePricePriority(item.priceId, priceTableData[index + 1].priority, item.priority, item.priceVerId)}
                title="Move Down"
                className="btn btn-sm btn-icon btn-clear btn-light text-gray-600"
              >
                <FaArrowDown />
              </Button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[150px] text-center",
          cellClassName: "text-center",
        },
      },
    ];
  }, [handleDeletePrice, handleEditPrice, changePricePriority]);

  // Tax columns (sama seperti price columns tapi menggunakan changeTaxPriority)
  const taxColumns = useMemo<ColumnDef<Price>[]>(() => {
    const taxTableData = tableData as Price[];

    return [
      {
        accessorKey: "priceName",
        header: ({ column }) => <DataGridColumnHeader title="Tax Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
        meta: { headerClassName: "w-[200px]" },
      },
      {
        accessorKey: "acctItemTypeName",
        header: ({ column }) => <DataGridColumnHeader title="Result Account Item Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const value = row.getValue("acctItemTypeName") as string | null;
          return value || <span className="text-gray-400 italic">N/A</span>;
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "calculateUnit",
        header: ({ column }) => <DataGridColumnHeader title="Calculate Unit" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const items = row.original;
          return `${items.value} ${items.acctItemTypeName} / ${items.rum}${items.reAttrName}`;
        },
        meta: { headerClassName: "w-[250px]" },
      },
      {
        id: "actions",
        header: ({ column }) => <DataGridColumnHeader title="Actions" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          const index = taxTableData.findIndex((p) => p.priceId === item.priceId);

          return (
            <div className="flex items-center space-x-2">
              {/* ✏️ Edit */}
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPrice(item.priceId, item.priceVerId);
                }}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </Button>

              {/* 🗑️ Delete */}
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePrice(item.priceId);
                }}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </Button>

              {/* ⬆️ Move Up */}
              <Button
                disabled={index === 0}
                onClick={() => changeTaxPriority(item.priceId, taxTableData[index - 1].priority, item.priority, item.priceVerId)}
                title="Move Up"
                className="btn btn-sm btn-icon btn-clear btn-light text-gray-600"
              >
                <FaArrowUp />
              </Button>

              {/* ⬇️ Move Down */}
              <Button
                disabled={index === taxTableData.length - 1}
                onClick={() => changeTaxPriority(item.priceId, taxTableData[index + 1].priority, item.priority, item.priceVerId)}
                title="Move Down"
                className="btn btn-sm btn-icon btn-clear btn-light text-gray-600"
              >
                <FaArrowDown />
              </Button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[150px] text-center",
          cellClassName: "text-center",
        },
      },
    ];
  }, [handleDeletePrice, handleEditPrice, changeTaxPriority]);

  const tableColumns = isAccumulation ? accumulationColumns : isBenefit ? benefitColumns : isTax ? taxColumns : priceColumns;

  const CustomToolbar = () => (
    <div className="flex items-center justify-between mb-3 px-5 py-3 border-b">
      <div className="flex items-center gap-3">
        {/* Button untuk create - hanya untuk non-accumulation */}
        {!isAccumulation && (
          <Button
            onClick={() => {
              if (isBenefit) {
                setShowCreateBenefitDialog(true);
              } else {
                // Untuk price dan tax menggunakan CreatePriceDialog yang sama
                setShowCreateDialog(true);
              }
            }}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <span>{isBenefit ? "Add Benefit" : isTax ? "Add Tax" : "Add Price"}</span>
          </Button>
        )}

        {isAccumulation && (
          <Button className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors" onClick={handleAddAccumulation}>
            <span>Add Accumulation</span>
          </Button>
        )}

        <Button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Filter">
          <KeenIcon icon="filter" />
        </Button>

        <Button onClick={() => onRefresh?.()} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Refresh">
          <KeenIcon icon="arrows-circle" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => onRefresh?.()} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Refresh">
          <KeenIcon icon="arrows-circle" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 rounded p-3 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Type indicator */}
          <span className={`px-2 py-1 rounded text-xs font-medium ${isAccumulation ? "bg-green-100 text-green-800" : isBenefit ? "bg-purple-100 text-purple-800" : isTax ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}>
            {isAccumulation ? "ACCUMULATION" : isBenefit ? "BENEFIT" : isTax ? "TAX" : "PRICE"}
          </span>

          <h1 className="font-semibold text-sm text-gray-800">
            {isAccumulation
              ? `${formatDate(accumulationData?.[0]?.effDate || null)} - ${formatDate(accumulationData?.[0]?.expDate || null)}`
              : isTax
                ? `${formatDate(taxData?.effDate || null)} - ${formatDate(taxData?.expDate || null)}`
                : `${formatDate(priceVersion?.effDate || null)} - ${formatDate(priceVersion?.expDate || null)}`}
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="ghost" className="h-7.5 bg-gray-100 hover:bg-gray-400 p-1" onClick={handleEditDate} title="Edit Date">
            <KeenIcon icon="notepad-edit" />
          </Button>
          <div
            onClick={onToggle} // ✅ Selalu aktif
            className="cursor-pointer flex items-center transition-colors p-1"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 bg-white rounded border">
          {tableData.length > 0 ? (
            isAccumulation ? (
              <DataGridProvider<AccumulationData>
                columns={accumulationColumns}
                data={tableData as AccumulationData[]}
                pagination={{ size: 5 }}
                toolbar={<CustomToolbar />}
                layout={{ card: true }}
                sorting={[
                  {
                    id: "resourceName",
                    desc: false,
                  },
                ]}
                serverSide={false}
              >
                {children}
              </DataGridProvider>
            ) : isBenefit ? (
              <DataGridProvider<Benefit>
                columns={benefitColumns}
                data={tableData as Benefit[]}
                pagination={{ size: 5 }}
                toolbar={<CustomToolbar />}
                layout={{ card: true }}
                sorting={[
                  {
                    id: "priority",
                    desc: false,
                  },
                ]}
                serverSide={false}
              >
                {children}
              </DataGridProvider>
            ) : isTax ? (
              <DataGridProvider<Price>
                columns={taxColumns}
                data={tableData as Price[]}
                pagination={{ size: 5 }}
                toolbar={<CustomToolbar />}
                layout={{ card: true }}
                sorting={[
                  {
                    id: "priority",
                    desc: false,
                  },
                ]}
                serverSide={false}
              >
                {children}
              </DataGridProvider>
            ) : (
              <DataGridProvider<Price>
                columns={priceColumns}
                data={tableData as Price[]}
                pagination={{ size: 5 }}
                toolbar={<CustomToolbar />}
                layout={{ card: true }}
                sorting={[
                  {
                    id: "priority",
                    desc: false,
                  },
                ]}
                serverSide={false}
              >
                {children}
              </DataGridProvider>
            )
          ) : (
            <>
              <CustomToolbar />
              <div className="text-center py-8 text-gray-500">
                <p className="italic">No {isAccumulation ? "accumulation" : isBenefit ? "benefit" : isTax ? "tax" : "price"} data available for this version</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create Price Dialog - untuk Price dan Tax */}
      {!isAccumulation && !isBenefit && showCreateDialog && (
        <CreatePriceDialog
          priceVerId={isTax ? taxData!.priceVerId : priceVersion!.priceVerId}
          onClose={() => setShowCreateDialog(false)}
          effDate={isTax ? taxData?.effDate : priceVersion?.effDate}
          expDate={isTax ? taxData?.expDate : priceVersion?.expDate}
          onRefresh={handleCreatePriceSuccess}
          versionType={isTax ? "tax" : "price"}
          showDialog={showCreateDialog}
        />
      )}

      {/* Edit Price Dialog - untuk Price dan Tax */}
      <EditPriceDialog showEditDialog={showEditDialog} priceId={selectedPriceId} priceVerId={selectedPriceVerId} handleEditDialog={handleEditDialog} onUpdateSuccess={onRefresh} versionType={isTax ? "tax" : "price"} />

      {/* Delete Price Dialog - untuk Price dan Tax */}
      {!isAccumulation && (
        <DeletePriceDialog
          show={showDeletePriceDialog}
          onClose={() => setShowDeletePriceDialog(false)}
          priceId={priceToDelete?.priceId || null}
          priceVersionId={priceToDelete?.priceVersionId || null}
          reType={priceToDelete?.reType || null}
          onDeleteSuccess={handleDeletePriceSuccess}
        />
      )}

      {/* Update Date Dialog */}
      <UpdateDateDialog
        show={showUpdateDateDialog}
        onClose={() => {
          setShowUpdateDateDialog(false);
          onRefresh?.();
        }}
        ratePlanId={ratePlanId}
        priceVersion={isTax ? (taxData ?? accumulationData?.[0]) : (priceVersion ?? accumulationData?.[0])}
        onUpdateSuccess={handleUpdateDateSuccess}
        effDate={isTax ? (taxData?.effDate ?? accumulationData?.[0]?.effDate) : (priceVersion?.effDate ?? accumulationData?.[0]?.effDate)}
        expDate={isTax ? (taxData?.expDate ?? accumulationData?.[0]?.expDate) : (priceVersion?.expDate ?? accumulationData?.[0]?.expDate)}
        mappingId={selectedMapping ?? null}
      />

      {/* Accumulation Dialogs */}
      {isAccumulation && (
        <UpdateAccumulationPriceDialog
          show={showUpdateAccumDialog}
          onClose={() => {
            setShowUpdateAccumDialog(false);
            setAccumToEdit(null);
            onRefresh?.();
          }}
          priceId={accumToEdit?.priceId || null}
          priceVerId={accumToEdit?.priceVerId || null}
          onUpdateSuccess={() => {
            onRefresh?.();
            setShowUpdateAccumDialog(false);
            setAccumToEdit(null);
          }}
        />
      )}

      {isAccumulation && (
        <DeleteAccumulationDialog
          show={showDeleteAccumDialog}
          onClose={() => {
            handleCloseDeleteAccumDialog();
          }}
          priceId={accumToDelete?.priceId || null}
          priceVerId={accumToDelete?.priceVerId || null}
          onDeleteSuccess={handleDeleteAccumSuccess}
        />
      )}

      {/* Benefit Dialogs */}
      {isBenefit && showCreateBenefitDialog && (
        <CreateBenefiPricetDialog onClose={() => setShowCreateBenefitDialog(false)} priceVerId={priceVersion!.priceVerId} onCreateSuccess={onRefresh} effDate={priceVersion?.effDate} expDate={priceVersion?.expDate} />
      )}

      {isBenefit && showUpdateBenefitDialog && (
        <UpdateBenefiPricetDialog
          show={showUpdateBenefitDialog}
          onClose={() => {
            setShowUpdateBenefitDialog(false);
            setBenefitToEdit(null);
          }}
          priceId={benefitToEdit?.priceId || null}
          priceVerId={benefitToEdit?.priceVerId || null}
          onUpdateSuccess={() => {
            onRefresh?.();
            setShowUpdateBenefitDialog(false);
            setBenefitToEdit(null);
          }}
        />
      )}

      {isBenefit && (
        <DeleteBenefitDialog
          show={showDeleteBenefitDialog}
          onClose={() => {
            setShowDeleteBenefitDialog(false);
            setBenefitDelete(null);
          }}
          priceId={benefitDelete?.priceId || null}
          priceVersionId={benefitDelete?.priceVerId || null}
          subBalTypeId={benefitDelete?.subBalTypeId || null}
          onDeleteSuccess={() => {
            onRefresh?.();
            setShowDeleteBenefitDialog(false);
            setBenefitDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default VersionTable;
