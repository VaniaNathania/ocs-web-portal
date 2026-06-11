import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigLog } from "@/config/api.config";
import { useAuthContext } from "@/auth";

export interface UserMData {
  logId: number;
  logType: string | null;
  serviceName: string | null;
  contactChannel: string | null;
  logDate: string;
  subsId: string | null;
  custId: string | null;
  eventSrc: string;
  remarks: string;
  comments: string;
  partyType: string | null;
  partyCode: string | null;
  eventType: string;
  eventCode: string;
  spId: string | null;
  logTimestamp: string | null;
  srcIp?: string;
  userName?: string;
}

export interface UserMQuery {
  logId: string | null;
  eventType: string | null;
  comments: string | null;
  startTime: string | null;
  endTime: string | null;
  srcIp: string | null;
  civilId: string | null;
  eventCode: string | null;
  page: number | null;
  size: number | null;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface ReasonsForm {
  opReason: string;
}

interface LogManagementContextType {
  user: UserMData[];
  setUser: React.Dispatch<React.SetStateAction<UserMData[]>>;
  selectedRow: UserMData | undefined;
  setSelectedRow: React.Dispatch<React.SetStateAction<UserMData | undefined>>;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  fetchUser: (data?: Partial<UserMQuery>) => void;
  showGrantLoginLog: boolean;
  setShowGrantLoginLog: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantSystemLog: boolean;
  setShowGrantSystemLog: React.Dispatch<React.SetStateAction<boolean>>;
  showGrantAuditLog: boolean;
  setShowGrantAuditLog: React.Dispatch<React.SetStateAction<boolean>>;
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
  onConfirm: (() => void) | undefined;
  setOnConfirm: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  desc: string;
  setDesc: React.Dispatch<React.SetStateAction<string>>;
  query: UserMQuery;
  setQuery: React.Dispatch<React.SetStateAction<UserMQuery>>;
  total: number;
  reFunc: (() => void) | undefined;
  setReFunc: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  reDesc: string;
  setReDesc: React.Dispatch<React.SetStateAction<string>>;
}

export const LogManagementContext = createContext<LogManagementContextType>({
  user: [],
  setUser: () => {},
  selectedRow: undefined,
  setSelectedRow: () => {},
  loading: false,
  error: null,
  lastUpdated: Date.now(),
  fetchUser: () => {},
  showGrantLoginLog: false,
  setShowGrantLoginLog: () => {},
  showGrantSystemLog: false,
  setShowGrantSystemLog: () => {},
  showGrantAuditLog: false,
  setShowGrantAuditLog: () => {},
  showExport: false,
  setShowExport: () => {},
  showIPLimit: false,
  setShowIPLimit: () => {},
  showGrantDataPrivelage: false,
  setShowGrantDataPrivelage: () => {},
  showEditPass: false,
  setShowEditPass: () => {},
  showUnlockAcc: false,
  setShowUnlockAcc: () => {},
  showConfirm: false,
  setShowConfirm: () => {},
  showReasonDialog: false,
  setShowReasonDialog: () => {},
  onConfirm: undefined,
  setOnConfirm: () => {},
  desc: "",
  setDesc: () => {},
  query: {
    page: 1,
    size: 10,
    sortBy: "logDate",
    sortDirection: "desc",
    logId: null,
    comments: null,
    startTime: null,
    endTime: null,
    srcIp: null,
    civilId: null,
    eventType: null,
    eventCode: null,
  },
  setQuery: () => {},
  total: 0,
  reFunc: undefined,
  setReFunc: () => {},
  reDesc: "",
  setReDesc: () => {},
});

const API_URL = apiConfigLog;

export const LogManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const { userData } = useAuthContext();
  const [user, setUser] = useState<UserMData[]>([]);
  const [selectedRow, setSelectedRow] = useState<UserMData | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [showGrantLoginLog, setShowGrantLoginLog] = useState(false);
  const [showGrantSystemLog, setShowGrantSystemLog] = useState(false);
  const [showGrantAuditLog, setShowGrantAuditLog] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showIPLimit, setShowIPLimit] = useState(false);
  const [showGrantDataPrivelage, setShowGrantDataPrivelage] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);
  const [showUnlockAcc, setShowUnlockAcc] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>(
    undefined,
  ); // ✅ UBAH type
  const [desc, setDesc] = useState("");
  const [reFunc, setReFunc] = useState<(() => void) | undefined>(undefined);
  const [reDesc, setReDesc] = useState("");
  const [total, setTotal] = useState<number>(0);

  const [query, setQuery] = useState<UserMQuery>({
    page: 1,
    size: 10,
    sortBy: "logDate",
    sortDirection: "desc",
    logId: null,
    comments: null,
    startTime: null,
    endTime: null,
    srcIp: null,
    civilId: null,
    eventType: "login",
    eventCode: null,
  });

  const fetchUser = async (data: Partial<UserMQuery> = {}) => {
    setLoading(true);
    setError(null);

    const user = userData();

    const mergedQuery = {
      ...query,
      ...data,
    };

    const payload = {
      search: "",
      page: mergedQuery.page || 1,
      size: mergedQuery.size || 10,
      sortBy: mergedQuery.sortBy || "logDate",
      sortDirection: mergedQuery.sortDirection || "asc",
      eventType: mergedQuery.eventType || null,
      eventCode: mergedQuery.eventCode || null,
      comments: mergedQuery.comments || null,
      userId: user?.user.id,
      // logid: mergedQuery.logId || null,
      // sourceIp: mergedQuery.srcIp || null,
      // civilId: mergedQuery.civilId || null,
      // startTime: mergedQuery.startTime || null,
      // endTime: mergedQuery.endTime || null,
    };

    try {
      const url = `${API_URL}/api/log-management/sytem-log-list`;

      //  console.log("🔄 Fetching URL:", url);

      const response = await GetData(url, payload);

      //  console.log("📦 Response:", response);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch user data");
      }

      const responseData = response?.data || [];
      const totalCount = response?.totalRows || 0;

      setUser(responseData);
      setTotal(totalCount);

      if (responseData.length > 0) {
        setSelectedRow(responseData[0]);
      } else {
        setSelectedRow(undefined);
      }

      setLastUpdated(Date.now());
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setUser([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const hasFetch = useRef(false);
  const queryChange = useRef(false);

  useEffect(() => {
    if (hasFetch.current) {
      if (queryChange.current) {
        fetchUser();
      } else {
        queryChange.current = true;
      }
    }
  }, [query]);

  useEffect(() => {
    if (!hasFetch.current) {
      fetchUser();
      hasFetch.current = true;
    }
  }, []);

  return (
    <LogManagementContext.Provider
      value={{
        user,
        setUser,
        selectedRow,
        setSelectedRow,
        loading,
        error,
        lastUpdated,
        fetchUser,
        showGrantLoginLog,
        setShowGrantLoginLog,
        showGrantSystemLog,
        setShowGrantSystemLog,
        showGrantAuditLog,
        setShowGrantAuditLog,
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
      }}
    >
      {children}
    </LogManagementContext.Provider>
  );
};
