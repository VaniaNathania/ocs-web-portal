import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useShareToOther } from "../../../hooks/context";
import Main from "./blocks/main";
import { BalShareRuleProvider } from "./hooks/context";

const BalanceShareRule = () => {
  const { balShare, setBalShare } = useShareToOther();

  return (
    <DialogWrapper
      isOpen={balShare}
      handleDialog={setBalShare}
      title="Balance Share Rule"
      size={{ width: "6xl" }}
    >
      <BalShareRuleProvider>
        <Main />
      </BalShareRuleProvider>
    </DialogWrapper>
  );
};

export default BalanceShareRule;
