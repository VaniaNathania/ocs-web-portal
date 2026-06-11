import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { MenuData } from "../menuInterfaces";
import { useCallApi } from "@/hooks";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { PortalData } from "../../portal/hook/PortalProvider";
import { Directory } from "../block/Directory";
import { toast } from "sonner";
import { apiConfigRole } from "@/config/api.config";

// Context Type
interface MenuListContextType {
  menus: MenuData[];
  loading: boolean;
  error: string | null;
  availableMenus: MenuData[];
  ownedMenus: MenuData[];
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
  dir?: Directory;
  setDir: Dispatch<SetStateAction<Directory | undefined>>;
  option?: Boolean;
  setOption: Dispatch<SetStateAction<Boolean>>;
  fetchAvailableMenus: (
    partyId: number | undefined,
    portalId: number | undefined,
  ) => Promise<void>;
  fetchAvailableMenusDir: (dirId: number | undefined) => Promise<void>;
}

const API_ROLE = apiConfigRole.role;

export interface Party {
  portalId: number;
  partyId: number;
  partyName: string;
  isChild?: boolean;
  parentId?: number;
  level?: number; // To control indentation
  seq?: number;
  type?: string;
  index?: string;
}

// Create context
export const MenuListContext = createContext<MenuListContextType | undefined>(
  undefined,
);

// Provider
export const MenuListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableMenus, setAvailableMenus] = useState<MenuData[]>([]);
  const [ownedMenus, setOwnedMenus] = useState<MenuData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<MenuData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<MenuData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { GetData } = useCallApi();
  const { selectedRow, selectedTemp, setSelectedTemp, menuPrivAccess } =
    useRoleLayout();
  const [portals, setPortals] = useState<PortalData[]>([]);
  const [node, setNode] = useState<Party>();
  const [dir, setDir] = useState<Directory>();
  const [option, setOption] = useState<Boolean>(false);

  const hasFetched = useRef(false);

  const fetchAvailableMenusDir = async (dirId: number | undefined) => {
    // console.log(dirId);

    try {
      const res = await GetData(
        `${API_ROLE}/api/roles/dirs/${dirId}/menus`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      const unique: MenuData[] = [
        ...new Map<number, MenuData>(
          res.data.map((item: MenuData) => [item.privId, item]),
        ).values(),
      ];

      // console.log(res);
      setAvailableMenus(unique);
    } catch (error: any) {
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchAvailableMenus = async (
    partyId: number | undefined,
    portalId: number | undefined,
  ) => {
    // console.log(portalId, partyId);

    try {
      const res = await GetData(
        `${API_ROLE}/api/portals/portals/${portalId ?? 0}/party/${partyId && partyId >= 1 ? partyId : 0}/menus`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      // console.log(res);
      setAvailableMenus(res.data);
    } catch (error: any) {
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchPortalMenus = async (roleId: number | null) => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/common/roles/${roleId}/portals`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      // console.log(res.data);

      return res.data;
    } catch (error: any) {
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchOwnedMenus = async (roleId: number | null) => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/roles/menus/${roleId}/menus`,
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
    setLoading(true);
    if (selectedRow != null)
      try {
        fetchAvailableMenus(node?.partyId, node?.portalId);

        const [owned, portal] = await Promise.all([
          fetchOwnedMenus(selectedRow.roleId),
          fetchPortalMenus(selectedRow.roleId),
        ]);

        // console.log(owned);
        // console.log(portal);

        // Replace with `setAvailableMenus(available)` if you want live data
        setOwnedMenus(owned);
        setPortals(portal);
        setLastUpdated(Date.now());
      } catch (err: any) {
        setError(err.message || "Unknown error");
        toast.error("Failed to fetch data");
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
        hasFetched.current = true;
        setSelectedTemp(selectedRow);
        fetchAll();
      }
    // console.log(menuPrivAccess);
  }, [selectedRow]);

  return (
    <MenuListContext.Provider
      value={{
        menus,
        loading,
        error,
        availableMenus,
        ownedMenus,
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
        dir,
        setDir,
        option,
        setOption,
        fetchAvailableMenus,
        fetchAvailableMenusDir,
      }}
    >
      {children}
    </MenuListContext.Provider>
  );
};
