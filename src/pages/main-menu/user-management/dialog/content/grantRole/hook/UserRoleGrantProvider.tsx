import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { RoleSPID } from "@/pages/main-menu/role-management/component/sideBarListContextTable";
import { useCallApi } from "@/hooks";
import { PageDto } from "@/pages/main-menu/user-management/main";
import { toast } from "sonner";
import { useUserManagement } from "@/pages/main-menu/user-management/hook/useUserManagemet";
import { apiConfigRole } from "@/config/api.config";

interface UserRoleGrantContextType {
  roles: RoleSPID[];
  loading: boolean;
  error: string | null;
  availableroles: RoleSPID[];
  setAvailableroles: Dispatch<SetStateAction<RoleSPID[] | []>>;
  ownedroles: RoleSPID[];
  setOwnedroles: Dispatch<SetStateAction<RoleSPID[] | []>>;
  lastUpdated: any;
  selectedAvailable: RoleSPID[];
  setSelectedAvailable: Dispatch<SetStateAction<RoleSPID[]>>;
  selectedOwned: RoleSPID[];
  setSelectedOwned: Dispatch<SetStateAction<RoleSPID[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
  fetchAll: () => void;
  fetchRoles: () => any;
  fetchUserRoles: () => any;
}

const API_ROLE = apiConfigRole.role;

export const UserRoleGrantContext = createContext<
  UserRoleGrantContextType | undefined
>(undefined);

export const UserRoleGrantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [roles, setRoles] = useState<RoleSPID[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableroles, setAvailableroles] = useState<RoleSPID[]>([]);
  const [ownedroles, setOwnedroles] = useState<RoleSPID[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<RoleSPID[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<RoleSPID[]>([]);
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

  const fetchRoles = async () => {
    try {
      setError(null);
      const response = await GetData(
        `${API_ROLE}/api/common/roles/role-list`,
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

  const fetchUserRoles = async () => {
    try {
      setError(null);
      const response = await GetData(
        `${API_ROLE}/api/prod/users/${selectedRow?.userId}/roles`,
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
  const fetchAll = async () => {
    setLoading(true);
    try {
      const avaRoles = await fetchRoles();
      const ownRoles = await fetchUserRoles();

      // Assuming roles have a unique identifier (e.g. roleId)
      const ownedIds = new Set(ownRoles.map((r: any) => r.roleId));

      const filteredAvailable = avaRoles.filter(
        (role: any) => !ownedIds.has(role.roleId),
      );

      setAvailableroles(filteredAvailable);
      setOwnedroles(ownRoles);
      setLastUpdated(Date.now());
    } catch (error) {
      toast.error("Failed to fetch user roles");
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
    <UserRoleGrantContext.Provider
      value={{
        roles,
        loading,
        error,
        availableroles,
        setAvailableroles,
        ownedroles,
        setOwnedroles,
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
        fetchRoles,
        fetchUserRoles,
      }}
    >
      {children}
    </UserRoleGrantContext.Provider>
  );
};
