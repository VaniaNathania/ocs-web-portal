import { Menu, MenuItem, MenuLink, MenuTitle } from "@/components/menu";
import { useLanguage } from "@/i18n";
import { useRoleLayout } from "../RoleLayoutProvider";
import { menu } from "@/layouts/multiTab/models/interfaces";
import clsx from "clsx";
import { useEffect } from "react";

const NavbarMenu = () => {
  const { isRTL } = useLanguage();
  const { setActiveTab, activeTab } = useRoleLayout();

  const menu: menu[] = [
    {
      title: "Role Portal",
      path: "/role-management",
      tab: "portal",
    },
    {
      title: "Role Menu",
      path: "/role-management/menu",
      tab: "menu",
    },
    {
      title: "Role Component",
      path: "/role-management/component",
      tab: "component",
    },
    {
      title: "Role Portlet",
      path: "/role-management/portlet",
      tab: "portlet",
    },
    {
      title: "Role User",
      path: "/role-management/user",
      tab: "user",
    },
    {
      title: "Role Job",
      path: "/role-management/job",
      tab: "job",
    },
  ];

  let navbarMenu;

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
          onClick={() => {
            setActiveTab(item.tab);
          }}
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
