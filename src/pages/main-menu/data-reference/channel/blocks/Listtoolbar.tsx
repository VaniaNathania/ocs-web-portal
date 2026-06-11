import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { useContext } from "react";
import { useChannelContext } from "../hooks/useChannelContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

export const ListToolbar = () => {
  const { handleShowDialog, handleRefresh, menuPrivAccess } =
    useChannelContext();

  return (
    <div className="flex items-center justify-end gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2 "
        >
          <KeenIcon icon="arrows-circle" />
        </Button>
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            size="sm"
            onClick={() => handleShowDialog(true, "create", null)}
            className="gap-2 bg-red-500"
          >
            <KeenIcon icon="plus" />
            Add Contact Channel
          </Button>
        </AccessWrapper>
      </div>
    </div>
  );
};
