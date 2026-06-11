import { highlighted, nonHighlighted } from "../../../blocks/menu";
import {
  menuOrderInfo,
  useOrderSubsDetailOrderInfo,
} from "../hooks/SubsDetailOrderInfoContext";

interface menuItem {
  name: string;
  menu: menuOrderInfo;
}

const Menu = () => {
  const { setSelectedMenu, selectedMenu } = useOrderSubsDetailOrderInfo();
  const menuItem: menuItem[] = [
    {
      name: "Order",
      menu: "order",
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
