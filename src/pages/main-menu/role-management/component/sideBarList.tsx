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
import { useRoleList } from "../hook/useRolesList";
import { Loading } from "../block/loadingBlock";
import { AccessWrapper } from "../hook/useRoleCheck";
import { useRoleLayout } from "@/layouts/main-menu/role-management";

interface barListProps {
  styleDiv: string;
}

const SideBarList = ({ styleDiv }: barListProps) => {
  const { loading } = useRoleList();
  const [filter, setFilter] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const { menuPrivAccess, selectedRow, setSelectedRow } = useRoleLayout();

  return (
    <div className={styleDiv}>
      <div className="flex flex-row py-2 space-x-2">
        <div className="flex my-auto w-1/4">
          <Select value={filter} onValueChange={(val) => setFilter(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Role Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Role Name</SelectItem>
              <SelectItem value="code">Role Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-3/4">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder={`Search Role by ${filter}..`}
              className="w-full"
              // value={search}
              // onChange={(e) => {}}
              onKeyUpCapture={(e) => {
                // console.log(e.key);
                if (e.key === "Enter") {
                  setSearch(e.currentTarget.value);
                }
                if (e.currentTarget.value === "") setSearch("");
              }}
            />
          </label>
        </div>
      </div>
      <div className="relative">
        {loading && <Loading />}
        <SideBatListTable
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          filter={filter}
          search={search}
        />
      </div>
    </div>
  );
};

export { SideBarList };
