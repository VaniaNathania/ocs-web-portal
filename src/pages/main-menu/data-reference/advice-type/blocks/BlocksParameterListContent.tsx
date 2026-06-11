import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { paramListProps } from "../components/ParameterListContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";

const API_URL_REF = apiConfigRef.ref;

const BlocksParameterListContent = () => {
  const { selectedContent } = useAdviceTypeContext();
  const { GetData, PostData, PutData, DeleteData } = useCallApi();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validateForm = (formData: paramListProps) => {
    const newErrors: Record<string, string> = {};

    if (!formData.adviceParamName || formData.adviceParamName.trim() === "") {
      newErrors.adviceParamName = "Parameter Name is required";
    }

    if (!formData.adviceParamCode || formData.adviceParamCode.trim() === "") {
      newErrors.adviceParamCode = "Parameter Code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (formData: paramListProps, reloadCallback?: () => void) => {
      if (!validateForm(formData)) {
        toast.error("Please fill in all required fields");
        return false;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const response = await PostData(
          `${API_URL_REF}/api/advice-type/add-advice-type-param`,
          {
            adviceType: selectedContent?.adviceType,
            adviceParamName: formData.adviceParamName,
            adviceParamCode: formData.adviceParamCode,
            comments: formData.comments,
            spId: 0,
          },
        );

        if (response?.status) {
          toast.success("Parameter list created successfully!");
          if (reloadCallback) {
            reloadCallback();
          }
          // console.log("ini reload callback:", reloadCallback);
          return true;
        } else {
          const errorMessage =
            response?.message ||
            "Failed to created parameter. Please try again.";
          toast.error(errorMessage);
          return false;
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating category:", error);
        toast.error(errorMessage);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [PostData, selectedContent?.adviceType],
  );

  const handleEdit = useCallback(
    async (formData: paramListProps, reloadCallback?: () => void) => {
      if (!validateForm(formData)) {
        toast.error("Please fill in all required fields");
        return false;
      }

      if (!formData.adviceParamId) {
        toast.error("No parameter selected");
        return false;
      }

      setIsUpdating(true);
      setErrors({});

      try {
        const response = await PutData(
          `${API_URL_REF}/api/advice-type/mod-advice-type-param`,
          {
            adviceParamId: formData?.adviceParamId,
            adviceType: selectedContent?.adviceType,
            adviceParamName: formData.adviceParamName,
            adviceParamCode: formData.adviceParamCode,
            comments: formData.comments,
            spId: 0,
          },
        );

        //  console.log(response);

        if (response?.status) {
          toast.success("Parameter update successfully!");
          if (reloadCallback) {
            reloadCallback();
          }
          return true;
        } else {
          const errorMessage =
            response?.message ||
            "Failed to updated parameter. Please try again.";
          toast.error(errorMessage);
          return false;
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating category:", error);
        toast.error(errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [PutData, selectedContent?.adviceType],
  );

  const handleDelete = useCallback(
    async (formData: paramListProps, reloadCallback?: () => void) => {
      if (!formData.adviceParamId) {
        toast.error("No parameter selected");
        return false;
      }

      setIsDeleting(true);

      try {
        const response = await DeleteData(
          `${API_URL_REF}/api/advice-type/del-advice-type-param/${formData.adviceParamId}`,
          {},
        );

        if (response?.status) {
          toast.success("Successfully deleted parameter");
          if (reloadCallback) {
            reloadCallback();
          }
          return true;
        } else {
          const errorMessage =
            response?.message || "Failed to delete parameter";
          toast.error(errorMessage);
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Something went wrong. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    },
    [DeleteData],
  );

  return {
    handleSubmit,
    errors,
    setErrors,
    handleEdit,
    isSubmitting,
    setIsSubmitting,
    isUpdating,
    setIsUpdating,
    isDeleting,
    setIsDeleting,
    handleDelete,
  };
};

export default BlocksParameterListContent;
