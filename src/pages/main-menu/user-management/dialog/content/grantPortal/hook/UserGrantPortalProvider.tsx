import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallApi } from "@/hooks";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { toast } from "sonner";
import { useUserManagement } from "@/pages/main-menu/user-management/hook/useUserManagemet";
import { apiConfigRole } from "@/config/api.config";

interface UserGrantPortalContextType {
  rows: PortalData[];
  loading: boolean;
  error: string | null;
  availablerows: PortalData[];
  setAvailablerows: Dispatch<SetStateAction<PortalData[] | []>>;
  ownedrows: PortalData[];
  setOwnedrows: Dispatch<SetStateAction<PortalData[] | []>>;
  lastUpdated: any;
  selectedAvailable: PortalData[];
  setSelectedAvailable: Dispatch<SetStateAction<PortalData[]>>;
  selectedOwned: PortalData[];
  setSelectedOwned: Dispatch<SetStateAction<PortalData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
  fetchAll: () => void;
  fetchrows: () => any;
  fetchUserrows: () => any;
}

const API_URL = apiConfigRole.role;

export const UserGrantPortalContext = createContext<
  UserGrantPortalContextType | undefined
>(undefined);

export const UserGrantPortalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rows, setrows] = useState<PortalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablerows, setAvailablerows] = useState<PortalData[]>([]);
  const [ownedrows, setOwnedrows] = useState<PortalData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<PortalData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<PortalData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);
  const { GetData } = useCallApi();

  const { selectedRow } = useUserManagement();
  const hasFetch = useRef(false);

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  const fetchrows = async () => {
    try {
      setError(null);
      const response = await GetData(`${API_URL}/api/portals/portals`, {});

      //  console.log(response);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch portals data");
      }
      // setAvailableroles(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch portals");
      return [];
    }
  };

  const fetchUserrows = async () => {
    try {
      setError(null);
      const response = await GetData(
        `${API_URL}/api/users/${selectedRow?.userId}/user/portals`,
        {},
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }
      // setAvailableroles(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch roles");
      return [];
    }
  };

  const fetchRolePortals = async () => {
    try {
      setError(null);
      const response = await GetData(
        `${API_URL}/api/users/${selectedRow?.userId}/role/portals`,
        {},
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch data");
      }
      // setAvailableroles(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch data");
      return [];
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const avarows = await fetchrows();
      const ownrows = await fetchUserrows();
      const userRoles = await fetchRolePortals();

      // console.log(ownrows);

      // Assuming rows have a unique identifier (e.g. roleId)
      const ownedIds = new Set(ownrows.map((r: any) => r.portalId));

      const filteredAvailable = avarows.filter(
        (portal: any) => !ownedIds.has(portal.portalId),
      );

      // setrows(userRoles);
      setAvailablerows(filteredAvailable);
      setOwnedrows([...userRoles, ...ownrows]);
      setLastUpdated(Date.now());
    } catch (error) {
      toast.error("Failed to fetch user rows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetch.current) {
      fetchAll();
      hasFetch.current = true;
    }
  }, []);

  return (
    <UserGrantPortalContext.Provider
      value={{
        rows,
        loading,
        error,
        availablerows,
        setAvailablerows,
        ownedrows,
        setOwnedrows,
        lastUpdated,
        selectedAvailable,
        setSelectedAvailable,
        selectedOwned,
        setSelectedOwned,
        showEditDialog,
        handleEditDialog,
        isEditing,
        setIsEditing,
        countAva,
        setCountAva,
        countOwned,
        setCountOwned,
        fetchAll,
        fetchrows,
        fetchUserrows,
      }}
    >
      {children}
    </UserGrantPortalContext.Provider>
  );
};
