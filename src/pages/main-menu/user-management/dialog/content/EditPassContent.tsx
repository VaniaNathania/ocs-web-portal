import { useForm } from "react-hook-form";
import { useUserManagement } from "../../hook/useUserManagemet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { EditPassForm } from "../../models/interfaces";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const EditPassContent = () => {
  const {
    selectedRow,
    setOnConfirm,
    setShowConfirm,
    setDesc,
    setShowEditPass,
  } = useUserManagement();
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);
  const { PutData } = useCallApi();

  const baseData: EditPassForm = {
    userName: selectedRow?.userName ?? "",
    userCode: selectedRow?.userCode ?? "",
    newPwd: "",
    confPwd: "",
    oldPwd: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditPassForm>({
    defaultValues: baseData,
  });

  const newPwdValue = watch("newPwd");

  const handleConfirmation = (data: EditPassForm) => {
    setOnConfirm(() => () => onSubmit(data)); // store submit action
    setDesc(
      `Are you sure to change password of user ${selectedRow?.userName}?`,
    );
    setShowConfirm(true);
  };

  const onSubmit = async (data: EditPassForm) => {
    try {
      const payload = {
        userName: data.userName,
        userCode: data.userCode,
        newPwd: data.newPwd,
        oldPwd: data.oldPwd,
      };

      //  console.log("Form submitted:", payload);

      const response = await PutData(
        `${API_ROLE}/api/prod/users/${selectedRow?.userId}/pwd`,
        payload,
      );

      //  console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Password updated successfully!");
        setShowEditPass(false);
        //  console.log("✅ Password updated successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to update password. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error updating password:", error);
      throw error; // optional
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleConfirmation)}
      className="space-y-4 mt-5"
    >
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          Current Password<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <Input
            {...register("oldPwd", {
              required: "Curr Password is required",
            })}
            type={showOldPwd ? "text" : "password"}
            placeholder="Enter Current Password"
            autoComplete="off"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowOldPwd((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.newPwd && (
          <p className="text-sm text-red-500">{errors.newPwd.message}</p>
        )}
      </div>
      {/* New Password */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          New Password<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <Input
            {...register("newPwd", {
              required: "New Password is required",
              minLength: {
                value: 10,
                message: "Password must be at least 10 characters",
              },
              pattern: {
                value:
                  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
                message:
                  "Password must contain at least 1 uppercase, 1 number, and 1 special character",
              },
            })}
            type={showNewPwd ? "text" : "password"}
            placeholder="Enter New Password"
            autoComplete="off"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNewPwd((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.newPwd && (
          <p className="text-sm text-red-500">{errors.newPwd.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <Input
            {...register("confPwd", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === newPwdValue || "Passwords do not match",
            })}
            type={showConfPwd ? "text" : "password"}
            placeholder="Enter Confirm Password"
            autoComplete="off"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfPwd((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confPwd && (
          <p className="text-sm text-red-500">{errors.confPwd.message}</p>
        )}
      </div>

      <div className="w-full flex justify-end">
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save
        </Button>
      </div>
    </form>
  );
};
