import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useSearch } from "../hooks/SearchContext";

const AdvanceSearchQuery = () => {
  const { setQuery } = useSearch();
  const [type, setType] = useState<"accNbr" | "acctNbr" | "custName">(
    "custName",
  );
  const [search, setSearch] = useState<string>("");

  const setToQuery = () => {
    setQuery(
      (prev) =>
        (prev = {
          [type]: search,
          page: prev.page,
          size: prev.size,
          sortBy: prev.sortBy,
          sortDirection: prev.sortDirection,
          spId: 0,
        }),
    );
  };
  return (
    <div className="grid grid-cols-6 gap-2">
      <div className="flex flex-wrap gap-2 items-center col-span-4">
        <div className="flex flex-row gap-2 cursor-pointer">
          <Input
            type="radio"
            size={"sm"}
            className="w-[15px] h-[15px]"
            checked={type === "accNbr"}
            onChange={() => setType("accNbr")}
            // disabled
          />
          <Label className="cursor-pointer" onClick={() => setType("accNbr")}>
            Service Number
          </Label>
        </div>
        <div className="flex flex-row gap-2 cursor-pointer">
          <Input
            type="radio"
            size={"sm"}
            className="w-[15px] h-[15px]"
            checked={type === "acctNbr"}
            onChange={() => setType("acctNbr")}
          />
          <Label className="cursor-pointer" onClick={() => setType("acctNbr")}>
            Account Number
          </Label>
        </div>
        <div className="flex flex-row gap-2 cursor-pointer">
          <Input
            type="radio"
            size={"sm"}
            className="w-[15px] h-[15px]"
            checked={type === "custName"}
            onChange={() => setType("custName")}
          />
          <Label className="cursor-pointer" onClick={() => setType("custName")}>
            Customer Name
          </Label>
        </div>
      </div>
      <div></div>
      <div></div>

      <div className="input input-sm col-span-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size={"sm"}
          className="border-none"
          onKeyDown={(e) => {
            // console.log(e.key, e.key === "Enter");
            if (e.key === "Enter") setToQuery();
          }}
        />
        <KeenIcon icon="magnifier" />
      </div>
      <div className="flex flex-row gap-2 col-span-2 justify-end">
        <Button size={"sm"} onClick={setToQuery}>
          Query
        </Button>
        <Button size={"sm"} onClick={() => setSearch("")} variant={"outline"}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default AdvanceSearchQuery;
