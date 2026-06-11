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
import { LogManagementLayoutConfig } from ".";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { log } from "./models/type";

export interface ILogManagementLayoutProviderProps {
  layout: ILayoutConfig;
  headerSticky: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  menuPrivAccess?: menuAccess;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const LogManagementLayoutContext =
  createContext<ILogManagementLayoutProviderProps>({
    layout: LogManagementLayoutConfig,
    headerSticky: false,
    mobileSidebarOpen: false,
    setMobileSidebarOpen: () => {},
    menuPrivAccess: undefined,
    activeTab: "login",
    setActiveTab: () => {},
  });

const useLogManagementLayout = () => useContext(LogManagementLayoutContext);

const LogManagementLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus();
  const { getLayout, setCurrentLayout } = useLayout();
  const [activeTab, setActiveTab] = useState<string>("login");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const { checkMenusPriv } = useRoleCheck();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/log-management/LogManagementLayout",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/log-management/LogManagementLayout",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/log-management/LogManagementLayout",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/log-management/LogManagementLayout",
      "deleteStatus",
    ),
  };

  const headerSticky: boolean =
    scrollPosition > LogManagementLayoutConfig.options.header.stickyOffset;

  const layoutConfig = deepMerge(
    LogManagementLayoutConfig,
    getLayout(LogManagementLayoutConfig.name),
  );

  const [layout] = useState(layoutConfig);

  useEffect(() => {
    setMenuConfig("primary", MENU_SIDEBAR);
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout, setMenuConfig]);

  return (
    <LogManagementLayoutContext.Provider
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
    </LogManagementLayoutContext.Provider>
  );
};

export { LogManagementLayoutProvider, useLogManagementLayout };
