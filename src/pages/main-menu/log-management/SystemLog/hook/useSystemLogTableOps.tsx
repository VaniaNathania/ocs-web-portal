import { useSystemLog } from "./useSystemLog";
import { toast } from "sonner";
import axios from "axios";
import { ReasonsForm } from "./SystemLogProvider";
import { useCallApi } from "@/hooks";
import { UserMData } from "../../LoginLog/hook/LogManagementProvider";
import { apiConfigRole } from "@/config/api.config";

interface UseSystemLogMTableOpsProps {
  row: UserMData;
  handleConfirm: any;
  handleDialog: (bool: boolean) => void;
  handleDesc: (desc: string) => void;
}

const API_ROLE = apiConfigRole.role;

const useSystemLogTableOps = ({
  row,
  handleConfirm,
  handleDialog,
  handleDesc,
}: UseSystemLogMTableOpsProps) => {
  const { DeleteData } = useCallApi();
  const {
    fetchUser,
    setShowEditPass,
    setSelectedRow,
    setShowReasonDialog,
    setReDesc,
    setReFunc,
    setShowConfirm,
  } = useSystemLog();

  const handleButton = (process: () => void, description: string) => {
    handleDesc(description);
    handleConfirm(() => process);
    handleDialog(true);
    setSelectedRow(row);
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
        `${API_ROLE}/api/prod/users/${row.logId}/lock?opReason=${payload.opReason}`,
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
      fetchUser();
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
    if (row.eventCode === "A") {
      setReDesc("Disable Account");
      setReFunc(() => onSubmitDisable);
    } else if (row.eventCode === "X") {
      setReDesc("Enable Account");
      setReFunc(() => onSubmitEnable);
    }
  };

  const onSubmitDisable = async (data: ReasonsForm) => {
    //  console.log("Disabling account with reason:", data.opReason);
    try {
      const payload = {
        opReason: "locking",
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row.logId}/disable?opReason=${payload.opReason}`,
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
      fetchUser();
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
        `${API_ROLE}/api/prod/users/${row.logId}/enable?opReason=${payload.opReason}`,
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
      fetchUser();
      setShowConfirm(false);
      setShowReasonDialog(false);
    }
  };

  // const handleRemoveAccount = async () => {
  // //  console.log(`Remove account for ${row.userName}`);
  //   try {
  //     const response = await DeleteData(
  //       `${API_ROLE}/api/prod/users/${row.logId}/remove`,
  //       {}
  //     );

  //     if (response?.status) {
  //       toast.success(`Successfully deleted User: ${row.userName}`);
  //     } else {
  //       const errorMessage =
  //         `Delete error: ${response?.message}` || "Failed to delete user";
  //       toast.error(errorMessage);
  //     }
  //   } catch (error: any) {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "Something went wrong. Please try again."
  //     );
  //   } finally {
  //     handleDialog(false);
  //     fetchUser({ page: 1 });
  //     // setShowConfirm(false);
  //     // setShowReasonDialog(false);
  //   }
  // };

  const onSubmitUnlockAcc = async (data: ReasonsForm) => {
    try {
      const payload = {
        opReason: data.opReason,
      };

      const response = await axios.patch(
        `${API_ROLE}/api/prod/users/${row?.logId}/unLock?opReason=${payload.opReason}`,
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
      fetchUser();
      setShowConfirm(false);
      setShowReasonDialog(false);
    }
  };

  return {
    handleButton,
    // handleResetPassword,
    handleEditPass,
    handleLockAccount,
    handleUnlockAccount,
    handleDisableAccount,
    // handleRemoveAccount,
  };
};

export { useSystemLogTableOps };
