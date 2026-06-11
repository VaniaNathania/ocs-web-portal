import {
  highlighted,
  nonHighlighted,
} from "../../../../subscriber/components/dialog/blocks/menu";
import { useOrderOrderDetail } from "../hooks/context";

interface menuItem {
  name: string;
  menu: "order" | "charge";
}

const Menu = () => {
  const { setSelectedMenu, selectedMenu } = useOrderOrderDetail();
  const menuItem: menuItem[] = [
    {
      name: "Order Information",
      menu: "order",
    },
    {
      name: "Charge Information",
      menu: "charge",
    },
  ];

  return (
    <div className="w-full flex flex-wrap gap-x-5 gap-y-1 border-b-2 text-sm">
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
