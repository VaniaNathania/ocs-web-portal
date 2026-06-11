import Item from "./item";
import Menu from "./menu";

const Main = () => {
  return (
    <div className="flex flex-col gap-5">
      <Menu />
      <Item />
    </div>
  );
};

export default Main;
