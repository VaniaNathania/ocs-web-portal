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
import { useMenus } from "@/providers";
import { useLocation, useParams } from "react-router";
import { useLanguage } from "@/i18n";
import { doGetNavbarMenu } from "@/actions/NavbarMenuActions";
import { useEffect, useState } from "react";
import { capitalizeWords, urlWords } from "@/utils";
import { useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { PricePlanDetail } from "@/pages/main-menu/types";
import axios from "axios";

const API_URL = apiConfig.service_price_plan;

const NavbarMenu = () => {
  const { pathname } = useLocation();
  const { GetData } = useCallApi();
  const { isRTL } = useLanguage();
  const { auth } = useAuthContext();

  const [menuData, setMenuData] = useState<RoleList[]>([]);
  const [error, setError] = useState<string | null>(null);
  let navbarMenu;

  const doGetNavbarMenu = async () => {
    try {
      const storedToken = localStorage.getItem(
        "ocs-portal-web-telkomcel-auth-v1=9.1.1"
      );
      const token = storedToken ? JSON.parse(storedToken) : null;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/priceplan/menu/list`, {
        headers: {
          Authorization: `Bearer ${auth?.access_token}`,
        },
      });

      if (response.data.code !== "200") {
        throw new Error(response.data.message ?? "Failed to fetch navbar menu");
      }

      const menuList: any[] = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((menuItem: any) => {
          if (menuItem?.parentName == "Subscription") {
            menuItem.list[0].forEach((item: any, index: number) => {
              const data = {
                icon: "",
                id: item?.id,
                id_parent: "",
                path: `/main/price-plan/${urlWords(item?.pricePlanTypeName)}`,
                module: capitalizeWords(item.pricePlanTypeName),
                name: capitalizeWords(item.pricePlanTypeName),
                title: capitalizeWords(item.pricePlanTypeName),
                order_number: index,
              };

              menuList.push(data);
            });
          }
        });
      }

      return {
        status: true,
        message: "Successfully retrieved navbar menu",
        data: {
          menu: menuList,
        },
      };
    } catch (error: any) {
      console.error("Error fetching navbar menu:", error.message);
      return {
        status: false,
        message: error.message,
        data: null,
      };
    }
  };

  useEffect(() => {
    const fetchNavbarMenu = async () => {
      try {
        const result = await doGetNavbarMenu();
        if (result.status && result.data) {
          setMenuData(result.data.menu);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to fetch navbar menu");
      }
    };

    fetchNavbarMenu();
  }, []);

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
  navbarMenu = menuData;
  const buildMenu = (items: TMenuConfig) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <MenuItem
            key={index}
            className="border-b-2 border-b-transparent menu-item-active:border-b-gray-900 menu-item-here:border-b-gray-900"
            trigger="hover"
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? "bottom-end" : "bottom-start",
            }}
          >
            <MenuLink className="gap-1.5 pb-2 lg:pb-4">
              <MenuTitle className="text-nowrap text-sm text-gray-800 menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                {item.title}
              </MenuTitle>
              <MenuArrow>
                <KeenIcon icon="down" className="text-2xs text-gray-500" />
              </MenuArrow>
            </MenuLink>
            <MenuSub
              className="menu-default py-2"
              rootClassName="min-w-[200px]"
            >
              {buildMenuChildren(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else if (!item.disabled) {
        return (
          <MenuItem
            key={index}
            className="border-b-2 border-b-transparent menu-item-active:border-b-gray-900 menu-item-here:border-b-gray-900"
          >
            <MenuLink path={item.path} className="gap-2.5 pb-2 lg:pb-4">
              <MenuTitle className="text-nowrap text-sm text-gray-800 menu-item-active:text-gray-900 menu-item-active:font-medium menu-item-here:text-gray-900 menu-item-here:font-medium menu-item-show:text-gray-900 menu-link-hover:text-gray-900">
                {item.title}
              </MenuTitle>
            </MenuLink>
          </MenuItem>
        );
      }
    });
  };

  const buildMenuChildren = (items: TMenuConfig) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <MenuItem
            key={index}
            trigger="hover"
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? "left-start" : "right-start",
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [-10, 0],
                  },
                },
              ],
            }}
          >
            <MenuLink>
              <MenuTitle>{item.title}</MenuTitle>
              <MenuArrow>
                <KeenIcon
                  icon="down"
                  className="text-2xs [.menu-dropdown_&]:-rotate-90"
                />
              </MenuArrow>
            </MenuLink>
            <MenuSub className="menu-default" rootClassName="min-w-[200px]">
              {buildMenuChildren(item.children)}
            </MenuSub>
          </MenuItem>
        );
      } else if (!item.disabled) {
        return (
          <MenuItem key={index}>
            <MenuLink path={item.path}>
              <MenuTitle>{item.title}</MenuTitle>
            </MenuLink>
          </MenuItem>
        );
      }
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
