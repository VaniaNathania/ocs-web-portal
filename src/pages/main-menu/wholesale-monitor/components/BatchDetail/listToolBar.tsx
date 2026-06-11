import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { BatchDetailFilter } from "../../models/types";
import { mockInstState } from "../../models/mock";
import { useWholesaleMonitor } from "../../hooks/context";

interface prop {
  reload: () => void;
}

const ListToolBar = ({ reload }: prop) => {
  const [filter, setFilter] = useState<BatchDetailFilter>();
  const { selectedRow } = useWholesaleMonitor();
  const { table } = useDataGrid();

  useEffect(() => {
    if (filter)
      table.setColumnFilters([
        {
          id: "state",
          value: filter,
        },
      ]);
    else table.setColumnFilters([]);
  }, [filter]);
  return (
    <div className="flex flex-row justify-between p-5 items-center">
      <div className="flex flex-row gap-5 items-center">
        <div>
          {selectedRow?.eventName} {`(${selectedRow?.wholesaleCode})`}
        </div>
        {/* <DefaultTooltip title="Export" placement="top">
          <Button size={"sm"} variant={"outline"}>
            <KeenIcon icon="file-down" />
          </Button>
        </DefaultTooltip> */}
        <DefaultTooltip title="Refresh" placement="top">
          <Button size={"sm"} variant={"outline"} onClick={reload}>
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
      <div className="input input-sm max-w-40">
        <Select
          value={filter ?? ""}
          onValueChange={(e: BatchDetailFilter) => setFilter(e)}
        >
          <SelectTrigger className="border-none bg-transparent p-0">
            <SelectValue placeholder="Instance State" />
          </SelectTrigger>
          <SelectContent>
            {mockInstState.map((item) => (
              <SelectItem value={item.state} key={item.state}>
                {item.stateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filter && (
          <Button
            size={"sm"}
            variant={"ghost"}
            onClick={() => setFilter(undefined)}
            className="p-0"
          >
            <KeenIcon icon="cross" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListToolBar;
