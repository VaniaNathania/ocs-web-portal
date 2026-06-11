import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { useTriggerCreateContext } from "../../../hooks";
import { toAbsoluteUrl } from "@/utils";
import { DateRangePicker } from "../../DateRangePicker";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { TriggerNotificationDialog } from "./TriggerNotificationDialog";
import { apiConfig } from "@/config/api.config";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

interface PurchaseReceiptList {
  id: string;
  purchase_code: string;
}

interface CategoryList {
  id: string;
  code: string;
  name: string;
}

const API_URL = apiConfig.service_assets;

const NotificationListToolBar = () => {
  const { table, reload } = useDataGrid();
  const [showTriggerNotificationDialog, setShowTriggerNotificationDialog] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [selectedCode, setSelectedCode] = useState<PurchaseReceiptList | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryList | null>(
    null
  );

  return (
    <>
      <TriggerNotificationDialog
        showDialog={showTriggerNotificationDialog}
        setShowDialog={setShowTriggerNotificationDialog}
      />
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
          <div className="flex justify-between w-full items-center">
            <div className="w-[80%] flex gap-3 items-center">
              <div className="flex gap-x-2 items-center mb-2">
                <h4 className="font-medium">Trigger Notification</h4>
              </div>
            </div>
            <div className="flex gap-3">
              <DefaultTooltip title={"Reset Filter"} placement={"top"}>
                <Button
                  variant="outline"
                  className="h-7.5 disabled:bg-gray-400"
                  onClick={() => setShowTriggerNotificationDialog(true)}
                  disabled={isLoading}
                >
                  <KeenIcon icon="plus" />
                  Add
                </Button>
              </DefaultTooltip>
              <DefaultTooltip title={"Refresh"} placement={"top"}>
                <Button
                  variant={"outline"}
                  className="h-7.5"
                  onClick={() => reload()}
                >
                  <KeenIcon icon="arrows-circle" />
                </Button>
              </DefaultTooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { NotificationListToolBar };
