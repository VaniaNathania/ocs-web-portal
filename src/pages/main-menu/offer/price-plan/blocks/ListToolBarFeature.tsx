import { KeenIcon, useDataGrid } from "@/components";
import { usePricePlanListContext } from "../hooks";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallApi } from "@/hooks";

interface PricePlanList {
  id: string;
  pricePlanTypeName: string;
}

const ListToolBarFeature = () => {
  const { table, reload } = useDataGrid();

  const [filters, setFilters] = useState<string>("");
  const [datas, setDatas] = useState<PricePlanList[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    table.setColumnFilters([
      {
        id: "pricePlanTypeId",
        value: filters,
      },
    ]);
  }, [filters]);

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
        {/* Search */}
        <div className="flex w-full gap-3 items-center">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search Feature Name..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full"
            />
          </label>
        </div>

        {/* Left Section */}
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-[60%]">
          <div className="w-1/2">
            <Select
              value={selectedSerial || ""}
              onValueChange={(value: any) => {
                setSelectedSerial(value);
                setFilters(value);
              }}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Contact Channel" />
              </SelectTrigger>
              <SelectContent>
                {datas.map((cd) => (
                  <SelectItem key={cd.id} value={cd.id}>
                    {cd.pricePlanTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/3">
          <Select
            value={selectedSerial || ""}
            onValueChange={(value: any) => {
              setSelectedSerial(value);
              setFilters(value);
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {datas.map((cd) => (
                <SelectItem key={cd.id} value={cd.id}>
                  {cd.pricePlanTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export { ListToolBarFeature };
