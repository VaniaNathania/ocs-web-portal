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

  return (
    <div className="flex flex-col bg-white m-5 rounded-md shadow-md p-5 space-y-2 border-2">
      {/* Row 1 */}
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-5 w-full">
        {/* User Name */}
        <div className="flex flex-col flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700">
            User Name
          </label>
          <Input
            type="text"
            placeholder="Enter User name"
            autoComplete="off"
            className=""
            value={formQuery.userName ?? ""}
            onChange={(e) => handleChange("userName", e.target.value)}
          />
        </div>

        {/* User Code */}
        <div className="flex flex-col flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700">
            User Code
          </label>
          <Input
            type="text"
            placeholder="Enter User code"
            autoComplete="off"
            className=""
            value={formQuery.userCode ?? ""}
            onChange={(e) => handleChange("userCode", e.target.value)}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-5 w-full">
        {/* State */}
        <div className="flex flex-col flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <div className=" flex items-center space-x-2">
            <Select
              onValueChange={(val) => handleChange("state", val)}
              value={formQuery.state || ""}
            >
              <SelectTrigger className="w-full px-2 py-1 text-sm h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Active</SelectItem>
                <SelectItem value="X">Non Active</SelectItem>
              </SelectContent>
            </Select>
            {formQuery.state && (
              <DefaultTooltip placement="top" title="Clear State">
                <X
                  onClick={() => handleChange("state", "")}
                  className="cursor-pointer"
                />
              </DefaultTooltip>
            )}
          </div>
        </div>

        {/* Is Locked */}
        <div className="flex flex-col flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700">
            Is Locked
          </label>
          <div className=" flex items-center space-x-2">
            <Select
              onValueChange={(val) => handleChange("isLocked", val)}
              value={formQuery.isLocked || ""}
            >
              <SelectTrigger className="w-full px-2 py-1 text-sm h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Yes</SelectItem>
                <SelectItem value="N">No</SelectItem>
              </SelectContent>
            </Select>
            {formQuery.isLocked && (
              <DefaultTooltip placement="top" title="Clear Lock Status">
                <X
                  onClick={() => handleChange("isLocked", "")}
                  className="cursor-pointer"
                />
              </DefaultTooltip>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full flex justify-end space-x-2 mt-5">
        <Button variant="default" onClick={() => handleSubmit()}>
          FIlter
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};
