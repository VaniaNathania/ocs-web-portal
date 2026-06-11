import { DataGridProvider, KeenIcon, useDataGrid } from "@/components";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { StaffList } from "../../../models/interfaces";
import { useOperator } from "../hooks/context";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const ListToolBar = () => {
  const { table } = useDataGrid();
  const [filterBy, setFilterBy] = useState<string>("STAFF_NAME");

  const [searchValue, setSearchValue] = useState<string>("");
  useEffect(() => {
    table.setColumnFilters([{ id: filterBy, value: searchValue }]);
  }, [filterBy, searchValue]);
  return (
    <div className="flex flex-row items-center  bg-white p-2">
      <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Staff Name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="STAFF_NAME" value="STAFF_NAME">
            Staff Name
          </SelectItem>
          <SelectItem key="USER_CODE" value="USER_CODE">
            User Name
          </SelectItem>
          <SelectItem key="USER_CODE" value="USER_CODE">
            User Code
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="input">
        <Input
          className="border-0 p-0"
          type="text"
          placeholder="Search..."
          size={"default"}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <KeenIcon icon="magnifier" className="text-gray-400 w-4 h-4 mr-1" />
      </div>
    </div>
  );
};

const StaffTable = () => {
  const { selectedStaff, setSelectedStaff } = useOperator();
  const rowData: StaffList[] = [];
  const columns = useMemo<ColumnDef<StaffList>[]>(
    () => [
      {
        accessorFn: (row) => row.STAFF_NAME,
        id: "STAFF_NAME",
        header: "Staff Name",
      },
      {
        accessorFn: (row) => row.USER_NAME,
        id: "USER_NAME",
        header: "User Name",
      },
      {
        accessorFn: (row) => row.USER_CODE,
        id: "USER_CODE",
        header: "User CODE",
      },
    ],
    [],
  );
  return (
    <DataGridProvider
      data={rowData}
      columns={columns}
      toolbar={<ListToolBar />}
      serverSide={false}
      getRowProps={(row) => ({
        className:
          row.original.STAFF_ID === selectedStaff?.STAFF_ID
            ? selectedRowHighLight
            : nonSelectedRowHighLight,
        onClick: () => setSelectedStaff(row.original),
        // ADD THIS REF CALLBACK:
      })}
    />
  );
};

export default StaffTable;
