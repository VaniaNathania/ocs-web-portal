import { lazy, Suspense } from "react";
import { Navbar, useRoleLayout } from "..";
import { SideBar } from "../sidebar/SideBar";
import { ScreenLoader } from "@/components";

const RolePortal = lazy(
  () => import("@/pages/main-menu/role-management/outlet/portal/portal"),
);
const RoleMenu = lazy(
  () => import("@/pages/main-menu/role-management/outlet/menu/menu"),
);
const RoleJob = lazy(
  () => import("@/pages/main-menu/role-management/outlet/job/job"),
);
const RoleComponent = lazy(
  () => import("@/pages/main-menu/role-management/outlet/component/component"),
);
const RoleUser = lazy(
  () => import("@/pages/main-menu/role-management/outlet/user/user"),
);
const RolePortlet = lazy(
  () => import("@/pages/main-menu/role-management/outlet/portlet/portlet"),
);

const MainMt = () => {
  const { activeTab } = useRoleLayout();

  return (
    <div className="flex grow flex-col h-fit bg-gray-50">
      <Navbar />
      {/* <main className="grow" role="content">
          <Outlet />
          </main> */}
      <main className="grow bg-gray-100" role="content">
        <div className="flex flex-col  px-5 mb-5 space-y-5 lg:space-x-5 lg:space-y-0 lg:flex-row">
          <div className="w-full lg:w-1/3 ">
            <SideBar />
          </div>
          <div className="lg:w-2/3">
            <Suspense fallback={<ScreenLoader />}>
              {activeTab === "portal" && <RolePortal />}
              {activeTab === "menu" && <RoleMenu />}
              {activeTab === "component" && <RoleComponent />}
              {activeTab === "portlet" && <RolePortlet />}
              {activeTab === "job" && <RoleJob />}
              {activeTab === "user" && <RoleUser />}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export { MainMt };
