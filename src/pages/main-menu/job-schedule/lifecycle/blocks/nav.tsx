import {
  highlighted,
  nonHighlighted,
} from "@/pages/main-menu/order/user/menu/subscriber/components/dialog/blocks/menu";
import { useLifeCycle } from "../hooks/context";
import { Nav } from "../interface";

interface menuItem {
  name: string;
  menu: Nav;
}

const Menu = () => {
  const { selectedMenu, setSelectedMenu } = useLifeCycle();
  const menuItem: menuItem[] = [
    {
      name: "LifeCycle Canvas Templete",
      menu: "Canvas",
    },
    {
      name: "LifeCycle Apply",
      menu: "Apply",
    },
  ];

  return (
    <div className="w-full flex flex-wrap gap-x-5 gap-y-1 border-b-2 text-sm px-2">
      {menuItem.map((menu, index) => {
        return (
          <div
            className={`whitespace-nowrap py-2 ${selectedMenu === menu.menu ? highlighted : nonHighlighted}`}
            onClick={() => setSelectedMenu(menu.menu)}
            key={index}
          >
            {menu.name}
          </div>
        );
      })}
    </div>
  );
};

export default Menu;
