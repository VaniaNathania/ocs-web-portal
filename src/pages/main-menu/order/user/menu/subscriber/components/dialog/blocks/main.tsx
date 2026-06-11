import SubsDetailHeader from "./header";
import SubsDetailItems from "./items";
import SubsDetailMenu from "./menu";

const Main = () => {
  return (
    <div className="flex flex-col gap-2">
      <SubsDetailHeader />
      <SubsDetailMenu />
      <SubsDetailItems />
    </div>
  );
};

export default Main;
