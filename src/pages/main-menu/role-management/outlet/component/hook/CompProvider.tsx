import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { PortalData } from "../../portal/hook/PortalProvider";
import { apiConfigRole } from "@/config/api.config";

export interface MenuData {
  privId: number;
  privType: string; //"M"
  privName: string; //"Directory Menu Management",
  comments: string;
  //"You can manage directory and menu in this menu, also, you can import or export information about them.",
  url: string; //"modules/dirmenumgr/views/DirMenuMgr",
  state: string; //"A",
  stateDate: string; //"2023-12-25 15:32:38",
  privCode: string; //"dirmenu-mgrs",
  privEl: string; //"/dirs|/menus",
  autoOpenMenu: string; //"N",
  privLevel: string;
}

// Context Type
interface CompListContextType {
  components: MenuData[];
  loading: boolean;
  error: string | null;
  availableComponents: MenuData[];
  setAvailableComponents: Dispatch<SetStateAction<MenuData[]>>;
  ownedComponents: MenuData[];
  lastUpdated: any;
  selectedAvailable: MenuData[];
  setSelectedAvailable: Dispatch<SetStateAction<MenuData[]>>;
  selectedOwned: MenuData[];
  setSelectedOwned: Dispatch<SetStateAction<MenuData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  fetchAll: () => void;
  portals: PortalData[];
  node?: Party;
  setNode: Dispatch<SetStateAction<Party | undefined>>;
  fetchAvailableMenus: (partyId: number | undefined) => Promise<void>;
  noMenu: MenuData[];
  setNoMenu: Dispatch<SetStateAction<MenuData[]>>;
}

export interface Party {
  portalId: number;
  partyId: number;
  partyName: string;
  isChild?: boolean;
  parentId?: number;
  level?: number; // To control indentation
  seq?: number;
  type?: string;
}

export interface CompDir {
  index: number; //
  parentIndex: number;
  dirId?: number; //2;
  parentId?: number; //99;
  dirName?: string; //"Privilege Management";
  state?: string; //"A";
  stateDate?: string; //"2023-12-25 15:32:37";
  privId?: number; //111038;
  privName?: string; //"Statistic Type Management";
  url?: string; //"cvbs/modules/billing/ruleconfig/views/StatisticTypeView";
  isChild?: boolean;
  level?: number; // To control indentation
}

// Create context
export const CompListContext = createContext<CompListContextType | undefined>(
  undefined,
);

const API_ROLE = apiConfigRole.role;

export const CompListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [components, setComponents] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableComponents, setAvailableComponents] = useState<MenuData[]>(
    [],
  );
  const [ownedComponents, setOwnedComponents] = useState<MenuData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<MenuData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<MenuData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { GetData } = useCallApi();
  const { selectedRow, selectedTemp, setSelectedTemp } = useRoleLayout();
  const [noMenu, setNoMenu] = useState<MenuData[]>([]);
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [node, setNode] = useState<Party>();

  const hasFetched = useRef(false);

  const fetchAvailableMenus = async (partyId: number | undefined) => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/portals/portals/${selectedRow?.roleId ?? 0}/party/${partyId ?? 0}/menus`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      // console.log(res);
      setAvailableComponents(res.data);
    } catch (error: any) {
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchCompNoMenus = async () => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/roles/menus/${selectedRow?.roleId}/nomenu/components`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      // console.log(res.data);

      // console.log(temp);

      setNoMenu(res.data);
    } catch (error: any) {
      new Error(error.message || "Error fetching available menus");
      // return Mock;
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  // const fetchPortalMenus = async (roleId: number | null) => {
  //   try {
  //     const res = await GetData(
  //       `${API_ROLE}/api/common/roles/${roleId}/portals`,
  //       {}
  //     );
  //     if (!res?.status || !res?.data) {
  //       throw new Error(
  //         res?.message || "Failed to fetch available portal data"
  //       );
  //     }
  //   //  console.log(res.data);

  //     return res.data;
  //   } catch (error: any) {
  //     throw new Error(error.message || "Error fetching available menus");
  //   }
  // };

  const fetchOwnedMenus = async (roleId: number | null) => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/roles/menus/${roleId}/components`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(res?.message || "Failed to fetch owned portal data");
      }
      return res.data;
    } catch (error: any) {
      throw new Error(error.message || "Error fetching owned menus");
    }
  };

  const fetchAll = async () => {
    if (selectedRow != null)
      try {
        setLoading(true);
        fetchAvailableMenus(node?.partyId);

        const [owned] = await Promise.all([
          fetchOwnedMenus(selectedRow.roleId),
          // fetchPortalMenus(selectedRow.roleId),
        ]);
        // Replace with `setAvailableMenus(available)` if you want live data
        setOwnedComponents(owned);
        // setPortals(portal);
        setLastUpdated(Date.now());
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
        // console.log();
      }
  };

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  useEffect(() => {
    if (selectedRow != null)
      if (!hasFetched.current || selectedTemp != selectedRow) {
        // console.log(!hasFetched.current, selectedTemp != selectedRow);

        hasFetched.current = true;
        setSelectedTemp(selectedRow);
        fetchCompNoMenus();
        fetchAll();
      }
    // console.log(noMenu);
  }, [selectedRow]);

  return (
    <CompListContext.Provider
      value={{
        components,
        loading,
        error,
        availableComponents,
        setAvailableComponents,
        ownedComponents,
        lastUpdated,
        selectedAvailable,
        setSelectedAvailable,
        selectedOwned,
        setSelectedOwned,
        showEditDialog,
        handleEditDialog,
        isEditing,
        setIsEditing,
        fetchAll,
        portals,
        node,
        setNode,
        fetchAvailableMenus,
        noMenu,
        setNoMenu,
      }}
    >
      {children}
    </CompListContext.Provider>
  );
};
