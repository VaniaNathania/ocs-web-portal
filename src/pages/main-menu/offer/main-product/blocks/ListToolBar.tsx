import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useMainProductOfferListContext } from "../hooks";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ListToolBar = () => {
  const { reload } = useDataGrid();
  const { handleAddDialog } = useMainProductOfferListContext();
  const { menuPrivAccess } = useOfferLayout();

  return (
    <>
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center">
          <div className="flex gap-3">
            <AccessWrapper
              hasAccess={menuPrivAccess?.addStatus}
              enabledText="New Data"
            >
              <Button
                variant="outline"
                className="h-7.5"
                onClick={() => handleAddDialog(true)}
              >
                <KeenIcon icon="plus" />
                New
              </Button>
            </AccessWrapper>

            <DefaultTooltip title="Refresh" placement="top">
              <Button
                variant="outline"
                className="h-7.5"
                onClick={() => reload()}
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </>
  );
};

export { ListToolBar };
