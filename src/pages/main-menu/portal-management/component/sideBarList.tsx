import { KeenIcon } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { SideBatListTable } from "./sideBarListContextTable";
import { Loading } from "../block/loadingBlock";
import { usePortalList } from "../hook/usePortalList";

interface barListProps {
  styleDiv: string;
}

const SideBarList = ({ styleDiv }: barListProps) => {
  const { loading } = usePortalList();
  const [filter, setFilter] = useState<string>("name");
  const [search, setSearch] = useState<string>("");

  return (
    <div className={styleDiv}>
      <div className="flex flex-row py-2 space-x-2">
        {/* <div className="flex my-auto w-1/4">
          <Select value={filter} onValueChange={(val) => setFilter(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Portal Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Portal Name</SelectItem>
              <SelectItem value="url">Portal Url</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
        <div className="flex-1">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder={`Search Portal by ${filter}..`}
              className="w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="relative">
        {loading && <Loading />}
        <SideBatListTable filter={filter} search={search} />
      </div>
    </div>
  );
};

export { SideBarList };
