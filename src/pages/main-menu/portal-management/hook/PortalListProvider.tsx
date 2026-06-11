import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import {
  PortalMgrCompData,
  usePortalLayout,
} from "@/layouts/main-menu/portal-management";
import { apiConfigRole } from "@/config/api.config";

interface PortalListContextType {
  rows: PortalMgrCompData[];
  loading: boolean;
  error: string | null;
  fetchRows: any;
  lastUpdated: any;
}

export const PortalListContext = createContext<
  PortalListContextType | undefined
>(undefined);

const API_URL = apiConfigRole.role;

export const PortalListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const [rows, setRows] = useState<PortalMgrCompData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { setSelectedRow } = usePortalLayout();
  const hasFetched = useRef(false);

  const fetchRows = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await GetData(`${API_URL}/api/portals/portals`, {});

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch portals data");
      }
      // setAvailableroles(response.data);
      setRows(response.data);
      // return response.data
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch portals");
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRows();
    }
  }, []);
  return (
    <PortalListContext.Provider
      value={{ rows, loading, error, fetchRows, lastUpdated }}
    >
      {children}
    </PortalListContext.Provider>
  );
};
