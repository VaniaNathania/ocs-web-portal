import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { UserMData } from "../hook/LogManagementProvider";
import { useLogMTableOps } from "../hook/useLogManagementTableOps";

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
  } = useLogMTableOps({ row, handleConfirm, handleDialog, handleDesc });

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
    </DropdownMenu>
  );
};
