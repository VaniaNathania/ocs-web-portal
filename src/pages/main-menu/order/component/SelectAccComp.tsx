import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddAccInfo from "../user/menu/accInfo/dialog/addAcc/AddAccInfo";
import { useOrderUser } from "../user/hooks/context";
import { useOrder } from "../hooks/orderContext";

const SelectAccComp = () => {
  const { acctList, selectedAcc, setSelectedAcc, setRefreshKey } =
    useOrderUser();
  const { setShowAddAcc } = useOrder();
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const itemStyle =
    "w-20 h-10 flex justify-center items-center border-2 hover:border-primary-active hover:shadow-md hover:shadow-primary-clarity rounded-md transition-all duration-200 hover:text-primary cursor-pointer";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button size={"sm"} onClick={() => setIsSelecting(!isSelecting)}>
          Select Account
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => acctList?.refetch()}
        >
          <KeenIcon icon="arrows-circle" />
        </Button>
      </div>

      <div
        className={`
    flex flex-row gap-2 items-center overflow-hidden
    transition-[max-height,opacity] duration-300 ease-in-out
    ${isSelecting ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {/* <div className={`${itemStyle} text-xs`}>123123</div> */}
        {acctList?.data?.map((item, index) => {
          return (
            <div
              key={index}
              className={`${itemStyle} text-xs ${selectedAcc?.acctId === item.acctId ? "bg-primary text-white hover:text-white" : ""}`}
              onClick={() => setSelectedAcc(item)}
            >
              {item.acctNbr}
            </div>
          );
        })}
        <div className={itemStyle} onClick={() => setShowAddAcc(true)}>
          <KeenIcon icon="plus" />
        </div>
      </div>
      {/* <AddAccInfo isOpen={showAdd} handleDialog={setShowAdd} /> */}
    </div>
  );
};

export default SelectAccComp;
