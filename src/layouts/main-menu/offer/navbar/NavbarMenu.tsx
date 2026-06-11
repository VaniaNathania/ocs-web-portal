import { KeenIcon } from "@/components/keenicons";
import {
  Menu,
  MenuArrow,
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  IMenuItemConfig,
} from "@/components/menu";
import { useLocation, useParams } from "react-router";
import { useLanguage } from "@/i18n";
import { useEffect, useState } from "react";
import { capitalizeWords, urlWords } from "@/utils";
import { useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import axios from "axios";
import { useOfferLayout } from "../OfferLayoutProvider";
import { menu } from "@/layouts/multiTab/models/interfaces";
import clsx from "clsx";

const API_URL = apiConfig.service_price_plan;

type MenuItemExtended = IMenuItemConfig & {
  onClick?: () => void;
};
const NavbarMenu = () => {
  const { setMoveToSubsPlan, activeTab, setActiveTab } = useOfferLayout();
  const { pathname } = useLocation();
  const { GetData } = useCallApi();
  const { isRTL } = useLanguage();
  const { auth } = useAuthContext();

  const [menuData, setMenuData] = useState<RoleList[]>([]);
  const menu: menu[] = [
    {
      title: "Main Product",
      path: "/main/offer/main-product",
      tab: "main",
    },
    {
      title: "Related Product",
      path: "/main/offer/Related-product",
      tab: "related",
    },
    // {
    //   title: "Recurring Price",
    //   path: "/main/price-plan/portal/recurring-price",
    // },
    {
      title: "Price Plan",
      path: "/main/offer/price-plan",
      tab: "priceplan",
    },
    {
      title: "Subscription Plan",
      path: "/main/offer/subscription-plan",
      onClick: () => setMoveToSubsPlan(undefined),
      tab: "subs",
    },
    // {
    //   title: "Bundle",
    //   path: "/main/offer/bundle",
    // },
    //  {
    //   title: "BundleNew",
    //   path: "/main/offer/BundleNew",
    // },
    // {
    //   title: "Discount",
    //   path: "/main/price-plan/portal/discount",
    // },
    // {
    //   title: "Trigger",
    //   path: "/main/price-plan/portal/trigger",
    // },
    // {
    //   title: "Total Tax",
    //   path: "/main/price-plan/portal/total-tax",
    // },
    // {
    //   title: "Parameter",
    //   path: "/main/price-plan/portal/parameter",
    // },
    // {
    //   title: "Parameter Version",
    //   path: "/main/price-plan/portal/parameter-version",
    // },
  ];

  const [error, setError] = useState<string | null>(null);
  let navbarMenu;

  const doGetNavbarMenu = async () => {
    try {
      const storedToken = localStorage.getItem(
        "ocs-portal-web-telkomcel-auth-v1=9.1.1",
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
        // console.log(result);
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
          onClick={(e) => {
            e.preventDefault();
            item.onClick?.();
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
