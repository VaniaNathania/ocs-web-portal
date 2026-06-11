import { useWholesaleMonitor } from "../../hooks/context";
import { DialogWrapper } from "../../../role-management/generalUseComp";
import OrgTable from "./components/orgTable";
import StaffTable from "./components/orgStaff";
import { OperatorProvider } from "./hooks/context";
import Main from "./block/main";

const OperatorDialog = () => {
  const { showOperator, setShowOperator } = useWholesaleMonitor();

  return (
    <DialogWrapper
      isOpen={showOperator}
      handleDialog={setShowOperator}
      title="Organization & Staff Selector"
      size={{ width: "4xl" }}
    >
      <OperatorProvider>
        <Main />
      </OperatorProvider>
    </DialogWrapper>
  );
};

export default OperatorDialog;
