import { highlighted, nonHighlighted } from "../../../blocks/menu";
import {
  menu,
  useOrderSubsDetailAccInfo,
} from "../hooks/SubsDetailAccInfoContext";

interface menuItem {
  name: string;
  menu: menu;
}

const Menu = () => {
  const { setSelectedMenu, selectedMenu } = useOrderSubsDetailAccInfo();
  const menuItem: menuItem[] = [
    {
      name: "Deposit",
      menu: "deposit",
    },
    {
      name: "Payment Information",
      menu: "payment",
    },
    {
      name: "Debt Information",
      menu: "debt",
    },
    {
      name: "Account Information",
      menu: "acct info",
    },
    {
      name: "Account Balance",
      menu: "acct bal",
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
