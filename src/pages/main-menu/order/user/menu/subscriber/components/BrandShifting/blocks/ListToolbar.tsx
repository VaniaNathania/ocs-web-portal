import { KeenIcon, useDataGrid } from "@/components";
import { useBrandShifting } from "../hooks/brandShiftingContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const ListToolbar = () => {
  const { table, reload } = useDataGrid();
  const { openServiceDialog } = useBrandShifting();
  const [searchValue, setSearchValue] = useState<string>(
    (table.getColumn("brandName")?.getFilterValue() as string) ?? ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      table.getColumn("brandName")?.setFilterValue(searchValue);
      table.setPageIndex(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchValue, table]);

  return (
    <div className="flex-wrap gap-2 px-5 border-b-0 card-header">
      <div className="flex flex-wrap w-full gap-2 lg:gap-5">
        <div className="flex items-center justify-end w-full">
          {/* <div className="flex w-[50%] gap-3 items-center">
            <label className="w-1/3 overflow-hidden input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </label>
          </div> */}
          <div className="flex items-center flex-shrink-0 gap-3">
            <Button
              variant="outline"
              size={"sm"}
              className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
              onClick={() => openServiceDialog(true)}
            >
              <KeenIcon icon="plus" className="mr-2" />
              Add Data
            </Button>
            {/* <DefaultTooltip title={"Refresh"} placement={"top"}>
              <Button
                variant="outline"
                className="h-7.5"
                onClick={() => reload()}
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListToolbar;
