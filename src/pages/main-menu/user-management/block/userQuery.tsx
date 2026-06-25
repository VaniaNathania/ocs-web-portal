import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement } from "../hook/useUserManagemet";
import { UserMQuery } from "../hook/UserManagementProvider";
import { X } from "lucide-react";
import { useCallApi } from "@/hooks";
import { PortalData } from "../../role-management/outlet/portal/hook/PortalProvider";
import { DefaultTooltip } from "@/components";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

// default empty query
const defaultQuery: UserMQuery = {
  userName: null,
  userCode: null,
  portalId: null,
  state: null,
  isLocked: null,
  userType: null,
  search: null,
  page: 1,
  size: 5,
  sortBy: "userName",
  sortDirection: "asc",
};

export const UserQuery = () => {
  const { setQuery, query: currentQuery } = useUserManagement();
  const [portals, setPortals] = useState<PortalData[]>();
  const { GetData } = useCallApi();
  const [loading, setLoading] = useState<boolean>();
  const hasFetch = useRef(false);

  // local form state
  const [formQuery, setFormQuery] = useState<UserMQuery>(defaultQuery);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if form has unsaved changes
  useEffect(() => {
    const isChanged =
      JSON.stringify(formQuery) !== JSON.stringify(currentQuery);
    setHasUnsavedChanges(isChanged);
  }, [formQuery, currentQuery]);

  const handleChange = <K extends keyof UserMQuery>(
    key: K,
    val: Partial<UserMQuery>[K] | null,
  ) => {
    setFormQuery((prev) => ({ ...prev, [key]: val }));
  };

  const fetchPortalList = async () => {
    setLoading(true);
    try {
      const response = await GetData(`${API_ROLE}/api/portals/portals`, {});

      if (!response.status) {
        throw Error(response.message);
      }

      setPortals(response.data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetch.current) {
      fetchPortalList();
      hasFetch.current = true;
    }
  }, []);

  const handleReset = () => {
    setFormQuery(defaultQuery);
    setQuery(defaultQuery);
    setHasUnsavedChanges(false);
  };

  const handleSubmit = () => {
    setQuery(formQuery);
    setHasUnsavedChanges(false);
  };
};
