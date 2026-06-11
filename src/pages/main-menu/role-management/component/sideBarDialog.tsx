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
import { useRoleList } from "../hook/useRolesList";
import { Loading } from "../block/loadingBlock";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { AccessWrapper } from "../hook/useRoleCheck";
import { RoleSPID } from "./sideBarListContextTable";
import { apiConfigRole } from "@/config/api.config";

interface FormData {
  roleId: number | null;
  roleName: string;
  roleCode: string;
  comments?: string;
  isLocked: string;
  appId: number;
}

interface SideBarDialogProps {
  styleDiv: string;
  // selectedRow?: Partial<FormData>;
}

const API_ROLE = apiConfigRole.role;

export const SideBarDialog = ({
  styleDiv,
  // selectedRow,
}: SideBarDialogProps) => {
  const { selectedRow } = useRoleLayout();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleSPID>({
    defaultValues: {
      roleId: selectedRow?.roleId ?? null,
      roleName: selectedRow?.roleName ?? "",
      roleCode: selectedRow?.roleCode ?? "",
      comments: selectedRow?.comments ?? "",
      isLocked: selectedRow?.isLocked ?? "false",
      appId: selectedRow?.appId ?? 0,
      isCopy: false,
    },
  });

  const { apps, loading } = useAppList();
  const [isDisable, setIsDisable] = useState(true);
  const { fetchRoles } = useRoleList();
  const [isCreate, setIsCreate] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const { PostData, PutData } = useCallApi();
  const { menuPrivAccess } = useRoleLayout();

  useEffect(() => {
    // console.lo g();

    // console.log(selectedRow, "di dialog");
    if (selectedRow) {
      setIsFirstClick(true);
      setIsDisable(true);
      reset({
        roleId: selectedRow.roleId ?? null,
        roleName: selectedRow.roleName ?? "",
        roleCode: selectedRow.roleCode ?? "",
        comments: selectedRow.comments ?? "",
        isLocked: selectedRow.isLocked ?? "N",
        appId: selectedRow.appId ?? 0,
        isCopy: selectedRow.isCopy ?? false,
      });
    }
  }, [selectedRow, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isCreate) {
        //  console.log("Creating with:", data);
        const newData: FormData = {
          ...data,
          roleId: null,
        };
        handleCreate(newData);
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

  const handleCreate = async (data: FormData) => {
    try {
      // console.log("🚀 Creating role with data:", data);

      const response = await PostData(`${API_ROLE}/api/roles/prod/roles`, data);

      // console.log("📦 API Response:", response);

      if (response?.status) {
        resetForm();
        toast.success("Role created successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Create Role => ${data.roleName}`,
          action: "C",
        };
        doSaveLogActivity(createActivity);

        // console.log("✅ Role created successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to create role. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error creating role:", error);
    } finally {
      fetchRoles();
    }
  };

  const handleUpdate = async (data: FormData) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const response = await PutData(`${API_ROLE}/api/roles/prod/roles`, data);

      // console.log("📦 API Response:", response);

      if (response?.status) {
        resetForm();
        toast.success("Role edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role => ${data.roleName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        // console.log("✅ Role created successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to create role. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error creating role:", error);
    } finally {
      fetchRoles();
    }
  };

  const resetForm = () => {
    reset({
      roleId: null,
      roleName: "",
      roleCode: "",
      comments: "",
      isLocked: "N",
      appId: 0,
    });
  };

  const onButtonLeft = () => {
    if (isFirstClick) {
      setIsCreate(true);
      setIsDisable(false);
      setIsFirstClick(false);
      if (!selectedRow?.isCopy) resetForm();
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
      <div className="relative h-full">
        {loading && <Loading />}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between h-full"
        >
          <div className="grid grid-rows-1 md:grid-rows-2 gap-2">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role Name<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("roleName", { required: "Role name is required" })}
                type="text"
                placeholder="Enter Role name"
                autoComplete="off"
                disabled={isDisable}
              />
              {errors.roleName && (
                <p className="text-red-500 text-sm">
                  {errors.roleName.message}
                </p>
              )}
            </div>

            {/* Role Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role Code<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                {...register("roleCode", { required: "Role code is required" })}
                type="text"
                placeholder="Enter Role code"
                autoComplete="off"
                disabled={isDisable}
              />
              {errors.roleCode && (
                <p className="text-red-500 text-sm">
                  {errors.roleCode.message}
                </p>
              )}
            </div>

            {/* App ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                App Name<span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                value={String(watch("appId"))}
                onValueChange={(value) => setValue("appId", parseInt(value))}
                disabled={isDisable}
              >
                <SelectTrigger className="w-full px-2 py-1 text-sm h-10">
                  <SelectValue placeholder="Select App" />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app) => (
                    <SelectItem key={app.appId} value={String(app.appId)}>
                      {app.appName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.appId && (
                <p className="text-red-500 text-sm">{errors.appId.message}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <Input
                {...register("comments")}
                type="text"
                placeholder="Optional remarks"
                autoComplete="off"
                disabled={isDisable}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-gray-200">
            <AccessWrapper
              hasAccess={!(isFirstClick && !menuPrivAccess?.addStatus)}
            >
              <Button
                type="button"
                onClick={onButtonLeft}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                // disabled={isFirstClick && !menuPrivAccess?.addStatus}
              >
                {isFirstClick
                  ? selectedRow?.isCopy
                    ? "Copy"
                    : "New"
                  : "Submit"}
              </Button>
            </AccessWrapper>
            <AccessWrapper
              hasAccess={!(isFirstClick && !menuPrivAccess?.editStatus)}
            >
              <Button type="button" onClick={onButtonRight} variant="outline">
                {isFirstClick ? "Edit" : "Cancel"}
              </Button>
            </AccessWrapper>
          </div>
        </form>
      </div>
    </div>
  );
};
