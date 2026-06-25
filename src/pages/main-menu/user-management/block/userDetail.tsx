import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialogUser } from "./confirmationDialog";
import { useUserDetail } from "../hook/useUserDetail";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";
import { useUserLayout } from "@/layouts/main-menu/user-management";
import { useState, MouseEvent } from "react";
import clsx from "clsx";
import { KeenIcon } from "@/components";

export const UserDetail = () => {
  const [showNewMode, setShowNewMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  setShowPassword((prev) => !prev);
};

  const {
  register,
  handleSubmit,
  errors,
  onSubmit,
  onButtonLeft,
  onButtonRight,
  isDisable, 
  showDialog,
  setShowDialog,
  onConfirm,
  desc,
} = useUserDetail();

  const { menuPrivAccess } = useUserLayout();

  const handleConfirm = async () => {
  if (onConfirm) {
    await onConfirm();
  }

  setShowNewMode(true);
};

  return (
    <div className="flex flex-col bg-white m-5 rounded-md shadow-md p-5 space-y-5 border-2">
      <div className="text-lg font-semibold">Add New User</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Row 1 */}
        <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5 w-full">
          {/* User Name */}
          <div className="flex flex-col flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700">
              User Name<span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              {...register("userName", { required: "User name is required" })}
              type="text"
              placeholder="Enter User name"
              autoComplete="off"
              disabled={isDisable}
            />
            {errors.userName && (
              <p className="text-red-500 text-sm">{errors.userName.message}</p>
            )}
          </div>

          {/* User Code */}
          <div className="flex flex-col flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700">
              User Code<span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              {...register("userCode", { required: "User Code is required" })}
              type="text"
              placeholder="Enter User Code"
              autoComplete="off"
              disabled={isDisable}
            />
            {errors.userCode && (
              <p className="text-red-500 text-sm">{errors.userCode.message}</p>
            )}
          </div>

          {/* Effective Date */}
          <div className="flex flex-col flex-1 min-w-[250px] text-sm font-medium text-gray-700">
            <label className="block ">
              Effective Date<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex flex-row items-center space-x-5">
              <input
                {...register("userEffDate", {
                  required: "Effective Date is required",
                })}
                type="datetime-local"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-blue-500 disabled:opacity-50 disabled:bg-transparent"
                disabled={isDisable}
              />
              
            </div>
            {errors.userEffDate && (
              <p className="text-red-500 text-sm">
                {errors.userEffDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5 w-full">
          {/* Expiry Date */}
          <div className="flex flex-col flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              {...register("userExpDate")}
              type="datetime-local"
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-blue-500 disabled:opacity-50 disabled:bg-transparent"
              disabled={isDisable}
            />
            {errors.userExpDate && (
              <p className="text-red-500 text-sm">
                {errors.userExpDate.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <Input
              {...register("address")}
              type="text"
              placeholder="Enter Address"
              autoComplete="off"
              disabled={isDisable}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <Input
              {...register("phone")}
              type="text"
              placeholder="Enter Phone Number"
              autoComplete="off"
              disabled={isDisable}
            />
          </div>
        </div>

        {/* Row 3 */}
<div className="flex flex-col space-y-5 md:flex-row md:space-y-0 md:space-x-5 w-full">

  {/* Email */}
  <div className="flex flex-col flex-1 min-w-[250px]">
    <label className="block text-sm font-medium text-gray-700">
      Email<span className="text-red-500 ml-1">*</span>
    </label>

    <Input
      {...register("email", { required: "Email is required" })}
      type="text"
      placeholder="Enter Email"
      autoComplete="off"
      disabled={isDisable}
    />
  </div>


  {/* Password */}
  <div className="flex flex-col flex-1 min-w-[250px]">
    <label className="block text-sm font-medium text-gray-700">
      Password<span className="text-red-500 ml-1">*</span>
    </label>

    <div className="relative w-full">
      <Input
        {...register("pwd", {
          required: "Password is required",
        })}
        type={showPassword ? "text" : "password"}
        placeholder="Enter Password"
        autoComplete="off"
        disabled={isDisable}
        className="pr-10"
      />

      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <KeenIcon
          icon={showPassword ? "eye-slash" : "eye"}
          className="text-gray-500"
        />
      </button>
    </div>

    {errors.pwd && (
      <p className="text-red-500 text-sm">
        {errors.pwd.message}
      </p>
    )}
  </div>


  {/* Empty column supaya width sama */}
  <div className="flex flex-col flex-1 min-w-[250px]" />

</div>
      {/* Buttons */}
        <div className="w-full flex justify-end space-x-5 mt-5">
  {showNewMode ? (
    <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
      <Button
        type="button"
        onClick={() => {
          setShowNewMode(false);
          onButtonLeft();
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        New
      </Button>
    </AccessWrapper>
  ) : (
    <>
      <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
        <Button
          type="button"
          onClick={onButtonLeft}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Submit
        </Button>
      </AccessWrapper>

      <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
        <Button
          type="button"
          onClick={() => {
            setShowNewMode(true);
            onButtonRight();
          }}
          variant="outline"
        >
          Cancel
        </Button>
      </AccessWrapper>
    </>
  )}
        </div>
    </form>

      <ConfirmDialogUser
  isOpen={showDialog}
  handleDialog={setShowDialog}
  onConfirm={handleConfirm}
  desc={desc}
/>
    </div>
  );
};
