import {
  createContext,
  Dispatch,
  type PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { MENU_SIDEBAR } from "@/config";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { ILayoutConfig, useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { OrderLayoutConfig } from ".";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";

export interface IOrderLayoutProviderProps {
  layout: ILayoutConfig;
  headerSticky: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  menuPrivAccess?: menuAccess;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const OrderLayoutContext = createContext<IOrderLayoutProviderProps>({
  layout: OrderLayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
  menuPrivAccess: undefined,
  activeTab: "main",
  setActiveTab: () => {},
});

const useOrderLayout = () => useContext(OrderLayoutContext);

const OrderLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus();
  const { getLayout, setCurrentLayout } = useLayout();
  const { checkMenusPriv } = useRoleCheck();
  const [activeTab, setActiveTab] = useState<string>("main");
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv("/main-menu/order/OrderLayout", "addStatus"),
    editStatus: checkMenusPriv("/main-menu/order/OrderLayout", "editStatus"),
    readStatus: checkMenusPriv("/main-menu/order/OrderLayout", "readStatus"),
    deleteStatus: checkMenusPriv(
      "/main-menu/order/OrderLayout",
      "deleteStatus",
    ),
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollPosition = useScrollPosition();

  const headerSticky: boolean =
    scrollPosition > LayoutConfig.options.header.stickyOffset;

  const layoutConfig = deepMerge(LayoutConfig, getLayout(LayoutConfig.name));

  const [layout] = useState(layoutConfig);

  useEffect(() => {
    setMenuConfig("primary", MENU_SIDEBAR);
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout, setMenuConfig]);

  return (
    <OrderLayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        menuPrivAccess,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </OrderLayoutContext.Provider>
  );
};

export { OrderLayoutProvider, useOrderLayout };
