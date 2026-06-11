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
import { RoleLayoutConfig } from ".";
import { RoleSPID } from "@/pages/main-menu/role-management/component/sideBarListContextTable";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { LayoutConfig } from "../config/layoutConfig";

export interface IRoleLayoutProviderProps {
  layout: ILayoutConfig;
  headerSticky: boolean;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Existing
  selectedRow?: RoleSPID;
  setSelectedRow: React.Dispatch<React.SetStateAction<RoleSPID | undefined>>;

  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;

  // New delete dialog props
  showDeleteDialog: boolean;
  handleDeleteDialog: (open: boolean, row?: RoleSPID | null) => void;

  selectedTemp?: RoleSPID;
  setSelectedTemp: React.Dispatch<React.SetStateAction<RoleSPID | undefined>>;

  menuPrivAccess?: menuAccess;
}

const RoleLayoutContext = createContext<IRoleLayoutProviderProps>({
  layout: RoleLayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},

  selectedRow: undefined,
  setSelectedRow: () => {},

  activeTab: "portal",
  setActiveTab: () => {},

  showDeleteDialog: false,
  handleDeleteDialog: () => {},

  selectedTemp: undefined,
  setSelectedTemp: () => {},

  menuPrivAccess: undefined,
});

const useRoleLayout = () => useContext(RoleLayoutContext);

const RoleLayoutProvider = ({ children }: PropsWithChildren) => {
  const { setMenuConfig } = useMenus();
  const { getLayout, setCurrentLayout } = useLayout();
  const [selectedRow, setSelectedRow] = useState<RoleSPID | undefined>();
  const [selectedTemp, setSelectedTemp] = useState<RoleSPID | undefined>();
  const [activeTab, setActiveTab] = useState<string>("portal");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const { checkMenusPriv } = useRoleCheck();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/role-management/RoleLayoutMt",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/role-management/RoleLayoutMt",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/role-management/RoleLayoutMt",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/role-management/RoleLayoutMt",
      "deleteStatus",
    ),
  };

  const headerSticky: boolean =
    scrollPosition > LayoutConfig.options.header.stickyOffset;

  const layoutConfig = deepMerge(LayoutConfig, getLayout(LayoutConfig.name));

  const [layout] = useState(layoutConfig);

  const handleDeleteDialog = (open: boolean, row?: RoleSPID | null) => {
    setShowDeleteDialog(open);
    if (row === null) {
      setSelectedRow(undefined);
    } else if (row) {
      setSelectedRow(row);
    }
  };

  useEffect(() => {
    setMenuConfig("primary", MENU_SIDEBAR);
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout, setMenuConfig]);

  return (
    <RoleLayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        setMobileSidebarOpen,

        selectedRow,
        setSelectedRow,
        activeTab,
        setActiveTab,

        showDeleteDialog,
        handleDeleteDialog,

        selectedTemp,
        setSelectedTemp,

        menuPrivAccess,
      }}
    >
      {children}
    </RoleLayoutContext.Provider>
  );
};

export { RoleLayoutProvider, useRoleLayout };
