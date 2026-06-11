import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { MENU_SIDEBAR } from "@/config";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { ILayoutConfig, useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { UserLayoutConfig } from ".";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";

export interface IUserLayoutProviderProps {
  layout: ILayoutConfig;
  headerSticky: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  menuPrivAccess?: menuAccess;
}

const UserLayoutContext = createContext<IUserLayoutProviderProps>({
  layout: UserLayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
  menuPrivAccess: undefined,
});

const useUserLayout = () => useContext(UserLayoutContext);

const UserLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus();
  const { getLayout, setCurrentLayout } = useLayout();
  const { checkMenusPriv } = useRoleCheck();

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

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/user-management/UserLayout",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/user-management/UserLayout",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/user-management/UserLayout",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/user-management/UserLayout",
      "deleteStatus",
    ),
  };

  return (
    <UserLayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        menuPrivAccess,
      }}
    >
      {children}
    </UserLayoutContext.Provider>
  );
};

export { UserLayoutProvider, useUserLayout };
