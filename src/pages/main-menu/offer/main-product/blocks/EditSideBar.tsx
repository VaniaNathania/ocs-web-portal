import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { getAuth } from "@/auth";
import { useCallApi } from "@/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { RefreshCw } from "lucide-react";
import { useMainProductOfferListContext } from "../hooks";
import { Textarea } from "@/components/ui/textarea";

// Updated initial state to match API structure
const initialStateSideBar = (categoryId: string = "") => ({
  offerCatgType: "2",
  offerCatgClass: "A", // Default to "A" as shown in API
  offerCatgName: "",
  offerCatgId: categoryId,
  comments: "",
  offerCatgCode: "",
  effDate: "", // Date format YYYY-MM-DD
  spId: 0,
});

const API_URL_OFFER = apiConfigOffer.offer;

const EditSideBar = () => {
  const parentRef = useRef<any | null>(null);
  const { showEditSideBar, handleEditSideBar, selectedCategoryId, refreshCategorySidebar, categorySide, loading } = useMainProductOfferListContext();
  const { reload } = useDataGrid();
  const { PutData } = useCallApi();
  const parsedUser = getAuth()?.user;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formField, setFormField] = useState(initialStateSideBar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const resetForm = () => {
    setFormField(initialStateSideBar(selectedCategoryId || ""));
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    if (showEditSideBar && selectedCategoryId) {
      setFormField(initialStateSideBar(selectedCategoryId));
    }
    if (!showEditSideBar) {
      resetForm();
    }
  }, [showEditSideBar, selectedCategoryId]);

  // Validation function
  const validateForm = () => {
    const requiredFields = [
      { key: "offerCatgName", label: "Category Name" },
      { key: "offerCatgCode", label: "Category Code" },
      { key: "effDate", label: "Effective Date" },
    ];
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Clear previous alert
    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      const value = formField[key as keyof typeof formField];
      const isEmpty = value === "" || value === null || value === undefined || (typeof value === "number" && value === 0 && key !== "spId");

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    // Validate date format (YYYY-MM-DD)
    if (formField.effDate && !/^\d{4}-\d{2}-\d{2}$/.test(formField.effDate)) {
      newErrors.effDate = "Effective Date must be in format YYYY-MM-DD";
      isValid = false;
    }

    setErrors(newErrors);

    // Show validation errors
    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      });
    }

    return isValid;
  };

  // Submit function
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setAlert({ show: false, message: "" });

      try {
        // console.log("🚀 Creating category with data:", formField);

        const response = await PutData(`${API_URL_OFFER}/offer/category/mod-offer-catg`, {
          offerCatg: formField,
          offerCatgApplyChannelList: [],
        });

        // console.log("📦 API Response:", response);

        if (response?.status) {
          // Reset form and close modal
          resetForm();

          // Show success message
          toast.success("Category edit successfully!");

          // Refresh category sidebar data
          // console.log("🔄 Refreshing category sidebar after edit...");
          await refreshCategorySidebar();

          // Refresh data grid
          if (reload) {
            reload();
          }

          // Log activity
          const createActivity = {
            module: "Manage Main Product",
            description: `Edit Category => ${formField.offerCatgName}`,
            action: "E",
          };
          doSaveLogActivity(createActivity);

          // Close the sidebar add dialog
          handleEditSideBar(false);

          // console.log("✅ Category created successfully");
        } else {
          const errorMessage = response?.message || "Failed to edit Category. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned error:", response);
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating category:", error);
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formField, handleEditSideBar, PutData, reload]
  );

  useEffect(() => {
    const categoryData = categorySide.find((cat) => String(cat.offerCatgId) == String(selectedCategoryId));

    if (showEditSideBar && categoryData) {
      setFormField({
        offerCatgName: categoryData.offerCatgName || "",
        offerCatgCode: categoryData.offerCatgCode || "",
        effDate: categoryData.effDate || "",
        offerCatgId: categoryData.offerCatgId,
        offerCatgType: categoryData.offerCatgType || "2",
        offerCatgClass: categoryData.offerCatgClass || "A",
        comments: categoryData.comments || "",
        spId: categoryData.spId || 0,
      });
    }
  }, [showEditSideBar, selectedCategoryId, categorySide]);

  return (
    <Dialog open={showEditSideBar} onOpenChange={handleEditSideBar}>
      <DialogContent className="container-fixed max-w-[768px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <DialogBody ref={parentRef}>
          <div className="flex flex-col">
            {/* Show alert if there's an error */}
            {/* {alert.show && (
              <Alert variant="destructive" className="mb-4">
                {alert.message}
              </Alert>
            )} */}

            <form onSubmit={handleSubmit}>
              <div className="card-body grid gap-5">
                {/* Category Name */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Category Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errors.offerCatgName ? "border-red-500" : ""}`}
                    type="text"
                    autoComplete="off"
                    value={formField.offerCatgName}
                    maxLength={60}
                    onChange={({ target }) => {
                      const value = target.value;
                      if (value.length <= 60) {
                        setFormField((prev) => ({
                          ...prev,
                          offerCatgName: target.value,
                        }));
                      }
                      setErrors((prev) => ({ ...prev, offerCatgName: "" }));
                    }}
                    placeholder="Category Name"
                  />
                  <p className="text-xs text-gray-500 col-span-8 ml-[calc(25%+0.5rem)]">{formField.offerCatgName.length}/60 characters</p>
                  {errors.offerCatgName && <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">{errors.offerCatgName}</span>}
                </div>

                {/* Category Code */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Category Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errors.offerCatgCode ? "border-red-500" : ""}`}
                    type="text"
                    autoComplete="off"
                    value={formField.offerCatgCode}
                    onChange={({ target }) => {
                      setFormField((prev) => ({
                        ...prev,
                        offerCatgCode: target.value,
                      }));
                      setErrors((prev) => ({ ...prev, offerCatgCode: "" }));
                    }}
                    placeholder="Category Code (letters, numbers, hyphens, underscores only)"
                  />
                  {errors.offerCatgCode && <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">{errors.offerCatgCode}</span>}
                </div>

                {/* Effective Date */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Effective Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errors.effDate ? "border-red-500" : ""}`}
                    type="date"
                    autoComplete="off"
                    value={formField.effDate}
                    onChange={({ target }) => {
                      setFormField((prev) => ({
                        ...prev,
                        effDate: target.value,
                      }));
                      setErrors((prev) => ({ ...prev, effDate: "" }));
                    }}
                  />
                  {errors.effDate && <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">{errors.effDate}</span>}
                </div>

                {/* Comments */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">Comments</label>
                  <Textarea
                    className={`input col-span-6 ${errors.comments ? "border-red-500" : ""}`}
                    autoComplete="off"
                    value={formField.comments}
                    onChange={({ target }) => {
                      setFormField((prev) => ({
                        ...prev,
                        comments: target.value,
                      }));
                      setErrors((prev) => ({ ...prev, comments: "" }));
                    }}
                    placeholder="Comments"
                    rows={3}
                  />
                  {errors.comments && <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">{errors.comments}</span>}
                </div>
                {/* Actions */}
                <div className="flex justify-end gap-5">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Button variant="default" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
                    {isSubmitting ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditSideBar;
