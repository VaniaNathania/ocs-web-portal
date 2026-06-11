import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppList } from "../hook/useAppsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Loading } from "../block/loadingBlock";
import { usePortalList } from "../hook/usePortalList";
import {
  PortalMgrCompData,
  usePortalLayout,
} from "@/layouts/main-menu/portal-management";
import { apiConfigRole } from "@/config/api.config";

interface SideBarDialogProps {
  styleDiv: string;
}

const API_URL = apiConfigRole.role;

export const SideBarDialog = ({ styleDiv }: SideBarDialogProps) => {
  const { selectedRow } = usePortalLayout();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortalMgrCompData>({
    defaultValues: {
      portalId: selectedRow?.portalId ?? 0,
      portalName: selectedRow?.portalName ?? "",
      state: selectedRow?.state ?? "",
      stateDate: selectedRow?.stateDate ?? "",
      url: selectedRow?.url ?? "",
    },
  });

  const { apps, loading } = useAppList();
  const [isDisable, setIsDisable] = useState(true);
  const { fetchRows } = usePortalList();
  const [isCreate, setIsCreate] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const { PostData, PutData } = useCallApi();

  useEffect(() => {
    if (selectedRow) {
      setIsFirstClick(true);
      setIsDisable(true);
      reset({
        portalId: selectedRow?.portalId ?? 0,
        portalName: selectedRow?.portalName ?? "",
        state: selectedRow?.state ?? "",
        stateDate: selectedRow?.stateDate ?? "",
        url: selectedRow?.url ?? "",
        extraUrl: selectedRow?.extraUrl ?? "",
      });
    }
  }, [selectedRow, reset]);

  const onSubmit = async (data: PortalMgrCompData) => {
    try {
      if (isCreate) {
        //  console.log("Creating with:", data);
        handleCreate(data);
      } else {
        //  console.log("Updating with:", data);
        handleUpdate(data);
      }

      setIsDisable(true);
      setIsFirstClick(true);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleCreate = async (data: PortalMgrCompData) => {
    try {
      // console.log("🚀 Creating Portal with data:", data);

      const response = await PostData(
        `${API_URL}/api/portals/add-portal`,
        data,
      );

      //  console.log("📦 API Response:", response);

      if (response?.status) {
        resetForm();
        toast.success("Portal created successfully!");

        // console.log("✅ Portal created successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to create Portal. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error creating Portal:", error);
    } finally {
      fetchRows();
    }
  };

  const handleUpdate = async (data: PortalMgrCompData) => {
    try {
      // console.log("🚀 Editing Portal with data:", data);

      const response = await PutData(`${API_URL}/api/portals/mod-portal`, {
        ...data,
        stateDate: undefined,
      });

      //  console.log("📦 API Response:", response);

      if (response?.status) {
        resetForm();
        toast.success("Portal edited successfully!");
      } else {
        const errorMessage =
          response?.message || "Failed to create Portal. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error creating Portal:", error);
    } finally {
      fetchRows();
    }
  };

  const resetForm = () => {
    reset({
      portalId: 0,
      portalName: "",
      state: "",
      stateDate: "",
      url: "",
      extraUrl: "",
    });
  };

  const onButtonLeft = () => {
    if (isFirstClick) {
      setIsCreate(true);
      setIsDisable(false);
      setIsFirstClick(false);
      if (selectedRow?.portalId != null) resetForm();
    } else {
      handleSubmit(onSubmit)(); // invoke form submit
    }
  };

  const onButtonRight = () => {
    if (isFirstClick) {
      setIsCreate(false);
      setIsDisable(false);
      setIsFirstClick(false);
    } else {
      reset(); // reset back to default (selectedRow)
      setIsFirstClick(true);
      setIsDisable(true);
    }
  };

  return (
    <div className={styleDiv}>
      <div className="relative">
        {loading && <Loading />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-rows-1 md:grid-rows-2 gap-2">
            {/* Portal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portal Name<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("portalName", {
                  required: "Portal name is required",
                })}
                type="text"
                placeholder="Enter Portal name"
                autoComplete="off"
                disabled={isDisable}
              />
              {errors.portalName && (
                <p className="text-red-500 text-sm">
                  {errors.portalName.message}
                </p>
              )}
            </div>

            {/* Portal Url */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portal Url<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("url", { required: "Portal Url is required" })}
                type="text"
                placeholder="Enter Portal Url"
                autoComplete="off"
                disabled={isDisable}
              />
              {errors.url && (
                <p className="text-red-500 text-sm">{errors.url.message}</p>
              )}
            </div>

            {/* Extra Url */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Extra Url
              </label>
              <Input
                {...register("extraUrl")}
                type="text"
                placeholder="Enter Extra Url"
                autoComplete="off"
                disabled={isDisable}
              />
              {errors.url && (
                <p className="text-red-500 text-sm">{errors.url.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onButtonLeft}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isFirstClick ? "New" : "Submit"}
            </Button>
            <Button type="button" variant="outline" onClick={onButtonRight}>
              {isFirstClick ? "Edit" : "Cancel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
