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
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";

export interface IDirMenuLayoutProviderProps {
  layout: ILayoutConfig;
  headerSticky: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  menuPrivAccess?: menuAccess;
}

const DirMenuLayoutContext = createContext<IDirMenuLayoutProviderProps>({
  layout: LayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
  menuPrivAccess: undefined,
});

const useDirMenuLayout = () => useContext(DirMenuLayoutContext);

const DirMenuLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus();
  const { getLayout, setCurrentLayout } = useLayout();
  const { checkMenusPriv } = useRoleCheck();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollPosition = useScrollPosition();

  const headerSticky: boolean =
    scrollPosition > LayoutConfig.options.header.stickyOffset;

  const layoutConfig = deepMerge(LayoutConfig, getLayout(LayoutConfig.name));

  const [layout] = useState(layoutConfig);
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/directory-menu-management/DirMenuLayoutMt",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/directory-menu-management/DirMenuLayoutMt",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/directory-menu-management/DirMenuLayoutMt",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/directory-menu-management/DirMenuLayoutMt",
      "deleteStatus",
    ),
  };

  useEffect(() => {
    setMenuConfig("primary", MENU_SIDEBAR);
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout, setMenuConfig]);

  return (
    <DirMenuLayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        menuPrivAccess,
      }}
    >
      {children}
    </DirMenuLayoutContext.Provider>
  );
};

export { DirMenuLayoutProvider, useDirMenuLayout };
