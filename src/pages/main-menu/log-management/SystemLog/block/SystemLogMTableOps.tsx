import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useSystemLogTableOps } from "../hook/useSystemLogTableOps";
import { UserMData } from "../../LoginLog/hook/LogManagementProvider";

interface MTOps {
  row: UserMData;
  handleConfirm: any;
  handleDialog: (bool: boolean) => void;
  handleDesc: (desc: string) => void;
}

export const SystemLogMTableOps = ({
  row,
  handleConfirm,
  handleDialog,
  handleDesc,
}: MTOps) => {
  const {} = useSystemLogTableOps({
    row,
    handleConfirm,
    handleDialog,
    handleDesc,
  });

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
