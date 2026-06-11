import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useBundleOfferContext } from "../hooks/useBundleOfferContext";

const ToolBar = () => {
  const { handleAddDialogBundDetail, handleDialogSideBar } =
    useBundleOfferContext();
  const { table, reload } = useDataGrid();

  return (
    <>
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
          <div className="flex gap-3">
            <DefaultTooltip title="New Data" placement="top">
              <Button
                variant="outline"
                className="h-7.5"
                onClick={() => handleAddDialogBundDetail(true)}
              >
                <KeenIcon icon="plus" />
                New
              </Button>
            </DefaultTooltip>
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

export { ToolBar };
