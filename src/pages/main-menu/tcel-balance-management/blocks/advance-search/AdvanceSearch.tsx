import UnderConstruction from "@/components/common/UnderConstruction";
import {
  DialogWrapper,
  ParentDialogProps,
} from "../../../role-management/generalUseComp";
import { SearchProvider } from "./hooks/SearchContext";
import Main from "./block/main";
import { Dispatch, SetStateAction } from "react";
import { AcctInfoPayment } from "@/pages/main-menu/payment/interfaces";

interface AdvanceSearchDialogProps extends ParentDialogProps {
  selectedRow?: AcctInfoPayment;
  setSelectedRow: Dispatch<SetStateAction<AcctInfoPayment | undefined>>;
}

const AdvanceSearchDialog = ({
  isOpen,
  handleDialog,
  setSelectedRow,
  selectedRow,
}: AdvanceSearchDialogProps) => {
  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleDialog}
      title="Account Query"
      size={{ width: "2xl" }}
    >
      <SearchProvider
        handleDialog={handleDialog}
        isOpen={isOpen}
        setSelectedRow={setSelectedRow}
        selectedRow={selectedRow}
      >
        <Main isOpen={isOpen} handleDialog={handleDialog} />
      </SearchProvider>
    </DialogWrapper>
  );
};

export default AdvanceSearchDialog;
