import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { apiConfig, apiConfigRole } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { UserMData } from "@/pages/main-menu/user-management/hook/UserManagementProvider";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface Password {
  password: string;
  retype_password: string;
  username: string;
  current_password: string;
}

export interface Profile {
  name?: string;
  email?: string;
  username?: string;
}

interface ContextProps {
  password: Password | null;
  profile: Profile | null;
  setPassword: (password: Password) => Promise<void>;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
}

const initialProps: ContextProps = {
  profile: null,
  password: null,
  setPassword: async () => {},
  setProfile: () => {},
};

const AccountUserProfileContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_price_plan;
const API_ROLE = apiConfigRole.role;

const AccountUserProfileContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* state */
  const { userData } = useAuthContext();
  const { GetData, PutData, PostData } = useCallApi();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [password, setPassword] = useState<Password | null>(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const fetchInitialDataUseQuery = async (): Promise<UserMData | undefined> => {
    // setLoading(true);

    const payload: any = {
      search: "",
      page: 1,
      size: 1,
      sortBy: "userId",
      sortDirection: "asc",
      userName: userData()?.user.name,
      userCode: userData()?.user.code,
    };
    // return undefined;
    try {
      const response = await GetData(
        `${API_ROLE}/api/prod/users/list`,
        payload,
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch user data");
      }

      const responseData = response?.data.body.data;
      let list: UserMData[] = [];
      let totalCount = 0;

      if (responseData) {
        // Coba berbagai kemungkinan struktur data
        list =
          responseData.list ||
          responseData.data ||
          responseData.content ||
          responseData ||
          [];
        totalCount =
          responseData.totalElements ||
          response.totalRows ||
          responseData.totalCount ||
          responseData.total ||
          responseData.count ||
          (Array.isArray(list) ? list.length : 0);
      }

      return list[0];
    } catch (error) {
      console.error(error);

      return undefined;
      //  console.log("error fetching user");
    } finally {
      // setLoading(false);
    }
  };

  const AdvInfoUseQuery: UseQueryResult<UserMData | undefined> = useQuery({
    queryKey: ["profile-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setProfile({
      email: AdvInfoUseQuery.data?.email ?? "",
      name: AdvInfoUseQuery.data?.userName,
      username: AdvInfoUseQuery.data?.userName,
    });
  }, [AdvInfoUseQuery.status]);

  const handleSetPassword = async (newPassword: Password) => {
    setPassword(newPassword);

    const handleError = (error: any, defaultMessage: string) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || defaultMessage;
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    };

    try {
      const validate = await PostData(`${API_URL}/login`, {
        password: newPassword.current_password,
        username: newPassword.username,
        application: "edc",
      });

      if (!validate || !validate.status) {
        toast.error("Current password validation failed.");
        return;
      }

      const response = await PutData(`${API_URL}/user/update_password`, {
        password: newPassword.password,
        retype_password: newPassword.retype_password,
      });

      if (response && response.status) {
        toast.success("Password updated successfully!");
      } else {
        toast.error(response?.message || "Failed to update password.");
      }
    } catch (error: any) {
      handleError(error, "Failed to update password. Please try again.");
    }
  };

  const handleSetProfile = async (newProfile: Profile) => {
    try {
      setProfile(newProfile);

      const response = await PutData(`${API_URL}/user/update_profile/`, {
        name: newProfile.name,
        email: newProfile.email,
        username: newProfile.username,
      });

      toast.success("Profile updated successfully.");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to update Profile. Please try again.";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <AccountUserProfileContext.Provider
      value={{
        password,
        profile,
        setPassword: handleSetPassword,
        setProfile,
      }}
    >
      {children}
    </AccountUserProfileContext.Provider>
  );
};

export { AccountUserProfileContextProvider, AccountUserProfileContext };
