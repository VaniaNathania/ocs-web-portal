import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useOrderOrderDetail } from "../hooks/context";
import Item from "./item";
import Menu from "./menu";

const Main = () => {
  const { isLoading } = useOrderOrderDetail();
  return (
    <div className="flex flex-col gap-5">
      {isLoading && <Loading />}
      <Menu />
      <Item />
    </div>
  );
};

export default Main;
