import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Key, Lock, Pencil, Trash, Unlock } from "lucide-react";
import { UserMData } from "../hook/UserManagementProvider";
import { useUserMTableOps } from "../hook/useUserMTableOps";
import { useUserLayout } from "@/layouts/main-menu/user-management";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";
import { useUserManagement } from "../hook/useUserManagemet";

interface MTOps {
  row: UserMData;
  handleConfirm: any;
  handleDialog: (bool: boolean) => void;
  handleDesc: (desc: string) => void;
}

export const UserMTableOps = ({
  row,
  handleConfirm,
  handleDialog,
  handleDesc,
}: MTOps) => {
  const {
    handleButton,
    handleResetPassword,
    handleEditPass,
    handleLockAccount,
    handleUnlockAccount,
    handleDisableAccount,
    handleRemoveAccount,
  } = useUserMTableOps({ row, handleConfirm, handleDialog, handleDesc });
  const { menuPrivAccess } = useUserLayout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-[28px] h-[28px] flex items-center justify-center hover:bg-gray-300 transition rounded-md"
          title="Other actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
          <DropdownMenuItem
            onClick={() =>
              handleButton(
                handleResetPassword,
                `Are you sure to reset password of user with the name of ${row.userName}?`
              )
            }
          >
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </DropdownMenuItem>
        </AccessWrapper>

        <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
          <DropdownMenuItem onClick={handleEditPass}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Password
          </DropdownMenuItem>
        </AccessWrapper>

        <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
          <DropdownMenuItem
            onClick={() =>
              row.isLocked === "Y"
                ? handleUnlockAccount()
                : handleButton(
                    handleLockAccount,
                    `Are you sure to lock account with Name of ${row.userName}?`
                  )
            }
          >
            {row.isLocked === "Y" ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock Account
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Lock Account
              </>
            )}
          </DropdownMenuItem>
        </AccessWrapper>

        <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
          <DropdownMenuItem onClick={handleDisableAccount}>
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <div
                className={`w-[16px] h-[16px] rounded-full border-2 border-gray-600 flex items-center justify-center ${
                  row.state === "A" ? "relative bg-gray-100" : ""
                }`}
              >
                {row.state !== "A" && (
                  <div className="border-2 w-[10px] h-[10px] rounded-full border-gray-600" />
                )}
                {row.state === "A" && (
                  <span className="absolute w-[14px] h-[2px] bg-gray-600 rotate-45"></span>
                )}
              </div>
            </div>

            {row.state === "A" ? "Disable Account" : "Enable Account"}
          </DropdownMenuItem>
        </AccessWrapper>

        <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus ?? false}>
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={() =>
              handleButton(
                handleRemoveAccount,
                `Are you sure to remove account with Name of ${row.userName}?`
              )
            }
            disabled={row.userId === 1}
          >
            <Trash className="w-4 h-4 mr-2" />
            Remove Account
          </DropdownMenuItem>
        </AccessWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
