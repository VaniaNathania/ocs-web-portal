// import { BankContext } from "../context/BankContext";
import { useContext } from "react";
// import useBankContextContext from "../hooks/useBankContext";
import useBankContext from "../hooks/useBankContext";
import { Button } from "@/components/ui/button";
import { DefaultTooltip, KeenIcon } from "@/components";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ListToolBar = () => {
  const { handleShowDialog, refreshBankList } = useBankContext();
  const { menuPrivAccess } = useAccountConfigLayout();

  return (
    <div className="flex justify-end items-center p-5">
      <div className="flex items-center flex-shrink-0 gap-3">
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => handleShowDialog(true, "create", null)}
            className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
          >
            <KeenIcon icon="plus" className="mr-2" />
            Add Bank
          </Button>
        </AccessWrapper>

        <DefaultTooltip title="Refresh" placement="top">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshBankList()}
            className="p-2"
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );
};

export default ListToolBar;
