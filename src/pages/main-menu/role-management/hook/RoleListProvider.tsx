import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { RoleSPID } from "../component/sideBarListContextTable";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { toast } from "sonner";
import { apiConfigRole } from "@/config/api.config";

interface RoleListContextType {
  roles: RoleSPID[];
  loading: boolean;
  error: string | null;
  fetchRoles: any;
  lastUpdated: any;
}

export const RoleListContext = createContext<RoleListContextType | undefined>(
  undefined,
);

const API_ROLE = apiConfigRole.role;

export const RoleListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const [roles, setRoles] = useState<RoleSPID[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { menuPrivAccess } = useRoleLayout();
  const hasFetched = useRef(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await GetData(
        `${API_ROLE}/api/common/roles/role-list`,
        {},
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }
      setRoles(response.data);
      // setSelectedRow(response.data[1]);
      setLastUpdated(Date.now());
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRoles();
    }
  }, []);
  return (
    <RoleListContext.Provider
      value={{ roles, loading, error, fetchRoles, lastUpdated }}
    >
      {children}
    </RoleListContext.Provider>
  );
};
