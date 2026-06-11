import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { domainProps, initialPropsDomain } from "../action/AdviceTypeAction";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const AdviceTypeDetailSidebar = () => {
  const { GetData, PostData, PutData } = useCallApi();
  const {
    fetchingListContent,
    valueDetail,
    setValueDetail,
    selectedChildrenSide,
    selectedParentSide,
    selectedSubChildrenSide,
    reloadSubChildren,
    setSelectedSubChildrenSide,
    setShowDeleteSidebar,
    menuPrivAccess,
  } = useAdviceTypeContext();
  const [formData, setFormData] = useState<domainProps>(initialPropsDomain);
  const isParentAll = formData.value === "ALL";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortNameValue =
    valueDetail === "add"
      ? formData.lookupName
      : (selectedSubChildrenSide?.adviceTypeSortName ?? formData.lookupName);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.lookupName || formData.lookupName.trim() === "") {
      newErrors.lookupName = "Sort name is required";
      toast.error("Sort name is required", { id: "lookupName" });
    } else {
      toast.dismiss("lookupName");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!formData?.adviceCatg) {
      toast.error(
        "Advice category is missing. Please select a category first.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let response;

      if (valueDetail === "add") {
        // POST - Add new advice type sort
        response = await PostData(
          `${API_URL_REF}/api/advice-type/add-advice-type-sort`,
          {
            adviceTypeSortName: formData.lookupName,
            adviceCatg: formData?.adviceCatg,
            spId: 0,
          },
        );
      } else if (valueDetail === "edit") {
        // PUT - Edit existing advice type sort
        response = await PutData(
          `${API_URL_REF}/api/advice-type/mod-advice-type-sort`,
          {
            adviceTypeSortId: selectedSubChildrenSide?.adviceTypeSortId || 0,
            adviceTypeSortName: formData.lookupName,
            adviceCatg: formData?.adviceCatg,
            spId: 0,
          },
        );
      }

      // console.log("api response:", response);

      if (response?.status) {
        const successMessage =
          valueDetail === "add"
            ? "Advice type sort created successfully!"
            : "Advice type sort updated successfully!";
        toast.success(successMessage);

        await fetchingListContent(); // reload data content

        const currentChildValue =
          selectedChildrenSide?.value ||
          selectedSubChildrenSide?.adviceCatg ||
          formData.adviceCatg;

        if (currentChildValue) {
          await reloadSubChildren(currentChildValue);
        }

        if (valueDetail === "edit") {
          setSelectedSubChildrenSide({
            ...selectedSubChildrenSide!,
            adviceTypeSortName: formData.lookupName,
          });
        }

        setValueDetail("view");
        setFormData(initialPropsDomain);
      } else {
        const errorMessage =
          response?.message ||
          `Failed to ${valueDetail === "add" ? "create" : "update"} advice type sort. Please try again.`;
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      console.error(
        `❌ Error ${valueDetail === "add" ? "creating" : "updating"} advice type sort:`,
        error,
      );
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    valueDetail,
    PostData,
    PutData,
    fetchingListContent,
    setValueDetail,
    selectedChildrenSide,
    selectedSubChildrenSide,
    reloadSubChildren,
  ]);

  const handleCancel = () => {
    setValueDetail("view");

    if (selectedSubChildrenSide) {
      setFormData({
        tableName: "",
        columnName: "",
        value: String(selectedSubChildrenSide.adviceTypeSortId),
        lookupName: selectedSubChildrenSide.adviceTypeSortName,
        comments: "",
        adviceCatg:
          selectedSubChildrenSide.adviceCatg ||
          selectedChildrenSide?.value ||
          "",
      });
    } else if (selectedChildrenSide) {
      setFormData({
        tableName: "",
        columnName: "",
        value: selectedChildrenSide.value,
        lookupName: selectedChildrenSide.lookupName,
        comments: "",
        adviceCatg: selectedChildrenSide?.value || "",
      });
    } else {
      setFormData(initialPropsDomain);
    }

    setErrors({});
  };

  const handleEdit = () => {
    if (!selectedSubChildrenSide) {
      toast.error("No sort name selected for editing");
      return;
    }
    setValueDetail("edit");
    setErrors({});
  };

  useEffect(() => {
    if (valueDetail === "add") {
      setFormData({
        ...initialPropsDomain,
        adviceCatg: selectedChildrenSide?.value || "",
      });
      return;
    }

    if (selectedSubChildrenSide) {
      const newFormData = {
        tableName: "",
        columnName: "",
        value: String(selectedSubChildrenSide.adviceTypeSortId),
        lookupName: selectedSubChildrenSide.adviceTypeSortName,
        comments: "",
        adviceCatg: selectedSubChildrenSide.adviceCatg || "",
      };
      setFormData(newFormData);
      return;
    }

    if (selectedChildrenSide) {
      setFormData({
        tableName: "",
        columnName: "",
        value: selectedChildrenSide.value,
        lookupName: selectedChildrenSide.lookupName,
        comments: "",
        adviceCatg: selectedChildrenSide?.value || "",
      });
      return;
    }

    if (selectedParentSide) {
      setFormData({
        tableName: selectedParentSide.tableName,
        columnName: selectedParentSide.columnName,
        value: selectedParentSide.value,
        lookupName: selectedParentSide.lookupName,
        comments: selectedParentSide.comments,
        adviceCatg: "",
      });
      return;
    }
  }, [
    valueDetail,
    selectedSubChildrenSide,
    selectedChildrenSide,
    selectedParentSide,
  ]);

  const isFormMode = valueDetail === "add" || valueDetail === "edit";

  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 shrink-0">
      {/* Header dengan gradient dan icon */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {valueDetail === "add" && (
            <>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="font-semibold text-lg text-gray-800">
                Add Sort Name
              </h2>
            </>
          )}
          {valueDetail === "edit" && (
            <>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="font-semibold text-lg text-gray-800">
                Edit Sort Name
              </h2>
            </>
          )}
          {valueDetail === "view" && (
            <>
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h2 className="font-semibold text-lg text-gray-800">Detail</h2>
            </>
          )}
        </div>
      </div>

      {isFormMode ? (
        <div className="flex flex-col p-4 space-y-4">
          {/* Form Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <span className="text-red-500 text-lg leading-none">*</span>
              Sort Name
            </label>
            <Input
              type="text"
              className={`w-full h-8 transition-all duration-200 ${
                errors.lookupName
                  ? "border-red-300 ring-2 ring-red-200 focus:ring-red-300"
                  : "border-gray-300 focus:ring-2 focus:ring-blue-200"
              }`}
              placeholder="Enter sort name..."
              value={formData.lookupName}
              onChange={(e) => {
                setFormData({ ...formData, lookupName: e.target.value });
                setErrors({ ...errors, lookupName: "" });
              }}
              disabled={isParentAll}
            />
            {errors.lookupName && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.lookupName}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 justify-end pt-2">
            <Button
              variant="default"
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4 border-gray-300 hover:bg-gray-50 font-medium transition-all duration-200"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-4 space-y-4">
          {/* View Mode Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <span className="text-red-500 text-lg leading-none">*</span>
              Sort Name
            </label>
            <Input
              type="text"
              className="w-full h-10 bg-gray-50 border-gray-300"
              disabled
              placeholder="ALL"
              value={sortNameValue}
            />
          </div>

          {/* Action Buttons with Better Visual Feedback */}
          <div className="flex flex-row gap-2 justify-end pt-2">
            <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
              <Button
                variant="default"
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                onClick={() => {
                  setFormData(initialPropsDomain);
                  setValueDetail("add");
                }}
                disabled={isParentAll || !!selectedSubChildrenSide}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New</span>
                </div>
              </Button>
            </AccessWrapper>
            <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
              <Button
                variant="outline"
                className="h-9 px-4 border-gray-300 hover:bg-gray-50 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEdit}
                disabled={isParentAll || !selectedSubChildrenSide}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit</span>
                </div>
              </Button>
            </AccessWrapper>
            <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
              <Button
                variant="outline"
                className="h-9 px-4 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                onClick={() => setShowDeleteSidebar(true)}
                disabled={isParentAll || !selectedSubChildrenSide}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete</span>
                </div>
              </Button>
            </AccessWrapper>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdviceTypeDetailSidebar;
