import {
  ContentLoader,
  DefaultTooltip,
  KeenIcon,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { useTriggerCreateContext } from "../../hooks";
import { toAbsoluteUrl } from "@/utils";
import { DateRangePicker } from "../DateRangePicker";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL = apiConfig.service_assets;

const AdvancedRulesListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { GetData } = useCallApi();
  const { handleAddAdvanceRuleDialog, selectedTrigger } =
    useTriggerCreateContext();

  const [filteredDate, setFilteredDate] = useState<DateRange | undefined>(
    undefined
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );

  const [filter, setFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
    code?: string;
    type?: string;
    department?: string;
    category?: string;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
    code: "",
    type: "",
    department: "",
    category: "",
  });

  const handleFilterData = useCallback(() => {
    try {
      setIsLoading(true);
      setLoadingButton("filter");
      const filters = [];

      // Add filters based on selectedType if needed
      if (selectedType) {
        filters.push({
          id: "type", // Adjust this based on your column structure
          value: selectedType,
        });
      }

      // Add date filters if needed
      if (filter.from && filter.to) {
        filters.push({
          id: "date",
          value: {
            from: filter.from,
            to: filter.to,
          },
        });
      }

      table.setColumnFilters(filters);
    } catch (error) {
      toast.error("Error filtering data");
    } finally {
      setLoadingButton(null);
      setIsLoading(false);
    }
  }, [selectedType, filter.from, filter.to, table]);

  const handleResetData = useCallback(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 31);

    setFilter({
      from: oneMonthAgo,
      to: today,
      code: "",
      type: "",
      department: "",
      category: "",
    });

    setSelectedType(undefined);
    setFilteredDate(undefined);
    table.setColumnFilters([]);
    reload();
  }, [table, reload]);

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="w-[80%] flex gap-3 items-center">
            <h2 className="text-lg font-semibold mb-4">Advanced Rules</h2>
          </div>
          <div className="flex gap-3">
            <DefaultTooltip title={"Add New Trigger"} placement={"top"}>
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                onClick={() => handleAddAdvanceRuleDialog(true)}
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
                disabled={isLoading}
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AdvancedRulesListToolBar };
