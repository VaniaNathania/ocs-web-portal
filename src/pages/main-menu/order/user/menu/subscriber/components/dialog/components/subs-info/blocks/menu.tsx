import { highlighted, nonHighlighted } from "../../../blocks/menu";
import { useOrderSubsDetailSubsInfo } from "../hooks/SubsDetailSubsInfoContext";

interface menuItem {
  name: string;
  menu:
    | "detail"
    | "service"
    | "related"
    | "resource"
    | "goods"
    | "tracks"
    | "company"
    | "lifecycle";
}

const Menu = () => {
  const { setSelectedMenu, selectedMenu } = useOrderSubsDetailSubsInfo();
  const menuItem: menuItem[] = [
    {
      name: "Subscriber Detail",
      menu: "detail",
    },
    {
      name: "Service",
      menu: "service",
    },
    {
      name: "Related Subscriber",
      menu: "related",
    },
    {
      name: "Resource",
      menu: "resource",
    },
    {
      name: "Goods",
      menu: "goods",
    },
    {
      name: "Product State Track",
      menu: "tracks",
    },
    {
      name: "Company Information",
      menu: "company",
    },
    {
      name: "Product LifeCycle Calculation",
      menu: "lifecycle",
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
