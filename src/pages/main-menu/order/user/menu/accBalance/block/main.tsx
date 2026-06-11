import SelectAccComp from "@/pages/main-menu/order/component/SelectAccComp";
import AccBalTable from "./AccBalTable";
import { useOrderUser } from "../../../hooks/context";

const Main = () => {
  const { selectedAcc } = useOrderUser();
  return (
    <div className="m-1 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md">
      <SelectAccComp />
      <AccBalTable acctId={selectedAcc?.acctId} />
    </div>
  );
};

export default Main;
