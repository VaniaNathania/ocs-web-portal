import { useForm } from "react-hook-form";
import { useUserManagement } from "../../hook/useUserManagemet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import axios from "axios";
import { ReasonsForm } from "../../hook/UserManagementProvider";

export const ReasonContent = () => {
  const { selectedRow, setOnConfirm, setShowConfirm, setDesc, reDesc, reFunc } =
    useUserManagement();

  const baseData: ReasonsForm = {
    opReason: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReasonsForm>({
    defaultValues: baseData,
  });

  const handleConfirmation = (data: ReasonsForm) => {
    // Correct way: pass a function that will call reFunc with data when executed
    setOnConfirm(() => () => reFunc(data));
    setDesc(
      `Are you sure you want to ${reDesc.toLowerCase()} user ${selectedRow?.userName}?`
    );
    setShowConfirm(true);
  };

  return (
    <form
      onSubmit={handleSubmit(handleConfirmation)}
      className="space-y-4 mt-5"
    >
      {/*  Reasons */}
      <div className="flex flex-col flex-1 min-w-[250px]">
        <label className="block text-sm font-medium text-gray-700">
          {reDesc} Reason
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <Input
            {...register("opReason", {
              required: reDesc.toLowerCase() + " reason is required",
            })}
            type="text"
            placeholder={`Enter ${reDesc.toLowerCase()}`}
            autoComplete="off"
            className="pr-10"
          />
        </div>
        {errors.opReason && (
          <p className="text-red-500 text-sm mt-1">{errors.opReason.message}</p>
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
