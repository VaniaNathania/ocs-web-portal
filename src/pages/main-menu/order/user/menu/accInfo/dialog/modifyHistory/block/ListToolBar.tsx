import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { acctAttrValueList } from "@/pages/main-menu/order/models/interfaces";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useDataGrid } from "@/components";
import { useEffect, useState } from "react";
import { ModHisQuery } from "../models/interfaces";

const API_URL = apiConfigOrder.order;

const ListToolBar = () => {
  const { GetData } = useCallApi();
  const { table } = useDataGrid();
  const [query, setQuery] = useState<ModHisQuery>({});
  const [tempQuery, setTempQuery] = useState<ModHisQuery>({});

  const fetch = async (): Promise<acctAttrValueList[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/acct-attr/qry-acct-attr-list`,
        { spId: 0, contactChannelId: 1 },
      );

      if (resp.status) return resp.data;

      toast.error(resp.message);
      return [];
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const AcctAttrList: UseQueryResult<acctAttrValueList[]> = useQuery({
    queryKey: ["acct-attr-list"],
    queryFn: fetch,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!table) return;
    // console.log(
    //   query,
    //   table.getColumn("updateDate")?.setFilterValue(
    //     query.start || query.end
    //       ? {
    //           start: query.start,
    //           end: query.end,
    //         }
    //       : undefined,
    //   ),

    // );

    // table.getColumn("accNbr")?.setFilterValue(query.attrName || undefined);

    table.getColumn("updateDate")?.setFilterValue(
      query.start || query.end
        ? {
            start: query.start,
            end: query.end,
          }
        : undefined,
    );
  }, [query, table]);
  return (
    <div className="grid grid-cols-2 gap-5 my-5 px-5">
      <div className="flex flex-row items-center gap-2">
        <Label className="w-24">Feature</Label>
        <Select
          value={tempQuery.attrName ?? ""}
          onValueChange={(value) =>
            setTempQuery((prev) => ({ ...prev, attrName: value }))
          }
          // disabled={disable}
        >
          <SelectTrigger className="flex-1" size="sm">
            <SelectValue placeholder="Select Feature" />
          </SelectTrigger>
          <SelectContent>
            {AcctAttrList.data?.map((item) => (
              <SelectItem
                key={item.attrId}
                value={item.attrValueMark.toString()}
              >
                {item.attrValueMark}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Label className="w-24">Start Date</Label>
        <input
          type="date"
          className="input input-sm bg-white flex-1"
          value={tempQuery.start ?? ""}
          onChange={(e) =>
            setTempQuery((prev) => ({ ...prev, start: e.target.value }))
          }
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <Label className="w-24">End Date</Label>
        <input
          type="date"
          className="input input-sm bg-white flex-1"
          value={tempQuery.end ?? ""}
          onChange={(e) =>
            setTempQuery((prev) => ({ ...prev, end: e.target.value }))
          }
        />
      </div>
      <div className="flex flex-row gap-2 justify-end">
        <Button size={"sm"} onClick={() => setQuery(tempQuery)}>
          Query
        </Button>
        <Button
          size={"sm"}
          onClick={() => {
            setTempQuery({});
            setQuery({});
          }}
          variant={"outline"}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ListToolBar;
