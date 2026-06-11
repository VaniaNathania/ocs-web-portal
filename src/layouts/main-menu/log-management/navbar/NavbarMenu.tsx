import { KeenIcon } from "@/components/keenicons";
import {
  Menu,
  MenuArrow,
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
} from "@/components/menu";
import { useLanguage } from "@/i18n";
import { useLogManagementLayout } from "../LogManagementLayoutProvider";
import { menu } from "@/layouts/multiTab/models/interfaces";
import clsx from "clsx";

const NavbarMenu = () => {
  const { isRTL } = useLanguage();
  const { setActiveTab, activeTab } = useLogManagementLayout();

  const menu: menu[] = [
    {
      title: "Login Log",
      path: "/log-management",
      tab: "login",
    },
    {
      title: "System Log",
      path: "/log-management/system-log",
      tab: "system",
    },
    {
      title: "Audit Log",
      path: "/log-management/audit-log",
      tab: "audit",
    },
  ];

  let navbarMenu;

  const mapMenuData = (data: RoleList[]): MappedMenu[] => {
    return data.map((item) => {
      const mappedItem: MappedMenu = {
        title: item.pricePlanTypeName,
        path: item.link !== "-" ? item.link : "/",
      };

      if (item.children && item.children.length > 0) {
        mappedItem.children = mapMenuData(item.children);
      }

      return mappedItem;
    });
  };
  navbarMenu = menu;

  const buildMenu = (items: menu[]) => {
    return items.map((item, index) => {
      return (
        <MenuItem
          key={index}
          className={clsx(
            "border-b-2 transition-all duration-150",
            activeTab === item.tab
              ? "border-b-red-500"
              : "border-b-transparent",
          )}
          onClick={() => setActiveTab(item.tab)}
        >
          <MenuLink className="gap-2.5 pb-2 lg:pb-4">
            <MenuTitle className="text-nowrap text-sm text-gray-800 menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
              {item.title}
            </MenuTitle>
          </MenuLink>
        </MenuItem>
      );
    });
  };

  return (
    <div className="grid mt-3">
      <div className="scrollable-x-auto">
        <Menu highlight={true} className="gap-5 lg:gap-7.5">
          {navbarMenu && navbarMenu && buildMenu(navbarMenu)}
        </Menu>
      </div>
    </div>
  );
};

export { NavbarMenu };
