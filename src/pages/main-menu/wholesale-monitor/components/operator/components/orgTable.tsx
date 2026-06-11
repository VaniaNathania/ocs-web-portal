import { DataGridProvider, KeenIcon, useDataGrid } from "@/components";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { OrgData } from "@/pages/main-menu/upload-simcard/blocks/Organization";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOperator } from "../hooks/context";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const API_URL_OFFER = apiConfigOffer.offer;

const ListToolBar = () => {
  const { table } = useDataGrid();
  const [filterBy, setFilterBy] = useState<string>("orgName");

  const [searchValue, setSearchValue] = useState<string>("");
  useEffect(() => {
    table.setColumnFilters([{ id: filterBy, value: searchValue }]);
  }, [filterBy, searchValue]);

  return (
    <div className="flex flex-row items-center  bg-white p-2">
      <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Organization Name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="orgName" value="orgName">
            Organization Name
          </SelectItem>
          <SelectItem key="orgCode" value="orgCode">
            Organization Code
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

const OrgTable = () => {
  const { selectedOrg, setSelectedOrg } = useOperator();
  const { GetData } = useCallApi();
  const columns = useMemo<ColumnDef<OrgData>[]>(
    () => [
      {
        accessorFn: (row) => row.orgName,
        id: "orgName",
        header: "Org Name",
      },
      {
        accessorFn: (row) => row.orgCode,
        id: "orgCode",
        header: "Org Code",
      },
    ],
    [],
  );

  const fetchRow = async (): Promise<OrgData[]> => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-org-list`,
        {
          parentId: null,
          areaId: 1,
          orgName: null,
          orgCode: null,
          orgType: null,
          state: "A",
          spId: 0,
        },
      );

      if (response?.data && Array.isArray(response.data)) {
        setSelectedOrg(response.data[0]);
        return response.data;
      } else {
        console.warn("⚠️ No available data or invalid data format:", response);
        return [];
      }
    } catch (error) {
      console.error("❌ Available Features API Error:", error);
      toast.error("Error loading available feature data");
      return [];
    }
  };

  const row: UseQueryResult<OrgData[]> = useQuery({
    queryKey: ["org-query"],
    queryFn: () => fetchRow(),
    staleTime: 1 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <DataGridProvider
      data={row.data}
      columns={columns}
      toolbar={<ListToolBar />}
      serverSide={false}
      getRowProps={(row) => ({
        className:
          row.original.orgId === selectedOrg?.orgId
            ? selectedRowHighLight
            : nonSelectedRowHighLight,
        onClick: () => setSelectedOrg(row.original),
        // ADD THIS REF CALLBACK:
      })}
    />
  );
};

export default OrgTable;
