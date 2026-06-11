import { apiConfig } from "@/config/api.config";
import useAccountFeatureContext from "../hooks/useAccountFeatureContext";
import { useCallApi } from "@/hooks";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import FeatureListPanel from "./FeatureListPanel";
import SelectedFeaturePanel from "./SelectedFeaturePanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import {
  AccountFeatureCreateSchema,
  AccountFeatureCreateSchemaType,
  createAccountFeatureDefaultValue,
} from "../types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDataGrid } from "@/components";
import { endpoints } from "../../api/api.account.config";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const DialogForm = () => {
  const { showDialog, handleShowDialog, accountFeatureList } =
    useAccountFeatureContext();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { PostData, PutData, GetData } = useCallApi();
  const { reload } = useDataGrid();

  const methods = useForm<AccountFeatureCreateSchemaType>({
    resolver: zodResolver(AccountFeatureCreateSchema),
    defaultValues: createAccountFeatureDefaultValue(),
  });

  const {
    control,
    watch,
    setValue,
    setError,
    getValues,
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = methods;

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFeaturesDisplay, setSelectedFeaturesDisplay] = useState<
    ISelectedFeatureDisplay[]
  >([]);

  const handleClose = () => {
    handleShowDialog(false, "create", null);
    handleClearAll();
    reset();
  };

  const handleAddFeature = async (feature: IOptionFeatureList) => {
    const currentFormData = getValues("acctAttrRequestDtos");

    if (currentFormData.some((f) => f.attrId === feature.attrId)) {
      toast.info("Feature already added");
      return;
    }

    const updatedFormData = [
      ...currentFormData,
      { attrId: feature.attrId, attrValue: null },
    ];
    setValue("acctAttrRequestDtos", updatedFormData);

    await getDetailOptions(feature);
  };

  const handleRemoveFeature = (id: number) => {
    const updatedFormData = getValues("acctAttrRequestDtos").filter(
      (f) => f.attrId !== id,
    );
    setValue("acctAttrRequestDtos", updatedFormData);

    setSelectedFeaturesDisplay((prev) => prev.filter((f) => f.attrId !== id));
  };

  const handleClearAll = () => {
    setValue("acctAttrRequestDtos", []);
    setSelectedFeaturesDisplay([]);
  };

  const getDetailOptions = async (feature: IOptionFeatureList) => {
    setIsFetching(true);
    try {
      const response = await GetData(endpoints.accountFeature.detail, {
        baseAttrId: feature.attrId,
        spId: getValues("spId") || 0,
      });

      if (response.status && response.data) {
        const detailData = response.data[0];

        // Create display object dengan semua properti
        const featureDisplay: ISelectedFeatureDisplay = {
          ...feature,
          comments: detailData.comments || "",
          nullable: detailData.nullable || "N",
          inputType: detailData.inputType || "1",
        };

        if (detailData.inputType !== "3" && detailData.inputType !== "4") {
          const attrValueOptions = await getAttrValue(feature.attrId);
          featureDisplay.attrValueOptions = attrValueOptions;
        }

        setSelectedFeaturesDisplay((prev) => [...prev, featureDisplay]);
      } else {
        toast.error(response.message || "Failed to fetch feature details");
        handleRemoveFeature(feature.attrId);
      }
    } catch (error) {
      console.error("Error fetching detail feature:", error);
      toast.error(
        "Error Fetching Detail Feature. Please Check Your Connection!",
      );
      handleRemoveFeature(feature.attrId);
    } finally {
      setIsFetching(false);
    }
  };

  const getAttrValue = async (id: number): Promise<IAttrValueOption[]> => {
    try {
      const response = await GetData(endpoints.accountFeature.attrValue, {
        baseAttrId: id,
      });

      if (response.status && response.data) {
        return response.data;
      } else {
        toast.error(response.message || "Failed to fetch attribute values");
        return [];
      }
    } catch (error) {
      console.error("Error fetching attr value:", error);
      toast.error("Error Fetching Attr Value. Please Check Your Connection!");
      return [];
    }
  };

  // Handler untuk update attrValue di form
  const handleAttrValueChange = (attrId: number, value: string | null) => {
    const currentFormData = getValues("acctAttrRequestDtos");
    const updatedFormData = currentFormData.map((item) =>
      item.attrId === attrId
        ? { ...item, attrValue: value === "null" ? null : value }
        : item,
    );
    setValue("acctAttrRequestDtos", updatedFormData);
  };

  const onSubmit = (data: AccountFeatureCreateSchemaType) => {
    //  console.log(
    //   "Form data (only attrId & attrValue):",
    //   data.acctAttrRequestDtos,
    // );
    //  console.log("Display data (full details):", selectedFeaturesDisplay);

    const requiredFields = selectedFeaturesDisplay.filter(
      (display) => display.nullable === "N",
    );

    // const emptyRequiredValues = data.acctAttrRequestDtos.filter((formItem) => {
    //   const displayItem = selectedFeaturesDisplay.find(
    //     (d) => d.attrId === formItem.attrId
    //   );
    //   return (
    //     displayItem?.nullable === "N" &&
    //     (formItem.attrValue === null || formItem.attrValue === "")
    //   );
    // });

    // if (emptyRequiredValues.length > 0) {
    //   toast.error("Please fill all required fields");
    //   return;
    // }

    // data.acctAttrRequestDtos = array of { attrId, attrValue }
    const promise = DoCreateAccountFeature(data);

    toast.promise(promise, {
      loading: "Creating account feature...",
      success: (res) => res?.message || "Success",
      error: (err) =>
        err?.message || "Error creating account feature. Try again.",
    });
  };

  const DoCreateAccountFeature = async (
    data: AccountFeatureCreateSchemaType,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(endpoints.accountFeature.create, data);

      if (!response?.status) {
        throw new Error(
          response?.message || "Failed to create account feature",
        );
      }

      reload();
      handleClose();

      return response;
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showDialog.show) {
      setValue(
        "acctAttrRequestDtos",
        accountFeatureList.map((f) => ({
          attrId: f.attrId,
          attrValue: f.attrValue,
        })),
      );
      setValue(
        "srcAcctAttr",
        accountFeatureList.map((f) => ({
          attrId: f.attrId,
          attrValue: f.attrValue,
        })),
      );
      const featureDisplay = accountFeatureList.map<ISelectedFeatureDisplay>(
        (item) => ({
          ...item,
          attrValueOptions: item.acctValuesListDto || [],
          inputType: item.inputType,
          comments: item.comments,
          nullable: item.nullable,
        }),
      );
      setSelectedFeaturesDisplay((prev) => [...prev, ...featureDisplay]);
    }
  }, [showDialog.show]);
  // console.log(selectedFeaturesDisplay);
  // console.log("forms: ", watch());
  return (
    <Dialog open={showDialog.show} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Select Feature</DialogTitle>
        </DialogHeader>
        <DialogBody className="h-full">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex gap-6 max-h-[500px] overflow-y-auto">
                <FeatureListPanel onSelect={handleAddFeature} />
                <SelectedFeaturePanel
                  selectedDisplay={selectedFeaturesDisplay}
                  onRemove={handleRemoveFeature}
                  onClearAll={handleClearAll}
                  onAttrValueChange={handleAttrValueChange}
                  isFetching={isFetching}
                />
              </div>

              <div className="flex justify-end gap-5 mt-5">
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <AccessWrapper
                  hasAccess={
                    showDialog.mode === "create"
                      ? menuPrivAccess.addStatus
                      : menuPrivAccess.editStatus
                  }
                >
                  <Button
                    type="submit"
                    variant={"outline"}
                    disabled={isFetching || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </AccessWrapper>
              </div>
            </form>
          </FormProvider>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
