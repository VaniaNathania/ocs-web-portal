import { createContext, useState } from "react";
import AdviceMonitorTable from "../components/AdviceMonitorTable";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface ContextProps {
  menuPrivAccess: menuAccess;
  data: any;
}

const InitialProps: ContextProps = {
  menuPrivAccess: {
    addStatus: false,
    editStatus: false,
    deleteStatus: false,
    readStatus: false,
  },
  data: [],
};

const AdviceMonitorListContext = createContext<ContextProps>(InitialProps);

const AdviceMonitorContextListProvider = () => {
  const { checkMenusPriv } = useRoleCheck();
  const [data, setData] = useState<any[]>([]);
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-monitor/AdviceMonitorPage",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-monitor/AdviceMonitorPage",
      "editStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-monitor/AdviceMonitorPage",
      "deleteStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/advice-monitor/AdviceMonitorPage",
      "readStatus",
    ),
  };

  return (
    <AdviceMonitorListContext.Provider
      value={{
        data,
        menuPrivAccess,
      }}
    >
      <div className="flex flex-1 h-[calc(100vh-4rem)] mt-3 mx-3 gap-2">
        <AdviceMonitorTable />
      </div>
    </AdviceMonitorListContext.Provider>
  );
};

export { AdviceMonitorContextListProvider, AdviceMonitorListContext };
