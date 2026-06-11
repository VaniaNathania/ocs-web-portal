import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
import { Textarea } from "@/components/ui/textarea";

// Updated initial state to match API structure
const initialStateSideBar = {
  offerCatg: {
    offerCatgType: "3",
    offerCatgClass: "A",
    offerCatgName: "",
    comments: "",
    offerCatgCode: "",
    // offerCatgId: 0,
    effDate: "",
    spId: 0,
  },
};

const API_URL_OFFER = apiConfigOffer.offer;

const AddSideBar = () => {
  const parentRef = useRef<any | null>(null);
  const { showAddSideBar, handleAddSideBar, refreshCategorySideBar, categorySideBar } =
    useRelatedProductOfferListContext();
  const { reload } = useDataGrid();
  const { PostData } = useCallApi();
  const parsedUser = getAuth()?.user;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formField, setFormField] = useState(initialStateSideBar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const resetForm = () => {
    setFormField(initialStateSideBar);
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    if (showAddSideBar === false) {
      resetForm();
    }
  }, [showAddSideBar]);

  // Validation function
  const validateForm = () => {
    const requiredFields = [
      { key: "offerCatg.offerCatgName", label: "Category Name" },
      { key: "offerCatg.offerCatgType", label: "Category Type" },
      { key: "offerCatg.offerCatgCode", label: "Category Code" },
      { key: "offerCatg.effDate", label: "Effective Date" },
    ];
    const newErrors: Record<string, string> = {};
    let isValid = true;

    function getNestedValue(obj: any, path: string) {
      return path.split(".").reduce((acc, key) => acc?.[key], obj);
    }

    // Clear previous alert
    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      const value = getNestedValue(formField, key);
      const isEmpty =
        typeof value !== "object" &&
        (value === "" ||
          value === null ||
          value === undefined ||
          (typeof value === "number" && value === 0 && key !== "spId"));

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    // Validate date format (YYYY-MM-DD)
    if (formField.offerCatg.effDate && !/^\d{4}-\d{2}-\d{2}$/.test(formField.offerCatg.effDate)) {
      newErrors.effDate = "Effective Date must be in format YYYY-MM-DD";
      isValid = false;
    }

    // Validate offer category code format (no spaces, special characters)
    // if (
    //   formField.offerCatgCode &&
    //   !/^[a-zA-Z0-9_-]+$/.test(formField.offerCatgCode)
    // ) {
    //   newErrors.offerCatgCode =
    //     "Category Code can only contain letters, numbers, hyphens, and underscores";
    //   isValid = false;
    // }

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

        const response = await PostData(`${API_URL_OFFER}/offer/category/add-offer-catg`, formField);

        // console.log("📦 API Response:", response);

        if (response?.status) {
          // Reset form and close modal
          resetForm();

          // Show success message
          toast.success("Category created successfully!");
          await refreshCategorySideBar();

          // Refresh data grid
          if (reload) {
            reload();
          }

          // Log activity
          // const createActivity = {
          //   module: "Manage Related Product",
          //   description: `Create Category => ${formField.offerCatg.offerCatgName}`,
          //   action: "C",
          // };
          // doSaveLogActivity(createActivity);

          // Close the sidebar add dialog
          handleAddSideBar(false);

          // console.log("✅ Category created successfully");
        } else {
          const errorMessage = response?.message || "Failed to create Category. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned error");
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
    [formField, handleAddSideBar, PostData, reload]
  );

  return (
    <Dialog open={showAddSideBar} onOpenChange={handleAddSideBar}>
      <DialogContent className="container-fixed max-w-[768px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
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
                    className={`input col-span-6 ${errors["offerCatg.offerCatgName"] ? "border-red-500" : ""}`}
                    type="text"
                    autoComplete="off"
                    maxLength={60}
                    value={formField.offerCatg.offerCatgName}
                    onChange={({ target }) => {
                      const value = target.value;
                      if (value.length <= 60) {
                        setFormField((prev) => ({
                          ...prev,
                          offerCatg: { ...prev.offerCatg, offerCatgName: target.value },
                        }));
                      }
                      setErrors((prev) => ({ ...prev, offerCatg: "" }));
                    }}
                    placeholder="Category Name (Max 60 chars)"
                  />
                  <p className="text-xs text-gray-500 col-span-8 ml-[calc(25%+0.5rem)]">
                    {formField.offerCatg.offerCatgName.length}/60 characters
                  </p>
                  {errors["offerCatg.offerCatgName"] && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errors["offerCatg.offerCatgName"]}
                    </span>
                  )}
                </div>

                {/* Category Code */}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Category Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errors["offerCatg.offerCatgCode"] ? "border-red-500" : ""}`}
                    type="text"
                    autoComplete="off"
                    value={formField.offerCatg.offerCatgCode}
                    onChange={({ target }) => {
                      setFormField((prev) => ({
                        ...prev,
                        offerCatg: { ...prev.offerCatg, offerCatgCode: target.value },
                      }));
                      setErrors((prev) => ({ ...prev, offerCatgCode: "" }));
                    }}
                    placeholder="Category Code (letters, numbers, hyphens, underscores only)"
                  />
                  {errors["offerCatg.offerCatgCode"] && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errors["offerCatg.offerCatgCode"]}
                    </span>
                  )}
                </div>

                {/* Effective Date */}
                <div className="grid grid-cols-8 gap-2 items-start">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Effective Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formField.offerCatg.effDate}
                    onChange={({ target }) => {
                      setFormField((prev) => ({
                        ...prev,
                        offerCatg: { ...prev.offerCatg, effDate: target.value },
                      }));
                      setErrors((prev) => ({ ...prev, effDate: "" }));
                    }}
                    className={`input col-span-6 ${errors["offerCatg.effDate"] ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors["offerCatg.effDate"] && (
                    <p className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errors["offerCatg.effDate"]}
                    </p>
                  )}
                </div>

                {/* Comments */}
                {/* <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Comments
                  </label>
                  <Textarea
                    className={`input col-span-6 ${errors.comments ? "border-red-500" : ""}`}
                    autoComplete="off"
                    value={formField.offerCatg.comments}
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
                  {errors.comments && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errors.comments}
                    </span>
                  )}
                </div> */}

                {/* Actions */}
                <div className="flex justify-end gap-5">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Button variant="default" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
                    {isSubmitting ? "Creating..." : "Create"}
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

export default AddSideBar;
