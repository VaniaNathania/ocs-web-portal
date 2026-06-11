import { lazy } from "react";
import { Navbar, useLogManagementLayout } from "..";

const LogManagementMain = lazy(
  () => import("@/pages/main-menu/log-management/LoginLog/LogManagementMain"),
);

const SystemLog = lazy(
  () => import("@/pages/main-menu/log-management/SystemLog/SystemLogMain"),
);

const AuditLog = lazy(
  () => import("@/pages/main-menu/log-management/AuditLog/AuditLogMain"),
);

const Main = () => {
  const { activeTab } = useLogManagementLayout();

  return (
    <main className="grow bg-gray-100" role="content">
      <Navbar />
      <div key={"login"} hidden={activeTab !== "login"} className="flex-1">
        <LogManagementMain />
      </div>
      <div key={"system"} hidden={activeTab !== "system"} className="flex-1">
        <SystemLog />
      </div>
      <div key={"audit"} hidden={activeTab !== "audit"} className="flex-1">
        <AuditLog />
      </div>
    </main>
  );
};

export { Main };
