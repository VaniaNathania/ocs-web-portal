import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRole } from "@/config/api.config";
import { toast } from "sonner";
import { useRoleCheck } from "../../role-management/hook/useRoleCheck";
import { getData } from "@/utils";
import { AUTH_LOCAL_STORAGE_KEY } from "@/auth";

export interface UserMData {
  userId: number | null; // 1002
  userName: string; // "LinkTEST222"
  userCode: string; // "Link_T"
  pwd?: string; // ""
  userEffDate: string; // "2024-12-02 14:17:43"
  userExpDate: string;
  createdDate?: string | null; // "2024-12-02 14:17:43"
  lastLoginDate?: string | null; // "2024-12-02 14:27:23"
  state: string; // "A"
  stateDate?: string; // "2024-12-02 14:17:43"
  isLocked: string; // "N"
  loginFail: number; // 0
  unlockDate?: string | null; // "2024-12-02 14:28:37"
  portalId: number; // 1042
  portalName: string; // "test1202"
  updateDate?: string | null; // "2024-12-11 11:16:59"
  bsnlPms?: boolean; // false
  nullAble?: boolean; // false
  exist?: boolean; // false
  userType: string; // "BSS"
  email?: string;
  phone?: string;
  address?: string;
  memo?: string;
  pwdExpDate?: string; // "2025-08-20"
  isEffectiveNow?: string; // ""
  orderFields?: string; // ""
  openId?: string; // ""
  alias?: string; // ""
  securityQuestionId?: number; // 0
  securityAnswer?: string; // ""
  thumbnailUri?: string; // ""
  extAttr?: string; // ""
  stateNotEquals?: string; // ""
  userTypeName?: string; // ""
  userStateName?: string; // ""
  roleNameListStr?: string; // ""
  roleIdListStr?: string; // ""
  srcId?: number; // 0
  roleId?: number; // 0
  loginIp?: string; // ""
  passwordExist?: boolean; // false
  createdId?: number; // 0
  headImg?: string; // ""
  circle?: string; // ""
  orgId?: number; // 0
  circleName?: string; // ""
  zoneName?: string; // ""
}

export interface UserMQuery {
  userName: string | null;
  portalId: number | null;
  state: string | null;
  userCode: string | null;
  isLocked: string | null;
  userType: string | null;
  search: string | null;
  page: number | null;
  size: number | null;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface ReasonsForm {
  opReason: string;
}

export interface UserLoginData {
  id: number;
  name: string;
}

export const UserManagementContext = createContext<
  UserManagementContextType | undefined
>(undefined);

interface UserManagementContextType {
  user: UserMData[];
  setUser: React.Dispatch<React.SetStateAction<UserMData[]>>;
  selectedRow: UserMData | undefined;
  setSelectedRow: React.Dispatch<React.SetStateAction<UserMData | undefined>>;
  loading: boolean;
  error: string | null;
  lastUpdated: any;
  fetchUser: (data?: Partial<UserMQuery>) => void;
  showGrantRole: boolean;
  setShowGrantRole: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantPortal: boolean;
  setShowGrantPortal: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantMenu: boolean;
  setShowGrantMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantComp: boolean;
  setShowGrantComp: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantPortlet: boolean;
  setShowGrantPortlet: React.Dispatch<React.SetStateAction<boolean>>;
  showUserHistory: boolean;
  setShowUserHistory: React.Dispatch<React.SetStateAction<boolean>>;
  showExport: boolean;
  setShowExport: React.Dispatch<React.SetStateAction<boolean>>;
  showIPLimit: boolean;
  setShowIPLimit: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantDataPrivelage: boolean;
  setShowGrantDataPrivelage: React.Dispatch<React.SetStateAction<boolean>>;
  showEditPass: boolean;
  setShowEditPass: React.Dispatch<React.SetStateAction<boolean>>;
  showUnlockAcc: boolean;
  setShowUnlockAcc: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  showReasonDialog: boolean;
  setShowReasonDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: any;
  setOnConfirm: React.Dispatch<React.SetStateAction<any>>;
  desc: string;
  setDesc: React.Dispatch<React.SetStateAction<string>>;
  query: Partial<UserMQuery> | undefined;
  setQuery: React.Dispatch<React.SetStateAction<UserMQuery>>;
  total: number;
  reFunc: any;
  setReFunc: React.Dispatch<React.SetStateAction<any>>;
  reDesc: string;
  setReDesc: React.Dispatch<React.SetStateAction<string>>;
  fetchUserExport: () => void;
}

const API_URL = apiConfigRole.role;
export const UserManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authData = getData(AUTH_LOCAL_STORAGE_KEY);
  const userData: UserLoginData = authData?.user;
  const { GetData, GetExport } = useCallApi();
  const [user, setUser] = useState<UserMData[]>([]);
  const [selectedRow, setSelectedRow] = useState<UserMData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const [showGrantRole, setShowGrantRole] = useState(false);
  const [showGrantPortal, setShowGrantPortal] = useState(false);
  const [showGrantMenu, setShowGrantMenu] = useState(false);
  const [showGrantComp, setShowGrantComp] = useState(false);
  const [showGrantPortlet, setShowGrantPortlet] = useState(false);
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showIPLimit, setShowIPLimit] = useState(false);
  const [showGrantDataPrivelage, setShowGrantDataPrivelage] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);
  const [showUnlockAcc, setShowUnlockAcc] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [onConfirm, setOnConfirm] = useState();
  const [desc, setDesc] = useState("");
  const [reFunc, setReFunc] = useState();
  const [reDesc, setReDesc] = useState("");

  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    console.log("USER ID: ", userData);
  }, []);

  const [query, setQuery] = useState<UserMQuery>({
    search: null,
    page: 1,
    size: 5,
    sortBy: "userName",
    sortDirection: "asc",
    userName: null,
    userCode: null,
    portalId: null,
    state: null,
    isLocked: null,
    userType: null,
  });

  const fetchUser = async (data: Partial<UserMQuery> = {}) => {
    setLoading(true);

    const payload: any = {
      ...query,
      ...data,
      isLock: data.isLocked ?? query.isLocked,
    };
    try {
      const response = await GetData(`${API_URL}/api/prod/users/list`, payload);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch user data");
      }

      const responseData = response?.data.body.data;
      let list = [];
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
      // setUser(MockUserMData);
      // console.log(responseData.totalElements);
      setUser(list);
      setTotal(totalCount);
      setSelectedRow(list[0]);
    } catch (error) {
      //  console.log("error fetching user");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExport = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: userData?.id,
        state: "A",
      };
      const response = await GetExport(
        `${API_URL}/api/users/export-users`,
        payload,
        "Users Data",
      );

      if (!response?.status) {
        toast.error(response?.message || "Something went wrong!");
      }

      toast.success(response.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasFetch = useRef(false);
  const queryChange = useRef(false);

  useEffect(() => {
    if (hasFetch.current) {
      if (queryChange.current) fetchUser();
      else queryChange.current = true;
    }
  }, [query]);
  useEffect(() => {
    if (!hasFetch.current) {
      fetchUser();
      hasFetch.current = true;
    }
  }, []);

  return (
    <UserManagementContext.Provider
      value={{
        user,
        setUser,
        selectedRow,
        setSelectedRow,
        loading,
        error,
        lastUpdated,
        fetchUser,
        showGrantRole,
        setShowGrantRole,
        showGrantPortal,
        setShowGrantPortal,
        showGrantMenu,
        setShowGrantMenu,
        showGrantComp,
        setShowGrantComp,
        showGrantPortlet,
        setShowGrantPortlet,
        showUserHistory,
        setShowUserHistory,
        showExport,
        setShowExport,
        showIPLimit,
        setShowIPLimit,
        showGrantDataPrivelage,
        setShowGrantDataPrivelage,
        showEditPass,
        setShowEditPass,
        showUnlockAcc,
        setShowUnlockAcc,
        showConfirm,
        setShowConfirm,
        showReasonDialog,
        setShowReasonDialog,
        onConfirm,
        setOnConfirm,
        desc,
        setDesc,
        query,
        setQuery,
        total,
        reFunc,
        setReFunc,
        reDesc,
        setReDesc,
        fetchUserExport,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
};
