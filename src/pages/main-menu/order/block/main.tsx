import { DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import SearchResultDialog from "./ResultSearchDialog";
import { useOrder } from "../hooks/orderContext";
import AddCostomerDialog from "./AddCustomerDialog";
import AdvanceSearchDialog from "./AdvanceSearch";
import { toast } from "sonner";

const Main = () => {
  const { search, setSearch, orderUseQuery } = useOrder();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showAdvanceSearch, setShowAdvanceSearch] = useState<boolean>(false);

  return (
    <div className="flex flex-col w-1/2 m-auto items-center justify-center gap-5 min-h-[80vh]">
      <SearchResultDialog isOpen={showSearch} handleDialog={setShowSearch} />
      <AddCostomerDialog isOpen={showAdd} handleDialog={setShowAdd} />
      <AdvanceSearchDialog
        isOpen={showAdvanceSearch}
        handleDialog={setShowAdvanceSearch}
      />
      <div className="flex flex-row gap-2 w-full">
        <Input
          size={"sm"}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Customer Name/ Service Number/ Doc Number"
          onKeyDown={(e) => {
            if (e.key === "Enter" && search != "") {
              e.preventDefault();
              setShowSearch(true);
            }
          }}
        />
        <Button
          size={"sm"}
          className="text-2xs"
          variant={"outline"}
          onClick={() => setShowAdvanceSearch(!showAdvanceSearch)}
        >
          Advance Search <KeenIcon icon="magnifier" />
        </Button>
      </div>
      <DefaultTooltip title="Add New Customer" placement="top">
        <div
          className="rounded-full border-2 w-36 h-36 relative bg-white shadow-lg hover:shadow-primary hover:text-primary cursor-pointer"
          onClick={() => {
            if (!orderUseQuery.isFetching) setShowAdd(!showAdd);
            else toast.error("Fetching Necessary Data");
          }}
        >
          <KeenIcon
            className="text-7xl absolute bottom-[50%] right-[50%] translate-y-[50%] translate-x-[50%]"
            icon="user"
          />
          <KeenIcon
            className="text-3xl absolute top-[18%] left-[18%]"
            icon="plus"
          />
        </div>
      </DefaultTooltip>
    </div>
  );
};

export default Main;
