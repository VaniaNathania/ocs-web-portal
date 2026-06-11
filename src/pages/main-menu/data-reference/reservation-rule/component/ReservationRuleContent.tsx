import { useState, useMemo, useEffect, useCallback } from "react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { toast } from "sonner";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { Button } from "@/components/ui/button";
import { useReservationListContext } from "../hooks/useReservationRuleContext";
import { mainProductProps, ReUsageList } from "../hooks/ReservationRuleContext";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteReservationDialog from "../blocks/DeleteReservationDialog";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { NumericFormat } from "react-number-format";

export interface policyProps {
  reId: number;
  reAttr: string;
  prodSpecId: number;
  reAttrName: string;
  seq: number;
  value: string;
  limitValue: string;
  balLimit: string;
  ruleScript: string;
  prodSpecName: string;
}

const API_URL_REF = apiConfigRef.ref;

export interface MainProductOption {
  offerId: string | null;
  offerName: string;
  offerCode: string;
  offerType: string;
  isPackage: string;
  networkTypeName: string;
  networkType: string;
  duplicateFlag: string;
}

const initialFormData = (): policyProps => ({
  value: "",
  limitValue: "",
  reAttrName: "",
  balLimit: "",
  prodSpecName: "",
  ruleScript: "",
  reId: 0,
  reAttr: "",
  seq: 0,
  prodSpecId: 0,
});

const ReservationRuleContent = () => {
  const { GetData, PostData, PutData } = useCallApi();
  const { selectedItem, setSelectedItem, displayData, mode, setMode, deleteReservation } = useReservationListContext();
  const [initialDataType, setInitialDataType] = useState<"prodSpecName" | "ruleScript" | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ReUsageList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [listContent, setListContent] = useState<ReUsageList[]>([]);
  const [mainProductOpen, setMainProductOpen] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [mainProduct, setMainProduct] = useState<mainProductProps[]>([]);
  const [formData, setFormData] = useState<policyProps>(initialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPolicy, setSelectedPolicy] = useState<ReUsageList | null>(null);
  const [originalFormData, setOriginalFormData] = useState<policyProps | null>(null);

  useEffect(() => {
    if (mode !== "view") return;

    if (!selectedPolicy) {
      setFormData(initialFormData());
      setInitialDataType(null);
      return;
    }

    const hasMainProduct = Boolean(
      selectedPolicy.prodSpecName && selectedPolicy.prodSpecName !== null && selectedPolicy.prodSpecName.trim() !== ""
    );

    const hasAdvancedRule = Boolean(
      selectedPolicy.ruleScript && selectedPolicy.ruleScript !== null && selectedPolicy.ruleScript.trim() !== ""
    );

    // Set initial data type
    if (hasMainProduct && hasAdvancedRule) {
      console.warn("⚠️ Data inconsistency: Both fields filled. Defaulting to Main Product.");
      setInitialDataType("prodSpecName");
    } else if (hasMainProduct) {
      setInitialDataType("prodSpecName");
    } else if (hasAdvancedRule) {
      setInitialDataType("ruleScript");
    } else {
      setInitialDataType(null);
    }

    const extractNumberOnly = (value: string | undefined | null) => {
      if (!value) return "";
      const match = value.toString().match(/^([\d,]+)/);
      return match ? match[1] : "";
    };

    // ✅ Set form data dengan data lengkap
    const newFormData = {
      value: extractNumberOnly(selectedPolicy.value),
      reAttrName: selectedPolicy.reAttrName || "",
      limitValue: extractNumberOnly(selectedPolicy.limitValue),
      balLimit: selectedPolicy.balLimit || "",
      prodSpecName: selectedPolicy.prodSpecName || "",
      ruleScript: selectedPolicy.ruleScript || "",
      reId: selectedPolicy.reId || 0,
      reAttr: String(selectedPolicy.reAttr || ""),
      prodSpecId: Number(selectedPolicy.prodSpecId) || 0, // ✅ Convert to number
      seq: Number(selectedPolicy.seq) || 0,
    };

    setFormData(newFormData);
    setOriginalFormData(newFormData);
  }, [selectedPolicy, mode]);

  const handleNew = () => {
    if (!selectedItem) {
      toast.error("Please select a parent item from the sidebar first");
      return;
    }

    setFormData(initialFormData());
    setErrors({});
    setSelectedPolicy(null);
    setInitialDataType(null);
    setMode("new");
  };

  const handleEdit = () => {
    // if (!selectedPolicy) {
    //   toast.error("Please select a policy to edit");
    //   return;
    // }

    setMode("edit");

    const extractNumberOnly = (value: string | undefined | null) => {
      if (!value) return "";
      const match = value.toString().match(/^([\d,]+)/);
      return match ? match[1] : "";
    };

    if (selectedPolicy) {
      setFormData({
        value: extractNumberOnly(selectedPolicy?.value),
        reAttrName: selectedPolicy?.reAttrName || "",
        limitValue: extractNumberOnly(selectedPolicy?.limitValue),
        balLimit: selectedPolicy?.balLimit || "",
        prodSpecName: selectedPolicy?.prodSpecName || "",
        ruleScript: selectedPolicy?.ruleScript || "",
        reId: selectedPolicy?.reId || 0,
        reAttr: String(selectedPolicy?.reAttr || ""),
        prodSpecId: Number(selectedPolicy?.prodSpecId) || 0,
        seq: Number(selectedPolicy?.seq) || 0,
      });
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData());
    setOriginalFormData(null);
    setErrors({});
    setInitialDataType(null);
    setMode("view");
  };

  const validateForm = (): boolean => {
    let requiredFields = [
      { key: "value", label: "Reservation Amount" },
      { key: "limitValue", label: "Reservation Limit" },
      { key: "reAttr", label: "Reservation Unit" },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(({ key, label }) => {
      let value;
      value = formData[key as keyof policyProps];

      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Please fill in all required fields");
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let payload: any = {};
      const isEditMode = mode === "edit";

      let nextSeq = formData.seq;
      if (!isEditMode) {
        const existingSeqs = listContent
          .filter((item) => item.reAttr === Number(formData.reAttr))
          .map((item) => Number(item.seq) || 0);

        nextSeq = existingSeqs.length > 0 ? Math.max(...existingSeqs) + 1 : 1;
      }

      const basePolicy = {
        reId: selectedItem?.reId,
        reAttr: Number(formData.reAttr),
        seq: Number(nextSeq),
        value: Number(formData.value),
        spId: 0,
      };

      const baseLimit = {
        reId: selectedItem?.reId,
        reAttr: Number(formData.reAttr),
        value: Number(formData.limitValue),
        spId: 0,
        balLimit: Number(formData.balLimit),
      };

      // ✅ EDIT MODE
      if (isEditMode) {
        if (!originalFormData) {
          toast.error("Original data not found");
          return;
        }

        const oldBasePolicy = {
          reId: selectedItem?.reId,
          reAttr: Number(originalFormData.reAttr),
          seq: Number(originalFormData.seq),
          value: Number(originalFormData.value),
          spId: 0,
        };

        // DENGAN MAIN PRODUCT
        if (formData.prodSpecId) {
          payload = {
            reservePolicyProdSpecDto: {
              ...basePolicy,
              prodSpecId: Number(formData.prodSpecId),
            },
            oldReservePolicyProdSpecDto: {
              ...oldBasePolicy,
              prodSpecId: Number(originalFormData.prodSpecId),
            },
            reserveLimitProdSpecDto: {
              ...baseLimit,
              prodSpecId: Number(formData.prodSpecId),
            },
          };
        }
        // TANPA MAIN PRODUCT (PAKAI ruleScript)
        else {
          payload = {
            reservePolicyDto: {
              ...basePolicy,
              ruleScript: formData.ruleScript,
            },
            oldReservePolicyDto: {
              ...oldBasePolicy,
              ruleScript: originalFormData.ruleScript,
            },
            reserveLimitDto: {
              ...baseLimit,
            },
          };
        }

        // console.log("📦 payload edit:", payload);

        const response = await PutData(`${API_URL_REF}/api/reservation-rule/mod-reservation-policy`, payload);

        if (response?.status) {
          toast.success("Reservation rule updated successfully!");
          setFormData(initialFormData);
          setOriginalFormData(null);
          setMode("view");
          await doGetListData();
        } else {
          const errorMessage = response?.message || "Something went wrong. Please try again.";
          toast.error(errorMessage);
        }
      }
      // ✅ ADD MODE (kode existing)
      else {
        // DENGAN MAIN PRODUCT
        if (formData.prodSpecId) {
          payload = {
            reservePolicyProdSpecDto: {
              ...basePolicy,
              prodSpecId: Number(formData.prodSpecId),
            },
            reserveLimitProdSpecDto: {
              ...baseLimit,
              prodSpecId: Number(formData.prodSpecId),
            },
          };
        }
        // TANPA MAIN PRODUCT
        else {
          payload = {
            reservePolicyDto: {
              ...basePolicy,
              ruleScript: formData.ruleScript,
            },
            reserveLimitDto: {
              ...baseLimit,
            },
          };
        }

        // console.log("📦 payload submit:", payload);

        const response = await PostData(`${API_URL_REF}/api/reservation-rule/add-reservation-policy`, payload);

        if (response?.status) {
          toast.success("Reservation rule created successfully!");
          setFormData(initialFormData);
          setMode("view");
          await doGetListData();
        } else {
          const errorMessage = response?.message || "Something went wrong. Please try again.";
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("❌ error fetching", error);
      toast.error(`Failed to ${mode === "edit" ? "update" : "create"} reservation rule`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (item: ReUsageList) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleItemContentClick = (item: ReUsageList) => {
    setSelectedPolicy(item);
    setMode("view");
  };

  const fetchingMainProduct = async () => {
    setMainLoading(true);
    try {
      const response = await GetData(`${API_URL_REF}/api/reservation-rule/qry-offer-by-type`, {
        offerType: "2",
        spId: 0,
      });
      const responseData = response?.data;
      setMainProduct(responseData);
      return responseData;
    } catch (error: any) {
      console.error("❌ Error fetching main product", error);
    } finally {
      setMainLoading(false);
    }
  };

  const doGetListData = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await GetData(`${API_URL_REF}/api/reservation-rule/qry-reserve-policy-new`, {
        reId: selectedItem?.reId,
        spId: 0,
      });

      const responseData = response?.data;
      setListContent(responseData);
      return responseData;
    } catch (error: any) {
      console.error("❌ Error fetching Data list", error);
      return [];
    } finally {
      setLoadingList(false);
    }
  }, [GetData, selectedItem]);

  useEffect(() => {
    if (selectedItem?.reId) {
      doGetListData();
    } else {
      setListContent([]);
    }
  }, [selectedItem, doGetListData]);

  useEffect(() => {
    if (listContent?.length > 0) {
      setSelectedPolicy(listContent[0]);
    } else {
      setSelectedPolicy(null);
    }
  }, [listContent]);

  const columns = useMemo<ColumnDef<ReUsageList>[]>(
    () => [
      {
        id: "reservationAmount",
        accessorFn: (row) => `${row.value} ${row.reAttrName}`,
        header: ({ column }) => <DataGridColumnHeader title="Reservation Amount" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "reservationLimit",
        accessorFn: (row) => `${row.limitValue} ${row.reAttrName}`,
        header: ({ column }) => <DataGridColumnHeader title="Reservation Limit" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "balLimit",
        accessorFn: (row) => row.balLimit,
        header: ({ column }) => <DataGridColumnHeader title="Balance Limit" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "prodSpecName",
        accessorFn: (row) => row.prodSpecName,
        header: ({ column }) => <DataGridColumnHeader className="" column={column} title="Main Product" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "ruleScript",
        accessorFn: (row) => row.ruleScript,
        header: ({ column }) => <DataGridColumnHeader className="" column={column} title="Advanced Rule" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "Operation",
        header: ({ column }) => <DataGridColumnHeader className="text-center" column={column} title="Operation" />,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPolicy(data);
                  handleEdit();
                }}
              >
                <KeenIcon icon="notepad-edit" className="text-lg" />
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(data);
                }}
                title="Delete"
              >
                <KeenIcon icon="trash" className="text-lg" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  const isMainProductDisabled = () => {
    if (mode === "view") return true;

    if (mode === "new") {
      return Boolean(formData.ruleScript && formData.ruleScript.trim() !== "");
    }

    if (mode === "edit") {
      return Boolean(formData.ruleScript && formData.ruleScript.trim() !== "");
    }

    return false;
  };

  const isAdvancedRuleDisabled = () => {
    if (mode === "view") return true;

    if (mode === "new") {
      return Boolean(formData.prodSpecName && formData.prodSpecName.trim() !== "");
    }

    if (mode === "edit") {
      return Boolean(formData.prodSpecName && formData.prodSpecName.trim() !== "");
    }

    return false;
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <div className="bg-white rounded-lg shadow mb-6">
        <DataGridProvider
          columns={columns}
          data={listContent}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          serverSide={false}
          getRowProps={(row) => {
            const isSelected = row.original.value === selectedPolicy?.value;
            return {
              className: isSelected ? selectedRowHighLight : nonSelectedRowHighLight,
              onClick: () => {
                handleItemContentClick(row.original);
              },
            };
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-row justify-between">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Detail</h3>

          {mode === "view" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                handleNew();
              }}
            >
              New
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Reservation Amount
            </label>
            <NumericFormat
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.value ? "border-red-500" : ""}`}
              value={formData.value}
              onValueChange={(e) => {
                const newValue = e.floatValue === undefined ? null : e.floatValue;
                setFormData({ ...formData, value: String(newValue ?? "") });
                setErrors({ ...errors, value: "" });
              }}
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              disabled={mode === "view"}
            />
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Reservation Limit
            </label>
            <NumericFormat
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.limitValue ? "border-red-500" : ""}`}
              value={formData.limitValue}
              onValueChange={(e) => {
                const newValue = e.floatValue === undefined ? null : e.floatValue;
                setFormData({ ...formData, limitValue: String(newValue ?? "") });
                setErrors({ ...errors, limitValue: "" });
              }}
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              disabled={mode === "view"}
            />
            {errors.limitValue && <p className="text-red-500 text-sm mt-1">{errors.limitValue}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Reservation Unit
            </label>
            <Select
              value={formData.reAttr}
              onValueChange={(value) => {
                setFormData({ ...formData, reAttr: value });
                setErrors({ ...errors, reAttr: "" });
              }}
              disabled={mode === "view"}
            >
              <SelectTrigger className={`h-10 ${errors.reAttr ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select reservation unit" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="4">(Second)Duration</SelectItem>
                <SelectItem value="901">Currency</SelectItem>
                <SelectItem value="301">Event Charge</SelectItem>
                <SelectItem value="101">Occurrence</SelectItem>
                <SelectItem value="107">Up+Down Bytes</SelectItem>
              </SelectContent>
            </Select>
            {errors.reAttr && <p className="text-red-500 text-sm mt-1">{errors.reAttr}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Balance Limit</label>
            <NumericFormat
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.balLimit}
              onValueChange={(e) => {
                const newValue = e.floatValue === undefined ? null : e.floatValue;
                setFormData({ ...formData, balLimit: String(newValue ?? "") });
                setErrors({ ...errors, balLimit: "" });
              }}
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              disabled={mode === "view"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Product</label>
            <div className="relative">
              <Select
                open={mainProductOpen}
                onOpenChange={(open) => {
                  setMainProductOpen(open);
                  if (open && mainProduct.length === 0 && !mainLoading) {
                    fetchingMainProduct();
                  }
                }}
                value={formData.prodSpecId > 0 ? String(formData.prodSpecId) : ""}
                onValueChange={(value) => {
                  const offerId = Number(value);
                  const selectedProduct = mainProduct.find((item) => item.offerId === offerId);
                  setFormData({
                    ...formData,
                    prodSpecName: selectedProduct?.offerName || "",
                    prodSpecId: offerId,
                  });
                }}
                disabled={mode === "view" || isMainProductDisabled()}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select main product">
                    {formData.prodSpecName || "Select main product"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[300px]">
                  {mainLoading && (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}

                  {!mainLoading && mainProduct.length === 0 && (
                    <SelectItem value="empty" disabled>
                      No data available
                    </SelectItem>
                  )}

                  {!mainLoading &&
                    mainProduct.map((item) =>
                      item.offerName && item.offerId ? (
                        <SelectItem key={item.offerId} value={String(item.offerId)}>
                          {item.offerName}
                        </SelectItem>
                      ) : null
                    )}
                </SelectContent>
              </Select>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1">
                {formData.prodSpecId > 0 && mode !== "view" && !isMainProductDisabled() && (
                  <DefaultTooltip title="Clear selection" placement="top">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({
                          ...formData,
                          prodSpecName: "",
                          prodSpecId: 0,
                        });
                      }}
                      className="text-gray-500 hover:text-red-500 p-1"
                    >
                      <KeenIcon icon="cross" className="text-xs" />
                    </button>
                  </DefaultTooltip>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advanced Rule</label>
            <Input
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.ruleScript || ""}
              onChange={(e) => {
                setFormData({ ...formData, ruleScript: e.target.value });
              }}
              disabled={isAdvancedRuleDisabled()}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {(mode === "new" || mode === "edit") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white"
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (mode === "edit" ? "Updating..." : "Saving...") : mode === "edit" ? "Update" : "OK"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <DeleteReservationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemName={itemToDelete?.reName}
        itemToDelete={itemToDelete}
        isDeleting={isDeleting}
        reload={doGetListData}
      />
    </div>
  );
};

export default ReservationRuleContent;
