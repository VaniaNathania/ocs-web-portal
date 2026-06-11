import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { apiConfigRole } from "@/config/api.config";

export interface App {
  appId: number;
  comments: string | null;
  spId: string | null;
  appCode: string;
  iconPath: string | null;
  appName: string;
  appUrl: string;
  state: string;
  stateDate: string;
}

interface AppListContextType {
  apps: App[];
  loading: boolean;
  error: string | null;
}

export const AppListContext = createContext<AppListContextType | undefined>(
  undefined,
);

const API_ROLE = apiConfigRole.role;

export const AppListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  //   const UrlApiApps = API_URL + "/apps/apps";
  const { GetData } = useCallApi();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchApps = async () => {
    try {
      // const res = await fetch(UrlApiApps);
      // const json = await res.json();

      const response = await GetData(`${API_ROLE}/api/apps/apps`, {});

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }
      setApps(response.data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      toast.error(err.message || "Failed to fetch apps");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchApps();
    }
  }, []);

  return (
    <AppListContext.Provider value={{ apps, loading, error }}>
      {children}
    </AppListContext.Provider>
  );
};
