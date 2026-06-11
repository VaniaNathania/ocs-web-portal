import { useLogManagement } from "./useLogManagement";
import { UserMData } from "./LogManagementProvider";

interface UseLogMTableOpsProps {
  row: UserMData;
  handleConfirm: any;
  handleDialog: (bool: boolean) => void;
  handleDesc: (desc: string) => void;
}

const useLogMTableOps = ({
  row,
  handleConfirm,
  handleDialog,
  handleDesc,
}: UseLogMTableOpsProps) => {
  const { setSelectedRow } = useLogManagement();

  const handleButton = (process: () => void, description: string) => {
    handleDesc(description);
    handleConfirm(() => process);
    handleDialog(true);
    setSelectedRow(row);
  };

  return {
    handleButton,
  };
};

export { useLogMTableOps };
