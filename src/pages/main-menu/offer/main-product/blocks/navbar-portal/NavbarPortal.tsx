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
import { urlWords } from "@/utils";
// import { usePortalLayout } from "../PortalLayoutProvider";
import { useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { PricePlanDetail } from "@/pages/main-menu/types";
import { useNavigate } from "react-router-dom";

interface NavbarPortalProps {
  pricePlanDetail: PricePlanDetail;
}

const API_URL = apiConfig.service_price_plan;

const NavbarPortal = ({ pricePlanDetail }: NavbarPortalProps) => {
  const { pathname } = useLocation();
  const { selectedPricePlan, setPricePlandetail } = useAuthContext();
  const { getMenuConfig } = useMenus();
  const { GetData } = useCallApi();
  const primaryMenu = getMenuConfig("primary");
  const { isRTL } = useLanguage();
  const [ dataPricePlan, setDataPricePlan] = useState<any>({});

  const menuDataPortal = [
    {
      title: "Usage Price",
      path: "/main/price-plan/portal/usage-price",
    },
    {
      title: "Recurring Price",
      path: "/portal/recurring-price",
    },
    {
      title: "Subscription-price",
      path: "/portal/subscription-price",
    },
    {
      title: "Discount",
      path: "/portal/discount",
    },
    {
      title: "Trigger",
      path: "/portal/trigger",
    },
    {
      title: "Total Tax",
      path: "/portal/total-tax",
    },
    {
      title: "Parameter",
      path: "/portal/parameter",
    },
    {
      title: "Parameter Version",
      path: "/portal/parameter-version",
    },
  ];

  const [menuData, setMenuData] = useState<RoleList[]>([]);
  // const [pricePlan, setPricePlan] = useState<PricePlanDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  let navbarMenu;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavbarMenu = async () => {
      try {
        const result = await doGetNavbarMenu("Portal");
        if (result.status && result.data) {
          const updatedMenu = result.data.menu.map(
            (item: any, index: number) => ({
              ...item,
              icon: "",
              id_parent: null,
              link: `/main/price-plan/subscribe/${urlWords(item.PortalTypeName)}`,
              module: item.PortalTypeName,
              name: item.PortalTypeName,
              order_number: index,
            })
          );

          setMenuData(updatedMenu);
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

  // navbarMenu = mapMenuData(menuData);
  // navbarMenu = primaryMenu?.[0].children;
  navbarMenu = menuDataPortal;

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
            <MenuLink
              path={item.path}
              // onClick={() => {
              //   navigate(`${item.path}`, {
              //     state: { dataPricePlan: pricePlanDetail },
              //   });
              // }}
              className="gap-2.5 pb-2 lg:pb-4 hover:cursor-pointer"
            >
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

  useEffect(() => {
    const fetchPricePlanDetail = async () => {
      try {
        const response = await GetData(`${API_URL}/priceplan/detail`, {
          offerId: pricePlanDetail?.offerId,
          applyLevel: pricePlanDetail?.applyLevel,
        });

        
        setDataPricePlan(response?.data);
      } catch (error) {
        console.error(
          `Error fetching price plan detail ${pricePlanDetail?.offerId} - ${pricePlanDetail?.applyLevel} (${error})`
        );
      }
    };

    if (pricePlanDetail) {
      fetchPricePlanDetail();
    }
  }, [pricePlanDetail]);

  return (
    <div className="w-full">
      <div className="w-full flex justify-between items-center mb-4 mt-1">
        <div>
          <h1 className="text-xl font-semibold">
            {pricePlanDetail?.pricePlanName} - {pricePlanDetail?.offerId}
            <span className="text-sm text-blue-500 ml-2">
              Version {dataPricePlan?.offerVerList?.[0]?.offerVerId} {"->"}{" "}
              (Newest Version)
            </span>
          </h1>
        </div>
        <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600">
          Price Plan Detail
        </button>
      </div>
      <div className="grid">
        <div className="scrollable-x-auto">
          <Menu highlight={true} className="gap-5 lg:gap-7.5">
            {navbarMenu && navbarMenu && buildMenu(navbarMenu)}
          </Menu>
        </div>
      </div>
    </div>
  );
};

export { NavbarPortal };
