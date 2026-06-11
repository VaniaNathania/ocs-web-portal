import { useState } from "react";
import { useUserManagement } from "../hook/useUserManagemet";
import { toast } from "sonner";
import axios from "axios";
import { ReasonsForm, UserMData } from "../hook/UserManagementProvider";
import { useCallApi } from "@/hooks";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

interface UseUserMTableOpsProps {
  row: UserMData;
  handleConfirm: any;
  handleDialog: (bool: boolean) => void;
  handleDesc: (desc: string) => void;
}

const useUserMTableOps = ({
  row,
  handleConfirm,
  handleDialog,
  handleDesc,
}: UseUserMTableOpsProps) => {
  const { DeleteData } = useCallApi();
  const {
    fetchUser,
    setShowEditPass,
    setSelectedRow,
    setShowReasonDialog,
    setReDesc,
    setReFunc,
    setShowConfirm,
    query,
  } = useUserManagement();

  const handleButton = (process: () => void, description: string) => {
    handleDesc(description);
    handleConfirm(() => process);
    handleDialog(true);
    setSelectedRow(row);
  };

  const handleResetPassword = async () => {
    try {
      const payload = {
        userName: row.userName,
        userCode: row.userCode,
        newPwd: "", // default password if any
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row.userId}/pwd`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data?.status) {
        toast.success("Password reset successfully!");
      } else {
        toast.error(
          response.data?.message ||
            "Failed to reset password. Please try again.",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      handleDialog(false);
    }
  };

  const handleEditPass = () => {
    setShowEditPass(true);
    setSelectedRow(row);
  };

  const handleLockAccount = async () => {
    try {
      const payload = {
        opReason: "locking",
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row.userId}/lock?opReason=${payload.opReason}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data?.status) {
        toast.success("Locking Account successfully!");
      } else {
        toast.error(
          response.data?.message || "Failed to Lock Account. Please try again.",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      handleDialog(false);
      fetchUser(query);
    }
  };

  const handleUnlockAccount = () => {
    setShowReasonDialog(true);
    setSelectedRow(row);
    setReDesc("Unlock Account");
    setReFunc(() => onSubmitUnlockAcc);
  };

  const handleDisableAccount = () => {
    setShowReasonDialog(true);
    setSelectedRow(row);
    //disabling
    if (row.state === "A") {
      setReDesc("Disable Account");
      setReFunc(() => onSubmitDisable);
    } else if (row.state === "X") {
      setReDesc("Enable Account");
      setReFunc(() => onSubmitEnable);
    }
  };

  const onSubmitDisable = async (data: ReasonsForm) => {
    //  console.log("Disabling account with reason:", data.opReason);
    try {
      const payload = {
        opReason: data.opReason,
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row.userId}/disable?opReason=${payload.opReason}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data?.status) {
        toast.success("Enabling Account successfully!");
      } else {
        toast.error(
          response.data?.message ||
            "Failed to enable Account. Please try again.",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      handleDialog(false);
      fetchUser(query);
      setShowConfirm(false);
      setShowReasonDialog(false);
    }
  };

  const onSubmitEnable = async (data: ReasonsForm) => {
    //  console.log("Enabling account with reason:", data.opReason);
    try {
      const payload = {
        opReason: "locking",
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row.userId}/enable?opReason=${payload.opReason}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data?.status) {
        toast.success("Enabling Account successfully!");
      } else {
        toast.error(
          response.data?.message ||
            "Failed to enable Account. Please try again.",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      handleDialog(false);
      fetchUser(query);
      setShowConfirm(false);
      setShowReasonDialog(false);
    }
  };

  const handleRemoveAccount = async () => {
    //  console.log(`Remove account for ${row.userName}`);
    try {
      if (row.userId === 1)
        return toast.error("You Can't Delete Admin account");
      const response = await DeleteData(
        `${API_ROLE}/api/prod/users/${row.userId}/remove`,
        {},
      );

      if (response?.status) {
        toast.success(`Successfully deleted User: ${row.userName}`);
      } else {
        const errorMessage =
          `Delete error: ${response?.message}` || "Failed to delete user";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      handleDialog(false);
      // console.log(query);

      fetchUser(query);
      // setShowConfirm(false);
      // setShowReasonDialog(false);
    }
  };

  const onSubmitUnlockAcc = async (data: ReasonsForm) => {
    try {
      const payload = {
        opReason: data.opReason,
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row?.userId}/unLock?opReason=${payload.opReason}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data?.status) {
        toast.success("Unlocking Account successfully!");
      } else {
        toast.error(
          response.data?.message ||
            "Failed to Unlock Account. Please try again.",
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      handleDialog(false);
      fetchUser(query);
      setShowConfirm(false);
      setShowReasonDialog(false);
    }
  };

  return {
    handleButton,
    handleResetPassword,
    handleEditPass,
    handleLockAccount,
    handleUnlockAccount,
    handleDisableAccount,
    handleRemoveAccount,
  };
};

export { useUserMTableOps };
