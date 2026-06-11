import { Button } from "@/components/ui/button";
import { useWorkRuleModuleContext } from "../hook/useWorkFlowRuleModuleContext";
import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ToolBarWorkFlow = () => {
  const { reload } = useDataGrid();

  const {
    openDialog,
    menuPrivAccess
  } = useWorkRuleModuleContext();

  return (
    <div className="flex w-full justify-end px-5 py-2 ">
      <div className="flex gap-2 items-center">
        <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>  
        <Button
          variant="outline"
          size={"sm"}
          className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
          onClick={() => openDialog("create")}
        >
          <KeenIcon icon="plus" className="mr-2" />
          Add Data
        </Button>
        </AccessWrapper>
        <DefaultTooltip title={"Refresh"} placement={"top"}>
          <Button variant="outline" className="h-7.5" onClick={() => reload()}>
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );
};

export default ToolBarWorkFlow;
